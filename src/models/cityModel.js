const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  state_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('City', citySchema);
