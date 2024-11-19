// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import { setUser, clearUser } from "../redux/features/authSlice";

export const useAuth = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (session) => {
      try {
        const { data: employeeData, error } = await supabase
          .from("employees")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (mounted && employeeData) {
          dispatch(
            setUser({
              ...session.user,
              ...employeeData,
              accessToken: session.access_token,
            })
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (mounted) {
          dispatch(clearUser());
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await fetchUserData(session);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await fetchUserData(session);
      } else if (event === "SIGNED_OUT") {
        dispatch(clearUser());
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return { user, loading };
};
