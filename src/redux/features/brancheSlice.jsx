// src/store/slices/branchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export const fetchBranches = createAsyncThunk(
  "branches/fetchBranches",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // First fetch branches
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("*");

      if (branchError) throw branchError;

      // Then fetch employee counts for each branch
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("branch_id");

      if (empError) throw empError;

      // Calculate employee count for each branch
      const branchesWithCount = branches.map((branch) => {
        const count = employees.filter(
          (emp) => emp.branch_id === branch.id
        ).length;
        return {
          ...branch,
          employeeCount: count,
        };
      });

      return branchesWithCount;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addBranch = createAsyncThunk(
  "branches/addBranch",
  async (branch, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { data, error } = await supabase
        .from("branches")
        .insert([branch])
        .select()
        .single();

      if (error) throw error;
      return { ...data, employeeCount: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBranch = createAsyncThunk(
  "branches/updateBranch",
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Update branch
      const { data, error } = await supabase
        .from("branches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Get employee count
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("branch_id", id);

      if (empError) throw empError;

      return {
        ...data,
        employeeCount: employees?.length || 0,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBranch = createAsyncThunk(
  "branches/deleteBranch",
  async (id, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Check if branch has employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("branch_id", id);

      if (empError) throw empError;

      if (employees?.length > 0) {
        throw new Error("Cannot delete branch with active employees");
      }

      const { error } = await supabase.from("branches").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const branchSlice = createSlice({
  name: "branches",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBranches: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (branch) => branch.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (branch) => branch.id !== action.payload
        );
      });
  },
});

export const { clearBranches } = branchSlice.actions;
export default branchSlice.reducer;
