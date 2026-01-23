import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// AICODE-NOTE: Login page - redirects to Keycloak for authentication
// Request Access link goes directly to Keycloak themed registration page

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Build Keycloak registration URL
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
  const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'alto';
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'alto-cero-iam';
  const registrationUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/registrations?client_id=${clientId}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(window.location.origin)}`;
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination after login
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname || '/properties';

  useEffect(() => {
    // If already authenticated, redirect to destination
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleLogin = () => {
    login();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Alto CERO IAM</h1>
          <p className="text-slate-600 mt-2">Property Access Management</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">
            Sign in to your account
          </h2>

          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Sign in with Keycloak
          </button>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center mb-3">
              Don't have an account?
            </p>
            <a
              href={registrationUrl}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Request Access
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Secure authentication powered by Keycloak
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
