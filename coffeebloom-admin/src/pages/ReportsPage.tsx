// src/pages/ReportsPage.tsx
// src/pages/ReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type Task = {
  id: string;
  title: string;
  column: "todo" | "doing" | "done";
  store?: string;
  createdAt?: string;
  completedAt?: string;
};

const COLORS = ["#60a5fa", "#fbbf24", "#34d399"]; // blue, yellow, green

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "tasks"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Task[];
      setTasks(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.column === "todo").length;
    const doing = tasks.filter((t) => t.column === "doing").length;
    const done = tasks.filter((t) => t.column === "done").length;
    return { total, todo, doing, done };
  }, [tasks]);

  const pieData = [
    { name: "To Do", value: stats.todo },
    { name: "In Progress", value: stats.doing },
    { name: "Done", value: stats.done },
  ];

  const lineData = tasks
    .filter((t) => t.completedAt)
    .reduce<Record<string, number>>((acc, t) => {
      const date = t.completedAt!.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const formattedLine = Object.entries(lineData).map(([date, value]) => ({
    date,
    completed: value,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Reports & Analytics</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-gray-500 text-sm">Total Tasks</h2>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-50 shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-blue-700 text-sm">To Do</h2>
              <p className="text-2xl font-bold text-blue-700">{stats.todo}</p>
            </div>
            <div className="bg-yellow-50 shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-yellow-700 text-sm">In Progress</h2>
              <p className="text-2xl font-bold text-yellow-700">{stats.doing}</p>
            </div>
            <div className="bg-green-50 shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-green-700 text-sm">Done</h2>
              <p className="text-2xl font-bold text-green-700">{stats.done}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Pie Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">Task Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">Completed Tasks Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedLine}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#34d399" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
