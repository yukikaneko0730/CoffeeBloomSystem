// src/pages/UsersPage.tsx
import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import UserDetailModal from "../components/UserDetailModal";

type User = {
  id: string;
  email: string;
  roles: string[];
  store?: string;
};

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [newStore, setNewStore] = useState("");

  const pageSize = 5;
  const totalPages = Math.ceil(users.length / pageSize);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // HQ only check
  if (!profile?.roles?.includes("honbu")) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">🚫 Access denied</h2>
        <p className="text-gray-600">This page is only for HQ staff.</p>
      </div>
    );
  }

  // Delete user
  const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    // 1. Delete from Firestore
    await deleteDoc(doc(db, "users", id));

    // 2. Call Cloud Function to delete from Firebase Auth
    const res = await fetch(
      `https://<YOUR_REGION>-<YOUR_PROJECT>.cloudfunctions.net/deleteUser`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: id }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete user in Firebase Auth");
    }

    alert("✅ User deleted successfully.");
    await fetchUsers();
  } catch (err: any) {
    console.error("Delete error:", err);
    alert("❌ Failed to delete user.");
  }
};

  // Add new user (Firestore only, not Firebase Auth)
  const handleAddUser = async () => {
    if (!newEmail || !newRoles) {
      alert("Please enter email and roles.");
      return;
    }
    await addDoc(collection(db, "users"), {
      email: newEmail,
      roles: newRoles.split(",").map((r) => r.trim()),
      store: newStore || "",
      createdAt: new Date().toISOString(),
    });
    setNewEmail("");
    setNewRoles("");
    setNewStore("");
    await fetchUsers();
  };

  // Pagination slice
  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Manage Users (HQ Only)</h1>

      {/* Add new user form */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">➕ Add New User</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Roles (comma separated)"
            value={newRoles}
            onChange={(e) => setNewRoles(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />
          <select
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">All Stores</option>
            <option value="Mitte">Mitte</option>
            <option value="Kreuzberg">Kreuzberg</option>
            <option value="Neukölln">Neukölln</option>
          </select>
        </div>
        <button
          onClick={handleAddUser}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Roles</th>
                <th className="border px-3 py-2">Store</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border px-3 py-2">{user.email}</td>
                  <td className="border px-3 py-2">
                    {user.roles?.join(", ") || "No roles"}
                  </td>
                  <td className="border px-3 py-2">{user.store || "-"}</td>
                  <td className="border px-3 py-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline ml-2"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={true}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
