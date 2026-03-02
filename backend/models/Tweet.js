const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema(
  {
    tweetUrl: {
      type: String,
      required: [true, 'Tweet URL is required'],
      trim: true,
    },
    tweetId: {
      type: String,
      required: true,
      unique: true,
    },
    // Cached oEmbed data so we don't hit Twitter on every page load
    oEmbed: {
      html: { type: String, default: '' },
      authorName: { type: String, default: '' },
      authorUrl: { type: String, default: '' },
      cachedAt: { type: Date, default: null },
    },
    order: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tweet', tweetSchema);
