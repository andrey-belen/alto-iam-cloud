import { Link } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';

// AICODE-NOTE: Properties page - displays property cards grid with purple theme
// Shows realms filtered by user's client_prefix

export function PropertiesPage() {
  const { properties, isLoading, error, refetch } = useProperties();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="page-header">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 h-48 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="page-header">
          <h1 className="page-title">Properties</h1>
          <p className="page-description">Manage access for your properties</p>
        </div>
        <div className="card border-red-200 bg-red-50 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Failed to load properties
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => refetch()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-description">Manage access for your properties (realms)</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Property
        </button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No properties found
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Properties will appear here once they are configured in Keycloak.
            Contact your administrator to set up new properties.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="card hover:shadow-lg hover:border-violet-200 transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-violet flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className={`badge ${property.enabled ? 'badge-success' : 'badge-neutral'}`}>
                    {property.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  {property.displayName || property.realm}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Realm: {property.realm}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{property.userCount ?? '—'} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{property.sessionCount ?? '—'} active</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertiesPage;
