const express = require('express');
const router = express.Router();
const {
  getPublishedPosts,
  getPostBySlug,
  getAllPostsAdmin,
  getPostByIdAdmin,
  createPost,
  updatePost,
  deletePost,
  toggleFeatured,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPublishedPosts);
router.get('/slug/:slug', getPostBySlug);

// CMS (protected) routes
router.get('/admin/all', protect, getAllPostsAdmin);
router.get('/admin/:id', protect, getPostByIdAdmin);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/featured', protect, toggleFeatured);

module.exports = router;
