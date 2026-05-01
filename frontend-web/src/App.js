import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import "./App.css";
function FullScreenLoader() {
    return _jsx("div", { className: "app-session-loader", children: "Loading session..." });
}
export function App() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return _jsx(FullScreenLoader, {});
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: isAuthenticated ? _jsx(Dashboard, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: isAuthenticated ? "/dashboard" : "/login", replace: true }) })] }));
}
