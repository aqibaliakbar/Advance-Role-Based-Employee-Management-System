// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (employeeError) throw employeeError;

      return {
        ...data.user,
        ...employeeData,
        accessToken: data.session.access_token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentSession = createAsyncThunk(
  "auth/getCurrentSession",
  async (_, { rejectWithValue }) => {
    try {
      console.log("ssssssss")
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("kkkkkkkkkk", session)
      if (error) throw error;

      if (session) {
        // Fetch complete employee data instead of just the role
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("*") // Select all fields
          .eq("id", session.user.id)
          .single();

        if (employeeError) throw employeeError;

        return {
          ...session.user,
          ...employeeData, // Spread all employee data
          accessToken: session.access_token,
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Get Current Session
      .addCase(getCurrentSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(getCurrentSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
