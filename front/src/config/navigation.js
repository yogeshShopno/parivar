import {
  Briefcase,
  CalendarDays,
  FileText,
  Home,
  Image,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  GraduationCap,
  HeartHandshake
} from 'lucide-react'

export const coreNavigation = [
  { to: '/', label: 'Dashboard', icon: Home, end: true, title: 'System Overview', permission: 'dashboard.view' },
  { to: '/committee', label: 'Committee Members', icon: UserCog, title: 'Committee Members', permission: 'committee.list' },
  { to: '/roles', label: 'Roles', icon: ShieldCheck, title: 'Roles & Permissions', permission: 'roles.list' },
  { to: '/users', label: 'Members', icon: Users, title: 'Member Directory', permission: 'members.list' },
  { to: '/festivals', label: 'Festivals', icon: CalendarDays, title: 'Festivals', permission: 'festivals.list' },
  { to: '/events', label: 'Events', icon: CalendarDays, title: 'Events', permission: 'events.list' },
  { to: '/gallery', label: 'Gallery', icon: Image, title: 'Gallery', permission: 'gallery.list' },
  { to: '/banners', label: 'Banners', icon: Megaphone, title: 'Banner Manager', permission: 'banners.list' },
  { to: '/businesses', label: 'Businesses', icon: Briefcase, title: 'Business Index', permission: 'businesses.list' },
  { to: '/students', label: 'Students', icon: GraduationCap, title: 'Students', permission: 'students.list' },
  { to: '/donations', label: 'Donations', icon: HeartHandshake, title: 'Donations', permission: 'donations.list' },
  { to: '/posts', label: 'Posts', icon: FileText, title: 'Post Moderator', permission: 'posts.list' },
  { to: '/news', label: 'News', icon: FileText, title: 'News Moderator', permission: 'news.list' },

  { to: '/contact-inquiries', label: 'Contact Inquiries', icon: Mail, title: 'Contact Inquiries', permission: 'contact-inquiries.list' }
]

export const masterNavigation = [
  { type: 'business', label: 'Business', permission: 'businesses.list' },
  { type: 'country', label: 'Country', permission: 'country.list' },
  { type: 'state', label: 'State', permission: 'state.list' },
  { type: 'district', label: 'District', permission: 'district.list' },
  { type: 'taluka', label: 'Taluka', permission: 'taluka.list' },
  { type: 'city', label: 'City', permission: 'city.list' },
  { type: 'village', label: 'Village', permission: 'village.list' },
  { type: 'area', label: 'Area', permission: 'area.list' },
  { type: 'blood-group', label: 'Blood Group', permission: 'blood-group.list' },
  { type: 'event-category', label: 'Event Category', permission: 'event-category.list' },
  { type: 'gallery-category', label: 'Gallery Category', permission: 'gallery-category.list' }
]

export const configurationNavigation = [
  { to: '/settings', label: 'Theme Config', icon: Settings, title: 'Theme Customizer', permission: 'settings.edit' }
]

export const routeTitles = [
  ...coreNavigation,
  ...configurationNavigation
].reduce((acc, item) => ({ ...acc, [item.to]: item.title }), {})

export const masterLabels = masterNavigation.reduce(
  (acc, item) => ({ ...acc, [item.type]: item.label }),
  {}
)
