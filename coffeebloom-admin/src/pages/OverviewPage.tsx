// src/pages/OverviewPage.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function OverviewPage() {
  const pieData = [
    { name: "Achieved", value: 67 },
    { name: "Remaining", value: 33 },
  ];
  const COLORS = ["#3B82F6", "#E5E7EB"];

  const barData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3200 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4700 },
  ];

  const lineData = [
    { month: "Jan", users: 2400 },
    { month: "Feb", users: 2800 },
    { month: "Mar", users: 3500 },
    { month: "Apr", users: 4200 },
  ];

  const menuRanking = [
    { item: "Caffè Latte", sales: 1200 },
    { item: "Matcha Frappé", sales: 950 },
    { item: "Cinnamon Roll", sales: 730 },
    { item: "Cold Brew", sales: 660 },
    { item: "Vegan Donut", sales: 540 },
  ];

  const storeRanking = [
    { store: "Berlin Mitte", revenue: 15200 },
    { store: "Munich Central", revenue: 13450 },
    { store: "Hamburg Altona", revenue: 9800 },
    { store: "Cologne City", revenue: 8700 },
    { store: "Frankfurt Main", revenue: 8100 },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Target */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">🎯 Target</h2>
        <div className="h-52">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                label
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Bar Chart */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">💰 Monthly Sales</h2>
        <div className="h-52">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Line Chart */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">👥 Active Users</h2>
        <div className="h-52">
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best-Selling Menu Ranking */}
      <div className="bg-white rounded-xl border p-5 shadow-sm lg:col-span-2">
        <h2 className="font-semibold mb-4">🍩 Best-Selling Menu</h2>
        <ul className="divide-y text-sm">
          {menuRanking.map((menu, i) => (
            <li key={i} className="flex justify-between py-2">
              <span className="font-medium">
                {i + 1}. {menu.item}
              </span>
              <span className="text-gray-500">{menu.sales} sold</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top 5 Stores */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">🏪 Top 5 Stores</h2>
        <ul className="text-sm space-y-2">
          {storeRanking.map((s, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {i + 1}. {s.store}
              </span>
              <span className="text-gray-500">€{s.revenue.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
