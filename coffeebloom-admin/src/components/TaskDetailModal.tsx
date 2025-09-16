//src/components/TaskDetailModal.tsx
import { useState } from "react";
import type { Task } from "../types/task";

type TaskDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate?: (task: Task) => void; 
};

const STORES = [
  { name: "Berlin Mitte", color: "bg-blue-100 text-blue-800" },
  { name: "Berlin Kreuzberg", color: "bg-green-100 text-green-800" },
  { name: "Berlin Neukölln", color: "bg-yellow-100 text-yellow-800" },
  { name: "Berlin Charlottenburg", color: "bg-purple-100 text-purple-800" },
  { name: "Berlin Prenzlauer Berg", color: "bg-pink-100 text-pink-800" },
];

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdate,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const [isEditing, setEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

  const storeStyle =
    STORES.find((s) => s.name === editedTask.store)?.color ??
    "bg-gray-100 text-gray-800";

  const handleSave = () => {
    if (onUpdate) onUpdate(editedTask);
    setEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Task" : task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isEditing ? (
          <>
            {/* Editable Fields */}
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Task Title"
            />

            <textarea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Description"
            />

            {/* Store */}
            <select
              value={editedTask.store}
              onChange={(e) =>
                setEditedTask({ ...editedTask, store: e.target.value })
              }
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
              value={editedTask.assignee}
              onChange={(e) =>
                setEditedTask({ ...editedTask, assignee: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Assignee"
            />

            {/* Dates */}
            <div className="space-y-2">
              <input
                type="date"
                value={editedTask.dueDate || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, dueDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={editedTask.startDate || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, startDate: e.target.value })
                  }
                  className="w-1/2 border rounded-lg px-3 py-2"
                />
                <input
                  type="date"
                  value={editedTask.endDate || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, endDate: e.target.value })
                  }
                  className="w-1/2 border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Priority */}
            <select
              value={editedTask.priority}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Store */}
            <span
              className={`inline-block px-2 py-1 text-xs rounded ${storeStyle}`}
            >
              {task.store || "No Store"}
            </span>

            {/* Description */}
            {task.description && (
              <p className="text-gray-700 text-sm">{task.description}</p>
            )}

            {/* Assignee */}
            <p className="text-sm">
              <span className="font-medium">Assignee: </span>
              {task.assignee || "Unassigned"}
            </p>

            {/* Dates */}
            <div className="text-sm text-gray-600">
              {task.dueDate && <p>📅 Due: {task.dueDate}</p>}
              {task.startDate && task.endDate && (
                <p>
                  📅 {task.startDate} → {task.endDate}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Priority: {task.priority}
              </span>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
