import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// AICODE-NOTE: Magic link approval page
// Admin clicks link from email, sees request details, can approve with role selection

interface AccessRequest {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rolePreference: string;
  createdAt: string;
}

type PageState = 'loading' | 'ready' | 'processing' | 'success' | 'error' | 'expired';

export function ApprovePage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PageState>('loading');
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [selectedRole, setSelectedRole] = useState<'client-admin' | 'operator' | 'viewer'>('operator');
  const [error, setError] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`${apiUrl}/access-requests/token/${token}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400 && data.status) {
            setError(`This request has already been ${data.status}`);
          } else {
            setError(data.error || 'Failed to load request');
          }
          setState('expired');
          return;
        }

        setRequest(data);
        setSelectedRole(data.rolePreference as 'client-admin' | 'operator' | 'viewer');
        setState('ready');
      } catch {
        setError('Failed to connect to server');
        setState('error');
      }
    };

    if (token) {
      fetchRequest();
    }
  }, [token, apiUrl]);

  const handleApprove = async () => {
    setState('processing');

    try {
      const response = await fetch(`${apiUrl}/access-requests/token/${token}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }

      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
      setState('error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  // Expired/already processed state
  if (state === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Link Unavailable</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">User Created!</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-slate-600 mb-2">
              <strong>{request?.firstName} {request?.lastName}</strong> has been granted access.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              They will receive a welcome email with instructions to set their password.
            </p>
            <Link
              to="/"
              className="inline-block py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Error</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show approval form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Alto CERO IAM</h1>
          <p className="text-slate-600 mt-2">Approve Access Request</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Request Details */}
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Request Details
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name:</dt>
                <dd className="text-slate-900 font-medium">
                  {request?.firstName} {request?.lastName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email:</dt>
                <dd className="text-slate-900">{request?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Company:</dt>
                <dd className="text-slate-900">{request?.company}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phone:</dt>
                <dd className="text-slate-900">{request?.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Preference:</dt>
                <dd className="text-slate-900 capitalize">{request?.rolePreference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted:</dt>
                <dd className="text-slate-900">
                  {request?.createdAt && formatDate(request.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Assign Access */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Assign Access
            </h2>

            <div className="mb-6">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Role *
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'client-admin' | 'operator' | 'viewer')}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="client-admin">Client Admin - Manage users within their client</option>
                <option value="operator">Operator - Can control building systems</option>
                <option value="viewer">Viewer - Read-only access to dashboards</option>
              </select>
            </div>

            <button
              onClick={handleApprove}
              disabled={state === 'processing'}
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {state === 'processing' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating User...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Create User & Send Welcome Email
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <Link
                to={`/reject/${token}`}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Reject this request instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovePage;
