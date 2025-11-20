import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to initialize
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, allow access
  return <>{children}</>;
};

export default UserGuard;
