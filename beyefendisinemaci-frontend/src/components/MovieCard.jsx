import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToWatchlist, removeFromWatchlist } from "../api/watchlist";
import { useState } from "react";

export default function MovieCard({ movie }) {
  const { token } = useAuth();
  const [added, setAdded] = useState(false);

  const handleWatchlist = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (added) {
        await removeFromWatchlist(movie.id);
        setAdded(false);
      } else {
        await addToWatchlist(movie.id);
        setAdded(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link to={`/movies/${movie.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#111118",
          border: "1px solid #1a1a2e",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.2s, border-color 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E8C547")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "2/3",
            overflow: "hidden",
          }}
        >
          <img
            src={
              movie.posterUrl ||
              "https://via.placeholder.com/300x450?text=Poster+Yok"
            }
            alt={movie.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {token && (
            <button
              onClick={handleWatchlist}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: added ? "#E8C547" : "rgba(0,0,0,0.7)",
                border: "1px solid #E8C547",
                borderRadius: "4px",
                color: added ? "#0D0D0F" : "#E8C547",
                padding: "0.3rem 0.6rem",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {added ? "✓ Listede" : "+ Liste"}
            </button>
          )}
        </div>
        <div style={{ padding: "0.75rem" }}>
          <h3
            style={{
              color: "#e0e0e0",
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {movie.title}
          </h3>
          {movie.releaseYear && (
            <p
              style={{
                color: "#666",
                fontSize: "0.8rem",
                margin: "0.3rem 0 0",
              }}
            >
              {movie.releaseYear}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
