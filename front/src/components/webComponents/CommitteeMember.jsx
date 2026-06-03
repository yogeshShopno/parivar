import React, { useEffect, useState } from 'react'
import { memberApi } from '../../lib/api'

const defaultTheme = {
  gradientStart: '#2E7D32',
  gradientEnd: '#0D3B12',
  primaryColor: '#1B5E20',
  secondaryColor: '#66BB6A',
  textColor: '#123524',
  backgroundColor: '#F5FFF7',
  borderColor: '#D7EFD9',
  buttonColor: '#1B5E20',
  fontColor: '#FFFFFF',
}

const fallbackMembers = [
  {
    name: 'Aarav Sharma',
    role: 'Community President',
    image: '/1.png',
  },
  {
    name: 'Priya Shah',
    role: 'Health Coordinator',
    image: '/2.png',
  },
  {
    name: 'Rajesh Patel',
    role: 'Elder & Mentor',
    image: '/3.png',
  },
  {
    name: 'Ananya Verma',
    role: 'Member Relations',
    image: '/4.png',
  },
]

const normalizeCommitteeMember = (member, index) => {
  const name = [member.first_name, member.middle_name, member.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    id: member.id || `${name}-${index}`,
    name: name || 'Committee Member',
    role: member.designation || member.role || 'Committee',
    image: member.image || `/${(index % 4) + 1}.png`,
  }
}

const getStoredWebTheme = () => {
  const colorKeys = [
    'backgroundColor',
    'borderColor',
    'buttonColor',
    'fontColor',
    'gradientEnd',
    'gradientStart',
    'primaryColor',
    'secondaryColor',
    'textColor',
  ]

  return colorKeys.reduce((theme, key) => {
    const value = localStorage.getItem(`web_${key}`)
    return value ? { ...theme, [key]: value } : theme
  }, {})
}

const shadeColor = (color, percent) => {
  if (!color) return '#000000'

  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.max(0, Math.min(255, (num >> 16) + amt)).toString(16).padStart(2, '0')
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt)).toString(16).padStart(2, '0')
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt)).toString(16).padStart(2, '0')

  return `#${r}${g}${b}`
}

export default function Members() {
  const [theme, setTheme] = useState(defaultTheme)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = () => {
      setTheme({ ...defaultTheme, ...getStoredWebTheme() })
    }

    loadTheme()
    window.addEventListener('storage', loadTheme)
    return () => window.removeEventListener('storage', loadTheme)
  }, [])

  useEffect(() => {
    const fetchCommitteeMembers = async () => {
      try {
        setLoading(true)
        const response = await memberApi.get('/committee_members')
        const rows = Array.isArray(response.data?.data) ? response.data.data : []
        setMembers(rows.map(normalizeCommitteeMember))
      } catch (error) {
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchCommitteeMembers()
  }, [])

  const visibleMembers = members.length > 0 ? members : fallbackMembers

  return (
    <section
      id="members"
      className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      style={{
        backgroundColor: theme.backgroundColor,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p
            className="text-sm sm:text-base font-semibold tracking-wide mb-2"
            style={{ color: theme.primaryColor }}
          >
            - Members -
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: theme.textColor }}
          >
            Meet Our{' '}
            <span
              style={{
                backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Committee Members
            </span>
          </h2>
          <div
            className="w-12 h-1 rounded-full mx-auto mt-4"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.gradientEnd})`,
            }}
          />
        </div>

        {loading && (
          <div
            className="mb-6 rounded-lg border px-4 py-3 text-center text-sm font-semibold"
            style={{
              borderColor: theme.borderColor,
              backgroundColor: shadeColor(theme.backgroundColor, 3),
              color: theme.textColor,
            }}
          >
            Loading committee members...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleMembers.map((member) => (
            <article
              key={member.id || member.name}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderColor: theme.borderColor,
              }}
            >
              <div className="aspect-[4/4] overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="px-5 py-5 text-center">
                <h3
                  className="text-lg font-bold"
                  style={{ color: theme.textColor }}
                >
                  {member.name}
                </h3>
                <span
                  className="inline-flex items-center rounded-full border px-4 py-1.5 mt-2 text-sm font-semibold"
                  style={{
                    borderColor: theme.primaryColor,
                    color: theme.primaryColor,
                    backgroundColor: shadeColor(theme.backgroundColor, 3),
                  }}
                >
                  {member.role}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
