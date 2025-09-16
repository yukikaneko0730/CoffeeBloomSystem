// src/pages/SettingsPage.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [store, setStore] = useState(profile?.store || "");
  const [notifications, setNotifications] = useState(
    profile?.notifications ?? true
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!user || !profile) {
    return <p className="p-6">Please log in.</p>;
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        store,
        notifications,
      });
      setMessage("✅ Settings updated successfully.");
    } catch (err) {
      console.error("Settings update error:", err);
      setMessage("❌ Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">⚙️ Settings</h1>

      {/* Basic Info */}
      <div className="space-y-2 mb-6">
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Roles:</strong> {profile.roles.join(", ")}
        </p>
      </div>

      {/* Store selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Assigned Store</label>
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="">Not assigned</option>
          <option value="Berlin Mitte">Berlin Mitte</option>
          <option value="Berlin Kreuzberg">Berlin Kreuzberg</option>
          <option value="Berlin Neukölln">Berlin Neukölln</option>
          <option value="Berlin Charlottenburg">Berlin Charlottenburg</option>
          <option value="Berlin Prenzlauer Berg">Berlin Prenzlauer Berg</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>

      {/* Feedback */}
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
