import { useState, useEffect, useRef } from "react";
import { getMovies, searchMovies, getTrendingSearches } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function MoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [trending, setTrending] = useState([]);
  const [showTrending, setShowTrending] = useState(false);
  const { t } = useTranslation();
  const inputRef = useRef(null);

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

  const fetchTrending = async () => {
    try {
      const res = await getTrendingSearches();
      setTrending(res.data || []);
    } catch (err) {
      console.error(err);
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
    setShowTrending(false);
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

  const handleFocus = () => {
    fetchTrending();
    setShowTrending(true);
  };

  const handleBlur = () => {
    // Biraz bekle, tıklama eventi önce çalışsın
    setTimeout(() => setShowTrending(false), 150);
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    setShowTrending(false);
    searchMovies(term).then((res) => {
      setMovies(res.data || []);
      setSearching(true);
      setTotalPages(0);
    });
  };

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[#E8C547] font-serif text-3xl mb-8">
          {t("movies.title")}
        </h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) {
                  setSearching(false);
                  fetchMovies(0);
                }
                setShowTrending(false);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={t("movies.search_placeholder")}
              className="w-full bg-[#111118] border border-[#2a2a3e] rounded px-4 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
            />
            {showTrending && trending.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-[#111118] border border-[#2a2a3e] rounded mt-1 z-10">
                <p className="text-[#666] text-xs px-4 pt-3 pb-1">
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
          </div>
          <button
            type="submit"
            className="bg-[#E8C547] text-[#0D0D0F] border-none rounded px-6 py-2.5 font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {t("movies.search_btn")}
          </button>
        </form>

        {loading ? (
          <div className="text-[#666] text-center py-16">
            {t("movies.loading")}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-[#666] text-center py-16">
            {t("movies.not_found")}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!searching && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`rounded px-4 py-2 font-semibold text-sm border-none transition-opacity ${
                page === 0
                  ? "bg-[#1a1a2e] text-[#444] cursor-not-allowed"
                  : "bg-[#E8C547] text-[#0D0D0F] cursor-pointer hover:opacity-90"
              }`}
            >
              {t("movies.prev")}
            </button>
            <span className="text-[#666] px-4 py-2 text-sm">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className={`rounded px-4 py-2 font-semibold text-sm border-none transition-opacity ${
                page === totalPages - 1
                  ? "bg-[#1a1a2e] text-[#444] cursor-not-allowed"
                  : "bg-[#E8C547] text-[#0D0D0F] cursor-pointer hover:opacity-90"
              }`}
            >
              {t("movies.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
