import React, { useEffect, useState } from 'react'
import { FileText, Calendar, Trash2, Clock, Search, RefreshCw, Plus, Edit2 } from 'lucide-react'
import api, { assetUrl } from '../lib/api'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10'

export default function Post() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
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

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/posts')
      const data = res.data?.data || res.data || []
      setPosts(data)
      setError('')
    } catch (err) {
      setError('Failed to load posts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post from the community board?')) return
    try {
      await api.delete(`/posts/${id}`)
      setPosts(posts.filter(p => p.id !== id))
      setSuccess('Post deleted and moderated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete post')
    }
  }

  const openCreate = () => {
    setSelected(null)
    setFormData({ title: '', description: '', status: 1, image: null })
    setIsModalOpen(true)
  }

  const openEdit = (post) => {
    setSelected(post)
    setFormData({
      title: post.title || '',
      description: post.description || '',
      status: Number(post.status ?? 1),
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
        await api.put(`/posts/${selected.id}`, payload)
      } else {
        await api.post('/posts', payload)
      }

      await fetchPosts()
      setSuccess('Post saved successfully')
      setIsModalOpen(false)
      setSelected(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const filtered = posts.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-slide-up select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Post Moderator</h2>
          <p className="text-slate-400 text-xs mt-0.5">Moderate community posts, announcements, and timeline activities</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchPosts}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all"
            title="Refresh posts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          <div className="relative group flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          {success}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500/25 border-t-brand-500 animate-spin"></div>
          <span className="text-slate-400 text-xs">Querying announcements board...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <FileText className="w-12 h-12 text-slate-600 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-slate-200">No posts found</h4>
            <p className="text-slate-500 text-xs mt-1">There are no announcements published under this search criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => (
            <div key={post.id} className="relative overflow-hidden bg-[#0d1325]/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group">
              
              {/* Optional image preview */}
              {post.image ? (
                <div className="w-full h-40 bg-slate-950 overflow-hidden relative border-b border-white/[0.06]">
                  <img
                    src={assetUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1020] to-transparent"></div>
                </div>
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-indigo-900/10 to-violet-900/10 border-b border-white/[0.04] flex items-center justify-center text-slate-700">
                  <FileText className="w-8 h-8 opacity-45" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    <span>{post.cdate || 'Recent Announcement'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-white transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mt-2.5 line-clamp-3">
                    {post.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                    <Clock className={`w-3.5 h-3.5 ${post.status === 0 ? 'text-amber-500' : 'text-slate-600'}`} />
                    <span className={post.status === 0 ? 'text-amber-500' : 'text-slate-500'}>
                      {post.status === 0 ? 'Pending Approval' : 'Active Post'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-brand-300 bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/20 hover:border-brand-500/40 transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Moderate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selected ? 'Edit Post' : 'Add Post'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Title *</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={fieldClass} disabled={saving} />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Description *</label>
            <textarea rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={fieldClass} disabled={saving} />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={fieldClass} disabled={saving}>
              <option value={1} className="bg-[#0c1020]">Active</option>
              <option value={0} className="bg-[#0c1020]">Pending (Inactive)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/25" disabled={saving} />
            {selected?.image && <p className="text-[10px] text-slate-500 mt-2">Current image will be kept unless a new file is selected.</p>}
          </div>
          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
