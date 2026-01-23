import { useState } from 'react';

// AICODE-NOTE: Users management page - list, search, add/edit users across properties

const mockUsers = [
  { id: '1', email: 'john.doe@marriott.com', firstName: 'John', lastName: 'Doe', property: 'Marriott HK', status: 'active', mfa: true, lastLogin: '2 hours ago' },
  { id: '2', email: 'jane.smith@marriott.com', firstName: 'Jane', lastName: 'Smith', property: 'Marriott Singapore', status: 'active', mfa: true, lastLogin: '1 day ago' },
  { id: '3', email: 'mike.wilson@hilton.com', firstName: 'Mike', lastName: 'Wilson', property: 'Hilton Bangkok', status: 'active', mfa: false, lastLogin: '3 days ago' },
  { id: '4', email: 'sarah.jones@marriott.com', firstName: 'Sarah', lastName: 'Jones', property: 'Marriott Tokyo', status: 'pending', mfa: false, lastLogin: 'Never' },
  { id: '5', email: 'david.lee@hilton.com', firstName: 'David', lastName: 'Lee', property: 'Hilton Sydney', status: 'active', mfa: true, lastLogin: '5 hours ago' },
  { id: '6', email: 'emily.chen@marriott.com', firstName: 'Emily', lastName: 'Chen', property: 'Marriott HK', status: 'disabled', mfa: true, lastLogin: '30 days ago' },
];

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'disabled':
        return <span className="badge badge-error">Disabled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-description">Manage user accounts across all properties</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
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
                  placeholder="Search users by name or email..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="input w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">MFA</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{user.property}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4">
                  {user.mfa ? (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Enabled
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">{user.lastLogin}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="btn btn-ghost text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-slate-600">
          Showing <strong>{filteredUsers.length}</strong> of <strong>{mockUsers.length}</strong> users
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>Previous</button>
          <button className="btn btn-secondary">Next</button>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
