import React, { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10'

export default function AdminCrudPage({ title, subtitle, endpoint, fields, columns, getRowTitle }) {
  const emptyForm = useMemo(() => {
    return fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? '' }), {})
  }, [fields])

  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setFormData(emptyForm)
  }, [emptyForm])

  useEffect(() => {
    fetchRows()
  }, [endpoint])

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      setRows(res.data?.data || res.data || [])
      setError('')
    } catch (err) {
      setError(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelected(null)
    setFormData(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (row) => {
    setSelected(row)
    setFormData(fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: row[field.name] ?? row[field.fallback] ?? field.defaultValue ?? ''
    }), {}))
    setIsModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (selected) {
        await api.put(`${endpoint}/${selected.id}`, formData)
      } else {
        await api.post(endpoint, formData)
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
      setRows(rows.filter((item) => item.id !== row.id))
      setSuccess(`${title} deleted successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${title.toLowerCase()}`)
    }
  }

  const filteredRows = rows.filter((row) => {
    const text = JSON.stringify(row).toLowerCase()
    return text.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6 animate-slide-up select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchRows} className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="search"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-brand-500/50"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs">{error}</div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs">{success}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500/25 border-t-brand-500 animate-spin"></div>
          <span className="text-slate-400 text-xs">Loading records...</span>
        </div>
      ) : (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-slate-950/20 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  {columns.map((column) => <th key={column.key} className="p-4">{column.label}</th>)}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] text-xs text-slate-300">
                    {columns.map((column) => (
                      <td key={column.key} className="p-4 max-w-md">
                        <span className="line-clamp-2">{column.render ? column.render(row) : row[column.key] || '-'}</span>
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(row)} className="p-2 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-12 text-center text-xs text-slate-500">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selected ? `Edit ${title}` : `Add ${title}`} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea rows="4" value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving} />
              ) : field.type === 'select' ? (
                <select value={formData[field.name] ?? ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving}>
                  {field.options.map((option) => <option key={option.value} value={option.value} className="bg-[#0c1020]">{option.label}</option>)}
                </select>
              ) : (
                <input type={field.type || 'text'} value={formData[field.name] || ''} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className={fieldClass} disabled={saving} />
              )}
            </div>
          ))}
          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
