const User = require('../models/userModels');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');

// 1. POST /members - List of all primary family heads
const getMembers = async (req, res) => {
  try {
    // Standard directories list members who are heads of their family (i.e. no parent)
    const members = await User.find({
      $or: [
        { parent_member_id: null },
        { parent_member_id: '' },
        { relation: 'Self' }
      ]
    });

    res.status(200).json({
      message: 'Members directory retrieved successfully',
      data: members
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving directory', error: error.message });
  }
};

// 2. POST /family_members - List of family members for a primary member
const getFamilyMembers = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      return res.status(400).json({ message: 'Member ID is required' });
    }

    // Retrieve all members whose parent_member_id is the selected head member
    const family = await User.find({ parent_member_id: member_id });

    res.status(200).json({
      message: 'Family tree retrieved successfully',
      data: family
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving family tree', error: error.message });
  }
};

// 3. POST /kamiti_members - List of committee board members
const getKamitiMembers = async (req, res) => {
  try {
    const committee = await User.find({ is_committee: true });

    res.status(200).json({
      message: 'Committee members retrieved successfully',
      data: committee
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving committee', error: error.message });
  }
};

// 4. POST /country_list - Geographic countries
const getCountryList = async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json({
      message: 'Countries retrieved successfully',
      data: countries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving countries', error: error.message });
  }
};

// 5. POST /state_list - Geographic states matching country_id
const getStateList = async (req, res) => {
  try {
    const { country_id } = req.body;

    if (!country_id) {
      return res.status(400).json({ message: 'Country ID is required' });
    }

    const states = await State.find({ country_id });
    res.status(200).json({
      message: 'States retrieved successfully',
      data: states
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving states', error: error.message });
  }
};

// 6. POST /city_list - Geographic cities matching state_id
const getCityList = async (req, res) => {
  try {
    const { state_id } = req.body;

    if (!state_id) {
      return res.status(400).json({ message: 'State ID is required' });
    }

    const cities = await City.find({ state_id });
    res.status(200).json({
      message: 'Cities retrieved successfully',
      data: cities
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cities', error: error.message });
  }
};

module.exports = {
  getMembers,
  getFamilyMembers,
  getKamitiMembers,
  getCountryList,
  getStateList,
  getCityList
};
