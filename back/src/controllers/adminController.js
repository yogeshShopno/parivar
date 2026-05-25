const User = require('../models/userModels');
const Business = require('../models/businessModel');
const Post = require('../models/postModel');
const Config = require('../models/configModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { apiResponse, fullName, memberPublicId, publicUrl } = require('../utils/apiResponse');
const { getRolePermissions } = require('../middleware/auth');
const { adminMemberId, ownerFields, ownerOrLegacyMemberQuery, ownerQuery } = require('../utils/ownership');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfamilykey';

const splitFullName = (value = '') => {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: '', middle_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], middle_name: '', last_name: '' };
  if (parts.length === 2) return { first_name: parts[0], middle_name: '', last_name: parts[1] };
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(' '),
    last_name: parts[parts.length - 1]
  };
};

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  return req.body.image || fallback || '';
};

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
      is_super_admin: user.is_committee || user.relation === 'Self'
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
    const scopedOwner = ownerQuery(req);
    const [userCount, businessCount, postCount, committeeCount] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(scopedOwner),
      Post.countDocuments(scopedOwner),
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
    const requestPermissions = getRolePermissions(req.user);
    const canListMembers = requestPermissions.includes('members.list') || requestPermissions.includes('users.manage');
    const canListCommittee = requestPermissions.includes('committee.list') || requestPermissions.includes('committee.manage');

    if (gender) query.gender = gender;
    if (blood_group) query.blood_group = blood_group;
    if (is_committee !== undefined) {
      query.is_committee = is_committee === 'true';
    }
    if (!canListMembers && canListCommittee) {
      query.is_committee = true;
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

    const users = await User.find({
      $and: [
        ownerOrLegacyMemberQuery(req),
        query
      ]
    }).select('-password').populate('role_id').sort({ createdAt: -1 });
    
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
      designation: u.designation || '',
      role_id: u.role_id?._id ? String(u.role_id._id) : '',
      role_name: u.role_id?.name || '',
      permissions: getRolePermissions(u),
      address: u.address || '',
      status: Number(u.status ?? 1),
      image: publicUrl(req, u.image || u.profile_image || ''),
      role: u.is_committee ? 'admin' : 'user'
    }));

    return apiResponse(res, 200, 'Users retrieved successfully', formatted);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving users', { error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      gender,
      dob,
      blood_group,
      relation,
      is_committee,
      committee_role,
      role_id,
      address,
      designation,
      status
    } = req.body;
    const nameParts = splitFullName(full_name);
    const first_name = req.body.first_name || nameParts.first_name;
    const middle_name = req.body.middle_name ?? nameParts.middle_name;
    const last_name = req.body.last_name ?? nameParts.last_name;

    if (!first_name || !phone) {
      return apiResponse(res, 400, 'First name and phone number are required');
    }

    if ((is_committee === true || is_committee === 'true') && req.file?.size > 1024 * 1024) {
      return apiResponse(res, 400, 'Committee image must be 1 MB or smaller');
    }

    // Generate unique member_id
    const users = await User.find({ member_id: /^\d+$/ }).select('member_id');
    const highestId = users.reduce((max, u) => {
      const num = Number(u.member_id);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    const nextMemberId = String(highestId > 0 ? highestId + 1 : Date.now());

    const assignedRoleId = role_id && mongoose.isValidObjectId(role_id) ? role_id : null;

    const owner = ownerFields(req);
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
      address: address || '',
      designation: designation || '',
      status: status === undefined ? 1 : Number(status),
      image: imageFromRequest(req),
      created_by_admin_id: owner.created_by_admin_id,
      admin_id: owner.admin_id,
      tenant_id: owner.tenant_id,
      created_by_user_id: owner.created_by_user_id,
      created_by_member_id: owner.created_by_member_id,
      created_by_name: owner.created_by_name,
      created_by_role: owner.created_by_role
    });

    await newUser.save();
    
    return apiResponse(res, 201, 'User created successfully', {
      id: newUser.member_id,
      name: fullName(newUser),
      email: newUser.email,
      phone: newUser.number,
      designation: newUser.designation || '',
      status: Number(newUser.status ?? 1),
      image: publicUrl(req, newUser.image || ''),
      role: newUser.is_committee ? 'admin' : 'user'
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error creating user', { error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      email,
      phone,
      gender,
      dob,
      blood_group,
      relation,
      is_committee,
      committee_role,
      role_id,
      address,
      password,
      designation,
      status
    } = req.body;
    const hasFullName = full_name !== undefined;
    const nameParts = hasFullName ? splitFullName(full_name) : {};
    const first_name = req.body.first_name ?? nameParts.first_name;
    const middle_name = req.body.middle_name ?? nameParts.middle_name;
    const last_name = req.body.last_name ?? nameParts.last_name;

    const user = await User.findOne({
      $and: [
        ownerOrLegacyMemberQuery(req),
        { member_id: id }
      ]
    });
    if (!user) {
      return apiResponse(res, 404, 'User not found');
    }

    if ((is_committee === true || is_committee === 'true' || user.is_committee) && req.file?.size > 1024 * 1024) {
      return apiResponse(res, 400, 'Committee image must be 1 MB or smaller');
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
    if (designation !== undefined) user.designation = designation;
    if (status !== undefined) user.status = Number(status);
    if (req.file || req.body.image) user.image = imageFromRequest(req, user.image);
    if (password) user.password = password;

    await user.save();

    return apiResponse(res, 200, 'User updated successfully', {
      id: user.member_id,
      name: fullName(user),
      email: user.email,
      phone: user.number,
      designation: user.designation || '',
      status: Number(user.status ?? 1),
      image: publicUrl(req, user.image || ''),
      role: user.is_committee ? 'admin' : 'user'
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error updating user', { error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.deleteOne({
      $and: [
        ownerOrLegacyMemberQuery(req),
        { member_id: id }
      ]
    });
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
    const businesses = await Business.find(ownerQuery(req)).sort({ _id: -1 }).lean();
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

const businessPayload = (req, existing = {}) => ({
  ...req.body,
  business_name: req.body.business_name || existing.business_name || '',
  number: req.body.number || existing.number || '',
  address: req.body.address || existing.address || '',
  about_us: req.body.about_us || existing.about_us || '',
  website: req.body.website || existing.website || '',
  facebook: req.body.facebook || existing.facebook || '',
  instagram: req.body.instagram || existing.instagram || '',
  status: req.body.status === undefined ? Number(existing.status ?? 1) : Number(req.body.status),
  business_category_id: req.body.business_category_id || existing.business_category_id || 'ADMIN',
  country_id: req.body.country_id || existing.country_id || 'ADMIN',
  state_id: req.body.state_id || existing.state_id || 'ADMIN',
  city_id: req.body.city_id || existing.city_id || 'ADMIN'
});

const saveBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = id ? await Business.findOne({
      ...ownerQuery(req),
      $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
    }) : null;

    if (id && !existing) {
      return apiResponse(res, 404, 'Business not found');
    }

    const payload = businessPayload(req, existing || {});
    if (!payload.business_name || !payload.number || !payload.address) {
      return apiResponse(res, 400, 'Business name, phone number, and address are required');
    }

    const business = existing || new Business({
      id: `BUS${Date.now()}`,
      member_id: adminMemberId(req),
      cdate: new Date().toISOString().slice(0, 10)
    });

    Object.assign(business, payload, ownerFields(req));
    await business.save();

    return apiResponse(res, existing ? 200 : 201, 'Business saved successfully', {
      id: business.id || String(business._id),
      business_name: business.business_name || '',
      number: business.number || '',
      address: business.address || '',
      about_us: business.about_us || '',
      facebook: business.facebook || '',
      instagram: business.instagram || '',
      website: business.website || '',
      status: Number(business.status ?? 1)
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error saving business', { error: error.message });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Business.deleteOne({
      ...ownerQuery(req),
      $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
    });
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
    const posts = await Post.find(ownerQuery(req)).sort({ createdAt: -1 }).lean();
    return apiResponse(res, 200, 'Posts retrieved successfully', posts.map(p => ({
      id: p.id || String(p._id),
      title: p.title || '',
      description: p.description || '',
      image: publicUrl(req, p.image || ''),
      cdate: p.cdate || '',
      status: p.status || 1
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving posts', { error: error.message });
  }
};

const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const existing = id
      ? await Post.findOne({
        ...ownerQuery(req),
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
      })
      : null;

    if (id && !existing) {
      return apiResponse(res, 404, 'Post not found');
    }

    if (!title || !description) {
      return apiResponse(res, 400, 'Post title and description are required');
    }

    const post = existing || new Post({
      id: `POST${Date.now()}`,
      member_id: adminMemberId(req),
      cdate: new Date().toISOString().slice(0, 10)
    });

    post.title = title;
    post.description = description;
    Object.assign(post, ownerFields(req));
    post.status = status === undefined ? Number(post.status ?? 1) : Number(status);
    if (req.file || req.body.image) post.image = imageFromRequest(req, post.image);

    await post.save();

    return apiResponse(res, existing ? 200 : 201, 'Post saved successfully', {
      id: post.id || String(post._id),
      title: post.title || '',
      description: post.description || '',
      image: publicUrl(req, post.image || ''),
      cdate: post.cdate || '',
      status: Number(post.status ?? 1)
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error saving post', { error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Post.deleteOne({
      ...ownerQuery(req),
      $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
    });
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
    let config = await Config.findOne(ownerQuery(req));
    if (!config) {
      config = await Config.create(ownerFields(req));
    }
    return apiResponse(res, 200, 'Config retrieved successfully', config);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving configuration', { error: error.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne(ownerQuery(req));
    if (!config) {
      config = new Config({ ...req.body, ...ownerFields(req) });
    } else {
      Object.assign(config, req.body, ownerFields(req));
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
  saveBusiness,
  deleteBusiness,
  getPosts,
  savePost,
  deletePost,
  getConfig,
  updateConfig
};
