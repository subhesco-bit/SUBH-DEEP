/**
 * Minimal client-side error/usage monitoring shim.
 *
 * This file was imported by App.jsx (`import { errorMonitoring } from
 * './utils/errorMonitoring'`) but never actually existed anywhere in the
 * repo (confirmed via git history) — the import silently broke `vite build`
 * for every visitor, independent of and predating the C3 route-splitting
 * work in App.jsx. Recreated with the one method App.jsx actually calls
 * (`trackActiveUser`), plus a couple of conventional no-op-with-logging
 * companions matching the graceful-degradation pattern used elsewhere in
 * this codebase, so the build can complete. Not part of the
 * C3/H9/H10/H11/M10 fix set this session was scoped to — wiring this up to
 * a real monitoring backend (Sentry, etc.) is separate follow-up work.
 */

export const errorMonitoring = {
  trackActiveUser(userId, sessionId) {
    if (!userId) return
    if (import.meta.env?.DEV) {
      console.debug('[errorMonitoring] active user', { userId, sessionId })
    }
  },

  captureException(error, context = {}) {
    console.error('[errorMonitoring] exception', error, context)
  },

  captureMessage(message, context = {}) {
    console.warn('[errorMonitoring] message', message, context)
  }
}

export default errorMonitoring
