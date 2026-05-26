const mongoose = require('mongoose');
const Festival = require('../models/festivalModel');
const Event = require('../models/eventModel');
const Gallery = require('../models/galleryModel');
const Banner = require('../models/bannerModel');
const ContactInquiry = require('../models/contactInquiryModel');
const BusinessCategory = require('../models/businessCategoryModel');
const newsModel = require('../models/newsModel');
const Country = require('../models/countryModel');
const State = require('../models/stateModel');
const City = require('../models/cityModel');
const Master = require('../models/masterModel');
const { apiResponse, publicUrl } = require('../utils/apiResponse');
const { ownerFields, ownerQuery, initialStatus } = require('../utils/ownership');

const isObjectId = (id) => mongoose.isValidObjectId(id);

const nextPublicId = async (Model, prefix = '') => {
  const count = await Model.countDocuments();
  return `${prefix}${Date.now()}${count}`;
};

const findById = (Model, id, extraQuery = {}) => Model.findOne({
  ...extraQuery,
  $or: [
    { id: String(id) },
    ...(isObjectId(id) ? [{ _id: id }] : [])
  ]
});

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  if (Array.isArray(req.body.images) && req.body.images[0]) return req.body.images[0];
  return req.body.image || req.body.image_url || fallback || '';
};

const listContent = (Model, formatter, label) => async (req, res) => {
  try {
    const rows = await Model.find(ownerQuery(req)).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, `${label} retrieved successfully`, rows.map((row) => formatter(req, row)));
  } catch (error) {
    return apiResponse(res, 500, `Error retrieving ${label.toLowerCase()}`, { error: error.message });
  }
};

const deleteContent = (Model, label) => async (req, res) => {
  try {
    const existing = await findById(Model, req.params.id, ownerQuery(req));
    if (!existing) return apiResponse(res, 404, `${label} not found`);
    await existing.deleteOne();
    return apiResponse(res, 200, `${label} deleted successfully`);
  } catch (error) {
    return apiResponse(res, 500, `Error deleting ${label.toLowerCase()}`, { error: error.message });
  }
};

const eventPayload = (req, existing = {}) => {
  const title = req.body.title || req.body.event_name || existing.title || existing.event_name || '';
  const description = req.body.description || req.body.event_description || existing.description || existing.event_description || '';
  return {
    ...req.body,
    title,
    description,
    event_name: req.body.event_name || title,
    event_description: req.body.event_description || description,
    venue: req.body.venue || req.body.event_location || existing.venue || '',
    event_location: req.body.event_location || req.body.venue || existing.event_location || '',
    image: imageFromRequest(req, existing.image)
  };
};

const festivalPayload = (req, existing = {}) => {
  const title = req.body.title || req.body.festival_name || existing.title || existing.festival_name || '';
  const description = req.body.description || req.body.festival_description || existing.description || existing.festival_description || '';
  return {
    ...req.body,
    title,
    description,
    festival_name: req.body.festival_name || title,
    festival_description: req.body.festival_description || description,
    image: imageFromRequest(req, existing.image)
  };
};

const galleryPayload = (req, existing = {}) => {
  const title = req.body.title || req.body.category || existing.title || existing.category || 'Gallery Image';
  return {
    ...req.body,
    title,
    image: imageFromRequest(req, existing.image),
    category: req.body.category || req.body.event_category || existing.category || 'General',
    event_category: req.body.event_category || req.body.category || existing.event_category || 'General'
  };
};

const bannerPayload = (req, existing = {}) => ({
  ...req.body,
  title: req.body.title || existing.title || '',
  subtitle: req.body.subtitle || existing.subtitle || '',
  image: imageFromRequest(req, existing.image),
  link: req.body.link || existing.link || ''
});

