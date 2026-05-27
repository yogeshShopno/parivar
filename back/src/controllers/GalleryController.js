const mongoose = require('mongoose');
const Gallery = require('../models/galleryModel');

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

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null && item !== '')
  return value ? [value] : []
};

const galleryPayload = (req, existing = {}) => {
  const title = req.body.title || req.body.category || existing.title || existing.category || 'Gallery Image';
  const existingImages = normalizeArrayField(req.body.existing_images)
  const uploadedImages = normalizeArrayField(req.body.images)
  return {
    ...req.body,
    title,
    images: [...existingImages, ...uploadedImages],
    category: req.body.category || existing.category || 'General',
    year: req.body.year || existing.year || '',
    gallery_category_id: req.body.gallery_category_id || existing.gallery_category_id || ''
  };
};

const formatGallery = (req, item) => ({
  id: item.id || String(item._id),
  images: Array.isArray(item.images) ? item.images.map(img => publicUrl(req, img)) : [],
  category: item.category || 'General',
  year: item.year || '',
  gallery_category_id: item.gallery_category_id || ''
});

const getGallery = async (req, res) => {

  console.log('Fetching gallery with query:', ownerQuery(req));
  try {
    const rows = await Gallery.find(ownerQuery(req)).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Gallery retrieved successfully', rows.map((row) => formatGallery(req, row)));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving gallery', { error: error.message });
  }
};

const saveGallery = async (req, res) => {
  try {
    const existing = req.params.id ? await findById(Gallery, req.params.id, ownerQuery(req)) : null;
    const payload = galleryPayload(req, existing || {});
    
    const hasImages = Array.isArray(payload.images) && payload.images.length > 0;
    if (!hasImages && !existing) {
      return apiResponse(res, 400, 'Gallery images are required');
    }

    const doc = existing || new Gallery({ id: await nextPublicId(Gallery, 'GAL') });
    doc.set({ ...payload, ...ownerFields(req) });
    
    if (!existing) {
      doc.status = req.body.status !== undefined ? Number(req.body.status) : initialStatus(req);
    } else if (req.body.status !== undefined) {
      doc.status = Number(req.body.status);
    }
    
    await doc.save();
    return apiResponse(res, existing ? 200 : 201, 'Gallery saved successfully', formatGallery(req, doc.toObject()));
  } catch (error) {
    return apiResponse(res, 500, 'Error saving gallery', { error: error.message });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const existing = await findById(Gallery, req.params.id, ownerQuery(req));
    if (!existing) return apiResponse(res, 404, 'Gallery not found');
    await existing.deleteOne();
    return apiResponse(res, 200, 'Gallery deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting gallery', { error: error.message });
  }
};

module.exports = {
  getGallery,
  saveGallery,
  deleteGallery
};
