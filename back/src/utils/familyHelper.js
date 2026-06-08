const mongoose = require('mongoose');
const User = require('../models/userModels');

const fullName = (user = {}) => [user.first_name, user.middle_name, user.last_name]
  .filter(Boolean)
  .join(' ') || '';

const findUserByIdOrMemberId = async (id) => {
  if (!id) return null;

  const query = {};
  if (mongoose.isValidObjectId(id)) {
    query.$or = [{ _id: id }, { member_id: id }];
  } else {
    query.member_id = id;
  }

  return await User.findOne(query).lean();
};

const getFamilyHeadFromParent = async (parentUser) => {
  if (!parentUser) return null;
  if (parentUser.relation === 'Self') {
    return parentUser;
  }

  if (parentUser.family_head?.id) {
    return await findUserByIdOrMemberId(String(parentUser.family_head.id));
  }

  return null;
};

const resolveFamilyHead = async ({ relation, parent_member_id, family_head_id }) => {
  if (relation === 'Self') {
    return { family_head: null, family_code: null, parent_member_id: null, head: null };
  }

  let head = null;
  let parent = null;

  if (parent_member_id) {
    parent = await findUserByIdOrMemberId(parent_member_id);
    if (!parent) {
      throw new Error('Invalid parent_member_id');
    }

    head = await getFamilyHeadFromParent(parent);
    if (!head) {
      throw new Error('Unable to resolve family head from parent member');
    }
  }

  if (!head && family_head_id) {
    head = await findUserByIdOrMemberId(family_head_id);
    if (!head) {
      throw new Error('Invalid family_head_id');
    }
  }

  if (!head) {
    throw new Error('Family head information is required for non-self members');
  }

  if (Number(head.status ?? 0) !== 1) {
    throw new Error('Family head is not approved yet');
  }

  return {
    parent_member_id: parent ? parent.member_id : head.member_id,
    family_head: {
      id: head._id,
      name: fullName(head)
    },
    family_code: head.family_code || head.member_id || String(head._id),
    head
  };
};

const prepareFamilyFields = async (payload = {}, existing = {}) => {
  const relation = payload.relation || existing.relation || 'Self';
  const isSelf = relation === 'Self';
  const result = {
    relation,
    parent_member_id: existing.parent_member_id || null,
    family_head: existing.family_head || null,
    family_code: existing.family_code || null,
    status: existing.status !== undefined ? Number(existing.status) : undefined
  };

  if (isSelf) {
    if (payload.parent_member_id || payload.family_head_id) {
      throw new Error('Self relation cannot have a parent member or family head reference');
    }

    result.parent_member_id = null;
    result.family_head = null;
    result.family_code = existing.family_code || null;
    result.status = payload.status === undefined ? 0 : Number(payload.status);
    return result;
  }

  const headData = await resolveFamilyHead({
    relation,
    parent_member_id: payload.parent_member_id || result.parent_member_id,
    family_head_id: payload.family_head_id || existing.family_head?.id
  });

  result.parent_member_id = headData.parent_member_id;
  result.family_head = headData.family_head;
  result.family_code = headData.family_code;
  result.status = payload.status === undefined ? 1 : Number(payload.status);

  return result;
};

module.exports = {
  fullName,
  findUserByIdOrMemberId,
  resolveFamilyHead,
  prepareFamilyFields
};
