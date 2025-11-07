import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/userApi";
import { testApiConnection } from "../services/testApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const connected = await testApiConnection();
      setApiConnected(connected);

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    };

    initializeApp();
  }, []);

  const login = async (credentials) => {
    {
      // if (!apiConnected) {
      //   throw new Error(
      //     "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
      //   );
      // }

      const { user: userData } = await authApi.login(credentials);
      setUser(userData);
      console.log("🏠 Login successful, should navigate to home");
      return userData;
    }
  };

  const register = async (userData) => {
    const { user: newUser } = await authApi.register(userData);
    setUser(newUser);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    apiConnected,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
