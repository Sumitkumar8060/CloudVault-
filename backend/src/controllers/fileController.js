
const crypto = require('crypto');
const imagekit = require('../config/imagekit');
const pool = require('../config/db');
const { classifyFileType } = require('../utils/fileType');

const IMAGEKIT_FOLDER = '/docualert';
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SHARE_DURATION_DAYS = 7;

// ---------- Helpers ----------

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    mimeType: row.mimeType,
    sizeBytes: Number(row.sizeBytes),
    size: formatFileSize(row.sizeBytes),
    createdAt: row.createdAt,
  };
}

function toTrashApiShape(row) {
  return {
    ...toApiShape(row),
    deletedAt: row.deletedAt,
  };
}

function getUserId(req) {
  return req.user?.userId;
}

function getFileName(name) {
  return String(name || '')
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .trim();
}

// Download private ImageKit content through a temporary signed URL.
async function getStoredFileBuffer(file) {
  if (!file.storagePath || !file.storageFileId) {
    throw new Error('ImageKit file information is missing.');
  }

  const signedUrl = imagekit.url({
    path: file.storagePath,
    signed: true,
    expireSeconds: 60,
  });

  const response = await fetch(signedUrl);

  if (!response.ok) {
    throw new Error(
      `ImageKit retrieval failed with HTTP ${response.status}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

// Delete content from ImageKit only. There is no local-storage fallback.
async function deleteStoredFile(file) {
  if (!file.storageFileId) {
    throw new Error(
      `ImageKit file ID is missing for database file ${file.id}.`
    );
  }

  await imagekit.deleteFile(file.storageFileId);
}

// ---------- Upload ----------

const uploadFile = async (req, res) => {
  let uploadedFile = null;

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'No file was uploaded.',
      });
    }

    // Multer must use memoryStorage().
    if (!req.file.buffer) {
      return res.status(400).json({
        message: 'Upload middleware must use multer.memoryStorage().',
      });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        message: 'File size cannot exceed 20 MB.',
      });
    }

    const originalName = getFileName(req.file.originalname);

    if (!originalName || originalName === '.' || originalName === '..') {
      return res.status(400).json({
        message: 'Invalid file name.',
      });
    }

    const type = classifyFileType(originalName);

    // Upload the actual file bytes to ImageKit.
    uploadedFile = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${originalName}`,
      folder: IMAGEKIT_FOLDER,
      useUniqueFileName: true,
      isPrivateFile: true,
    });

    if (!uploadedFile.fileId || !uploadedFile.filePath) {
      throw new Error('ImageKit did not return a file ID and path.');
    }

    // Store only metadata and ImageKit identifiers in MySQL.
    const [result] = await pool.query(
      `INSERT INTO File
        (userId, name, type, mimeType, sizeBytes,
         storagePath, storageFileId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        originalName,
        type,
        req.file.mimetype,
        req.file.size,
        uploadedFile.filePath,
        uploadedFile.fileId,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, type, mimeType, sizeBytes, createdAt
       FROM File
       WHERE id = ? AND userId = ?
       LIMIT 1`,
      [result.insertId, userId]
    );

    if (!rows.length) {
      throw new Error('Unable to retrieve saved file metadata.');
    }

    return res.status(201).json({
      message: 'File uploaded successfully.',
      file: toApiShape(rows[0]),
    });
  } catch (error) {
    console.error('Upload file error:', error);

    // Clean up the ImageKit file if saving metadata fails.
    if (uploadedFile?.fileId) {
      try {
        await imagekit.deleteFile(uploadedFile.fileId);
      } catch (cleanupError) {
        console.error('ImageKit cleanup error:', cleanupError.message);
      }
    }

    return res.status(500).json({
      message: 'Something went wrong while uploading the file.',
    });
  }
};

// ---------- List and file details ----------

