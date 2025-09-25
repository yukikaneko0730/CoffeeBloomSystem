// src/pages/StoreReportsPage.tsx
import { useMemo, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

// -------- Menu master (names + default prices) --------
type MenuItem = {
  id: string;
  category: "Coffee Drinks" | "Other Drinks" | "Cakes" | "Sandwiches";
  name: string;
  price: number; // € per unit
};

const MENU: MenuItem[] = [
  // 10 Coffee Drinks
  { id: "c1", category: "Coffee Drinks", name: "Espresso", price: 2.5 },
  { id: "c2", category: "Coffee Drinks", name: "Americano", price: 3.0 },
  { id: "c3", category: "Coffee Drinks", name: "Cappuccino", price: 3.5 },
  { id: "c4", category: "Coffee Drinks", name: "Latte", price: 3.8 },
  { id: "c5", category: "Coffee Drinks", name: "Flat White", price: 3.8 },
  { id: "c6", category: "Coffee Drinks", name: "Mocha", price: 4.0 },
  { id: "c7", category: "Coffee Drinks", name: "Macchiato", price: 3.2 },
  { id: "c8", category: "Coffee Drinks", name: "Iced Americano", price: 3.2 },
  { id: "c9", category: "Coffee Drinks", name: "Iced Latte", price: 4.0 },
  { id: "c10", category: "Coffee Drinks", name: "Cold Brew", price: 4.2 },

  // 10 Other Drinks
  { id: "o1", category: "Other Drinks", name: "Matcha Latte", price: 4.5 },
  { id: "o2", category: "Other Drinks", name: "Chai Latte", price: 4.3 },
  { id: "o3", category: "Other Drinks", name: "Hot Chocolate", price: 4.0 },
  { id: "o4", category: "Other Drinks", name: "Orange Juice", price: 3.8 },
  { id: "o5", category: "Other Drinks", name: "Apple Juice", price: 3.8 },
  { id: "o6", category: "Other Drinks", name: "Iced Tea", price: 3.2 },
  { id: "o7", category: "Other Drinks", name: "Lemonade", price: 3.2 },
  { id: "o8", category: "Other Drinks", name: "Sparkling Water", price: 2.5 },
  { id: "o9", category: "Other Drinks", name: "Still Water", price: 2.0 },
  { id: "o10", category: "Other Drinks", name: "Italian Soda", price: 3.5 },

  // 7 Cakes
  { id: "k1", category: "Cakes", name: "Cheesecake", price: 4.8 },
  { id: "k2", category: "Cakes", name: "Chocolate Cake", price: 4.8 },
  { id: "k3", category: "Cakes", name: "Carrot Cake", price: 4.8 },
  { id: "k4", category: "Cakes", name: "Tiramisu", price: 5.2 },
  { id: "k5", category: "Cakes", name: "Blueberry Muffin", price: 3.2 },
  { id: "k6", category: "Cakes", name: "Banana Bread", price: 3.5 },
  { id: "k7", category: "Cakes", name: "Lemon Tart", price: 4.5 },

  // 5 Sandwiches
  { id: "s1", category: "Sandwiches", name: "Ham & Cheese", price: 5.5 },
  { id: "s2", category: "Sandwiches", name: "Turkey Avocado", price: 6.5 },
  { id: "s3", category: "Sandwiches", name: "Veggie", price: 5.2 },
  { id: "s4", category: "Sandwiches", name: "Tuna", price: 5.8 },
  { id: "s5", category: "Sandwiches", name: "BLT", price: 6.0 },
];

// -------- Supplies master --------
const SUPPLY_KEYS = [
  "Large Paper Bag",
  "Small Paper Bag",
  "Sandwich Bag",
  "Paper Cup",
  "Paper Cup Lid",
  "Plastic Cup",
  "Plastic Lid",
  "Plastic Spoon",
  "Plastic Fork",
  "Cake Takeout Box",
] as const;

type SupplyKey = (typeof SUPPLY_KEYS)[number];

type LineState = {
  price: number;
  sold: number;
  waste: number;
};

export default function StoreReportsPage() {
  const { profile } = useAuth();

  // Guard
  if (!profile) return <p className="p-6">Loading...</p>;
  if (!profile.roles?.some((r) => r === "store" || r === "manager")) {
    return <p className="p-6 text-red-600">❌ Access denied. Store/Manager only.</p>;
  }

  // ---------- States ----------
  const [date, setDate] = useState<string>("");
  const [customers, setCustomers] = useState<number>(0);

  const [lines, setLines] = useState<Record<string, LineState>>(
    () =>
      Object.fromEntries(
        MENU.map((m) => [m.id, { price: m.price, sold: 0, waste: 0 }])
      ) as Record<string, LineState>
  );

  const [supplies, setSupplies] = useState<Record<SupplyKey, number>>(
    () =>
      Object.fromEntries(SUPPLY_KEYS.map((k) => [k, 0])) as Record<
        SupplyKey,
        number
      >
  );

  // NEW: Payments / Discounts / Returns / Incident
  const [payments, setPayments] = useState<{ cash: number; card: number; mobile: number }>({
    cash: 0,
    card: 0,
    mobile: 0,
  });
  const [discounts, setDiscounts] = useState<number>(0);
  const [returns, setReturns] = useState<number>(0);
  const [incident, setIncident] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ---------- Derived totals ----------
  const perItemMoney = useMemo(() => {
    return MENU.map((m) => {
      const st = lines[m.id];
      const sales = st.sold * st.price;
      const waste = st.waste * st.price;
      const diff = sales - waste;
      return { id: m.id, sales, waste, diff };
    });
  }, [lines]);

  const totals = useMemo(() => {
    const sales = perItemMoney.reduce((acc, it) => acc + it.sales, 0);
    const waste = perItemMoney.reduce((acc, it) => acc + it.waste, 0);
    const difference = sales - waste;
    const avgSpend = customers > 0 ? sales / customers : 0;
    return { sales, waste, difference, avgSpend };
  }, [perItemMoney, customers]);

  const paymentsTotal = useMemo(
    () => (payments.cash || 0) + (payments.card || 0) + (payments.mobile || 0),
    [payments]
  );

  const netSales = useMemo(() => totals.sales - (discounts || 0) - (returns || 0), [totals.sales, discounts, returns]);

  const paymentsMismatch = Math.abs(paymentsTotal - netSales) > 0.01; // tolerance 1 cent

  const formatEuro = (v: number) =>
    `€${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ---------- Handlers ----------
  const changeLine = (id: string, field: keyof LineState, value: number) => {
    setLines((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: Number.isFinite(value) ? value : 0 },
    }));
  };

  const changeSupply = (key: SupplyKey, value: number) => {
    setSupplies((prev) => ({ ...prev, [key]: Number.isFinite(value) ? value : 0 }));
  };

  const changePayment = (key: keyof typeof payments, value: number) => {
    setPayments((p) => ({ ...p, [key]: Number.isFinite(value) ? value : 0 }));
  };

  const validate = () => {
    if (!date) {
      alert("Please select a date.");
      return false;
    }
    if (!profile.store) {
      alert("Your account has no store assigned.");
      return false;
    }
    return true;
  };

  const openConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const submit = async () => {
    setLoading(true);
    try {
      // Serialize line items
      const itemsPayload = MENU.map((m) => {
        const st = lines[m.id];
        const sales = st.sold * st.price;
        const waste = st.waste * st.price;
        return {
          id: m.id,
          category: m.category,
          name: m.name,
          price: Number(st.price.toFixed(2)),
          sold: st.sold,
          wasteQty: st.waste,
          salesValue: Number(sales.toFixed(2)),
          wasteValue: Number(waste.toFixed(2)),
          difference: Number((sales - waste).toFixed(2)),
        };
      });

      await addDoc(collection(db, "reports"), {
        // Header
        date,
        store: profile.store,
        region: profile.region ?? "Unknown",
        createdBy: profile.uid,
        createdAt: new Date().toISOString(),

        // Totals
        sales: Number(totals.sales.toFixed(2)),
        waste: Number(totals.waste.toFixed(2)),
        difference: Number(totals.difference.toFixed(2)),

        customers,
        avgSpend: Number(totals.avgSpend.toFixed(2)),

        // Payments / Discounts / Returns
        payments: {
          cash: Number((payments.cash || 0).toFixed(2)),
          card: Number((payments.card || 0).toFixed(2)),
          mobile: Number((payments.mobile || 0).toFixed(2)),
          total: Number(paymentsTotal.toFixed(2)),
        },
        discounts: Number((discounts || 0).toFixed(2)),
        returns: Number((returns || 0).toFixed(2)),
        netSales: Number(netSales.toFixed(2)),

        // Extras
        incident: incident.trim(),

        // Details
        items: itemsPayload,
        supplies,

        // For analytics grouping
        category: "Daily",
        paymentsMismatch: paymentsMismatch,
      });

      setConfirmOpen(false);
      alert("✅ Report submitted!");

      // reset
      setDate("");
      setCustomers(0);
      setLines(
        Object.fromEntries(
          MENU.map((m) => [m.id, { price: m.price, sold: 0, waste: 0 }])
        ) as Record<string, LineState>
      );
      setSupplies(
        Object.fromEntries(SUPPLY_KEYS.map((k) => [k, 0])) as Record<
          SupplyKey,
          number
        >
      );
      setPayments({ cash: 0, card: 0, mobile: 0 });
      setDiscounts(0);
      setReturns(0);
      setIncident("");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold mb-3">{children}</h2>
  );

  const CategoryBlock = ({
    title,
    items,
  }: {
    title: MenuItem["category"];
    items: MenuItem[];
  }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm">
              <th className="px-3 py-2 text-left w-48">Item</th>
              <th className="px-3 py-2 text-right w-28">Price (€)</th>
              <th className="px-3 py-2 text-right w-28">Sold</th>
              <th className="px-3 py-2 text-right w-28">Waste</th>
              <th className="px-3 py-2 text-right w-32">Sales (€)</th>
              <th className="px-3 py-2 text-right w-32">Waste (€)</th>
              <th className="px-3 py-2 text-right w-32">Diff (€)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => {
              const st = lines[m.id];
              const sales = st.sold * st.price;
              const waste = st.waste * st.price;
              const diff = sales - waste;
              return (
                <tr key={m.id} className="border-b">
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      step="0.1"
                      value={st.price}
                      onChange={(e) => changeLine(m.id, "price", Number(e.target.value))}
                      className="w-24 text-right border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      value={st.sold}
                      onChange={(e) => changeLine(m.id, "sold", Number(e.target.value))}
                      className="w-24 text-right border rounded px-2 py-1"
                      min={0}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      value={st.waste}
                      onChange={(e) => changeLine(m.id, "waste", Number(e.target.value))}
                      className="w-24 text-right border rounded px-2 py-1"
                      min={0}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">{formatEuro(sales)}</td>
                  <td className="px-3 py-2 text-right">{formatEuro(waste)}</td>
                  <td
                    className={`px-3 py-2 text-right font-semibold ${
                      diff < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {formatEuro(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const grouped = useMemo(() => {
    return {
      coffee: MENU.filter((m) => m.category === "Coffee Drinks"),
      others: MENU.filter((m) => m.category === "Other Drinks"),
      cakes: MENU.filter((m) => m.category === "Cakes"),
      sandwiches: MENU.filter((m) => m.category === "Sandwiches"),
    };
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Daily Store Report (Entry)</h1>

      {/* Header inputs */}
      <form onSubmit={openConfirm} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium mb-1">Store</label>
            <input
              value={profile.store ?? ""}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium mb-1">Customers</label>
            <input
              type="number"
              value={customers}
              onChange={(e) => setCustomers(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Number of customers"
              min={0}
            />
          </div>
        </div>

        {/* Menu tables */}
        <SectionTitle>Menu (Excel-like entry)</SectionTitle>
        <div className="space-y-4">
          <CategoryBlock title="Coffee Drinks" items={grouped.coffee} />
          <CategoryBlock title="Other Drinks" items={grouped.others} />
          <CategoryBlock title="Cakes" items={grouped.cakes} />
          <CategoryBlock title="Sandwiches" items={grouped.sandwiches} />
        </div>

        {/* Totals */}
        <SectionTitle>Totals</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-gray-500 text-sm">Total Sales</div>
            <div className="text-xl font-bold">{formatEuro(totals.sales)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-gray-500 text-sm">Total Waste</div>
            <div className="text-xl font-bold">{formatEuro(totals.waste)}</div>
          </div>
          <div
            className={`bg-white p-4 rounded-lg shadow text-center ${
              totals.difference < 0 ? "text-red-600" : "text-green-700"
            }`}
          >
            <div className="text-gray-500 text-sm">Difference</div>
            <div className="text-xl font-bold">{formatEuro(totals.difference)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-gray-500 text-sm">Avg Spend / Customer</div>
            <div className="text-xl font-bold">
              {customers > 0 ? formatEuro(totals.avgSpend) : "—"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-gray-500 text-sm">Net Sales</div>
            <div className="text-xl font-bold">{formatEuro(netSales)}</div>
          </div>
        </div>

        {/* Payments / Discounts / Returns */}
        <SectionTitle>Payments & Adjustments</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Cash (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={payments.cash}
                  onChange={(e) => changePayment("cash", Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-right"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Card (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={payments.card}
                  onChange={(e) => changePayment("card", Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-right"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mobile (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={payments.mobile}
                  onChange={(e) => changePayment("mobile", Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-right"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Payments Total</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100 text-right">
                  {formatEuro(paymentsTotal)}
                </div>
              </div>
            </div>

            {paymentsMismatch && (
              <div className="mt-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2">
                ⚠️ Payments total does not match Net Sales ({formatEuro(netSales)}). Please double-check.
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Discounts (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={discounts}
                  onChange={(e) => setDiscounts(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-right"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Returns (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={returns}
                  onChange={(e) => setReturns(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-right"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">Incident Report (optional)</label>
                <textarea
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Machine breakdown, customer complaint, stockout, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supplies order */}
        <SectionTitle>Supplies Order (optional)</SectionTitle>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPLY_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm">{key}</label>
                <input
                  type="number"
                  min={0}
                  value={supplies[key]}
                  onChange={(e) => changeSupply(key, Number(e.target.value))}
                  className="w-28 text-right border rounded px-3 py-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            Review & Submit
          </button>
        </div>
      </form>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Confirm Submission</h3>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Header summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><span className="text-sm text-gray-500">Date</span><div className="font-semibold">{date}</div></div>
                <div><span className="text-sm text-gray-500">Store</span><div className="font-semibold">{profile.store}</div></div>
                <div><span className="text-sm text-gray-500">Customers</span><div className="font-semibold">{customers}</div></div>
                <div><span className="text-sm text-gray-500">Avg Spend</span><div className="font-semibold">{customers>0?formatEuro(totals.avgSpend):"—"}</div></div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><div className="text-sm text-gray-500">Sales</div><div className="font-semibold">{formatEuro(totals.sales)}</div></div>
                <div><div className="text-sm text-gray-500">Waste</div><div className="font-semibold">{formatEuro(totals.waste)}</div></div>
                <div>
                  <div className="text-sm text-gray-500">Difference</div>
                  <div className={`font-semibold ${totals.difference < 0 ? "text-red-600" : "text-green-700"}`}>
                    {formatEuro(totals.difference)}
                  </div>
                </div>
                <div><div className="text-sm text-gray-500">Net Sales</div><div className="font-semibold">{formatEuro(netSales)}</div></div>
              </div>

              {/* Payments */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><div className="text-sm text-gray-500">Cash</div><div className="font-semibold">{formatEuro(payments.cash || 0)}</div></div>
                <div><div className="text-sm text-gray-500">Card</div><div className="font-semibold">{formatEuro(payments.card || 0)}</div></div>
                <div><div className="text-sm text-gray-500">Mobile</div><div className="font-semibold">{formatEuro(payments.mobile || 0)}</div></div>
                <div>
                  <div className="text-sm text-gray-500">Payments Total</div>
                  <div className={`font-semibold ${paymentsMismatch ? "text-yellow-700" : ""}`}>
                    {formatEuro(paymentsTotal)}
                  </div>
                </div>
              </div>

              {/* Discounts / Returns / Incident */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><div className="text-sm text-gray-500">Discounts</div><div className="font-semibold">{formatEuro(discounts || 0)}</div></div>
                <div><div className="text-sm text-gray-500">Returns</div><div className="font-semibold">{formatEuro(returns || 0)}</div></div>
                <div><div className="text-sm text-gray-500">Incident</div><div className="font-semibold break-words">{incident || "—"}</div></div>
              </div>

              {/* Items table */}
              <div className="border rounded">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-2 py-1 text-left">Category</th>
                      <th className="px-2 py-1 text-left">Item</th>
                      <th className="px-2 py-1 text-right">Price</th>
                      <th className="px-2 py-1 text-right">Sold</th>
                      <th className="px-2 py-1 text-right">Waste</th>
                      <th className="px-2 py-1 text-right">Sales</th>
                      <th className="px-2 py-1 text-right">Waste (€)</th>
                      <th className="px-2 py-1 text-right">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MENU.map((m) => {
                      const st = lines[m.id];
                      const sales = st.sold * st.price;
                      const waste = st.waste * st.price;
                      const diff = sales - waste;
                      return (
                        <tr key={m.id} className="border-b">
                          <td className="px-2 py-1">{m.category}</td>
                          <td className="px-2 py-1">{m.name}</td>
                          <td className="px-2 py-1 text-right">{formatEuro(st.price)}</td>
                          <td className="px-2 py-1 text-right">{st.sold}</td>
                          <td className="px-2 py-1 text-right">{st.waste}</td>
                          <td className="px-2 py-1 text-right">{formatEuro(sales)}</td>
                          <td className="px-2 py-1 text-right">{formatEuro(waste)}</td>
                          <td className={`px-2 py-1 text-right ${diff<0?"text-red-600":"text-green-700"}`}>
                            {formatEuro(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Supplies */}
              <div>
                <h4 className="font-semibold mb-2">Supplies Order</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SUPPLY_KEYS.map((k) => (
                    <div key={k} className="flex justify-between text-sm border rounded px-2 py-1">
                      <span>{k}</span>
                      <span className="font-semibold">{supplies[k]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {paymentsMismatch && (
                <div className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2">
                  ⚠️ Payments total does not match Net Sales ({formatEuro(netSales)}).
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                onClick={submit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
