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
      .then((res) => setMovies(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-[#E8C547] font-serif text-4xl sm:text-5xl mb-2 tracking-wider">
            Beyefendi Sinemacı
          </h1>
          <p className="text-[#666] text-base m-0">{t("home.subtitle")}</p>
        </div>

        {/* Son Eklenenler */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#e0e0e0] font-serif text-xl m-0">
            {t("home.recent")}
          </h2>
          <Link
            to="/movies"
            className="text-[#E8C547] text-sm border border-[#E8C547] px-3 py-1.5 rounded no-underline hover:bg-[#E8C547]/10 transition-colors"
          >
            {t("home.all_movies")}
          </Link>
        </div>

        {loading ? (
          <div className="text-[#666] text-center py-16">
            {t("home.loading")}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-[#666] text-center py-16">
            {t("home.no_movies")}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
