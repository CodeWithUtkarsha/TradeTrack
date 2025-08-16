import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";
import type { User } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        setLocation("/login");
        return;
      }

      try {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setLocation("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-navy">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
