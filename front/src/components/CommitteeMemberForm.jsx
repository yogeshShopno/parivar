import React, { useEffect, useMemo, useState } from 'react'
import { normalizeRoleId } from '../lib/roles'

const fieldClass = 'w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all'

export default function CommitteeMemberForm({ member, roles, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    role_id: '',
    designation: '',
    status: 1,
    image: null
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({
      full_name: member?.name || '',
      phone: member?.phone || '',
      password: '',
      role_id: normalizeRoleId(member?.role_id),
      designation: member?.designation || member?.committee_role || '',
      status: Number(member?.status ?? 1),
      image: null
    })
    setErrors({})
  }, [member])

  const activeRoles = useMemo(() => roles.filter((role) => Number(role.status ?? 1) === 1), [roles])

  const validateImage = (file) => new Promise((resolve) => {
    if (!file) return resolve('')
    if (file.size > 1024 * 1024) return resolve('Image must be 1 MB or smaller')

    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(url)
    resolve(image.width <= 300 && image.height <= 300 ? '' : 'Image must be 300 x 300 px or smaller')
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('Please select a valid image')
    }
    image.src = url
  })

  const validate = async () => {
    const nextErrors = {}
    if (!formData.full_name.trim()) nextErrors.full_name = 'Full name is required'
    if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required'
    if (!member && !formData.password.trim()) nextErrors.password = 'Strong password is required'
    if (formData.password && formData.password.length < 8) nextErrors.password = 'Use at least 8 characters'
    if (!formData.role_id) nextErrors.role_id = 'Role is required'
    if (!formData.designation.trim()) nextErrors.designation = 'Designation is required'
    if (formData.status === '') nextErrors.status = 'Status is required'

    const imageError = await validateImage(formData.image)
    if (imageError) nextErrors.image = imageError

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = await validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = new FormData()
    payload.append('full_name', formData.full_name.trim())
    payload.append('phone', formData.phone.trim())
    payload.append('role_id', formData.role_id)
    payload.append('designation', formData.designation.trim())
    payload.append('committee_role', formData.designation.trim())
    payload.append('status', formData.status)
    payload.append('is_committee', 'true')
    payload.append('relation', 'Self')
    
    if (formData.password) payload.append('password', formData.password)
    if (formData.image) payload.append('image', formData.image)

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[76vh] overflow-y-auto pr-1 select-none">
      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Name *</label>
        <input type="text" placeholder="Enter Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className={fieldClass} disabled={isLoading} />
        {errors.full_name && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.full_name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Phone Number *</label>
          <input type="tel" placeholder="Enter Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={fieldClass} disabled={isLoading} />
          {errors.phone && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">{member ? 'Strong Password' : 'Strong Password *'}</label>
          <input type="password" placeholder="Strong Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={fieldClass} disabled={isLoading} />
          {errors.password && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Role *</label>
          <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} className={fieldClass} disabled={isLoading}>
            <option value="" className="bg-[#0c1020]">Select Role</option>
            {activeRoles.map((role) => <option key={role.id} value={role.id} className="bg-[#0c1020]">{role.name}</option>)}
          </select>
          {errors.role_id && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.role_id}</p>}
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Designation *</label>
          <input type="text" placeholder="Enter Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className={fieldClass} disabled={isLoading} />
          {errors.designation && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.designation}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Status *</label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={fieldClass} disabled={isLoading}>
            <option value="" className="bg-[#0c1020]">Select Status</option>
            <option value={1} className="bg-[#0c1020]">Active</option>
            <option value={0} className="bg-[#0c1020]">Inactive</option>
          </select>
          {errors.status && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.status}</p>}
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Image (300*300 px, Max size 1 mb)</label>
          <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/25" disabled={isLoading} />
          {errors.image && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.image}</p>}
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all disabled:opacity-50">
        {isLoading ? 'Saving...' : member ? 'Save Committee Member' : 'Add Committee Member'}
      </button>
    </form>
  )
}
