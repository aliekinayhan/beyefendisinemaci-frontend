import api from "./axiosInstance";

export const getMyWatchlist = (pageable) =>
  api.get("/api/watchlist/me", { params: pageable });
export const getUserWatchlist = (userId, pageable) =>
  api.get(`/api/watchlist/${userId}`, { params: pageable });
export const addToWatchlist = (movieId) =>
  api.post(`/api/watchlist/${movieId}`);
export const removeFromWatchlist = (movieId) =>
  api.delete(`/api/watchlist/${movieId}`);
