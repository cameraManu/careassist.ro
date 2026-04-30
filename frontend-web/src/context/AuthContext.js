import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { getCurrentUser, login as loginRequest, register as registerRequest } from "../services/auth.service";
const AUTH_TOKEN_STORAGE_KEY = "careassist.auth.token";
const AuthContext = React.createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [token, setToken] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
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
            }
            catch {
                localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                setToken(null);
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        })();
    }, []);
    const login = React.useCallback(async (payload) => {
        const response = await loginRequest(payload);
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
        setToken(response.token);
        setUser(response.user);
    }, []);
    const register = React.useCallback(async (payload) => {
        await registerRequest(payload);
    }, []);
    const logout = React.useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
    }, []);
    const value = React.useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout
    }), [isLoading, login, logout, token, user, register]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
