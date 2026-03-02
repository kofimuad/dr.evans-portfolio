const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all published posts (public)
// @route   GET /api/posts
const getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, featured } = req.query;

    const query = { status: 'published' };
    if (tag) query.tags = tag;
    if (featured === 'true') query.featured = true;

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content'); // exclude full content from list view

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single published post by slug (public)
// @route   GET /api/posts/:slug
const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' }).populate(
      'author',
      'name avatar bio'
    );

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ALL posts including drafts (CMS only)
// @route   GET /api/posts/admin/all
const getAllPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post by ID (CMS only)
// @route   GET /api/posts/admin/:id
const getPostByIdAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Delete cover image from cloudinary if exists
    if (post.coverImage?.publicId) {
      await cloudinary.uploader.destroy(post.coverImage.publicId);
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/posts/:id/featured
const toggleFeatured = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.featured = !post.featured;
    await post.save();

    res.status(200).json({ success: true, featured: post.featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublishedPosts,
  getPostBySlug,
  getAllPostsAdmin,
  getPostByIdAdmin,
  createPost,
  updatePost,
  deletePost,
  toggleFeatured,
};
