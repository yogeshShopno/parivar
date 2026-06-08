const User = require('../models/userModels');
const Role = require('../models/roleModel');
const Business = require('../models/businessModel');
const Post = require('../models/postModel');
const Config = require('../models/configModel');
const Student = require('../models/studentModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { apiResponse, fullName, memberPublicId, publicUrl } = require('../utils/apiResponse');
const familyUtil = require('../utils/familyHelper');
const { getRolePermissions } = require('../middleware/auth');
const queryHelper = require('../utils/queryHelper');

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

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const recoveryKeyFromRequest = (req) => (
  req.headers['x-admin-recovery-key']
  || req.headers['x-recovery-key']
  || req.body?.recovery_key
  || req.query?.recovery_key
);

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const adminRecoveryQuery = ({ id,  email, number }) => {
  const query = [];

  if (id) {
    if (mongoose.isValidObjectId(id)) {
      query.push({ _id: id });
    }
    query.push({ _id: String(id) });
  }

  if (email) query.push({ email: String(email).toLowerCase() });
  if (number) query.push({ number: String(number) });

  return query.length ? { $or: query } : null;
};

const resolveRecoveryRoleId = async ({ role_id, role_name }) => {
  if (role_id !== undefined) {
    if (!role_id) {
      return null;
    }

    if (!mongoose.isValidObjectId(role_id)) {
      const error = new Error('Invalid role id');
      error.status = 400;
      throw error;
    }

    return role_id;
  }

  if (!role_name) {
    return undefined;
  }

  const role = await Role.findOne({ name: new RegExp(`^${escapeRegExp(role_name).trim()}$`, 'i') });
  if (!role) {
    const error = new Error('Role not found');
    error.status = 404;
    throw error;
  }

  return role._id;
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
    if (!user.is_committee && user.committee_role !== 'Self' && permissions.length === 0) {
      return apiResponse(res, 403, 'Access denied: Insufficient permissions');
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userData = {
      id: user.id || String(user._id),
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

const updateAdminRecovery = async (req, res) => {
  try {
    const configuredRecoveryKey = process.env.ADMIN_RECOVERY_KEY;

    if (!configuredRecoveryKey) {
      return apiResponse(res, 503, 'Admin recovery is not configured');
    }

    if (String(recoveryKeyFromRequest(req) || '') !== String(configuredRecoveryKey)) {
      return apiResponse(res, 403, 'Forbidden: Invalid recovery key');
    }

    const data = requestData(req);
    const query = adminRecoveryQuery(data);

    if (!query) {
      return apiResponse(res, 400, 'Admin identifier is required');
    }

    const user = await User.findOne(query);
    if (!user) {
      return apiResponse(res, 404, 'Admin user not found');
    }

    const updates = [];
    const nextRoleId = await resolveRecoveryRoleId(data);

    if (data.password) {
      user.password = data.password;
      updates.push('password');
    }

    if (data.role !== undefined) {
      const roleValue = String(data.role).toLowerCase();
      if (roleValue === 'admin') {
        user.is_committee = true;
        updates.push('role');
      } else if (roleValue === 'member') {
        user.is_committee = false;
        user.role_id = null;
        updates.push('role');
      } else {
        return apiResponse(res, 400, 'Role must be admin or member');
      }
    }

    if (nextRoleId !== undefined) {
      user.role_id = nextRoleId;
      if (nextRoleId) {
        user.is_committee = true;
      }
      updates.push('role_id');
    }

    if (data.designation !== undefined || data.committee_role !== undefined) {
      const designation = data.designation ?? data.committee_role;
      user.designation = designation;
      user.committee_role = designation;
      if (designation) {
        user.is_committee = true;
      }
      updates.push('designation');
    }

    if (data.status !== undefined) {
      user.status = Number(data.status);
      updates.push('status');
    }

    if (updates.length === 0) {
      return apiResponse(res, 400, 'No recovery updates provided');
    }

    await user.save();

    return apiResponse(res, 200, 'Admin updated successfully', {
      id: user.id || String(user._id),
      _id: String(user._id),
      email: user.email || '',
      number: user.number || '',
      is_committee: user.is_committee,
      committee_role: user.committee_role || '',
      designation: user.designation || '',
      role_id: user.role_id ? String(user.role_id) : '',
      status: Number(user.status ?? 1),
      updated_fields: [...new Set(updates)]
    });
  } catch (error) {
    if (error.status) {
      return apiResponse(res, error.status, error.message);
    }

    return apiResponse(res, 500, 'Error updating admin recovery details', { error: error.message });
  }
};

// Aggregated Dashboard stats
const getStats = async (req, res) => {
  try {
    const [userCount, businessCount, postCount, committeeCount] = await Promise.all([
      User.countDocuments({}),
      Business.countDocuments({}),
      Post.countDocuments({}),
      User.countDocuments({ is_committee: true })
    ]);
    return apiResponse(res, 200, 'Dashboard statistics fetched successfully', {
      users: userCount,
      businesses: businessCount,
      posts: postCount,
      committee: committeeCount,
      orders: postCount * 4,
      revenue: businessCount * 1500
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error in getting stats', { error: error.message });
  }
};

// --- Users Management ---
const getUsers = async (req, res) => {
  try {
    const birthday = 'birthday' in req.query;
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

    const { data: users, pagination } = await queryHelper(User, req.query, {
      baseQuery: query,
      searchFields: ['first_name', 'middle_name', 'last_name', 'number', 'email'],
      filterFields: ['gender', 'blood_group', 'is_committee', 'committee_role', 'role_id', 'status'],
      select: birthday ? 'first_name middle_name last_name number dob' : '-password',
      populate: birthday ? '' : 'role_id',
      defaultSort: { createdAt: -1 },
      lean: false
    });

    if (birthday) {
      const formatted = users.map(u => ({
        name: fullName(u),
        number: u.number,
        dob: u.dob || null
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

const createUser = async (req, res) => {

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      number,
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
      status,
      image
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


    const users = await User.find({ _id: /^\d+$/ }).select('_id');
    const highestId = users.reduce((max, u) => {
      const num = Number(u._id);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);

    const newUser = new User({
      first_name: first_name,
      middle_name: middle_name || '',
      last_name: last_name || '',
      email: email ? email.toLowerCase() : '',
      password: password || '12345',
      number: number,
      gender: gender || '',
      dob: dob || null,
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
    const result = await User.deleteOne({_id: id });
    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'User not found');
    }
    return apiResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting user', { error: error.message });
  }
};


// const getStudents = async (req, res) => {
//   try {
//     const { data: students, pagination } = await queryHelper(Student, req.query, {
//       searchFields: ['surname', 'student_name', 'father_name', 'school_name', 'standard', 'mobile_number'],
//       filterFields: ['standard', 'student_name', 'school_name', 'status']
//     });
//     return apiResponse(res, 200, 'Students retrieved successfully', students.map(s => ({
//       id: s.id || String(s._id),
//       surname: s.surname || '',
//       student_name: s.student_name || '',
//       father_name: s.father_name || '',
//       school_name: s.school_name || '',
//       standard: s.standard || '',
//       percentage: s.percentage || '',
//       mobile_number: s.mobile_number || '',
//       mobile_number_2: s.mobile_number_2 || '',
//       result_image: publicUrl(req, s.result_image || ''),
//       student_image: publicUrl(req, s.student_image || ''),
//       status: Number(s.status ?? 0),
//       createdAt: s.createdAt || s.cdate || ''
//     })), pagination);
//   } catch (error) {
//     return apiResponse(res, 500, 'Error retrieving students', { error: error.message });
//   }
// };

// const studentPayload = (req, existing = {}) => ({
//   ...req.body,
//   surname: req.body.surname || existing.surname || '',
//   student_name: req.body.student_name || existing.student_name || '',
//   father_name: req.body.father_name || existing.father_name || '',
//   school_name: req.body.school_name || existing.school_name || '',
//   standard: req.body.standard || existing.standard || '',
//   percentage: req.body.percentage || existing.percentage || '',
//   mobile_number: req.body.mobile_number || existing.mobile_number || '',
//   mobile_number_2: req.body.mobile_number_2 || existing.mobile_number_2 || '',
//   result_image: req.body.result_image || existing.result_image || '',
//   student_image: req.body.student_image || existing.student_image || '',
//   status: req.body.status === undefined ? Number(existing.status ?? 0) : Number(req.body.status)
// });

// const saveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let existing = null;
//     if (id) {
//       const orConditions = [];
//       orConditions.push({ id });
//       if (mongoose.isValidObjectId(id)) {
//         orConditions.push({ _id: id });
//       }
//       existing = await Student.findOne({ $or: orConditions });
//     }

//     if (id && !existing) {
//       return apiResponse(res, 404, 'Student not found');
//     }

//     const payload = studentPayload(req, existing || {});
//     if (!payload.surname || !payload.student_name || !payload.father_name || !payload.school_name || !payload.standard || !payload.percentage || !payload.mobile_number) {
//       return apiResponse(res, 400, 'All required fields are mandatory');
//     }

//     const student = existing || new Student({
    
//       cdate: new Date().toISOString().slice(0, 10)
//     });

//     student.set({ ...payload });
//     await student.save();

//     return apiResponse(res, existing ? 200 : 201, 'Student saved successfully', {
//       id: student._id || String(student._id),
//       surname: student.surname || '',
//       student_name: student.student_name || '',
//       father_name: student.father_name || '',
//       school_name: student.school_name || '',
//       standard: student.standard || '',
//       percentage: student.percentage || '',
//       mobile_number: student.mobile_number || '',
//       mobile_number_2: student.mobile_number_2 || '',
//       result_image: publicUrl(req, student.result_image || ''),
//       student_image: publicUrl(req, student.student_image || ''),
//       status: Number(student.status ?? 0),
//       createdAt: student.createdAt || student.cdate || ''
//     });
//   } catch (error) {
//     return apiResponse(res, 500, 'Error saving student', { error: error.message });
//   }
// };

// const deleteStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
// const result = await Student.deleteOne({
//   $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
// });
//     if (result.deletedCount === 0) {
//       return apiResponse(res, 404, 'Student not found');
//     }
//     return apiResponse(res, 200, 'Student deleted successfully');
//   } catch (error) {
//     return apiResponse(res, 500, 'Error deleting student', { error: error.message });
//   }
// };

// --- Config/Theme Management ---

const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    return apiResponse(res, 200, 'Config retrieved successfully', {
      _id: String(config._id),
      ...config.toObject()
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving configuration', { error: error.message });
  }
};
const updateConfig = async (req, res) => {
  try {
    const config = await Config.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    return apiResponse(res, 200, 'Configuration updated successfully', {
      _id: String(config._id),
      ...config.toObject()
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error updating configuration', { error: error.message });
  }
};

module.exports = {
  login,
  updateAdminRecovery,
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  // getStudents,
  // saveStudent,
  // deleteStudent,
  getConfig,
  updateConfig
};
