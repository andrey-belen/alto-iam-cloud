import { useState } from 'react';

// AICODE-NOTE: Audit Logs page - comprehensive activity tracking
// Shows all authentication and authorization events

const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2024-01-21 14:32:15',
    type: 'LOGIN_SUCCESS',
    user: 'john.doe@marriott.com',
    property: 'Marriott HK',
    ip: '103.252.118.42',
    details: 'User logged in successfully with MFA',
  },
  {
    id: '2',
    timestamp: '2024-01-21 14:28:03',
    type: 'USER_CREATED',
    user: 'operator@alto.energy',
    property: 'Marriott Singapore',
    ip: '10.0.0.1',
    details: 'Created user: jane.smith@marriott.com',
  },
  {
    id: '3',
    timestamp: '2024-01-21 14:15:42',
    type: 'LOGIN_FAILED',
    user: 'unknown@test.com',
    property: 'Hilton Bangkok',
    ip: '192.168.1.100',
    details: 'Invalid credentials - attempt 3 of 5',
  },
  {
    id: '4',
    timestamp: '2024-01-21 13:58:21',
    type: 'ACCESS_GRANTED',
    user: 'operator@alto.energy',
    property: 'Hilton Bangkok',
    ip: '10.0.0.1',
    details: 'Granted access to mike.wilson@hilton.com',
  },
  {
    id: '5',
    timestamp: '2024-01-21 13:45:08',
    type: 'MFA_ENROLLED',
    user: 'sarah.jones@marriott.com',
    property: 'Marriott Tokyo',
    ip: '126.114.67.201',
    details: 'User enrolled in TOTP authentication',
  },
  {
    id: '6',
    timestamp: '2024-01-21 13:30:55',
    type: 'PASSWORD_RESET',
    user: 'david.lee@hilton.com',
    property: 'Hilton Sydney',
    ip: '121.200.5.99',
    details: 'Password reset requested and completed',
  },
  {
    id: '7',
    timestamp: '2024-01-21 13:22:17',
    type: 'LOGOUT',
    user: 'emily.chen@marriott.com',
    property: 'Marriott HK',
    ip: '103.252.118.42',
    details: 'User logged out manually',
  },
  {
    id: '8',
    timestamp: '2024-01-21 13:10:33',
    type: 'ACCESS_REVOKED',
    user: 'operator@alto.energy',
    property: 'Marriott Tokyo',
    ip: '10.0.0.1',
    details: 'Revoked access from temp.user@marriott.com',
  },
  {
    id: '9',
    timestamp: '2024-01-21 12:55:44',
    type: 'ROLE_CHANGED',
    user: 'operator@alto.energy',
    property: 'Hilton Sydney',
    ip: '10.0.0.1',
    details: 'Changed role of david.lee@hilton.com from Viewer to Manager',
  },
  {
    id: '10',
    timestamp: '2024-01-21 12:40:19',
    type: 'SESSION_TERMINATED',
    user: 'operator@alto.energy',
    property: 'Marriott Singapore',
    ip: '10.0.0.1',
    details: 'Terminated session for suspicious activity',
  },
];

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'LOGIN_SUCCESS', label: 'Login Success' },
  { value: 'LOGIN_FAILED', label: 'Login Failed' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'ACCESS_GRANTED', label: 'Access Granted' },
  { value: 'ACCESS_REVOKED', label: 'Access Revoked' },
  { value: 'MFA_ENROLLED', label: 'MFA Enrolled' },
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'ROLE_CHANGED', label: 'Role Changed' },
  { value: 'SESSION_TERMINATED', label: 'Session Terminated' },
];

export function AuditPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEventBadge = (type: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      LOGIN_SUCCESS: { class: 'badge-success', label: 'Login' },
      LOGIN_FAILED: { class: 'badge-error', label: 'Failed Login' },
      LOGOUT: { class: 'badge-neutral', label: 'Logout' },
      USER_CREATED: { class: 'badge-info', label: 'User Created' },
      ACCESS_GRANTED: { class: 'badge-success', label: 'Access Granted' },
      ACCESS_REVOKED: { class: 'badge-error', label: 'Access Revoked' },
      MFA_ENROLLED: { class: 'badge-info', label: 'MFA Enrolled' },
      PASSWORD_RESET: { class: 'badge-warning', label: 'Password Reset' },
      ROLE_CHANGED: { class: 'badge-info', label: 'Role Changed' },
      SESSION_TERMINATED: { class: 'badge-warning', label: 'Session Ended' },
    };
    const badge = badges[type] || { class: 'badge-neutral', label: type };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const getEventIcon = (type: string) => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'LOGIN_SUCCESS':
        return <svg className={`${iconClass} text-emerald-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
      case 'LOGIN_FAILED':
        return <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'USER_CREATED':
        return <svg className={`${iconClass} text-violet-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
      case 'ACCESS_GRANTED':
        return <svg className={`${iconClass} text-emerald-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'ACCESS_REVOKED':
        return <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
      case 'MFA_ENROLLED':
        return <svg className={`${iconClass} text-violet-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      default:
        return <svg className={`${iconClass} text-slate-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-description">Track all authentication and authorization events</p>
        </div>
        <button className="btn btn-secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by user, property, or details..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="input w-auto"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input
              type="date"
              className="input w-auto"
            />
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="card">
        <div className="card-body p-0">
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 pt-1">
                  {getEventIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getEventBadge(log.type)}
                        <span className="text-sm font-medium text-slate-900">{log.user}</span>
                      </div>
                      <p className="text-sm text-slate-600">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                          </svg>
                          {log.property}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {log.ip}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-slate-500">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-slate-600">
          Showing <strong>{filteredLogs.length}</strong> of <strong>{mockAuditLogs.length}</strong> events
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>Previous</button>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>
    </div>
  );
}

export default AuditPage;
