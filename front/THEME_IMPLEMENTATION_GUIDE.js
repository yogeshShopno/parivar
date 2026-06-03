#!/usr/bin/env node

/**
 * THEME IMPLEMENTATION GUIDE
 * 
 * Step-by-step instructions for implementing color themes in your Parivar app
 * Covers frontend storage, backend integration, and usage examples
 */

// ==========================================
// STEP 1: USE THEME IN FRONTEND
// ==========================================

/**
 * STEP 1.1: Import theme helpers
 * 
 * Location: Your React component (e.g., AdminPanel.jsx, Dashboard.jsx)
 */
const step1_1_import = `
import { getThemeByNumber, storeThemeInLocalStorage } from '@/config/themeHelpers'
import { databaseThemes } from '@/config/themeHelpers'

// Or import specific theme from websiteThemes.js
import { theme1_GreenTeal, defaultTheme, getThemeByName } from '@/config/websiteThemes'
`

/**
 * STEP 1.2: Select theme by user or admin preference
 * 
 * In Admin Panel or Settings component
 */
const step1_2_select_theme = `
import { listThemeNames, getThemeByNameHelper } from '@/config/themeHelpers'

export default function ThemeSelector() {
  const themes = listThemeNames()
  
  const handleThemeChange = (themeName) => {
    const selected = getThemeByNameHelper(themeName)
    // Store in localStorage (will be applied immediately)
    storeThemeInLocalStorage(selected)
    // Optionally: Send to backend to save user preference
    saveUserTheme(selected)
  }
  
  return (
    <div>
      <h3>Select Theme</h3>
      <select onChange={(e) => handleThemeChange(e.target.value)}>
        {themes.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  )
}
`

/**
 * STEP 1.3: Use theme in components
 * 
 * In WebHeader.jsx (already implemented)
 */
const step1_3_use_theme = `
// Already done in WebHeader.jsx - uses localStorage web_* keys
const [theme, setTheme] = useState({
  primaryColor: '#1B5E20',
  secondaryColor: '#66BB6A',
  // ... other colors
})

const loadTheme = () => {
  const colors = {
    primaryColor: localStorage.getItem('web_primaryColor') || '#1B5E20',
    secondaryColor: localStorage.getItem('web_secondaryColor') || '#66BB6A',
    // ... load all 9 colors
  }
  setTheme(colors)
}
`

// ==========================================
// STEP 2: SEND THEME TO BACKEND
// ==========================================

/**
 * STEP 2.1: Create backend endpoint
 * 
 * Location: backend route (e.g., src/routes/configRoutes.js)
 */
const step2_1_backend_endpoint = `
// In your backend routes
router.post('/api/config/theme', async (req, res) => {
  try {
    const { 
      themeName, 
      primaryColor, 
      secondaryColor, 
      backgroundColor,
      borderColor,
      buttonColor,
      fontColor,
      gradientStart,
      gradientEnd,
      textColor
    } = req.body
    
    // Save to database
    const config = new Config({
      themeName,
      primaryColor,
      secondaryColor,
      // ... other colors
      updatedAt: new Date()
    })
    
    await config.save()
    
    res.json({ 
      status: 'success', 
      message: 'Theme saved',
      data: config 
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    })
  }
})

// Endpoint to retrieve theme
router.get('/api/config/theme', async (req, res) => {
  try {
    const config = await Config.findOne().sort({ createdAt: -1 })
    res.json({ 
      status: 'success', 
      data: config 
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    })
  }
})
`

/**
 * STEP 2.2: Send theme from frontend to backend
 * 
 * In your React component
 */
const step2_2_send_to_backend = `
import { memberApi } from '@/lib/api'

const saveUserTheme = async (theme) => {
  try {
    const response = await memberApi.post('/api/config/theme', theme)
    console.log('Theme saved:', response.data)
  } catch (error) {
    console.error('Failed to save theme:', error)
  }
}

// Usage
const selectedTheme = getThemeByNumber(1)
await saveUserTheme(selectedTheme)
`

// ==========================================
// STEP 3: LOAD THEME ON APP STARTUP
// ==========================================

/**
 * STEP 3.1: Load theme in AuthContext (already implemented)
 * 
 * This runs once when app loads
 */
const step3_1_auth_context = `
// In src/context/AuthContext.jsx (already done)
useEffect(() => {
  // Fetch theme from backend
  const fetchWebTheme = async () => {
    try {
      const response = await memberApi.get('/get_app_theme')
      if (response.data.data) {
        // Store each color with web_ prefix
        Object.entries(response.data.data).forEach(([key, value]) => {
          localStorage.setItem(\`web_\${key}\`, value)
        })
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error)
    }
  }
  
  fetchWebTheme()
}, [])
`

/**
 * STEP 3.2: WebHeader automatically loads theme from localStorage
 * 
 * No additional code needed - already in WebHeader.jsx
 */
