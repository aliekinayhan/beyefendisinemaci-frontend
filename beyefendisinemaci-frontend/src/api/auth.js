import api from "./axiosInstance";

export const login = (data) => api.post("/api/auth/login", data);
export const register = (data) => api.post("/api/auth/register", data);
export const logout = (data) => api.post("/api/auth/logout", data);
export const refreshToken = (data) => api.post("/api/auth/refresh", data);
