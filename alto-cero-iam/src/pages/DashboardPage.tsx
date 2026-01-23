import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import type { Property } from '@/types';

// AICODE-NOTE: Dashboard overview page with role-based content
// Super admins see: all stats, activity feed, quick actions, system status
// Clients see: properties count, welcome card with link to properties

// Stat card icons
const Icons = {
  properties: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  sessions: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  arrow: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: 'violet' | 'emerald' | 'amber' | 'blue';
}

function StatCard({ title, value, change, changeType = 'neutral', icon, color }: StatCardProps) {
  const colorClasses = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`stat-card-icon ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: 'login' | 'user_created' | 'access_granted' | 'access_revoked' | 'mfa_enabled';
  user: string;
  property?: string;
  timestamp: string;
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      case 'user_created':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'access_granted':
        return (
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'access_revoked':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        );
      case 'mfa_enabled':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityText = (item: ActivityItem) => {
    switch (item.type) {
      case 'login':
        return <><strong>{item.user}</strong> logged in{item.property && ` to ${item.property}`}</>;
      case 'user_created':
        return <><strong>{item.user}</strong> was created{item.property && ` in ${item.property}`}</>;
      case 'access_granted':
        return <>Access granted to <strong>{item.user}</strong>{item.property && ` for ${item.property}`}</>;
      case 'access_revoked':
        return <>Access revoked for <strong>{item.user}</strong>{item.property && ` from ${item.property}`}</>;
      case 'mfa_enabled':
        return <><strong>{item.user}</strong> enabled MFA</>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="card-body p-0">
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              {getActivityIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{getActivityText(item)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Add User', icon: Icons.users, href: '/users', color: 'violet' },
    { label: 'View Requests', icon: Icons.pending, href: '/access-queue', color: 'amber' },
    { label: 'Audit Logs', icon: Icons.sessions, href: '/audit', color: 'blue' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${action.color}-100 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-slate-700">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// AICODE-NOTE: Welcome card for client admins (non-super-admins)
// Shows property count and link to properties page
function ClientWelcomeCard({
  userName,
  properties,
}: {
  userName?: string;
  properties: Property[];
}) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            {Icons.properties}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Welcome to Alto Cloud
            </h3>
            <p className="text-slate-600 mb-4">
              Hi {userName || 'there'}! You have access to{' '}
              <strong className="text-violet-600">{properties.length}</strong>{' '}
              {properties.length === 1 ? 'property' : 'properties'}.
              Manage user access and authentication for your properties from this dashboard.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              View Your Properties
              {Icons.arrow}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const { properties, isLoading } = useProperties();

  // Mock data for demo (admin only)
  const mockActivity: ActivityItem[] = [
    { id: '1', type: 'login', user: 'john.doe@marriott.com', property: 'Marriott HK', timestamp: '2 minutes ago' },
    { id: '2', type: 'user_created', user: 'jane.smith@marriott.com', property: 'Marriott Singapore', timestamp: '15 minutes ago' },
    { id: '3', type: 'access_granted', user: 'mike.wilson@hilton.com', property: 'Hilton Bangkok', timestamp: '1 hour ago' },
    { id: '4', type: 'mfa_enabled', user: 'sarah.jones@marriott.com', timestamp: '2 hours ago' },
    { id: '5', type: 'login', user: 'david.lee@hilton.com', property: 'Hilton Sydney', timestamp: '3 hours ago' },
    { id: '6', type: 'access_revoked', user: 'temp.user@marriott.com', property: 'Marriott Tokyo', timestamp: '5 hours ago' },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting()}, {user?.firstName || 'Admin'}</h1>
        <p className="page-description">
          {isSuperAdmin()
            ? "Here's what's happening across all properties today."
            : 'Manage user access for your properties.'}
        </p>
      </div>

      {/* Stats Grid - Different for admin vs client */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        isSuperAdmin() ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
      } gap-6 mb-8`}>
        {/* Properties stat - visible to everyone */}
        <StatCard
          title="Properties"
          value={isLoading ? '...' : properties.length}
          change={isSuperAdmin() ? '+2 this month' : undefined}
          changeType="positive"
          icon={Icons.properties}
          color="violet"
        />

        {/* Admin-only stats */}
        {isSuperAdmin() && (
          <>
            <StatCard
              title="Total Users"
              value="1,234"
              change="+89 this week"
              changeType="positive"
              icon={Icons.users}
              color="emerald"
            />
            <StatCard
              title="Active Sessions"
              value="156"
              change="23 new today"
              changeType="neutral"
              icon={Icons.sessions}
              color="blue"
            />
            <StatCard
              title="Pending Requests"
              value="3"
              change="Needs attention"
              changeType="negative"
              icon={Icons.pending}
              color="amber"
            />
          </>
        )}
      </div>

      {/* Content Grid - Different layout for admin vs client */}
      <div className={`grid grid-cols-1 ${isSuperAdmin() ? 'lg:grid-cols-3' : ''} gap-8`}>
        {/* Main content area */}
        <div className={isSuperAdmin() ? 'lg:col-span-2' : ''}>
          {isSuperAdmin() ? (
            <ActivityFeed items={mockActivity} />
          ) : (
            <ClientWelcomeCard userName={user?.firstName} properties={properties} />
          )}
        </div>

        {/* Admin-only sidebar: Quick Actions + System Status */}
        {isSuperAdmin() && (
          <div>
            <QuickActions />

            {/* System Status */}
            <div className="card mt-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Keycloak Server</span>
                    <span className="badge badge-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Authentication</span>
                    <span className="badge badge-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">MFA Service</span>
                    <span className="badge badge-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Audit Logging</span>
                    <span className="badge badge-success">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
