const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    authors: [
      {
        type: String,
        trim: true,
      },
    ],
    journal: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    abstract: {
      type: String,
      default: '',
    },
    doi: {
      type: String,
      default: '',
    },
    externalUrl: {
      type: String,
      required: [true, 'External URL is required'],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

paperSchema.index({ year: -1 });

module.exports = mongoose.model('Paper', paperSchema);
