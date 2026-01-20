import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '@/hooks/useProperties';
import { useUsers } from '@/hooks/useUsers';
import { UsersTable } from '@/components/UsersTable';
import { enableUser, disableUser } from '@/services/users';
import { cn } from '@/lib/utils';

// AICODE-NOTE: Property detail page - shows user list for a specific property

export function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { property, isLoading: propertyLoading, error: propertyError } =
    useProperty(propertyId);
  const {
    users,
    pagination,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
    setPage,
    setSearch,
  } = useUsers({ propertyId });

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleUserStatusChange = async (userId: string, enabled: boolean) => {
    if (!propertyId) return;

    const response = enabled
      ? await enableUser(propertyId, userId)
      : await disableUser(propertyId, userId);

    if (response.success) {
      refetchUsers();
    }
  };

  if (propertyLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-error-800 mb-2">
            Property not found
          </h3>
          <p className="text-error-600 mb-4">
            {propertyError || 'The requested property could not be found.'}
          </p>
          <Link
            to="/properties"
            className="inline-flex px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              to="/properties"
              className="text-slate-500 hover:text-slate-700"
            >
              Properties
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="text-slate-900 font-medium">
            {property.displayName || property.realm}
          </li>
        </ol>
      </nav>

      {/* Property header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {property.displayName || property.realm}
            </h1>
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium',
                property.enabled
                  ? 'bg-success-100 text-success-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {property.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-slate-600 mt-1">
            Realm: {property.realm} | {pagination.total} users
          </p>
        </div>

        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add User
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error message */}
      {usersError && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-700">{usersError}</p>
          <button
            onClick={() => refetchUsers()}
            className="mt-2 text-sm text-error-600 hover:text-error-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users table */}
      <UsersTable
        users={users}
        propertyId={propertyId!}
        pagination={pagination}
        onPageChange={setPage}
        onUserStatusChange={handleUserStatusChange}
        isLoading={usersLoading}
      />
    </div>
  );
}

export default PropertyDetailPage;
