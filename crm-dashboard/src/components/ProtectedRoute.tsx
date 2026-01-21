import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasAuthCallback } from '@/services/keycloak';

// AICODE-NOTE: Auth guard component - redirects to Keycloak login if not authenticated
// Uses ref to prevent multiple redirect attempts
// Checks for auth callback to prevent redirect during token exchange
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

  // Redirect to Keycloak login if not authenticated
  // But don't redirect if we're processing an auth callback
  useEffect(() => {
    const isCallback = hasAuthCallback();
    console.log('ProtectedRoute check:', { isLoading, isAuthenticated, isCallback, loginAttempted: loginAttempted.current });

    if (!isLoading && !isAuthenticated && !loginAttempted.current && !isCallback) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login');
      loginAttempted.current = true;
      login();
    }
  }, [isLoading, isAuthenticated, login]);

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
