import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Edit2, Image as ImageIcon, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import api, { assetUrl } from '../lib/api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import usePaginatedApi from '../hooks/usePaginatedApi'

const fieldClass = 'w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10'

export default function AdminCrudPage({ title, subtitle, endpoint, fields, columns, getRowTitle }) {
  const emptyForm = useMemo(() => {
    return fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? '' }), {})
  }, [fields])

  const fetcher = useCallback((params) => api.get(endpoint, { params }), [endpoint])

  const {
    data: rows,
    pagination,
    loading,
    search,
    setSearch,
    setPage,
    refetch: fetchRows
  } = usePaginatedApi(fetcher, { initialLimit: 10 })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [remoteOptions, setRemoteOptions] = useState({})

  useEffect(() => {
    setFormData(emptyForm)
  }, [emptyForm])

  const openCreate = () => {
    setSelected(null)
    setFormData(emptyForm)
    loadRemoteOptions(fields)
    setIsModalOpen(true)
  }

  const openEdit = async (row) => {
    setSelected(row)
    setIsModalOpen(true)
    
    // Set initial values from the row list data immediately
    setFormData(fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'file' ? '' : row[field.name] ?? row[field.fallback] ?? field.defaultValue ?? ''
    }), {}))

    try {
      // Fetch fresh, absolute latest data from the backend by ID
      const res = await api.get(`${endpoint}/${row.id}`)
      const freshData = res.data?.data || res.data
      if (freshData) {
        setFormData(fields.reduce((acc, field) => ({
          ...acc,
          [field.name]: field.type === 'file' ? '' : freshData[field.name] ?? freshData[field.fallback] ?? field.defaultValue ?? ''
        }), {}))
      }
    } catch (err) {
      console.error("Failed to fetch fresh row data:", err)
      // Fallback: keep the initial local row data in the form
    }
    loadRemoteOptions(fields)
  }

  const loadRemoteOptions = async (fieldsList) => {
    const remoteFields = (fieldsList || []).filter((f) => f.type === 'select-remote')
    if (!remoteFields.length) return
    const results = {}
    await Promise.all(remoteFields.map(async (f) => {
      try {
        const res = await api.get(f.source)
        results[f.name] = res.data?.data || res.data || []
      } catch (e) {
        results[f.name] = []
      }
    }))
    setRemoteOptions((prev) => ({ ...prev, ...results }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const hasFiles = fields.some((field) => field.type === 'file' && (
        formData[field.name] instanceof File ||
        formData[field.name] instanceof FileList ||
        Array.isArray(formData[field.name])
      ))
      const payload = hasFiles ? new FormData() : formData

      if (hasFiles) {
        fields.forEach((field) => {
          const value = formData[field.name]
          if (field.type === 'file') {
            const files = value instanceof FileList ? Array.from(value) : Array.isArray(value) ? value : value ? [value] : []
            files.forEach((file) => payload.append(field.name, file))
          } else {
            payload.append(field.name, value ?? '')
          }
        })
      }

      if (selected) {
        await api.put(`${endpoint}/${selected.id}`, payload)
      } else {
        await api.post(endpoint, payload)
      }
      await fetchRows()
      setSuccess(`${title} saved successfully`)
      setIsModalOpen(false)
      setSelected(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to save ${title.toLowerCase()}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${getRowTitle?.(row) || row.title || row.name || 'this record'}?`)) return
    try {
      await api.delete(`${endpoint}/${row.id}`)
      await fetchRows()
      setSuccess(`${title} deleted successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${title.toLowerCase()}`)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">{title}</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchRows} className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-secondary/60" />
            <input
              type="search"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow-primary">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {error && <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-sm">{error}</div>}
      {success && <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-sm">{success}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
          <span className="text-text-secondary text-sm">Loading records...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary text-text-secondary text-sm font-bold uppercase tracking-wider">
                  {columns.map((column) => <th key={column.key} className="p-4">{column.label}</th>)}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-secondary/40 text-sm text-text">
                    {columns.map((column) => (
                      <td key={column.key} className="p-4 max-w-md">
                        {column.type === 'image' && row[column.key] ? (
                          <img src={assetUrl(row[column.key])} alt={row.title || title} className="h-12 w-16 rounded-lg object-cover border border-border" />
                        ) : (
                          <span className="line-clamp-2">{column.render ? column.render(row) : row[column.key] || '-'}</span>
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(row)} className="p-2 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-2 text-error-text bg-error-bg hover:bg-error/20 border border-error-border rounded-xl" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-12 text-center text-sm text-text-secondary">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} loading={loading} />
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selected ? `Edit ${title}` : `Add ${title}`} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1 text-text">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm uppercase font-bold text-text-secondary mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea rows="4" value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving} />
                ) : field.type === 'select' ? (
                  <select value={formData[field.name] ?? ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving}>
                    <option value="" className="bg-surface text-text">Select {field.label}</option>
                    {field.options.map((option) => <option key={option.value} value={option.value} className="bg-surface text-text">{option.label}</option>)}
                  </select>
                ) : field.type === 'select-remote' ? (
                  <select value={formData[field.name] ?? ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving}>
                    <option value="" className="bg-surface text-text">Select {field.label}</option>
                    {(remoteOptions[field.name] || []).map((option) => (
                      <option key={option.id} value={option.id} className="bg-surface text-text">{option.name || option.country || option.state || option.city || option.business}</option>
                    ))}
                  </select>
                ) : field.type === 'file' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept={field.accept || 'image/*'}
                      multiple={field.multiple}
                      onChange={(e) => setFormData({ ...formData, [field.name]: field.multiple ? e.target.files : e.target.files?.[0] || '' })}
                      className="w-full text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                      disabled={saving}
                    />
                    {selected?.image && !field.multiple && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Current image will be kept unless a new file is selected.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input type={field.type || 'text'} value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving} />
                )}
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-sm tracking-wider uppercase disabled:opacity-50 shadow-glow-primary">
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
