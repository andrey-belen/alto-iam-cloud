import { Sidebar } from './Sidebar';

// AICODE-NOTE: Main dashboard layout wrapper
// Fixed sidebar on left, main content area on right
// Handles padding offset for fixed sidebar width (w-64 = 16rem)

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
