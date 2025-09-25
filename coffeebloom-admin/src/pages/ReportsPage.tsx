// src/pages/ReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type Report = {
  id: string;
  store: string;
  region: string;
  category: string;
  date: string; // YYYY-MM-DD
  sales: number;
  waste: number;
  difference: number;
  topProducts?: { name: string; count: number }[];
};

const STORES = ["All Stores", "Mitte", "Kreuzberg", "Neukölln", "Charlottenburg", "Prenzlauer Berg"];
const REGIONS = ["All Regions", "Central", "East", "West"];
const CATEGORIES = ["All Categories", "Coffee", "Bakery", "Other"];

export default function ReportsPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [trendView, setTrendView] = useState<"daily" | "weekly" | "monthly">("daily");

  // Restrict access to HQ only
  if (!profile?.roles?.includes("honbu")) {
    return <p className="text-red-600 p-6">❌ Access denied. HQ only.</p>;
  }

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "reports"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Report[];
      setReports(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchStore = selectedStore === "All Stores" || r.store === selectedStore;
      const matchRegion = selectedRegion === "All Regions" || r.region === selectedRegion;
      const matchCategory = selectedCategory === "All Categories" || r.category === selectedCategory;
      return matchStore && matchRegion && matchCategory;
    });
  }, [reports, selectedStore, selectedRegion, selectedCategory]);

  // KPI aggregation
  const kpis = useMemo(() => {
    const totalSales = filtered.reduce((sum, r) => sum + r.sales, 0);
    const avgWaste = filtered.length
      ? filtered.reduce((sum, r) => sum + r.waste, 0) / filtered.length
      : 0;
    const totalDiff = filtered.reduce((sum, r) => sum + r.difference, 0);
    return { totalSales, avgWaste, totalDiff };
  }, [filtered]);

  // Group by daily / weekly / monthly
  const salesTrend = useMemo(() => {
    const grouped: Record<string, number> = {};

    filtered.forEach((r) => {
      let key = r.date;

      if (trendView === "weekly") {
        const d = new Date(r.date);
        const year = d.getFullYear();
        const week = Math.ceil(((+d - +new Date(year, 0, 1)) / 86400000 + d.getDay() + 1) / 7);
        key = `${year}-W${week}`;
      }

      if (trendView === "monthly") {
        key = r.date.slice(0, 7); // YYYY-MM
      }

      grouped[key] = (grouped[key] || 0) + r.sales;
    });

    return Object.entries(grouped).map(([date, sales]) => ({ date, sales }));
  }, [filtered, trendView]);

  // Sales by store
  const salesByStore = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((r) => {
      grouped[r.store] = (grouped[r.store] || 0) + r.sales;
    });
    return Object.entries(grouped).map(([store, sales]) => ({ store, sales }));
  }, [filtered]);

  // Alerts
  const alerts = filtered.filter(
    (r) => r.difference < -50 || r.waste > 100 || r.sales < 200
  );

  // Product ranking
  const productRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((r) => {
      r.topProducts?.forEach((p) => {
        counts[p.name] = (counts[p.name] || 0) + p.count;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filtered]);

  // Waste rate ranking
  const wasteRanking = useMemo(() => {
    return filtered
      .map((r) => {
        const rate = r.sales + r.waste > 0 ? (r.waste / (r.sales + r.waste)) * 100 : 0;
        return { store: r.store, date: r.date, rate: rate.toFixed(1) };
      })
      .sort((a, b) => Number(b.rate) - Number(a.rate))
      .slice(0, 5);
  }, [filtered]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">📊 Reports & Analytics</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-gray-500 text-sm">Total Sales</h2>
              <p className="text-2xl font-bold">€{kpis.totalSales}</p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-gray-500 text-sm">Average Waste</h2>
              <p className="text-2xl font-bold">{kpis.avgWaste.toFixed(1)}%</p>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-gray-500 text-sm">Total Difference</h2>
              <p className="text-2xl font-bold">{kpis.totalDiff}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Sales Trend */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Sales Trend</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setTrendView("daily")}
                    className={`px-3 py-1 rounded ${trendView === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTrendView("weekly")}
                    className={`px-3 py-1 rounded ${trendView === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTrendView("monthly")}
                    className={`px-3 py-1 rounded ${trendView === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#60a5fa" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Store */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">Sales by Store</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByStore}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Ranking */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-3">🥇 Top 5 Best-Selling Products</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Sales Count</th>
                </tr>
              </thead>
              <tbody>
                {productRanking.map((p, i) => (
                  <tr key={p.name} className="border-b">
                    <td className="py-2 px-3 font-bold">#{i + 1}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Waste Ranking */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-3">🗑️ Top 5 Highest Waste Rate Stores</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Store</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Waste Rate</th>
                </tr>
              </thead>
              <tbody>
                {wasteRanking.map((w, i) => (
                  <tr key={`${w.store}-${w.date}`} className="border-b">
                    <td className="py-2 px-3 font-bold">#{i + 1}</td>
                    <td className="py-2 px-3">{w.store}</td>
                    <td className="py-2 px-3">{w.date}</td>
                    <td className="py-2 px-3 text-red-600">{w.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
              <h2 className="text-lg font-bold text-red-600">⚠️ Alerts</h2>
              <ul className="mt-3 space-y-2">
                {alerts.map((a) => (
                  <li key={a.id}>
                    {a.store} ({a.date}): Sales €{a.sales}, Waste {a.waste}, Diff {a.difference}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
