// src/pages/Dashboard.jsx
import AdminDashboard from "@/components/AdminDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import { useSelector } from "react-redux";


const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  switch (user?.role) {
    case "employee":
      return <EmployeeDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div>Invalid role</div>;
  }
};

export default Dashboard;
