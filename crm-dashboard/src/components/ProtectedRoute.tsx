import { useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasAuthCallback, hasJustLoggedOut, clearLogoutFlag } from '@/services/keycloak';

// AICODE-NOTE: Auth guard component - redirects to Keycloak login if not authenticated
// Uses ref to prevent multiple redirect attempts
// Checks for auth callback to prevent redirect during token exchange
// Checks for logout flag to show login page instead of auto-redirect
// requireSuperAdmin: restricts route to Alto admins (client_prefix = "*")

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, isSuperAdmin, login } = useAuth();
  const loginAttempted = useRef(false);

  // Handle explicit login click (clears logout flag)
  const handleLogin = useCallback(() => {
    clearLogoutFlag();
    login();
  }, [login]);

  // Redirect to Keycloak login if not authenticated
  // But don't redirect if we're processing an auth callback or just logged out
  useEffect(() => {
    const isCallback = hasAuthCallback();
    const justLoggedOut = hasJustLoggedOut();
    console.log('ProtectedRoute check:', { isLoading, isAuthenticated, isCallback, justLoggedOut, loginAttempted: loginAttempted.current });

    // Don't auto-login if user just logged out - show login page instead
    if (!isLoading && !isAuthenticated && !loginAttempted.current && !isCallback && !justLoggedOut) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login');
      loginAttempted.current = true;
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  // Show login page if user just logged out
  if (!isLoading && !isAuthenticated && hasJustLoggedOut()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 max-w-md mx-4">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Signed Out Successfully
          </h2>
          <p className="text-slate-300 mb-6">
            You have been logged out of Alto CRM.
          </p>
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth, processing callback, or redirecting
  if (isLoading || !isAuthenticated) {
    const isCallback = hasAuthCallback();
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-slate-600">
            {isCallback ? 'Completing login...' : isLoading ? 'Loading...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  // Check for required role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-error-600 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check for super admin requirement (Alto operator only)
  if (requireSuperAdmin && !isSuperAdmin()) {
    // Redirect clients to home page - they shouldn't access admin-only features
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
