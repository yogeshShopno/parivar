const mongoose = require('mongoose');
const Post = require('../models/postModel');
const User = require('../models/userModels');
const { apiResponse, fullName, memberPublicId, publicUrl } = require('../utils/apiResponse');
const { adminMemberId } = require('../utils/ownership');

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  return req.body.image || fallback || '';
};

const currentMemberId = (req) => memberPublicId(req.user || {});

const tenantStatusQuery = () => ({
  $or: [
    { status: 2 },
    { status: 1 },
    { status: { $exists: false } }
  ]
});

const getPosts = async (req, res) => {
  try {
    const isCommitteeOrAdmin = req.user && (req.user.is_committee || req.user.role === 'admin' || req.user.relation === 'Self');
    let posts;
    let ownId = currentMemberId(req);

    if (isCommitteeOrAdmin) {
      // Admin sees all posts in their tenant
      posts = await Post.find({}).sort({ createdAt: -1, _id: -1 }).lean();
    } else {
      // Members see approved posts or their own pending posts
      posts = await Post.find({
        $and: [
          {
            $or: [
              tenantStatusQuery(),
              { member_id: ownId }
            ]
          }
        ]
      }).sort({ createdAt: -1, _id: -1 }).lean();
    }

    const memberIds = [...new Set(posts.map((post) => String(post.member_id || '')).filter(Boolean))];
    const members = await User.find({
      $and: [
        { member_id: { $in: memberIds } }
      ]
    }).select('-password').lean();

    const memberMap = new Map(members.map((member) => [String(member.member_id), member]));

    const data = posts.map((post) => {
      const member = memberMap.get(String(post.member_id)) || {};

      return {
        id: post._id || String(post._id),
        member_id: post.member_id || '',
        title: post.title || '',
        description: post.description || '',
        image: publicUrl(req, post.image || ''),
        cdate: post.cdate || (post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 10) : ''),
        date: post.cdate || (post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 10) : ''),
        member_name: fullName(member),
        member_number: member.number || '',
        status: Number(post.status ?? 1),
        is_own: String(ownId) === String(post.member_id)
      };
    });

    return apiResponse(res, 200, 'Posts retrieved successfully', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving posts', { error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    const post = await Post.findOne(
      mongoose.isValidObjectId(id) ? { _id: id } : { id: String(id) }
    ).lean();

    if (!post) {
      return apiResponse(res, 404, 'Post not found');
    }

    return apiResponse(res, 200, 'Post retrieved successfully', {
      _id: post._id || '',  // ← Add this line
      title: post.title || '',
      description: post.description || '',
      image: publicUrl(req, post.image || ''),
      cdate: post.cdate || '',
      status: Number(post.status ?? 1)
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving post', { error: error.message });
  }
};

const savePost = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    const { title, description } = req.body;
    let status = req.body.status;

    if (!title || !description) {
      return apiResponse(res, 400, 'Post title and description are required');
    }

    const existing = id
      ? await Post.findOne({
        $or: [{ id: String(id) }, { _id: mongoose.isValidObjectId(id) ? id : undefined }]
      })
      : null;

    if (id && !existing) {
      return apiResponse(res, 404, 'Post not found or unauthorized');
    }

    const isCommitteeOrAdmin = req.user && (req.user.is_committee || req.user.role === 'admin' || req.user.relation === 'Self');
    const ownId = currentMemberId(req);

    // Only allow editing if admin or if the user owns the post
    if (existing && !isCommitteeOrAdmin && String(existing.member_id) !== String(ownId)) {
      return apiResponse(res, 403, 'Unauthorized to edit this post');
    }

    const post = existing || new Post({
      id: `POST${Date.now()}`,
      member_id: isCommitteeOrAdmin && !existing ? adminMemberId(req) : (existing ? existing.member_id : currentMemberId(req)),
      cdate: new Date().toISOString().slice(0, 10)
    });

    post.title = title;
    post.description = description;



    // Admin approval logic
    if (isCommitteeOrAdmin) {
      // Admins can set status, default to approved
      post.status = status !== undefined ? Number(status) : (existing ? existing.status : 1);
    }

    if (req.file || req.body.image) {
      post.image = imageFromRequest(req, post.image);
    }

    await post.save();

    return apiResponse(res, existing ? 200 : 201, 'Post saved successfully', {

      _id: post._id || String(post._id),
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
    const isCommitteeOrAdmin = req.user && (req.user.is_committee || req.user.role === 'admin' || req.user.relation === 'Self');
    const ownId = currentMemberId(req);

    // postController.js — deletePost
    const orConditions = [{ id: String(id) }];
    if (mongoose.isValidObjectId(id)) orConditions.push({ _id: id });
    const query = { $or: orConditions };
    if (!isCommitteeOrAdmin) query.member_id = ownId;

    // If not admin, can only delete own post
    if (!isCommitteeOrAdmin) {
      query.member_id = ownId;
    }

    const result = await Post.deleteOne(query);

    if (result.deletedCount === 0) {
      return apiResponse(res, 404, 'Post not found or unauthorized');
    }

    return apiResponse(res, 200, 'Post deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting post', { error: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  savePost,
  deletePost
};
