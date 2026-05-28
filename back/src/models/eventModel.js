const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  event_date: {
    type: Date,
    default: Date.now
  },
  event_category_id: {
    type: String,
    default: ''
  },
  event_category_name: {
    type: String,
    default: ''
  },
  event_name: {
    type: String,
    default: ''
  },
  event_location: {
    type: String,
    default: ''
  },
  location_link: {
    type: String,
    default: ''
  },
  start_time: {
    type: Date
  },
  end_time: {
    type: Date
  },
  entry_type: {
    type: String,
    default: ''
  },

}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Event', eventSchema);
