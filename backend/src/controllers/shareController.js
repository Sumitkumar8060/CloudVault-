const crypto = require('crypto');
const pool = require('../config/db');

const DEFAULT_EXPIRY_HOURS = 24;

function toShareApiShape(row) {
  return {
    token: row.token,
    shareUrl: `${process.env.FRONTEND_URL}/share/${row.token}`,
    expiresAt: row.expiresAt,
  };
}

// POST /api/files/:id/share — create (or reuse) an active share link
const createShare = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const expiresInHours = Number(req.body.expiresInHours) || DEFAULT_EXPIRY_HOURS;

    // Same ownership check used everywhere in fileController.js —
    // you can only share files you actually own.
    const [fileRows] = await pool.query(
      'SELECT id FROM File WHERE id = ? AND userId = ? AND isDeleted = 0 LIMIT 1',
      [id, userId]
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    // Reuse an existing valid share instead of piling up duplicate tokens
    // for the same file every time the modal is opened.
    const [existing] = await pool.query(
      'SELECT token, expiresAt FROM FileShare WHERE fileId = ? AND revoked = 0 AND expiresAt > NOW() LIMIT 1',
      [id]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        message: 'An active share link already exists for this file.',
        share: toShareApiShape(existing[0]),
      });
    }

    // 32 random bytes = 256 bits of entropy, hex-encoded — effectively
    // unguessable; this is the actual security of the whole feature.
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO FileShare (fileId, token, expiresAt) VALUES (?, ?, ?)',
      [id, token, expiresAt]
    );

    return res.status(201).json({
      message: 'Share link created.',
      share: toShareApiShape({ token, expiresAt }),
    });

  } catch (error) {
    console.error('Create share error:', error);
    return res.status(500).json({ message: 'Something went wrong while creating the share link.' });
  }
};

// GET /api/files/:id/share — fetch the currently active share link, if any
const getActiveShare = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [fileRows] = await pool.query(
      'SELECT id FROM File WHERE id = ? AND userId = ? AND isDeleted = 0 LIMIT 1',
      [id, userId]
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const [rows] = await pool.query(
      'SELECT token, expiresAt FROM FileShare WHERE fileId = ? AND revoked = 0 AND expiresAt > NOW() LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(200).json({ share: null });
    }

    return res.status(200).json({ share: toShareApiShape(rows[0]) });

  } catch (error) {
    console.error('Get active share error:', error);
    return res.status(500).json({ message: 'Something went wrong while fetching the share link.' });
  }
};

// DELETE /api/files/:id/share — revoke the active share link
const revokeShare = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [fileRows] = await pool.query(
      'SELECT id FROM File WHERE id = ? AND userId = ? LIMIT 1',
      [id, userId]
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    await pool.query('UPDATE FileShare SET revoked = 1 WHERE fileId = ? AND revoked = 0', [id]);

    return res.status(200).json({ message: 'Share link revoked.' });

  } catch (error) {
    console.error('Revoke share error:', error);
    return res.status(500).json({ message: 'Something went wrong while revoking the share link.' });
  }
};

module.exports = { createShare, getActiveShare, revokeShare };