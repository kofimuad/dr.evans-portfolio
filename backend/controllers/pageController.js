const Page = require('../models/Page');

// @desc    Get a page by slug (public)
// @route   GET /api/pages/:slug
const getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.status(200).json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a page (CMS only)
// @route   PUT /api/pages/:slug
const updatePage = async (req, res) => {
  try {
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      { content: req.body.content, title: req.body.title },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, page });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getPage, updatePage };
