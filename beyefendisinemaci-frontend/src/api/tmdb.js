import api from "./axiosInstance";

export const searchTmdb = (q) => api.get("/api/tmdb/search", { params: { q } });
