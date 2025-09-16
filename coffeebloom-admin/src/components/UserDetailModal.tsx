// src/components/UserDetailModal.tsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type User = {
  id: string;
  email: string;
  roles: string[];
  store?: string;
};

type Props = {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdated: () => void; // refresh user list
};

export default function UserDetailModal({
  isOpen,
  user,
  onClose,
  onUpdated,
}: Props) {
  // Local form state
  const [email, setEmail] = useState(user.email);
  const [roles, setRoles] = useState(user.roles.join(", "));
  const [store, setStore] = useState(user.store || "");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Update Firestore + Firebase Auth (via Cloud Function)
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Firestore profile
      await updateDoc(doc(db, "users", user.id), {
        email,
        roles: roles.split(",").map((r) => r.trim()),
        store,
        updatedAt: new Date().toISOString(),
      });

      // 2. Update Firebase Auth via Cloud Function
      const res = await fetch(
        // ⚠️ Emulator用URL → 本番デプロイ時は公式エンドポイントに差し替え
        `http://127.0.0.1:5001/admindashboard-277ac/us-central1/updateUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.id, email }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update Firebase Auth");
      }

      alert("✅ User updated successfully");
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      alert("❌ Failed to update user: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <h2 className="text-xl font-bold mb-4">✏️ Edit User</h2>

        {/* Email */}
        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded-md mb-3"
        />

        {/* Roles */}
        <label className="block mb-2 text-sm font-medium">Roles</label>
        <input
          type="text"
          value={roles}
          onChange={(e) => setRoles(e.target.value)}
          className="w-full border px-3 py-2 rounded-md mb-3"
          placeholder="e.g. honbu, manager"
        />

        {/* Store */}
        <label className="block mb-2 text-sm font-medium">Store</label>
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full border px-3 py-2 rounded-md mb-3"
        >
          <option value="">All Stores</option>
          <option value="Mitte">Mitte</option>
          <option value="Kreuzberg">Kreuzberg</option>
          <option value="Neukölln">Neukölln</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
