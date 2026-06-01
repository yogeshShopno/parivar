import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Edit2, Trash2, Plus, Search, RefreshCw, Sparkles, Users as UsersIcon } from 'lucide-react'
import api from '../lib/api'
import { normalizeRoles, unwrapApiData } from '../lib/roles'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles')
        setRoles(normalizeRoles(unwrapApiData(res)))
      } catch (err) {
        console.error(err)
      }
    }

    fetchRoles()
  }, [])

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
          <h2 className="text-xl font-bold text-text">Family Registry</h2>
          <p className="text-text-secondary text-xs mt-0.5">View and manage all registered members</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearFilters}
            className="flex items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all"
            title="Reset Grid"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover hover:shadow-glow-primary text-text px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Operation Status alerts */}
      {error && (
        <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          {success}
        </div>
      )}

      {/* Advanced Filter panel */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-glass-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-secondary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input-bg text-input-text placeholder-text-secondary border border-input-border hover:border-border focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-300"
            />
          </div>

          {/* Gender filter */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-input-bg text-text border border-input-border rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-surface text-text">All Genders</option>
              <option value="Male" className="bg-surface text-text">Male</option>
              <option value="Female" className="bg-surface text-text">Female</option>
              <option value="Other" className="bg-surface text-text">Other</option>
            </select>
          </div>

          {/* Blood group filter */}
          <div>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="w-full bg-input-bg text-text border border-input-border rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-surface text-text">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg} className="bg-surface text-text">{bg}</option>
              ))}
            </select>
          </div>

          {/* Committee filter */}
          <div>
            <select
              value={filterCommittee}
              onChange={(e) => setFilterCommittee(e.target.value)}
              className="w-full bg-input-bg text-text border border-input-border rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-surface text-text">All Roles</option>
              <option value="true" className="bg-surface text-text">Committee Only</option>
              <option value="false" className="bg-surface text-text">General Members</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
          <span className="text-text-secondary text-xs">Querying members data...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <UsersIcon className="w-12 h-12 text-text-secondary" />
          <div>
            <h4 className="font-bold text-text">No registry matches found</h4>
            <p className="text-text-secondary text-xs mt-1">Try expanding your search criteria or register a new member</p>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-secondary text-text-secondary text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4">Member ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Bio Metrics</th>
                  <th className="p-4">Status &amp; Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-secondary text-xs text-text-secondary transition-colors">
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-primary">{user.id}</td>

                    {/* Name details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 uppercase">
                          {user.first_name ? user.first_name.substring(0, 1) : '-'}
                          {user.last_name ? user.last_name.substring(0, 1) : ''}
                        </div>
                        <div>
                          <div className="font-semibold text-text">{user.name}</div>
                          <div className="text-[10px] text-text-secondary mt-0.5 capitalize">{user.relation || 'Self'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="p-4">
                      <div>{user.email || <span className="text-text-secondary">No Email</span>}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5 font-mono">{user.phone}</div>
                    </td>

                    {/* Gender and Blood */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">{user.gender || '-'}</span>
                        {user.blood_group && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            <span className="font-bold text-error-text">{user.blood_group}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Role / Committee */}
                    <td className="p-4">
                      {user.is_committee ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>{user.committee_role || 'Committee'}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-secondary text-text-secondary font-medium text-[10px]">
                          Member
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-primary hover:text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-error-text hover:text-error bg-error-bg hover:bg-error/20 border border-error-border rounded-xl transition-all"
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
        <UserForm user={selectedUser} roles={roles} onSubmit={handleSubmit} isLoading={formLoading} />
      </Modal>
    </div>
  )
}
