import { useState } from "react";
import { searchTmdb } from "../api/tmdb";
import {
  createMovie,
  searchMovies,
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

const TABS = ["Filmler", "Kullanıcılar"];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Filmler");

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#E8C547",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            margin: "0 0 2rem",
          }}
        >
          Admin Paneli
        </h1>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #1a1a2e",
            marginBottom: "2rem",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #E8C547"
                    : "2px solid transparent",
                color: activeTab === tab ? "#E8C547" : "#666",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Filmler" && <FilmlerTab />}
        {activeTab === "Kullanıcılar" && <KullanicilarTab />}
      </div>
    </div>
  );
}

function FilmlerTab() {
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [movieSearched, setMovieSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
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
      showToast("Arama başarısız.", "error");
    }
  };

  const handleMovieSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await searchMovies(movieQuery);
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast("Film arama başarısız.", "error");
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
    if (!window.confirm("Bu filmi silmek istediğine emin misin?")) return;
    try {
      await deleteMovie(id);
      setMovieResults(movieResults.filter((m) => m.id !== id));
      showToast("Film silindi.");
    } catch (err) {
      showToast("Film silinemedi.", "error");
    }
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProfilePhoto(file);
      setPosterUrl(res.data);
      showToast("Poster yüklendi.");
    } catch (err) {
      showToast("Poster yüklenemedi.", "error");
    }
  };

  const handleShortVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadShortVideo(file);
      setShortVideoUrl(res.data);
      showToast("Kısa video yüklendi.");
    } catch (err) {
      showToast("Video yüklenemedi.", "error");
    }
  };

  const handleLongVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadLongVideo(file);
      setVideoUrl(res.data);
      showToast("Uzun video yüklendi.");
    } catch (err) {
      showToast("Video yüklenemedi.", "error");
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
      showToast("Film eklendi.");
      setSelectedMovie(null);
      setMode("list");
      const res = await searchMovies("");
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Film eklenemedi.", "error");
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
        title: editingMovie.title,
        tmdbId: editingMovie.tmdbId,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        genre: genre || null,
        posterUrl,
        review,
        shortVideoUrl: shortVideoUrl || null,
        videoUrl: videoUrl || null,
        originalTitle: originalTitle || null,
      });
      showToast("Film güncellendi.");
      setEditingMovie(null);
      setMode("list");
      const res = await searchMovies(movieQuery);
      setMovieResults(res.data);
      setMovieSearched(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Film güncellenemedi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />

      {mode === "list" && (
        <>
          <div style={cardStyle}>
            <h2 style={sectionTitle}>TMDB'den Film Ekle</h2>
            <form
              onSubmit={handleTmdbSearch}
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}
            >
              <input
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                placeholder="Film adı ara..."
                style={inputStyle}
              />
              <button type="submit" style={btnStyle}>
                Ara
              </button>
            </form>
            {tmdbResults.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                {tmdbResults.map((movie) => (
                  <div
                    key={movie.tmdbId}
                    onClick={() => handleSelect(movie)}
                    style={{
                      background: "#0D0D0F",
                      border: "1px solid #2a2a3e",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#E8C547")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#2a2a3e")
                    }
                  >
                    <img
                      src={
                        movie.posterUrl ||
                        "https://via.placeholder.com/130x195?text=?"
                      }
                      alt={movie.title}
                      style={{
                        width: "100%",
                        height: "195px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ padding: "0.5rem" }}>
                      <p
                        style={{
                          color: "#e0e0e0",
                          fontSize: "0.8rem",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {movie.title}
                      </p>
                      <p
                        style={{
                          color: "#666",
                          fontSize: "0.75rem",
                          margin: "0.2rem 0 0",
                        }}
                      >
                        {movie.releaseYear}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Mevcut Filmleri Ara & Düzenle</h2>
            <form
              onSubmit={handleMovieSearch}
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}
            >
              <input
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                placeholder="Film adı ara..."
                style={inputStyle}
              />
              <button type="submit" style={btnStyle}>
                Ara
              </button>
            </form>
            {movieResults.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {movieResults.map((movie) => (
                  <div
                    key={movie.id}
                    style={{
                      background: "#0D0D0F",
                      border: "1px solid #2a2a3e",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <Link
                      to={`/movies/${movie.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        textDecoration: "none",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <img
                        src={
                          movie.posterUrl ||
                          "https://via.placeholder.com/40x60?text=?"
                        }
                        alt={movie.title}
                        style={{
                          width: "40px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{
                            color: "#e0e0e0",
                            margin: 0,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {movie.title}
                        </p>
                        <p
                          style={{
                            color: "#666",
                            margin: 0,
                            fontSize: "0.8rem",
                          }}
                        >
                          {movie.genre}{" "}
                          {movie.releaseYear && `· ${movie.releaseYear}`}
                        </p>
                      </div>
                    </Link>
                    <div
                      style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}
                    >
                      <button
                        onClick={() => handleEdit(movie)}
                        style={{
                          ...smallBtnStyle,
                          borderColor: "#E8C547",
                          color: "#E8C547",
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        style={{
                          ...smallBtnStyle,
                          borderColor: "#C62A2A",
                          color: "#C62A2A",
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#666" }}>
                {movieSearched ? "Film bulunamadı." : "Henüz arama yapılmadı."}
              </p>
            )}
          </div>
        </>
      )}

      {(mode === "add" || mode === "edit") && (
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <h2 style={sectionTitle}>
              {mode === "add"
                ? `Film Ekle — ${selectedMovie?.title}`
                : `Film Düzenle — ${editingMovie?.title}`}
            </h2>
            <button
              onClick={() => setMode("list")}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              ← Geri
            </button>
          </div>
          <form
            onSubmit={mode === "add" ? handleSubmitAdd : handleSubmitEdit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Poster</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                {posterUrl && (
                  <img
                    src={posterUrl}
                    alt="poster"
                    style={{
                      width: "60px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <label
                  style={{
                    ...smallBtnStyle,
                    borderColor: "#2a2a3e",
                    color: "#e0e0e0",
                    cursor: "pointer",
                    padding: "0.4rem 0.8rem",
                  }}
                >
                  Poster Yükle
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>İngilizce İsim *</label>
                <input
                  value={
                    mode === "add"
                      ? selectedMovie?.title || ""
                      : editingMovie?.title || ""
                  }
                  readOnly
                  style={{ ...inputStyle, color: "#666" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Orijinal İsim</label>
                <input
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder="Orijinal dildeki isim..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>İnceleme *</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                rows={6}
                placeholder="Film incelemesi..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tür</label>
                <input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Drama, Thriller..."
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Yıl</label>
                <input
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="2024"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Kısa Video</label>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <input
                  value={shortVideoUrl}
                  readOnly
                  placeholder="Video yüklenince URL otomatik gelecek..."
                  style={{ ...inputStyle, flex: 1, color: "#666" }}
                />
                <label
                  style={{
                    ...smallBtnStyle,
                    borderColor: "#2a2a3e",
                    color: "#e0e0e0",
                    cursor: "pointer",
                    padding: "0.4rem 0.8rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Video Yükle
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleShortVideoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Uzun Video</label>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <input
                  value={videoUrl}
                  readOnly
                  placeholder="Video yüklenince URL otomatik gelecek..."
                  style={{ ...inputStyle, flex: 1, color: "#666" }}
                />
                <label
                  style={{
                    ...smallBtnStyle,
                    borderColor: "#2a2a3e",
                    color: "#e0e0e0",
                    cursor: "pointer",
                    padding: "0.4rem 0.8rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Video Yükle
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleLongVideoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setMode("list")}
                style={{
                  ...btnStyle,
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#666",
                }}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function KullanicilarTab() {
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
      showToast("Arama başarısız.", "error");
    }
  };

  const handleFreeze = async (userId) => {
    try {
      const { freezeAccount } = await import("../api/users");
      await freezeAccount(userId);
      showToast("Hesap durumu değiştirildi.");
    } catch (err) {
      showToast("İşlem başarısız.", "error");
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const { changeRole } = await import("../api/users");
      await changeRole(userId, newRole);
      showToast("Rol güncellendi.");
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      showToast("Rol değiştirilemedi.", "error");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bu hesabı silmek istediğine emin misin?")) return;
    try {
      const { deleteUserByAdmin } = await import("../api/users");
      await deleteUserByAdmin(userId);
      showToast("Hesap silindi.");
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      showToast("Hesap silinemedi.", "error");
    }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Kullanıcı Ara</h2>
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kullanıcı adı ara..."
            style={inputStyle}
          />
          <button type="submit" style={btnStyle}>
            Ara
          </button>
        </form>
        {users.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  background: "#0D0D0F",
                  border: "1px solid #2a2a3e",
                  borderRadius: "8px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <Link
                  to={`/profile/${user.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    textDecoration: "none",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.username}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <DefaultAvatar size={40} />
                  )}
                  <div>
                    <p
                      style={{
                        color: "#e0e0e0",
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {user.username}
                    </p>
                    <p style={{ color: "#666", margin: 0, fontSize: "0.8rem" }}>
                      {user.role}
                    </p>
                  </div>
                </Link>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => handleFreeze(user.id)}
                    style={{
                      ...smallBtnStyle,
                      borderColor: "#E8C547",
                      color: "#E8C547",
                    }}
                  >
                    Ban/Unban
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    style={{
                      ...smallBtnStyle,
                      borderColor: "#666",
                      color: "#666",
                    }}
                  >
                    {user.role === "ADMIN" ? "USER yap" : "ADMIN yap"}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      ...smallBtnStyle,
                      borderColor: "#C62A2A",
                      color: "#C62A2A",
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666" }}>
            {userSearched ? "Kullanıcı bulunamadı." : "Henüz arama yapılmadı."}
          </p>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#111118",
  border: "1px solid #1a1a2e",
  borderRadius: "8px",
  padding: "1.5rem",
  marginBottom: "1.5rem",
};
const sectionTitle = {
  color: "#e0e0e0",
  fontSize: "1rem",
  fontWeight: 600,
  margin: "0 0 1.25rem",
};
const labelStyle = {
  display: "block",
  color: "#aaa",
  fontSize: "0.85rem",
  marginBottom: "0.4rem",
};
const inputStyle = {
  width: "100%",
  background: "#0D0D0F",
  border: "1px solid #2a2a3e",
  borderRadius: "4px",
  padding: "0.65rem 0.75rem",
  color: "#e0e0e0",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};
const btnStyle = {
  background: "#E8C547",
  color: "#0D0D0F",
  border: "none",
  borderRadius: "4px",
  padding: "0.65rem 1.5rem",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.9rem",
};
const smallBtnStyle = {
  background: "transparent",
  border: "1px solid",
  borderRadius: "4px",
  padding: "0.3rem 0.7rem",
  fontSize: "0.8rem",
  cursor: "pointer",
};
