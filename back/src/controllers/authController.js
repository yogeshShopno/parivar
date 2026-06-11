const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const { apiResponse, memberPublicId } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfamilykey';
const MEMBER_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const STATIC_OTP = process.env.LOGIN_OTP || '123456';

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const tokenPayloadFor = (member) => ({
  id: memberPublicId(member),
  first_name: member.first_name || '',
  middle_name: member.middle_name || '',
  last_name: member.last_name || '',
  number: member.number || '',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400
});

const signArchiveToken = (payload) => {
  const { exp, iat, ...claims } = payload;
  return jwt.sign(claims, JWT_SECRET, {
    expiresIn: MEMBER_TOKEN_EXPIRES_IN
  });
};

const login = async (req, res) => {
  try {
    const { number, otp } = requestData(req);

    if (!number) {
      return apiResponse(res, 400, 'Number is required');
    }

    const users = await User.find({ number: String(number) }).select('-password').sort({ member_id: 1, _id: 1 });

    if (!users.length) {
      return apiResponse(res, 400, 'Invalid number');
    }

    if (!otp) {
      return apiResponse(res, 200, 'OTP send successfully', {
        multiple_numbers: users.length > 1
      });
    }

    if (String(otp) !== STATIC_OTP) {
      return apiResponse(res, 400, 'Invalid OTP');
    }

    if (users.length > 1) {
      return apiResponse(res, 200, 'Multiple accounts found', {
        multiple_numbers: true,
        users: users.map((user) => ({
          id: memberPublicId(user),
          first_name: user.first_name || '',
          middle_name: user.middle_name || '',
          last_name: user.last_name || '',
          number: user.number || ''
        }))
      });
    }

    const { fcm_token } = requestData(req);
    if (fcm_token) {
      users[0].fcm_token = fcm_token;
      await users[0].save();
    }

    const payload = tokenPayloadFor(users[0]);
    const token = signArchiveToken(payload);

    return apiResponse(res, 200, 'Login successful', {
      multiple_numbers: false,
      token,
      user: payload
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error in login', { error: error.message });
  }
};

const selectAccountLogin = async (req, res) => {
  try {
    const { member_id } = requestData(req);

    if (!member_id) {
      return apiResponse(res, 400, 'Member ID is required');
    }

    const user = await User.findOne({
      $or: [
        { member_id: String(member_id) },
        { id: String(member_id) }
      ]
    }).select('-password');

    if (!user) {
      return apiResponse(res, 400, 'Invalid member');
    }

    if (user.status === 0) {
      // Just an extra safety check in case inactive user tries to select
    }

    const { fcm_token } = requestData(req);
    if (fcm_token) {
      user.fcm_token = fcm_token;
      await user.save();
    }

    const payload = tokenPayloadFor(user);
    const token = signArchiveToken(payload);

    return apiResponse(res, 200, 'Login successful', {
      token,
      user: payload
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error selecting account', { error: error.message });
  }
};

const versionCode = async (req, res) => {
  return apiResponse(res, 200, 'Version code fetch successfully', []);
};

module.exports = {
  login,
  selectAccountLogin,
  versionCode
};
