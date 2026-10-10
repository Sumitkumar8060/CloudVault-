const express = require('express');
const { getShareInfo, viewSharedFile, downloadSharedFile } = require('../controllers/publicShareController');

const router = express.Router();

router.get('/:token', getShareInfo);
router.get('/:token/view', viewSharedFile);
router.get('/:token/download', downloadSharedFile);

module.exports = router;