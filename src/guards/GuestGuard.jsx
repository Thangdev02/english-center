import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestGuard = ({ children }) => {
  const { user } = useAuth();

  // If user is authenticated, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, allow access to login/register
  return <>{children}</>;
};

export default GuestGuard;