const step3_2_webheader = `
// In WebHeader.jsx, useEffect listens to storage changes
useEffect(() => {
  loadTheme()
  
  // Listen for storage changes (when user selects different theme)
  window.addEventListener('storage', loadTheme)
  return () => window.removeEventListener('storage', loadTheme)
}, [])
`

// ==========================================
// STEP 4: USAGE EXAMPLES
// ==========================================

/**
 * EXAMPLE 1: Admin selects theme and it applies to website immediately
 */
const example1_admin_selection = `
// In Admin Panel
import { getAllThemesAsArray, storeThemeInLocalStorage } from '@/config/themeHelpers'

export function AdminThemeSelector() {
  const themes = getAllThemesAsArray()
  
  const applyTheme = async (theme) => {
    // Apply to website immediately
    storeThemeInLocalStorage(theme)
    
    // Save to backend for persistence
    await memberApi.post('/api/config/theme', theme)
    
    alert('Theme applied!')
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {themes.map((theme, idx) => (
        <div 
          key={idx}
          className="p-4 border rounded cursor-pointer"
          style={{
            backgroundColor: theme.backgroundColor,
            borderColor: theme.borderColor
          }}
          onClick={() => applyTheme(theme)}
        >
          <h3 style={{ color: theme.textColor }}>{theme.themeName}</h3>
          <div className="flex gap-2 mt-2">
            <div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: theme.secondaryColor }}
            />
          </div>
          <button
            className="mt-2 px-4 py-2 rounded text-white"
            style={{ backgroundColor: theme.buttonColor }}
          >
            Select Theme
          </button>
        </div>
      ))}
    </div>
  )
}
`

/**
 * EXAMPLE 2: Database insertion for initial setup
 */
const example2_db_setup = `
// BACKEND: Add this to your seed/init script

import { databaseThemes } from '@/config/themeHelpers'

async function seedThemes() {
  const themes = Object.values(databaseThemes)
  
  for (const theme of themes) {
    await Config.updateOne(
      { themeName: theme.themeName },
      { $set: theme },
      { upsert: true }
    )
  }
  
  console.log('Themes seeded successfully')
}

// Or use this MongoDB shell command:
db.configs.insertMany([
  {
    themeName: "Green & Teal",
    backgroundColor: "#F5FFF7",
    borderColor: "#D7EFD9",
    buttonColor: "#1B5E20",
    fontColor: "#FFFFFF",
    gradientEnd: "#0D3B12",
    gradientStart: "#2E7D32",
    primaryColor: "#1B5E20",
    secondaryColor: "#66BB6A",
    textColor: "#0F4C23"
  },
  // ... add other 9 themes similarly
])
`

/**
 * EXAMPLE 3: Random theme on page reload (fun for demo)
 */
const example3_random_theme = `
import { getRandomThemeHelper, storeThemeInLocalStorage } from '@/config/themeHelpers'

export function RandomThemeButton() {
  const applyRandomTheme = () => {
    const random = getRandomThemeHelper()
    storeThemeInLocalStorage(random)
    console.log('Applied random theme:', random.themeName)
  }
  
  return (
    <button 
      onClick={applyRandomTheme}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      🎨 Random Theme
    </button>
  )
}
`

/**
 * EXAMPLE 4: Custom theme preview
 */
const example4_theme_preview = `
import { databaseThemes } from '@/config/themeHelpers'

export function ThemePreview({ themeNumber }) {
  const theme = getThemeByNumber(themeNumber)
  
  return (
    <div 
      className="p-6 rounded"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <h1 
        style={{ 
          color: theme.textColor,
          background: \`linear-gradient(135deg, \${theme.gradientStart}, \${theme.gradientEnd})\`
        }}
        className="mb-4"
      >
        {theme.themeName}
      </h1>
      
      <p style={{ color: theme.textColor }} className="mb-4">
        This is how your website would look with this theme.
      </p>
      
      <button
        style={{ backgroundColor: theme.buttonColor, color: theme.fontColor }}
        className="px-4 py-2 rounded"
      >
        Call to Action
      </button>
      
      <div className="mt-4 flex gap-2">
        {[
          theme.primaryColor,
          theme.secondaryColor,
          theme.borderColor
        ].map((color, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded border-2"
            style={{ 
              backgroundColor: color,
              borderColor: theme.borderColor
            }}
          />
        ))}
      </div>
    </div>
  )
}
`

// ==========================================
// STEP 5: IMPLEMENTATION CHECKLIST
// ==========================================

const implementationChecklist = `
IMPLEMENTATION CHECKLIST
========================

FRONTEND:
□ Import theme helpers in components
□ Create admin panel for theme selection
□ Test theme switching works
□ Verify localStorage web_* keys are set
□ Check WebHeader applies theme colors
□ Test on mobile devices
□ Verify no conflicts with admin dashboard colors

BACKEND:
□ Create /api/config/theme POST endpoint
□ Create /api/config/theme GET endpoint
□ Update Config model if needed
□ Test endpoints with Postman/Thunder
□ Seed database with 10 themes (optional)

INTEGRATION:
□ Test end-to-end: Select theme → Save to DB → Reload app → Theme persists
□ Verify theme loads on app startup from AuthContext
□ Test localStorage event listeners work
□ Check theme changes reflect immediately
□ Validate accessibility (color contrast)

DOCUMENTATION:
□ Document theme selection process for admins
□ Add theme documentation to README
□ Create admin user guide
□ List available themes and their use cases

DEPLOYMENT:
□ Set default theme (recommended: Theme 1 - Green & Teal)
□ Seed production database with themes
□ Test on production environment
□ Monitor for any issues
□ Gather user feedback
`

