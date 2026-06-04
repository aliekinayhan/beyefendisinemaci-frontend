import api from "./axiosInstance";

export const getMyProfile = () => api.get("/api/users/me");
export const getUserProfile = (id) => api.get(`/api/users/${id}`);
export const updateProfile = (data) => api.put("/api/users/me", data);
export const changePassword = (data) => api.put("/api/users/me/password", data);
export const deleteAccount = (data) => api.delete("/api/users/me", { data });
export const searchUsers = (username) =>
  api.get("/api/admin/users/search", { params: { q: username } });
export const freezeAccount = (id) => api.put(`/api/admin/users/${id}/freeze`);
export const changeRole = (id, role) =>
  api.put(`/api/admin/users/${id}/role`, { role });
export const deleteUserByAdmin = (id) => api.delete(`/api/admin/users/${id}`);
