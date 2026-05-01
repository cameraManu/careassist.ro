import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import "./App.css";

function FullScreenLoader(): React.JSX.Element {
  return <div className="app-session-loader">Loading session...</div>;
}

export function App(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
