// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactElement } from "react";

type ProtectedRouteProps = {
  children: ReactElement; // Fix: use ReactElement instead of JSX.Element
  allowedRoles?: string[]; // Optional: restrict access by roles
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) return <p className="p-6">Loading...</p>;

  // Redirect to login if user is not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Check role-based access
  if (allowedRoles && !allowedRoles.some((role) => profile?.roles?.includes(role))) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
}
