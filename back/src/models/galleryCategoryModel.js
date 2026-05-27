const mongoose = require('mongoose');

const galleryCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true,
    trim: true,
    minlength: 1
  },

}, {
  timestamps: true,
  strict: false
});

galleryCategorySchema.index({ created_by_admin_id: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('GalleryCategory', galleryCategorySchema);
