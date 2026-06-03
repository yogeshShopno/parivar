import React, { useCallback, useEffect, useState } from 'react'
import { FileText, Calendar, Trash2, Clock, Search, RefreshCw, Plus, Edit2 } from 'lucide-react'
import api, { assetUrl, getNewsList } from '../lib/api'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10'
const limit = 10

export default function News() {
  const [newsList, setNewsList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearchValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 1,
    image: null
  })

  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1)
  const currentPage = Math.min(Math.max(Number(pagination.page) || page || 1, 1), totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNewsList({ page, limit, search })
      const rows = res.data?.data || res.data || []
      const pg = res.data?.pagination || {}
      setNewsList(Array.isArray(rows) ? rows : [])
      setPagination({
        page: Number(pg.page || page),
        totalPages: Number(pg.totalPages || pg.total_pages || pg.last_page || 1),
        total: Number(pg.total || 0),
        limit: Number(pg.limit || limit)
      })
    } catch (err) {
      setNewsList([])
      setPagination({ page, totalPages: 1, total: 0, limit })
      setError(err.response?.data?.message || 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const setSearch = (value) => {
    setSearchValue(value)
    setPage(1)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news announcement from the community board?')) return
    try {
      await api.delete(`/news/${id}`)
      await fetchNews()
      setSuccess('News announcement deleted and moderated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete news announcement')
    }
  }

  const openCreate = () => {
    setSelected(null)
    setFormData({ title: '', description: '', status: 1, image: null })
    setIsModalOpen(true)
  }

  const openEdit = (newsItem) => {
    setSelected(newsItem)
    setFormData({
      title: newsItem.title || '',
      description: newsItem.description || '',
      status: Number(newsItem.status ?? 1),
      image: null
    })
    setIsModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('description', formData.description)
      payload.append('status', formData.status)
      if (formData.image) payload.append('image', formData.image)

      if (selected) {
        await api.put(`/news/${selected.id}`, payload)
      } else {
        await api.post('/news', payload)
      }

      await fetchNews()
      setSuccess('Feed News saved successfully')
      setIsModalOpen(false)
      setSelected(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feed News')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Feed Moderator</h2>
       
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchNews}
            className="flex items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all"
            title="Refresh News"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow-primary"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          <div className="relative group flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-secondary/60">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search feed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-sm flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-sm flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          {success}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
          <span className="text-text-secondary text-sm">Querying announcements board...</span>
        </div>
      ) : newsList.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <FileText className="w-12 h-12 text-text-secondary/40 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-text">No News found</h4>
            <p className="text-text-secondary text-sm mt-1">There are no announcements published under this search criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((newsItem) => (
            <div key={newsItem.id} className="relative overflow-hidden bg-card border border-border hover:border-text-secondary/20 rounded-2xl shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group">
              
              {/* Optional image preview */}
              {newsItem.image ? (
                <div className="w-full h-40 bg-surface-secondary overflow-hidden relative border-b border-border">
                  <img
                    src={assetUrl(newsItem.image)}
                    alt={newsItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                </div>
              ) : (
                <div className="w-full h-24 bg-primary/5 border-b border-border flex items-center justify-center text-text-secondary">
                  <FileText className="w-8 h-8 opacity-45" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{newsItem.cdate || 'Recent Announcement'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">
                    {newsItem.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary leading-relaxed mt-2.5 line-clamp-3">
                    {newsItem.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-bold uppercase">
                    <Clock className={`w-3.5 h-3.5 ${newsItem.status === 0 ? 'text-warning' : 'text-text-secondary/60'}`} />
                    <span className={newsItem.status === 0 ? 'text-warning' : 'text-text-secondary'}>
                      {newsItem.status === 0 ? 'Pending Approval' : 'Active News'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(newsItem)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(newsItem.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider text-error-text bg-error-bg hover:bg-error/20 border border-error-border hover:border-error/40 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Moderate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border border-border bg-surface-secondary/40 rounded-xl text-sm">
          <span className="text-text-secondary">
            Page {pagination.page} of {pagination.totalPages} {pagination.total ? `(${pagination.total} total)` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {pageNumbers.map((item) => (
              <button
                key={item}
                type="button"
                disabled={loading || item === currentPage}
                onClick={() => setPage(item)}
                className={`min-w-10 px-3 py-2 rounded-lg border transition-all ${
                  item === currentPage
                    ? 'border-primary bg-primary/10 text-primary font-semibold disabled:opacity-100 disabled:cursor-default'
                    : 'border-border bg-card text-text hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {item}
              </button>
            ))}
            <button type="button" disabled={loading || page >= pagination.totalPages} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} className="px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selected ? 'Edit Feed News' : 'Add Feed News'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1 text-text">
          <div>
            <label className="block text-sm uppercase font-bold text-text-secondary mb-1.5">Title *</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={fieldClass} disabled={saving} />
          </div>
          <div>
            <label className="block text-sm uppercase font-bold text-text-secondary mb-1.5">Description *</label>
            <textarea rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={fieldClass} disabled={saving} />
          </div>
          <div>
            <label className="block text-sm uppercase font-bold text-text-secondary mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={fieldClass} disabled={saving}>
              <option value={1} className="bg-surface text-text">Active</option>
              <option value={0} className="bg-surface text-text">Pending (Inactive)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm uppercase font-bold text-text-secondary mb-1.5">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} className="w-full text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20" disabled={saving} />
            {selected?.image && <p className="text-sm text-text-secondary mt-2">Current image will be kept unless a new file is selected.</p>}
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-sm tracking-wider uppercase disabled:opacity-50 shadow-glow-primary">
            {saving ? 'Saving...' : 'Save Feed News'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
