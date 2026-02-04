import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import TaskList from "../pages/tasks/TaskList";
import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import AdminPanel from "../pages/admin/AdminPanel";
// import Unauthorized from "../pages/Unauthorized";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

    {/* PROTECTED WITH LAYOUT */}
    <Route
      path="/"
      element={
        <ProtectedRoute allowedRoles={["admin", "user"]}>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/tasks"
      element={
        <ProtectedRoute allowedRoles={["admin", "user"]}>
          <MainLayout>
            <TaskList />
          </MainLayout>
        </ProtectedRoute>
      }
    />


<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout>
        <AdminPanel />
      </MainLayout>
    </ProtectedRoute>
  }
/>

  </Routes>
);

export default AppRoutes;
