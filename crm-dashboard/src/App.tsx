import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { LoginPage } from '@/pages/LoginPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { RequestAccessPage } from '@/pages/RequestAccessPage';
import { AccessQueuePage } from '@/pages/AccessQueuePage';

// AICODE-NOTE: Alto CRM Dashboard routing structure
// - Login: Authentication entry point
// - Properties: Property (realm) management
// - PropertyDetail: User list for specific property
// - RequestAccess: Public form (no auth required)
// - AccessQueue: Operator approval queue

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-access" element={<RequestAccessPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <PropertiesPage />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <PropertiesPage />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <PropertyDetailPage />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/access-queue"
          element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <AccessQueuePage />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
