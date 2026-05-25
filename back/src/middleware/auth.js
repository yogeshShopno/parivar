const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModels');
const { ALL_PERMISSION_KEYS } = require('../config/permissions');

const isInvalidTokenValue = (token) => {
  if (!token) {
    return true;
  }

  const normalized = token.trim().toLowerCase();

  return [
    'bearer',
    'null',
    'undefined',
    '{{token}}',
    '{{toakn}}',
    '{{admin-toakn}}'
  ].includes(normalized);
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const tokenHeader = req.headers.token || req.headers['x-auth-token'] || req.headers['x-access-token'];
  const headerValue = authHeader || tokenHeader;

  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const trimmedHeader = headerValue.trim();
  const bearerMatch = trimmedHeader.match(/^Bearer\s+(.+)$/i);

  const token = (bearerMatch ? bearerMatch[1] : trimmedHeader).trim();

  return isInvalidTokenValue(token) ? null : token;
};

const findUserFromToken = async (decoded) => {
  const userId = decoded.id || decoded._id || decoded.userId;

  if (userId && mongoose.isValidObjectId(userId)) {
    const user = await User.findById(userId).select('-password').populate('role_id');

    if (user) {
      return user;
    }
  }

  if (userId) {
    const user = await User.findOne({ member_id: String(userId) }).select('-password').populate('role_id');

    if (user) {
      return user;
    }
  }

  if (decoded.member_id) {
    const user = await User.findOne({ member_id: String(decoded.member_id) }).select('-password').populate('role_id');

    if (user) {
      return user;
    }
  }

  if (decoded.number) {
    return User.findOne({ number: String(decoded.number) }).select('-password').populate('role_id');
  }

  return null;
};

const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Token missing',
      data: []
    });
  }

  if (token.split('.').length !== 3) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Invalid or expired token',
      data: []
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretfamilykey');
    req.user = await findUserFromToken(decoded);

    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid or expired token',
        data: []
      });
    }

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid or expired token',
        data: []
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid or expired token',
        data: []
      });
    }

    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Invalid or expired token',
      data: []
    });
  }
};

const getRolePermissions = (user = {}) => {
  const assignedRole = user.role_id;

  if (assignedRole && Number(assignedRole.status ?? 1) === 1) {
    return assignedRole.permissions || [];
  }

  if (user.is_committee || user.relation === 'Self') {
    return ALL_PERMISSION_KEYS;
  }

  return [];
};

const requirePermission = (permission) => async (req, res, next) => {
  const permissions = getRolePermissions(req.user);

  if (permissions.includes(permission)) {
    return next();
  }

  return res.status(403).json({
    status: 403,
    message: 'Forbidden: You do not have permission for this action',
    data: []
  });
};

module.exports = { getRolePermissions, protect, getTokenFromRequest, requirePermission };
