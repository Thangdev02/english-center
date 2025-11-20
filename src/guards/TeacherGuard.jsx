import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TeacherGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to initialize
  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 2) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and is teacher, allow access
  return <>{children}</>;
};

export default TeacherGuard;
