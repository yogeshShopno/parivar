const mongoose = require('mongoose');
const Donation = require('../models/donationModel');
const { apiResponse } = require('../utils/apiResponse');
const queryHelper = require('../utils/queryHelper');

const requestData = (req) => ({
  ...req.query,
  ...req.body
});

// --- MEMBER / MOBILE CONTROLLER METHODS ---

const getDonations = async (req, res) => {
  try {
    const { data: donations, pagination } = await queryHelper(Donation, requestData(req), {
      searchFields: ['donator_name', 'donation_purpose'],
      filterFields: ['donator_name', 'donation_purpose', 'status', 'bank_detail_id']
    });

    return res.status(200).json({
      status: 200,
      message: 'Donations retrieved successfully',
      data: donations.map(d => ({
        id: d.id || String(d._id),
        donator_name: d.donator_name || '',
        donate_amount: Number(d.donate_amount || 0),
        donation_purpose: d.donation_purpose || '',
        date: d.date || '',
        status: Number(d.status ?? 1)
      })),
      ...(pagination ? { pagination } : {})
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error retrieving donations',
      data: [],
      error: error.message
    });
  }
};

const addDonation = async (req, res) => {
  try {
    const {
      donator_name,
      donate_amount,
      donation_purpose,
      date,
      status
    } = requestData(req);

    if (!donator_name || !donate_amount || !donation_purpose || !date) {
      return res.status(400).json({
        status: 400,
        message: 'All fields are mandatory',
        data: []
      });
    }

    const donationData = {
      id: `DON${Date.now()}`,
      donator_name,
      donate_amount: Number(donate_amount),
      donation_purpose,
      date,
      status: status === undefined ? 1 : Number(status),
      cdate: new Date().toISOString().slice(0, 10)
    };

    const donation = await Donation.create(donationData);
    return res.status(201).json({
      status: 201,
      message: 'Donation added successfully',
      data: {
        id: donation.id || String(donation._id),
        donator_name: donation.donator_name || '',
        donate_amount: Number(donation.donate_amount || 0),
        donation_purpose: donation.donation_purpose || '',
        date: donation.date || '',
        status: Number(donation.status ?? 1)
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error adding donation',
      data: [],
      error: error.message
    });
  }
};

const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const orConditions = [{ id }];
    if (mongoose.isValidObjectId(id)) {
      orConditions.push({ _id: id });
    }

    const donation = await Donation.findOne({
      $or: orConditions
    });

    if (!donation) {
      return res.status(404).json({
        status: 404,
        message: 'Donation not found',
        data: []
      });
    }

    const {
      donator_name,
      donate_amount,
      donation_purpose,
      date,
      status
    } = requestData(req);

    if (donator_name) donation.donator_name = donator_name;
    if (donate_amount !== undefined) donation.donate_amount = Number(donate_amount);
    if (donation_purpose !== undefined) donation.donation_purpose = donation_purpose;
    if (date !== undefined) donation.date = date;
    if (status !== undefined) donation.status = Number(status);

    await donation.save();
    return res.status(200).json({
      status: 200,
      message: 'Donation updated successfully',
      data: {
        id: donation.id || String(donation._id),
        donator_name: donation.donator_name || '',
        donate_amount: Number(donation.donate_amount || 0),
        donation_purpose: donation.donation_purpose || '',
        date: donation.date || '',
        status: Number(donation.status ?? 1)
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error updating donation',
      data: [],
      error: error.message
    });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const orConditions = [{ id }];
    if (mongoose.isValidObjectId(id)) {
      orConditions.push({ _id: id });
    }

    const result = await Donation.deleteOne({
      $or: orConditions
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Donation not found',
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Donation deleted successfully',
      data: []
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error deleting donation',
      data: [],
      error: error.message
    });
  }
};

// --- ADMIN / SOFTWARE CONTROLLER METHODS ---

const adminGetDonations = async (req, res) => {
  try {
    const { data: donations, pagination } = await queryHelper(Donation, req.query, {
      searchFields: ['donator_name', 'donation_purpose'],
      filterFields: ['donator_name', 'donation_purpose', 'status', 'bank_detail_id']
    });

    return res.status(200).json({
      status: 200,
      message: 'Donations retrieved successfully',
      data: donations.map(d => ({
        id: d.id || String(d._id),
        donator_name: d.donator_name || '',
        donate_amount: Number(d.donate_amount || 0),
        donation_purpose: d.donation_purpose || '',
        date: d.date || '',
        status: Number(d.status ?? 1)
      })),
      ...(pagination ? { pagination } : {})
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error retrieving donations',
      data: [],
      error: error.message
    });
  }
};

const adminSaveDonation = async (req, res) => {
  try {
    const { id } = req.params;
    let existing = null;
    if (id) {
      const orConditions = [{ id }];
      if (mongoose.isValidObjectId(id)) {
        orConditions.push({ _id: id });
      }
      existing = await Donation.findOne({
        $or: orConditions
      });
    }

    if (id && !existing) {
      return res.status(404).json({
        status: 404,
        message: 'Donation not found',
        data: []
      });
    }

    const {
      donator_name,
      donate_amount,
      donation_purpose,
      date,
      status
    } = requestData(req);

    // For new donation, check mandatory fields
    if (!existing && (!donator_name || !donate_amount || !donation_purpose || !date)) {
      return res.status(400).json({
        status: 400,
        message: 'All fields are mandatory',
        data: []
      });
    }

    const donation = existing || new Donation({
      id: `DON${Date.now()}`,
      cdate: new Date().toISOString().slice(0, 10)
    });

    const updateFields = {};
    if (donator_name !== undefined) updateFields.donator_name = donator_name;
    if (donate_amount !== undefined) updateFields.donate_amount = Number(donate_amount);
    if (donation_purpose !== undefined) updateFields.donation_purpose = donation_purpose;
    if (date !== undefined) updateFields.date = date;
    if (status !== undefined) updateFields.status = Number(status);

    donation.set(updateFields);
    await donation.save();

    return res.status(existing ? 200 : 201).json({
      status: existing ? 200 : 201,
      message: `Donation ${existing ? 'updated' : 'saved'} successfully`,
      data: {
        id: donation.id || String(donation._id),
        donator_name: donation.donator_name || '',
        donate_amount: Number(donation.donate_amount || 0),
        donation_purpose: donation.donation_purpose || '',
        date: donation.date || '',
        status: Number(donation.status ?? 1)
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error saving donation',
      data: [],
      error: error.message
    });
  }
};

const adminDeleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const orConditions = [{ id }];
    if (mongoose.isValidObjectId(id)) {
      orConditions.push({ _id: id });
    }

    const result = await Donation.deleteOne({
      $or: orConditions
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: 'Donation not found',
        data: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Donation deleted successfully',
      data: []
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error deleting donation',
      data: [],
      error: error.message
    });
  }
};

module.exports = {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
  adminGetDonations,
  adminSaveDonation,
  adminDeleteDonation
};
