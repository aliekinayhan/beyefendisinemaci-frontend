import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/auth";
import DefaultAvatar from "./DefaultAvatar";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { token, user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logout({ refreshToken });
    } catch (e) {
    } finally {
      logoutUser();
      navigate("/login");
      setMenuOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/movies?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#0D0D0F] border-b border-[#1a1a2e] px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-[100]">
      {/* Logo */}
      <Link
        to="/"
        className="text-[#E8C547] font-serif text-lg sm:text-xl font-bold no-underline tracking-wider flex-shrink-0"
      >
        Beyefendi Sinemacı
      </Link>

      {/* Desktop: arama */}
      <form
        onSubmit={handleSearch}
        className="relative flex-shrink-0 w-64 mx-4 hidden sm:block"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("movies.search_placeholder")}
          className="w-full bg-[#111118] border border-[#2a2a3e] rounded px-4 py-1.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors box-border"
        />
      </form>

      {/* Desktop: sağ menü */}
      <div className="hidden sm:flex items-center gap-6">
        <Link
          to="/movies"
          className="text-[#e0e0e0] no-underline text-sm tracking-wide hover:text-white transition-colors"
        >
          {t("nav.movies")}
        </Link>

        {token ? (
          <>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-[#C62A2A] no-underline text-sm tracking-wide hover:opacity-80 transition-opacity"
              >
                {t("nav.admin")}
              </Link>
            )}
            <div className="relative">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="profil"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#2a2a3e] cursor-pointer hover:border-[#E8C547] transition-colors"
                />
              ) : (
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer"
                >
                  <DefaultAvatar size={36} />
                </div>
              )}
              {dropdownOpen && (
                <div
                  className="absolute top-12 right-0 bg-[#111118] border border-[#1a1a2e] rounded-lg min-w-[160px] overflow-hidden z-[200]"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-[#e0e0e0] no-underline text-sm border-b border-[#1a1a2e] hover:bg-[#1a1a2e] transition-colors"
                  >
                    {t("nav.profile")}
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 text-[#e0e0e0] no-underline text-sm border-b border-[#1a1a2e] hover:bg-[#1a1a2e] transition-colors"
                  >
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 bg-transparent border-none text-[#C62A2A] text-sm text-left cursor-pointer hover:bg-[#1a1a2e] transition-colors"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-[#e0e0e0] no-underline text-sm tracking-wide hover:text-white transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="bg-[#E8C547] text-[#0D0D0F] no-underline text-sm px-4 py-1.5 rounded font-semibold hover:opacity-90 transition-opacity"
            >
              {t("nav.register")}
            </Link>
          </>
        )}
        <LanguageSwitcher />
      </div>

      {/* Mobil: hamburger butonu */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 bg-transparent border-none cursor-pointer"
        aria-label="Menü"
      >
        <span
          className={`block w-6 h-0.5 bg-[#e0e0e0] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-[#e0e0e0] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block w-6 h-0.5 bg-[#e0e0e0] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
        />
      </button>

      {/* Mobil: açılır menü */}
      {menuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-[#0D0D0F] border-b border-[#1a1a2e] z-[150] px-4 py-4 flex flex-col gap-4">
          {/* Arama */}
          <form onSubmit={handleSearch} className="w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("movies.search_placeholder")}
              className="w-full bg-[#111118] border border-[#2a2a3e] rounded px-4 py-2 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors box-border"
            />
          </form>

          {/* Linkler */}
          <Link
            to="/movies"
            onClick={() => setMenuOpen(false)}
            className="text-[#e0e0e0] no-underline text-sm tracking-wide py-2 border-b border-[#1a1a2e]"
          >
            {t("nav.movies")}
          </Link>

          {token ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="text-[#C62A2A] no-underline text-sm tracking-wide py-2 border-b border-[#1a1a2e]"
                >
                  {t("nav.admin")}
                </Link>
              )}
              <Link
                to={`/profile/${user?.id}`}
                onClick={() => setMenuOpen(false)}
                className="text-[#e0e0e0] no-underline text-sm py-2 border-b border-[#1a1a2e]"
              >
                {t("nav.profile")}
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="text-[#e0e0e0] no-underline text-sm py-2 border-b border-[#1a1a2e]"
              >
                {t("nav.settings")}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-transparent border-none text-[#C62A2A] text-sm text-left cursor-pointer py-2"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-[#e0e0e0] no-underline text-sm py-2 border-b border-[#1a1a2e]"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-[#E8C547] text-[#0D0D0F] no-underline text-sm px-4 py-2 rounded font-semibold text-center"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
          <div className="pt-1">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
