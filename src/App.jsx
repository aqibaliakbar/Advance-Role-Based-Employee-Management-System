// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employee";
import Branches from "./pages/Branches";
import Profile from "./pages/Profile";
// import Schedule from "./pages/Schedule";
// import Tasks from "./pages/Tasks";
// import Reports from "./pages/Reports";
// import Settings from "./pages/Settings";
import AuthCallback from "./components/AuthCallback";
import { useAuth } from "./hooks/useAuth";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin & Manager Routes */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Employees />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Branches />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        /> */}

        {/* Manager Only Routes */}
        {/* <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        /> */}

        {/* Employee & Manager Routes */}
        {/* <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["employee", "manager"]}>
              <Schedule />
            </ProtectedRoute>
          }
        /> */}

        {/* Employee Only Routes */}
        {/* <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Tasks />
            </ProtectedRoute>
          }
        /> */}

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
   
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>

  );
};

export default App;
