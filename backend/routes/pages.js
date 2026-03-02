const express = require('express');
const router = express.Router();
const { getPage, updatePage } = require('../controllers/pageController');
const { protect } = require('../middleware/auth');

router.get('/:slug', getPage);
router.put('/:slug', protect, updatePage);

module.exports = router;
