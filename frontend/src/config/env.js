/**
 * Frontend Environment Configuration - FIXED
 * Centralized configuration management
 */

const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  API_VERSION: 'v1',
  API_TIMEOUT: 30000,

  // App Configuration
  APP_NAME: 'EBDESIGN Platform',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  NODE_ENV: import.meta.env.MODE || 'development',

  // Feature Flags
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  ENABLE_SENTRY: import.meta.env.VITE_ENABLE_SENTRY === 'true',

  // UI Configuration
  THEME: import.meta.env.VITE_THEME || 'light',
  LANG: import.meta.env.VITE_LANGUAGE || 'en',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm:ss',

  // Security
  JWT_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user',
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // WebSocket
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  WS_RECONNECT_DELAY: 3000,
  WS_RECONNECT_MAX_ATTEMPTS: 10,

  // Logging
  DEBUG: import.meta.env.DEV,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',

  // Cache
  CACHE_DURATION: 1000 * 60 * 60, // 1 hour
  SESSION_TIMEOUT: 1000 * 60 * 30, // 30 minutes

  // Module Discovery
  AUTO_DISCOVER_MODULES: import.meta.env.VITE_AUTO_DISCOVER_MODULES !== 'false',
  MODULE_PATH: '/modules',

  // Storage
  USE_LOCAL_STORAGE: import.meta.env.VITE_USE_LOCAL_STORAGE !== 'false',
  USE_SESSION_STORAGE: import.meta.env.VITE_USE_SESSION_STORAGE !== 'false',
  USE_INDEXED_DB: import.meta.env.VITE_USE_INDEXED_DB === 'true',

  // Analytics
  ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  TRACKING_ID: import.meta.env.VITE_TRACKING_ID || '',

  // Error Reporting
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  ERROR_REPORTING_ENABLED: import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true',

  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
    },
    user: {
      profile: '/users/profile',
      settings: '/users/settings',
      preferences: '/users/preferences',
    },
    farmer: {
      dashboard: '/farmer/dashboard',
      fields: '/farmer/fields',
      crops: '/farmer/crops',
      sales: '/farmer/sales',
    },
    marketplace: {
      products: '/marketplace/products',
      listings: '/marketplace/listings',
      categories: '/marketplace/categories',
    },
    admin: {
      users: '/admin/users',
      analytics: '/admin/analytics',
      settings: '/admin/settings',
    },
  },

  // Helper methods
  isProduction() {
    return this.ENVIRONMENT === 'production';
  },

  isDevelopment() {
    return this.ENVIRONMENT === 'development';
  },

  isTest() {
    return this.ENVIRONMENT === 'test';
  },

  getApiUrl(path = '') {
    const baseUrl = this.API_URL || `${window.location.origin}${this.API_BASE_URL}`;
    return path ? `${baseUrl}${path}` : baseUrl;
  },

  getWsUrl() {
    return this.WS_URL || window.location.origin;
  },

  log(...args) {
    if (this.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  error(...args) {
    console.error('[ERROR]', ...args);
  },

  warn(...args) {
    console.warn('[WARN]', ...args);
  },
};

// Validate configuration
if (!config.API_URL && !config.API_BASE_URL) {
  console.warn('⚠️  No API configuration found');
}

export default config;
