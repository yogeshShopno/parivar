import React, { useEffect, useState } from 'react'

const initialState = {
  business_name: '',
  number: '',
  address: '',
  about_us: '',
  website: '',
  facebook: '',
  instagram: '',
  status: 1
}

export default function BusinessForm({ business, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({
      business_name: business?.business_name || '',
      number: business?.number || '',
      address: business?.address || '',
      about_us: business?.about_us || '',
      website: business?.website || '',
      facebook: business?.facebook || '',
      instagram: business?.instagram || '',
      status: Number(business?.status ?? 1)
    })
  }, [business])

  const validate = () => {
    const nextErrors = {}
    if (!formData.business_name.trim()) nextErrors.business_name = 'Business name is required'
    if (!formData.number.trim()) nextErrors.number = 'Primary phone is required'
    if (!formData.address.trim()) nextErrors.address = 'Address is required'
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[76vh] overflow-y-auto pr-1 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Business Name *</label>
          <input
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
            disabled={isLoading}
          />
          {errors.business_name && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.business_name}</p>}
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Primary Phone *</label>
          <input
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
            disabled={isLoading}
          />
          {errors.number && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.number}</p>}
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Address *</label>
        <textarea
          rows="3"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
          disabled={isLoading}
        />
        {errors.address && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">About Business</label>
        <textarea
          rows="4"
          value={formData.about_us}
          onChange={(e) => setFormData({ ...formData, about_us: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Website</label>
          <input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Facebook</label>
          <input
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Instagram</label>
          <input
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Listing Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
          className="w-full md:w-56 bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs outline-none focus:border-brand-500/50 cursor-pointer"
          disabled={isLoading}
        >
          <option value={1} className="bg-[#0c1020]">Active</option>
          <option value={0} className="bg-[#0c1020]">Inactive</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-glow-primary text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? 'Saving business...' : 'Save Business Listing'}
      </button>
    </form>
  )
}
