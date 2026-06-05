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

export default function ProfilePage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watchlist");

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

  if (!profile)
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
        <p style={{ color: "#666" }}>Kullanıcı bulunamadı.</p>
      </div>
    );

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh" }}>
      <div style={{ background: "#0D0D0F", padding: "2rem 2rem 0" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            height: "200px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#1a1a2e",
          }}
        >
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt="kapak"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "repeating-linear-gradient(135deg, #1a1a2e 0px, #1a1a2e 20px, #1e1e35 20px, #1e1e35 40px)",
              }}
            />
          )}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "-60px",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "4px solid #0D0D0F",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <DefaultAvatar size={120} />
            )}
          </div>
          {isOwner && (
            <Link
              to="/settings"
              style={{
                color: "#E8C547",
                border: "1px solid #E8C547",
                borderRadius: "4px",
                padding: "0.4rem 1rem",
                fontSize: "0.85rem",
                textDecoration: "none",
                alignSelf: "flex-end",
                marginBottom: "0.25rem",
              }}
            >
              Profili Düzenle
            </Link>
          )}
        </div>

        <h1
          style={{
            color: "#e0e0e0",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            margin: "0 0 1.5rem",
          }}
        >
          {profile.username}
        </h1>

        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #1a1a2e",
            marginBottom: "2rem",
          }}
        >
          {["watchlist", "comments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab
                    ? "2px solid #E8C547"
                    : "2px solid transparent",
                color: activeTab === tab ? "#E8C547" : "#666",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === "watchlist" ? "İzleme Listesi" : "Yorumlar"}
            </button>
          ))}
        </div>

        {activeTab === "watchlist" && (
          <div>
            {watchlist.length === 0 ? (
              <p style={{ color: "#666" }}>İzleme listesi boş.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "1.5rem",
                  paddingBottom: "2rem",
                }}
              >
                {watchlist.map((item) => (
                  <div key={item.movieId} style={{ position: "relative" }}>
                    <Link
                      to={`/movies/${item.movieId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          background: "#111118",
                          border: "1px solid #1a1a2e",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        {item.posterUrl ? (
                          <img
                            src={item.posterUrl}
                            alt={item.movieTitle}
                            style={{
                              width: "100%",
                              height: "225px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "225px",
                              background: "#1a1a2e",
                            }}
                          />
                        )}
                        <div style={{ padding: "0.5rem" }}>
                          <p
                            style={{
                              color: "#e0e0e0",
                              fontSize: "0.85rem",
                              margin: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.movieTitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveFromWatchlist(item.movieId)}
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "rgba(198,42,42,0.8)",
                          border: "none",
                          borderRadius: "4px",
                          color: "#fff",
                          fontSize: "0.7rem",
                          padding: "0.2rem 0.5rem",
                          cursor: "pointer",
                        }}
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              paddingBottom: "2rem",
            }}
          >
            {comments.length === 0 ? (
              <p style={{ color: "#666" }}>Henüz yorum yok.</p>
            ) : (
              comments.map((comment) => (
                <Link
                  key={comment.id}
                  to={`/movies/${comment.movieId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#111118",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    {comment.moviePosterUrl ? (
                      <img
                        src={comment.moviePosterUrl}
                        alt={comment.movieTitle}
                        style={{
                          width: "50px",
                          height: "75px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "75px",
                          background: "#1a1a2e",
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              color: "#E8C547",
                              fontSize: "0.85rem",
                              margin: "0 0 0.2rem",
                              fontWeight: 600,
                            }}
                          >
                            {comment.movieTitle}
                          </p>
                          <p
                            style={{
                              color: "#555",
                              fontSize: "0.75rem",
                              margin: 0,
                            }}
                          >
                            {new Date(comment.createdAt).toLocaleDateString(
                              "tr-TR",
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
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#C62A2A",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              flexShrink: 0,
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
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
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
