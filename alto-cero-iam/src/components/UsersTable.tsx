import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusToggle } from './StatusToggle';
import type { User } from '@/types';

// AICODE-NOTE: Users list table with pagination and status toggle

interface UsersTableProps {
  users: User[];
  propertyId: string;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onUserStatusChange?: (userId: string, enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  propertyId,
  pagination,
  onPageChange,
  onUserStatusChange,
  isLoading = false,
}: UsersTableProps) {
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  const handleStatusChange = async (userId: string, enabled: boolean) => {
    if (!onUserStatusChange) return;

    setUpdatingUsers((prev) => new Set(prev).add(userId));

    try {
      await onUserStatusChange(userId, enabled);
    } finally {
      setUpdatingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email Verified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-slate-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600">
                    {user.email || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusToggle
                    enabled={user.enabled}
                    onChange={(enabled) => handleStatusChange(user.id, enabled)}
                    disabled={updatingUsers.has(user.id)}
                    propertyId={propertyId}
                    userId={user.id}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      user.emailVerified
                        ? 'bg-success-100 text-success-700'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{' '}
            of {pagination.total} users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                pagination.page === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                pagination.page === pagination.totalPages
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersTable;
