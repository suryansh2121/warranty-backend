const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb('Error: Only PDFs and images are allowed!');
  },
});

module.exports = { upload };