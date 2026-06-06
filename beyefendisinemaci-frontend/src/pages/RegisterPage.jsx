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
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-8">
      <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-10 w-full max-w-md">
        <h1 className="text-[#E8C547] font-serif text-3xl mb-2 text-center">
          {t("auth.register_title")}
        </h1>
        <p className="text-[#666] text-center mb-8 text-sm">
          {t("auth.have_account")}{" "}
          <Link
            to="/login"
            className="text-[#E8C547] no-underline hover:underline"
          >
            {t("auth.login_link")}
          </Link>
        </p>

        {error && (
          <div className="bg-[#2a1010] border border-[#C62A2A] rounded p-3 text-[#ff6b6b] mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[#aaa] text-sm mb-1">
              {t("auth.username")}
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder={t("auth.username_placeholder")}
              className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[#aaa] text-sm mb-1">
                {t("auth.first_name")}
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder={t("auth.first_name_placeholder")}
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#aaa] text-sm mb-1">
                {t("auth.last_name")}
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder={t("auth.last_name_placeholder")}
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#aaa] text-sm mb-1">
              {t("auth.email")}
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t("auth.email_placeholder")}
              className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#aaa] text-sm mb-1">
              {t("auth.password")}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#aaa] text-sm mb-1">
              {t("auth.confirm_password")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={`w-full bg-[#0D0D0F] border rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none transition-colors ${
                confirmPassword && form.password !== confirmPassword
                  ? "border-[#C62A2A]"
                  : "border-[#2a2a3e] focus:border-[#E8C547]"
              }`}
            />
            {confirmPassword && form.password !== confirmPassword && (
              <p className="text-[#C62A2A] text-xs mt-1">
                {t("auth.passwords_not_match")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#E8C547] text-[#0D0D0F] border-none rounded py-3 font-bold text-base mt-2 transition-opacity ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "cursor-pointer hover:opacity-90"
            }`}
          >
            {loading ? t("auth.registering") : t("auth.register_btn")}
          </button>
        </form>
      </div>
    </div>
  );
}
