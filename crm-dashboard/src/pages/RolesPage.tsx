// AICODE-NOTE: Roles & Permissions management page
// Displays role hierarchy and permission assignments

const mockRoles = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access across all properties',
    userCount: 2,
    permissions: ['manage_users', 'manage_roles', 'manage_properties', 'view_audit', 'manage_settings'],
    color: 'violet',
  },
  {
    id: '2',
    name: 'Property Admin',
    description: 'Full access within assigned properties',
    userCount: 15,
    permissions: ['manage_users', 'view_audit', 'manage_settings'],
    color: 'blue',
  },
  {
    id: '3',
    name: 'Property Manager',
    description: 'User management within assigned properties',
    userCount: 45,
    permissions: ['manage_users', 'view_audit'],
    color: 'emerald',
  },
  {
    id: '4',
    name: 'Viewer',
    description: 'Read-only access to property data',
    userCount: 234,
    permissions: ['view_users', 'view_audit'],
    color: 'slate',
  },
];

const allPermissions = [
  { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and disable users' },
  { id: 'view_users', name: 'View Users', description: 'View user information' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify roles' },
  { id: 'manage_properties', name: 'Manage Properties', description: 'Configure properties/realms' },
  { id: 'view_audit', name: 'View Audit Logs', description: 'Access audit trail' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings' },
];

export function RolesPage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-description">Define access levels and manage user permissions</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {mockRoles.map((role) => {
          const colorClasses = getColorClasses(role.color);
          return (
            <div key={role.id} className={`card border-l-4 ${colorClasses.border}`}>
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                    {role.userCount} users
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permId) => {
                      const perm = allPermissions.find(p => p.id === permId);
                      return (
                        <span key={permId} className="badge badge-neutral">
                          {perm?.name || permId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button className="btn btn-ghost text-xs flex-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button className="btn btn-ghost text-xs flex-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    View Users
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Reference */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-slate-900">Available Permissions</h3>
        </div>
        <div className="card-body p-0">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Permission</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Granted To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPermissions.map((perm) => {
                const rolesWithPerm = mockRoles.filter(r => r.permissions.includes(perm.id));
                return (
                  <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{perm.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{perm.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rolesWithPerm.map((role) => {
                          const colorClasses = getColorClasses(role.color);
                          return (
                            <span key={role.id} className={`text-xs px-2 py-0.5 rounded ${colorClasses.bg} ${colorClasses.text}`}>
                              {role.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RolesPage;
