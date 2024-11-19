// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/features/authSlice";
import employeeReducer from "../redux/features/employeeSlice";
import branchReducer from "../redux/features/brancheSlice";
import dashboardReducer from "../redux/features/dashboardSlice";
import profileReducer from "../redux/features/profileSlice";
import { authMiddleware } from "@/lib/authMiddleware";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    branches: branchReducer,
    dashboard: dashboardReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setUser",
          "employees/updateEmployee/pending",
          "employees/addEmployee/pending",
        ],
        ignoredActionPaths: [
          "payload.created_at",
          "payload.last_sign_in_at",
          "meta.arg.cnicImages",
          "payload.cnicImages",
        ],
        ignoredPaths: [
          "auth.user.created_at",
          "auth.user.last_sign_in_at",
          "employees.cnicImages",
        ],
      },
    }).concat(authMiddleware),
});

export default store;
