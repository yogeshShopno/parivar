const News = require('../models/newsModel');
const { apiResponse, fullName, publicUrl } = require('../utils/apiResponse');
const { adminMemberId, ownerFields, ownerOrLegacyMemberQuery, initialStatus } = require('../utils/ownership');

const isObjectId = (id) => require('mongoose').isValidObjectId(id);

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  return req.body.image || req.body.image_url || fallback || '';
};

const newsFilter = (req, extra = {}) => {
  return {
    $and: [
      ownerOrLegacyMemberQuery(req),
      extra
    ]
  };
};

const findNews = (req, id) => News.findOne(newsFilter(req, {
  $or: [
    { news_id: String(id) },
    ...(isObjectId(id) ? [{ _id: id }] : [])
  ]
}));

const formatNews = (req, item = {}) => {
  const image = item.image_url || (typeof item.image === 'string' ? item.image : '');

  return {
    id: item.news_id || String(item._id),
    news_id: item.news_id || String(item._id),
    title: item.title || '',
    description: item.description || item.content || '',
    content: item.content || item.description || '',
    date: item.date || item.createdAt || '',
    cdate: item.cdate || (item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : ''),
    category: item.category || '',
    status: Number(item.status ?? 1),
    image: publicUrl(req, image),
    reporter_name: item.reporter_name || '',
    location: item.location || ''
  };
};

const newsPayload = (req, existing = {}) => {
  const title = req.body.title || existing.title || '';
  const description = req.body.description || existing.description || req.body.content || existing.content || '';

  return {
    ...req.body,
    title,
    description,
    content: req.body.content || description,
    reporter_name: req.body.reporter_name || existing.reporter_name || fullName(req.user) || req.user?.email || 'Admin',
    location: req.body.location || existing.location || 'Admin',
    category: req.body.category || existing.category || '',
    status: req.body.status !== undefined ? Number(req.body.status) : (existing.status !== undefined ? Number(existing.status) : initialStatus(req)),
    image_url: imageFromRequest(req, existing.image_url || (typeof existing.image === 'string' ? existing.image : '')),
    cdate: existing.cdate || new Date().toISOString().slice(0, 10)
  };
};

const getNewsList = async (req, res) => {
  try {
		const news = await News.find(newsFilter(req)).sort({ _id: -1 }).lean();
		return apiResponse(res, 200, 'News retrieved successfully', news.map((item) => formatNews(req, item)));
	} catch (error) {
		return apiResponse(res, 500, 'Error retrieving news', { error: error.message });
	}
};

const getNewsById = async (req, res) => {
    try {
        const news = await findNews(req, req.params.id).lean();
        if (!news) {
            return apiResponse(res, 404, 'News not found');
        }
        return apiResponse(res, 200, 'News retrieved successfully', formatNews(req, news));
    } catch (error) {
        return apiResponse(res, 500, 'Error retrieving news', { error: error.message });
    }
};

const addNews = async (req, res) => {
    console.log('Received request to add news with data:', req.body, 'and file:', req.file);
    try {
        const data = newsPayload(req);
        Object.assign(data, ownerFields(req), { member_id: adminMemberId(req) });

        const news = new News({
            news_id: `NEWS${Date.now()}`,
            ...data
        });
        await news.save();
        return apiResponse(res, 201, 'News saved successfully', formatNews(req, news.toObject()));
    } catch (error) {
        return apiResponse(res, 400, error.message || 'Error saving news');
    }
};

const updateNews = async (req, res) => {
    try {
        const news = await findNews(req, req.params.id);
        if (!news) {
            return apiResponse(res, 404, 'News not found');
        }

        news.set(newsPayload(req, news));
        news.set(ownerFields(req));
        await news.save();

        return apiResponse(res, 200, 'News saved successfully', formatNews(req, news.toObject()));
    } catch (error) {
        return apiResponse(res, 400, error.message || 'Error saving news');
    }
};

const deleteNews = async (req, res) => {
    try {
        const news = await findNews(req, req.params.id);
        if (!news) {
            return apiResponse(res, 404, 'News not found');
        }
        await news.deleteOne();
        return apiResponse(res, 200, 'News deleted successfully');
    } catch (error) {
        return apiResponse(res, 500, 'Error deleting news', { error: error.message });
    }
};

module.exports = {
    getNewsList,
    getNewsById,
    addNews,
    updateNews,
    deleteNews
};
