const Business = require('../models/businessModel');
const BusinessCategory = require('../models/businessCategoryModel');
const User = require('../models/userModels');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');
const { apiResponse, fullName, memberPublicId, publicUrl } = require('../utils/apiResponse');
const { ownedByActorQuery, ownerFields, ownerOrLegacyMemberQuery, initialStatus } = require('../utils/ownership');

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const currentMemberId = (req) => memberPublicId(req.user || {});

const tenantStatusQuery = () => ({
  $or: [
    { status: 2 },
    { status: 1 },
    { status: { $exists: false } }
  ]
});

const findBusinessByRequestId = (req, id) => {
  return Business.findOne({
    $and: [
      ownedByActorQuery(req),
      {
        $or: [
          { id: String(id) },
          { _id: String(id).match(/^[a-f\d]{24}$/i) ? id : undefined }
        ].filter((condition) => Object.values(condition)[0] !== undefined)
      }
    ]
  });
};

const getBusinessCategoryList = async (req, res) => {
  try {
    const categories = await BusinessCategory.find(ownerOrLegacyMemberQuery(req)).sort({ _id: -1 }).lean();
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
    const {
      id,
      business_category_id,
      business_name,
      number,
      country_id,
      state_id,
      city_id,
      address,
      location_link,
      number_2,
      about_us,
      facebook,
      instagram,
      pinterest,
      youtube,
      website
    } = requestData(req);

    if (!business_category_id || !business_name || !number || !country_id || !state_id || !city_id || !address || !location_link) {
      return apiResponse(res, 401, 'All data required');
    }

    const businessData = {
      member_id: currentMemberId(req),
      business_category_id,
      business_name,
      number,
      country_id,
      state_id,
      city_id,
      address,
      location_link,
      number_2: number_2 || '',
      about_us: about_us || '',
      facebook: facebook || '',
      instagram: instagram || '',
      pinterest: pinterest || '',
      youtube: youtube || '',
      website: website || '',
      ...ownerFields(req)
    };
    
    if (!id) {
      businessData.status = req.body.status !== undefined ? Number(req.body.status) : initialStatus(req);
    } else if (req.body.status !== undefined) {
      businessData.status = Number(req.body.status);
    }

    ['image', 'gallery_image_1', 'gallery_image_2', 'gallery_image_3', 'gallery_image_4', 'gallery_image_5'].forEach((field) => {
      const path = uploadedPath(req, field);
      if (path) {
        businessData[field] = path;
      }
    });

    if (id) {
      const existing = await findBusinessByRequestId(req, id);

      if (!existing) {
        return apiResponse(res, 401, 'Invalid edit');
      }

      existing.set(businessData);
      await existing.save();
      return apiResponse(res, 200, 'Business data update successfully', []);
    }

    businessData.cdate = new Date().toISOString().slice(0, 10);
    await Business.create(businessData);

    return apiResponse(res, 200, 'Business data add successfully', []);
  } catch (error) {
    return apiResponse(res, 500, 'Error adding business details', { error: error.message });
  }
};

const getBusinessDetailsList = async (req, res) => {
  try {
    const businesses = await Business.find({
      $and: [
        ownerOrLegacyMemberQuery(req),
        tenantStatusQuery()
      ]
    }).sort({ _id: -1 }).lean();
    const memberIds = [...new Set(businesses.map((item) => String(item.member_id || '')).filter(Boolean))];
    const categoryIds = [...new Set(businesses.map((item) => String(item.business_category_id || '')).filter(Boolean))];
    const countryIds = [...new Set(businesses.map((item) => String(item.country_id || '')).filter(Boolean))];
    const stateIds = [...new Set(businesses.map((item) => String(item.state_id || '')).filter(Boolean))];
    const cityIds = [...new Set(businesses.map((item) => String(item.city_id || '')).filter(Boolean))];

    const [members, categories, countries, states, cities] = await Promise.all([
      User.find({ $and: [ownerOrLegacyMemberQuery(req), { member_id: { $in: memberIds } }] }).select('-password').lean(),
      BusinessCategory.find({ $and: [ownerOrLegacyMemberQuery(req), { id: { $in: categoryIds } }] }).lean(),
      Country.find({ $and: [ownerOrLegacyMemberQuery(req), { id: { $in: countryIds } }] }).lean(),
      State.find({ $and: [ownerOrLegacyMemberQuery(req), { id: { $in: stateIds } }] }).lean(),
      City.find({ $and: [ownerOrLegacyMemberQuery(req), { id: { $in: cityIds } }] }).lean()
    ]);

    const memberMap = new Map(members.map((item) => [String(item.member_id), item]));
    const categoryMap = new Map(categories.map((item) => [String(item.id || item._id), item]));
    const countryMap = new Map(countries.map((item) => [String(item.id || item._id), item]));
    const stateMap = new Map(states.map((item) => [String(item.id || item._id), item]));
    const cityMap = new Map(cities.map((item) => [String(item.id || item._id), item]));
    const ownId = currentMemberId(req);

    const data = businesses.map((business) => {
      const member = memberMap.get(String(business.member_id)) || {};
      const category = categoryMap.get(String(business.business_category_id)) || {};
      const country = countryMap.get(String(business.country_id)) || {};
      const state = stateMap.get(String(business.state_id)) || {};
      const city = cityMap.get(String(business.city_id)) || {};

      return {
        id: business.id || String(business._id),
        member_id: business.member_id || '',
        business_category_id: business.business_category_id || '',
        business_name: business.business_name || '',
        number: business.number || '',
        country_id: business.country_id || '',
        state_id: business.state_id || '',
        city_id: business.city_id || '',
        address: business.address || '',
        location_link: business.location_link || '',
        image: publicUrl(req, business.image || ''),
        member_name: fullName(member),
        member_number: member.number || '',
        business_category_name: category.business || category.name || '',
        country_name: country.country || country.name || '',
        state_name: state.state || state.name || '',
        city_name: city.city || city.name || '',
        number_2: business.number_2 || '',
        about_us: business.about_us || '',
        facebook: business.facebook || '',
        instagram: business.instagram || '',
        pinterest: business.pinterest || '',
        youtube: business.youtube || '',
        website: business.website || '',
        gallery_image_1: publicUrl(req, business.gallery_image_1 || business.gallery_images?.[0] || ''),
        gallery_image_2: publicUrl(req, business.gallery_image_2 || business.gallery_images?.[1] || ''),
        gallery_image_3: publicUrl(req, business.gallery_image_3 || business.gallery_images?.[2] || ''),
        gallery_image_4: publicUrl(req, business.gallery_image_4 || business.gallery_images?.[3] || ''),
        gallery_image_5: publicUrl(req, business.gallery_image_5 || business.gallery_images?.[4] || ''),
        is_own: String(ownId) === String(business.member_id)
      };
    });

    return apiResponse(res, 200, 'Business Data fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving business directory', { error: error.message });
  }
};

module.exports = {
  getBusinessCategoryList,
  addBusinessDetails,
  getBusinessDetailsList
};
