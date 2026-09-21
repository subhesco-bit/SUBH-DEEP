import React, { useEffect, lazy, Suspense, ErrorBoundary } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoadingSpinner } from './components/ui/Skeleton';
import { ProtectedRoute, RoleRoute } from './components/RouteGuard';
import Layout from './components/Layout';
import ErrorBoundaryComponent from './components/ErrorBoundary';
import config from './config/env';

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

// Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Farmer Pages
const FarmerPortalPage = lazy(() => import('./pages/FarmerPortalPage'));
const FarmerHomePage = lazy(() => import('./pages/FarmerHomePage'));

// Dashboard Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// ============================================================================
// FALLBACK LOADING COMPONENT
// ============================================================================

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const { user, checkAuth, isLoading } = useAuthStore();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    const validateAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    validateAuth();
  }, [checkAuth]);

  // Log route changes
  useEffect(() => {
    console.log(`📍 Route changed to: ${location.pathname}`);
  }, [location.pathname]);

  // Show loading while auth is being checked
  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundaryComponent>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HomePage />
              </Suspense>
            }
          />

          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            }
          />

          <Route
            path="/register"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <RegisterPage />
              </Suspense>
            }
          />

          <Route
            path="/marketplace"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <MarketplacePage />
              </Suspense>
            }
          />
        </Route>

        {/* PROTECTED ROUTES */}
        {user && (
          <>
            {/* FARMER ROUTES */}
            {(user.role === 'farmer' || user.role === 'admin') && (
              <Route element={<Layout />}>
                <Route
                  path="/farmer"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <FarmerPortalPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/farmer/home"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <FarmerHomePage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              </Route>
            )}

            {/* ADMIN ROUTES */}
            {user.role === 'admin' && (
              <Route element={<Layout />}>
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleRoute requiredRole="admin">
                      <Suspense fallback={<LoadingFallback />}>
                        <DashboardPage />
                      </Suspense>
                    </RoleRoute>
                  }
                />
              </Route>
            )}

            {/* GENERAL PROTECTED ROUTES */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <DashboardPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            </Route>
          </>
        )}

        {/* 404 CATCH-ALL */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundaryComponent>
  );
}

export default App;
