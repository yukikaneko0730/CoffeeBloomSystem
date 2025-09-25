// src/pages/AddReportPage.tsx
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Coffee", "Bakery", "Other"];

export default function AddReportPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    region: "",
    category: CATEGORIES[0],
    date: "",
    sales: 0,
    waste: 0,
    difference: 0,
  });

  if (!profile) {
    return <p className="p-6">Loading...</p>;
  }

  // 店舗ユーザーでなければ拒否
  if (!profile.roles?.includes("store") && !profile.roles?.includes("manager")) {
    return <p className="text-red-600 p-6">❌ Access denied. Store/Manager only.</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDoc(collection(db, "reports"), {
      store: profile.store, // 🔑 ユーザーの店舗を自動で保存
      region: form.region || "Unknown",
      category: form.category,
      date: form.date,
      sales: Number(form.sales),
      waste: Number(form.waste),
      difference: Number(form.difference),
      createdBy: profile.email,
    });

    alert("✅ Report submitted!");
    setForm({ region: "", category: CATEGORIES[0], date: "", sales: 0, waste: 0, difference: 0 });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">➕ Submit Report</h1>

      <p className="mb-4 text-gray-600">
        Store: <span className="font-semibold">{profile.store}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Region */}
        <input
          type="text"
          name="region"
          value={form.region}
          onChange={handleChange}
          placeholder="Region"
          className="border p-2 w-full"
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Sales */}
        <input
          type="number"
          name="sales"
          value={form.sales}
          onChange={handleChange}
          placeholder="Sales (€)"
          className="border p-2 w-full"
        />

        {/* Waste */}
        <input
          type="number"
          name="waste"
          value={form.waste}
          onChange={handleChange}
          placeholder="Waste (items)"
          className="border p-2 w-full"
        />

        {/* Difference */}
        <input
          type="number"
          name="difference"
          value={form.difference}
          onChange={handleChange}
          placeholder="Difference"
          className="border p-2 w-full"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Report
        </button>
      </form>
    </div>
  );
}
