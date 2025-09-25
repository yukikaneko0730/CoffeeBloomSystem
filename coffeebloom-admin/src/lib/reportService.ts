// src/lib/reportService.ts
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export type ReportInput = {
  store: string;
  region: string;
  category: string;
  date: string; // YYYY-MM-DD
  sales: number;
  waste: number;
  difference: number;
  topProducts: { name: string; count: number }[];
};

export async function submitReport(report: ReportInput) {
  await addDoc(collection(db, "reports"), report);
}
