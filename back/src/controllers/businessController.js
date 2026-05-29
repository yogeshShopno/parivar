const Business = require('../models/businessModel');
const BusinessCategory = require('../models/businessCategoryModel');
const User = require('../models/userModels');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');
const { apiResponse, memberPublicId, publicUrl } = require('../utils/apiResponse');

const requestData = (req) => ({
  ...req.query,
  ...req.body
});


const findBusinessByRequestId = (req, id) => {
  return Business.findOne({
    $or: [
      { id: String(id) },
      { _id: id.match(/^[a-f\d]{24}$/i) ? id : null }
    ]
  });
};
const formatBusiness = (req, b, categoryName = 'Community Enterprise') => ({
  id: String(b._id),
  member_id: b.member_id || '',
  business_name: b.business_name || '',
  business_category_id: b.business_category_id || '',
  business_category_name: categoryName,
  number: b.number || '',
  whatsapp_number: b.whatsapp_number || '',
  GST_number: b.GST_number || '',
  email: b.email || '',
  country_id: b.country_id || '',
  state_id: b.state_id || '',
  city_id: b.city_id || '',
  address: b.address || '',
  location_link: b.location_link || '',
  about_us: b.about_us || '',
  facebook: b.facebook || '',
  instagram: b.instagram || '',
  pinterest: b.pinterest || '',
  youtube: b.youtube || '',
  website: b.website || '',
  image: publicUrl(req, b.image || ''),
  gallery_images: (b.gallery_images || []).map(img => publicUrl(req, img)),
  status: b.status !== undefined ? Number(b.status) : 1,
});

const getBusinesses = async (req, res) => {
  try {
    const [businesses, categories] = await Promise.all([
      Business.find({}).sort({ _id: -1 }).lean(),
      BusinessCategory.find({}).lean()
    ]);

    const categoryMap = new Map();
    categories.forEach(c => {
      if (c._id) categoryMap.set(String(c._id), c.business || c.name || '');
      if (c.id) categoryMap.set(String(c.id), c.business || c.name || '');
    });

    return apiResponse(res, 200, 'Businesses retrieved successfully', businesses.map(b => {
      const categoryName = categoryMap.get(String(b.business_category_id)) || 'Community Enterprise';
      return formatBusiness(req, b, categoryName);
    }));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving businesses', { error: error.message });
  }
};


const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await findBusinessByRequestId(req, id);
    if (!business) {
      return apiResponse(res, 404, 'Business not found');
    }

    const category = await BusinessCategory.findOne({
      $or: [
        { id: String(business.business_category_id) },
        ...(require('mongoose').isValidObjectId(business.business_category_id) ? [{ _id: business.business_category_id }] : [])
      ]
    }).lean();

    const categoryName = category ? (category.business || category.name || '') : 'Community Enterprise';
    return apiResponse(res, 200, 'Business retrieved successfully', formatBusiness(req, business, categoryName));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving business', { error: error.message });
  }
};


