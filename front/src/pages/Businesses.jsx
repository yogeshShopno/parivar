import React, { useEffect, useState } from 'react'
import { Briefcase, MapPin, Phone, Globe, Trash2, Search, Edit2, RefreshCw, Plus } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import BusinessForm from '../components/BusinessForm'

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/businesses')
      const data = res.data?.data || res.data || []
      setBusinesses(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch business directory')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business listing?')) return
    try {
      await api.delete(`/businesses/${id}`)
      setBusinesses(businesses.filter(b => b.id !== id))
      setSuccess('Business listing deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete business listing')
    }
  }

  const handleEdit = (business) => {
    setSelectedBusiness(business)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedBusiness(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBusiness(null)
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setError('')
    try {
      if (selectedBusiness) {
        await api.put(`/businesses/${selectedBusiness.id}`, formData)
      } else {
        await api.post('/businesses', formData)
      }
      await fetchBusinesses()
      setSuccess(`Business listing ${selectedBusiness ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      setSelectedBusiness(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update business listing')
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = businesses.filter(b => 
    b.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.about_us?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-slide-up select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Business Directory</h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage and moderate community businesses and enterprise registries</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchBusinesses}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all"
            title="Refresh listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
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
              placeholder="Search listings..."
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
          <span className="text-slate-400 text-xs">Querying businesses directory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <Briefcase className="w-12 h-12 text-slate-600 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-slate-200">No businesses found</h4>
            <p className="text-slate-500 text-xs mt-1">There are no business directories registered under this search criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(biz => (
            <div key={biz.id} className="relative overflow-hidden bg-[#0d1325]/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group">
              
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-brand-500/15 border border-brand-500/25 text-brand-300 font-bold text-[10px] uppercase tracking-wide">
                        {biz.business_category_name || 'Community Enterprise'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${Number(biz.status) === 1 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-white/[0.06]'}`}>
                        {Number(biz.status) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-2.5 tracking-tight group-hover:text-white transition-colors">
                      {biz.business_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(biz)}
                      className="p-2.5 text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl transition-all"
                      title="Edit Enterprise"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(biz.id)}
                      className="p-2.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                      title="Remove Enterprise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* About description */}
                <p className="text-xs text-slate-400 leading-relaxed mt-4 line-clamp-3">
                  {biz.about_us || 'No business description provided by the enterprise owner. Contact the primary administrator for further details.'}
                </p>
              </div>

              {/* Action contacts and tags */}
              <div className="mt-6 pt-4 border-t border-white/[0.04] space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  <span>Primary: </span>
                  <span className="font-semibold text-slate-300 font-mono">{biz.number}</span>
                </div>
                <div className="flex items-start gap-2 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{biz.address}</span>
                </div>
                
                {biz.website && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 hover:underline font-semibold font-mono truncate">
                      {biz.website.replace(/^https?:\/\//i, '')}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Bottom colored indicator stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-teal-500 opacity-25 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={selectedBusiness ? 'Edit Business Listing' : 'Add Business Listing'}
        onClose={handleCloseModal}
      >
        <BusinessForm business={selectedBusiness} onSubmit={handleSubmit} isLoading={formLoading} />
      </Modal>
    </div>
  )
}
