import React, { useEffect, useMemo, useState } from 'react'
import { Edit2, Image as ImageIcon, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import api, { assetUrl } from '../lib/api'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10'

const createPreviewUrl = (file) => URL.createObjectURL(file)

export default function GalleryPage() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [year, setYear] = useState('')
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])

  const emptyState = useMemo(() => ({
    categoryId: '',
    categoryName: '',
    newCategoryName: '',
    year: '',
    existingImages: [],
    newFiles: [],
    filePreviews: []
  }), [])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      setCategoryId('')
      setCategoryName('')
      setNewCategoryName('')
      setYear('')
      setExistingImages([])
      setNewFiles([])
      setFilePreviews([])
    }
  }, [isModalOpen])

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [filePreviews])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [galleryRes, categoryRes] = await Promise.all([
        api.get('/gallery'),
        api.get('/gallery-categories')
      ])
      setRows(galleryRes.data?.data || [])
      setCategories(categoryRes.data?.data || [])
      setError('')
    } catch (err) {
      setError('Failed to load gallery data')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelected(null)
    setCategoryId('')
    setCategoryName('')
    setNewCategoryName('')
    setYear('')
    setExistingImages([])
    setNewFiles([])
    setFilePreviews([])
    setIsModalOpen(true)
  }

  const openEdit = (row) => {
    setSelected(row)
    setCategoryId(row.gallery_category_id || '')
    setCategoryName(row.category || '')
    setNewCategoryName('')
    setYear(row.year || '')
    setExistingImages(Array.isArray(row.images) ? row.images : [])
    setNewFiles([])
    setFilePreviews([])
    setIsModalOpen(true)
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])
    const previews = files.map((file) => ({ file, url: createPreviewUrl(file) }))
    setNewFiles((current) => [...current, ...files])
    setFilePreviews((current) => [...current, ...previews])
  }

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== index))
  }

  const removeNewImage = (index) => {
    const removed = filePreviews[index]
    if (removed) URL.revokeObjectURL(removed.url)
    setNewFiles(newFiles.filter((_, idx) => idx !== index))
    setFilePreviews(filePreviews.filter((_, idx) => idx !== index))
  }

  const handleCategorySelect = (event) => {
    const selectedId = event.target.value
    setCategoryId(selectedId)
    setNewCategoryName('')
    const category = categories.find((item) => item.id === selectedId)
    setCategoryName(category?.category || '')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      let categoryIdToSave = categoryId
      let titleCategory = categoryName || newCategoryName.trim()

      if (!titleCategory) {
        titleCategory = 'General'
      }

      if (!categoryIdToSave && newCategoryName.trim()) {
        const categoryRes = await api.post('/gallery-categories', { category: newCategoryName.trim() })
        const newCategory = categoryRes.data?.data
        categoryIdToSave = newCategory?.id || ''
        titleCategory = newCategory?.category || newCategoryName.trim()
        await fetchCategories()
      }

      const payload = new FormData()
      payload.append('category', titleCategory)
      if (categoryIdToSave) payload.append('gallery_category_id', categoryIdToSave)
      payload.append('year', year || '')

      existingImages.forEach((image) => payload.append('existing_images', image))
      newFiles.forEach((file) => payload.append('images', file))

      if (selected) {
        await api.put(`/gallery/${selected.id}`, payload)
      } else {
        await api.post('/gallery', payload)
      }

      setSuccess('Gallery saved successfully')
      setIsModalOpen(false)
      setSelected(null)
      await fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save gallery')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete gallery item?`)) return
    try {
      await api.delete(`/gallery/${row.id}`)
      setRows(rows.filter((item) => item.id !== row.id))
      setSuccess('Gallery deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete gallery item')
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/gallery-categories')
      setCategories(res.data?.data || [])
    } catch (err) {
      // ignore category load failure for now
    }
  }

  const filteredRows = rows.filter((row) => {
    const text = JSON.stringify(row).toLowerCase()
    return text.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Gallery</h2>
          <p className="text-text-secondary text-xs mt-0.5">Maintain gallery images and categories</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-secondary/60" />
            <input
              type="search"
              placeholder="Search gallery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-glow-primary">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {error && <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-xs">{error}</div>}
      {success && <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-xs">{success}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
          <span className="text-text-secondary text-xs">Loading gallery...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary text-text-secondary text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Images</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-secondary/40 text-xs text-text">
                    <td className="p-4 max-w-[100px]">
                      {row.images?.[0] ? (
                        <img src={assetUrl(row.images[0])} alt={row.category || 'Gallery'} className="h-12 w-16 rounded-lg object-cover border border-border" />
                      ) : (
                        <span className="text-text-secondary">No image</span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs line-clamp-1">{row.category || 'General'}</td>
                    <td className="p-4">{row.year || '-'}</td>
                    <td className="p-4 text-[10px] text-text-secondary">{row.images?.length ?? 0} image(s)</td>
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
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-xs text-text-secondary">No gallery items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} title={selected ? 'Edit Gallery Item' : 'Add Gallery Item'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1 text-text">
          <div>
            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1.5">Category</label>
            <select value={categoryId} onChange={handleCategorySelect} className={fieldClass} disabled={saving}>
              <option value="" className="bg-surface text-text">Choose existing category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id} className="bg-surface text-text">{item.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1.5">Or add new category</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value)
                setCategoryId('')
                setCategoryName(e.target.value)
              }}
              placeholder="Type new category name"
              className={fieldClass}
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1.5">Year</label>
            <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className={fieldClass} disabled={saving} />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1.5">Gallery Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-xs text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              disabled={saving}
            />
            <p className="mt-2 text-[10px] text-text-secondary">Upload multiple images. Existing images stay unless removed below.</p>
          </div>

          {(existingImages.length > 0 || filePreviews.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative rounded-2xl overflow-hidden border border-border bg-surface-secondary">
                  <img src={assetUrl(image)} alt={`Existing ${index + 1}`} className="h-28 w-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {filePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative rounded-2xl overflow-hidden border border-border bg-surface-secondary">
                  <img src={preview.url} alt={`New ${index + 1}`} className="h-28 w-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase disabled:opacity-50 shadow-glow-primary">
            {saving ? 'Saving...' : 'Save Gallery'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
