import React, { useEffect, useMemo, useState } from 'react'
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

const fallbackTabs = [
  { id: 'all', label: 'All' },
  { id: 'family', label: 'Family' },
  { id: 'events', label: 'Events' },
  { id: 'festival', label: 'Festival' },
]

const fallbackMemories = [
  { src: '/1.png', fallback: '/1.png', category: 'family', alt: 'Family memory' },
  { src: '/2.png', fallback: '/2.png', category: 'events', alt: 'Community event memory' },
  { src: '/3.png', fallback: '/3.png', category: 'festival', alt: 'Festival memory' },
  { src: '/4.png', fallback: '/4.png', category: 'family', alt: 'Family gathering memory' },
  { src: '/5.png', fallback: '/1.png', category: 'events', alt: 'Celebration memory' },
  { src: '/6.png', fallback: '/2.png', category: 'festival', alt: 'Festival celebration memory' },
  { src: '/7.png', fallback: '/3.png', category: 'family', alt: 'Community family memory' },
  { src: '/8.png', fallback: '/4.png', category: 'events', alt: 'Group event memory' },
  { src: '/9.png', fallback: '/1.png', category: 'festival', alt: 'Traditional celebration memory' },
]

const normalizeGalleryMemories = (galleryRows, categories) => {
  const categoryMap = categories.reduce((map, category) => {
    return { ...map, [String(category.id)]: category.category || 'Gallery' }
  }, {})

  return galleryRows.flatMap((row, rowIndex) => {
    const images = Array.isArray(row.images) ? row.images : []
    const categoryId = String(row.gallery_category_id || '')
    const categoryName = categoryMap[categoryId] || row.year || 'Gallery'

    return images.map((image, imageIndex) => ({
      src: image,
      fallback: `/${((rowIndex + imageIndex) % 4) + 1}.png`,
      category: categoryId || categoryName,
      alt: `${categoryName} memory`,
    }))
  })
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

export default function Memories() {
  const [activeTab, setActiveTab] = useState('all')
  const [theme, setTheme] = useState(defaultTheme)
  const [memories, setMemories] = useState([])
  const [categoryTabs, setCategoryTabs] = useState(fallbackTabs)
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
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const [galleryResponse, categoryResponse] = await Promise.all([
          memberApi.get('/gallery'),
          memberApi.get('/gallery-categories'),
        ])

        const galleryRows = Array.isArray(galleryResponse.data?.data) ? galleryResponse.data.data : []
        const categories = Array.isArray(categoryResponse.data?.data) ? categoryResponse.data.data : []
        const dynamicTabs = [
          { id: 'all', label: 'All' },
          ...categories.slice(0, 3).map((category) => ({
            id: String(category.id),
            label: category.category || 'Gallery',
          })),
        ]

        setCategoryTabs(dynamicTabs.length > 1 ? dynamicTabs : fallbackTabs)
        setMemories(normalizeGalleryMemories(galleryRows, categories))
      } catch (error) {
        setCategoryTabs(fallbackTabs)
        setMemories([])
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [])

  const visibleMemories = memories.length > 0 ? memories : fallbackMemories
  const visibleTabs = memories.length > 0 ? categoryTabs : fallbackTabs

  const filteredMemories = useMemo(() => {
    if (activeTab === 'all') return visibleMemories
    return visibleMemories.filter((memory) => memory.category === activeTab)
  }, [activeTab, visibleMemories])

  return (
    <section
      id="gallery"
      className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: shadeColor(theme.backgroundColor, 2) }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <p
            className="text-sm sm:text-base font-semibold tracking-wide mb-2"
            style={{ color: theme.primaryColor }}
          >
            - Gallery -
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: theme.textColor }}
          >
            Memories That{' '}
            <span
              style={{
                backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Last Forever
            </span>
          </h2>
          <div
            className="w-12 h-1 rounded-full mx-auto mt-4"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.gradientEnd})`,
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="min-w-24 rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200"
                style={{
                  borderColor: isActive ? theme.primaryColor : theme.borderColor,
                  backgroundImage: isActive
                    ? `linear-gradient(to right, ${theme.gradientStart}, ${theme.gradientEnd})`
                    : 'none',
                  backgroundColor: isActive ? undefined : theme.backgroundColor,
                  color: isActive ? theme.fontColor : theme.textColor,
                  boxShadow: isActive ? `0 10px 24px ${theme.primaryColor}25` : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading && (
          <div
            className="mb-6 rounded-lg border px-4 py-3 text-center text-sm font-semibold"
            style={{
              borderColor: theme.borderColor,
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
            }}
          >
            Loading gallery...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((memory, index) => (
            <article
              key={`${memory.src}-${memory.category}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: theme.borderColor }}
            >
              <div className="aspect-[2/1] overflow-hidden">
                <img
                  src={memory.src}
                  alt={memory.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={index < 3 ? 'eager' : 'lazy'}
                  onError={(event) => {
                    if (event.currentTarget.src.endsWith(memory.fallback)) return
                    event.currentTarget.src = memory.fallback
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
