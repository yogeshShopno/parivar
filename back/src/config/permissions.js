const ACTIONS = [
  { key: 'list', label: 'List' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' }
];

const PERMISSION_MODULES = [
  { key: 'members', label: 'Members' },
  { key: 'committee', label: 'Committee Members' },
  { key: 'roles', label: 'Roles' },
  { key: 'festivals', label: 'Festivals' },
  { key: 'events', label: 'Events' },
  { key: 'businesses', label: 'Business' },
  { key: 'students', label: 'Students' },
  { key: 'news', label: 'News' },
  { key: 'country', label: 'Country', masterType: 'country' },
  { key: 'state', label: 'State', masterType: 'state' },
  { key: 'district', label: 'District', masterType: 'district' },
  { key: 'taluka', label: 'Taluka', masterType: 'taluka' },
  { key: 'city', label: 'City', masterType: 'city' },
  { key: 'village', label: 'Village', masterType: 'village' },
  { key: 'area', label: 'Area', masterType: 'area' },
  { key: 'blood-group', label: 'Blood Group', masterType: 'blood-group' },
  { key: 'event-category', label: 'Event Category', masterType: 'event-category' },
  { key: 'gallery-category', label: 'Gallery Category', masterType: 'gallery-category' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'banners', label: 'Banner' },
  { key: 'donations', label: 'Donations' }
];

const PERMISSIONS = [
  { key: 'dashboard.view', label: 'Dashboard' },
  ...PERMISSION_MODULES.flatMap((module) => ACTIONS.map((action) => ({
    key: `${module.key}.${action.key}`,
    label: `${module.label} ${action.label}`,
    module: module.key,
    module_label: module.label,
    action: action.key,
    action_label: action.label,
    master_type: module.masterType || ''
  }))),
  { key: 'posts.list', label: 'Posts List', module: 'posts', module_label: 'Posts', action: 'list', action_label: 'List' },
  { key: 'posts.add', label: 'Posts Add', module: 'posts', module_label: 'Posts', action: 'add', action_label: 'Add' },
  { key: 'posts.edit', label: 'Posts Edit', module: 'posts', module_label: 'Posts', action: 'edit', action_label: 'Edit' },
  { key: 'posts.delete', label: 'Posts Delete', module: 'posts', module_label: 'Posts', action: 'delete', action_label: 'Delete' },
  { key: 'contact-inquiries.list', label: 'Contact Inquiries List', module: 'contact-inquiries', module_label: 'Contact Inquiries', action: 'list', action_label: 'List' },
  { key: 'contact-inquiries.edit', label: 'Contact Inquiries Edit', module: 'contact-inquiries', module_label: 'Contact Inquiries', action: 'edit', action_label: 'Edit' },
  { key: 'contact-inquiries.delete', label: 'Contact Inquiries Delete', module: 'contact-inquiries', module_label: 'Contact Inquiries', action: 'delete', action_label: 'Delete' },
  { key: 'settings.edit', label: 'Theme Config Edit', module: 'settings', module_label: 'Theme Config', action: 'edit', action_label: 'Edit' }
];

const LEGACY_PERMISSION_KEYS = [
  'committee.manage',
  'users.manage',
  'roles.manage',
  'festivals.manage',
  'events.manage',
  'gallery.manage',
  'banners.manage',
  'businesses.manage',
  'news.manage',
  'posts.manage',
  'contact-inquiries.manage',
  'masters.manage',
  'settings.manage',
  'donations.manage'
];

const ALL_PERMISSION_KEYS = [
  ...PERMISSIONS.map((permission) => permission.key),
  ...LEGACY_PERMISSION_KEYS
];

module.exports = {
  ACTIONS,
  ALL_PERMISSION_KEYS,
  LEGACY_PERMISSION_KEYS,
  PERMISSION_MODULES,
  PERMISSIONS
};
