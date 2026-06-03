const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const queryHelper = require('../utils/queryHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfamilykey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '365d';

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const buildMemberId = async () => {
  const users = await User.find({ member_id: /^\d+$/ }).select('member_id');
  const highestId = users.reduce((max, user) => {
    const numericId = Number(user.member_id);

    return Number.isFinite(numericId) && numericId > max ? numericId : max;
  }, 0);
  const nextId = highestId > 0 ? highestId + 1 : Date.now();

  return String(nextId);
};

const sanitizeUser = (user) => {
  if (!user) return user;

  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;

  return data;
};

// Register a new user
const register = async (req, res) => {

  try {
    const {
      member_id, parent_member_id, first_name, middle_name, last_name, email, password,
      number, gender, dob, blood_group, relation, is_committee, committee_role,
      profile_image, country_id, state_id, city_id, address
    } = req.body;

    if (!first_name || !number) {
      return res.status(400).json({ message: 'First name and number are required' });
    }

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
    }

    const owner = req.user ? req.user : {};
    const newUser = new User({
      member_id: member_id || await buildMemberId(),
      parent_member_id,
      first_name,
      middle_name,
      last_name,
      email: email ? email.toLowerCase() : '',
      password: password || '12345',
      number,
      gender,
      dob,
      blood_group,
      relation,
      is_committee,
      committee_role,
      profile_image,
      country_id,
      state_id,
      city_id,
      address,
      created_by_admin_id: owner.created_by_admin_id || '',
      admin_id: owner.admin_id || '',
      tenant_id: owner.tenant_id || '',
      created_by_user_id: owner.created_by_user_id || '',
      created_by_member_id: owner.created_by_member_id || '',
      created_by_name: owner.created_by_name || '',
      created_by_role: owner.created_by_role || ''
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      data: sanitizeUser(newUser)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user and return JWT
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get authenticated user profile
const getProfile = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: sanitizeUser(req.user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {

    const { member_id, id, parent_member_id, is_committee, search, country_id, state_id, city_id, } = requestData(req);
    const birthday = 'birthday' in (req.query || {});

    if (id || member_id) {
      const query = id ? mongooseQueryForUser(id) : { member_id };
      const user = await User.findOne(query).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: 'User retrieved successfully',
        data: user
      });
    }

    if (birthday) {
      const users = await User.find()
        .select('first_name middle_name last_name number dob');

      return res.status(200).json({
        message: 'Users birthday list retrieved successfully',
        data: users
      });
    }

    const query = {};

    if (parent_member_id !== undefined) query.parent_member_id = parent_member_id;
    if (is_committee !== undefined) query.is_committee = is_committee === true || is_committee === 'true' || is_committee === '1';
    if (country_id) query.country_id = country_id;
    if (state_id) query.state_id = state_id;
    if (city_id) query.city_id = city_id;
    const { data: users, pagination } = await queryHelper(User, requestData(req), {
      baseQuery: query,
      searchFields: ['first_name', 'middle_name', 'last_name', 'number', 'email'],
      filterFields: ['parent_member_id', 'is_committee', 'country_id', 'state_id', 'city_id', 'gender', 'blood_group', 'relation', 'status'],
      select: '-password',
      defaultSort: { createdAt: -1 },
      lean: false
    });


    res.status(200).json({
      ...(pagination ? { status: 200 } : {}),
      message: 'Users retrieved successfully',
      data: users,
      ...(pagination ? { pagination } : {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const data = requestData(req);
    const id = req.params.id || data.id || data.member_id;

    if (!id) {
      return res.status(400).json({ message: 'User ID or member ID is required' });
    }

    const user = await User.findOne({
      $or: [
        { _id: id },
        { member_id: id }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fields = [
      'parent_member_id', 'first_name', 'middle_name', 'last_name', 'number',
      'gender', 'dob', 'blood_group', 'relation', 'is_committee', 'committee_role',
      'profile_image', 'country_id', 'state_id', 'city_id', 'address'
    ];

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        user[field] = data[field];
      }
    });

    if (data.email !== undefined) {
      user.email = data.email ? data.email.toLowerCase() : '';
    }

    if (data.password) {
      user.password = data.password;
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

const mongooseQueryForUser = (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return { $or: [{ _id: id }, { member_id: id }] };
  }

  return { member_id: id };
};

module.exports = {
  register,
  login,
  getProfile,
  getUsers,
  updateUser
};
