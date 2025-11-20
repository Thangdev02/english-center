import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to initialize
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not student (role !== 1), redirect to home
  if (user.role !== 1) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and is student, allow access
  return <>{children}</>;
};

export default StudentGuard;
