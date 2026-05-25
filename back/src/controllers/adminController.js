const User = require('../models/userModels');
const Business = require('../models/businessModel');
const Post = require('../models/postModel');
const Config = require('../models/configModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { apiResponse, fullName, memberPublicId } = require('../utils/apiResponse');
const { getRolePermissions } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfamilykey';

// Admin login (email + password, checks is_committee)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('role_id');
    if (!user) {
      return apiResponse(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return apiResponse(res, 401, 'Invalid email or password');
    }

    const permissions = getRolePermissions(user);

    // Restrict access to committee members, legacy self admins, or users with an assigned role.
    if (!user.is_committee && user.relation !== 'Self' && permissions.length === 0) {
      return apiResponse(res, 403, 'Access denied: Insufficient permissions');
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userData = {
      id: user.member_id || String(user._id),
      name: fullName(user),
      email: user.email,
      role: user.is_committee ? 'admin' : 'user',
      is_committee: user.is_committee,
      committee_role: user.committee_role,
      role_id: user.role_id?._id ? String(user.role_id._id) : '',
      role_name: user.role_id?.name || '',
      permissions,
      is_super_admin: !user.role_id && (user.is_committee || user.relation === 'Self')
    };

    return apiResponse(res, 200, 'Login successful', {
      token,
      user: userData
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error in login', { error: error.message });
  }
};

// Aggregated Dashboard stats
const getStats = async (req, res) => {
  try {
    const [userCount, businessCount, postCount, committeeCount] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ is_committee: true })
    ]);

    // Generate some interesting data patterns for mock charts over the last few months
    // e.g., monthly users registered or monthly posts
    return apiResponse(res, 200, 'Dashboard statistics fetched successfully', {
      users: userCount,
      businesses: businessCount,
      posts: postCount,
      committee: committeeCount,
      orders: postCount * 4, // for compatibility
      revenue: businessCount * 1500 // for compatibility
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error in getting stats', { error: error.message });
  }
};

// --- Users Management ---
const getUsers = async (req, res) => {
  try {
    const { search, gender, blood_group, is_committee } = req.query;
    const query = {};

    if (gender) query.gender = gender;
    if (blood_group) query.blood_group = blood_group;
    if (is_committee !== undefined) {
      query.is_committee = is_committee === 'true';
    }

    if (search) {
      query.$or = [
        { first_name: new RegExp(search, 'i') },
        { middle_name: new RegExp(search, 'i') },
        { last_name: new RegExp(search, 'i') },
        { number: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query).select('-password').populate('role_id').sort({ createdAt: -1 });
    
    // Map backend user to the fields expected by standard layout or user forms
    const formatted = users.map(u => ({
      id: u.member_id || String(u._id),
      _id: u._id,
      first_name: u.first_name,
      middle_name: u.middle_name || '',
      last_name: u.last_name || '',
      name: fullName(u),
      email: u.email || '',
      phone: u.number,
      gender: u.gender || '',
      dob: u.dob || null,
      blood_group: u.blood_group || '',
      relation: u.relation || 'Self',
      is_committee: u.is_committee || false,
      committee_role: u.committee_role || '',
      role_id: u.role_id?._id ? String(u.role_id._id) : '',
      role_name: u.role_id?.name || '',
      permissions: getRolePermissions(u),
      address: u.address || '',
      role: u.is_committee ? 'admin' : 'user'
    }));

    return apiResponse(res, 200, 'Users retrieved successfully', formatted);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving users', { error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, phone, password, gender, dob, blood_group, relation, is_committee, committee_role, role_id, address } = req.body;

    if (!first_name || !phone) {
      return apiResponse(res, 400, 'First name and phone number are required');
    }

    // Generate unique member_id
    const users = await User.find({ member_id: /^\d+$/ }).select('member_id');
    const highestId = users.reduce((max, u) => {
      const num = Number(u.member_id);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    const nextMemberId = String(highestId > 0 ? highestId + 1 : Date.now());

    const assignedRoleId = role_id && mongoose.isValidObjectId(role_id) ? role_id : null;

    const newUser = new User({
      member_id: nextMemberId,
      first_name,
      middle_name: middle_name || '',
      last_name: last_name || '',
      email: email ? email.toLowerCase() : '',
      password: password || '12345',
      number: phone,
      gender: gender || '',
      dob: dob || null,
      blood_group: blood_group || '',
      relation: relation || 'Self',
      is_committee: is_committee === true || is_committee === 'true',
      committee_role: committee_role || '',
      role_id: assignedRoleId,
      address: address || ''
    });

    await newUser.save();
    
    return apiResponse(res, 201, 'User created successfully', {
      id: newUser.member_id,
      name: fullName(newUser),
      email: newUser.email,
      phone: newUser.number,
      role: newUser.is_committee ? 'admin' : 'user'
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error creating user', { error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, email, phone, gender, dob, blood_group, relation, is_committee, committee_role, role_id, address, password } = req.body;

    const user = await User.findOne({ member_id: id });
    if (!user) {
      return apiResponse(res, 404, 'User not found');
    }

    if (first_name) user.first_name = first_name;
    if (middle_name !== undefined) user.middle_name = middle_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone) user.number = phone;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;
    if (blood_group !== undefined) user.blood_group = blood_group;
    if (relation !== undefined) user.relation = relation;
    if (is_committee !== undefined) user.is_committee = is_committee === true || is_committee === 'true';
    if (committee_role !== undefined) user.committee_role = committee_role;
    if (role_id !== undefined) user.role_id = role_id && mongoose.isValidObjectId(role_id) ? role_id : null;
    if (address !== undefined) user.address = address;
    if (password) user.password = password;

    await user.save();

    return apiResponse(res, 200, 'User updated successfully', {
      id: user.member_id,
      name: fullName(user),
      email: user.email,
      phone: user.number,
      role: user.is_committee ? 'admin' : 'user'
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error updating user', { error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.deleteOne({ member_id: id });
    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'User not found');
    }
    return apiResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting user', { error: error.message });
  }
};

// --- Businesses Management ---
const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Businesses retrieved successfully', businesses.map(b => ({
      id: b.id || String(b._id),
      business_name: b.business_name || '',
      number: b.number || '',
      address: b.address || '',
      about_us: b.about_us || '',
      facebook: b.facebook || '',
      instagram: b.instagram || '',
      website: b.website || '',
      status: b.status || 1
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving businesses', { error: error.message });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }] });
    if (!business) {
      return apiResponse(res, 404, 'Business not found');
    }

    Object.assign(business, req.body);
    await business.save();

    return apiResponse(res, 200, 'Business updated successfully', business);
  } catch (error) {
    return apiResponse(res, 500, 'Error updating business', { error: error.message });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Business.deleteOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }] });
    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'Business not found');
    }
    return apiResponse(res, 200, 'Business deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting business', { error: error.message });
  }
};

// --- Feed/Posts Management ---
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    return apiResponse(res, 200, 'Posts retrieved successfully', posts.map(p => ({
      id: p.id || String(p._id),
      title: p.title || '',
      description: p.description || '',
      image: p.image || '',
      cdate: p.cdate || '',
      status: p.status || 1
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving posts', { error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Post.deleteOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }] });
    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'Post not found');
    }
    return apiResponse(res, 200, 'Post deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting post', { error: error.message });
  }
};

// --- Config/Theme Management ---
const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    return apiResponse(res, 200, 'Config retrieved successfully', config);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving configuration', { error: error.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = new Config(req.body);
    } else {
      Object.assign(config, req.body);
    }
    await config.save();
    return apiResponse(res, 200, 'Configuration updated successfully', config);
  } catch (error) {
    return apiResponse(res, 500, 'Error updating configuration', { error: error.message });
  }
};

module.exports = {
  login,
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getBusinesses,
  updateBusiness,
  deleteBusiness,
  getPosts,
  deletePost,
  getConfig,
  updateConfig
};
