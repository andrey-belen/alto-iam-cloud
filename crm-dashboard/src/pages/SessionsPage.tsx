import { useState } from 'react';

// AICODE-NOTE: Active Sessions monitoring page
// Shows all active user sessions with ability to terminate

const mockSessions = [
  {
    id: '1',
    user: { email: 'john.doe@marriott.com', firstName: 'John', lastName: 'Doe' },
    property: 'Marriott HK',
    device: 'Chrome on Windows',
    ip: '103.252.118.42',
    location: 'Hong Kong',
    startedAt: '2 hours ago',
    lastActivity: '5 minutes ago',
  },
  {
    id: '2',
    user: { email: 'jane.smith@marriott.com', firstName: 'Jane', lastName: 'Smith' },
    property: 'Marriott Singapore',
    device: 'Safari on macOS',
    ip: '116.86.234.91',
    location: 'Singapore',
    startedAt: '45 minutes ago',
    lastActivity: '2 minutes ago',
  },
  {
    id: '3',
    user: { email: 'mike.wilson@hilton.com', firstName: 'Mike', lastName: 'Wilson' },
    property: 'Hilton Bangkok',
    device: 'Firefox on Linux',
    ip: '58.137.201.177',
    location: 'Bangkok, Thailand',
    startedAt: '3 hours ago',
    lastActivity: '15 minutes ago',
  },
  {
    id: '4',
    user: { email: 'david.lee@hilton.com', firstName: 'David', lastName: 'Lee' },
    property: 'Hilton Sydney',
    device: 'Chrome on Android',
    ip: '121.200.5.99',
    location: 'Sydney, Australia',
    startedAt: '1 hour ago',
    lastActivity: '30 minutes ago',
  },
  {
    id: '5',
    user: { email: 'sarah.jones@marriott.com', firstName: 'Sarah', lastName: 'Jones' },
    property: 'Marriott Tokyo',
    device: 'Edge on Windows',
    ip: '126.114.67.201',
    location: 'Tokyo, Japan',
    startedAt: '4 hours ago',
    lastActivity: '1 hour ago',
  },
];

export function SessionsPage() {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const toggleSession = (id: string) => {
    setSelectedSessions(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedSessions.length === mockSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(mockSessions.map(s => s.id));
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('Android') || device.includes('iOS')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Active Sessions</h1>
          <p className="page-description">Monitor and manage active user sessions</p>
        </div>
        {selectedSessions.length > 0 && (
          <button className="btn btn-primary bg-red-600 hover:bg-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Terminate {selectedSessions.length} Session{selectedSessions.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Total Active</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mockSessions.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Desktop</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {mockSessions.filter(s => !s.device.includes('Android') && !s.device.includes('iOS')).length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Mobile</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {mockSessions.filter(s => s.device.includes('Android') || s.device.includes('iOS')).length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Unique Locations</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {new Set(mockSessions.map(s => s.location)).size}
          </p>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  checked={selectedSessions.length === mockSessions.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Device</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockSessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => toggleSession(session.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {session.user.firstName[0]}{session.user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-sm text-slate-500">{session.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{session.property}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{getDeviceIcon(session.device)}</span>
                    <span className="text-sm text-slate-700">{session.device}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-slate-700">{session.location}</p>
                    <p className="text-xs text-slate-500">{session.ip}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-slate-700">Started {session.startedAt}</p>
                    <p className="text-xs text-slate-500">Last active {session.lastActivity}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="btn btn-ghost text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Terminate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SessionsPage;
