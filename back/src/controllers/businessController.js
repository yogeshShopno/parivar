const Business = require('../models/businessModel');
const BusinessCategory = require('../models/businessCategoryModel');
const User = require('../models/userModels');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');
const { apiResponse,  memberPublicId,} = require('../utils/apiResponse');

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

const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({}).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Businesses retrieved successfully', businesses.map(b => ({
      id: b.id || String(b._id),
      member_id: b.member_id || '',
      business_name: b.business_name || '',
      business_category_id: b.business_category_id || '',
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
      website: b.website || '',
      profile_image: b.profile_image || '',
      gallery_images: b.gallery_images || [],
      status: b.status !== undefined ? Number(b.status) : 1,

    })));
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

    return apiResponse(res, 200, 'Business retrieved successfully', {
      id: business.id || String(business._id),
      member_id: business.member_id || '',
      business_name: business.business_name || '',
      business_category_id: business.business_category_id || '',
      number: business.number || '',
      whatsapp_number: business.whatsapp_number || '',
      GST_number: business.GST_number || '',
      email: business.email || '',
      country_id: business.country_id || '',
      state_id: business.state_id || '',
      city_id: business.city_id || '',
      address: business.address || '',
      location_link: business.location_link || '',
      about_us: business.about_us || '',
      facebook: business.facebook || '',
      instagram: business.instagram || '',
      pinterest: business.pinterest || '',
      youtube: business.youtube || '',
      website: business.website || '',
      profile_image: business.profile_image || '',
      gallery_images: business.gallery_images || [],
      status: business.status !== undefined ? Number(business.status) : 1,
    });
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving business', { error: error.message });
  }
};




const getBusinessCategoryList = async (req, res) => {
  try {
    const query = req.user ? ownerOrLegacyMemberQuery(req) : {};
    const categories = await BusinessCategory.find(query).sort({ _id: -1 }).lean();
    const data = categories.map((category) => ({
      id: category.id || String(category._id),
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
  try {
    const { id } = req.params || req.body;
    const { business_category_id, business_name, number, whatsapp_number, GST_number, email, country_id, state_id, city_id, address, location_link, about_us, facebook, instagram, pinterest, youtube, website, status } = requestData(req);

    if (!business_category_id || !business_name || !number || !email || !country_id || !state_id || !city_id || !address) {
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
      website: website || ''
    };

    // Handle profile image
    const profilePath = uploadedPath(req, 'profile_image');
    if (profilePath) businessData.profile_image = profilePath;

    // Handle gallery images
    const galleryImages = [];
    for (let i = 1; i <= 5; i++) {
      const path = uploadedPath(req, `gallery_image_${i}`);
      if (path) galleryImages.push(path);
    }
    if (galleryImages.length > 0) businessData.gallery_images = galleryImages;

    if (business) {
      // Update
      business.set(businessData);
      if (status !== undefined) business.status = Number(status);
      await business.save();
      return apiResponse(res, 200, 'Business updated successfully', []);
    }

    // Create
    businessData.id = `BUS${Date.now()}`;
    businessData.member_id = currentMemberId;
    businessData.status = Number(status ?? 1);
    businessData.cdate = new Date().toISOString().slice(0, 10);
    
    await Business.create(businessData);
    return apiResponse(res, 201, 'Business created successfully', []);
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