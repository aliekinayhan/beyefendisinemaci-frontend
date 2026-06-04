import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/auth";
import DefaultAvatar from "./DefaultAvatar";

export default function Navbar() {
  const { token, user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/movies" style={linkStyle}>
          Filmler
        </Link>

        {token ? (
          <>
            {isAdmin && (
              <Link to="/admin" style={{ ...linkStyle, color: "#C62A2A" }}>
                Admin
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
                    Profilim
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
                    Ayarlar
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
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Giriş
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
              Kayıt Ol
            </Link>
          </>
        )}
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
