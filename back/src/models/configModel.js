const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  primaryColor: {
    type: String,
    default: "#E65100"
  },
  secondaryColor: {
    type: String,
    default: "#F4C95D"
  },
  backgroundColor: {
    type: String,
    default: "#FFF8F0"
  },
  textColor: {
    type: String,
    default: "#4E342E"
  },
  buttonColor: {
    type: String,
    default: "#E65100"
  },
  fontColor: {
    type: String,
    default: "#FFFFFF"
  },
  borderColor: {
    type: String,
    default: "#E8D9C8"
  },
  gradientStart: {
    type: String,
    default: "#E65100"
  },
  gradientEnd: {
    type: String,
    default: "#7B0D1C"
  },
  appImage: {
    type: String,
    default: ""
  },
  webImage: {
    type: String,
    default: ""
  },

}
, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Config', configSchema);