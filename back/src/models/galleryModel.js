const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  images: {
    type: [String],  // This allows multiple image URLs
    required: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  year: {
    type: String,
    default: ''
  },
  gallery_category_id: {
    type: String,
    default: '',
    trim: true
  },

}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Gallery', gallerySchema);
