import api from "./axiosInstance";

export const getMovies = (pageable) =>
  api.get("/api/movies", { params: pageable });
export const getMovieById = (id) => api.get(`/api/movies/${id}`);
export const getRecentMovies = () => api.get("/api/movies/recent");
export const searchMovies = (q) =>
  api.get("/api/movies/search", { params: { q } });
export const createMovie = (data) => api.post("/api/movies", data);
export const updateMovie = (id, data) => api.put(`/api/movies/${id}`, data);
export const deleteMovie = (id) => api.delete(`/api/movies/${id}`);
