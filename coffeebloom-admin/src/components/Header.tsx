// src/components/Header.tsx
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
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
    <header className="flex justify-between items-center bg-gray-800 text-white px-6 py-3">
      <h1 className="text-lg font-bold">CoffeeBloom Admin</h1>
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
  );
}
