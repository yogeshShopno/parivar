import React, { useMemo } from 'react'
import AdminCrudPage from './AdminCrudPage'
import { masterLabels } from '../config/navigation'

const parentFieldsConfig = {
  state: { source: '/masters/country', label: 'Country', key: 'name' },
  district: { source: '/masters/state', label: 'State', key: 'name' },
  taluka: { source: '/masters/district', label: 'District', key: 'name' },
  city: { source: '/masters/state', label: 'State', key: 'name' },
  village: { source: '/masters/taluka', label: 'Taluka', key: 'name' },
  area: { source: '/masters/village', label: 'Village', key: 'name' }
}

export default function MasterPage({ type }) {
  const label = masterLabels[type]
  const parentConfig = parentFieldsConfig[type]
  
  const fields = useMemo(() => [
    { name: 'name', label: `${label} Name` },
    ...(parentConfig ? [{ 
      name: 'parent_id', 
      label: parentConfig.label,
      type: 'select-remote',
      source: parentConfig.source
    }] : []),
    { name: 'status', label: 'Status', type: 'select', defaultValue: 1, options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] }
  ], [label, type, parentConfig])

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    ...(parentConfig ? [{ key: 'parent_id', label: parentConfig.label }] : []),
    { key: 'status', label: 'Status', render: (row) => Number(row.status) === 1 ? 'Active' : 'Inactive' }
  ], [parentConfig])

  if (!label) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
        Unknown master menu selected.
      </div>
    )
  }

  return (
    <AdminCrudPage
      title={`${label} Master`}
      subtitle={`Manage ${label.toLowerCase()} master records`}
      endpoint={`/masters/${type}`}
      fields={fields}
      columns={columns}
      getRowTitle={(row) => row.name}
    />
  )
}
