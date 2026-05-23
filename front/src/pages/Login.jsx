import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Key } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide all credentials.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Access Denied: Invalid administrator credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1020] via-[#111827] to-[#0f111a] text-slate-100 relative overflow-hidden font-sans select-none">
      
      {/* Dynamic ambient backgrounds */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md p-8 bg-[#0d1325]/50 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-glass-lg relative z-10 animate-slide-up">
        
        {/* Glowing Head Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-primary mb-3.5 animate-pulse-slow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Parivar Console
          </h1>
          <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-1">Platform Control Room</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-2 mb-6 animate-fade-in shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 text-slate-200 placeholder-slate-600 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all duration-300"
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/40 text-slate-200 placeholder-slate-600 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-500/50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all duration-300"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-glow-primary text-white py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying authority keys...' : 'Establish Secure Connection'}
          </button>
        </form>

        {/* Credentials helper card */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-slate-500 flex gap-3 items-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Key className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-slate-400">Onboarding Quick Connect:</div>
            <div className="mt-1 font-mono text-[9px] text-slate-400">
              <span className="text-violet-400 font-semibold">User:</span> ramesh.patel@example.com
              <br />
              <span className="text-violet-400 font-semibold">Pass:</span> password123
            </div>
            <div className="mt-1 text-[9px] leading-snug">Ramesh is flagged as a committee President in seeds, granting full administration access.</div>
          </div>
        </div>

      </div>
    </div>
  )
}
