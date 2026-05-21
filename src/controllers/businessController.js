const Business = require('../models/businessModel');
const BusinessCategory = require('../models/businessCategoryModel');
const mongoose = require('mongoose');

const findBusinessByRequestId = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Business.findOne({ $or: [{ _id: id }, { id }] });
  }

  return Business.findOne({ id });
};

// 1. POST /business_category_list - Retrieve all business categories
const getBusinessCategoryList = async (req, res) => {
  try {
    const { state_id } = req.body;
    const query = state_id ? { state_id } : {};
    const categories = await BusinessCategory.find(query);
    res.status(200).json({
      message: 'Business categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving business categories', error: error.message });
  }
};

// 2. POST /add_business_details - Create or update a business listing
const addBusinessDetails = async (req, res) => {
  try {
    const {
      id, business_category_id, business_name, number, number_2,
      country_id, state_id, city_id, address, location_link,
      about_us, facebook, instagram, pinterest, youtube, website
    } = req.body;

    // Build the primary image path from uploaded file
    let imagePath = '';
    if (req.files && req.files['image'] && req.files['image'][0]) {
      imagePath = `/uploads/${req.files['image'][0].filename}`;
    }

    // Build gallery image paths
    const galleryImages = [];
    for (let i = 1; i <= 5; i++) {
      const fieldName = `gallery_image_${i}`;
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        galleryImages.push(`/uploads/${req.files[fieldName][0].filename}`);
      }
    }

    // If id is provided, update existing business; otherwise create new
    if (id) {
      const existing = await findBusinessByRequestId(id);
      if (!existing) {
        return res.status(404).json({ message: 'Business not found' });
      }

      // Update fields
      existing.business_category_id = business_category_id || existing.business_category_id;
      existing.business_name = business_name || existing.business_name;
      existing.number = number || existing.number;
      existing.number_2 = number_2 || existing.number_2;
      existing.country_id = country_id || existing.country_id;
      existing.state_id = state_id || existing.state_id;
      existing.city_id = city_id || existing.city_id;
      existing.address = address || existing.address;
      existing.location_link = location_link || existing.location_link;
      existing.about_us = about_us || existing.about_us;
      existing.facebook = facebook || existing.facebook;
      existing.instagram = instagram || existing.instagram;
      existing.pinterest = pinterest || existing.pinterest;
      existing.youtube = youtube || existing.youtube;
      existing.website = website || existing.website;
      if (imagePath) existing.image = imagePath;
      if (galleryImages.length > 0) existing.gallery_images = galleryImages;

      await existing.save();

      return res.status(200).json({
        message: 'Business updated successfully',
        data: existing
      });
    }

    // Create new business entry
    // Derive member_id from the authenticated user token
    const member_id = req.user ? req.user.member_id : req.body.member_id || '';

    const newBusiness = new Business({
      member_id,
      business_category_id,
      business_name,
      number,
      number_2: number_2 || '',
      country_id,
      state_id,
      city_id,
      address,
      location_link: location_link || '',
      image: imagePath,
      about_us: about_us || '',
      facebook: facebook || '',
      instagram: instagram || '',
      pinterest: pinterest || '',
      youtube: youtube || '',
      website: website || '',
      gallery_images: galleryImages
    });

    await newBusiness.save();

    res.status(201).json({
      message: 'Business registered successfully',
      data: newBusiness
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding business details', error: error.message });
  }
};

// 3. POST /business_details_list - List all businesses
const getBusinessDetailsList = async (req, res) => {
  try {
    const { member_id, business_category_id, country_id, state_id, city_id } = req.body;
    const query = {};

    if (member_id) query.member_id = member_id;
    if (business_category_id) query.business_category_id = business_category_id;
    if (country_id) query.country_id = country_id;
    if (state_id) query.state_id = state_id;
    if (city_id) query.city_id = city_id;

    const businesses = await Business.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Business directory retrieved successfully',
      data: businesses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving business directory', error: error.message });
  }
};

module.exports = {
  getBusinessCategoryList,
  addBusinessDetails,
  getBusinessDetailsList
};
