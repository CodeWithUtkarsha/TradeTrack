import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { registerSchema, type RegisterRequest } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      preferredBroker: "MetaTrader",
      experience: "Beginner (< 1 year)",
      bio: "",
    },
  });

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    console.log('Form submission data:', data);
    console.log('Form validation state:', form.formState);
    
    try {
      await auth.register(data);
      // Invalidate the current user query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Account created successfully!",
        description: "Welcome to TradeJournal. Let's start your trading journey.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Please check your information and try again.";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "This email address is already registered. Please use a different email or try logging in.";
      } else if (error.message?.includes('Password must contain')) {
        errorMessage = "Password must contain at least one uppercase letter, lowercase letter, number, and special character.";
      } else if (error.message?.includes('Validation failed')) {
        errorMessage = "Please check all required fields and ensure passwords match.";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
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
              <h2 className="text-3xl font-bold gradient-text mb-2">Join TradeZella</h2>
              <p className="text-gray-300">Start your trading journey today</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John"
                            className="input-override"
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Doe"
                            className="input-override"
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                          placeholder="john@example.com"
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
                          placeholder="Create a strong password"
                          className="input-override"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-400 mt-1">
                        Must contain uppercase, lowercase, number, and special character
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm your password"
                          className="input-override"
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredBroker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Preferred Broker</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="input-override" data-testid="select-broker">
                            <SelectValue placeholder="Select your broker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-morphism border-gray-600">
                          <SelectItem value="MetaTrader">MetaTrader</SelectItem>
                          <SelectItem value="TradingView">TradingView</SelectItem>
                          <SelectItem value="Interactive Brokers">Interactive Brokers</SelectItem>
                          <SelectItem value="TD Ameritrade">TD Ameritrade</SelectItem>
                          <SelectItem value="E*TRADE">E*TRADE</SelectItem>
                          <SelectItem value="Charles Schwab">Charles Schwab</SelectItem>
                          <SelectItem value="Fidelity">Fidelity</SelectItem>
                          <SelectItem value="Robinhood">Robinhood</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Trading Experience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="input-override" data-testid="select-experience">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-morphism border-gray-600">
                          <SelectItem value="Beginner (< 1 year)">Beginner (&lt; 1 year)</SelectItem>
                          <SelectItem value="Intermediate (1-3 years)">Intermediate (1-3 years)</SelectItem>
                          <SelectItem value="Advanced (3-5 years)">Advanced (3-5 years)</SelectItem>
                          <SelectItem value="Expert (5+ years)">Expert (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required data-testid="checkbox-terms" />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full btn-primary py-3"
                  disabled={isLoading}
                  data-testid="button-create-account"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link href="/login">
                  <Button variant="link" className="text-electric-blue hover:text-cyber-purple p-0" data-testid="link-signin">
                    Sign in
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
