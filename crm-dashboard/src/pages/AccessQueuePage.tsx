import { useState } from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import {
  approveAccessRequest,
  rejectAccessRequest,
} from '@/services/access-requests';
import { cn } from '@/lib/utils';
import type { AccessRequest, AccessRequestStatus } from '@/types';

// AICODE-NOTE: Operator approval queue page

export function AccessQueuePage() {
  const [statusFilter, setStatusFilter] = useState<
    AccessRequestStatus | undefined
  >('pending');
  const { requests, pagination, isLoading, error, refetch, setPage, setStatus } =
    useAccessRequests({ status: statusFilter });

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusFilterChange = (status: AccessRequestStatus | undefined) => {
    setStatusFilter(status);
    setStatus(status);
    setPage(1);
  };

  const handleApprove = async (request: AccessRequest) => {
    setProcessingId(request.id);
    setActionError(null);

    const response = await approveAccessRequest(request.id);

    if (response.success) {
      refetch();
    } else {
      setActionError(response.error || 'Failed to approve request');
    }

    setProcessingId(null);
  };

  const handleReject = async (request: AccessRequest) => {
    setProcessingId(request.id);
    setActionError(null);

    const response = await rejectAccessRequest(request.id);

    if (response.success) {
      refetch();
    } else {
      setActionError(response.error || 'Failed to reject request');
    }

    setProcessingId(null);
  };

  const statusFilters: { label: string; value: AccessRequestStatus | undefined }[] =
    [
      { label: 'All', value: undefined },
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Access Queue</h1>
        <p className="text-slate-600 mt-1">Review and process access requests</p>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => handleStatusFilterChange(filter.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === filter.value
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-700">{actionError}</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-error-800 mb-2">
            Failed to load requests
          </h3>
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-64"></div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && requests.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No access requests
          </h3>
          <p className="text-slate-600">
            {statusFilter
              ? `No ${statusFilter} requests found.`
              : 'There are no access requests at this time.'}
          </p>
        </div>
      )}

      {/* Requests list */}
      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {request.firstName} {request.lastName}
                    </h3>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        request.status === 'pending' &&
                          'bg-yellow-100 text-yellow-700',
                        request.status === 'approved' &&
                          'bg-success-100 text-success-700',
                        request.status === 'rejected' &&
                          'bg-error-100 text-error-700'
                      )}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Email:</span> {request.email}
                    </div>
                    <div>
                      <span className="font-medium">Property:</span>{' '}
                      {request.propertyName}
                    </div>
                    {request.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{' '}
                        {request.phone}
                      </div>
                    )}
                    {request.unit && (
                      <div>
                        <span className="font-medium">Unit:</span> {request.unit}
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium">Reason:</span>{' '}
                      {request.reason}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    Submitted: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Action buttons */}
                {request.status === 'pending' && (
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === request.id ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === request.id ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{' '}
            of {pagination.total} requests
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
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
              onClick={() => setPage(pagination.page + 1)}
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

export default AccessQueuePage;
