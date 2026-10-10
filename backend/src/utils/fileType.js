const path = require('path');

const EXTENSION_TYPE_MAP = {
  '.pdf': 'pdf',
  '.doc': 'doc',
  '.docx': 'doc',
  '.txt': 'doc',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.xls': 'sheet',
  '.xlsx': 'sheet',
  '.csv': 'sheet',
  '.zip': 'archive',
  '.rar': 'archive',
  '.7z': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
};

function classifyFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TYPE_MAP[ext] || 'other';
}

module.exports = { classifyFileType };