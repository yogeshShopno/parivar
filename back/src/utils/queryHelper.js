const OPTION_KEYS = ['search', 'page', 'limit', 'sort_by', 'sort_order'];

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const hasQueryOptions = (query = {}, filterFields = []) => {
  return [...OPTION_KEYS, ...filterFields].some((key) => hasValue(query[key]));
};

const castValue = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const mergeQuery = (baseQuery = {}, extraQuery = {}) => {
  if (!baseQuery || Object.keys(baseQuery).length === 0) return extraQuery;
  if (!extraQuery || Object.keys(extraQuery).length === 0) return baseQuery;
  return { $and: [baseQuery, extraQuery] };
};

const queryHelper = async (Model, query = {}, options = {}) => {
  const {
    baseQuery = {},
    filterFields = [],
    searchFields = [],
    defaultSort = { _id: -1 },
    select,
    populate,
    lean = true
  } = options;

  const extraQuery = {};

  if (query.search && searchFields.length) {
    const regex = new RegExp(escapeRegExp(query.search), 'i');
    extraQuery.$or = searchFields.map((field) => ({ [field]: regex }));
  }

  filterFields.forEach((field) => {
    if (hasValue(query[field])) {
      extraQuery[field] = castValue(query[field]);
    }
  });

  const active = hasQueryOptions(query, filterFields);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 0, 0);
  const sortField = query.sort_by || Object.keys(defaultSort)[0] || '_id';
  const sortDirection = String(query.sort_order || '').toLowerCase() === 'asc' ? 1 : -1;
  const sort = query.sort_by ? { [sortField]: sortDirection } : defaultSort;
  const finalQuery = mergeQuery(baseQuery, extraQuery);

  let dbQuery = Model.find(finalQuery).sort(sort);
  if (select) dbQuery = dbQuery.select(select);
  if (populate) dbQuery = dbQuery.populate(populate);
  if (limit) dbQuery = dbQuery.skip((page - 1) * limit).limit(limit);
  if (lean) dbQuery = dbQuery.lean();

  const [data, total] = await Promise.all([
    dbQuery,
    active ? Model.countDocuments(finalQuery) : Promise.resolve(null)
  ]);

  return {
    data,
    pagination: active ? {
      total,
      page,
      limit: limit || total,
      totalPages: limit ? Math.ceil(total / limit) : 1
    } : undefined
  };
};

module.exports = queryHelper;
