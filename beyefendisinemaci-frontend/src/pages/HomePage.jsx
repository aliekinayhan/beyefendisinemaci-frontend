import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecentMovies } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getRecentMovies()
      .then((res) => {
        setMovies(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "3rem 0 2.5rem" }}>
          <h1
            style={{
              color: "#E8C547",
              fontFamily: "'Playfair Display', serif",
              fontSize: "2.5rem",
              margin: "0 0 0.5rem",
              letterSpacing: "0.05em",
            }}
          >
            Beyefendi Sinemacı
          </h1>
          <p style={{ color: "#666", fontSize: "1rem", margin: 0 }}>
            {t("home.subtitle")}
          </p>
        </div>

        {/* Son Eklenenler */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.2rem",
              margin: 0,
            }}
          >
            {t("home.recent")}
          </h2>
          <Link
            to="/movies"
            style={{
              color: "#E8C547",
              fontSize: "0.85rem",
              border: "1px solid #E8C547",
              padding: "0.3rem 0.8rem",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            {t("home.all_movies")}
          </Link>
        </div>

        {loading ? (
          <div style={{ color: "#666", textAlign: "center", padding: "4rem" }}>
            {t("home.loading")}
          </div>
        ) : movies.length === 0 ? (
          <div style={{ color: "#666", textAlign: "center", padding: "4rem" }}>
            {t("home.no_movies")}
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
      </div>
    </div>
  );
}
