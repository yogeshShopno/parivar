/**
 * Theme Color Palette Generator & Database Helper
 * 
 * Quick reference and copy-paste ready color schemes
 * Each theme has all 9 required colors for web_* localStorage
 */

// ==========================================
// QUICK COPY-PASTE THEMES FOR DATABASE
// ==========================================

/**
 * All themes ready for database insertion
 * Copy any of these objects and use directly in your API
 */
export const databaseThemes = {
  theme1: {
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

  theme2: {
    themeName: "Royal Blue & Gold",
    backgroundColor: "#F0F4FA",
    borderColor: "#D0E0F0",
    buttonColor: "#FFB800",
    fontColor: "#FFFFFF",
    gradientEnd: "#001A4D",
    gradientStart: "#1A5FBB",
    primaryColor: "#003D82",
    secondaryColor: "#0066CC",
    textColor: "#001A4D"
  },

  theme3: {
    themeName: "Purple & Lavender",
    backgroundColor: "#FAF5FF",
    borderColor: "#E9D5FF",
    buttonColor: "#6B21A8",
    fontColor: "#FFFFFF",
    gradientEnd: "#3F0F5C",
    gradientStart: "#7C3AED",
    primaryColor: "#6B21A8",
    secondaryColor: "#A855F7",
    textColor: "#4C1D95"
  },

  theme4: {
    themeName: "Coral & Teal",
    backgroundColor: "#FFF5F3",
    borderColor: "#F5D5CF",
    buttonColor: "#17A2B8",
    fontColor: "#FFFFFF",
    gradientEnd: "#B84428",
    gradientStart: "#E8604B",
    primaryColor: "#E8604B",
    secondaryColor: "#FF7F6B",
    textColor: "#5A2520"
  },

  theme5: {
    themeName: "Slate & Orange",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    buttonColor: "#FF8C42",
    fontColor: "#FFFFFF",
    gradientEnd: "#1E293B",
    gradientStart: "#64748B",
    primaryColor: "#475569",
    secondaryColor: "#FF8C42",
    textColor: "#1E293B"
  },

  theme6: {
    themeName: "Emerald & Amber",
    backgroundColor: "#F0FDF4",
    borderColor: "#D1FAE5",
    buttonColor: "#FBBF24",
    fontColor: "#FFFFFF",
    gradientEnd: "#064E3B",
    gradientStart: "#059669",
    primaryColor: "#047857",
    secondaryColor: "#34D399",
    textColor: "#064E3B"
  },

  theme7: {
    themeName: "Indigo & Pink",
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    buttonColor: "#EC4899",
    fontColor: "#FFFFFF",
    gradientEnd: "#312E81",
    gradientStart: "#6366F1",
    primaryColor: "#4F46E5",
    secondaryColor: "#A78BFA",
    textColor: "#312E81"
  },

  theme8: {
    themeName: "Teal & Gold",
    backgroundColor: "#F0FDFA",
    borderColor: "#CCFBF1",
    buttonColor: "#F59E0B",
    fontColor: "#FFFFFF",
    gradientEnd: "#134E4A",
    gradientStart: "#0F766E",
    primaryColor: "#0D9488",
    secondaryColor: "#14B8A6",
    textColor: "#134E4A"
  },

  theme9: {
    themeName: "Red & Navy",
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    buttonColor: "#001F3F",
    fontColor: "#FFFFFF",
    gradientEnd: "#7C2D12",
    gradientStart: "#E11D48",
    primaryColor: "#DC2626",
    secondaryColor: "#EF4444",
    textColor: "#7C2D12"
  },

  theme10: {
    themeName: "Violet & Lime",
    backgroundColor: "#FAF5FF",
    borderColor: "#EDE9FE",
    buttonColor: "#BFFF00",
    fontColor: "#FFFFFF",
    gradientEnd: "#3730A3",
    gradientStart: "#8B5CF6",
    primaryColor: "#7C3AED",
    secondaryColor: "#C4B5FD",
    textColor: "#3730A3"
  }
}

// ==========================================
// EASY ACCESS HELPERS
// ==========================================

/**
 * Get theme by number (1-10)
 * @param {number} themeNumber - Theme number
 * @returns {object} - Theme object
 */
export const getThemeByNumber = (themeNumber) => {
  return databaseThemes[`theme${themeNumber}`]
}

/**
 * Get all themes as array
 * @returns {array} - Array of all themes
 */
export const getAllThemesAsArray = () => {
  return Object.values(databaseThemes)
}

/**
 * Get theme by name
 * @param {string} themeName - Theme name
 * @returns {object} - Theme object
 */
export const getThemeByNameHelper = (themeName) => {
  return Object.values(databaseThemes).find(
    theme => theme.themeName.toLowerCase() === themeName.toLowerCase()
  )
}

/**
 * Get random theme
 * @returns {object} - Random theme
 */
export const getRandomThemeHelper = () => {
  const themes = Object.values(databaseThemes)
  return themes[Math.floor(Math.random() * themes.length)]
}

/**
 * List all available theme names
 * @returns {array} - Array of theme names
 */
export const listThemeNames = () => {
  return Object.values(databaseThemes).map(t => t.themeName)
}

/**
 * Convert theme to localStorage format
 * @param {object} theme - Theme object
 * @returns {object} - localStorage compatible object
 */
export const toLocalStorageFormat = (theme) => {
  return {
    web_backgroundColor: theme.backgroundColor,
    web_borderColor: theme.borderColor,
    web_buttonColor: theme.buttonColor,
    web_fontColor: theme.fontColor,
    web_gradientEnd: theme.gradientEnd,
    web_gradientStart: theme.gradientStart,
    web_primaryColor: theme.primaryColor,
    web_secondaryColor: theme.secondaryColor,
    web_textColor: theme.textColor
  }
}

/**
 * Store theme in localStorage
 * @param {object} theme - Theme object
 */
export const storeThemeInLocalStorage = (theme) => {
  const storageFormat = toLocalStorageFormat(theme)
  Object.entries(storageFormat).forEach(([key, value]) => {
    localStorage.setItem(key, value)
  })
}

/**
 * Generate SQL INSERT for theme
 * @param {object} theme - Theme object
 * @param {string} userId - User ID
 * @returns {string} - SQL INSERT statement
 */
export const generateSQLInsert = (theme, userId) => {
  return `
INSERT INTO configs (
  userId,
  themeName,
  backgroundColor,
  borderColor,
  buttonColor,
  fontColor,
  gradientEnd,
  gradientStart,
  primaryColor,
  secondaryColor,
  textColor,
  createdAt,
  updatedAt
) VALUES (
  '${userId}',
  '${theme.themeName}',
  '${theme.backgroundColor}',
  '${theme.borderColor}',
  '${theme.buttonColor}',
  '${theme.fontColor}',
  '${theme.gradientEnd}',
  '${theme.gradientStart}',
  '${theme.primaryColor}',
  '${theme.secondaryColor}',
  '${theme.textColor}',
  NOW(),
  NOW()
);`.trim()
}

/**
 * Generate MongoDB insert for theme
 * @param {object} theme - Theme object
 * @param {string} userId - User ID
 * @returns {object} - MongoDB document
 */
export const generateMongoInsert = (theme, userId) => {
  return {
    userId,
    ...theme,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Generate JSON for REST API
 * @param {object} theme - Theme object
 * @param {string} userId - User ID
 * @returns {string} - JSON string
 */
export const generateJSONForAPI = (theme, userId) => {
  return JSON.stringify({
    userId,
    ...theme,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, null, 2)
}

// ==========================================
// COLOR SCHEMES BY CATEGORY
// ==========================================

export const themesByCategory = {
  professional: [databaseThemes.theme2, databaseThemes.theme5, databaseThemes.theme8],
  creative: [databaseThemes.theme3, databaseThemes.theme7, databaseThemes.theme10],
  community: [databaseThemes.theme1, databaseThemes.theme6, databaseThemes.theme4],
  energetic: [databaseThemes.theme4, databaseThemes.theme9, databaseThemes.theme7],
  minimal: [databaseThemes.theme5, databaseThemes.theme8]
}

/**
 * Get theme category suggestions
 * @param {string} category - Category name
 * @returns {array} - Recommended themes
 */
export const getThemesByCategory = (category) => {
  return themesByCategory[category.toLowerCase()] || []
}

// ==========================================
// EXPORT FOR TESTING
// ==========================================

export default {
  databaseThemes,
  getThemeByNumber,
  getAllThemesAsArray,
  getThemeByNameHelper,
  getRandomThemeHelper,
  listThemeNames,
  toLocalStorageFormat,
  storeThemeInLocalStorage,
  generateSQLInsert,
  generateMongoInsert,
  generateJSONForAPI,
  themesByCategory,
  getThemesByCategory
}
