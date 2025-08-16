import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    console.log('🔐 Login: Starting login process with:', { email: data.email, password: '***' });
    try {
      console.log('🔐 Login: Calling auth.login...');
      const result = await auth.login(data);
      console.log('✅ Login: Success!', result);
      
      // Invalidate the current user query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      console.error('❌ Login: Failed!', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-md mx-auto px-6 py-20">
        <Card className="glass-morphism border-gray-600 neon-border">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
              <p className="text-gray-300">Sign in to your trading account</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="input-override"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="input-override"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" data-testid="checkbox-remember" />
                    <label htmlFor="remember" className="text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Button variant="link" className="text-electric-blue hover:text-cyber-purple p-0" data-testid="link-forgot-password">
                    Forgot password?
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  className="w-full btn-primary py-3"
                  disabled={isLoading}
                  data-testid="button-sign-in"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link href="/signup">
                  <Button variant="link" className="text-electric-blue hover:text-cyber-purple p-0" data-testid="link-signup">
                    Sign up
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
