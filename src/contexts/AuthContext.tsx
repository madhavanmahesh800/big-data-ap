
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getUsername, removeToken, removeUsername } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  setAuth: (username: string) => void;
  clearAuth: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  setAuth: () => {},
  clearAuth: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for token on initial load
    const token = getToken();
    const storedUsername = getUsername();
    
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
    
    setLoading(false);
  }, []);

  const setAuth = (username: string) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  const clearAuth = () => {
    setIsAuthenticated(false);
    setUsername(null);
    removeToken();
    removeUsername();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        setAuth,
        clearAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
