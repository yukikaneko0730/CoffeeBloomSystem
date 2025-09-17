// src/pages/UsersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import UserDetailModal from "../components/UserDetailModal";
import { useToast } from "../components/ToastProvider";

type User = {
  id: string;
  email: string;
  roles: string[];
  store?: string;
  disabled?: boolean;
};

const STORES = ["", "Mitte", "Kreuzberg", "Neukölln"]; // "" = All Stores
const ROLES = ["honbu", "manager", "employee"];

const FUNCTIONS_BASE =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  "http://127.0.0.1:5001/admindashboard-277ac/us-central1";

export default function UsersPage() {
  const { profile } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add-new form
  const [newEmail, setNewEmail] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [newStore, setNewStore] = useState("");

  // Table controls
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Paging
  const pageSize = 8;
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as User[];
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!profile?.roles?.includes("honbu")) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">🚫 Access denied</h2>
        <p className="text-gray-600">This page is only for HQ staff.</p>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return users
      .filter((u) =>
        query ? u.email.toLowerCase().includes(query.toLowerCase()) : true
      )
      .filter((u) => (roleFilter ? u.roles?.includes(roleFilter) : true))
      .filter((u) => (storeFilter ? (u.store || "") === storeFilter : true))
      .sort((a, b) =>
        sortAsc
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email)
      );
  }, [users, query, roleFilter, storeFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAddUser = async () => {
    if (!newEmail || !newRoles) {
      toast.push("Please enter email and roles", "error");
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
    toast.push("User added", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      const res = await fetch(`${FUNCTIONS_BASE}/deleteUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth delete failed");

      toast.push("User deleted", "success");
      await fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.push(`Delete failed: ${e.message}`, "error");
    }
  };

  const handleDisableToggle = async (u: User, disabled: boolean) => {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/setUserDisabled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: u.id, disabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      toast.push(disabled ? "User disabled" : "User enabled", "success");
    } catch (e: any) {
      console.error(e);
      toast.push(e.message, "error");
    }
  };

  const handleSendReset = async (email: string) => {
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      console.log("Password reset link:", data.link);
      toast.push("Reset link generated (see console)", "success");
    } catch (e: any) {
      console.error(e);
      toast.push(e.message, "error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">👥 Manage Users (HQ Only)</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium mb-1">Search (Email)</label>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. alice@coffeebloom.com"
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Filter by Role</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Filter by Store</label>
          <select
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STORES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All Stores"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort</label>
          <button
            className="border px-3 py-2 rounded-md bg-white hover:bg-gray-100"
            onClick={() => setSortAsc((v) => !v)}
          >
            Email {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Add new user */}
      <div className="p-4 border rounded-md bg-white shadow-sm space-y-3 mb-6">
        <h2 className="text-lg font-semibold">➕ Add New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Roles (comma separated)"
            value={newRoles}
            onChange={(e) => setNewRoles(e.target.value)}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
            className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STORES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All Stores"}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddUser}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add User
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse border rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Roles</th>
                <th className="border px-4 py-2">Store</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr
                  key={u.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
                >
                  <td className="border px-4 py-3">{u.email}</td>
                  <td className="border px-4 py-3">{u.roles?.join(", ") || "—"}</td>
                  <td className="border px-4 py-3">{u.store || "All Stores"}</td>
                  <td className="border px-4 py-3 flex flex-wrap gap-2">
                    <button
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setSelectedUser(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                    {u.disabled ? (
                      <button
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleDisableToggle(u, false)}
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={() => handleDisableToggle(u, true)}
                      >
                        Disable
                      </button>
                    )}
                    <button
                      className="px-2 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                      onClick={() => handleSendReset(u.email)}
                    >
                      Reset PW
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    className="border px-3 py-6 text-center text-gray-500"
                    colSpan={4}
                  >
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="border px-3 py-1 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="px-2 py-1">
              Page {page} / {totalPages}
            </span>
            <button
              className="border px-3 py-1 rounded disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
