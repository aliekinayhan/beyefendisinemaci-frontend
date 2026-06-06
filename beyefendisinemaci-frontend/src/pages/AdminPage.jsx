import { useState } from "react";
import { searchTmdb } from "../api/tmdb";
import {
  createMovie,
  searchMovies2,
  deleteMovie,
  updateMovie,
} from "../api/movies";
import {
  uploadShortVideo,
  uploadLongVideo,
  uploadProfilePhoto,
} from "../api/s3";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";
import DefaultAvatar from "../components/DefaultAvatar";
import { useTranslation } from "react-i18next";

const TABS = ["movies", "users"];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("movies");
  const { t } = useTranslation();

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-[#E8C547] font-serif text-3xl mb-8">
          {t("admin.title")}
        </h1>
        <div className="flex border-b border-[#1a1a2e] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`bg-transparent border-none px-6 py-3 cursor-pointer text-sm transition-colors
                ${
                  activeTab === tab
                    ? "text-[#E8C547] border-b-2 border-[#E8C547] font-semibold"
                    : "text-[#666] border-b-2 border-transparent hover:text-[#999]"
                }`}
            >
              {tab === "movies"
                ? t("admin.tabs_movies")
                : t("admin.tabs_users")}
            </button>
          ))}
        </div>
        {activeTab === "movies" && <FilmlerTab />}
        {activeTab === "users" && <KullanicilarTab />}
      </div>
    </div>
  );
}

function FilmlerTab() {
  const { t } = useTranslation();
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [movieSearched, setMovieSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [shortVideoUrl, setShortVideoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [mode, setMode] = useState("list");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "success" }), 3000);
  };

  const handleTmdbSearch = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    try {
      const res = await searchTmdb(tmdbQuery);
      setTmdbResults(res.data);
    } catch (err) {
      showToast(t("admin.search_failed"), "error");
    }
  };

  const handleMovieSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await searchMovies2(movieQuery);
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast(t("admin.search_failed"), "error");
    }
  };

  const handleSelect = (movie) => {
    setSelectedMovie(movie);
    setReview("");
    setShortVideoUrl("");
    setVideoUrl("");
    setPosterUrl(movie.posterUrl || "");
    setGenre("");
    setReleaseYear(movie.releaseYear || "");
    setOriginalTitle(movie.originalTitle || "");
    setTmdbResults([]);
    setTmdbQuery("");
    setMode("add");
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title || "");
    setReview(movie.review || "");
    setShortVideoUrl(movie.shortVideoUrl || "");
    setVideoUrl(movie.videoUrl || "");
    setPosterUrl(movie.posterUrl || "");
    setGenre(movie.genre || "");
    setReleaseYear(movie.releaseYear || "");
    setOriginalTitle(movie.originalTitle || "");
    setMode("edit");
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirm_delete_movie"))) return;
    try {
      await deleteMovie(id);
      setMovieResults(movieResults.filter((m) => m.id !== id));
      showToast(t("admin.movie_deleted"));
    } catch (err) {
      showToast(t("admin.movie_delete_failed"), "error");
    }
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProfilePhoto(file);
      setPosterUrl(res.data);
      showToast(t("admin.poster_uploaded"));
    } catch (err) {
      showToast(t("admin.poster_failed"), "error");
    }
  };

  const handleShortVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadShortVideo(file);
      setShortVideoUrl(res.data);
      showToast(t("admin.short_video_uploaded"));
    } catch (err) {
      showToast(t("admin.long_video_failed"), "error");
    }
  };

  const handleLongVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadLongVideo(file);
      setVideoUrl(res.data);
      showToast(t("admin.long_video_uploaded"));
    } catch (err) {
      showToast(t("admin.long_video_failed"), "error");
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!selectedMovie) return;
    setLoading(true);
    try {
      await createMovie({
        title: selectedMovie.title,
        tmdbId: selectedMovie.tmdbId,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        genre: genre || null,
        posterUrl,
        review,
        shortVideoUrl: shortVideoUrl || null,
        videoUrl: videoUrl || null,
        originalTitle: originalTitle || null,
      });
      showToast(t("admin.movie_added"));
      setSelectedMovie(null);
      setMode("list");
      const res = await searchMovies2("");
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast(
        err.response?.data?.message || t("admin.movie_add_failed"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    setLoading(true);
    try {
      await updateMovie(editingMovie.id, {
        title,
        tmdbId: editingMovie.tmdbId,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        genre: genre || null,
        posterUrl,
        review,
        shortVideoUrl: shortVideoUrl || null,
        videoUrl: videoUrl || null,
        originalTitle: originalTitle || null,
      });
      showToast(t("admin.movie_updated"));
      setEditingMovie(null);
      setMode("list");
      const res = await searchMovies2(movieQuery);
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast(
        err.response?.data?.message || t("admin.movie_update_failed"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors box-border";
  const labelCls = "block text-[#aaa] text-sm mb-1";
  const cardCls = "bg-[#111118] border border-[#1a1a2e] rounded-lg p-6 mb-6";
  const btnCls =
    "bg-[#E8C547] text-[#0D0D0F] border-none rounded px-6 py-2.5 font-bold cursor-pointer hover:opacity-90 transition-opacity text-sm";
  const smallBtnCls =
    "bg-transparent border rounded px-3 py-1 text-xs cursor-pointer transition-colors";

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />

      {mode === "list" && (
        <>
          {/* TMDB Arama */}
          <div className={cardCls}>
            <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
              {t("admin.tmdb_title")}
            </h2>
            <form onSubmit={handleTmdbSearch} className="flex gap-3 mb-4">
              <input
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                placeholder={t("admin.tmdb_placeholder")}
                className={inputCls}
              />
              <button type="submit" className={btnCls}>
                {t("admin.search_btn")}
              </button>
            </form>
            {tmdbResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                {tmdbResults.map((movie) => (
                  <div
                    key={movie.tmdbId}
                    onClick={() => handleSelect(movie)}
                    className="bg-[#0D0D0F] border border-[#2a2a3e] rounded-lg overflow-hidden cursor-pointer hover:border-[#E8C547] transition-colors"
                  >
                    <img
                      src={
                        movie.posterUrl ||
                        "https://via.placeholder.com/130x195?text=?"
                      }
                      alt={movie.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-[#e0e0e0] text-xs m-0 truncate">
                        {movie.title}
                      </p>
                      <p className="text-[#666] text-xs mt-0.5 m-0">
                        {movie.releaseYear}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mevcut Filmler */}
          <div className={cardCls}>
            <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
              {t("admin.existing_movies")}
            </h2>
            <form onSubmit={handleMovieSearch} className="flex gap-3 mb-4">
              <input
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                placeholder={t("admin.movie_placeholder")}
                className={inputCls}
              />
              <button type="submit" className={btnCls}>
                {t("admin.search_btn")}
              </button>
            </form>
            {movieResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {movieResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-[#0D0D0F] border border-[#2a2a3e] rounded-lg px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <Link
                      to={`/movies/${movie.id}`}
                      className="flex items-center gap-3 no-underline flex-1 min-w-0"
                    >
                      <img
                        src={
                          movie.posterUrl ||
                          "https://via.placeholder.com/40x60?text=?"
                        }
                        alt={movie.title}
                        className="w-10 h-[60px] object-cover rounded flex-shrink-0"
                      />
                      <div>
                        <p className="text-[#e0e0e0] m-0 text-sm font-semibold">
                          {movie.title}
                        </p>
                        <p className="text-[#666] m-0 text-xs">
                          {movie.genre}{" "}
                          {movie.releaseYear && `· ${movie.releaseYear}`}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(movie)}
                        className={`${smallBtnCls} border-[#E8C547] text-[#E8C547] hover:bg-[#E8C547]/10`}
                      >
                        {t("admin.edit_btn")}
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className={`${smallBtnCls} border-[#C62A2A] text-[#C62A2A] hover:bg-[#C62A2A]/10`}
                      >
                        {t("admin.delete_btn")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#666]">
                {movieSearched ? t("admin.not_found") : t("admin.not_searched")}
              </p>
            )}
          </div>
        </>
      )}

      {(mode === "add" || mode === "edit") && (
        <div className={cardCls}>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[#e0e0e0] text-base font-semibold m-0">
              {mode === "add"
                ? `${t("admin.add_movie_title")} ${selectedMovie?.title}`
                : `${t("admin.edit_movie_title")} ${editingMovie?.title}`}
            </h2>
            <button
              onClick={() => setMode("list")}
              className="bg-transparent border-none text-[#666] cursor-pointer text-sm"
            >
              {t("admin.back_btn")}
            </button>
          </div>

          <form
            onSubmit={mode === "add" ? handleSubmitAdd : handleSubmitEdit}
            className="flex flex-col gap-4"
          >
            {/* Poster */}
            <div>
              <label className={labelCls}>{t("admin.poster")}</label>
              <div className="flex items-center gap-4">
                {posterUrl && (
                  <img
                    src={posterUrl}
                    alt="poster"
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <label
                  className={`${smallBtnCls} border-[#2a2a3e] text-[#e0e0e0] hover:border-[#444] px-3 py-1.5`}
                >
                  {t("admin.upload_poster")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* İsimler */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelCls}>{t("admin.english_name")}</label>
                <input
                  value={mode === "add" ? selectedMovie?.title || "" : title}
                  onChange={
                    mode === "edit"
                      ? (e) => setTitle(e.target.value)
                      : undefined
                  }
                  readOnly={mode === "add"}
                  className={`${inputCls} ${mode === "add" ? "text-[#666]" : "text-[#e0e0e0]"}`}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>{t("admin.original_name")}</label>
                <input
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder={t("admin.original_placeholder")}
                  className={inputCls}
                />
              </div>
            </div>

            {/* İnceleme */}
            <div>
              <label className={labelCls}>{t("admin.review")}</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                rows={6}
                placeholder={t("admin.review_placeholder")}
                className={`${inputCls} resize-y`}
              />
            </div>

            {/* Tür ve Yıl */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelCls}>{t("admin.genre")}</label>
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder={t("admin.genre_placeholder")}
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>{t("admin.year")}</label>
                <input
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="2024"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Kısa Video */}
            <div>
              <label className={labelCls}>{t("admin.short_video")}</label>
              <div className="flex gap-3 items-center">
                <input
                  value={shortVideoUrl}
                  readOnly
                  placeholder={t("admin.video_placeholder")}
                  className={`${inputCls} flex-1 text-[#666]`}
                />
                <label
                  className={`${smallBtnCls} border-[#2a2a3e] text-[#e0e0e0] hover:border-[#444] px-3 py-1.5 whitespace-nowrap`}
                >
                  {t("admin.upload_video")}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleShortVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Uzun Video */}
            <div>
              <label className={labelCls}>{t("admin.long_video")}</label>
              <div className="flex gap-3 items-center">
                <input
                  value={videoUrl}
                  readOnly
                  placeholder={t("admin.video_placeholder")}
                  className={`${inputCls} flex-1 text-[#666]`}
                />
                <label
                  className={`${smallBtnCls} border-[#2a2a3e] text-[#e0e0e0] hover:border-[#444] px-3 py-1.5 whitespace-nowrap`}
                >
                  {t("admin.upload_video")}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleLongVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`${btnCls} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? t("admin.saving") : t("admin.save")}
              </button>
              <button
                type="button"
                onClick={() => setMode("list")}
                className="bg-transparent border border-[#333] text-[#666] rounded px-6 py-2.5 cursor-pointer text-sm hover:border-[#555] transition-colors"
              >
                {t("admin.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function KullanicilarTab() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearched, setUserSearched] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "success" }), 3000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { searchUsers } = await import("../api/users");
      const res = await searchUsers(query);
      setUsers(res.data);
      setUserSearched(true);
    } catch (err) {
      showToast(t("admin.search_failed"), "error");
    }
  };

  const handleFreeze = async (userId) => {
    try {
      const { freezeAccount } = await import("../api/users");
      await freezeAccount(userId);
      showToast(t("admin.status_changed"));
    } catch (err) {
      showToast(t("common.error"), "error");
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const { changeRole } = await import("../api/users");
      await changeRole(userId, newRole);
      showToast(t("admin.role_updated"));
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      showToast(t("admin.role_failed"), "error");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(t("admin.confirm_delete_user"))) return;
    try {
      const { deleteUserByAdmin } = await import("../api/users");
      await deleteUserByAdmin(userId);
      showToast(t("admin.account_deleted"));
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      showToast(t("admin.account_delete_failed"), "error");
    }
  };

  const inputCls =
    "w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors box-border";
  const smallBtnCls =
    "bg-transparent border rounded px-3 py-1 text-xs cursor-pointer transition-colors";

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-6 mb-6">
        <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
          {t("admin.user_search_title")}
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.user_placeholder")}
            className={inputCls}
          />
          <button
            type="submit"
            className="bg-[#E8C547] text-[#0D0D0F] border-none rounded px-6 py-2.5 font-bold cursor-pointer hover:opacity-90 transition-opacity text-sm"
          >
            {t("admin.search_btn")}
          </button>
        </form>
        {users.length > 0 ? (
          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-[#0D0D0F] border border-[#2a2a3e] rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-4 no-underline flex-1 min-w-0"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <DefaultAvatar size={40} />
                  )}
                  <div>
                    <p className="text-[#e0e0e0] m-0 text-sm font-semibold">
                      {user.username}
                    </p>
                    <p className="text-[#666] m-0 text-xs">{user.role}</p>
                  </div>
                </Link>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  <button
                    onClick={() => handleFreeze(user.id)}
                    className={`${smallBtnCls} border-[#E8C547] text-[#E8C547] hover:bg-[#E8C547]/10`}
                  >
                    {t("admin.ban_unban")}
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    className={`${smallBtnCls} border-[#666] text-[#666] hover:bg-white/5`}
                  >
                    {user.role === "ADMIN"
                      ? t("admin.make_user")
                      : t("admin.make_admin")}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className={`${smallBtnCls} border-[#C62A2A] text-[#C62A2A] hover:bg-[#C62A2A]/10`}
                  >
                    {t("admin.delete_btn")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#666]">
            {userSearched
              ? t("admin.user_not_found")
              : t("admin.user_not_searched")}
          </p>
        )}
      </div>
    </div>
  );
}
