import React, { useEffect, useState } from 'react'
import { Settings, Save, Sparkles, RefreshCw, Info } from 'lucide-react'
import api, { assetUrl } from '../lib/api'

export default function SettingsPage() {
  const [config, setConfig] = useState({
    primaryColor: '#E65100',
    secondaryColor: '#F4C95D',
    backgroundColor: '#FFF8F0',
    textColor: '#4E342E',
    buttonColor: '#E65100',
    fontColor: '#FFFFFF',
    borderColor: '#E8D9C8',
    gradientStart: '#E65100',
    gradientEnd: '#7B0D1C',
   
  })
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await api.get('/get_app_theme')
      const data = res.data?.data || res.data || {}
      // Remove Mongoose properties
      const cleaned = {
        primaryColor: data.primaryColor || '#E65100',
        secondaryColor: data.secondaryColor || '#F4C95D',
        backgroundColor: data.backgroundColor || '#FFF8F0',
        textColor: data.textColor || '#4E342E',
        buttonColor: data.buttonColor || '#E65100',
        fontColor: data.fontColor || '#FFFFFF',
        borderColor: data.borderColor || '#E8D9C8',
        gradientStart: data.gradientStart || '#E65100',
        gradientEnd: data.gradientEnd || '#7B0D1C',
      
      }
      setConfig(cleaned)
      
    } catch (err) {
      setError('Failed to fetch platform configurations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload = new FormData()
      Object.entries(config).forEach(([key, value]) => {
        payload.append(key, value ?? '')
      })
     
      await api.put('/update_app_theme', payload)
      setSuccess('Platform theme branding updated successfully! Changes will reflect across mobile & web environments.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Failed to save configuration settings')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleResetDefaults = () => {
    if (!window.confirm('Reset brand settings back to standard system themes?')) return
    setConfig({
      primaryColor: '#E65100',
      secondaryColor: '#F4C95D',
      backgroundColor: '#FFF8F0',
      textColor: '#4E342E',
      buttonColor: '#E65100',
      fontColor: '#FFFFFF',
      borderColor: '#E8D9C8',
      gradientStart: '#E65100',
      gradientEnd: '#7B0D1C',

    })

  }

  const ColorInput = ({ label, value, keyName, desc }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-secondary border border-border hover:bg-surface transition-colors text-text">
      <div className="max-w-md">
        <h4 className="text-xs font-bold text-text uppercase tracking-wide">{label}</h4>
        <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setConfig({ ...config, [keyName]: e.target.value })}
          className="w-24 bg-input-bg text-text font-mono text-center text-xs py-1.5 border border-border rounded-lg outline-none"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => setConfig({ ...config, [keyName]: e.target.value })}
          className="w-10 h-8 rounded-lg border-0 bg-transparent outline-none cursor-pointer p-0 shrink-0"
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
        <span className="text-text-secondary text-xs">Querying platform configuration...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Platform Branding</h2>
          <p className="text-text-secondary text-xs mt-0.5">Customize global styles, theme variables, and brand aesthetics</p>
        </div>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-2 bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Defaults
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          {success}
        </div>
      )}

      {/* Main Designer Config Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Inputs Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-glass-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Branding Tokens Configurator
            </h3>
            <button
              type="submit"
              disabled={saveLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold shadow-glow-primary transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              {saveLoading ? 'Saving Tokens...' : 'Commit Theme'}
            </button>
          </div>

          <div className="space-y-4">
            <ColorInput
              label="Primary Highlight Color"
              desc="Applied to primary action items, headers, active states, and mobile header highlights."
              value={config.primaryColor}
              keyName="primaryColor"
            />
            <ColorInput
              label="Secondary Accent Color"
              desc="Soft auxiliary color for secondary buttons, outline highlights, and select card borders."
              value={config.secondaryColor}
              keyName="secondaryColor"
            />
            <ColorInput
              label="Global Background Canvas"
              desc="Canvas background color variables rendered behind page outlets on mobile view."
              value={config.backgroundColor}
              keyName="backgroundColor"
            />
            <ColorInput
              label="Default Base Typography Text"
              desc="Fallback font text color variables for high-contrast reading."
              value={config.textColor}
              keyName="textColor"
            />
            <ColorInput
              label="Primary Button Color"
              desc="Controls the main filled action button used across the client application."
              value={config.buttonColor}
              keyName="buttonColor"
            />
            <ColorInput
              label="Button Label Color"
              desc="Text color rendered on filled buttons and high-emphasis mobile controls."
              value={config.fontColor}
              keyName="fontColor"
            />
            <ColorInput
              label="Card Border Color"
              desc="Border color for mobile cards, directory tiles, and content outlines."
              value={config.borderColor}
              keyName="borderColor"
            />
            <ColorInput
              label="Gradient Start Token"
              desc="Starting color hex applied to banner gradient backgrounds and mobile dashboard headers."
              value={config.gradientStart}
              keyName="gradientStart"
            />
            <ColorInput
              label="Gradient End Token"
              desc="Ending color hex finishing the visual layout gradients."
              value={config.gradientEnd}
              keyName="gradientEnd"
            />

            
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-glass-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text">Live Brand Palette Preview</h3>
            </div>
            
            <p className="text-[10px] text-text-secondary leading-relaxed mb-6">
              Preview represents the layout of the mobile application dashboard using current theme tokens.
            </p>

            {/* Mobile layout container mockup */}
            <div className="w-full rounded-2xl border-4 border-text overflow-hidden shadow-glass-lg relative select-none" style={{ backgroundColor: config.backgroundColor }}>
              
              {/* Header Gradient mockup */}
              <div className="h-28 p-4 flex flex-col justify-between relative" style={{ backgroundImage: `linear-gradient(to bottom right, ${config.gradientStart}, ${config.gradientEnd})` }}>
                <div className="flex items-center justify-between">
                  <span className="w-5 h-2 rounded bg-white/20"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold leading-none">Namaste, Rameshji</h4>
                  <p className="text-white/60 text-[8px] mt-1 font-semibold">Parivar Community Hub</p>
                </div>
              </div>

              {/* Body mockup */}
              <div className="p-4 space-y-3">
                <div className="p-2.5 rounded-xl border flex items-center justify-between text-[9px]" style={{ borderColor: config.borderColor, backgroundColor: '#ffffff' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: config.primaryColor }}></span>
                    <span className="font-bold" style={{ color: config.textColor }}>View Family Directory</span>
                  </div>
                  <span className="text-[7px]" style={{ color: config.textColor }}>→</span>
                </div>

                <div className="p-2.5 rounded-xl border flex items-center justify-between text-[9px]" style={{ borderColor: config.borderColor, backgroundColor: '#ffffff' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: config.secondaryColor }}></span>
                    <span className="font-bold" style={{ color: config.textColor }}>Registered Businesses</span>
                  </div>
                  <span className="text-[7px]" style={{ color: config.textColor }}>→</span>
                </div>

                <button className="w-full text-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: config.buttonColor, color: config.fontColor }}>
                  Add Member
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-surface-secondary border border-border text-[10px] text-text-secondary leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Theme tokens are synchronized dynamically with both web and mobile environments.</span>
          </div>

        </div>

      </div>
    </div>
  )
}
