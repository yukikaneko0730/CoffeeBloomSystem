// src/components/ShiftModal.tsx
import { useState } from "react";
import { Dialog } from "@headlessui/react";

type Employee = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSave: (shift: {
    staffId: string;
    staffName: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
};

const ShiftModal = ({ isOpen, onClose, employees, onSave }: Props) => {
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = () => {
    const staff = employees.find((e) => e.id === staffId);
    if (!staff || !date || !startTime || !endTime) return;
    onSave({
      staffId,
      staffName: staff.name,
      date,
      startTime,
      endTime,
    });
    onClose();
    setStaffId("");
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">Add Shift</Dialog.Title>

          <label className="block mb-2">Employee</label>
          <select
            className="w-full border rounded p-2 mb-4"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <label className="block mb-2">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2 mb-4"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-2">Start</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">End</label>
              <input
                type="time"
                className="w-full border rounded p-2"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShiftModal;
