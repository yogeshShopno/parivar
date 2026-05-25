const PERMISSIONS = [
  { key: 'dashboard.view', label: 'Dashboard' },
  { key: 'committee.manage', label: 'Committee Members' },
  { key: 'users.manage', label: 'Members' },
  { key: 'roles.manage', label: 'Roles & Permissions' },
  { key: 'festivals.manage', label: 'Festivals' },
  { key: 'events.manage', label: 'Events' },
  { key: 'gallery.manage', label: 'Gallery' },
  { key: 'banners.manage', label: 'Banners' },
  { key: 'businesses.manage', label: 'Businesses' },
  { key: 'posts.manage', label: 'Feed Posts' },
  { key: 'contact-inquiries.manage', label: 'Contact Inquiries' },
  { key: 'masters.manage', label: 'Masters' },
  { key: 'settings.manage', label: 'Theme Config' }
];

const ALL_PERMISSION_KEYS = PERMISSIONS.map((permission) => permission.key);

module.exports = {
  ALL_PERMISSION_KEYS,
  PERMISSIONS
};
