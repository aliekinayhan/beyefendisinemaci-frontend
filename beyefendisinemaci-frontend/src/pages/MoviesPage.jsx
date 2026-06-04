import { useState, useEffect } from "react";
import { getMovies, searchMovies } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";

export default function MoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchMovies = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await getMovies({ page: pageNum, size: 12 });
      setMovies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(page);
  }, [page, token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearching(false);
      fetchMovies(0);
      return;
    }
    setLoading(true);
    setSearching(true);
    try {
      const res = await searchMovies(query);
      setMovies(res.data || []);
      setTotalPages(0);
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#E8C547",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            margin: "0 0 2rem",
          }}
        >
          Tüm Filmler
        </h1>

        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}
        >
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) {
                setSearching(false);
                fetchMovies(0);
              }
            }}
            placeholder="Film ara..."
            style={{
              flex: 1,
              background: "#111118",
              border: "1px solid #2a2a3e",
              borderRadius: "4px",
              padding: "0.65rem 1rem",
              color: "#e0e0e0",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#E8C547",
              color: "#0D0D0F",
              border: "none",
              borderRadius: "4px",
              padding: "0.65rem 1.5rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ara
          </button>
        </form>

        {loading ? (
          <div style={{ color: "#666", textAlign: "center", padding: "4rem" }}>
            Yükleniyor...
          </div>
        ) : movies.length === 0 ? (
          <div style={{ color: "#666", textAlign: "center", padding: "4rem" }}>
            Film bulunamadı.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!searching && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "2.5rem",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={pageButtonStyle(page === 0)}
            >
              ← Önceki
            </button>
            <span
              style={{
                color: "#666",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
              }}
            >
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={pageButtonStyle(page === totalPages - 1)}
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const pageButtonStyle = (disabled) => ({
  background: disabled ? "#1a1a2e" : "#E8C547",
  color: disabled ? "#444" : "#0D0D0F",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
});
