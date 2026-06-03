import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Edit2, Plus, RefreshCw, Search, Sparkles } from 'lucide-react'
import api from '../lib/api'
import { normalizeRoles, unwrapApiData } from '../lib/roles'
import Modal from '../components/Modal'
import CommitteeMemberForm from '../components/CommitteeMemberForm'

export default function CommitteeMembers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const requestIdRef = useRef(0)

  const fetchUsers = useCallback(async (options = {}) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setLoading(true)
    try {
      const res = await api.get('/users', {
        params: { is_committee: true },
        signal: options.signal
      })
      if (requestId !== requestIdRef.current) return
      setUsers(res.data?.data || res.data || [])
      setError('')
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return
      const timeoutMessage = err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED'
        ? 'Committee request timed out. Please check the backend connection and try again.'
        : 'Failed to load committee members'
      setError(timeoutMessage)
    } finally {
      if (requestId === requestIdRef.current && !options.signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get('/roles')
      setRoles(normalizeRoles(unwrapApiData(res)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roles')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchUsers({ signal: controller.signal })
    fetchRoles()

    return () => {
      controller.abort()
    }
  }, [fetchUsers])

  const handleSubmit = async (formData) => {
    setSaving(true)
    try {
      if (selected) {
        await api.put(`/users/${selected.id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      await fetchUsers()
      setSelected(null)
      setIsModalOpen(false)
      setSuccess(selected ? 'Committee member updated successfully' : 'Committee member added successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update committee member')
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter((user) => JSON.stringify(user).toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => {
    setSelected(null)
    setIsModalOpen(true)
  }

  const openEdit = (user) => {
    setSelected(user)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Committee Members</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-secondary/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search committee..." className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow-primary">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {error && <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-sm">{error}</div>}
      {success && <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-sm">{success}</div>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-glass-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-text-secondary text-sm font-bold uppercase tracking-wider">
                <th className="p-4">Member</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-sm text-text-secondary">Loading committee members...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-sm text-text-secondary">No committee members found</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surface-secondary/40 text-sm text-text">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt="" className="h-9 w-9 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-surface-secondary flex items-center justify-center text-sm font-bold text-text-secondary">{user.name?.slice(0, 2) || 'CM'}</div>
                      )}
                      <div>
                        <div className="font-semibold text-text">{user.name}</div>
                        <div className="text-sm text-text-secondary">{user.designation || user.committee_role || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{user.email || user.number || '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      {user.role_name || 'Committee'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg border text-sm font-bold ${Number(user.status ?? 1) === 1 ? 'bg-success-bg border-success-border text-success-text' : 'bg-surface-secondary border-border text-text-secondary'}`}>
                      {Number(user.status ?? 1) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(user)} className="p-2 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={selected ? 'Edit Committee Member' : 'Add Committee Member'} onClose={() => setIsModalOpen(false)}>
        <CommitteeMemberForm member={selected} roles={roles} onSubmit={handleSubmit} isLoading={saving} />
      </Modal>
    </div>
  )
}
