import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToWatchlist, removeFromWatchlist } from "../api/watchlist";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function MovieCard({ movie }) {
  const { token } = useAuth();
  const [added, setAdded] = useState(false);
  const { t } = useTranslation();

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
    <Link to={`/movies/${movie.id}`} className="no-underline">
      <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg overflow-hidden cursor-pointer transition-colors hover:border-[#E8C547] relative">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={
              movie.posterUrl ||
              "https://via.placeholder.com/300x450?text=Poster+Yok"
            }
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {token && (
            <button
              onClick={handleWatchlist}
              className={`absolute top-2 right-2 border border-[#E8C547] rounded px-2 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                added
                  ? "bg-[#E8C547] text-[#0D0D0F]"
                  : "bg-black/70 text-[#E8C547] hover:bg-[#E8C547] hover:text-[#0D0D0F]"
              }`}
            >
              {added ? t("movie.in_list") : t("movie.add_list")}
            </button>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-[#e0e0e0] text-sm font-semibold m-0 truncate">
            {movie.title}
          </h3>
          {movie.releaseYear && (
            <p className="text-[#666] text-xs mt-1 m-0">{movie.releaseYear}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
