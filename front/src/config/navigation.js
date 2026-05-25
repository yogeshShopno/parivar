import {
  Briefcase,
  CalendarDays,
  FileText,
  Home,
  Image,
  Mail,
  Megaphone,
  Settings,
  UserCog,
  Users
} from 'lucide-react'

export const coreNavigation = [
  { to: '/', label: 'Dashboard', icon: Home, end: true, title: 'System Overview' },
  { to: '/committee', label: 'Committee Members', icon: UserCog, title: 'Committee Members' },
  { to: '/users', label: 'Members', icon: Users, title: 'Member Directory' },
  { to: '/festivals', label: 'Festivals', icon: CalendarDays, title: 'Festivals' },
  { to: '/events', label: 'Events', icon: CalendarDays, title: 'Events' },
  { to: '/gallery', label: 'Gallery', icon: Image, title: 'Gallery' },
  { to: '/banners', label: 'Banners', icon: Megaphone, title: 'Banner Manager' },
  { to: '/businesses', label: 'Businesses', icon: Briefcase, title: 'Business Index' },
  { to: '/posts', label: 'Feed Posts', icon: FileText, title: 'Feed Moderator' },
  { to: '/contact-inquiries', label: 'Contact Inquiries', icon: Mail, title: 'Contact Inquiries' }
]

export const masterNavigation = [
  { type: 'business', label: 'Business' },
  { type: 'country', label: 'Country' },
  { type: 'state', label: 'State' },
  { type: 'district', label: 'District' },
  { type: 'taluka', label: 'Taluka' },
  { type: 'city', label: 'City' },
  { type: 'village', label: 'Village' },
  { type: 'area', label: 'Area' },
  { type: 'blood-group', label: 'Blood Group' },
  { type: 'event-category', label: 'Event Category' }
]

export const configurationNavigation = [
  { to: '/settings', label: 'Theme Config', icon: Settings, title: 'Theme Customizer' }
]

export const routeTitles = [
  ...coreNavigation,
  ...configurationNavigation
].reduce((acc, item) => ({ ...acc, [item.to]: item.title }), {})

export const masterLabels = masterNavigation.reduce(
  (acc, item) => ({ ...acc, [item.type]: item.label }),
  {}
)
