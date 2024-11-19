// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "app-storage-key",
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    enabled: true,
  },
});

// Utility function to check if session exists
export const checkSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Utility function to refresh session
export const refreshSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();
  if (error) throw error;
  return session;
};

// Admin client for user management
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);