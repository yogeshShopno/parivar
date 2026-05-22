const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
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
    default: ''
  },
  event_category: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Gallery', gallerySchema);
