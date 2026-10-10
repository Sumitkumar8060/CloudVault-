const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message);

  // multer's own errors (e.g. file too large) have err.name === 'MulterError'
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 20 MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  // Our own fileFilter rejection from upload.js
  if (err.message === 'FILE_TYPE_NOT_ALLOWED') {
    return res.status(400).json({ message: 'This file type is not allowed for security reasons.' });
  }

  return res.status(500).json({ message: 'Something went wrong on the server.' });
};

module.exports = errorHandler;