import React from 'react'
import AdminCrudPage from './AdminCrudPage'
import GalleryPage from './GalleryPage'

const definitions = {
  festivals: {
    title: 'Festivals',
    subtitle: 'Create and maintain festival announcements',
    endpoint: '/festivals',
    fields: [
      { name: 'title', label: 'Title' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'festival_date', label: 'Festival Date', type: 'date' },
      { name: 'button_name', label: 'Button Name' },
      { name: 'button_link', label: 'Button Link' },
      { name: 'image', label: 'Image', type: 'file' }
    ],
    columns: [
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'title', label: 'Title' },
      { key: 'festival_date', label: 'Date' },
      { key: 'button_name', label: 'Action' }
    ]
  },

  
  gallery: {
    title: 'Gallery',
    subtitle: 'Maintain gallery images and categories',
    endpoint: '/gallery',
    fields: [
      { name: 'category', label: 'Category' },
      { name: 'year', label: 'Year' },
      { name: 'images', label: 'Images', type: 'file', multiple: true }
    ],
    columns: [
      { key: 'images', label: 'Images', type: 'image' },
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'year', label: 'Year' }
    ]
  },

  banners: {
    title: 'Banner',
    subtitle: 'Control app banner slides and links',
    endpoint: '/content/banners',
    fields: [
      { name: 'title', label: 'Title' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'link', label: 'Link' },
      { name: 'image', label: 'Image', type: 'file' },
      { name: 'status', label: 'Status', type: 'select', defaultValue: 1, options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] }
    ],
    columns: [
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'status', label: 'Status', render: (row) => Number(row.status) === 1 ? 'Active' : 'Inactive' }
    ]
  },
  inquiries: {
    title: 'Contact Inquiry',
    subtitle: 'Track and update messages from contact forms',
    endpoint: '/content/contact-inquiries',
    fields: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      { name: 'subject', label: 'Subject' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', defaultValue: 'new', options: [{ value: 'new', label: 'New' }, { value: 'in-progress', label: 'In Progress' }, { value: 'closed', label: 'Closed' }] }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status' }
    ]
  }
}

export default function ContentPage({ type }) {
  if (type === 'gallery') {
    return <GalleryPage />
  }

  if (!definitions[type]) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
        Unknown content menu selected.
      </div>
    )
  }

  return <AdminCrudPage {...definitions[type]} getRowTitle={(row) => row.title || row.subject || row.name} />
}
