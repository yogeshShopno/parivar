import React from 'react'
import AdminCrudPage from './AdminCrudPage'

const labels = {
  business: 'Business',
  country: 'Country',
  state: 'State',
  district: 'District',
  taluka: 'Taluka',
  city: 'City',
  village: 'Village',
  area: 'Area',
  'blood-group': 'Blood Group',
  'event-category': 'Event Category'
}

const parentLabels = {
  state: 'Country ID',
  district: 'State ID',
  taluka: 'District ID',
  city: 'State ID',
  village: 'Taluka ID',
  area: 'Village or City ID'
}

export default function MasterPage({ type }) {
  const label = labels[type] || 'Master'
  const fields = [
    { name: 'name', label: `${label} Name` },
    ...(parentLabels[type] ? [{ name: 'parent_id', label: parentLabels[type] }] : []),
    { name: 'status', label: 'Status', type: 'select', defaultValue: 1, options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] }
  ]

  return (
    <AdminCrudPage
      title={`${label} Master`}
      subtitle={`Manage ${label.toLowerCase()} master records`}
      endpoint={`/masters/${type}`}
      fields={fields}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'parent_id', label: 'Parent' },
        { key: 'status', label: 'Status', render: (row) => Number(row.status) === 1 ? 'Active' : 'Inactive' }
      ]}
      getRowTitle={(row) => row.name}
    />
  )
}
