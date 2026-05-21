const User = require('../models/userModels');
const jwt = require('jsonwebtoken');

// 1. POST /login - Enter phone number and OTP
const login = async (req, res) => {
  try {
    const { number, otp } = req.body;

    if (!number || !otp) {
      return res.status(400).json({ message: 'Number and OTP are required' });
    }

    // Standard simulated OTP check
    if (otp !== '123456') {
      return res.status(401).json({ message: 'Invalid OTP code' });
    }

    // Find all member accounts linked to this phone number
    const accounts = await User.find({ number });

    if (accounts.length === 0) {
      return res.status(404).json({
        message: 'No profiles found associated with this number. Please register.'
      });
    }

    // Generate a temporary administrative/selection token
    const token = jwt.sign(
      { number },
      process.env.JWT_SECRET || 'supersecretfamilykey',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      data: {
        token,
        accounts: accounts.map(acc => ({
          member_id: acc.member_id,
          first_name: acc.first_name,
          middle_name: acc.middle_name,
          last_name: acc.last_name,
          relation: acc.relation
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

// 2. POST /select_account_login - Choose specific member profile
const selectAccountLogin = async (req, res) => {
  try {
    const { member_id, number } = req.body;

    if (!member_id || !number) {
      return res.status(400).json({ message: 'Member ID and number are required' });
    }

    // Find specific profile matching member_id and primary number
    const member = await User.findOne({ member_id, number });

    if (!member) {
      return res.status(404).json({ message: 'Profile not found or number mismatch' });
    }

    // Generate the final authorization token (toakn) for this specific member
    const token = jwt.sign(
      { id: member._id, member_id: member.member_id },
      process.env.JWT_SECRET || 'supersecretfamilykey',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Profile selected successfully',
      data: {
        token,
        member: {
          member_id: member.member_id,
          first_name: member.first_name,
          middle_name: member.middle_name,
          last_name: member.last_name,
          email: member.email,
          number: member.number,
          relation: member.relation,
          is_committee: member.is_committee,
          committee_role: member.committee_role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error selecting account', error: error.message });
  }
};

// 3. POST /version_code - Check app version
const versionCode = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Version code retrieved successfully',
      data: {
        version_name: '1.0.0',
        version_code: 10,
        force_update: false,
        update_url: 'https://play.google.com/store'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving version', error: error.message });
  }
};

module.exports = {
  login,
  selectAccountLogin,
  versionCode
};
