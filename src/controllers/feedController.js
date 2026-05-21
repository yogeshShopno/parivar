const Post = require('../models/postModel');
const Event = require('../models/eventModel');
const Festival = require('../models/festivalModel');
const Gallery = require('../models/galleryModel');
const User = require('../models/userModels');
const mongoose = require('mongoose');

const findPostByRequestId = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Post.findOne({ $or: [{ _id: id }, { id }] });
  }

  return Post.findOne({ id });
};

// 1. POST /home - Home feed: aggregates latest posts, events, festivals
const getHome = async (req, res) => {
  try {
    const [latestPosts, upcomingEvents, upcomingFestivals, totalMembers] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).limit(10),
      Event.find().sort({ event_date: 1 }).limit(5),
      Festival.find().sort({ date: 1 }).limit(5),
      User.countDocuments()
    ]);

    res.status(200).json({
      message: 'Home data retrieved successfully',
      data: {
        total_members: totalMembers,
        latest_posts: latestPosts,
        upcoming_events: upcomingEvents,
        upcoming_festivals: upcomingFestivals
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving home data', error: error.message });
  }
};

// 2. POST /gallery - Retrieve all gallery images
const getGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Gallery retrieved successfully',
      data: images
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving gallery', error: error.message });
  }
};

// 3. POST /events - Retrieve all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ event_date: -1 });
    res.status(200).json({
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving events', error: error.message });
  }
};

// 4. POST /festivals - Retrieve all festivals
const getFestivals = async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ date: -1 });
    res.status(200).json({
      message: 'Festivals retrieved successfully',
      data: festivals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving festivals', error: error.message });
  }
};

// 5. POST /add_post - Create a new post (with optional image upload)
const addPost = async (req, res) => {
  try {
    const { id, title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // If id is provided, update existing post
    if (id) {
      const existing = await findPostByRequestId(id);
      if (!existing) {
        return res.status(404).json({ message: 'Post not found' });
      }
      existing.title = title || existing.title;
      existing.description = description || existing.description;
      if (imagePath) existing.image = imagePath;
      await existing.save();

      return res.status(200).json({
        message: 'Post updated successfully',
        data: existing
      });
    }

    // Derive member_id from authenticated user
    const member_id = req.user ? req.user.member_id : '';

    const newPost = new Post({
      member_id,
      title,
      description,
      image: imagePath
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// 6. POST /all_post_list - Retrieve all posts
const getAllPostList = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Posts retrieved successfully',
      data: posts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving posts', error: error.message });
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
