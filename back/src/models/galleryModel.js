const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({

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
  type: mongoose.Schema.Types.ObjectId,
  ref: 'GalleryCategory',
  default: null
},

}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Gallery', gallerySchema);
