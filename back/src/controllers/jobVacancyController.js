const mongoose = require('mongoose');
const JobVacancy = require('../models/jobVacancy');
const { apiResponse } = require('../utils/apiResponse');
const queryHelper = require('../utils/queryHelper');

const requestData = (req) => ({ ...req.query, ...req.body });

const buildIdQuery = (id) => ({
  $or: [
    { id: String(id) },
    { _id: id.match(/^[a-f\d]{24}$/i) ? id : null }
  ]
});

const buildSearchQuery = ({ search, job_type }) => {
  const query = {};
  if (job_type) query.job_type = job_type;
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { company_name: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }
  return query;
};

const extractVacancyData = (data) => {
  const { title, description, qualifications, company_name, location, job_type, salary, contact_email, contact_number, status } = data;
  return { title, description, qualifications, company_name, location, job_type, salary, contact_email, contact_number, status };
};

const getJobVacancies = async (req, res) => {
  try {
    const { data: jobVacancies, pagination } = await queryHelper(JobVacancy, requestData(req), {
      searchFields: ['title', 'company_name', 'location', 'description', 'qualifications'],
      filterFields: ['job_type', 'status'],
      defaultSort: { createdAt: -1 },
      lean: false
    });

    return apiResponse(res, 200, "Job vacancies retrieved successfully", jobVacancies, pagination);

  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving Vacancies', { error: error.message });
  }
};

const getJobVacancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobVacancy = await JobVacancy.findOne(buildIdQuery(id));
    if (!jobVacancy) return apiResponse(res, 404, "Job Vacancy not found");
    return apiResponse(res, 200, "Job vacancy retrieved successfully", jobVacancy);
  } catch (error) {
    return apiResponse(res, 500, 'Error retrieving vacancy', { error: error.message });
  }
};

const postJobVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const jobVacancyData = extractVacancyData(requestData(req));

    if (id) {
      const jobVacancy = await JobVacancy.findOneAndUpdate(buildIdQuery(id), jobVacancyData, { new: true });
      if (!jobVacancy) return apiResponse(res, 404, "Job Vacancy not found");
      return apiResponse(res, 200, "Job Vacancy updated successfully", jobVacancy);
    }

    const jobVacancy = await JobVacancy.create(jobVacancyData);
    return apiResponse(res, 201, "Job Vacancy created successfully", jobVacancy);
  } catch (error) {
    return apiResponse(res, 500, "Failed to save job vacancy", { error: error.message });
  }
};

const deleteJobVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const jobVacancy = await JobVacancy.findOneAndDelete(buildIdQuery(id));
    if (!jobVacancy) return apiResponse(res, 404, "Job Vacancy not found");
    return apiResponse(res, 200, "Job Vacancy deleted successfully");
  } catch (error) {
    return apiResponse(res, 500, "Failed to delete job vacancy", { error: error.message });
  }
};

module.exports = { getJobVacancies, getJobVacancyById, postJobVacancy ,deleteJobVacancy }
