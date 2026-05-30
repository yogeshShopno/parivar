import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0c1020] via-[#111827] to-[#0f111a] text-slate-100 overflow-x-hidden font-sans">
      {/* Decorative dynamic ambient background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]  animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px]  animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      {/* Sidebar - fixed and styled */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pl-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
