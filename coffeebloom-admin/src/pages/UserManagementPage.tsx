// src/pages/UserManagementPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

type UserData = {
  id: string;
  email: string;
  roles: string[];
  store?: string;
  createdAt?: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("store");
  const [store, setStore] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserData)));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!email) {
      setMessage("❌ Please enter an email.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const newUserRef = doc(collection(db, "users")); // generate doc ID
      await setDoc(newUserRef, {
        email,
        roles: [role],
        store: store || null,
        createdAt: new Date().toISOString(),
      });

      setMessage("✅ User added successfully!");
      setEmail("");
      setRole("store");
      setStore("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error adding user:", err);
      setMessage("❌ Failed to add user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setMessage("✅ User deleted successfully!");
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setMessage("❌ Failed to delete user: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">👥 User Management</h1>

      {message && (
        <p
          className={`mb-4 ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Add User Form */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded flex-1 min-w-[180px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="honbu">HQ (Honbu)</option>
          <option value="store">Store</option>
          <option value="manager">Manager</option>
        </select>
        <input
          type="text"
          placeholder="Store (optional)"
          className="border px-3 py-2 rounded"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />
        <button
          onClick={handleAddUser}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Users Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Roles</th>
            <th className="px-3 py-2 text-left">Store</th>
            <th className="px-3 py-2 text-left">Created At</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.roles?.join(", ")}</td>
              <td className="px-3 py-2">{u.store || "-"}</td>
              <td className="px-3 py-2">{u.createdAt?.slice(0, 10) || "-"}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
