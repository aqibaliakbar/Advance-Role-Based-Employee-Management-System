// src/store/features/employeeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminSupabase, supabase } from "../../lib/supabaseClient";
import { deleteImage, uploadImage, getSignedUrl } from "@/lib/utils";

// Fetch employees with signed URLs for images
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          id,
          full_name,
          email,
          phone,
          address,
          role,
          branch_id,
          salary,
          cnic_number,
          cnic_front_url,
          cnic_back_url,
          created_at,
          branch:branches!branch_id(
            id,
            name,
            location
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get signed URLs for all images
      const employeesWithSignedUrls = await Promise.all(
        data.map(async (employee) => {
          try {
            const [frontUrl, backUrl] = await Promise.all([
              employee.cnic_front_url
                ? getSignedUrl(employee.cnic_front_url)
                : null,
              employee.cnic_back_url
                ? getSignedUrl(employee.cnic_back_url)
                : null,
            ]);

            return {
              ...employee,
              cnic_front_url: frontUrl,
              cnic_back_url: backUrl,
            };
          } catch (error) {
            console.error(
              "Error getting signed URLs for employee:",
              employee.id,
              error
            );
            return employee;
          }
        })
      );

      return employeesWithSignedUrls;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async ({ formData, cnicImages }, { rejectWithValue }) => {
    try {
      // Generate temporary password
      const tempPassword =
        Math.random().toString(36).slice(-8) +
        "!" +
        Math.floor(Math.random() * 10) +
        "A";

      // Create auth user
      const { data: authData, error: authError } =
        await adminSupabase.auth.admin.createUser({
          email: formData.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            role: formData.role,
          },
        });

      if (authError) throw authError;

      try {
        // Upload CNIC images
        const [frontUrl, backUrl] = await Promise.all([
          uploadImage(cnicImages.front, authData.user.id, "front"),
          uploadImage(cnicImages.back, authData.user.id, "back"),
        ]);

        // Create employee record
        const { data: newEmployee, error: employeeError } = await supabase
          .from("employees")
          .insert([
            {
              id: authData.user.id,
              ...formData,
              cnic_front_url: frontUrl,
              cnic_back_url: backUrl,
            },
          ])
          .select(
            `
            *,
            branch:branches!branch_id(
              id,
              name,
              location
            )
          `
          )
          .single();

        if (employeeError) throw employeeError;

        return {
          ...newEmployee,
          temporaryPassword: tempPassword,
        };
      } catch (error) {
        // Clean up on error
        await adminSupabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, formData, cnicImages }, { rejectWithValue }) => {
    try {
      let updateData = { ...formData };

      // Handle CNIC images
      if (cnicImages?.front) {
        const frontUrl = await uploadImage(cnicImages.front, id, "front");
        if (frontUrl) {
          if (formData.cnic_front_url) {
            await deleteImage(formData.cnic_front_url);
          }
          updateData.cnic_front_url = frontUrl;
        }
      }

      if (cnicImages?.back) {
        const backUrl = await uploadImage(cnicImages.back, id, "back");
        if (backUrl) {
          if (formData.cnic_back_url) {
            await deleteImage(formData.cnic_back_url);
          }
          updateData.cnic_back_url = backUrl;
        }
      }

      // Update employee record
      const { data, error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          branch:branches!branch_id(
            id,
            name,
            location
          )
        `
        )
        .single();

      if (error) throw error;

      // Get signed URLs for updated images
      const [frontUrl, backUrl] = await Promise.all([
        data.cnic_front_url ? getSignedUrl(data.cnic_front_url) : null,
        data.cnic_back_url ? getSignedUrl(data.cnic_back_url) : null,
      ]);

      return {
        ...data,
        cnic_front_url: frontUrl,
        cnic_back_url: backUrl,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      // Get employee data first to get image URLs
      const { data: employee, error: fetchError } = await supabase
        .from("employees")
        .select("cnic_front_url, cnic_back_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete images first
      if (employee) {
        await Promise.all([
          deleteImage(employee.cnic_front_url),
          deleteImage(employee.cnic_back_url),
        ]);
      }

      // Delete employee record
      const { error: deleteError } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Delete auth user
      await adminSupabase.auth.admin.deleteUser(id);

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearEmployees: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (emp) => emp.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter((emp) => emp.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;
