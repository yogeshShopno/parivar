const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/eventModel');
const { apiResponse, fullName } = require('../utils/apiResponse');
const queryHelper = require('../utils/queryHelper');
const isObjectId = (id) => require('mongoose').isValidObjectId(id);

const findRegistration = (id) => EventRegistration.findOne(
  isObjectId(id) ? { _id: id } : { _id: String(id) }
);

const getUserPayload = (req) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) return { id: null, name: '' };
  return {
    id: String(userId),
    name: fullName(req.user) || ''
  };
};

const formatRegistration = (item = {}) => {
  const user = item.user || {};
  return {
    id: item.id || String(item._id),
    _id: String(item._id),
    name: item.name || '',
    email: item.email || '',
    number: item.number || '',
    total_attendee: item.total_attendee ?? 1,
    status: item.status || 'confirmed',
    event_id: String(item.event_id || ''),
    event_name: item.event_name || '',
    user: {
      id: String(user._id || ''),
      name: user.name || ''
    },
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || ''
  };
};

const registrationPayload = (req, existing = {}, event = {}) => {
  const userPayload = existing.user?.id
    ? existing.user
    : getUserPayload(req);

  return {
    name: req.body.name || existing.name || '',
    email: req.body.email || existing.email || '',
    number: req.body.number || existing.number || '',
    total_attendee: Number(req.body.total_attendee ?? existing.total_attendee ?? 1),
    event_id: existing.event_id || req.body.event_id || '',
    event_name: existing.event_name || event.event_name || event.title || '',
    user: userPayload
  };
};

const getRegistrationsList = async (req, res) => {
  try {
    const { data, pagination } = await queryHelper(EventRegistration, req.query, {
      searchFields: ['name', 'email', 'number', 'event_name'],
      filterFields: ['event_id', 'status']
    });
    return apiResponse(res, 200, 'Registrations retrieved successfully', data.map(formatRegistration), pagination);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving registrations', { error: error.message });
  }
};

const getRegistrationById = async (req, res) => {
  try {
    const registration = await findRegistration(req.params.id);
    if (!registration) return apiResponse(res, 404, 'Registration not found');
    return apiResponse(res, 200, 'Registration retrieved successfully', formatRegistration(registration.toObject()));
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving registration', { error: error.message });
  }
};

const addRegistration = async (req, res) => {
  try {
    const { event_id } = req.body;
    if (!event_id || !isObjectId(event_id)) return apiResponse(res, 400, 'Valid event_id is required');

    const event = await Event.findById(event_id);
    if (!event) return apiResponse(res, 404, 'Event not found');

    const data = registrationPayload(req, {}, event);
    const registration = new EventRegistration(data);
    await registration.save();
    return apiResponse(res, 201, 'Registration saved successfully', formatRegistration(registration.toObject()));
  } catch (error) {
    if (error.code === 11000) return apiResponse(res, 409, 'Already registered for this event');
    return apiResponse(res, 400, error.message || 'Error saving registration');
  }
};

const updateRegistration = async (req, res) => {
  try {
    const registration = await findRegistration(req.params.id);
    if (!registration) return apiResponse(res, 404, 'Registration not found');
    if (registration.status === 'cancelled') return apiResponse(res, 400, 'Cannot update a cancelled registration');

    registration.set(registrationPayload(req, registration.toObject()));
    await registration.save();
    return apiResponse(res, 200, 'Registration updated successfully', formatRegistration(registration.toObject()));
  } catch (error) {
    if (error.code === 11000) return apiResponse(res, 409, 'Already registered for this event');
    return apiResponse(res, 400, error.message || 'Error updating registration');
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const registration = await findRegistration(req.params.id);
    if (!registration) return apiResponse(res, 404, 'Registration not found');
    if (registration.status === 'cancelled') return apiResponse(res, 400, 'Registration is already cancelled');

    registration.status = 'cancelled';
    await registration.save();
    return apiResponse(res, 200, 'Registration cancelled successfully', formatRegistration(registration.toObject()));
  } catch (error) {
    return apiResponse(res, 500, 'Error cancelling registration', { error: error.message });
  }
};


const downloadRegistrations = async (req, res) => {
  try {
    const { search, event_id } = req.query
    const query = {}

    if (event_id && isObjectId(event_id)) query.event_id = event_id

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: regex }, { email: regex }, { number: regex }, { event_name: regex }]
    }

    const registrations = await EventRegistration.find(query).sort({ _id: -1 }).lean()

    const rows = registrations.map((r) => ({
      'Name': r.name || '',
      'Email': r.email || '',
      'Phone': r.number || '',
      'Event': r.event_name || '',
      'Entry Type': r.entry_type || 'Free',
      'Total Attendees': Number(r.total_attendee ?? 1),
      'Status': r.status || 'confirmed',
      'Registered By': r.user?.name || 'Guest',
      'Registered On': r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''
    }))

    const header = Object.keys(rows[0] || {
      'Name': '', 'Email': '', 'Phone': '', 'Event': '', 'Entry Type': '',
      'Total Attendees': '', 'Status': '', 'Registered By': '', 'Registered On': ''
    })

    const csv = [
      header.join(','),
      ...rows.map((row) => header.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="event-registrations.csv"')
    return res.status(200).send(csv)
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Export failed', error: error.message })
  }
}


module.exports = {
  getRegistrationsList,
  getRegistrationById,
  addRegistration,
  updateRegistration,
  cancelRegistration,
  downloadRegistrations

};