import api from "./axiosInstance";

export const getCommentsByMovie = (movieId, pageable) =>
  api.get(`/api/movies/${movieId}/comments`, { params: pageable });
export const getCommentsByUser = (userId, pageable) =>
  api.get(`/api/users/${userId}/comments`, { params: pageable });
export const addComment = (movieId, data) =>
  api.post(`/api/movies/${movieId}/comments`, data);
export const updateComment = (id, data) => api.put(`/api/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/api/comments/${id}`);