const getBusinessCategoryList = async (req, res) => {
  try {
    const query = req.user ? ownerOrLegacyMemberQuery(req) : {};
    const categories = await BusinessCategory.find(query).sort({ _id: -1 }).lean();
    const data = categories.map((category) => ({
      id: String(category._id),
      business: category.business || category.name || ''
    }));

    return apiResponse(res, 200, 'Business category data fetch successfully', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving business categories', { error: error.message });
  }
};

const uploadedPath = (req, field) => {
  const file = req.files?.[field]?.[0];
  return file ? `/uploads/${file.filename}` : '';
};

const addBusinessDetails = async (req, res) => {
  console.log('Received business details request:', {
    body: req.body,
   
  });
  try {
    const { id } = req.params || req.body;
    const { business_category_id, business_name, number, whatsapp_number, GST_number, email, country_id, state_id, city_id, address, location_link, about_us, facebook, instagram, pinterest, youtube, website, image, gallery_images, status, } = requestData(req);

    if (!business_category_id || !business_name || !number || !email || !country_id || !state_id || !city_id) {
      return apiResponse(res, 400, 'All required fields must be provided');
    }

    const currentMemberId = memberPublicId(req.user || {});
    const isAdmin = req.user?.role === 'admin'; // Adjust based on your auth structure

    let business = null;

    if (id) {
      business = await findBusinessByRequestId(req, id);
      if (!business) {
        return apiResponse(res, 404, 'Business not found');
      }

      // Authorization check
      if (!isAdmin && business.member_id !== currentMemberId) {
        return apiResponse(res, 403, 'Unauthorized - You can only edit your own business');
      }
    }

    const businessData = {
      business_category_id,
      business_name,
      number,
      whatsapp_number: whatsapp_number || '',
      GST_number: GST_number || '',
      email,
      country_id,
      state_id,
      city_id,
      address,
      location_link: location_link || '',
      about_us: about_us || '',
      facebook: facebook || '',
      instagram: instagram || '',
      pinterest: pinterest || '',
      youtube: youtube || '',
      website: website || '',

    };

    // Handle profile image
    let profilePath = '';
    const uploadedProfile = uploadedPath(req, 'image');
    if (uploadedProfile) {
      profilePath = uploadedProfile;
    } else if (req.body.existing_image !== undefined) {
      const text = String(req.body.existing_image);
      const uploadIndex = text.indexOf('/uploads/');
      profilePath = uploadIndex >= 0 ? text.slice(uploadIndex) : text;
    } else if (business) {
      profilePath = business.image || '';
    }
    businessData.image = profilePath;

    // Handle gallery images
    let finalGalleryImages = [];
    
    // 1. Get existing images that were kept
    if (req.body.existing_images !== undefined) {
      const norm = (Array.isArray(req.body.existing_images) 
        ? req.body.existing_images 
        : [req.body.existing_images]
      ).filter(Boolean);
      
      finalGalleryImages = norm.map(img => {
        const text = String(img);
        const uploadIndex = text.indexOf('/uploads/');
        return uploadIndex >= 0 ? text.slice(uploadIndex) : text;
      });
    } else if (business) {
      finalGalleryImages = business.gallery_images || [];
    }

    // 2. Add any newly uploaded gallery images
    for (let i = 1; i <= 5; i++) {
      const path = uploadedPath(req, `gallery_image_${i}`);
      if (path) finalGalleryImages.push(path);
    }
    
    businessData.gallery_images = finalGalleryImages;

    if (business) {
      // Update
      business.set(businessData);
      if (status !== undefined) business.status = Number(status);
      await business.save();

      const category = await BusinessCategory.findOne({
        $or: [
          { id: String(business.business_category_id) },
          ...(require('mongoose').isValidObjectId(business.business_category_id) ? [{ _id: business.business_category_id }] : [])
        ]
      }).lean();

      const categoryName = category ? (category.business || category.name || '') : 'Community Enterprise';
      return apiResponse(res, 200, 'Business updated successfully', formatBusiness(req, business, categoryName));
    }

    // Create
    businessData.id = `BUS${Date.now()}`;
    businessData.member_id = currentMemberId;
    businessData.status = Number(status ?? 1);
    businessData.cdate = new Date().toISOString().slice(0, 10);

    const doc = await Business.create(businessData);
    
    const category = await BusinessCategory.findOne({
      $or: [
        { id: String(doc.business_category_id) },
        ...(require('mongoose').isValidObjectId(doc.business_category_id) ? [{ _id: doc.business_category_id }] : [])
      ]
    }).lean();

    const categoryName = category ? (category.business || category.name || '') : 'Community Enterprise';
    return apiResponse(res, 201, 'Business created successfully', formatBusiness(req, doc, categoryName));
  } catch (error) {
    return apiResponse(res, 500, 'Error saving business', { error: error.message });
  }
};


const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await findBusinessByRequestId(req, id);

    if (!business) {
      return apiResponse(res, 404, 'Business not found');
    }

    await Business.deleteOne({ _id: business._id });
    return apiResponse(res, 200, 'Business deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting business', { error: error.message });
  }
};


module.exports = {
  addBusinessDetails,
  getBusinesses,
  getBusinessById,
  getBusinessCategoryList,
  deleteBusiness,
};