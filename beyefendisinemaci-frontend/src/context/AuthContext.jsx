import { createContext, useContext, useState, useEffect } from "react";
import { getMyProfile } from "../api/users";
import { getMyWatchlist } from "../api/watchlist";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState([]);

  useEffect(() => {
    if (token && !user) {
      getMyProfile()
        .then((res) => setUser(res.data))
        .catch(() => {});
      fetchWatchlist();
    }
  }, [token]);

  const fetchWatchlist = async () => {
    try {
      const res = await getMyWatchlist({ page: 0, size: 100 });
      const ids = res.data.content.map((item) => item.movieId);
      setWatchlistIds(ids);
    } catch (err) {
      setWatchlistIds([]);
    }
  };

  const loginUser = async (authResponse) => {
    localStorage.setItem("token", authResponse.accessToken);
    localStorage.setItem("refreshToken", authResponse.refreshToken);
    setToken(authResponse.accessToken);
    try {
      const res = await getMyProfile();
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
    await fetchWatchlist();
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    setWatchlistIds([]);
  };

  const addToWatchlistContext = (movieId) => {
    setWatchlistIds((prev) => [...prev, movieId]);
  };

  const removeFromWatchlistContext = (movieId) => {
    setWatchlistIds((prev) => prev.filter((id) => id !== movieId));
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        loginUser,
        logoutUser,
        isAdmin,
        watchlistIds,
        addToWatchlistContext,
        removeFromWatchlistContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
