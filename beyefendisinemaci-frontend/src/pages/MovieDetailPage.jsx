import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieById } from "../api/movies";
import {
  getCommentsByMovie,
  addComment,
  deleteComment,
  updateComment,
} from "../api/comments";
import { useAuth } from "../context/AuthContext";
import DefaultAvatar from "../components/DefaultAvatar";
import { useTranslation } from "react-i18next";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { token, user, isAdmin } = useAuth();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [shortVideoOpen, setShortVideoOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await getMovieById(id);
        setMovie(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getCommentsByMovie(id, { page: 0, size: 20 });
        setComments(res.data.content);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await addComment(id, { content: commentText });
      setComments([res.data, ...comments]);
      setCommentText("");
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

  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleEditSave = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      const res = await updateComment(commentId, { content: editingContent });
      setComments(comments.map((c) => (c.id === commentId ? res.data : c)));
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="bg-[#0D0D0F] min-h-screen flex items-center justify-center">
        <p className="text-[#666]">{t("movie.loading")}</p>
      </div>
    );

  if (!movie)
    return (
      <div className="bg-[#0D0D0F] min-h-screen flex items-center justify-center">
        <p className="text-[#666]">{t("movie.not_found")}</p>
      </div>
    );

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-8 mb-12 flex-wrap items-start">
          <div className="relative flex-shrink-0 w-48 sm:w-60 h-72 sm:h-[360px]">
            <img
              src={
                movie.posterUrl ||
                "https://via.placeholder.com/300x450?text=Poster+Yok"
              }
              alt={movie.title}
              className="w-full h-full rounded-lg object-cover block"
            />
            {movie.shortVideoUrl && (
              <div
                onClick={() => setShortVideoOpen(true)}
                className="absolute inset-0 bg-black/35 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8C547]/15 border-2 border-[#E8C547] flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#E8C547"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <h1 className="text-[#E8C547] font-serif text-3xl sm:text-4xl mb-1">
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-[#888] text-sm italic mb-2">
                {movie.originalTitle}
              </p>
            )}
            <p className="text-[#666] text-sm mb-6">
              {movie.genre} {movie.releaseYear && `· ${movie.releaseYear}`}
            </p>
            <p className="text-[#ccc] leading-7 text-sm whitespace-pre-wrap">
              {movie.review}
            </p>
          </div>
        </div>

        {shortVideoOpen && (
          <div
            onClick={() => setShortVideoOpen(false)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999]"
          >
            <video
              src={movie.shortVideoUrl}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[80vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {movie.videoUrl && (
          <div className="mb-12">
            <h2 className="text-[#E8C547] font-serif text-xl mb-4">
              {t("movie.review_video")}
            </h2>
            <video
              src={movie.videoUrl}
              controls
              className="w-full rounded-lg bg-black"
            />
          </div>
        )}

        <div>
          <h2 className="text-[#E8C547] font-serif text-xl mb-6">
            {t("movie.comments")}
          </h2>

          {token && (
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("movie.comment_placeholder")}
                rows={3}
                className="w-full bg-[#111118] border border-[#2a2a3e] rounded px-3 py-3 text-[#e0e0e0] text-sm outline-none resize-y focus:border-[#E8C547] transition-colors box-border"
              />
              <button
                type="submit"
                className="bg-[#E8C547] text-[#0D0D0F] border-none rounded px-6 py-2.5 font-bold cursor-pointer mt-2 hover:opacity-90 transition-opacity"
              >
                {t("movie.comment_btn")}
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-[#666]">{t("movie.no_comments")}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/profile/${comment.userId}`}
                      className="flex items-center gap-3 mb-2 no-underline"
                    >
                      {comment.userProfilePhoto ? (
                        <img
                          src={comment.userProfilePhoto}
                          alt={comment.username}
                          className="w-9 h-9 rounded-full object-cover border border-[#2a2a3e] flex-shrink-0"
                        />
                      ) : (
                        <DefaultAvatar size={36} />
                      )}
                      <div>
                        <span className="text-[#E8C547] text-sm font-semibold block">
                          {comment.username}
                        </span>
                        {comment.createdAt && (
                          <span className="text-[#555] text-xs">
                            {new Date(comment.createdAt).toLocaleDateString(
                              i18n.language === "tr" ? "tr-TR" : "en-US",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      {token && user?.id === comment.userId?.toString() && (
                        <button
                          onClick={() => handleEditStart(comment)}
                          className="bg-transparent border-none text-[#E8C547] cursor-pointer text-xs"
                        >
                          {t("movie.edit_comment")}
                        </button>
                      )}
                      {token &&
                        (isAdmin ||
                          user?.id === comment.userId?.toString()) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="bg-transparent border-none text-[#C62A2A] cursor-pointer text-xs"
                          >
                            {t("movie.delete_comment")}
                          </button>
                        )}
                    </div>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2 text-[#e0e0e0] text-sm outline-none resize-y focus:border-[#E8C547] transition-colors box-border mt-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditSave(comment.id)}
                          className="bg-[#E8C547] text-[#0D0D0F] border-none rounded px-4 py-1.5 text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {t("common.save")}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="bg-transparent border border-[#333] text-[#666] rounded px-4 py-1.5 text-xs cursor-pointer"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#ccc] text-sm m-0 leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