const saveContent = (Model, payloadBuilder, formatter, label, prefix) => async (req, res) => {
  try {
    const existing = req.params.id ? await findById(Model, req.params.id, ownerQuery(req)) : null;
    const payload = payloadBuilder(req, existing || {});

    if (!payload.title && ['Event', 'Festival', 'Gallery'].includes(label)) {
      return apiResponse(res, 400, `${label} title is required`);
    }

    if (!payload.description && ['Event', 'Festival'].includes(label)) {
      return apiResponse(res, 400, `${label} description is required`);
    }

    const hasGalleryImages = Array.isArray(req.body.images) && req.body.images.length > 0;

    if (!payload.image && label === 'Gallery' && !hasGalleryImages) {
      return apiResponse(res, 400, 'Gallery image is required');
    }

    if (label === 'Gallery' && !existing && hasGalleryImages) {
      const docs = await Promise.all(req.body.images.map(async (image, index) => {
        const doc = new Model({ id: await nextPublicId(Model, `${prefix}${index}_`) });
        const galleryDocPayload = { ...payload, ...ownerFields(req), image };
        delete galleryDocPayload.images;
        Object.assign(doc, galleryDocPayload);
        doc.status = initialStatus(req);
        await doc.save();
        return formatter(req, doc.toObject());
      }));

      return apiResponse(res, 201, 'Gallery saved successfully', docs);
    }

    const doc = existing || new Model({ id: await nextPublicId(Model, prefix) });
    delete payload.images;
    Object.assign(doc, payload, ownerFields(req));
    
    if (!existing) {
      doc.status = req.body.status !== undefined ? Number(req.body.status) : initialStatus(req);
    } else if (req.body.status !== undefined) {
      doc.status = Number(req.body.status);
    }
    
    await doc.save();

    return apiResponse(res, existing ? 200 : 201, `${label} saved successfully`, formatter(req, doc.toObject()));
  } catch (error) {
    return apiResponse(res, 500, `Error saving ${label.toLowerCase()}`, { error: error.message });
  }
};

const formatEvent = (req, item) => ({
  id: item.id || String(item._id),
  title: item.title || item.event_name || '',
  description: item.description || item.event_description || '',
  event_category_id: item.event_category_id || '',
  event_category_name: item.event_category_name || '',
  event_name: item.event_name || item.title || '',
  event_location: item.event_location || item.venue || '',
  location_link: item.location_link || '',
  event_date: item.event_date || item.date || '',
  start_time: item.start_time || '',
  end_time: item.end_time || '',
  entry_type: item.entry_type || '',
  status: Number(item.status ?? 1),
  image: publicUrl(req, item.image || '')
});

const formatFestival = (req, item) => ({
  id: item.id || String(item._id),
  title: item.title || item.festival_name || '',
  description: item.description || item.festival_description || '',
  festival_name: item.festival_name || item.title || '',
  festival_date: item.festival_date || item.date || '',
  button_name: item.button_name || '',
  button_link: item.button_link || '',
  status: Number(item.status ?? 1),
  image: publicUrl(req, item.image || '')
});

const formatGallery = (req, item) => ({
  id: item.id || String(item._id),
  title: item.title || '',
  description: item.description || '',
  category: item.category || item.event_category || 'General',
  year: item.year || '',
  gallery_category_id: item.gallery_category_id || '',
  event_category: item.event_category || item.category || 'General',
  status: Number(item.status ?? 1),
  image: publicUrl(req, item.image || '')
});

const formatBanner = (req, item) => ({
  id: item.id || String(item._id),
  title: item.title || '',
  subtitle: item.subtitle || '',
  image: publicUrl(req, item.image || ''),
  link: item.link || '',
  status: Number(item.status ?? 1)
});

const formatInquiry = (req, item) => ({
  id: item.id || String(item._id),
  name: item.name || '',
  email: item.email || '',
  phone: item.phone || '',
  subject: item.subject || '',
  message: item.message || '',
  status: Number(item.status ?? 1),
  createdAt: item.createdAt || ''
});

const saveInquiry = async (req, res) => {
  try {
    const existing = req.params.id ? await findById(ContactInquiry, req.params.id, ownerQuery(req)) : null;
    const doc = existing || new ContactInquiry({ id: await nextPublicId(ContactInquiry, 'INQ') });
    Object.assign(doc, req.body, ownerFields(req));
    
    if (!existing) {
      doc.status = req.body.status !== undefined ? Number(req.body.status) : initialStatus(req);
    } else if (req.body.status !== undefined) {
      doc.status = Number(req.body.status);
    }
    
    await doc.save();
    return apiResponse(res, existing ? 200 : 201, 'Contact inquiry saved successfully', formatInquiry(req, doc.toObject()));
  } catch (error) {
    return apiResponse(res, 500, 'Error saving contact inquiry', { error: error.message });
  }
};

const masterConfig = {
  business: { Model: BusinessCategory, nameKeys: ['business', 'name'], parentKey: 'state_id' },
  country: { Model: Country, nameKeys: ['country', 'name'] },
  state: { Model: State, nameKeys: ['state', 'name'], parentKey: 'country_id' },
  city: { Model: City, nameKeys: ['city', 'name'], parentKey: 'state_id' },
  district: { Model: Master, type: 'district' },
  taluka: { Model: Master, type: 'taluka' },
  village: { Model: Master, type: 'village' },
  area: { Model: Master, type: 'area' },
  'blood-group': { Model: Master, type: 'blood-group' },
  'event-category': { Model: Master, type: 'event-category' }
};

