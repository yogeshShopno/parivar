import React, { useEffect, useMemo, useState } from 'react'
import { Edit2, Image as ImageIcon, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import api, { assetUrl } from '../lib/api'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10'

const defaultForm = {
  title: '',
  description: '',
  event_date: '',
  event_location: '',
  location_link: '',
  event_category_id: '',
  event_category_name: '',
  entry_type: 'free',
  start_time: '',
  end_time: '',
  image: ''
}

export default function Events() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [existingImage, setExistingImage] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [categories, setCategories] = useState([])

  const endpoint = '/events'

  const fetchCategories = async () => {
    try {
      const res = await api.get('/masters/event-category')
      setCategories(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load event categories:', err)
      setCategories([])
    }
  }

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      setRows(res.data?.data || res.data || [])
      setError('')
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchRows()
  }, [])

  const resetForm = () => {
    setSelectedId('')
    setExistingImage('')
    setFormData(defaultForm)
  }

  const openCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEdit = async (row) => {
    const id = row.id || row._id || ''
    setSelectedId(id)
    setExistingImage(row.image || '')
    setFormData({
      title: row.title || row.event_name || '',
      description: row.description || '',
      event_date: row.event_date || '',
      event_location: row.event_location || row.venue || '',
      location_link: row.location_link || '',
      event_category_id: row.event_category_id || '',
      event_category_name: row.event_category_name || '',
      entry_type: row.entry_type || 'free',
      start_time: row.start_time || '',
      end_time: row.end_time || '',
      image: ''
    })
    setIsModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const hasFile = formData.image instanceof FileList ? formData.image.length > 0 : formData.image instanceof File
      const payload = hasFile ? new FormData() : {}

      if (hasFile) {
        payload.append('image', formData.image[0] || formData.image)
      }

      const bodyFields = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        event_location: formData.event_location,
        location_link: formData.location_link,
        event_category_id: formData.event_category_id,
        event_category_name: formData.event_category_name,
        entry_type: formData.entry_type,
        start_time: formData.start_time,
        end_time: formData.end_time
      }

      if (hasFile) {
        Object.entries(bodyFields).forEach(([key, value]) => {
          payload.append(key, value ?? '')
        })
      } else {
        Object.entries(bodyFields).forEach(([key, value]) => {
          if (value !== '' && value !== undefined && value !== null) {
            payload[key] = value
          }
        })
      }

      if (selectedId) {
        await api.put(`${endpoint}/${selectedId}`, payload)
      } else {
        await api.post(endpoint, payload)
      }

      await fetchRows()
      setSuccess('Event saved successfully')
      setIsModalOpen(false)
      resetForm()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    const id = row.id || row._id || ''
    if (!id) return
    if (!window.confirm(`Delete ${row.title || row.event_name || 'this event'}?`)) return
    try {
      await api.delete(`${endpoint}/${id}`)
      setRows(rows.filter((item) => (item.id || item._id) !== id))
      setSuccess('Event deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event')
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
          <h2 className="text-xl font-bold text-white">Events</h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage event listings and calendar details</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchRows} className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="search"
              placeholder="Search events..."
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
          <span className="text-slate-400 text-xs">Loading events...</span>
        </div>
      ) : (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-slate-950/20 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">Image</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRows.map((row) => (
                  <tr key={row.id || row._id} className="hover:bg-white/[0.02] text-xs text-slate-300">
                    <td className="p-4 max-w-[120px]">
                      {row.image ? (
                        <img src={assetUrl(row.image)} alt={row.title || row.event_name || 'Event'} className="h-12 w-16 rounded-lg object-cover border border-white/[0.08]" />
                      ) : (
                        <span className="text-slate-500">No image</span>
                      )}
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-semibold">{row.title || row.event_name || '-'}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-2">{row.description || '-'}</div>
                    </td>
                    <td className="p-4">{row.event_date || '-'}</td>
                    <td className="p-4">{row.event_location || '-'}</td>
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
                    <td colSpan={5} className="p-12 text-center text-xs text-slate-500">No events found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selectedId ? 'Edit Event' : 'Add Event'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={fieldClass} disabled={saving} />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Description</label>
            <textarea rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={fieldClass} disabled={saving} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Event Date</label>
              <input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} className={fieldClass} disabled={saving} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Start Time</label>
              <input type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className={fieldClass} disabled={saving} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">End Time</label>
              <input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className={fieldClass} disabled={saving} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Entry Type</label>
              <select value={formData.entry_type} onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })} className={fieldClass} disabled={saving}>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Category</label>
            <select
              value={formData.event_category_id}
              onChange={(e) => {
                const selectedOption = categories.find((item) => String(item.id) === String(e.target.value)) || {}
                setFormData({
                  ...formData,
                  event_category_id: e.target.value,
                  event_category_name: selectedOption.name || ''
                })
              }}
              className={fieldClass}
              disabled={saving}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

        

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Location</label>
            <input type="text" value={formData.event_location} onChange={(e) => setFormData({ ...formData, event_location: e.target.value })} className={fieldClass} disabled={saving} />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Location Link</label>
            <input type="text" value={formData.location_link} onChange={(e) => setFormData({ ...formData, location_link: e.target.value })} className={fieldClass} disabled={saving} />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files })}
              className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/25"
              disabled={saving}
            />
            {existingImage && !formData.image && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Current image will be kept unless a new file is selected.</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Event'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
