import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { normalizeRoleId } from '../lib/roles'

export default function UserForm({ user, roles = [], onSubmit, isLoading }) {
  const { user: loggedInUser } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    number: '',
    gender: '',
    dob: '',
    anniversary: '',
    blood_group: '',
    relation: 'Self',
    is_committee: false,
    committee_role: '',
    role_id: '',
    address: '',
    status: 0
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      // Format ISO date to YYYY-MM-DD for date inputs
      let formattedDob = ''
      let formattedAnniversary
      if (user.dob) {
        const d = new Date(user.dob)
        if (!isNaN(d.getTime())) {
          formattedDob = d.toISOString().slice(0, 10)
        }
      }
      if (user.anniversary) {
        const d = new Date(user.anniversary)
        if (!isNaN(d.getTime())) {
          formattedAnniversary = d.toISOString().slice(0, 10)
        }
      }

      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        number: user.number || '',
        gender: user.gender || '',
        dob: formattedDob,
        anniversary: formattedAnniversary ,
        blood_group: user.blood_group || '',
        relation: user.relation || 'Self',
        is_committee: user.is_committee || false,
        committee_role: user.committee_role || '',
        role_id: normalizeRoleId(user.role_id),
        address: user.address || '',
        status: user.status || 0
      })
    } else {
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        number: '',
        gender: '',
        dob: '',
        anniversary: '',
        anniversary: '',
        blood_group: '',
        relation: 'Self',
        is_committee: false,
        committee_role: '',
        role_id: '',
        address: '',
        status: 0
      })
    }
  }, [user])

  const activeRoles = useMemo(() => roles.filter((role) => Number(role.status ?? 1) === 1), [roles])
  const isEditingSelf = Boolean(user && loggedInUser && [
    user._id,
    user.id,
    user.member_id
  ].some((value) => value && [
    loggedInUser._id,
    loggedInUser.id,
    loggedInUser.member_id
  ].some((current) => current && String(current) === String(value))))
  const canManageRoleFields = loggedInUser?.role === 'admin'

  const validate = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.number.trim()) newErrors.number = 'number is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
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
    const payload = { ...formData }

    if (!canManageRoleFields || isEditingSelf) {
      delete payload.role_id
      delete payload.committee_role
      delete payload.is_committee
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 select-none text-text">

      {/* SECTION 1: Personal Name details */}
      <div>
        <h4 className="text-sm font-semibold  tracking-widest text-primary mb-3">Primary Identity</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">First Name *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              disabled={isLoading}
            />
            {errors.first_name && <p className="text-error-text text-sm mt-1 font-semibold">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Middle Name</label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Contact & Authentication */}
      <div>
        <h4 className="text-sm font-semibold  tracking-widest text-primary mb-3">Contact & Login Credentials</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              disabled={isLoading}
            />
            {errors.email && <p className="text-error-text text-sm mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Mobile Number *</label>
            <input
              type="tel"
              value={formData.number}
              maxLength={10}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              disabled={isLoading}
            />
            {errors.number && <p className="text-error-text text-sm mt-1 font-semibold">{errors.number}</p>}
          </div>


        </div>
      </div>

      {/* SECTION 3: Bio Metrics & Relation */}
      <div>
        <h4 className="text-sm font-semibold  tracking-widest text-primary mb-3">Family </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Relationship</label>
            <select
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              className="w-full bg-input-bg text-text border border-border rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
              disabled={isLoading}
            >
              {['Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other'].map(rel => (
                <option key={rel} value={rel} className="bg-surface text-text">{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-input-bg text-text border border-border rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary/50 cursor-pointer"
              disabled={isLoading}
            >
              <option value="" className="bg-surface text-text">Unspecified</option>
              <option value="Male" className="bg-surface text-text">Male</option>
              <option value="Female" className="bg-surface text-text">Female</option>
              <option value="Other" className="bg-surface text-text">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3 py-2 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Anniversary</label>
            <input
              type="date"
              value={formData.anniversary}
              onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
              className="w-full px-3 py-2 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
              disabled={isLoading}
            />
          </div>



          <div className="" >
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Status</label>
            <div className="flex align-center item-center gap-2">
              <input
                className="h-5 w-5 px-3 py-2 self-end"
                type="checkbox"
                id="status"
                name="Approved"
                checked={formData.status == 1 || formData.status == '1'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                disabled={isLoading}
              /> <span className=''>
                {formData.status == 1 ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 
      {canManageRoleFields && (
        <div>
          <h4 className="text-sm font-semibold  tracking-widest text-primary mb-3">Roles & Committee Status</h4>
          <div className="bg-surface-secondary border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_committee}
                onChange={(e) => setFormData({ ...formData, is_committee: e.target.checked })}
                className="w-4.5 h-4.5 rounded bg-input-bg border-border text-primary focus:ring-primary/10 transition cursor-pointer"
                disabled={isLoading || isEditingSelf}
                title={isEditingSelf ? 'You cannot change your own role' : undefined}
              />
              <div className="text-sm">
                <div className="font-semibold text-text">Flag as Committee Member</div>
                <div className="text-sm text-text-secondary">Grants administrative privileges in core app</div>
              </div>
            </label>

            {formData.is_committee && (
              <div className="flex-1 w-full animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Admin Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full bg-input-bg text-text border border-border rounded-xl py-2.5 px-3 text-sm outline-none focus:border-primary/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading || isEditingSelf}
                    title={isEditingSelf ? 'You cannot change your own role' : undefined}
                  >
                    <option value="" className="bg-surface text-text">Select Role</option>
                    {activeRoles.map((role) => <option key={role.id} value={role.id} className="bg-surface text-text">{role.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Committee Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. President, Vice President, Secretary"
                    value={formData.committee_role}
                    onChange={(e) => setFormData({ ...formData, committee_role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading || isEditingSelf}
                    title={isEditingSelf ? 'You cannot change your own role' : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* SECTION 5: Address */}
      <div >
        <h4 className="text-sm font-semibold  tracking-widest text-primary mb-3">Address</h4>
        <div>
          <label className="block text-sm  font-semibold text-text-secondary mb-1.5">Home </label>
          <textarea
            rows="3"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2.5 bg-input-bg text-text border border-border focus:border-primary/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            disabled={isLoading}
          />
        </div>

      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex justify-self-end mt-4 bg-primary hover:bg-primary-hover text-white p-3 rounded-xl font-semibold text-sm tracking-wider  transition-all duration-300 disabled:opacity-50 shadow-glow-primary"
      >
        {isLoading ? 'Processing ...' : user ? 'Save Changes' : 'Add Member'}
      </button>
    </form>
  )
}
