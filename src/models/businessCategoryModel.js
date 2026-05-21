const mongoose = require('mongoose');

const businessCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  state_id: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BusinessCategory', businessCategorySchema);
