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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
