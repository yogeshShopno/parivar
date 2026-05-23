import React, { useEffect, useState } from 'react'

export default function UserForm({ user, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    blood_group: '',
    relation: 'Self',
    is_committee: false,
    committee_role: '',
    address: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      // Format ISO date to YYYY-MM-DD for date inputs
      let formattedDob = ''
      if (user.dob) {
        const d = new Date(user.dob)
        if (!isNaN(d.getTime())) {
          formattedDob = d.toISOString().slice(0, 10)
        }
      }

      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dob: formattedDob,
        blood_group: user.blood_group || '',
        relation: user.relation || 'Self',
        is_committee: user.is_committee || false,
        committee_role: user.committee_role || '',
        address: user.address || '',
        password: ''
      })
    } else {
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        blood_group: '',
        relation: 'Self',
        is_committee: false,
        committee_role: '',
        address: '',
        password: ''
      })
    }
  }, [user])

  const validate = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }
    if (!user && !formData.password?.trim()) {
      newErrors.password = 'Password is required for new accounts'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 select-none">
      
      {/* SECTION 1: Personal Name details */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-3">Primary Identity</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">First Name *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
            {errors.first_name && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Middle Name</label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Contact & Authentication */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-3">Contact & Login Credentials</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
            {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
            {errors.phone && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              {user ? 'Reset Password (optional)' : 'Password *'}
            </label>
            <input
              type="password"
              placeholder={user ? 'Leave blank to keep' : '••••••••'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              disabled={isLoading}
            />
            {errors.password && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 3: Bio Metrics & Relation */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-3">Family Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Relationship</label>
            <select
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs outline-none focus:border-brand-500/50 cursor-pointer"
              disabled={isLoading}
            >
              {['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'].map(rel => (
                <option key={rel} value={rel} className="bg-[#0c1020]">{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs outline-none focus:border-brand-500/50 cursor-pointer"
              disabled={isLoading}
            >
              <option value="" className="bg-[#0c1020]">Unspecified</option>
              <option value="Male" className="bg-[#0c1020]">Male</option>
              <option value="Female" className="bg-[#0c1020]">Female</option>
              <option value="Other" className="bg-[#0c1020]">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950/40 text-slate-300 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all cursor-pointer"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Blood Group</label>
            <select
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs outline-none focus:border-brand-500/50 cursor-pointer"
              disabled={isLoading}
            >
              <option value="" className="bg-[#0c1020]">Unknown</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg} className="bg-[#0c1020]">{bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Operations & Roles */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-3">Roles & Committee Status</h4>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.is_committee}
              onChange={(e) => setFormData({ ...formData, is_committee: e.target.checked })}
              className="w-4.5 h-4.5 rounded bg-slate-950/40 border-white/[0.08] text-brand-500 focus:ring-brand-500/10 transition cursor-pointer"
              disabled={isLoading}
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Flag as Committee Member</div>
              <div className="text-[10px] text-slate-500">Grants administrative privileges in core app</div>
            </div>
          </label>

          {formData.is_committee && (
            <div className="flex-1 w-full animate-fade-in">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Committee Designation Role Name</label>
              <input
                type="text"
                placeholder="e.g. President, Vice President, Secretary"
                value={formData.committee_role}
                onChange={(e) => setFormData({ ...formData, committee_role: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: Address */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-3">Residential Location</h4>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Home / Office Address</label>
          <textarea
            rows="3"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-glow-primary text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? 'Processing registry update...' : user ? 'Save Changes' : 'Confirm Registry Entry'}
      </button>
    </form>
  )
}
