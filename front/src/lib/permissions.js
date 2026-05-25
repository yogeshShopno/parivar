const legacyPermissionFor = (permission) => {
  const legacyMap = {
    'members.': 'users.manage',
    'committee.': 'committee.manage',
    'roles.': 'roles.manage',
    'festivals.': 'festivals.manage',
    'events.': 'events.manage',
    'gallery.': 'gallery.manage',
    'banners.': 'banners.manage',
    'businesses.': 'businesses.manage',
    'news.': 'news.manage',
    'posts.': 'posts.manage',
    'contact-inquiries.': 'contact-inquiries.manage',
    'settings.': 'settings.manage',
    'country.': 'masters.manage',
    'state.': 'masters.manage',
    'district.': 'masters.manage',
    'taluka.': 'masters.manage',
    'city.': 'masters.manage',
    'village.': 'masters.manage',
    'area.': 'masters.manage',
    'blood-group.': 'masters.manage',
    'event-category.': 'masters.manage'
  }

  return Object.entries(legacyMap).find(([prefix]) => permission.startsWith(prefix))?.[1] || permission
}

export const hasPermission = (user, permission) => {
  if (!permission) return true
  if (user?.is_super_admin) return true

  const required = Array.isArray(permission) ? permission : [permission]
  const permissions = Array.isArray(user?.permissions) ? user.permissions : []

  return required.some((item) => permissions.includes(item) || permissions.includes(legacyPermissionFor(item)))
}
