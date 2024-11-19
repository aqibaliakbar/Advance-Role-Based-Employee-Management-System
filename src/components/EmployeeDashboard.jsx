// src/pages/dashboards/EmployeeDashboard.jsx
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

const EmployeeDashboard = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      {/* Employee Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="text-lg">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <Badge>{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule/Calendar Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
