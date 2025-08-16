import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartLine, Brain, BarChart3, User, LogOut, Settings } from "lucide-react";

interface NavigationProps {
  user?: any;
}

export default function Navigation({ user }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Debug logging for user profile picture
  console.log('🔍 Navigation: Received user:', user);
  console.log('🔍 Navigation: User profile picture:', user?.profilePicture);

  const handleLogout = () => {
    auth.logout();
    // Clear specific user-related queries
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    queryClient.removeQueries({ queryKey: ["trades"] });
    // Clear all queries from cache
    queryClient.clear();
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
            <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-cyber-purple rounded-lg flex items-center justify-center">
              <ChartLine className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold gradient-text">TradeZella</span>
          </Link>
          
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" data-testid="nav-dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-electric-blue">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/analytics" data-testid="nav-analytics">
                  <Button variant="ghost" className="text-gray-300 hover:text-electric-blue">
                    <Brain className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/profile" data-testid="nav-profile">
                  <Button variant="ghost" className="text-gray-300 hover:text-electric-blue">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-electric-blue">
                    <AvatarImage 
                      src={user?.profilePicture || undefined} 
                      alt={`${user?.firstName} ${user?.lastName}`}
                      onLoad={() => console.log('🖼️ Navigation: Avatar image loaded:', user?.profilePicture)}
                      onError={() => console.log('❌ Navigation: Avatar image failed to load:', user?.profilePicture)}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-electric-blue to-cyber-purple text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-300">
                    Welcome, {user.firstName}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-gray-300 hover:text-red-400"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/email-setup" data-testid="nav-email-setup">
                <Button variant="ghost" className="text-gray-300 hover:text-electric-blue">
                  <Settings className="w-4 h-4 mr-2" />
                  Email Setup
                </Button>
              </Link>
              <Link href="/login" data-testid="nav-login">
                <Button variant="ghost" className="text-gray-300 hover:text-electric-blue">
                  Login
                </Button>
              </Link>
              <Link href="/signup" data-testid="nav-signup">
                <Button className="btn-primary" data-testid="button-signup">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
