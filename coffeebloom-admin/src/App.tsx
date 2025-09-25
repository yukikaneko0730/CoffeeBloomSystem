// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import StoreReportsPage from "./pages/StoreReportsPage";
import MyReportsPage from "./pages/MyReportsPage";
import UsersPage from "./pages/UsersPage";
import ShiftsPage from "./pages/ShiftsPage";
import EmployeesPage from "./pages/EmployeesPage"; // 👈 new
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- Public Routes ---------------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ---------------- Protected Routes ---------------- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* 📅 Shifts (honbu / store / manager / employee) */}
          <Route
            path="shifts"
            element={
              <ProtectedRoute
                allowedRoles={["honbu", "store-admin", "manager", "employee"]}
              >
                <ShiftsPage />
              </ProtectedRoute>
            }
          />

          {/* 👥 Employees (honbu / store-admin / manager) */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={["honbu", "store-admin", "manager"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />

          {/* HQ only: Reports & User Management */}
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["honbu"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["honbu"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Store/Manager: Report Input & My Reports */}
          <Route
            path="store-reports"
            element={
              <ProtectedRoute allowedRoles={["store", "manager"]}>
                <StoreReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-reports"
            element={
              <ProtectedRoute allowedRoles={["store", "manager"]}>
                <MyReportsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
