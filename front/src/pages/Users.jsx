import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Edit2, Trash2, Plus, Search, RefreshCw, Sparkles, Users as UsersIcon } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Advanced search & filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterBloodGroup, setFilterBloodGroup] = useState('')
  const [filterCommittee, setFilterCommittee] = useState('')
  const requestIdRef = useRef(0)

  const fetchUsers = useCallback(async (options = {}) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setLoading(true)
    try {
      const nextSearch = options.searchQuery ?? searchQuery
      const nextGender = options.filterGender ?? filterGender
      const nextBloodGroup = options.filterBloodGroup ?? filterBloodGroup
      const nextCommittee = options.filterCommittee ?? filterCommittee
      const params = {}
      if (nextSearch) params.search = nextSearch
      if (nextGender) params.gender = nextGender
      if (nextBloodGroup) params.blood_group = nextBloodGroup
      if (nextCommittee) params.is_committee = nextCommittee

      const res = await api.get('/users', { params, signal: options.signal })
      if (requestId !== requestIdRef.current) return
      const data = res.data?.data || res.data || []
      setUsers(data)
      setError('')
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return
      const timeoutMessage = err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED'
        ? 'Members request timed out. Please check the backend connection and try again.'
        : 'Failed to load members from server'
      setError(timeoutMessage)
      console.error(err)
    } finally {
      if (requestId === requestIdRef.current && !options.signal?.aborted) {
        setLoading(false)
      }
    }
  }, [filterBloodGroup, filterCommittee, filterGender, searchQuery])

  useEffect(() => {
    const controller = new AbortController()
    fetchUsers({ signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [fetchUsers])

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  // Create/Update user
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setError('')
    try {
      if (selectedUser) {
        // Update
        const res = await api.put(`/users/${selectedUser.id}`, formData)
        const updated = res.data?.data || res.data || {}
        setSuccess('Member updated successfully')
        fetchUsers() // Refresh list
      } else {
        // Create
        const res = await api.post('/users', formData)
        const created = res.data?.data || res.data || {}
        setSuccess('Member created successfully')
        fetchUsers() // Refresh list
      }
      setIsModalOpen(false)
      setSelectedUser(null)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save member')
    } finally {
      setFormLoading(false)
    }
  }

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this family member? This action is permanent.')) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      setSuccess('Member deleted successfully')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to delete member')
    }
  }

  // Open create modal
  const handleCreate = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  // Open edit modal
  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterGender('')
    setFilterBloodGroup('')
    setFilterCommittee('')
    fetchUsers({
      searchQuery: '',
      filterGender: '',
      filterBloodGroup: '',
      filterCommittee: ''
    })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Family Registry</h2>
          <p className="text-slate-400 text-xs mt-0.5">View and manage all registered members</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearFilters}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all"
            title="Reset Grid"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-glow-primary text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Operation Status alerts */}
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

      {/* Advanced Filter panel */}
      <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-5 shadow-glass-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all duration-300"
            />
          </div>

          {/* Gender filter */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-brand-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0d1325]">All Genders</option>
              <option value="Male" className="bg-[#0d1325]">Male</option>
              <option value="Female" className="bg-[#0d1325]">Female</option>
              <option value="Other" className="bg-[#0d1325]">Other</option>
            </select>
          </div>

          {/* Blood group filter */}
          <div>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-brand-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0d1325]">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg} className="bg-[#0d1325]">{bg}</option>
              ))}
            </select>
          </div>

          {/* Committee filter */}
          <div>
            <select
              value={filterCommittee}
              onChange={(e) => setFilterCommittee(e.target.value)}
              className="w-full bg-slate-950/40 text-slate-300 border border-white/[0.08] rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-brand-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0d1325]">All Roles</option>
              <option value="true" className="bg-[#0d1325]">Committee Only</option>
              <option value="false" className="bg-[#0d1325]">General Members</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500/25 border-t-brand-500 animate-spin"></div>
          <span className="text-slate-400 text-xs">Querying members data...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <UsersIcon className="w-12 h-12 text-slate-600" />
          <div>
            <h4 className="font-bold text-slate-200">No registry matches found</h4>
            <p className="text-slate-500 text-xs mt-1">Try expanding your search criteria or register a new member</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-slate-950/20 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">Member ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Bio Metrics</th>
                  <th className="p-4">Status & Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] text-xs text-slate-300 transition-colors">
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-brand-400">{user.id}</td>

                    {/* Name details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-white border border-white/5 uppercase">
                          {user.first_name ? user.first_name.substring(0, 1) : '-'}
                          {user.last_name ? user.last_name.substring(0, 1) : ''}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{user.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 capitalize">{user.relation || 'Self'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="p-4">
                      <div>{user.email || <span className="text-slate-600">No Email</span>}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{user.phone}</div>
                    </td>

                    {/* Gender and Blood */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{user.gender || '-'}</span>
                        {user.blood_group && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span className="font-bold text-rose-400">{user.blood_group}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Role / Committee */}
                    <td className="p-4">
                      {user.is_committee ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                          <span>{user.committee_role || 'Committee'}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">
                          Member
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal overlay */}
      <Modal
        isOpen={isModalOpen}
        title={selectedUser ? 'Modify Member Profile' : 'Register New Member'}
        onClose={handleCloseModal}
      >
        <UserForm user={selectedUser} onSubmit={handleSubmit} isLoading={formLoading} />
      </Modal>
    </div>
  )
}
