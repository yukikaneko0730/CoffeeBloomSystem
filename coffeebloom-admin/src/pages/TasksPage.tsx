// src/pages/TasksPage.tsx
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskDetailModal from "../components/TaskDetailModal";
import AddTaskModal from "../components/AddTaskModal";
import type { Task } from "../types/task";
import {
  listenTasks,
  addTaskToFirestore,
  deleteTaskFromFirestore,
  updateTaskColumn,
} from "../lib/tasks";

// Store → color mapping
const STORE_COLORS: Record<string, string> = {
  "All Stores": "bg-gray-100 border-gray-300",
  "Berlin Mitte": "bg-blue-50 border-blue-300",
  "Berlin Kreuzberg": "bg-green-50 border-green-300",
  "Berlin Neukölln": "bg-yellow-50 border-yellow-300",
  "Berlin Charlottenburg": "bg-purple-50 border-purple-300",
  "Berlin Prenzlauer Berg": "bg-pink-50 border-pink-300",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // ✅ Listen Firestore tasks in realtime
  useEffect(() => {
    const unsub = listenTasks((data) => setTasks(data));
    return () => unsub();
  }, []);

  // ✅ Group tasks by column (型を明示する)
  const columns: Record<"todo" | "doing" | "done", Task[]> = {
    todo: tasks.filter((t) => t.column === "todo"),
    doing: tasks.filter((t) => t.column === "doing"),
    done: tasks.filter((t) => t.column === "done"),
  };

  // ✅ Drag & Drop → update Firestore
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      await updateTaskColumn(draggableId, destination.droppableId);
    }
  };

  // ✅ Add task
  const addTask = async (task: Task) => {
    await addTaskToFirestore({ ...task, column: "todo" });
  };

  // ✅ Delete task
  const deleteTask = async (taskId: string) => {
    await deleteTaskFromFirestore(taskId);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">✅ Task Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-3 gap-6">
          {(["todo", "doing", "done"] as const).map((colKey) => (
            <Droppable droppableId={colKey} key={colKey}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border p-4 shadow-sm min-h-[400px] flex flex-col transition ${
                    colKey === "todo"
                      ? "bg-blue-50 border-blue-200"
                      : colKey === "doing"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  {/* Column Header */}
                  <h3 className="font-semibold mb-3 flex justify-between items-center text-gray-800">
                    <span className="flex items-center gap-2">
                      {colKey === "todo"
                        ? "📝 To Do"
                        : colKey === "doing"
                        ? "⏳ In Progress"
                        : "✅ Done"}
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {columns[colKey].length}
                      </span>
                    </span>

                    {colKey === "todo" && (
                      <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => setAddModalOpen(true)}
                      >
                        + Add Task
                      </button>
                    )}
                  </h3>

                  {/* Task List */}
                  <div className="flex-1 space-y-3">
                    {columns[colKey].map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative rounded-lg px-3 py-3 cursor-pointer border shadow-sm hover:shadow-md transition ${
                              STORE_COLORS[task.store ?? "All Stores"] || "bg-white border-gray-200"
                            }`}
                            onClick={() => setSelectedTask(task)}
                          >
                            {/* Priority badge */}
                            <span
                              className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white shadow-sm ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                  ? "bg-yellow-400 text-black"
                                  : "bg-green-500"
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* Task content */}
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {task.store || "No Store"} · {task.assignee || "Unassigned"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {task.dueDate
                                ? `Due: ${task.dueDate}`
                                : task.startDate && task.endDate
                                ? `From ${task.startDate} to ${task.endDate}`
                                : "No due date"}
                            </p>

                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Task Detail */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />

      {/* Add Task */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={addTask}
      />
    </>
  );
}
