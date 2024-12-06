import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../lib/supabaseClient";
import {
  getCurrentSession,
  setUser,
  clearUser,
} from "@/redux/features/authSlice";

/**
 * Custom hook to handle authentication state management with Supabase and Redux.
 * Manages the authentication lifecycle including initialization, session changes,
 * and cleanup of subscriptions.
 *
 * @returns {Object} Authentication state containing user and loading status
 */
export const useAuth = () => {
  // Select user and loading state from Redux store
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();
  

  useEffect(() => {
    // Flag to prevent state updates after component unmount
    let mounted = true;

    // Initialize authentication state on component mount
    const initializeAuth = async () => {
      try {
        // Only update state if component is still mounted
        if (mounted) {
          await dispatch(getCurrentSession());
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        // You could dispatch an error action here if needed
      }
    };

    initializeAuth();

    

    // Set up authentication state change listener
   const { data: authListener } = supabase.auth.onAuthStateChange(
     async (event, session) => {
       if (!mounted) return;
       try {
         if (event === "SIGNED_IN" && session) {
           // Fetch employee data on session change
           const { data: employeeData, error: employeeError } = await supabase
             .from("employees")
             .select("*")
             .eq("id", session.user.id)
             .single();

           if (employeeError) throw employeeError;

           dispatch(
             setUser({
               ...session.user,
               ...employeeData,
               accessToken: session.access_token,
               user_metadata: session.user.user_metadata,
             })
           );
         } else if (event === "SIGNED_OUT") {
           dispatch(clearUser());
         }
       } catch (error) {
         console.error("Error handling auth state change:", error);
       }
     }
   );
    // Cleanup function to prevent memory leaks and invalid state updates
    return () => {
      mounted = false;
      // Unsubscribe from auth listener when component unmounts
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, [dispatch]); // Only re-run effect if dispatch changes

  return { user, loading };
};
