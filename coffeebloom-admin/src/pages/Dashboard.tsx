// src/pages/Dashboard.tsx
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) return <p>Please log in.</p>;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Welcome {profile?.username || user.email}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>

      {/* User info */}
      <div className="space-y-2">
        <p className="text-gray-700">
          <strong>Email:</strong> {profile?.email || user.email}
        </p>

        <p className="text-gray-700">
          <strong>Roles:</strong>{" "}
          {profile?.roles?.length ? profile.roles.join(", ") : "No roles assigned"}
        </p>

        <p className="text-gray-700">
          <strong>Store:</strong> {profile?.store || "Not assigned"}
        </p>
      </div>
    </div>
  );
}