const listFiles = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, name, type, mimeType, sizeBytes, createdAt
       FROM File
       WHERE userId = ? AND isDeleted = 0
       ORDER BY createdAt DESC`,
      [userId]
    );

    return res.json({
      files: rows.map(toApiShape),
    });
  } catch (error) {
    console.error('List files error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve files.',
    });
  }
};

const getFile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, name, type, mimeType, sizeBytes, createdAt
       FROM File
       WHERE id = ? AND userId = ? AND isDeleted = 0
       LIMIT 1`,
      [req.params.id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'File not found.',
      });
    }

    return res.json({
      file: toApiShape(rows[0]),
    });
  } catch (error) {
    console.error('Get file error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve file.',
    });
  }
};

// ---------- View and download ----------

async function sendStoredFile(req, res, disposition) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  const [rows] = await pool.query(
    `SELECT id, name, mimeType, storagePath, storageFileId
     FROM File
     WHERE id = ? AND userId = ? AND isDeleted = 0
     LIMIT 1`,
    [req.params.id, userId]
  );

  if (!rows.length) {
    return res.status(404).json({
      message: 'File not found.',
    });
  }

  const file = rows[0];
  const buffer = await getStoredFileBuffer(file);

  res.setHeader(
    'Content-Type',
    file.mimeType || 'application/octet-stream'
  );
  res.setHeader('Content-Length', buffer.length);
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name)}`
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  return res.send(buffer);
}

const viewFile = async (req, res) => {
  try {
    return await sendStoredFile(req, res, 'inline');
  } catch (error) {
    console.error('View file error:', error);

    return res.status(500).json({
      message: 'Unable to view file.',
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    return await sendStoredFile(req, res, 'attachment');
  } catch (error) {
    console.error('Download file error:', error);

    return res.status(500).json({
      message: 'Unable to download file.',
    });
  }
};

// ---------- Trash and restore ----------

const deleteFile = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE File
       SET isDeleted = 1, deletedAt = NOW()
       WHERE id = ? AND userId = ? AND isDeleted = 0`,
      [req.params.id, userId]
    );

    if (!result.affectedRows) {
      await connection.rollback();

      return res.status(404).json({
        message: 'File not found.',
      });
    }

    // Revoke active shares when a file is moved to trash.
    await connection.query(
      `UPDATE FileShare
       SET revoked = 1
       WHERE fileId = ? AND revoked = 0`,
      [req.params.id]
    );

    await connection.commit();

    return res.json({
      message: 'File moved to trash.',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete file error:', error);

    return res.status(500).json({
      message: 'Unable to move file to trash.',
    });
  } finally {
    connection.release();
  }
};

const listTrash = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, name, type, mimeType, sizeBytes, createdAt, deletedAt
       FROM File
       WHERE userId = ? AND isDeleted = 1
       ORDER BY deletedAt DESC`,
      [userId]
    );

    return res.json({
      files: rows.map(toTrashApiShape),
    });
  } catch (error) {
    console.error('List trash error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve trash.',
    });
  }
};

const restoreFile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [result] = await pool.query(
      `UPDATE File
       SET isDeleted = 0, deletedAt = NULL
       WHERE id = ? AND userId = ? AND isDeleted = 1`,
      [req.params.id, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: 'Trashed file not found.',
      });
    }

    return res.json({
      message: 'File restored successfully.',
    });
  } catch (error) {
    console.error('Restore file error:', error);

    return res.status(500).json({
      message: 'Unable to restore file.',
    });
  }
};

// ---------- Permanent deletion ----------

const permanentlyDeleteFile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, storagePath, storageFileId
       FROM File
       WHERE id = ? AND userId = ? AND isDeleted = 1
       LIMIT 1`,
      [req.params.id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Trashed file not found.',
      });
    }

    const file = rows[0];

    // Delete the content first. Keep the DB record if this fails.
    await deleteStoredFile(file);

    await pool.query(
      'DELETE FROM FileShare WHERE fileId = ?',
      [file.id]
    );

    await pool.query(
      `DELETE FROM File
       WHERE id = ? AND userId = ? AND isDeleted = 1`,
      [file.id, userId]
    );

    return res.json({
      message: 'File permanently deleted.',
    });
  } catch (error) {
    console.error('Permanent delete error:', error);

    return res.status(500).json({
      message: 'Unable to permanently delete file.',
    });
  }
};

