import React, { useEffect, useState } from 'react'
import { Edit2, RefreshCw, Search, Sparkles } from 'lucide-react'
import api from '../lib/api'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'

export default function CommitteeMembers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { is_committee: true } })
      setUsers(res.data?.data || res.data || [])
      setError('')
    } catch (err) {
      setError('Failed to load committee members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    if (!selected) return
    setSaving(true)
    try {
      await api.put(`/users/${selected.id}`, { ...formData, is_committee: true })
      await fetchUsers()
      setSelected(null)
      setSuccess('Committee member updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update committee member')
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter((user) => JSON.stringify(user).toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-slide-up select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Kamiti Member</h2>
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
                <th className="p-4">Committee Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-xs text-slate-500">Loading committee members...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-xs text-slate-500">No committee members found</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] text-xs text-slate-300">
                  <td className="p-4 font-semibold text-slate-200">{user.name}</td>
                  <td className="p-4">{user.email || user.phone || '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      {user.committee_role || 'Committee'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelected(user)} className="p-2 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={Boolean(selected)} title="Edit Committee Member" onClose={() => setSelected(null)}>
        <UserForm user={selected} onSubmit={handleSubmit} isLoading={saving} />
      </Modal>
    </div>
  )
}
