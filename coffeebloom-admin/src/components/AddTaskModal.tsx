// src/components/AddTaskModal.tsx
import { useState } from "react";
import type { Task } from "../types/task";

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
};

const STORES = [
  { name: "All Stores", color: "bg-gray-100 border-gray-400" },
  { name: "Berlin Mitte", color: "bg-blue-100 border-blue-400" },
  { name: "Berlin Kreuzberg", color: "bg-green-100 border-green-400" },
  { name: "Berlin Neukölln", color: "bg-yellow-100 border-yellow-400" },
  { name: "Berlin Charlottenburg", color: "bg-purple-100 border-purple-400" },
  { name: "Berlin Prenzlauer Berg", color: "bg-pink-100 border-pink-400" },
];

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [store, setStore] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dateMode, setDateMode] = useState<"single" | "range">("single");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!title.trim()) return;
    onSubmit({
      id: Date.now().toString(),
      title,
      description,
      store,
      assignee,
      dueDate: dateMode === "single" ? dueDate : undefined,
      startDate: dateMode === "range" ? startDate : undefined,
      endDate: dateMode === "range" ? endDate : undefined,
      priority,
      column: "todo", // ✅ Always start in To Do
    });
    onClose();

    // Reset form fields
    setTitle("");
    setDescription("");
    setStore("");
    setAssignee("");
    setDueDate("");
    setStartDate("");
    setEndDate("");
    setPriority("medium");
    setDateMode("single");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">+ Add New Task</h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* Store */}
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select Store</option>
          {STORES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Assignee */}
        <input
          type="text"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {/* Date Mode */}
        <div className="flex space-x-4 text-sm">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={dateMode === "single"}
              onChange={() => setDateMode("single")}
            />
            <span>Single Date</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={dateMode === "range"}
              onChange={() => setDateMode("range")}
            />
            <span>Date Range</span>
          </label>
        </div>

        {/* Dates */}
        {dateMode === "single" ? (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        ) : (
          <div className="flex space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 border rounded-lg px-3 py-2"
            />
          </div>
        )}

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
