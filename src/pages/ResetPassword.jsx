// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verify the user has a valid token
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid password reset link",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    verifyToken();
  }, [searchParams, navigate, toast]);

 useEffect(() => {
   const checkSession = async () => {
     const {
       data: { session },
     } = await supabase.auth.getSession();
     if (!session) {
       toast({
         title: "Error",
         description: "Invalid or expired reset link",
         variant: "destructive",
       });
       navigate("/login");
     }
   };

   checkSession();
 }, [navigate, toast]);

 const handleSubmit = async (e) => {
   e.preventDefault();

   if (password !== confirmPassword) {
     toast({
       title: "Error",
       description: "Passwords do not match",
       variant: "destructive",
     });
     return;
   }

   if (password.length < 6) {
     toast({
       title: "Error",
       description: "Password must be at least 6 characters",
       variant: "destructive",
     });
     return;
   }

   try {
     setLoading(true);

     const { error } = await supabase.auth.updateUser({
       password: password,
     });

     if (error) throw error;

     // Sign out after password reset
     await supabase.auth.signOut();

     toast({
       title: "Success",
       description:
         "Password set successfully. Please login with your new password.",
     });

     navigate("/login");
   } catch (error) {
     console.error("Reset password error:", error);
     toast({
       title: "Error",
       description: error.message,
       variant: "destructive",
     });
   } finally {
     setLoading(false);
   }
 };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>
            Please set a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting Password...
                </div>
              ) : (
                "Set Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
