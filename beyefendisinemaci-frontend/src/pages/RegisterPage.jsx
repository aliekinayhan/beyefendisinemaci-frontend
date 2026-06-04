import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await register(form);
      loginUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt başarısız");
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
          Kayıt Ol
        </h1>
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          Zaten hesabın var mı?{" "}
          <Link
            to="/login"
            style={{ color: "#E8C547", textDecoration: "none" }}
          >
            Giriş yap
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
            <label style={labelStyle}>Kullanıcı Adı *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="kullaniciadi"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ad</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Adın"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Soyad</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Soyadın"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>E-posta *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="ornek@mail.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Şifre *</label>
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
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
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
