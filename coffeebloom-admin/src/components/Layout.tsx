// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Layout() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg">CoffeeBloom Admin</h1>
        <div className="flex items-center gap-4">
          <span>{profile?.username || "Guest"}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-52 bg-gray-100 border-r p-4 space-y-2">
          <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-200">
            🏠 Dashboard
          </Link>
          <Link to="/tasks" className="block px-3 py-2 rounded hover:bg-gray-200">
            ✅ Tasks
          </Link>
          <Link
            to="/settings"
            className="block px-3 py-2 rounded hover:bg-gray-200"
          >
            ⚙️ Settings
          </Link>
          <Link
            to="/reports"
            className="block px-3 py-2 rounded hover:bg-gray-200"
          >
            📊 Reports
          </Link>

          {/* HQ only */}
          {profile?.roles?.includes("honbu") && (
            <Link
              to="/users"
              className="block px-3 py-2 rounded hover:bg-gray-200 text-blue-700 font-semibold"
            >
              👥 User Management
            </Link>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
