import React, { useCallback, useEffect, useState } from 'react'
import { Briefcase, MapPin, Phone, Globe, Trash2, Search, Edit2, RefreshCw, Plus, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api, { assetUrl, getBusinessesList } from '../lib/api'
import Modal from '../components/Modal'
import BusinessForm from '../components/BusinessForm'
import usePagination from '../hooks/usePagination'

const limit = 10

export default function Businesses() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const { page, totalPages, total, setPage, setPaginationData, getParams, resetPage } = usePagination(limit)
  const [loading, setLoading] = useState(false)
  const [search, setSearchValue] = useState('')
  const [isOwn, setIsOwn] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentPage = Math.min(Math.max(page || 1, 1), totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBusinessesList(getParams({ search, is_own: isOwn }))
      const rows = res.data?.data || res.data || []
      const pg = res.data?.pagination || {}
      setBusinesses(Array.isArray(rows) ? rows : [])
      setPaginationData(pg)
    } catch (err) {
      setBusinesses([])
      setPaginationData({ page: 1, totalPages: 1, total: 0 })
      setError(err.response?.data?.message || 'Failed to load businesses')
    } finally {
      setLoading(false)
    }
  }, [page, search, isOwn, getParams, setPaginationData])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const setSearch = (value) => {
    setSearchValue(value)
    resetPage()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business listing?')) return
    try {
      await api.delete(`/businesses/${id}`)
      await fetchBusinesses()
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

  const handleView = (business) => {
    navigate(`/businesses/${business.id}`, { state: { business } })
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
      const payload = new FormData()

      // Append all text fields
      const textFields = [
        'business_category_id','business_name','number','whatsapp_number',
        'GST_number','email','country_id','state_id','city_id','address',
        'location_link','about_us','website','facebook','instagram',
        'pinterest','youtube','status'
      ]
      textFields.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          payload.append(key, formData[key])
        }
      })

      // Profile image — multer field name is 'image'
      if (formData.image instanceof File) {
        payload.append('image', formData.image)
      } else {
        payload.append('existing_image', formData.image || '')
      }

      // Gallery images — append as gallery_image_1, gallery_image_2, ...
      const galleryFiles = (formData.gallery_images || []).filter(f => f instanceof File)
      galleryFiles.forEach((file, idx) => {
        payload.append(`gallery_image_${idx + 1}`, file)
      })

      // Keep existing images (URLs that are strings)
      const existingImages = (formData.gallery_images || []).filter(f => typeof f === 'string' && f.trim())
      existingImages.forEach(img => {
        payload.append('existing_images', img)
      })

      let res;
      if (selectedBusiness) {
        res = await api.put(`/businesses/${selectedBusiness.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/businesses', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      const savedData = res.data?.data || res.data;
      await fetchBusinesses()

      setSuccess(`Business listing ${selectedBusiness ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      setSelectedBusiness(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update business listing')
      console.error(err)
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = businesses

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Business Directory</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchBusinesses}
            className="flex items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all"
            title="Refresh listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow-primary"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          <label className="flex items-center gap-2 cursor-pointer bg-surface border border-border px-4 py-2.5 rounded-xl">
            <input
              type="checkbox"
              checked={isOwn}
              onChange={(e) => {
                setIsOwn(e.target.checked)
                resetPage()
              }}
              className="rounded text-primary focus:ring-primary/20 bg-input-bg border-border"
            />
            <span className="text-sm font-medium text-text-secondary select-none">My Businesses</span>
          </label>
          <div className="relative group flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-secondary/60">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search listings..."
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
          <span className="text-text-secondary text-sm">Querying businesses directory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <Briefcase className="w-12 h-12 text-text-secondary/40 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-text">No businesses found</h4>
            <p className="text-text-secondary text-sm mt-1">There are no business directories registered under this search criteria</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(biz => (
            <div key={biz.id} className="relative overflow-hidden bg-card border border-border hover:border-text-secondary/20 rounded-2xl p-6 shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group">

              <div>
                {/* Header card info */}
                <div className="flex items-start gap-4">
                  {/* Profile/Logo Image */}
                  {biz.image ? (
                    <img 
                      src={biz.image} 
                      alt={biz.business_name} 
                      className="w-14 h-14 rounded-xl object-cover border border-border shadow-md shrink-0 bg-surface-secondary"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-border bg-surface-secondary flex items-center justify-center text-text-secondary shrink-0">
                      <Briefcase className="w-6 h-6 text-text-secondary/50" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-sm  tracking-wide">
                        {biz.business_category_name || 'Community Enterprise'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold ${Number(biz.status) === 1 ? 'bg-success-bg text-success-text border border-success-border' : 'bg-surface-secondary text-text-secondary border border-border'}`}>
                        {Number(biz.status) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-text mt-2 tracking-tight group-hover:text-primary transition-colors truncate">
                      {biz.business_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(biz)}
                      className="p-2 text-text hover:text-black bg-white hover:bg-surface-secondary border border-border rounded-xl transition-all"
                      title="View Business Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(biz)}
                      className="p-2 text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all"
                      title="Edit Enterprise"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(biz.id)}
                      className="p-2 text-error-text hover:text-error bg-error-bg hover:bg-error/20 border border-error-border rounded-xl transition-all"
                      title="Remove Enterprise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* About description */}
                <p className="text-sm text-text-secondary leading-relaxed mt-4 line-clamp-3">
                  {biz.about_us || 'No business description provided by the enterprise owner. Contact the primary administrator for further details.'}
                </p>

                {/* Gallery Showcase */}
                {biz.gallery_images && biz.gallery_images.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm  font-bold text-text-secondary mb-1.5 tracking-wider">Showroom Gallery</label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {biz.gallery_images.map((img, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-surface-secondary group/img">
                          <img 
                            src={img} 
                            alt={`gallery-${idx}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action contacts and tags */}
              <div className="mt-6 pt-4 border-t border-border space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Primary: </span>
                  <span className="font-semibold text-text font-mono">{biz.number}</span>
                </div>
                <div className="flex items-start gap-2 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  <span className="text-text">{biz.address}</span>
                </div>

                {biz.website && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover hover:underline font-semibold font-mono truncate">
                      {biz.website.replace(/^https?:\/\//i, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom colored indicator stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-success opacity-25 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border border-border bg-surface-secondary/40 rounded-xl text-sm">
          <span className="text-text-secondary">
            Page {page} of {totalPages} {total ? `(${total} total)` : ''}
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
            <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
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
