// src/pages/ShiftsPage.tsx
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ShiftModal from "../components/ShiftModal";

const localizer = momentLocalizer(moment);

type Shift = {
  id?: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Employee = { id: string; name: string };

const ShiftsPage = () => {
  const { profile, loading } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const storeId = profile?.store ?? null;
  const roles = profile?.roles || [];
  const canEdit =
    roles.includes("honbu") || roles.includes("store-admin") || roles.includes("manager");

  // Listen for shifts
  useEffect(() => {
    if (!storeId) return;
    const ref = collection(db, "stores", storeId, "shifts");
    return onSnapshot(ref, (snap) => {
      setShifts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shift)));
    });
  }, [storeId]);

  // Listen for employees
  useEffect(() => {
    if (!storeId) return;
    const ref = collection(db, "stores", storeId, "employees");
    return onSnapshot(ref, (snap) => {
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee)));
    });
  }, [storeId]);

  const addShift = async (shift: Omit<Shift, "id">) => {
    if (!storeId) return;
    await addDoc(collection(db, "stores", storeId, "shifts"), shift);
  };

  const deleteShift = async (id?: string) => {
    if (!storeId || !id) return;
    await deleteDoc(doc(db, "stores", storeId, "shifts", id));
  };

  // Monthly totals
  const totals = shifts.reduce((acc, s) => {
    const start = moment(`${s.date}T${s.startTime}`);
    const end = moment(`${s.date}T${s.endTime}`);
    const hours = moment.duration(end.diff(start)).asHours();
    acc[s.staffName] = (acc[s.staffName] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div>Loading...</div>;
  if (!storeId) return <div>No store assigned</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Shift Schedule</h1>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ➕ Add Shift
          </button>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={shifts.map((s) => ({
          id: s.id,
          title: `${s.staffName}`,
          start: new Date(`${s.date}T${s.startTime}`),
          end: new Date(`${s.date}T${s.endTime}`),
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable={false}
        onSelectEvent={(event) =>
          canEdit &&
          window.confirm("Delete this shift?") &&
          deleteShift(event.id)
        }
        defaultView={Views.WEEK}
      />

      {/* Monthly Totals */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">Monthly Totals (hours)</h2>
        <ul className="space-y-1">
          {Object.entries(totals).map(([name, hours]) => (
            <li key={name} className="flex justify-between border-b py-1">
              <span>{name}</span>
              <span>{hours.toFixed(1)}h</span>
            </li>
          ))}
        </ul>
      </div>

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
        onSave={addShift}
      />
    </div>
  );
};

export default ShiftsPage;
