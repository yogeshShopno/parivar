const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  member_id: {
    type: String,
    required: true,
    unique: true, // One business listing per member in this community structure
    index: true
  },
  business_category_id: {
    type: String,
    required: true,
    index: true
  },
  business_name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  number_2: {
    type: String,
    default: '',
    trim: true
  },
  country_id: {
    type: String,
    required: true
  },
  state_id: {
    type: String,
    required: true
  },
  city_id: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location_link: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String, // Path/URL to the primary business image/logo
    default: ''
  },
  about_us: {
    type: String,
    default: '',
    trim: true
  },
  facebook: {
    type: String,
    default: '',
    trim: true
  },
  instagram: {
    type: String,
    default: '',
    trim: true
  },
  pinterest: {
    type: String,
    default: '',
    trim: true
  },
  youtube: {
    type: String,
    default: '',
    trim: true
  },
  website: {
    type: String,
    default: '',
    trim: true
  },
  gallery_images: {
    type: [String], // Array to store paths/URLs of gallery_image_1 to gallery_image_5
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
