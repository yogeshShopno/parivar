const mongoose = require('mongoose');

const jobVacancySchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    qualifications: {
        type: String,
        required: false
    },
    company_name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    job_type: {
        type: String,
        required: true, enum: ['full-time', 'part-time', 'contract', 'internship'],
    },
    salary: {
        type: String,
        required: true
    },
    contact_email: {
        type: String,
        required: false
    },
    contact_number: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: false, default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('JobVacancy', jobVacancySchema);