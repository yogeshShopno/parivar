const Post = require('../models/postModel');
const Event = require('../models/eventModel');
const Festival = require('../models/festivalModel');
const Gallery = require('../models/galleryModel');
const User = require('../models/userModels');
const { apiResponse, fullName, memberPublicId, publicUrl, toArchiveDate } = require('../utils/apiResponse');

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const currentMemberId = (req) => memberPublicId(req.user || {});

const getHome = async (req, res) => {
  return apiResponse(res, 200, 'Home Data fetch successful', {
    banner: []
  });
};

const getGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ _id: -1 }).lean();
    const byYear = new Map();

    images.forEach((item) => {
      const year = String(item.year || new Date(item.createdAt || Date.now()).getFullYear());
      const categoryId = String(item.gallery_category_id || item.category_id || item.category || 'General');
      const categoryName = item.event_category || item.category_name || item.category || 'General';

      if (!byYear.has(year)) {
        byYear.set(year, {
          year,
          categories: new Map()
        });
      }

      const yearGroup = byYear.get(year);
      if (!yearGroup.categories.has(categoryId)) {
        yearGroup.categories.set(categoryId, {
          gallery_category_id: categoryId,
          category_name: categoryName,
          images: []
        });
      }

      yearGroup.categories.get(categoryId).images.push({
        id: item.id || String(item._id),
        image: publicUrl(req, item.image || '')
      });
    });

    const data = Array.from(byYear.values()).map((yearGroup) => ({
      year: yearGroup.year,
      categories: Array.from(yearGroup.categories.values())
    }));

    return apiResponse(res, 200, 'Gallery Data fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving gallery', { error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ _id: -1 }).lean();
    const data = events.map((event) => ({
      id: event.id || String(event._id),
      event_category_id: event.event_category_id || '',
      event_category_name: event.event_category_name || event.category || '',
      event_name: event.event_name || event.title || '',
      event_location: event.event_location || event.venue || '',
      location_link: event.location_link || '',
      event_date: toArchiveDate(event.event_date || event.date),
      timing: `${toArchiveDate(event.start_time || event.event_date || event.date)} - ${toArchiveDate(event.end_time || event.event_date || event.date)}`,
      entry_type: event.entry_type || '',
      event_description: event.event_description || event.description || '',
      image: publicUrl(req, event.image || '')
    }));

    return apiResponse(res, 200, 'Events Data fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving events', { error: error.message });
  }
};

const getFestivals = async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ _id: -1 }).lean();
    const data = festivals.map((festival) => ({
      id: festival.id || String(festival._id),
      festival_name: festival.festival_name || festival.title || '',
      festival_date: festival.festival_date || festival.date || '',
      button_name: festival.button_name || '',
      button_link: festival.button_link || '',
      festival_description: festival.festival_description || festival.description || '',
      image: publicUrl(req, festival.image || '')
    }));

    return apiResponse(res, 200, 'Festivals Data fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving festivals', { error: error.message });
  }
};

const findPostByRequestId = (id) => {
  return Post.findOne({
    $or: [
      { id: String(id) },
      { _id: String(id).match(/^[a-f\d]{24}$/i) ? id : undefined }
    ].filter((condition) => Object.values(condition)[0] !== undefined)
  });
};

const addPost = async (req, res) => {
  try {
    const { id, title, description } = requestData(req);

    if (!title || !description) {
      return apiResponse(res, 401, 'All data required');
    }

    const postData = {
      member_id: currentMemberId(req),
      title,
      description,
      status: 1
    };

    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }

    if (id) {
      const existing = await findPostByRequestId(id);

      if (!existing) {
        return apiResponse(res, 401, 'Invalid edit');
      }

      Object.assign(existing, postData);
      await existing.save();
      return apiResponse(res, 200, 'Post update successfully', []);
    }

    postData.cdate = new Date().toISOString().slice(0, 10);
    await Post.create(postData);

    return apiResponse(res, 200, 'Post add successfully', []);
  } catch (error) {
    return apiResponse(res, 500, 'Error creating post', { error: error.message });
  }
};

const getAllPostList = async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { status: 2 },
        { status: { $exists: false } }
      ]
    }).sort({ _id: -1 }).lean();
    const memberIds = [...new Set(posts.map((post) => String(post.member_id || '')).filter(Boolean))];
    const members = await User.find({ member_id: { $in: memberIds } }).select('-password').lean();
    const memberMap = new Map(members.map((member) => [String(member.member_id), member]));
    const ownId = currentMemberId(req);

    const data = posts.map((post) => {
      const member = memberMap.get(String(post.member_id)) || {};

      return {
        id: post.id || String(post._id),
        member_id: post.member_id || '',
        title: post.title || '',
        description: post.description || '',
        image: publicUrl(req, post.image || ''),
        date: post.cdate || (post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 10) : ''),
        member_name: fullName(member),
        member_number: member.number || '',
        is_own: String(ownId) === String(post.member_id)
      };
    });

    return apiResponse(res, 200, 'Posts fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving posts', { error: error.message });
  }
};

module.exports = {
  getHome,
  getGallery,
  getEvents,
  getFestivals,
  addPost,
  getAllPostList
};
