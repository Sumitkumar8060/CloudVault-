const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { classifyFileType } = require('../utils/fileType');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    mimeType: row.mimeType || null,
    size: formatFileSize(row.sizeBytes),
    uploadedAt: row.createdAt,
  };
}

function toTrashApiShape(row) {
  return {
    ...toApiShape(row),
    deletedAt: row.deletedAt,
  };
}

// GET /api/files
const listFiles = async (req, res) => {
  try {
    const { userId } = req.user;

    const [rows] = await pool.query(
      'SELECT id, name, type, mimeType, sizeBytes, createdAt FROM File WHERE userId = ? AND isDeleted = 0 ORDER BY createdAt DESC',
      [userId]
    );

    return res.status(200).json({ files: rows.map(toApiShape) });

  } catch (error) {
    console.error('List files error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching your files.' });
  }
};

// GET /api/files/:id
const getFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, name, type, mimeType, sizeBytes, createdAt FROM File WHERE id = ? AND userId = ? AND isDeleted = 0 LIMIT 1',
      [id, userId]
    );

    const file = rows[0];
    if (!file) {
      return res.status(404).json({ message: 'File not found.' });
    }

    return res.status(200).json({ file: toApiShape(file) });

  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching the file.' });
  }
};

// POST /api/files
const uploadFile = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const type = classifyFileType(req.file.originalname);

    const [result] = await pool.query(
      'INSERT INTO File (userId, name, type, mimeType, sizeBytes, storagePath) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, req.file.originalname, type, req.file.mimetype, req.file.size, req.file.filename]
    );

    const [rows] = await pool.query(
      'SELECT id, name, type, mimeType, sizeBytes, createdAt FROM File WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return res.status(201).json({
      message: 'File uploaded successfully.',
      file: toApiShape(rows[0]),
    });

  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({ message: 'Something went wrong while uploading the file.' });
  }
};

// GET /api/files/:id/view
const viewFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT name, mimeType, storagePath FROM File WHERE id = ? AND userId = ? AND isDeleted = 0 LIMIT 1',
      [id, userId]
    );

    const file = rows[0];
    if (!file || !file.storagePath) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const fullPath = path.join(UPLOAD_DIR, file.storagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File content is missing on the server.' });
    }

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    return res.sendFile(fullPath);

  } catch (error) {
    console.error('View file error:', error);
    return res.status(500).json({ message: 'Something went wrong while loading the file preview.' });
  }
};

// GET /api/files/:id/download
const downloadFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT name, storagePath FROM File WHERE id = ? AND userId = ? AND isDeleted = 0 LIMIT 1',
      [id, userId]
    );

    const file = rows[0];
    if (!file || !file.storagePath) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const fullPath = path.join(UPLOAD_DIR, file.storagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File content is missing on the server.' });
    }

    return res.download(fullPath, file.name);

  } catch (error) {
    console.error('Download file error:', error);
    return res.status(500).json({ message: 'Something went wrong while downloading the file.' });
  }
};

// DELETE /api/files/:id — now a SOFT delete (moves to Trash).
// The file stays on disk and in the database; only isDeleted/deletedAt change.
// Any active share link for this file stops working immediately, since
// publicShareController's findValidShare() already checks row.isDeleted.
const deleteFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE File SET isDeleted = 1, deletedAt = NOW() WHERE id = ? AND userId = ? AND isDeleted = 0',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    return res.status(200).json({ message: 'File moved to Trash.' });

  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ message: 'Something went wrong while deleting the file.' });
  }
};

// GET /api/files/trash — list this user's trashed files
const listTrash = async (req, res) => {
  try {
    const { userId } = req.user;

    const [rows] = await pool.query(
      'SELECT id, name, type, mimeType, sizeBytes, createdAt, deletedAt FROM File WHERE userId = ? AND isDeleted = 1 ORDER BY deletedAt DESC',
      [userId]
    );

    return res.status(200).json({ files: rows.map(toTrashApiShape) });

  } catch (error) {
    console.error('List trash error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching your trash.' });
  }
};

// POST /api/files/:id/restore — move a file back out of Trash
const restoreFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE File SET isDeleted = 0, deletedAt = NULL WHERE id = ? AND userId = ? AND isDeleted = 1',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'File not found in Trash.' });
    }

    return res.status(200).json({ message: 'File restored.' });

  } catch (error) {
    console.error('Restore file error:', error);
    return res.status(500).json({ message: 'Something went wrong while restoring the file.' });
  }
};

// DELETE /api/files/:id/permanent — actually removes the row and the disk file.
// Only works on files already in Trash — this is the real "point of no return."
const permanentlyDeleteFile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT storagePath FROM File WHERE id = ? AND userId = ? AND isDeleted = 1 LIMIT 1',
      [id, userId]
    );

    const file = rows[0];
    if (!file) {
      return res.status(404).json({ message: 'File not found in Trash.' });
    }

    await pool.query('DELETE FROM File WHERE id = ? AND userId = ?', [id, userId]);

    if (file.storagePath) {
      const fullPath = path.join(UPLOAD_DIR, file.storagePath);
      fs.unlink(fullPath, (err) => {
        if (err) console.error('Could not remove file from disk:', err.message);
      });
    }

    return res.status(200).json({ message: 'File permanently deleted.' });

  } catch (error) {
    console.error('Permanent delete error:', error);
    return res.status(500).json({ message: 'Something went wrong while permanently deleting the file.' });
  }
};

// DELETE /api/files/trash — empty the whole trash at once
const emptyTrash = async (req, res) => {
  try {
    const { userId } = req.user;

    const [rows] = await pool.query(
      'SELECT id, storagePath FROM File WHERE userId = ? AND isDeleted = 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({ message: 'Trash is already empty.' });
    }

    await pool.query('DELETE FROM File WHERE userId = ? AND isDeleted = 1', [userId]);

    rows.forEach((file) => {
      if (file.storagePath) {
        const fullPath = path.join(UPLOAD_DIR, file.storagePath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Could not remove file from disk:', err.message);
        });
      }
    });

    return res.status(200).json({ message: `Permanently deleted ${rows.length} file(s).` });

  } catch (error) {
    console.error('Empty trash error:', error);
    return res.status(500).json({ message: 'Something went wrong while emptying the trash.' });
  }
};

module.exports = {
  listFiles, getFile, uploadFile, viewFile, downloadFile,
  deleteFile, listTrash, restoreFile, permanentlyDeleteFile, emptyTrash,
};