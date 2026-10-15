const multer = require('multer');
const path = require('path');

// const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Minimal denylist — blocks obviously executable file types.
// This is a basic safety net, not comprehensive malware protection.
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.com', '.scr', '.js', '.vbs', '.ps1'];

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique name on disk so two uploads with the same
//     // original filename never overwrite each other. The real filename
//     // the user sees is stored separately in the database (File.name).
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     const ext = path.extname(file.originalname);
//     cb(null, `${uniqueSuffix}${ext}`);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error('FILE_TYPE_NOT_ALLOWED'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

module.exports = upload;