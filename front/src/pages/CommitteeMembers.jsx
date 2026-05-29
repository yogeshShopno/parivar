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
    <div className="space-y-6 animate-slide-up select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Committee Members</h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage committee member roles and profile details</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search committee..." className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-brand-500/50" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs">{error}</div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs">{success}</div>}

      <div className="bg-[#0d1325]/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-glass-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-950/20 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-4">Member</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-xs text-slate-500">Loading committee members...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-xs text-slate-500">No committee members found</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] text-xs text-slate-300">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt="" className="h-9 w-9 rounded-lg object-cover border border-white/[0.08]" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-300">{user.name?.slice(0, 2) || 'CM'}</div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.designation || user.committee_role || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{user.email || user.number || '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      {user.role_name || 'Committee'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-bold ${Number(user.status ?? 1) === 1 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                      {Number(user.status ?? 1) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(user)} className="p-2 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl" title="Edit">
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
