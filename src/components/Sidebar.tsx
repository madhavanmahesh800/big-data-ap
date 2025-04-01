
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, User, Users, MessageSquare, PlusSquare, LogOut, Menu, X
} from "lucide-react";

const Sidebar = () => {
  const { username, clearAuth } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      toast({
        title: "Logged out successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout on client-side even if API fails
      clearAuth();
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="mr-2" size={20} /> },
    { path: "/create", label: "Create Post", icon: <PlusSquare className="mr-2" size={20} /> },
    { path: "/profile", label: "Profile", icon: <User className="mr-2" size={20} /> },
    { path: "/messages", label: "Messages", icon: <MessageSquare className="mr-2" size={20} /> },
    { path: "/discover", label: "Discover", icon: <Users className="mr-2" size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 w-64 p-4 flex flex-col h-screen fixed md:sticky top-0 z-40 transition-all duration-300",
          isOpen ? "left-0" : "-left-64 md:left-0"
        )}
      >
        <div className="flex-1">
          {/* Logo */}
          <div className="text-center mb-8 p-2">
            <h1 className="text-2xl font-bold gradient-text">ConnectX</h1>
            <p className="text-gray-500 text-sm">Hello, {username}</p>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-brand-100 text-brand-500 font-medium"
                    : "text-gray-600 hover:bg-brand-100 hover:text-brand-500"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" size={20} />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
