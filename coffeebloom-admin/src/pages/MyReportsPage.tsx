// src/pages/MyReportsPage.tsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

type Report = {
  id: string;
  store: string;
  region: string;
  category: string;
  date: string;
  sales: number;
  waste: number;
  difference: number;
};

export default function MyReportsPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  if (!profile) {
    return <p className="p-6">Loading...</p>;
  }

  if (!profile.roles?.includes("store") && !profile.roles?.includes("manager")) {
    return <p className="text-red-600 p-6">❌ Access denied. Store/Manager only.</p>;
  }

  const fetchReports = async () => {
    if (!profile.store) return;

    const q = query(
      collection(db, "reports"),
      where("store", "==", profile.store),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Report[];
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [profile.store]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this report?")) {
      await deleteDoc(doc(db, "reports", id));
      fetchReports();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📒 My Reports</h1>

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found for your store.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Region</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Sales (€)</th>
              <th className="px-3 py-2 text-left">Waste</th>
              <th className="px-3 py-2 text-left">Diff</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.region}</td>
                <td className="px-3 py-2">{r.category}</td>
                <td className="px-3 py-2">€{r.sales}</td>
                <td className="px-3 py-2">{r.waste}</td>
                <td
                  className={`px-3 py-2 font-bold ${
                    r.difference < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {r.difference}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
