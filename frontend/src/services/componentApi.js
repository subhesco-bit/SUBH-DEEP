// Component-facing adapter. API ownership remains in services/api.js.
import api from './api';
export { default } from './api';
export * from './api';

const DEFAULT_LANGUAGES = [
  { id: 1, iso_code: 'en', name: 'English', native_name: 'English', direction: 'ltr' },
  { id: 2, iso_code: 'hi', name: 'Hindi', native_name: 'हिन्दी', direction: 'ltr' },
  { id: 3, iso_code: 'bn', name: 'Bengali', native_name: 'বাংলা', direction: 'ltr' },
  { id: 4, iso_code: 'as', name: 'Assamese', native_name: 'অসমীয়া', direction: 'ltr' },
  { id: 5, iso_code: 'mni', name: 'Manipuri', native_name: 'মৈতৈলোন্', direction: 'ltr' },
  { id: 6, iso_code: 'ne', name: 'Nepali', native_name: 'नेपाली', direction: 'ltr' },
];

const offlineResponse = (data) => Promise.resolve({ data, offline: true });

// Additional component-specific API exports
export const multilingualAPI = {
  getLanguages: () => api.get('/languages').catch(() => offlineResponse(DEFAULT_LANGUAGES)),
  getPreferences: () => api.get('/language/preferences').catch(() => offlineResponse({
    primary_language_code: 'en',
    auto_detect_language: true,
    auto_translate_content: false,
  })),
  getContent: (lang) => api.get(`/i18n/${lang}`).catch(() => offlineResponse([])),
  getTranslations: (lang) => api.get(`/i18n/${lang}`).catch(() => offlineResponse([])),
  updateTranslations: (lang, data) => api.put(`/i18n/${lang}`, data),
  updatePreferences: (data) => api.put('/language/preferences', data).catch(() => offlineResponse({ saved: false })),
  translate: ({ text, target_language }) => api.post('/i18n/translate', { text, target_language }).catch(() => offlineResponse({
    translated_text: text,
    target_language,
  })),
  detect: (text) => api.post('/i18n/detect', { text }).catch(() => offlineResponse({
    iso_code: 'en',
    name: 'English',
    confidence: 100,
  })),
};

export const conversationalAIAPI = {
  sendMessage: (message) => api.post('/ai/conversational/send', { message }),
  getConversationHistory: () => api.get('/ai/conversational/history'),
};

export const voiceAIAPI = {
  transcribeAudio: (audio) => api.post('/ai/voice/transcribe', { audio }),
  generateSpeech: (text) => api.post('/ai/voice/speak', { text }),
};

export const moduleAPI = {
  getOperations: (moduleId) => api.get(`/modules/${moduleId}/operations`),
  execute: (moduleId, operation, params, payload) => api.post(`/modules/${moduleId}/execute`, { operation, params, payload }),
};

export const farmerPortalAPI = {
  getLandRecords: () => api.get('/farmer-portal/land-records'),
  addLandRecord: (data) => api.post('/farmer-portal/land-records', data),
  syncGovernmentLandRecords: () => api.post('/farmer-portal/land-records/sync-government'),
};

/**
 * Clients that components import but the backend does not yet serve.
 *
 * Each of these was imported by a component and exported by nothing, so the
 * frontend build failed outright - which is why 404 pages could not be routed
 * and the app could not be built at all.
 *
 * The methods below do NOT call invented endpoints. Every candidate route file
 * for these domains either does not exist (consumerHealth, foodSafety, custody,
 * laboratoryERP, arVr, giIntelligence) or carries only `/health` and a generic
 * `/` (iotIntegration, notification, food). Pointing a client at a URL nobody
 * serves would turn a build error into a silent runtime failure and put paths
 * into the codebase that no route backs.
 *
 * So each returns an explicit unavailable result. Components that check it can
 * render an empty state; components that do not will see null data rather than
 * a crash. When a real endpoint lands, replace the body here - the import sites
 * need no change.
 */
const notServed = (client, method) => Promise.resolve({
  data: null,
  unavailable: true,
  reason: `${client}.${method}: no backend endpoint is served for this yet`,
});

const pendingClient = (name, methods) =>
  Object.fromEntries(methods.map((m) => [m, () => notServed(name, m)]));

export const arVrAPI = pendingClient('arVrAPI', ['getExperiences', 'getInteractionPoints']);

export const consumerHealthAPI = pendingClient('consumerHealthAPI', [
  'getHealthProfiles', 'getHealthMetrics', 'getHealthGoals',
  'getDietaryRecommendations', 'getBMI',
]);

export const foodIntelligenceAPI = pendingClient('foodIntelligenceAPI', ['getActiveRecalls']);

export const giIntelligenceAPI = pendingClient('giIntelligenceAPI', ['verifyAuthentication']);

export const iotAPI = pendingClient('iotAPI', [
  'getDevices', 'getUnacknowledgedAlerts', 'getSensorData',
]);

export const laboratoryERPAPI = pendingClient('laboratoryERPAPI', [
  'getLaboratories', 'getTestCategories', 'getTestMethods', 'registerSample',
]);

export const custodyAPI = pendingClient('custodyAPI', ['getChain']);
