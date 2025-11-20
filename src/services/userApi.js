import api from "./api";

// const createSimpleToken = (user) => {
//   const tokenData = {
//     id: user.id,
//     email: user.email,
//     timestamp: Date.now(),
//   };
//   return btoa(unescape(encodeURIComponent(JSON.stringify(tokenData))));
// };

// Export userApi object
export const userApi = {
  // Authentication
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  changePassword: (passwordData) =>
    api.patch("/auth/change-password", passwordData),

  // User management
  getProfile: () => api.get("/users/me"),
  updateProfile: (userData) => api.patch("/users/me", userData),

  // Teacher functions
  getStudents: () => api.get("/users?role=student"),
  addStudentToClass: (classId, email) =>
    api.post(`/forum-classes/${classId}/members`, { email }),

  // Admin functions
  getAllUsers: (params) => api.get("/accounts", { params }),
  updateUser: (userId, userData) => api.patch(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),

  // Check if email exists
  checkEmail: async (email) => {
    const response = await api.get("/users", {
      params: { email },
    });
    return { exists: response.data.length > 0 };
  },
};

export const authApi = {
  login: async (credentials) => {
    console.log("🔐 Attempting login with:", credentials.email);

    try {
      const response = await api.post("/auth/login", {
        usernameOrEmail: credentials.email,
        password: credentials.password,
      });

      console.log("📡 API Response:", response.data);

      // if (response.data.length === 0) {
      //   throw new Error("Email hoặc mật khẩu không đúng!");
      // }

      const user = response.data.data;
      const token = user.accessToken;
      // const token = createSimpleToken(user);

      localStorage.setItem("token", user.accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Login successful:", user.name);
      return { user, token };
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    console.log("👤 Attempting registration for:", userData.email);

    try {
      const response = await api.post("/auth/register", userData);

      const newUser = response.data.data;
      const token = newUser.accessToken;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));

      console.log("✅ Registration successful:", newUser.name);
      return { user: newUser, token };
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("🚪 User logged out");
  },
};
