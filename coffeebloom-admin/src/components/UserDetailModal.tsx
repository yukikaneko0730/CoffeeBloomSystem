// src/components/UserDetailModal.tsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Props = {
  isOpen: boolean;
  user: {
    id: string;
    email: string;
    roles: string[];
    store?: string;
  };
  onClose: () => void;
  onUpdated: () => void; // callback to refresh
};

export default function UserDetailModal({ isOpen, user, onClose, onUpdated }: Props) {
  const [roles, setRoles] = useState(user.roles.join(", "));
  const [store, setStore] = useState(user.store || "");

  if (!isOpen) return null;

  const handleSave = async () => {
    const updatedRoles = roles.split(",").map((r) => r.trim());
    await updateDoc(doc(db, "users", user.id), {
      roles: updatedRoles,
      store,
    });
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md w-96">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <p className="mb-2">Email: {user.email}</p>

        <label className="block mb-2 text-sm">Roles (comma separated)</label>
        <input
          type="text"
          value={roles}
          onChange={(e) => setRoles(e.target.value)}
          className="w-full border px-3 py-2 rounded-md mb-4"
        />

        <label className="block mb-2 text-sm">Store</label>
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full border px-3 py-2 rounded-md mb-4"
        >
          <option value="">All Stores</option>
          <option value="Mitte">Mitte</option>
          <option value="Kreuzberg">Kreuzberg</option>
          <option value="Neukölln">Neukölln</option>
        </select>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