const formatMaster = (type, item, config) => {
  const name = config.nameKeys?.map((key) => item[key]).find(Boolean) || item.name || '';
  return {
    id: item.id || String(item._id),
    type,
    name,
    parent_id: config.parentKey ? item[config.parentKey] || '' : item.parent_id || '',
    status: Number(item.status ?? 1)
  };
};

const getMasters = async (req, res) => {
  try {
    const type = req.params.type;
    const config = masterConfig[type];
    if (!config) return apiResponse(res, 404, 'Master type not found');

    const query = { ...(config.type ? { type: config.type } : {}), ...ownerQuery(req) };
    if (req.query.parent_id && config.parentKey) query[config.parentKey] = String(req.query.parent_id);
    if (req.query.parent_id && config.type) query.parent_id = String(req.query.parent_id);

    const rows = await config.Model.find(query).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Master data retrieved successfully', rows.map((row) => formatMaster(type, row, config)));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving master data', { error: error.message });
  }
};

const saveMaster = async (req, res) => {
  try {
    const type = req.params.type;
    const config = masterConfig[type];
    if (!config) return apiResponse(res, 404, 'Master type not found');

    const name = req.body.name || req.body[type] || req.body.business || req.body.country || req.body.state || req.body.city;
    if (!name) return apiResponse(res, 400, 'Name is required');

    const existing = req.params.id ? await findById(config.Model, req.params.id, ownerQuery(req)) : null;
    const doc = existing || new config.Model({ id: await nextPublicId(config.Model, `${type.toUpperCase()}_`) });

    if (config.type) {
      doc.type = config.type;
      doc.name = name;
      doc.parent_id = req.body.parent_id || '';
    } else {
      const primaryNameKey = config.nameKeys[0];
      doc[primaryNameKey] = name;
      doc.name = name;
      if (config.parentKey) doc[config.parentKey] = req.body.parent_id || req.body[config.parentKey] || doc[config.parentKey] || '';
    }

    if (!existing) {
      doc.status = req.body.status !== undefined ? Number(req.body.status) : initialStatus(req);
    } else if (req.body.status !== undefined) {
      doc.status = Number(req.body.status);
    }
    
    Object.assign(doc, ownerFields(req));
    await doc.save();

    return apiResponse(res, existing ? 200 : 201, 'Master data saved successfully', formatMaster(type, doc.toObject(), config));
  } catch (error) {
    return apiResponse(res, 500, 'Error saving master data', { error: error.message });
  }
};

const deleteMaster = async (req, res) => {
  try {
    const type = req.params.type;
    const config = masterConfig[type];
    if (!config) return apiResponse(res, 404, 'Master type not found');

    const existing = await findById(config.Model, req.params.id, ownerQuery(req));
    if (!existing) return apiResponse(res, 404, 'Master data not found');

    await existing.deleteOne();
    return apiResponse(res, 200, 'Master data deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting master data', { error: error.message });
  }
};

module.exports = {
  getEvents: listContent(Event, formatEvent, 'Events'),
  saveEvent: saveContent(Event, eventPayload, formatEvent, 'Event', 'EVT'),
  deleteEvent: deleteContent(Event, 'Event'),
  getFestivals: listContent(Festival, formatFestival, 'Festivals'),
  saveFestival: saveContent(Festival, festivalPayload, formatFestival, 'Festival', 'FST'),
  deleteFestival: deleteContent(Festival, 'Festival'),
  getGallery: listContent(Gallery, formatGallery, 'Gallery'),
  saveGallery: saveContent(Gallery, galleryPayload, formatGallery, 'Gallery', 'GAL'),
  deleteGallery: deleteContent(Gallery, 'Gallery item'),
  getBanners: listContent(Banner, formatBanner, 'Banners'),
  saveBanner: saveContent(Banner, bannerPayload, formatBanner, 'Banner', 'BAN'),
  deleteBanner: deleteContent(Banner, 'Banner'),
  getInquiries: listContent(ContactInquiry, formatInquiry, 'Contact inquiries'),
  saveInquiry,
  deleteInquiry: deleteContent(ContactInquiry, 'Contact inquiry'),
  getMasters,
  saveMaster,
  deleteMaster
};
