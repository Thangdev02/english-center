import api from "./api";

export const dashboardApi = {
  getAdminDashboard: () => api.get(`/dashboard`),
};
