import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { configurationNavigation, coreNavigation, masterNavigation } from '../config/navigation'

const LinkItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `group flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'border-brand-500/30 bg-brand-500/15 text-brand-200'
          : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`
    }
    title={label}
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="truncate">{label}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300"></span>
        )}
      </>
    )}
  </NavLink>
)

const SectionLabel = ({ children }) => (
  <div className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 first:pt-0">
    {children}
  </div>
)

export default function Sidebar() {
  const { user } = useContext(AuthContext)

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#0d1325]/95 p-5 shadow-glass-md backdrop-blur-xl">
      <div className="mb-6 flex shrink-0 items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-glow-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Parivar Admin
          </h2>
          <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400">
            Console HQ
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        <SectionLabel>Core Operations</SectionLabel>
        <div className="space-y-1">
          {coreNavigation.map((item) => (
            <LinkItem key={item.to} {...item} />
          ))}
        </div>

        <SectionLabel>Masters</SectionLabel>
        <div className="ml-4 space-y-1 border-l border-brand-500/40 pl-3">
          {masterNavigation.map(({ type, label }) => (
            <NavLink
              key={type}
              to={`/masters/${type}`}
              end
              className={({ isActive }) =>
                `block min-h-8 w-full rounded-md px-3 py-2 text-xs transition-colors ${
                  isActive ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
              title={`${label} Master`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <SectionLabel>Configuration</SectionLabel>
        <div className="space-y-1">
          {configurationNavigation.map((item) => (
            <LinkItem key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {user && (
        <div className="mt-5 flex shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold uppercase text-white shadow-sm">
            {user.name ? user.name.substring(0, 2) : user.email?.substring(0, 2) || 'AD'}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-semibold text-slate-200">{user.name || user.email || 'Administrator'}</h4>
            <p className="text-[10px] text-slate-400 truncate capitalize">{user.role || 'Administrator'}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
