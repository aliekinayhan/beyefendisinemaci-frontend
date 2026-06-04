import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieById } from "../api/movies";
import { getCommentsByMovie, addComment, deleteComment } from "../api/comments";
import { useAuth } from "../context/AuthContext";
import DefaultAvatar from "../components/DefaultAvatar";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { token, user, isAdmin } = useAuth();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [shortVideoOpen, setShortVideoOpen] = useState(false);

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

  if (loading)
    return (
      <div
        style={{
          background: "#0D0D0F",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#666" }}>Yükleniyor...</p>
      </div>
    );

  if (!movie)
    return (
      <div
        style={{
          background: "#0D0D0F",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#666" }}>Film bulunamadı.</p>
      </div>
    );

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginBottom: "3rem",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              width: "240px",
              height: "360px",
            }}
          >
            <img
              src={
                movie.posterUrl ||
                "https://via.placeholder.com/300x450?text=Poster+Yok"
              }
              alt={movie.title}
              style={{
                width: "240px",
                height: "360px",
                borderRadius: "8px",
                display: "block",
                objectFit: "cover",
              }}
            />
            {movie.shortVideoUrl && (
              <div
                onClick={() => setShortVideoOpen(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "rgba(232, 197, 71, 0.15)",
                    border: "2px solid #E8C547",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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

          <div style={{ flex: 1, minWidth: "200px" }}>
            <h1
              style={{
                color: "#E8C547",
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                margin: "0 0 0.5rem",
              }}
            >
              {movie.title}
            </h1>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              {movie.genre} {movie.releaseYear && `· ${movie.releaseYear}`}
            </p>
            <p style={{ color: "#ccc", lineHeight: 1.7, fontSize: "0.95rem" }}>
              {movie.review}
            </p>
          </div>
        </div>

        {shortVideoOpen && (
          <div
            onClick={() => setShortVideoOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <video
              src={movie.shortVideoUrl}
              controls
              autoPlay
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: "8px",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {movie.videoUrl && (
          <div style={{ marginBottom: "3rem" }}>
            <h2
              style={{
                color: "#E8C547",
                fontFamily: "'Playfair Display', serif",
                marginBottom: "1rem",
              }}
            >
              İnceleme Videosu
            </h2>
            <video
              src={movie.videoUrl}
              controls
              style={{ width: "100%", borderRadius: "8px", background: "#000" }}
            />
          </div>
        )}

        <div>
          <h2
            style={{
              color: "#E8C547",
              fontFamily: "'Playfair Display', serif",
              marginBottom: "1.5rem",
            }}
          >
            Yorumlar
          </h2>

          {token && (
            <form onSubmit={handleAddComment} style={{ marginBottom: "2rem" }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                rows={3}
                style={{
                  width: "100%",
                  background: "#111118",
                  border: "1px solid #2a2a3e",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  color: "#e0e0e0",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#E8C547",
                  color: "#0D0D0F",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.6rem 1.5rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                Yorum Yap
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p style={{ color: "#666" }}>Henüz yorum yok.</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: "#111118",
                    border: "1px solid #1a1a2e",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Link
                        to={`/profile/${comment.userId}`}
                        style={{ flexShrink: 0 }}
                      >
                        {comment.userProfilePhoto ? (
                          <img
                            src={comment.userProfilePhoto}
                            alt={comment.username}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #2a2a3e",
                              cursor: "pointer",
                            }}
                          />
                        ) : (
                          <DefaultAvatar size={36} />
                        )}
                      </Link>
                      <span
                        style={{
                          color: "#E8C547",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {comment.username}
                      </span>
                    </div>
                    {token &&
                      (isAdmin || user?.id === comment.userId?.toString()) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#C62A2A",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          Sil
                        </button>
                      )}
                  </div>
                  <p
                    style={{
                      color: "#ccc",
                      fontSize: "0.9rem",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
