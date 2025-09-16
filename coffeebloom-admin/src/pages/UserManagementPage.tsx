// src/pages/UserManagementPage.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function UserManagementPage() {
  const { profile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [store, setStore] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Only HQ can access
  if (!profile?.roles.includes("honbu")) {
    return <p className="text-red-600 p-4">❌ Access denied. HQ only.</p>;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Create account in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Save profile in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role,
        store,
        createdAt: new Date().toISOString(),
      });

      setMessage("✅ User created successfully!");
      setEmail("");
      setPassword("");
      setRole("employee");
      setStore("");
    } catch (err: any) {
      console.error("Create user error:", err);
      setMessage("❌ " + (err.message || "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">👥 User Management</h2>
      {message && (
        <p
          className={`mb-3 text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleCreateUser} className="space-y-4">
        <input
          type="email"
          placeholder="User Email"
          className="w-full border px-3 py-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          className="w-full border px-3 py-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="w-full border px-3 py-2 rounded-md"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="employee">Employee</option>
          <option value="manager">Store Manager</option>
          <option value="honbu">HQ</option>
        </select>

        <input
          type="text"
          placeholder="Store (optional)"
          className="w-full border px-3 py-2 rounded-md"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
