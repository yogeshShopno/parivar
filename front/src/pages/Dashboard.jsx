import React, { useEffect, useState } from 'react'
import { Users, Briefcase, FileText, Shield, ArrowUpRight, TrendingUp, Calendar, Clock } from 'lucide-react'
import api from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, businesses: 0, posts: 0, committee: 0 })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      try {
        const [statsRes, usersRes, businessesRes, postsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/users'),
          api.get('/businesses'),
          api.get('/posts')
        ])

        if (!mounted) return

        const statsData = statsRes.data?.data || statsRes.data || { users: 0, businesses: 0, posts: 0, committee: 0 }
        const users = usersRes.data?.data || usersRes.data || []
        const businesses = businessesRes.data?.data || businessesRes.data || []
        const posts = postsRes.data?.data || postsRes.data || []

        setStats(statsData)
        setRecentActivities([
          ...users.slice(0, 2).map(user => ({
            id: `member-${user.id}`,
            text: `${user.name || 'A member'} is registered in the family directory`,
            time: 'Recent',
            date: user.phone || user.email || 'Member registry'
          })),
          ...businesses.slice(0, 1).map(business => ({
            id: `business-${business.id}`,
            text: `${business.business_name || 'A business'} is listed in the business directory`,
            time: Number(business.status) === 1 ? 'Active' : 'Inactive',
            date: business.number || 'Business directory'
          })),
          ...posts.slice(0, 1).map(post => ({
            id: `post-${post.id}`,
            text: `${post.title || 'A post'} is visible on the community board`,
            time: 'Published',
            date: post.cdate || 'Posts board'
          }))
        ])
      } catch (error) {
        if (mounted) setRecentActivities([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDashboard()

    return () => {
      mounted = false
    }
  }, [])

  const statCards = [
    {
      title: 'Total Members',
      value: stats.users,
      icon: Users,
      color: 'from-indigo-500 to-blue-600',
      shadow: 'shadow-glow-primary',
      change: '+14% growth',
      sparkline: 'M0 20 Q15 5 30 15 T60 5 T90 12 T120 2',
      sparkColor: 'var(--color-primary)'
    },
    {
      title: 'Business Directories',
      value: stats.businesses,
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-glow-success',
      change: '+6% this month',
      sparkline: 'M0 20 Q15 15 30 8 T60 12 T90 4 T120 1',
      sparkColor: 'var(--color-success)'
    },
    {
      title: 'Posts',
      value: stats.posts,
      icon: FileText,
      color: 'from-violet-500 to-fuchsia-600',
      shadow: 'shadow-glow-primary',
      change: '+22 new posts',
      sparkline: 'M0 20 Q15 10 30 18 T60 8 T90 2 T120 6',
      sparkColor: 'var(--color-info)'
    },
    {
      title: 'Committee Members',
      value: stats.committee,
      icon: Shield,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-glow-success',
      change: 'Active status',
      sparkline: 'M0 15 Q15 15 30 15 T60 15 T90 15 T120 15',
      sparkColor: 'var(--color-warning)'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-border/40 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card border border-border rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-card border border-border rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up text-text">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Dashboard</h2>
        
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-secondary border border-border text-sm text-text font-medium select-none shadow-sm">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Last Sync: Just now</span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="relative overflow-hidden group bg-card border border-border hover:border-text-secondary/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-glass-md hover:-translate-y-0.5"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-secondary tracking-wider uppercase group-hover:text-text transition-colors">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} ${card.shadow} text-white transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Stat Value */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text tracking-tight">
                  {card.value}
                </span>
                <span className="text-sm font-bold text-text-secondary">records</span>
              </div>

              {/* Sparkline & Growth Indicator */}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {card.change}
                </span>
                {/* SVG sparkline */}
                <svg className="w-20 h-6 overflow-visible" stroke={card.sparkColor} strokeWidth="1.5" fill="none">
                  <path d={card.sparkline} />
                </svg>
              </div>

              {/* Overlay glow strip */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-30 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          )
        })}
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration analytics charts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-glass-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text tracking-wide">Registration Distribution</h3>
              <p className="text-sm text-text-secondary">6-Month moving average data</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +18.5% year over year
            </div>
          </div>

          {/* Elegant SVG Area chart */}
          <div className="relative w-full h-56 mt-4 select-none">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Gridlines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--color-border)" strokeWidth="1" opacity="0.7" />

              {/* Data curve 2 (Posts) */}
              <path d="M0 120 Q50 90 100 110 T200 60 T300 80 T400 40 T500 20" fill="none" stroke="var(--color-info)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              <path d="M0 120 Q50 90 100 110 T200 60 T300 80 T400 40 T500 20 L500 150 L0 150 Z" fill="url(#chartGrad2)" opacity="0.5" />

              {/* Data curve 1 (Members) */}
              <path d="M0 140 Q50 110 100 90 T200 40 T300 70 T400 30 T500 10" fill="none" stroke="var(--color-primary)" strokeWidth="3.5" />
              <path d="M0 140 Q50 110 100 90 T200 40 T300 70 T400 30 T500 10 L500 150 L0 150 Z" fill="url(#chartGrad)" />

              {/* Dot Indicators */}
              <circle cx="500" cy="10" r="4.5" fill="var(--color-primary)" stroke="var(--color-surface)" strokeWidth="1.5" />
              <circle cx="400" cy="30" r="3.5" fill="var(--color-primary)" />
              <circle cx="200" cy="40" r="3.5" fill="var(--color-primary)" />
            </svg>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-6 mt-6 border-t border-border pt-4 text-sm font-semibold text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-primary"></span>
              <span>Member Signups</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-info border border-dashed border-info"></span>
              <span>Post Activity</span>
            </div>
          </div>
        </div>

        {/* Recent activities section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-glass-md flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text tracking-wide flex items-center gap-2">
              Recent Activity
            </h3>
            <p className="text-sm text-text-secondary">System actions audit logs</p>
          </div>

          <div className="flex-1 space-y-5">
            {recentActivities.length === 0 ? (
              <div className="h-full min-h-40 flex items-center justify-center text-center text-sm text-text-secondary border border-dashed border-border rounded-2xl">
                No recent records available yet
              </div>
            ) : recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-sm leading-relaxed group">
                {/* Visual line bullet */}
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface group-hover:scale-110 transition-transform shadow-glow-primary"></span>
                  <span className="w-px h-full bg-border mt-2 group-last:hidden"></span>
                </div>
                {/* Text content */}
                <div className="flex-1 pb-1">
                  <p className="text-text font-medium transition-colors">
                    {act.text}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{act.time}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{act.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
