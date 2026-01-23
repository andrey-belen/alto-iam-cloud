import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { UsersPage } from '@/pages/UsersPage';
import { RolesPage } from '@/pages/RolesPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { AuditPage } from '@/pages/AuditPage';
import { AccessQueuePage } from '@/pages/AccessQueuePage';
import { RequestAccessPage } from '@/pages/RequestAccessPage';
import { ApprovePage } from '@/pages/ApprovePage';
import { RejectPage } from '@/pages/RejectPage';

// AICODE-NOTE: Alto CERO IAM Dashboard routing structure with sidebar layout
// - Root (/) shows dashboard overview
// - Public routes: /request-access, /approve/:token, /reject/:token
// - All protected routes wrapped in DashboardLayout (sidebar + main content)

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/request-access" element={<RequestAccessPage />} />
      <Route path="/approve/:token" element={<ApprovePage />} />
      <Route path="/reject/:token" element={<RejectPage />} />

      {/* Protected routes with sidebar layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PropertiesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:propertyId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PropertyDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RolesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* AICODE-NOTE: Access Queue restricted to Alto super admins only */}
      <Route
        path="/access-queue"
        element={
          <ProtectedRoute requireSuperAdmin>
            <DashboardLayout>
              <AccessQueuePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SessionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AuditPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="p-8">
                <div className="page-header">
                  <h1 className="page-title">Settings</h1>
                  <p className="page-description">Configure your account and system preferences</p>
                </div>
                <div className="card">
                  <div className="card-body">
                    <p className="text-slate-600">Settings page coming soon...</p>
                  </div>
                </div>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
