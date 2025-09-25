// src/pages/EmployeesPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

type Employee = {
  id?: string;
  firstName: string;
  lastName: string;
  position: string;   // Branch:Fulltime etc.
  branch: string;     // e.g. Mitte
  salaryType: "hourly" | "monthly";
  salary: number;
};

const POSITIONS = [
  "Branch:Fulltime",
  "Branch:Manager",
  "Branch:Parttime",
  "Branch:Mini-job",
  "Head:Fulltime",
  "Head:Manager",
  "Head:Parttime",
  "Head:Mini-job",
];

const BRANCHES = [
  "Mitte",
  "Kreuzberg",
  "Neukölln",
  "Charlottenburg",
  "Prenzlauer Berg",
  "Head Office",
];

const EmployeesPage = () => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // フォームのstate
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [branch, setBranch] = useState("");
  const [salary, setSalary] = useState("");

  const storeId = profile?.store ?? null;

  // Firestoreから従業員一覧を取得
  useEffect(() => {
    if (!storeId) return;
    const ref = collection(db, "stores", storeId, "employees");
    const unsub = onSnapshot(ref, (snap) => {
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee)));
    });
    return () => unsub();
  }, [storeId]);

  const addEmployee = async () => {
    if (!storeId || !firstName || !lastName || !position || !branch || !salary) return;

    const salaryType =
      position.includes("Parttime") || position.includes("Mini-job")
        ? "hourly"
        : "monthly";

    await addDoc(collection(db, "stores", storeId, "employees"), {
      firstName,
      lastName,
      position,
      branch,
      salaryType,
      salary: Number(salary),
    });

    // reset form
    setFirstName("");
    setLastName("");
    setPosition("");
    setBranch("");
    setSalary("");
  };

  const removeEmployee = async (id?: string) => {
    if (!storeId || !id) return;
    await deleteDoc(doc(db, "stores", storeId, "employees", id));
  };

  if (!storeId) return <div>No store assigned</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employees</h1>

      {/* --- Add Employee Form --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border rounded p-2"
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border rounded p-2 col-span-2"
        >
          <option value="">Select position</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="border rounded p-2 col-span-2"
        >
          <option value="">Select branch</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder={
            position.includes("Parttime") || position.includes("Mini-job")
              ? "Hourly wage (€)"
              : "Monthly salary before tax (€)"
          }
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="border rounded p-2 col-span-2"
        />

        <button
          onClick={addEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-2"
        >
          Add Employee
        </button>
      </div>

      {/* --- Employee List --- */}
      <ul className="space-y-2">
        {employees.map((emp) => (
          <li
            key={emp.id}
            className="flex justify-between border-b pb-2 items-center"
          >
            <span>
              {emp.firstName} {emp.lastName} — {emp.position} @ {emp.branch}{" "}
              <span className="text-sm text-gray-500">
                ({emp.salaryType === "hourly" ? "€" + emp.salary + "/h" : "€" + emp.salary + "/month"})
              </span>
            </span>
            <button
              onClick={() => removeEmployee(emp.id)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeesPage;
