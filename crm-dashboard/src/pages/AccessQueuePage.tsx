import { useState } from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import {
  approveAccessRequest,
  rejectAccessRequest,
} from '@/services/access-requests';
import { cn } from '@/lib/utils';
import type { AccessRequest, AccessRequestStatus } from '@/types';

// AICODE-NOTE: Access request approval queue - purple themed
// Operators approve/reject pending access requests

export function AccessQueuePage() {
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | undefined>('pending');
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

  const statusFilters: { label: string; value: AccessRequestStatus | undefined; count?: number }[] = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending', count: 3 },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'approved':
        return <span className="badge badge-success">Approved</span>;
      case 'rejected':
        return <span className="badge badge-error">Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Access Requests</h1>
          <p className="page-description">Review and process access requests from users</p>
        </div>
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => handleStatusFilterChange(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                statusFilter === filter.value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              )}
            >
              {filter.label}
              {filter.count && statusFilter !== filter.value && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="mb-6 card border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700">{actionError}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card border-red-200 bg-red-50 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load requests</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => refetch()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-64 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
                  <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && requests.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No access requests</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            {statusFilter
              ? `No ${statusFilter} requests found.`
              : 'There are no access requests at this time. Requests will appear here when users submit them.'}
          </p>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="card hover:shadow-lg hover:border-violet-200 transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar">
                        {request.firstName[0]}{request.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {request.firstName} {request.lastName}
                        </h3>
                        <p className="text-sm text-slate-500">{request.email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                        <span>{request.propertyName}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{request.phone}</span>
                        </div>
                      )}
                      {request.unit && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Unit {request.unit}</span>
                        </div>
                      )}
                    </div>

                    {request.reason && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason</p>
                        <p className="text-sm text-slate-700">{request.reason}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Submitted {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                        className="btn bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request.id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                        className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request.id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-600">
            Showing <strong>{(pagination.page - 1) * pagination.pageSize + 1}</strong> to{' '}
            <strong>{Math.min(pagination.page * pagination.pageSize, pagination.total)}</strong> of{' '}
            <strong>{pagination.total}</strong> requests
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
