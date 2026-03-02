const express = require('express');
const router = express.Router();
const { getTweets, addTweet, deleteTweet, togglePin } = require('../controllers/tweetController');
const { protect } = require('../middleware/auth');

router.get('/', getTweets);
router.post('/', protect, addTweet);
router.delete('/:id', protect, deleteTweet);
router.patch('/:id/pin', protect, togglePin);

module.exports = router;
