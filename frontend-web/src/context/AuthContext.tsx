import React from "react";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../../../shared/src/db.types";
import { getCurrentUser, login as loginRequest, register as registerRequest } from "../services/auth.service";

const AUTH_TOKEN_STORAGE_KEY = "careassist.auth.token";

interface AuthContextValue {
  user: LoginResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = React.useState<LoginResponse["user"] | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const response = await getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(response.user);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = React.useCallback(async (payload: LoginRequest): Promise<void> => {
    const response = await loginRequest(payload);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = React.useCallback(async (payload: RegisterRequest): Promise<void> => {
    await registerRequest(payload);
  }, []);

  const logout = React.useCallback((): void => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout
    }),
    [isLoading, login, logout, token, user, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
