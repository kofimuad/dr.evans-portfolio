const express = require('express');
const router = express.Router();
const { getPapers, getPaper, createPaper, updatePaper, deletePaper } = require('../controllers/paperController');
const { protect } = require('../middleware/auth');

router.get('/', getPapers);
router.get('/:id', getPaper);
router.post('/', protect, createPaper);
router.put('/:id', protect, updatePaper);
router.delete('/:id', protect, deletePaper);

module.exports = router;
