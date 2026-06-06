import { useState, useEffect } from "react";
import { getMovies, searchMovies } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function MoviesPage() {
  const { token } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

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

  const fetchSearch = async () => {
    setLoading(true);
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

  useEffect(() => {
    if (query) {
      fetchSearch();
    } else {
      fetchMovies(page);
    }
  }, [page, token, query]);

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[#E8C547] font-serif text-3xl mb-8">
          {query ? `"${query}" sonuçları` : t("movies.title")}
        </h1>

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

        {!query && totalPages > 1 && (
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
