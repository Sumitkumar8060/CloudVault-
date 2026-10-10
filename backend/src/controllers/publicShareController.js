const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Looks up a share by token and validates it in one place, so every public
// endpoint below agrees on what counts as "valid." Treating expired/revoked/
// deleted-file cases identically (returning null) means we don't leak *which*
// reason a link stopped working — just that it doesn't work anymore.
async function findValidShare(token) {
  const [rows] = await pool.query(
    `SELECT f.id AS fileId, f.name, f.type, f.mimeType, f.sizeBytes, f.storagePath, f.isDeleted,
            s.expiresAt, s.revoked
     FROM FileShare s
     JOIN File f ON f.id = s.fileId
     WHERE s.token = ? LIMIT 1`,
    [token]
  );

  const row = rows[0];
  if (!row) return null;
  if (row.revoked) return null;
  if (new Date(row.expiresAt) <= new Date()) return null;
  if (row.isDeleted) return null;

  return row;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// GET /api/public/share/:token — metadata only, for the public landing page
const getShareInfo = async (req, res) => {
  try {
    const share = await findValidShare(req.params.token);

    if (!share) {
      return res.status(404).json({ message: 'This share link is invalid or has expired.' });
    }

    return res.status(200).json({
      file: {
        name: share.name,
        type: share.type,
        mimeType: share.mimeType,
        size: formatFileSize(share.sizeBytes),
      },
    });

  } catch (error) {
    console.error('Get share info error:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// GET /api/public/share/:token/view — inline preview, no login required
const viewSharedFile = async (req, res) => {
  try {
    const share = await findValidShare(req.params.token);

    if (!share) {
      return res.status(404).json({ message: 'This share link is invalid or has expired.' });
    }

    const fullPath = path.join(UPLOAD_DIR, share.storagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File content is missing on the server.' });
    }

    res.setHeader('Content-Type', share.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${share.name}"`);
    return res.sendFile(fullPath);

  } catch (error) {
    console.error('View shared file error:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

// GET /api/public/share/:token/download — forces download, no login required
const downloadSharedFile = async (req, res) => {
  try {
    const share = await findValidShare(req.params.token);

    if (!share) {
      return res.status(404).json({ message: 'This share link is invalid or has expired.' });
    }

    const fullPath = path.join(UPLOAD_DIR, share.storagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File content is missing on the server.' });
    }

    return res.download(fullPath, share.name);

  } catch (error) {
    console.error('Download shared file error:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = { getShareInfo, viewSharedFile, downloadSharedFile };