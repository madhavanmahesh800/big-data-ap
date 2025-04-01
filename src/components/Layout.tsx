
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { Navigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children, requireAuth = true }: LayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-400"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and auth is required
  if (!isAuthenticated && requireAuth) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if authenticated but on auth pages
  if (isAuthenticated && !requireAuth) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    // For auth pages (login/register)
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 to-white">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  // For authenticated pages
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
