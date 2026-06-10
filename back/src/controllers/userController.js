const User = require('../models/userModels');
const mongoose = require('mongoose');
const { apiResponse, publicUrl } = require('../utils/apiResponse');
const { getRolePermissions } = require('../middleware/auth');
const familyUtil = require('../utils/familyHelper');
const jwt = require('jsonwebtoken');
const queryHelper = require('../utils/queryHelper');
const { prepareFamilyFields, fullName } = require('../utils/familyHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfamilykey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '365d';

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  return req.body.image || fallback || '';
};

const sanitizeUser = (user) => {
  if (!user) return user;

  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;

  return data;
};

// Register a new user member
const register = async (req, res) => {

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      number,
      gender,
      dob,
      anniversary,
      blood_group,
      relation,
      is_committee,
      committee_role,
      profile_image,
      country_id,
      state_id,
      city_id,
      address,
      image,
      family_head_id,

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
    const familyData = await prepareFamilyFields({
      relation,
      family_head_id: req.body.family_head_id,
      status: req.body.status
    });

    const newUser = new User({
      first_name,
      middle_name,
      last_name,
      email: email ? email.toLowerCase() : '',
      password: password || '12345',
      number,
      gender,
      dob,
      anniversary,
      blood_group,
      relation: familyData.relation,
      is_committee,
      committee_role,
      profile_image,
      country_id,
      state_id,
      city_id,
      address,
      family_head: familyData.family_head,
      status: familyData.status,

    });

    await newUser.save();

    if (familyData.relation === 'Self') {
      newUser.family_head = {
        id: newUser._id,
        name: fullName(newUser)
      };

      if (req.body.status === undefined) {
        newUser.status = 0;
      }

      await newUser.save();
    }

    res.status(201).json({
      message: 'User registered successfully',
      data: sanitizeUser(newUser)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

//admin resgister
const createUser = async (req, res) => {

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      number,
      gender,
      dob,
      anniversary,
      blood_group,
      relation,
      is_committee,
      committee_role,
      profile_image,
      role_id,
      address,
      designation,
      status,
      image,
      family_head_id,

    } = req.body;



    if (!first_name || !number) {
      return apiResponse(res, 400, 'First name and number are required');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiResponse(res, 400, 'Invalid email format');
    }

    if (await User.findOne({ email: email ? email.toLowerCase() : undefined })) {
      return apiResponse(res, 400, 'Email already exists');
    }
    if (await User.findOne({ number: number ? number : undefined })) {
      return apiResponse(res, 400, 'Number already exists');
    }

    if ((is_committee === true || is_committee === 'true') && req.file?.size > 1024 * 1024) {
      return apiResponse(res, 400, 'Committee image must be 1 MB or smaller');
    }

    const familyData = await familyUtil.prepareFamilyFields({
      relation,
      family_head_id: req.body.family_head_id,
      status
    }, {});

    const assignedRoleId = role_id && mongoose.isValidObjectId(role_id) ? role_id : null;

    const users = await User.find({ member_id: /^\d+$/ }).select('member_id');
    const highestId = users.reduce((max, u) => {
      const num = Number(u.member_id);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);

    const newUser = new User({
      member_id: String(highestId + 1),
      first_name: first_name,
      middle_name: middle_name || '',
      last_name: last_name || '',
      email: email ? email.toLowerCase() : '',
      password: password || '12345',
      number: number,
      gender: gender || '',
      dob: dob || null,
      anniversary: anniversary || null,
      blood_group: blood_group || '',
      relation: familyData.relation,
      is_committee: is_committee === true || is_committee === 'true',
      committee_role: committee_role || '',
      role_id: assignedRoleId,
      address: address || '',
      designation: designation || '',
      status: familyData.status,
      family_head: familyData.family_head,

      image: imageFromRequest(req),
    });

    await newUser.save();

    if (familyData.relation === 'Self') {
      newUser.family_head = {
        id: newUser._id,
        name: familyUtil.fullName(newUser)
      };
      if (status === undefined) {
        newUser.status = 0;
      }
      await newUser.save();
    }

    return apiResponse(res, 201, 'User created successfully', {
      _id: newUser._id,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name || '',
      last_name: newUser.last_name || '',
      email: newUser.email,
      number: newUser.number,
      gender: newUser.gender || '',
      dob: newUser.dob || null,
      anniversary: newUser.anniversary || null,
      blood_group: newUser.blood_group || '',
      relation: newUser.relation || 'Self',
      is_committee: newUser.is_committee || false,
      committee_role: newUser.committee_role || '',
      role_id: newUser.role_id ? String(newUser.role_id) : '',
      address: newUser.address || '',
      designation: newUser.designation || '',
      status: Number(newUser.status ?? 1),
      image: publicUrl(req, newUser.image || ''),


    });
  } catch (error) {
    return apiResponse(res, 500, 'Error creating user', { error: error.message });
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

const mongooseQueryForUser = (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return { _id: id };
  }

  return { _id: id };
};

const getUsers = async (req, res) => {
  try {
    const birthday = 'birthday' in req.query;
    const anniversary = 'anniversary' in req.query;

    const query = {};
    const requestPermissions = getRolePermissions(req.user);
    const canListMembers = requestPermissions.includes('members.list') || requestPermissions.includes('users.manage');
    const canListCommittee = requestPermissions.includes('committee.list') || requestPermissions.includes('committee.manage');

    if (req.query.gender) query.gender = req.query.gender;
    if (req.query.blood_group) query.blood_group = req.query.blood_group;
    if (req.query.is_committee !== undefined) {
      query.is_committee = req.query.is_committee === 'true';
    }
    if (!canListMembers && canListCommittee) {
      query.is_committee = true;
    }

    if (birthday) {
      query.dob = { $exists: true };
    }

    if (anniversary) {
      query.anniversary = { $exists: true };

    }

    const { data: users, pagination } = await queryHelper(User, req.query, {
      baseQuery: query,
      searchFields: ['first_name', 'middle_name', 'last_name', 'number', 'email'],
      filterFields: ['gender', 'blood_group', 'is_committee', 'committee_role', 'role_id', 'status'],
      select: birthday ? 'first_name middle_name last_name number dob anniversary' : '-password',
      populate: birthday ? '' : 'role_id',
      defaultSort: { createdAt: -1 },
      lean: false
    });

    if (birthday) {
      const formatted = users.map(u => ({
        name: fullName(u),
        number: u.number,
        dob: u.dob || null.$exists,
        anniversary: u.anniversary || null
      }));
      return apiResponse(res, 200, 'Users birthday list retrieved successfully', formatted, pagination);
    }

    if (anniversary) {
      const formatted = users.map(u => ({
        name: fullName(u),
        number: u.number,
        anniversary: u.anniversary || null
      }));
      return apiResponse(res, 200, 'Users birthday list retrieved successfully', formatted, pagination);
    }
    // Map backend user to the fields expected by standard layout or user forms
    const formatted = users.map(u => ({
      id: u.id || String(u._id),
      _id: u._id,
      first_name: u.first_name,
      middle_name: u.middle_name || '',
      last_name: u.last_name || '',
      name: fullName(u),
      email: u.email || '',
      number: u.number,
      gender: u.gender || '',
      dob: u.dob || null,
      anniversary: u.anniversary || null,
      blood_group: u.blood_group || '',
      relation: u.relation || 'Self',
      is_committee: u.is_committee || false,
      committee_role: u.committee_role || '',
      designation: u.designation || '',
      role_id: u.role_id?._id ? String(u.role_id._id) : '',
      role_name: u.role_id?.name || '',
      permissions: getRolePermissions(u),
      address: u.address || '',
      status: Number(u.status ?? 1),
      image: publicUrl(req, u.image || u.profile_image || ''),
      role: u.is_committee ? 'admin' : 'user'
    }));

    return apiResponse(res, 200, 'Users retrieved successfully', formatted, pagination);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving users', { error: error.message });
  }
};



const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isSelfUpdate = [
      req.user?._id,
      req.user?.id,
    ].some((value) => value && String(value) === String(id));
    const isRoleUpdate = [
      'role',
      'role_id',
      'committee_role',
      'is_committee',
      'permissions'
    ].some((field) => req.body[field] !== undefined);

    if (isSelfUpdate && isRoleUpdate) {
      return res.status(403).json({ message: 'You cannot change your own role.' });
    }

    const {
      first_name,
      middle_name,
      last_name,
      email,
      number,
      gender,
      dob,
      anniversary,
      blood_group,
      relation,
      is_committee,
      committee_role,
      role_id,
      address,
      designation,
      image,
      password,
      status
    } = req.body;


    const user = await User.findOne({ _id: id });
    if (!user) {
      return apiResponse(res, 404, 'User not found');
    }

    const familyData = await familyUtil.prepareFamilyFields({
      relation,
      family_head_id: req.body.family_head_id,
      status
    }, user);

    if ((is_committee === true || is_committee === 'true' || user.is_committee) && req.file?.size > 1024 * 1024) {
      return apiResponse(res, 400, 'Committee image must be 1 MB or smaller');
    }

    if (first_name) user.first_name = first_name;
    if (middle_name !== undefined) user.middle_name = middle_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (number !== undefined) user.number = number;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;
    if (anniversary !== undefined) user.anniversary = anniversary;
    if (blood_group !== undefined) user.blood_group = blood_group;
    if (relation !== undefined) user.relation = familyData.relation;
    if (is_committee !== undefined) user.is_committee = is_committee === true || is_committee === 'true';
    if (committee_role !== undefined) user.committee_role = committee_role;
    if (role_id !== undefined) user.role_id = role_id && mongoose.isValidObjectId(role_id) ? role_id : null;
    if (address !== undefined) user.address = address;
    if (designation !== undefined) user.designation = designation;
    if (status !== undefined) user.status = Number(status);
    user.family_head = familyData.family_head;
    if (password) user.password = password;
    if (req.file || req.body.image) user.image = imageFromRequest(req, user.image);

    await user.save();

    return apiResponse(res, 200, 'User updated  ', {
      id: user._id,
      first_name: user.first_name,
      middle_name: user.middle_name || '',
      last_name: user.last_name || '',
      email: user.email,
      number: user.number,
      gender: user.gender || '',
      dob: user.dob || null,
      anniversary: user.anniversary || null,
      blood_group: user.blood_group || '',
      relation: user.relation || 'Self',
      is_committee: user.is_committee || false,
      committee_role: user.committee_role || '',
      role_id: user.role_id ? String(user.role_id) : '',
      address: user.address || '',
      designation: user.designation || '',
      status: Number(user.status ?? 1),
      image: publicUrl(req, user.image || ''),

    });
  } catch (error) {
    return apiResponse(res, 500, 'Error updating user', { error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'User not found');
    }
    return apiResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting user', { error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
