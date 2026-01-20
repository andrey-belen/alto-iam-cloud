import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// AICODE-NOTE: Login page - redirects to Keycloak for authentication

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
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
          <h1 className="text-3xl font-bold text-slate-900">Alto CRM</h1>
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

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have access?{' '}
              <a
                href="/request-access"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Request access
              </a>
            </p>
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
