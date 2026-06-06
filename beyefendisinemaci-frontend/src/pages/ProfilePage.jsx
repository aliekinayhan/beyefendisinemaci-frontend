import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile } from "../api/users";
import {
  getMyWatchlist,
  getUserWatchlist,
  removeFromWatchlist,
} from "../api/watchlist";
import { getCommentsByUser, deleteComment } from "../api/comments";
import { useAuth } from "../context/AuthContext";
import DefaultAvatar from "../components/DefaultAvatar";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { id } = useParams();
  const { user, isAdmin, removeFromWatchlistContext } = useAuth();
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watchlist");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const { t, i18n } = useTranslation();

  const isOwner = user?.id === id;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await getUserProfile(id);
        setProfile(res.data);
        const wl = isOwner
          ? await getMyWatchlist({ page: 0, size: 20 })
          : await getUserWatchlist(id, { page: 0, size: 20 });
        setWatchlist(wl.data.content);
        const cm = await getCommentsByUser(id, { page: 0, size: 20 });
        setComments(cm.data.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlist(watchlist.filter((w) => w.movieId !== movieId));
      removeFromWatchlistContext(movieId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="bg-[#0D0D0F] min-h-screen flex items-center justify-center">
        <p className="text-[#666]">{t("profile.loading")}</p>
      </div>
    );

  if (!profile)
    return (
      <div className="bg-[#0D0D0F] min-h-screen flex items-center justify-center">
        <p className="text-[#666]">{t("profile.not_found")}</p>
      </div>
    );

  return (
    <div className="bg-[#0D0D0F] min-h-screen">
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] cursor-pointer"
        >
          <img
            src={previewPhoto}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="bg-[#0D0D0F] pt-8 px-4 sm:px-8">
        <div
          onClick={() =>
            profile.coverPhoto && setPreviewPhoto(profile.coverPhoto)
          }
          className={`max-w-4xl mx-auto h-36 sm:h-48 rounded-xl overflow-hidden bg-[#1a1a2e] ${profile.coverPhoto ? "cursor-pointer" : "cursor-default"}`}
        >
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt="kapak"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "repeating-linear-gradient(135deg, #1a1a2e 0px, #1a1a2e 20px, #1e1e35 20px, #1e1e35 40px)",
              }}
            />
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
          <div
            onClick={() =>
              profile.profilePhoto && setPreviewPhoto(profile.profilePhoto)
            }
            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0D0D0F] overflow-hidden flex-shrink-0 ${profile.profilePhoto ? "cursor-pointer" : "cursor-default"}`}
          >
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultAvatar size={128} />
            )}
          </div>
          {isOwner && (
            <Link
              to="/settings"
              className="text-[#E8C547] border border-[#E8C547] rounded px-4 py-1.5 text-sm no-underline self-end mb-1 hover:bg-[#E8C547]/10 transition-colors"
            >
              {t("profile.edit_profile")}
            </Link>
          )}
        </div>

        <h1 className="text-[#e0e0e0] text-2xl font-serif mb-6">
          {profile.username}
        </h1>

        <div className="flex border-b border-[#1a1a2e] mb-8">
          {["watchlist", "comments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`bg-transparent border-none px-6 py-3 cursor-pointer text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#E8C547] border-b-2 border-[#E8C547]"
                  : "text-[#666] border-b-2 border-transparent hover:text-[#999]"
              }`}
            >
              {tab === "watchlist"
                ? t("profile.watchlist_tab")
                : t("profile.comments_tab")}
            </button>
          ))}
        </div>

        {activeTab === "watchlist" && (
          <div>
            {watchlist.length === 0 ? (
              <p className="text-[#666]">{t("profile.watchlist_empty")}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-8 items-start">
                {watchlist.map((item) => (
                  <div key={item.movieId} className="relative">
                    <Link
                      to={`/movies/${item.movieId}`}
                      className="no-underline"
                    >
                      <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg overflow-hidden hover:border-[#E8C547] transition-colors">
                        <div
                          className="relative overflow-hidden"
                          style={{ paddingBottom: "150%" }}
                        >
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.movieTitle}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[#1a1a2e]" />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[#e0e0e0] text-sm m-0 truncate">
                            {item.movieTitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveFromWatchlist(item.movieId)}
                        className="absolute top-1.5 right-1.5 bg-red-700/80 border-none rounded text-white text-xs px-2 py-0.5 cursor-pointer"
                      >
                        {t("profile.remove")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="flex flex-col gap-4 pb-8">
            {comments.length === 0 ? (
              <p className="text-[#666]">{t("profile.comments_empty")}</p>
            ) : (
              comments.map((comment) => (
                <Link
                  key={comment.id}
                  to={`/movies/${comment.movieId}`}
                  className="no-underline"
                >
                  <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 flex gap-4 items-start hover:border-[#2a2a3e] transition-colors">
                    {comment.moviePosterUrl ? (
                      <img
                        src={comment.moviePosterUrl}
                        alt={comment.movieTitle}
                        className="w-12 h-[72px] object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-[72px] bg-[#1a1a2e] rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <p className="text-[#E8C547] text-sm font-semibold m-0 mb-0.5">
                            {comment.movieTitle}
                          </p>
                          <p className="text-[#555] text-xs m-0">
                            {new Date(comment.createdAt).toLocaleDateString(
                              i18n.language === "tr" ? "tr-TR" : "en-US",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        {(isOwner || isAdmin) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteComment(comment.id);
                            }}
                            className="bg-transparent border-none text-[#C62A2A] cursor-pointer text-xs flex-shrink-0"
                          >
                            {t("profile.delete_comment")}
                          </button>
                        )}
                      </div>
                      <p className="text-[#ccc] text-sm m-0 leading-relaxed line-clamp-3">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
