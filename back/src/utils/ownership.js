const { fullName, memberPublicId } = require('./apiResponse');

const userObjectId = (user = {}) => String(user?._id || user?.id || '');

const adminMemberId = (req = {}) => memberPublicId(req.user);

const isAdminUser = (user = {}) => Boolean(user?.is_committee || user?.relation === 'Self' || user?.role_id);

const adminOwnerId = (req = {}) => {
  const user = req.user || {};

  if (isAdminUser(user)) {
    return userObjectId(user) || memberPublicId(user);
  }

  return String(user.created_by_admin_id || user.admin_id || user.tenant_id || userObjectId(user) || memberPublicId(user) || '');
};

const ownerFields = (req = {}) => {
  const createdByAdminId = adminOwnerId(req);
  const createdByMemberId = adminMemberId(req);
  const createdByUserId = userObjectId(req.user);

  return {
    member_id: createdByMemberId,
    created_by_admin_id: createdByAdminId,
    admin_id: createdByAdminId,
    tenant_id: createdByAdminId,
    created_by_user_id: createdByUserId,
    created_by_member_id: createdByMemberId,
    created_by_name: fullName(req.user) || req.user?.email || '',
    created_by_role: isAdminUser(req.user) ? 'admin' : 'member'
  };
};

const ownerQuery = (req = {}) => ({
  created_by_admin_id: adminOwnerId(req)
});

const ownedByActorQuery = (req = {}) => ({
  $or: [
    { created_by_user_id: userObjectId(req.user) },
    { member_id: adminMemberId(req) }
  ]
});

const ownerOrLegacyMemberQuery = (req = {}) => ({
  $or: [
    ownerQuery(req),
    { tenant_id: adminOwnerId(req) },
    { admin_id: adminOwnerId(req) },
    { member_id: adminMemberId(req) }
  ]
});

const isAdminRequest = (req = {}) => String(req.originalUrl || req.baseUrl || '').startsWith('/api/admin');

const requireMemberOrAdmin = (req, res, next) => {
  if (req.user?._id || req.user?.member_id) {
    return next();
  }

  return res.status(401).json({
    status: 401,
    message: 'Unauthorized: Member or admin token required',
    data: []
  });
};

module.exports = {
  adminMemberId,
  adminOwnerId,
  isAdminRequest,
  isAdminUser,
  ownedByActorQuery,
  ownerFields,
  ownerOrLegacyMemberQuery,
  ownerQuery,
  requireMemberOrAdmin,
  userObjectId
};
