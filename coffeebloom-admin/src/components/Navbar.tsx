// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { profile } = useAuth();

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex flex-col gap-2">
      <Link to="/">🏠 Dashboard</Link>
      <Link to="/tasks">✅ Tasks</Link>
      <Link to="/settings">⚙️ Settings</Link>

      {/* HQ only */}
      {profile?.roles?.includes("honbu") && (
        <>
          <Link to="/reports">📊 Reports</Link>
          <Link to="/users">👥 User Management</Link>
        </>
      )}

      {/* Store & Manager */}
      {(profile?.roles?.some((r) => ["store", "manager"].includes(r))) && (
        <>
          <Link to="/store-reports">📝 Store Report Input</Link>
          <Link to="/my-reports">📒 My Reports</Link>
        </>
      )}
    </nav>
  );
}
