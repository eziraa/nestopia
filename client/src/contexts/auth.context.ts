import { createContext } from "react";

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create Context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
