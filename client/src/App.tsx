import { Switch, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import type { User } from "@shared/schema";

// Components
import Navigation from "@/components/navigation";
import ProtectedRoute from "@/components/protected-route";

// Pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Profile from "@/pages/profile";
import ResetPassword from "@/pages/reset-password";
import EmailSetup from "@/pages/email-setup";
import NotFound from "@/pages/not-found";

function AppContent() {
  console.log("🎯 AppContent: Component starting...");
  
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  
  console.log("🔐 AppContent: Authentication state:", isAuthenticated);
  
  // Listen to auth changes
  useEffect(() => {
    console.log("🔄 AppContent: Setting up auth listeners...");
    
    const handleStorageChange = () => {
      setIsAuthenticated(auth.isAuthenticated());
    };
    
    const handleAuthLogin = () => {
      setIsAuthenticated(true);
    };
    
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-login', handleAuthLogin);
    window.addEventListener('auth-logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-login', handleAuthLogin);
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  // Get current user if authenticated
  const { data: user } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: auth.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 0, // Always fresh for user data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // If not authenticated, user should be null
  const currentUser = isAuthenticated ? user : null;

  console.log("🔐 AppContent: Current user:", currentUser);
  console.log("🖼️ AppContent: User profile picture:", currentUser?.profilePicture);
  console.log("🎯 AppContent: About to render navigation and routes...");

  return (
    <div className="min-h-screen bg-dark-navy">
      <Navigation user={currentUser} />
      
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/email-setup" component={EmailSetup} />
        
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/analytics">
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        </Route>
        
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  console.log("🚀 App: Main App component starting...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
