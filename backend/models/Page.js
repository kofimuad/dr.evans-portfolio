const mongoose = require('mongoose');

// This model stores editable content for static pages
// like About, Home hero text, etc.
const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['about', 'home'],
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // flexible JSON for different page structures
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
