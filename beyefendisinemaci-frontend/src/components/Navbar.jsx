import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/auth";
import DefaultAvatar from "./DefaultAvatar";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { getTrendingSearches } from "../api/movies";

export default function Navbar() {
  const { token, user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState([]);
  const [showTrending, setShowTrending] = useState(false);
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logout({ refreshToken });
    } catch (e) {
    } finally {
      logoutUser();
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowTrending(false);
    navigate(`/movies?q=${encodeURIComponent(query)}`);
  };

  const handleFocus = async () => {
    try {
      const res = await getTrendingSearches();
      setTrending(res.data || []);
      setShowTrending(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowTrending(false), 150);
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    setShowTrending(false);
    navigate(`/movies?q=${encodeURIComponent(term)}`);
  };

  return (
    <nav
      style={{
        background: "#0D0D0F",
        borderBottom: "1px solid #1a1a2e",
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/"
        style={{
          color: "#E8C547",
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.4rem",
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: "0.05em",
        }}
      >
        Beyefendi Sinemacı
      </Link>

      <form
        onSubmit={handleSearch}
        style={{ position: "relative", flex: "0 1 320px" }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowTrending(false);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t("movies.search_placeholder")}
          style={{
            width: "100%",
            background: "#111118",
            border: "1px solid #2a2a3e",
            borderRadius: "4px",
            padding: "0.4rem 1rem",
            color: "#e0e0e0",
            fontSize: "0.875rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {showTrending && trending.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#111118",
              border: "1px solid #2a2a3e",
              borderRadius: "4px",
              marginTop: "4px",
              zIndex: 200,
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "0.75rem",
                padding: "0.5rem 1rem 0.25rem",
                margin: 0,
              }}
            >
              En çok arananlar
            </p>
            {trending.map((term, i) => (
              <div
                key={i}
                onMouseDown={() => handleTrendingClick(term)}
                style={{
                  padding: "0.5rem 1rem",
                  color: "#e0e0e0",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1a1a2e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                🔥 {term}
              </div>
            ))}
          </div>
        )}
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/movies" style={linkStyle}>
          {t("nav.movies")}
        </Link>

        {token ? (
          <>
            {isAdmin && (
              <Link to="/admin" style={{ ...linkStyle, color: "#C62A2A" }}>
                {t("nav.admin")}
              </Link>
            )}
            <div style={{ position: "relative" }}>
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="profil"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #2a2a3e",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ cursor: "pointer" }}
                >
                  <DefaultAvatar size={36} />
                </div>
              )}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    background: "#111118",
                    border: "1px solid #1a1a2e",
                    borderRadius: "8px",
                    minWidth: "160px",
                    overflow: "hidden",
                    zIndex: 200,
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      borderBottom: "1px solid #1a1a2e",
                    }}
                  >
                    {t("nav.profile")}
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      color: "#e0e0e0",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      borderBottom: "1px solid #1a1a2e",
                    }}
                  >
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "transparent",
                      border: "none",
                      color: "#C62A2A",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              style={{
                ...linkStyle,
                background: "#E8C547",
                color: "#0D0D0F",
                padding: "0.4rem 1rem",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              {t("nav.register")}
            </Link>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#e0e0e0",
  textDecoration: "none",
  fontSize: "0.9rem",
  letterSpacing: "0.03em",
};
