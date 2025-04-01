
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getUsername, removeToken, removeUsername } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  setAuth: (username: string, token: string) => void;
  clearAuth: () => void;
  loading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  setAuth: () => {},
  clearAuth: () => {},
  loading: true,
  token: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for token on initial load
    const storedToken = getToken();
    const storedUsername = getUsername();
    
    if (storedToken && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const setAuth = (username: string, token: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setToken(token);
  };

  const clearAuth = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setToken(null);
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
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
