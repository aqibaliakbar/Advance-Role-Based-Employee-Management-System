import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, DollarSign, TrendingUp } from "lucide-react";
import { fetchDashboardStats } from "@/redux/features/dashboardSlice";

const StatCard = ({ title, value, icon: Icon, loading }) => (
  <Card className="hover:shadow-lg transition-shadow duration-200 bg-white">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-sm text-muted-foreground font-medium">{title}</h3>
          <div className="text-2xl font-bold">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
            ) : (
              value
            )}
          </div>
        </div>
        <div className="p-2 bg-gray-100 rounded-full">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RoleDistributionSection = ({ roles, loading }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <h2 className="text-lg font-semibold mb-4">Employee Role Distribution</h2>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.role} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground capitalize">
                  {role.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(
                    (role.value / roles.reduce((acc, r) => acc + r.value, 0)) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
              <div className="text-xl font-bold">{role.value}</div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SalaryDistributionSection = ({ branches, loading }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        Salary Distribution by Branch
      </h2>
      <div className="space-y-4">
        {branches.map((branch) => (
          <div
            key={branch.branchName}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium">{branch.branchName}</h3>
              <p className="text-sm text-muted-foreground">
                {branch.employeeCount} employees
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Salary</p>
              <p className="text-lg font-semibold">
                $
                {branch.averageSalary.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, user]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Branches"
          value={stats.totalBranches}
          icon={Building2}
          loading={loading}
        />
        <StatCard
          title="Average Salary"
          value={
            stats.averageSalary
              ? `$${stats.averageSalary.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "$0.00"
          }
          icon={DollarSign}
          loading={loading}
        />
        <StatCard
          title="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <RoleDistributionSection
          roles={stats.roleDistribution}
          loading={loading}
        />

        {/* Right Column */}
        <SalaryDistributionSection
          branches={stats.salaryByBranch}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