// ==========================================
// STEP 6: TROUBLESHOOTING
// ==========================================

const troubleshooting = `
TROUBLESHOOTING GUIDE
====================

Issue: Theme not applying to website
→ Check: localStorage has web_* keys set
→ Check: WebHeader component is loading theme in useEffect
→ Check: Browser console for errors
→ Fix: Clear localStorage and reload page

Issue: Theme reverts after page reload
→ Check: Backend endpoint /get_app_theme is working
→ Check: AuthContext fetchWebTheme is being called
→ Check: Theme is saved to database
→ Fix: Verify API response format matches expected fields

Issue: Admin colors conflicting with website
→ Check: Admin uses CSS variables (--color-*)
→ Check: Website uses localStorage (web_*)
→ These are completely separate - no conflict should occur
→ If still seeing conflicts, check for hardcoded colors in components

Issue: Colors looking different on different devices
→ This is normal - monitor colors vary
→ Solution: Test color contrast ratios using WCAG tools
→ All provided themes meet WCAG AAA standards

Issue: Theme changes not showing on other pages
→ Check: Using storage event listener (already in WebHeader)
→ Check: theme state updates properly
→ Fix: Add event listener to other components that need theme

Issue: localStorage keys not persisting
→ Check: Browser privacy settings allow localStorage
→ Check: Not in private/incognito mode
→ Check: Browser storage quota not full
→ Check: Keys are actually web_* prefixed
`

// ==========================================
// EXPORT GUIDE
// ==========================================

module.exports = {
  steps: {
    step1_1_import,
    step1_2_select_theme,
    step1_3_use_theme,
    step2_1_backend_endpoint,
    step2_2_send_to_backend,
    step3_1_auth_context,
    step3_2_webheader,
  },
  examples: {
    example1_admin_selection,
    example2_db_setup,
    example3_random_theme,
    example4_theme_preview,
  },
  checklist: implementationChecklist,
  troubleshooting: troubleshooting,
  
  // Quick reference
  requiredFiles: {
    'src/config/websiteThemes.js': '10 theme definitions',
    'src/config/themeHelpers.js': 'Helper functions for theme management',
    'src/components/webComponents/WebHeader.jsx': 'Component that applies themes',
    'src/context/AuthContext.jsx': 'Loads theme on app startup',
    'src/hooks/useWebTheme.js': 'Optional hook for theme management',
  },
  
  defaultTheme: {
    name: 'Green & Teal',
    reason: 'Professional, accessible, versatile'
  },
  
  fileLocations: {
    themes: 'd:\\parivar\\front\\src\\config\\websiteThemes.js',
    helpers: 'd:\\parivar\\front\\src\\config\\themeHelpers.js',
    colorPalettes: 'd:\\parivar\\front\\THEME_COLOR_PALETTES.md',
    quickReference: 'd:\\parivar\\front\\THEME_QUICK_REFERENCE.md',
    webHeader: 'd:\\parivar\\front\\src\\components\\webComponents\\WebHeader.jsx',
  }
}

// ==========================================
// QUICK START (Copy & Paste)
// ==========================================

/*
QUICK START - 30 SECOND SETUP
=============================

1. Admin component to select theme:
   - Import getAllThemesAsArray and storeThemeInLocalStorage
   - Create select dropdown with all themes
   - onClick: storeThemeInLocalStorage(theme)
   - Optional: POST to backend to persist

2. Verify it works:
   - Open DevTools → Application → localStorage
   - Should see: web_primaryColor, web_secondaryColor, etc.
   - Website header should immediately change colors

3. To persist theme:
   - Backend: Create POST /api/config/theme endpoint
   - Frontend: After storeThemeInLocalStorage, call memberApi.post()
   - Load on startup: Already done in AuthContext

4. Done! Theme system is live 🎉
*/

// Print instructions
console.log(`
╔════════════════════════════════════════════════╗
║   THEME IMPLEMENTATION GUIDE - READY TO USE    ║
╚════════════════════════════════════════════════╝

Start with STEP 1: Import theme helpers in your component
Follow all 6 steps above
Reference examples for your specific use case

Key Files:
✓ src/config/websiteThemes.js (10 themes)
✓ src/config/themeHelpers.js (helper functions)
✓ THEME_COLOR_PALETTES.md (visual reference)
✓ THEME_QUICK_REFERENCE.md (quick lookup)

Questions? See troubleshooting section above.
`)
