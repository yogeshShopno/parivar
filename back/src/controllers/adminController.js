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
  // getStudents,
  // saveStudent,
  // deleteStudent,
  getConfig,
  updateConfig
};
