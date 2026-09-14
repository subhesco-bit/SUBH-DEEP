import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { errorMonitoring } from './utils/errorMonitoring';
import { LoadingSpinner } from './components/ui/Skeleton';
import { ProtectedRoute, RoleRoute } from './components/RouteGuard';
import { PageTransition } from './components/RouteTransition';
import { RouteAnalytics, RouteMetadata, UserJourneyTracker, ScrollTracker, EngagementTracker } from './components/RouteAnalytics';
import { ErrorPage, NotFoundPage, UnauthorizedPage } from './components/RouteErrorBoundary';
import { RouteSuspense } from './components/RouteLoading';
import { RoutePreloader } from './utils/routePreloader';
import { publicRoutes, protectedRoutes, farmerRoutes, adminRoutes, dashboardRoutes, managementRoutes, discoveredRoutes, sweepRoutes, getRouteByPath, getAllRoutes } from './config/routes';
import { getAutoPageRoutes } from './config/autoPageRoutes';
import config from './config/env';
import monitoring from './utils/monitoring';
import analytics from './utils/analytics';
import { MultilingualProvider } from './components/Multilingual/MultilingualProvider';
import { AccessibilityProvider } from './components/Accessibility/AccessibilityProvider';
import ModuleRuntimePage from './pages/ModuleRuntimePage';

// Lazy load EconomicDashboard (not in centralized routes yet)
const EconomicDashboard = lazy(() => import('./pages/economic/EconomicDashboard'));

// Every path any array already declares. Passed to the auto-discovery pass so a
// generated route can never shadow a hand-written one; computed at module load
// because all of these arrays are static.
const declaredPaths = new Set(
  [
    ...publicRoutes, ...protectedRoutes, ...farmerRoutes, ...adminRoutes,
    ...dashboardRoutes, ...managementRoutes, ...discoveredRoutes, ...sweepRoutes
  ].map((route) => route.path)
);
declaredPaths.add('/economic');
declaredPaths.add('/module/:moduleId');

const autoPageRoutes = getAutoPageRoutes(declaredPaths);

function App() {
  const { user, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (config.ENABLE_ERROR_REPORTING) monitoring.init();
  }, []);

  useEffect(() => {
    if (config.ENABLE_ANALYTICS) analytics.init();
  }, []);

  useEffect(() => {
    if (user) {
      errorMonitoring.trackActiveUser(user.id, user.sessionId);
      monitoring.setUser(user);
      analytics.setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (import.meta.env.PROD && config.ENABLE_PWA && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const currentRoute = getRouteByPath(location.pathname);

  return (
    <ErrorBoundary>
      <RouteAnalytics routeConfig={{ getRouteByPath }} />
      <UserJourneyTracker />
      <ScrollTracker />
      <EngagementTracker />
      <RoutePreloader routes={getAllRoutes()} />
      <AccessibilityProvider>
        <MultilingualProvider>
          <Layout>
            <RouteMetadata route={currentRoute} />
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="xl" /></div>}>
              <Routes>
                {publicRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition>} />
                ))}
                {protectedRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<ProtectedRoute requiredRole={route.role}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></ProtectedRoute>} />
                ))}
                {farmerRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<RoleRoute allowedRoles={['farmer', 'admin']}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute>} />
                ))}
                {adminRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<RoleRoute allowedRoles={['admin']}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute>} />
                ))}
                {dashboardRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<RoleRoute allowedRoles={[route.role, 'admin']}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute>} />
                ))}
                {managementRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<RoleRoute allowedRoles={route.role ? [route.role] : []}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute>} />
                ))}
                {discoveredRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.role ? <RoleRoute allowedRoles={[route.role]}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute> : <ProtectedRoute><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></ProtectedRoute>} />
                ))}
                {sweepRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.isPublic ? <PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition> : <ProtectedRoute><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></ProtectedRoute>} />
                ))}
                {/* Every page file that no array above already claims.
                    404 of the 793 pages on disk had no route at all, so they
                    existed and could not be opened. getAutoPageRoutes derives a
                    path from each filename and skips any path already declared,
                    so hand-written routes always win and nothing is shadowed. */}
                {autoPageRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.role ? <RoleRoute allowedRoles={[route.role]}><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></RoleRoute> : <ProtectedRoute><PageTransition transition={route.transition}><RouteSuspense route={route}><route.component /></RouteSuspense></PageTransition></ProtectedRoute>} />
                ))}

                <Route path="/economic" element={<ProtectedRoute requiredRole="admin"><PageTransition transition="fade"><RouteSuspense><EconomicDashboard /></RouteSuspense></PageTransition></ProtectedRoute>} />

                {/* All numbered modules use the same production runtime contract.
                    This removes brittle per-module dynamic imports while retaining
                    the existing M001-M150 module URLs and allowing each module to
                    expose its own registry metadata, workflow, API, AI and controls. */}
                <Route path="/module/:moduleId" element={<RoleRoute allowedRoles={['admin']}><PageTransition transition="fade"><RouteSuspense><ModuleRuntimePage /></RouteSuspense></PageTransition></RoleRoute>} />

                <Route path="/error" element={<ErrorPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </MultilingualProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
