// Component-facing adapter. API ownership remains in services/api.js.
import { api } from './api';
export { default } from './api';
export * from './api';

// The module bridge is intentionally exposed from the component adapter so
// generic module panels do not need to know the transport implementation.
export const moduleAPI = {
  getOperations: (moduleId) => api.get(`/backend-modules/${moduleId}`),
  execute: (moduleId, operation, id, data) => {
    const suffix = id ? `/${id}` : '';
    return api.post(`/backend-modules/${moduleId}/${operation}${suffix}`, data);
  },
};

// Additional component-specific API exports
export const multilingualAPI = {
  getTranslations: (lang) => api.get(`/i18n/${lang}`),
  updateTranslations: (lang, data) => api.put(`/i18n/${lang}`, data),
};

export const conversationalAIAPI = {
  sendMessage: (message) => api.post('/ai/conversational/send', { message }),
  getConversationHistory: () => api.get('/ai/conversational/history'),
};

export const voiceAIAPI = {
  transcribeAudio: (audio) => api.post('/ai/voice/transcribe', { audio }),
  generateSpeech: (text) => api.post('/ai/voice/speak', { text }),
};
