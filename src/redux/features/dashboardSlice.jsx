// src/store/features/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Fetch employees with their branch info
      const { data: employees, error: employeesError } = await supabase.from(
        "employees"
      ).select(`
          *,
          branches (
            id,
            name
          )
        `);

      if (employeesError) throw employeesError;

      // Fetch branches
      const { data: branches, error: branchesError } = await supabase
        .from("branches")
        .select("*");

      if (branchesError) throw branchesError;

      // Calculate statistics
      const totalEmployees = employees.length;
      const totalBranches = branches.length;

      // Calculate average salary
      const totalSalary = employees.reduce(
        (sum, emp) => sum + (Number(emp.salary) || 0),
        0
      );
      const averageSalary = totalEmployees ? totalSalary / totalEmployees : 0;

      // Calculate role distribution
      const roleCount = employees.reduce((acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1;
        return acc;
      }, {});

      const roleDistribution = Object.entries(roleCount).map(
        ([role, value]) => ({
          role,
          value,
        })
      );

      // Calculate salary by branch
      const salaryByBranch = branches.map((branch) => {
        const branchEmployees = employees.filter(
          (emp) => emp.branch_id === branch.id
        );
        const branchTotalSalary = branchEmployees.reduce(
          (sum, emp) => sum + (Number(emp.salary) || 0),
          0
        );
        return {
          branchName: branch.name,
          averageSalary: branchEmployees.length
            ? branchTotalSalary / branchEmployees.length
            : 0,
          employeeCount: branchEmployees.length,
        };
      });

      // Calculate monthly growth (example metric)
      const monthlyGrowth = (
        ((totalEmployees -
          employees.filter((emp) => {
            const createDate = new Date(emp.created_at);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return createDate < lastMonth;
          }).length) /
          totalEmployees) *
        100
      ).toFixed(1);

      return {
        totalEmployees,
        totalBranches,
        averageSalary,
        monthlyGrowth,
        roleDistribution,
        salaryByBranch,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalEmployees: 0,
      totalBranches: 0,
      averageSalary: 0,
      monthlyGrowth: 0,
      roleDistribution: [],
      salaryByBranch: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
