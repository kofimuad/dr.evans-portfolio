const axios = require('axios');
const Tweet = require('../models/Tweet');

const extractTweetId = (url) => {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/(\d+)/);
  return match ? match[1] : null;
};

const fetchOEmbed = async (tweetUrl) => {
  const res = await axios.get('https://publish.twitter.com/oembed', {
    params: { url: tweetUrl, omit_script: true, dnt: true },
    timeout: 8000,
  });
  return res.data;
};

// GET /api/tweets - public
const getTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ pinned: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, tweets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tweets - protected
const addTweet = async (req, res) => {
  try {
    const { tweetUrl } = req.body;
    if (!tweetUrl) return res.status(400).json({ success: false, message: 'Tweet URL is required' });

    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) return res.status(400).json({ success: false, message: 'Invalid tweet URL' });

    const existing = await Tweet.findOne({ tweetId });
    if (existing) return res.status(400).json({ success: false, message: 'This tweet is already added' });

    let oEmbed = { html: '', authorName: '', authorUrl: '', cachedAt: null };
    try {
      const data = await fetchOEmbed(tweetUrl);
      oEmbed = { html: data.html, authorName: data.author_name, authorUrl: data.author_url, cachedAt: new Date() };
    } catch (e) {
      console.warn('oEmbed fetch failed:', e.message);
    }

    const tweet = await Tweet.create({ tweetUrl, tweetId, oEmbed });
    res.status(201).json({ success: true, tweet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/tweets/:id - protected
const deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndDelete(req.params.id);
    if (!tweet) return res.status(404).json({ success: false, message: 'Tweet not found' });
    res.status(200).json({ success: true, message: 'Tweet removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/tweets/:id/pin - protected
const togglePin = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ success: false, message: 'Tweet not found' });
    tweet.pinned = !tweet.pinned;
    await tweet.save();
    res.status(200).json({ success: true, pinned: tweet.pinned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTweets, addTweet, deleteTweet, togglePin };
