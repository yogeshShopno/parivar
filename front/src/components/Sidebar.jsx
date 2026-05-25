import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, Briefcase, FileText, Settings, Shield, CalendarDays, Image, Megaphone, Mail, UserCog } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const LinkItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border ${
        isActive
          ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/20 text-brand-300 border-brand-500/30 shadow-glow-primary'
          : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
          isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
        }`} />
        <span>{children}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
        )}
      </>
    )}
  </NavLink>
)

export default function Sidebar() {
  const { user } = useContext(AuthContext)
  const masters = [
    ['business', 'Business'],
    ['country', 'Country'],
    ['state', 'State'],
    ['district', 'District'],
    ['taluka', 'Taluka'],
    ['city', 'City'],
    ['village', 'Village'],
    ['area', 'Area'],
    ['blood-group', 'Blood Group'],
    ['event-category', 'Event Category']
  ]

  return (
    <aside className="w-64 bg-[#0d1325]/80 backdrop-blur-xl border-r border-white/[0.06] h-screen p-6 flex flex-col fixed left-0 top-0 z-30 shadow-glass-md overflow-y-auto">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-primary animate-pulse-slow">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Parivar Admin
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-brand-400 font-bold bg-brand-500/10 px-1.5 py-0.5 rounded">
            Console HQ
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-3">
          Core Operations
        </div>
        <LinkItem to="/" icon={Home}>Dashboard</LinkItem>
        <LinkItem to="/committee" icon={UserCog}>Kamiti Member</LinkItem>
        <LinkItem to="/users" icon={Users}>Members</LinkItem>
        <LinkItem to="/festivals" icon={CalendarDays}>Festivals</LinkItem>
        <LinkItem to="/events" icon={CalendarDays}>Events</LinkItem>
        <LinkItem to="/gallery" icon={Image}>Gallery</LinkItem>
        <LinkItem to="/banners" icon={Megaphone}>Banner</LinkItem>
        <LinkItem to="/businesses" icon={Briefcase}>Businesses</LinkItem>
        <LinkItem to="/posts" icon={FileText}>Feed Posts</LinkItem>
        <LinkItem to="/contact-inquiries" icon={Mail}>Contact Inquiry</LinkItem>
        
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-6 mb-2 px-3">
          Masters
        </div>
        <div className="border-l border-brand-500/60 ml-5 pl-3 space-y-1.5">
          {masters.map(([type, label]) => (
            <NavLink
              key={type}
              to={`/masters/${type}`}
              className={({ isActive }) =>
                `block px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-6 mb-2 px-3">
          Configuration
        </div>
        <LinkItem to="/settings" icon={Settings}>Theme Config</LinkItem>
      </nav>

      {/* User Footer Panel */}
      {user && (
        <div className="mt-auto p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white shadow-sm uppercase">
            {user.name ? user.name.substring(0, 2) : 'AD'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-xs text-slate-200 truncate">{user.name}</h4>
            <p className="text-[10px] text-slate-400 truncate capitalize">{user.role || 'Administrator'}</p>
          </div>
        </div>
      )}
    </aside>
  )
}
