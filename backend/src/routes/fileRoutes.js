const express = require('express');
const upload = require('../middleware/upload');
const {
  listFiles,
  getFile,
  uploadFile,
  viewFile,
  downloadFile,
  deleteFile,
  listTrash,
  restoreFile,
  permanentlyDeleteFile,
  emptyTrash,
} = require('../controllers/fileController');
const { createShare, getActiveShare, revokeShare } = require('../controllers/shareController');

const router = express.Router();

router.get('/trash', listTrash);
router.delete('/trash', emptyTrash);

router.get('/', listFiles);
router.get('/:id/view', viewFile);
router.get('/:id/download', downloadFile);
router.get('/:id/share', getActiveShare);
router.get('/:id', getFile);

router.post('/:id/share', createShare);
router.post('/:id/restore', restoreFile);
router.post('/', upload.single('file'), uploadFile);

router.delete('/:id/share', revokeShare);
router.delete('/:id/permanent', permanentlyDeleteFile);
router.delete('/:id', deleteFile);

module.exports = router;