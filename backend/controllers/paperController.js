const Paper = require('../models/Paper');

// @desc    Get all papers (public)
// @route   GET /api/papers
const getPapers = async (req, res) => {
  try {
    const { featured, tag } = req.query;
    const query = {};
    if (featured === 'true') query.featured = true;
    if (tag) query.tags = tag;

    const papers = await Paper.find(query).sort({ year: -1, order: 1 });
    res.status(200).json({ success: true, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single paper (public)
// @route   GET /api/papers/:id
const getPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
    res.status(200).json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create paper
// @route   POST /api/papers
const createPaper = async (req, res) => {
  try {
    const paper = await Paper.create(req.body);
    res.status(201).json({ success: true, paper });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update paper
// @route   PUT /api/papers/:id
const updatePaper = async (req, res) => {
  try {
    const paper = await Paper.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
    res.status(200).json({ success: true, paper });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete paper
// @route   DELETE /api/papers/:id
const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
    await paper.deleteOne();
    res.status(200).json({ success: true, message: 'Paper deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPapers, getPaper, createPaper, updatePaper, deletePaper };
