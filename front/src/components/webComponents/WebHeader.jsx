import React, { useState, useRef, useEffect } from 'react'
import { Phone, Mail, Facebook, Instagram, Twitter, Youtube, MessageCircle, Globe, Menu, X, LogIn } from 'lucide-react'


export default function WebHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [theme, setTheme] = useState({})
  const mobileMenuRef = useRef(null)
  const languageRef = useRef(null)
  // Load theme colors from localStorage
  useEffect(() => {
    const loadTheme = () => {
      const colorKeys = [
        'backgroundColor', 'borderColor', 'buttonColor', 'fontColor',
        'gradientEnd', 'gradientStart', 'primaryColor', 'secondaryColor', 'textColor',
        'name','webLogo','favicon','phone','email','facebook','instagram','twitter','youtube','whatsapp',
      ]
      
      const loadedTheme = {}
      colorKeys.forEach((key) => {
        const value = localStorage.getItem(`web_${key}`)
        if (value) {
          loadedTheme[key] = value
        }
      })

    

      setTheme(loadedTheme)
    }

    loadTheme()

    // Listen for storage changes (if theme is updated elsewhere)
    window.addEventListener('storage', loadTheme)
    return () => window.removeEventListener('storage', loadTheme)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const navigationLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Members', href: '#members' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Events', href: '#events' },
    { label: 'Students', href: '#students' },
    { label: 'Donors', href: '#donors' },
  ]

  const socialLinks = [
    { icon: Facebook, href: theme?.facebook || '#facebook', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Instagram, href: theme?.instagram || '#instagram', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Twitter, href: theme?.twitter || '#twitter', label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Youtube, href: theme?.youtube || '#youtube', label: 'YouTube', color: 'hover:text-red-600' },
    { icon: MessageCircle, href: theme?.whatsapp || '#whatsapp', label: 'WhatsApp', color: 'hover:text-green-600' },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'hi', name: 'Hindi' },
  ]

  // Calculate lighter shade for gradients and borders
  const shadeColor = (color, percent) => {
    if (!color) return '#000000'
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) + amt).toString(16).padStart(2, '0')
    const G = Math.max(0, ((num >> 8) & 0x00FF) + amt).toString(16).padStart(2, '0')
    const B = Math.max(0, (num & 0x0000FF) + amt).toString(16).padStart(2, '0')
    return `#${R}${G}${B}`
  }

  return (
    <>
      {/* TOP CONTACT BAR */}
      <div
        className="sticky top-0 z-40 border-b transition-colors duration-300"
        style={{
          backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.gradientEnd})`,
          borderColor: shadeColor(theme.primaryColor, -30)
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2.5">
            {/* Contact Info */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
              <a
                href={theme?.phone ? `tel:${theme.phone}` : 'tel:+919876543210'}
                className="flex items-center gap-2 transition-colors duration-200"
                style={{
                  color: theme.fontColor || '#FFFFFF',
                  opacity: 0.85
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
                aria-label="Phone number"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">+91{theme?.phone}</span>
              </a>
              <div
                className="hidden sm:block w-px h-4"
                style={{
                  backgroundColor: shadeColor(theme.fontColor || '#FFFFFF', -30)
                }}
              ></div>
              <a
                href={theme?.email ? `mailto:${theme.email}` : 'mailto:info@parivar.org'}
                className="flex items-center gap-2 transition-colors duration-200"
                style={{
                  color: theme.fontColor || '#FFFFFF',
                  opacity: 0.85
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
                aria-label="Email address"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{theme?.email}</span>
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                      target="_blank"

                    aria-label={social.label}
                    title={social.label}
                    className="rounded-full transition-all duration-200 p-1.5"
                    style={{
                      backgroundColor: shadeColor(theme.fontColor || '#FFFFFF', -80),
                      color: theme.fontColor || '#FFFFFF'
                    }}

                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header
        className="sticky top-10 z-30 shadow-md border-b transition-colors duration-300"
        style={{
          backgroundColor: theme.backgroundColor || '#F5FFF7',
          borderColor: theme.borderColor || '#D7EFD9'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
                {theme?.webLogo ? (
                  <img src={theme.webLogo} alt={`${theme.name} logo`} className="h-12  object-contain" />
                ) : (theme.name ? theme.name.charAt(0).to() : 'P')}
              
              <div className="hidden sm:block">
                <h1
                  className="text-lg sm:text-xl font-semibold tracking-tight"
                  style={{
                    color: theme.textColor || '#123524'
                  }}
                >
                 {theme?.name} Parivar
                </h1>
                <p
                  className="text-sm"
                  style={{
                    color: shadeColor(theme.textColor || '#123524', 30)
                  }}
                >
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8 flex-1 justify-center px-6">
              {navigationLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium relative group transition-colors duration-200"
                  style={{
                    color: theme.textColor || '#123524'
                  }}
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${theme.gradientStart}, ${theme.gradientEnd})`
                    }}
                  ></span>
                </a>
              ))}
            </nav>

            {/* Right Side: Language Selector & Login */}
            <div className="flex items-center gap-2 sm:gap-4">
              

              {/* Login Button - Desktop */}
              <a
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  color: theme.fontColor || '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${theme.primaryColor}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
                aria-label="Login"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Login</span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
                className="lg:hidden p-2 rounded-lg transition-colors duration-200"
                style={{
                  color: theme.textColor || '#123524'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = shadeColor(theme.textColor || '#123524', -92)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <nav
              ref={mobileMenuRef}
              className="lg:hidden py-4 px-4 border-t"
              style={{
                borderColor: theme.borderColor || '#D7EFD9'
              }}
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-3 mb-4">
                {navigationLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{
                      color: theme.textColor || '#123524'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = shadeColor(theme.textColor || '#123524', -92)
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Mobile Login Button */}
              <a
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
                  color: theme.fontColor || '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${theme.primaryColor}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Login</span>
              </a>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
