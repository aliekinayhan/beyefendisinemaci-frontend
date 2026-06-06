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
    <nav className="bg-[#0D0D0F] border-b border-[#1a1a2e] px-8 h-16 flex items-center justify-between sticky top-0 z-[100]">
      <Link
        to="/"
        className="text-[#E8C547] font-serif text-xl font-bold no-underline tracking-wider flex-shrink-0"
      >
        Beyefendi Sinemacı
      </Link>

      {/* Arama */}
      <form
        onSubmit={handleSearch}
        className="relative flex-shrink-0 w-64 mx-4"
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
          className="w-full bg-[#111118] border border-[#2a2a3e] rounded px-4 py-1.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors box-border"
        />
        {showTrending && trending.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-[#111118] border border-[#2a2a3e] rounded mt-1 z-[200]">
            <p className="text-[#666] text-xs px-4 pt-2 pb-1 m-0">
              En çok arananlar
            </p>
            {trending.map((term, i) => (
              <div
                key={i}
                onMouseDown={() => handleTrendingClick(term)}
                className="px-4 py-2 text-[#e0e0e0] text-sm cursor-pointer hover:bg-[#1a1a2e] transition-colors"
              >
                🔥 {term}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Sağ menü */}
      <div className="flex items-center gap-6">
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
    </nav>
  );
}
