import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(form);
      loginUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#111118",
          border: "1px solid #1a1a2e",
          borderRadius: "8px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            color: "#E8C547",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          {t("auth.login_title")}
        </h1>
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          {t("auth.no_account")}{" "}
          <Link
            to="/register"
            style={{ color: "#E8C547", textDecoration: "none" }}
          >
            {t("auth.register_link")}
          </Link>
        </p>

        {error && (
          <div
            style={{
              background: "#2a1010",
              border: "1px solid #C62A2A",
              borderRadius: "4px",
              padding: "0.75rem 1rem",
              color: "#ff6b6b",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label style={labelStyle}>{t("auth.username")}</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder={t("auth.username_placeholder")}
            />
          </div>
          <div>
            <label style={labelStyle}>{t("auth.password")}</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#E8C547",
              color: "#0D0D0F",
              border: "none",
              borderRadius: "4px",
              padding: "0.75rem",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t("auth.logging_in") : t("auth.login_btn")}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#aaa",
  fontSize: "0.85rem",
  marginBottom: "0.4rem",
};

const inputStyle = {
  width: "100%",
  background: "#0D0D0F",
  border: "1px solid #2a2a3e",
  borderRadius: "4px",
  padding: "0.65rem 0.75rem",
  color: "#e0e0e0",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};
