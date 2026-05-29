const User = require('../models/userModels');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');
const { apiResponse,  memberPublicId, publicUrl } = require('../utils/apiResponse');
const { ownerOrLegacyMemberQuery } = require('../utils/ownership');

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

const asName = (doc, key) => doc?.[key] || doc?.name || '';

const locationMaps = async (req) => {
  const [countries, states, cities] = await Promise.all([
    Country.find().lean(),
    State.find().lean(),
    City.find().lean()
  ]);

  return {
    countries: new Map(countries.map((item) => [String(item.id || item._id), item])),
    states: new Map(states.map((item) => [String(item.id || item._id), item])),
    cities: new Map(cities.map((item) => [String(item.id || item._id), item]))
  };
};

const memberRow = (req, member, maps = {}) => {
  const id = memberPublicId(member);
  const country = maps.countries?.get(String(member.country_id));
  const state = maps.states?.get(String(member.state_id));
  const city = maps.cities?.get(String(member.city_id));

  return {
    id,
    family_code: member.family_code || member.member_id || id,
    number: member.number || '',
    district_id: member.district_id || '',
    taluka_id: member.taluka_id || '',
    city_id: member.city_id || '',
    village_id: member.village_id || '',
    address: member.address || '',
    district_name: member.district_name || '',
    taluka_name: member.taluka_name || '',
    city_name: member.city_name || asName(city, 'city'),
    village_name: member.village_name || '',
    country_id: member.country_id || '',
    state_id: member.state_id || '',
    country_name: member.country_name || asName(country, 'country'),
    state_name: member.state_name || asName(state, 'state'),
    image: publicUrl(req, member.image || member.profile_image || '')
  };
};

const getMembers = async (req, res) => {
  try {
    const query = {
      $and: [
        ownerOrLegacyMemberQuery(req),
        {
          $or: [
            { parent_id: null },
            { parent_id: '' },
            { parent_member_id: null },
            { parent_member_id: '' },
            { relation: 'Self' }
          ]
        }
      ]
    };

    const members = await User.find(query).select('-password').sort({ _id: -1 }).lean();
    const maps = await locationMaps(req);

    return apiResponse(res, 200, 'Memebers Data fetch successful', members.map((member) => memberRow(req, member, maps)));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving directory', { error: error.message });
  }
};

const getFamilyMembers = async (req, res) => {
  try {
    const { member_id } = requestData(req);

    if (!member_id) {
      return apiResponse(res, 401, 'Invalid member');
    }

    const parent = await User.findOne({
      $and: [
        ownerOrLegacyMemberQuery(req),
        { member_id: String(member_id) }
      ]
    }).select('-password').lean();

    if (!parent) {
      return apiResponse(res, 401, 'Invalid member');
    }

    const family = await User.find({
      $and: [
        ownerOrLegacyMemberQuery(req),
        {
          $or: [
            { parent_id: String(member_id) },
            { parent_member_id: String(member_id) }
          ]
        }
      ]
    }).select('-password').sort({ _id: -1 }).lean();
    const maps = await locationMaps(req);

    return apiResponse(res, 200, 'Family Memeber Data fetch successful', family.map((member) => {
      const merged = {
        ...member,
        family_code: parent.family_code || parent.member_id,
        district_id: parent.district_id || '',
        taluka_id: parent.taluka_id || '',
        city_id: parent.city_id || '',
        village_id: parent.village_id || '',
        country_id: parent.country_id || '',
        state_id: parent.state_id || '',
        address: parent.address || ''
      };

      return memberRow(req, merged, maps);
    }));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving family tree', { error: error.message });
  }
};

const getcommitteeMembers = async (req, res) => {
  try {
    const committee = await User.find({
      $and: [
        ownerOrLegacyMemberQuery(req),
        {
          $or: [
            { is_committee: true },
            { role_id: { $ne: null }, status: 1 }
          ]
        }
      ]
    }).select('-password').sort({ _id: -1 }).lean();

    const data = committee.map((member) => ({
      id: memberPublicId(member),
      first_name: member.first_name || '',
      middle_name: member.middle_name || '',
      last_name: member.last_name || '',
      number: member.number || '',
      role: member.username || member.committee_role || '',
      designation: member.designation || '',
      image: publicUrl(req, member.signature || member.image || member.profile_image || '')
    }));

    return apiResponse(res, 200, 'committee Memeber Data fetch successful', data);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving committee', { error: error.message });
  }
};

const getCountryList = async (req, res) => {
  try {
    const countries = await Country.find(({})).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Country data fetch successfully', countries.map((country) => ({
      id: country.id || String(country._id),
      country: country.country || country.name || ''
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving countries', { error: error.message });
  }
};

const getStateList = async (req, res) => {
  try {
    const { country_id } = requestData(req);

    if (!country_id) {
      return apiResponse(res, 401, 'Country id is required');
    }

    const states = await State.find({
    
      country_id: String(country_id)
    }).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'State data fetch successfully', states.map((state) => ({
      id: state.id || String(state._id),
      state: state.state || state.name || ''
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving states', { error: error.message });
  }
};

const getCityList = async (req, res) => {
  try {
    const { state_id } = requestData(req);

    if (!state_id) {
      return apiResponse(res, 401, 'State id is required');
    }

    const cities = await City.find({

      state_id: String(state_id)
    }).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'City data fetch successfully', cities.map((city) => ({
      id: city.id || String(city._id),
      city: city.city || city.name || ''
    })));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving cities', { error: error.message });
  }
};

module.exports = {
  getMembers,
  getFamilyMembers,
  getcommitteeMembers,
  getCountryList,
  getStateList,
  getCityList
};
