const Config = require('../models/configModel');
const { ownerFields, ownerQuery } = require('../utils/ownership');

// Get configuration, create default if none exists
const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne(ownerQuery(req));
    if (!config) {
      config = await Config.create(ownerFields(req));
    }
    res.status(200).json({
      message: 'Configuration retrieved successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving configuration', error: error.message });
  }
};

// Update configuration (or create new if none exists)
const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne(ownerQuery(req));
    if (!config) {
      config = new Config({ ...req.body, ...ownerFields(req) });
    } else {
      config.set({ ...req.body, ...ownerFields(req) });
    }
    await config.save();
    res.status(200).json({
      message: 'Configuration updated successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating configuration', error: error.message });
  }
};

module.exports = {
  getConfig,
  updateConfig
};