const emptyTrash = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [files] = await pool.query(
      `SELECT id, storagePath, storageFileId
       FROM File
       WHERE userId = ? AND isDeleted = 1`,
      [userId]
    );

    const deletedIds = [];
    const failedIds = [];

    for (const file of files) {
      try {
        await deleteStoredFile(file);
        deletedIds.push(file.id);
      } catch (error) {
        console.error(
          `ImageKit deletion failed for file ${file.id}:`,
          error.message
        );

        failedIds.push(file.id);
      }
    }

    if (deletedIds.length) {
      const placeholders = deletedIds.map(() => '?').join(',');

      await pool.query(
        `DELETE FROM FileShare
         WHERE fileId IN (${placeholders})`,
        deletedIds
      );

      await pool.query(
        `DELETE FROM File
         WHERE userId = ? AND isDeleted = 1
         AND id IN (${placeholders})`,
        [userId, ...deletedIds]
      );
    }

    return res.status(failedIds.length ? 207 : 200).json({
      message: failedIds.length
        ? 'Some files could not be permanently deleted.'
        : 'Trash emptied successfully.',
      deletedCount: deletedIds.length,
      failedIds,
    });
  } catch (error) {
    console.error('Empty trash error:', error);

    return res.status(500).json({
      message: 'Unable to empty trash.',
    });
  }
};

// ---------- Share management ----------

// Return the current active share for a file owned by this user.
const getActiveShare = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.fileId, s.token, s.expiresAt, s.createdAt
       FROM FileShare s
       INNER JOIN File f ON f.id = s.fileId
       WHERE s.fileId = ?
         AND f.userId = ?
         AND f.isDeleted = 0
         AND s.revoked = 0
         AND (s.expiresAt IS NULL OR s.expiresAt > NOW())
       ORDER BY s.createdAt DESC
       LIMIT 1`,
      [req.params.id, userId]
    );

    if (!rows.length) {
      return res.json({ share: null });
    }

    return res.json({
      share: rows[0],
    });
  } catch (error) {
    console.error('Get active share error:', error);

    return res.status(500).json({
      message: 'Unable to retrieve share details.',
    });
  }
};

// Create a time-limited share token.
const createShare = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [files] = await pool.query(
      `SELECT id
       FROM File
       WHERE id = ? AND userId = ? AND isDeleted = 0
       LIMIT 1`,
      [req.params.id, userId]
    );

    if (!files.length) {
      return res.status(404).json({
        message: 'File not found.',
      });
    }

    // Revoke prior active shares before creating a new token.
    await pool.query(
      `UPDATE FileShare
       SET revoked = 1
       WHERE fileId = ? AND revoked = 0`,
      [req.params.id]
    );

    const token = crypto.randomBytes(32).toString('hex');

    const [result] = await pool.query(
      `INSERT INTO FileShare (fileId, token, expiresAt, revoked)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 0)`,
      [req.params.id, token, SHARE_DURATION_DAYS]
    );

    const [shares] = await pool.query(
      `SELECT id, fileId, token, expiresAt, createdAt
       FROM FileShare
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Share created successfully.',
      share: shares[0],
    });
  } catch (error) {
    console.error('Create share error:', error);

    return res.status(500).json({
      message: 'Unable to create share.',
    });
  }
};

const revokeShare = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const [result] = await pool.query(
      `UPDATE FileShare s
       INNER JOIN File f ON f.id = s.fileId
       SET s.revoked = 1
       WHERE s.fileId = ? AND f.userId = ? AND s.revoked = 0`,
      [req.params.id, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: 'Active share not found.',
      });
    }

    return res.json({
      message: 'Share revoked successfully.',
    });
  } catch (error) {
    console.error('Revoke share error:', error);

    return res.status(500).json({
      message: 'Unable to revoke share.',
    });
  }
};

module.exports = {
  uploadFile,
  listFiles,
  getFile,
  viewFile,
  downloadFile,
  deleteFile,
  listTrash,
  restoreFile,
  permanentlyDeleteFile,
  emptyTrash,
  getActiveShare,
  createShare,
  revokeShare,
};