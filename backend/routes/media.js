const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/upload', protect, upload.single('image'), uploadImage);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
