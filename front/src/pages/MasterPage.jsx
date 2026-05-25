import React, { useMemo } from 'react'
import AdminCrudPage from './AdminCrudPage'
import { masterLabels } from '../config/navigation'

const parentLabels = {
  state: 'Country ID',
  district: 'State ID',
  taluka: 'District ID',
  city: 'State ID',
  village: 'Taluka ID',
  area: 'Village or City ID'
}

export default function MasterPage({ type }) {
  const label = masterLabels[type]
  const fields = useMemo(() => [
    { name: 'name', label: `${label} Name` },
    ...(parentLabels[type] ? [{ name: 'parent_id', label: parentLabels[type] }] : []),
    { name: 'status', label: 'Status', type: 'select', defaultValue: 1, options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Inactive' }] }
  ], [label, type])

  const columns = useMemo(() => [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'parent_id', label: 'Parent' },
    { key: 'status', label: 'Status', render: (row) => Number(row.status) === 1 ? 'Active' : 'Inactive' }
  ], [])

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
