import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (form.password !== confirmPassword) {
      setError(t("auth.passwords_not_match"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await register(form);
      loginUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.register_failed"));
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
        padding: "2rem",
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
          {t("auth.register_title")}
        </h1>
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          {t("auth.have_account")}{" "}
          <Link
            to="/login"
            style={{ color: "#E8C547", textDecoration: "none" }}
          >
            {t("auth.login_link")}
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("auth.first_name")}</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t("auth.first_name_placeholder")}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t("auth.last_name")}</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t("auth.last_name_placeholder")}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t("auth.email")}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder={t("auth.email_placeholder")}
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
          <div>
            <label style={labelStyle}>{t("auth.confirm_password")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                ...inputStyle,
                borderColor:
                  confirmPassword && form.password !== confirmPassword
                    ? "#C62A2A"
                    : "#2a2a3e",
              }}
              placeholder="••••••••"
            />
            {confirmPassword && form.password !== confirmPassword && (
              <p
                style={{
                  color: "#C62A2A",
                  fontSize: "0.8rem",
                  margin: "0.3rem 0 0",
                }}
              >
                {t("auth.passwords_not_match")}
              </p>
            )}
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
            {loading ? t("auth.registering") : t("auth.register_btn")}
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
