import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Dashboard } from "./Dashboard";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
export function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
function ProtectedRoute({ children }) {
    const auth = useAuth();
    const location = useLocation();
    if (auth.isLoading) {
        return _jsx("div", { style: { padding: "24px", fontFamily: "Inter, sans-serif" }, children: "Loading session..." });
    }
    if (!auth.isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(_Fragment, { children: children });
}
