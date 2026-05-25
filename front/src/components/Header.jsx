import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Search, Bell, Sparkles } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { masterLabels, routeTitles } from '../config/navigation'

export default function Header() {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    if (routeTitles[location.pathname]) return routeTitles[location.pathname]
    if (location.pathname.startsWith('/masters/')) {
      const type = location.pathname.split('/').pop()
      return `${masterLabels[type] || 'Master'} Master`
    }
    return 'Admin Panel'
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5 bg-[#0f1426]/40 backdrop-blur-md border-b border-white/[0.06] shadow-glass-sm select-none">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {getPageTitle()}
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 shadow-glow-success animate-ping"></span>
          </h1>
          <p className="text-[11px] text-slate-400">Live platform operations control room</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-6">
        {/* Dynamic Global Search box */}
        <div className="relative group hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            placeholder="Search records..."
            className="w-64 bg-slate-950/40 text-slate-200 placeholder-slate-500 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-brand-500/10 focus:shadow-glow-primary transition-all duration-300"
          />
        </div>

        {/* Notifications and status */}
        <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>

        {/* Vertical divider */}
        <span className="w-px h-6 bg-white/[0.08]"></span>

        {/* Profile Card & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col text-right">
            <div className="text-xs font-semibold text-slate-200">{user?.name || 'Administrator'}</div>
            <div className="text-[10px] text-brand-400 font-bold tracking-wide flex items-center gap-1 justify-end">
              <Sparkles className="w-3 h-3 text-violet-400" />
              President
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 hover:shadow-glow-danger transition-all duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
