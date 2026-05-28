const Event = require('../models/eventModel');
const { apiResponse, fullName, publicUrl } = require('../utils/apiResponse');

const isObjectId = (id) => require('mongoose').isValidObjectId(id);

const imageFromRequest = (req, fallback = '') => {
  if (req.file) return `/uploads/${req.file.filename}`;
  return req.body.image || req.body.image_url || fallback || '';
};

const findEvent = (req, id) => Event.findOne({
  $or: [
    {_id: String(id) },
    ...(isObjectId(id) ? [{ _id: id }] : [])
  ]
});

const formatEvent = (req, item = {}) => {
  const image = item.image || '';

  return {
    _id: String(item._id),
    title: item.title || '',
    description: item.description || '',
    image: publicUrl(req, image),
    event_date: item.event_date || '',
    event_category_id: item.event_category_id || '',
    event_category_name: item.event_category_name || '',
    event_name: item.event_name || '',
    event_location: item.event_location || '',
    location_link: item.location_link || '',
    start_time: item.start_time || '',
    end_time: item.end_time || '',
    entry_type: item.entry_type || ''
  };
};

const eventPayload = (req, existing = {}) => {
  const title = req.body.title || existing.title || '';
  const description = req.body.description || existing.description || '';

  return {
    ...req.body,
    title,
    description,
    event_date: req.body.event_date || existing.event_date || new Date(),
    event_category_id: req.body.event_category_id || existing.event_category_id || '',
    event_category_name: req.body.event_category_name || existing.event_category_name || '',
    event_name: req.body.event_name || existing.event_name || title,
    event_location: req.body.event_location || existing.event_location || '',
    location_link: req.body.location_link || existing.location_link || '',
    start_time: req.body.start_time || existing.start_time || '',
    end_time: req.body.end_time || existing.end_time || '',
    entry_type: req.body.entry_type || existing.entry_type || '',
    image: imageFromRequest(req, existing.image || '')
  };
};

const getEventsList = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ _id: -1 }).lean();
    return apiResponse(res, 200, 'Events retrieved successfully', events.map((item) => formatEvent(req, item)));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving events', { error: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const data = eventPayload(req);
    const event = new Event(data);
    await event.save();
    return apiResponse(res, 201, 'Event saved successfully', formatEvent(req, event.toObject()));
  } catch (error) {
    return apiResponse(res, 400, error.message || 'Error saving event');
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await findEvent(req, req.params.id);
    if (!event) {
      return apiResponse(res, 404, 'Event not found');
    }
    event.set(eventPayload(req, event));
    await event.save();
    return apiResponse(res, 200, 'Event saved successfully', formatEvent(req, event.toObject()));
  } catch (error) {
    return apiResponse(res, 400, error.message || 'Error saving event');
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await findEvent(req, req.params.id);
    if (!event) {
      return apiResponse(res, 404, 'Event not found');
    }
    await event.deleteOne();
    return apiResponse(res, 200, 'Event deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'Error deleting event', { error: error.message });
  }
};

module.exports = {
  getEventsList,
  addEvent,
  updateEvent,
  deleteEvent
};