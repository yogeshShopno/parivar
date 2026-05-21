const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  country_id: {
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

module.exports = mongoose.model('State', stateSchema);
