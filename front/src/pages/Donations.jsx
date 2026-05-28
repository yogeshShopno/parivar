import React, { useEffect, useState } from 'react'
import {
  HeartHandshake,
  Trash2,
  Search,
  Edit2,
  RefreshCw,
  Plus,
  IndianRupee,
  MapPin,
  CalendarDays,
  User2
} from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'

export default function Donations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [filters, setFilters] = useState({
    donator_name: '',
    location: '',
    donation_purpose: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.donator_name) params.append('donator_name', filters.donator_name)
      if (filters.location) params.append('location', filters.location)
      if (filters.donation_purpose) params.append('donation_purpose', filters.donation_purpose)
      const res = await api.get('/donations', { params })
      const data = res.data?.data || res.data || []
      setDonations(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch donations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return
    try {
      await api.delete(`/donations/${id}`)
      setDonations(donations.filter(d => d.id !== id))
      setSuccess('Donation deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete donation')
    }
  }

  const handleEdit = (donation) => {
    setSelectedDonation(donation)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedDonation(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDonation(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    // If whose_possession is empty, set to 'direct'
    if (!payload.whose_possession || payload.whose_possession.trim() === '') {
      payload.whose_possession = 'direct'
    }

    try {
      if (selectedDonation) {
        await api.put(`/donations/${selectedDonation.id}`, payload)
      } else {
        await api.post('/donations', payload)
      }
      await fetchDonations()
      setSuccess(`Donation ${selectedDonation ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      setSelectedDonation(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save donation')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => fetchDonations()

  const resetFilters = () => {
    setFilters({ donator_name: '', location: '', donation_purpose: '' })
    setTimeout(() => fetchDonations(), 0)
  }

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.donate_amount || 0), 0)

  return (
    <div className="space-y-6 animate-slide-up select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Donations</h2>
          <p className="text-slate-400 text-xs mt-0.5">Track and manage donation records</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchDonations}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Donation
          </button>
        </div>
      </div>

      {/* Summary Card */}
      {donations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Collected</p>
            <p className="text-white text-lg font-bold">{formatAmount(totalAmount)}</p>
          </div>
          <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Donors</p>
            <p className="text-white text-lg font-bold">{donations.length}</p>
          </div>
          <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-4 col-span-2 sm:col-span-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Avg Donation</p>
            <p className="text-white text-lg font-bold">{formatAmount(totalAmount / donations.length)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Donator Name</label>
            <input
              type="text"
              name="donator_name"
              value={filters.donator_name}
              onChange={handleFilterChange}
              placeholder="Search by donator name"
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search by location"
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Donation Purpose</label>
            <input
              type="text"
              name="donation_purpose"
              value={filters.donation_purpose}
              onChange={handleFilterChange}
              placeholder="Search by purpose"
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <Search className="w-3.5 h-3.5" /> Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            Reset
          </button>
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

      {/* Donation Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500/25 border-t-brand-500 animate-spin"></div>
          <span className="text-slate-400 text-xs">Loading donations...</span>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <HeartHandshake className="w-12 h-12 text-slate-600 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-slate-200">No donations found</h4>
            <p className="text-slate-500 text-xs mt-1">There are no donation records matching your criteria</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Record First Donation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {donations.map(donation => (
            <div
              key={donation.id}
              className="relative overflow-hidden bg-[#0d1325]/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-6 shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Amount Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-bold text-sm">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {Number(donation.donate_amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        Number(donation.status) === 1
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-white/[0.06]'
                      }`}>
                        {Number(donation.status) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Donator Name */}
                    <h3 className="text-base font-bold text-slate-100 tracking-tight group-hover:text-white transition-colors">
                      {donation.donator_name}
                    </h3>

                    {/* Purpose */}
                    <p className="text-xs text-slate-400 mt-0.5 italic">"{donation.donation_purpose}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(donation)}
                      className="p-2.5 text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(donation.id)}
                      className="p-2.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-1 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="text-slate-300">{donation.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-slate-300">{donation.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-500">Possession:</span>
                    <span className={`font-semibold ${donation.whose_possession === 'direct' ? 'text-slate-400' : 'text-teal-300'}`}>
                      {donation.whose_possession || 'direct'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={selectedDonation ? 'Edit Donation' : 'Add Donation'}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Donator Name *</label>
              <input
                type="text"
                name="donator_name"
                defaultValue={selectedDonation?.donator_name || ''}
                required
                placeholder="Enter donator's full name"
                className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Donation Amount (₹) *</label>
              <input
                type="number"
                name="donate_amount"
                defaultValue={selectedDonation?.donate_amount || ''}
                required
                min="0"
                step="1"
                placeholder="Enter amount"
                className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Location *</label>
            <input
              type="text"
              name="location"
              defaultValue={selectedDonation?.location || ''}
              required
              placeholder="Enter donation location"
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Donation Purpose *</label>
            <input
              type="text"
              name="donation_purpose"
              defaultValue={selectedDonation?.donation_purpose || ''}
              required
              placeholder="e.g. Temple renovation, Food drive..."
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Date *</label>
              <input
                type="date"
                name="date"
                defaultValue={selectedDonation?.date || new Date().toISOString().slice(0, 10)}
                required
                className="w-full bg-slate-950/40 text-slate-200 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Whose Possession
                <span className="ml-1 text-slate-500 normal-case font-normal">(blank = "direct")</span>
              </label>
              <input
                type="text"
                name="whose_possession"
                defaultValue={
                  selectedDonation?.whose_possession === 'direct' ? '' : selectedDonation?.whose_possession || ''
                }
                placeholder="Leave blank for Direct"
                className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 px-4 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : selectedDonation ? 'Update Donation' : 'Add Donation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
