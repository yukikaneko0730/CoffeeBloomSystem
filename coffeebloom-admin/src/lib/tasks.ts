//src/lib/tasks.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { Task } from "../types/task";

const tasksCol = collection(db, "tasks");

// Add
export const addTaskToFirestore = async (task: Task) => {
  await addDoc(tasksCol, task);
};

// Listen (realtime)
export const listenTasks = (callback: (tasks: Task[]) => void) => {
  return onSnapshot(tasksCol, (snapshot) => {
    const tasks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Task[];
    callback(tasks);
  });
};

// Update column
export const updateTaskColumn = async (taskId: string, column: string) => {
  const ref = doc(db, "tasks", taskId);
  await updateDoc(ref, { column });
};

// Delete
export const deleteTaskFromFirestore = async (taskId: string) => {
  const ref = doc(db, "tasks", taskId);
  await deleteDoc(ref);
};
