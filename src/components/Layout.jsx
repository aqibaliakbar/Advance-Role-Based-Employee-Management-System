// src/components/Layout.jsx
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  User,
  Calendar,
  ClipboardList,
  Settings,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { clearUser } from "../redux/features/authSlice";
import { useToast } from "@/hooks/use-toast";

const Layout = () => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get navigation items based on user role
  const getNavigation = (role) => {
    const baseNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Profile", href: "/profile", icon: User },
    ];

    switch (role) {
      case "admin":
        return [
          ...baseNavigation,
          { name: "Employees", href: "/employees", icon: Users },
          { name: "Branches", href: "/branches", icon: Building2 },
          // { name: "Settings", href: "/settings", icon: Settings },
        ];
      case "manager":
        return [
          ...baseNavigation,
          { name: "Employees", href: "/employees", icon: Users },
          { name: "Schedule", href: "/schedule", icon: Calendar },
          { name: "Reports", href: "/reports", icon: ClipboardList },
        ];
      case "employee":
        return [
          ...baseNavigation,
          { name: "Schedule", href: "/schedule", icon: Calendar },
          { name: "Tasks", href: "/tasks", icon: ClipboardList },
        ];
      default:
        return baseNavigation;
    }
  };

  const navigation = getNavigation(role);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear Redux store
      dispatch(clearUser());
      dispatch({ type: "employees/clearEmployees" });
      dispatch({ type: "branches/clearBranches" });

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex flex-col h-screen">
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-800">Poultry Farm</h1>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {role} Panel
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg ${
                    location.pathname === item.href
                      ? "bg-gray-50 text-blue-600"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 py-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name || "Dashboard"}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 capitalize">
                    {user?.branch?.name || "No Branch Assigned"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
