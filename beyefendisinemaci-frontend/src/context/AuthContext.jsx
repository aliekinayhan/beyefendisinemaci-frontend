import { createContext, useContext, useState, useEffect } from "react";
import { getMyProfile } from "../api/users";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token && !user) {
      getMyProfile()
        .then((res) => setUser(res.data))
        .catch(() => {});
    }
  }, [token]);

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
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ token, user, setUser, loginUser, logoutUser, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
