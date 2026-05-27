const GalleryCategory = require('../models/galleryCategoryModel');
const { apiResponse } = require('../utils/apiResponse');
const { ownerFields, ownerQuery } = require('../utils/ownership');

const formatCategory = (item) => ({
  id: item.id || String(item._id),
  category: item.category
});

const getCategories = async (req, res) => {
  try {
    const rows = await GalleryCategory.find(ownerQuery(req)).sort({ category: 1 }).lean();
    return apiResponse(res, 200, 'Gallery categories retrieved successfully', rows.map(formatCategory));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving gallery categories', { error: error.message });
  }
};

const saveCategory = async (req, res) => {
  try {
    const categoryText = (req.body.category || '').trim();
    if (!categoryText) {
      return apiResponse(res, 400, 'Category name is required');
    }

    const existing = req.params.id
      ? await GalleryCategory.findOne({
          ...ownerQuery(req),
          $or: [{ id: String(req.params.id) }, { _id: req.params.id }]
        })
      : null;

    const duplicate = await GalleryCategory.findOne({
      ...ownerQuery(req),
      category: categoryText,
      ...(existing ? { _id: { $ne: existing._id } } : {})
    });

    if (duplicate) {
      return apiResponse(res, 400, 'Gallery category already exists');
    }

    const doc = existing || new GalleryCategory({ ...ownerFields(req) });
    doc.category = categoryText;
    await doc.save();

    return apiResponse(res, existing ? 200 : 201, 'Gallery category saved successfully', formatCategory(doc.toObject()));
  } catch (error) {
    return apiResponse(res, 500, 'Error saving gallery category', { error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const existing = await GalleryCategory.findOne({
      ...ownerQuery(req),
      $or: [{ id: String(req.params.id) }, { _id: req.params.id }]
    });
    if (!existing) return apiResponse(res, 404, 'Gallery category not found');
    await existing.deleteOne();
    return apiResponse(res, 200, 'Gallery category deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting gallery category', { error: error.message });
  }
};

module.exports = {
  getCategories,
  saveCategory,
  deleteCategory
};
