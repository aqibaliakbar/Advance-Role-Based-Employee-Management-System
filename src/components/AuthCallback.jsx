// src/components/AuthCallback.jsx
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token and type from URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        // If this is a password reset or invite
        if (type === "recovery" || type === "invite") {
          // Exchange token for session
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === "invite" ? "magiclink" : "recovery",
          });

          if (verifyError) throw verifyError;

          // Redirect to reset password
          navigate("/reset-password");
          return;
        }

        // For regular sign-in
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          title: "Error",
          description: "Failed to process authentication. Please try again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default AuthCallback;
