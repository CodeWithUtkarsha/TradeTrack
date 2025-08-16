import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { emailService } from "@/lib/emailService";
import { Eye, EyeOff, CheckCircle, AlertCircle, Key } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Get token and email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      form.setValue('email', emailParam);
      
      // Validate the token
      const isValid = emailService.validateResetToken(emailParam, tokenParam);
      setIsValidToken(isValid);
      
      if (!isValid) {
        toast({
          title: "Invalid or expired link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
      }
    } else {
      setIsValidToken(false);
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [form, toast]);

  const handleResetPassword = async (data: ResetPasswordForm) => {
    if (!isValidToken) {
      toast({
        title: "Invalid token",
        description: "Cannot reset password with invalid token.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);

    try {
      // Simulate password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send this to your backend
      console.log('Password reset for:', data.email);
      console.log('New password:', data.newPassword);
      
      // Clear the reset token
      emailService.clearResetToken(data.email);
      
      // Update user password in localStorage (for demo)
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.email === data.email) {
          user.password = data.newPassword; // In real app, this would be hashed
          user.updatedAt = new Date();
          localStorage.setItem("user_data", JSON.stringify(user));
        }
      }

      toast({
        title: "Password reset successful!",
        description: "Your password has been updated. You can now log in with your new password.",
      });

      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-dark-navy text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-dark-navy text-white pt-20">
        <div className="floating-elements"></div>
        <div className="max-w-md mx-auto px-6 py-8">
          <Card className="glass-morphism border-gray-600">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
              <p className="text-gray-300 mb-6">
                This password reset link is invalid or has expired. Password reset links are valid for 24 hours only.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/profile")} 
                  className="btn-primary w-full"
                >
                  Request New Reset Link
                </Button>
                <Button 
                  onClick={() => navigate("/login")} 
                  variant="outline" 
                  className="btn-glass w-full"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-md mx-auto px-6 py-8">
        <Card className="glass-morphism border-gray-600">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-full mx-auto mb-4 flex items-center justify-center">
              <Key className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">Reset Your Password</CardTitle>
            <p className="text-gray-300">Enter your new password below</p>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled
                          className="input-override bg-gray-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            className="input-override pr-10"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="input-override pr-10"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="text-gray-400 hover:text-white"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
