// src/components/Header.tsx
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Handle logout and redirect to login page
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white px-6 py-3">
      {/* Left: navigation */}
      <nav className="flex gap-6">
        <Link to="/" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/tasks" className="hover:underline">
          Tasks
        </Link>
        <Link to="/reports" className="hover:underline">
          Reports
        </Link>
        <Link to="/settings" className="hover:underline">
          Settings
        </Link>
        {/* HQ-only page */}
        {profile?.roles?.includes("honbu") && (
          <Link to="/users" className="hover:underline">
            Users
          </Link>
        )}
      </nav>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        <span>{profile?.username || profile?.email || "Guest"}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
