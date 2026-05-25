import React, { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { buildPermissionGroups, normalizeRoles, unwrapApiData } from '../lib/roles'
import Modal from '../components/Modal'

const fieldClass = 'w-full px-3 py-2.5 bg-slate-950/40 text-slate-200 border border-white/[0.08] focus:border-brand-500/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10'
const emptyRoleForm = { name: '', description: '', status: 1, permissions: [] }

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [permissionConfig, setPermissionConfig] = useState({ actions: [], modules: [] })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyRoleForm)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ])
      setRoles(normalizeRoles(unwrapApiData(rolesRes)))
      setPermissionConfig(buildPermissionGroups(unwrapApiData(permissionsRes, { actions: [], modules: [], permissions: [] })))
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelected(null)
    setFormData(emptyRoleForm)
    setIsModalOpen(true)
  }

  const openEdit = (role) => {
    setSelected(role)
    setFormData({
      name: role.name || '',
      description: role.description || '',
      status: Number(role.status ?? 1),
      permissions: Array.isArray(role.permissions) ? role.permissions : []
    })
    setIsModalOpen(true)
  }

  const togglePermission = (key) => {
    setFormData((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((item) => item !== key)
        : [...current.permissions, key]
    }))
  }

  const toggleModule = (module) => {
    const keys = module.permissions.map((permission) => permission.key)
    const hasAll = keys.every((key) => formData.permissions.includes(key))
    setFormData((current) => ({
      ...current,
      permissions: hasAll
        ? current.permissions.filter((key) => !keys.includes(key))
        : [...new Set([...current.permissions, ...keys])]
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!formData.name.trim()) {
      setError('Role name is required')
      return
    }

    setSaving(true)
    setError('')
    try {
      if (selected) {
        await api.put(`/roles/${selected.id}`, formData)
      } else {
        await api.post('/roles', formData)
      }
      await fetchAll()
      setSuccess('Role saved successfully')
      setIsModalOpen(false)
      setSelected(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete ${role.name}?`)) return
    try {
      await api.delete(`/roles/${role.id}`)
      setRoles(roles.filter((item) => item.id !== role.id))
      setSuccess('Role deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete role')
    }
  }

  const filteredRoles = useMemo(() => (
    roles.filter((role) => JSON.stringify(role).toLowerCase().includes(search.toLowerCase()))
  ), [roles, search])
  const permissionGridStyle = {
    gridTemplateColumns: `minmax(150px, 1fr) repeat(${permissionConfig.actions.length}, minmax(64px, 72px))`
  }

  return (
    <div className="space-y-6 animate-slide-up select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Roles</h2>
          <p className="text-slate-400 text-xs mt-0.5">Create roles and assign List, Add, Edit, Delete permissions</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={fetchAll} className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] text-slate-300 hover:text-white transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles..." className="w-full bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-brand-500/50" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Role
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
                <th className="p-4">Role Name</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-xs text-slate-500">Loading roles...</td></tr>
              ) : filteredRoles.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-xs text-slate-500">No roles found</td></tr>
              ) : filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-white/[0.02] text-xs text-slate-300">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-brand-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{role.name}</div>
                        {role.description && <div className="mt-0.5 text-[10px] text-slate-500">{role.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{role.permission_count || 0} selected</td>
                  <td className="p-4">{Number(role.status ?? 1) === 1 ? 'Active' : 'Inactive'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(role)} className="p-2 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-xl" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(role)} className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl" title="Delete">
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

      <Modal isOpen={isModalOpen} title={selected ? 'Edit Role' : 'Add Role'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Role Name *</label>
              <input type="text" placeholder="Enter Role Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={fieldClass} disabled={saving} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Description</label>
              <input type="text" placeholder="Short role description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={fieldClass} disabled={saving} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={fieldClass} disabled={saving}>
                <option value={1} className="bg-[#0c1020]">Active</option>
                <option value={0} className="bg-[#0c1020]">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <div className="grid gap-2 border-b border-white/[0.06] pb-2 text-[10px] uppercase font-bold text-slate-500" style={permissionGridStyle}>
              <div>Permission</div>
              {permissionConfig.actions.map((action) => <div key={action.key} className="text-center">{action.label}</div>)}
            </div>
            <div className="divide-y divide-white/[0.04]">
              {permissionConfig.modules.map((module) => (
                <div key={module.key} className="grid gap-2 py-3 items-center" style={permissionGridStyle}>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input type="checkbox" checked={module.permissions.every((permission) => formData.permissions.includes(permission.key))} onChange={() => toggleModule(module)} className="rounded bg-slate-950/40 border-white/[0.08] text-brand-500" />
                    {module.label}
                  </label>
                  {permissionConfig.actions.map((action) => {
                    const permission = module.permissions.find((item) => item.action === action.key)
                    return permission ? (
                      <label key={permission.key} className="flex justify-center">
                        <input type="checkbox" checked={formData.permissions.includes(permission.key)} onChange={() => togglePermission(permission.key)} className="rounded bg-slate-950/40 border-white/[0.08] text-brand-500" />
                      </label>
                    ) : (
                      <div key={`${module.key}-${action.key}`} />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold text-xs tracking-wider uppercase disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Role'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
