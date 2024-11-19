// src/lib/authMiddleware.js
import { supabase } from "./supabaseClient";
import { store } from "../redux/store";
import { clearUser } from "../redux/features/authSlice";

// Create auth error middleware for store
export const authMiddleware = () => (next) => (action) => {
  if (
    action.type.endsWith("/rejected") &&
    action.payload?.includes("unauthorized")
  ) {
    store.dispatch(clearUser());
    window.location.href = "/login";
    return;
  }
  return next(action);
};

// Helper function for authenticated operations
export const withAuth =
  (operation) =>
  async (...args) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }
      return await operation(...args);
    } catch (error) {
      if (error.status === 401 || error.message.includes("no active session")) {
        store.dispatch(clearUser());
        window.location.href = "/login";
      }
      throw error;
    }
  };

// Helper function to check user role
export const hasRole = (requiredRole) => {
  const user = store.getState().auth.user;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user?.role);
  }
  return user?.role === requiredRole;
};
