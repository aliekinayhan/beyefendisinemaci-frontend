import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../api/users";
import { uploadProfilePhoto, uploadCoverPhoto } from "../api/s3";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import DefaultAvatar from "../components/DefaultAvatar";

export default function SettingsPage() {
  const { user, setUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({ password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(res.data);
        setForm({
          username: res.data.username || "",
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "success" }), 3000);
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadRes = await uploadProfilePhoto(file);
      const url = uploadRes.data;
      await updateProfile({
        username: profile.username,
        profilePhoto: url,
        coverPhoto: profile.coverPhoto,
      });
      setProfile({ ...profile, profilePhoto: url });
      showToast("Profil fotoğrafı güncellendi.");
    } catch (err) {
      showToast("Fotoğraf yüklenemedi.", "error");
    }
  };

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadRes = await uploadCoverPhoto(file);
      const url = uploadRes.data;
      await updateProfile({
        username: profile.username,
        profilePhoto: profile.profilePhoto,
        coverPhoto: url,
      });
      setProfile({ ...profile, coverPhoto: url });
      showToast("Kapak fotoğrafı güncellendi.");
    } catch (err) {
      showToast("Fotoğraf yüklenemedi.", "error");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        profilePhoto: profile.profilePhoto,
        coverPhoto: profile.coverPhoto,
      });
      setProfile(res.data);
      setUser(res.data);
      showToast("Profil güncellendi.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Güncelleme başarısız.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      showToast("Şifre güncellendi.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Şifre değiştirilemedi.",
        "error",
      );
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm("Hesabını silmek istediğine emin misin?")) return;
    try {
      await deleteAccount({ password: deleteForm.password });
      logoutUser();
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Hesap silinemedi.", "error");
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

  return (
    <div style={{ background: "#0D0D0F", minHeight: "100vh", padding: "2rem" }}>
      <Toast message={toast.message} type={toast.type} />
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#E8C547",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            marginBottom: "2rem",
          }}
        >
          Profil Ayarları
        </h1>

        {/* Fotoğraflar */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Fotoğraflar</h2>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <p style={labelStyle}>Profil Fotoğrafı</p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #2a2a3e",
                  }}
                >
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="profil"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <DefaultAvatar size={70} />
                  )}
                </div>
                <label style={uploadButtonStyle}>
                  Değiştir
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
            <div>
              <p style={labelStyle}>Kapak Fotoğrafı</p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "40px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "2px solid #2a2a3e",
                  }}
                >
                  {profile?.coverPhoto ? (
                    <img
                      src={profile.coverPhoto}
                      alt="kapak"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "#1a1a2e",
                      }}
                    />
                  )}
                </div>
                <label style={uploadButtonStyle}>
                  Değiştir
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Profil Bilgileri */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Profil Bilgileri</h2>
          <form
            onSubmit={handleProfileUpdate}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Kullanıcı Adı *</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ad</label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Soyad</label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" disabled={saving} style={saveButtonStyle}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>

        {/* Şifre Değiştir */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Şifre Değiştir</h2>
          <form
            onSubmit={handlePasswordChange}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Mevcut Şifre</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Yeni Şifre</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />
            </div>
            <button type="submit" style={saveButtonStyle}>
              Şifreyi Güncelle
            </button>
          </form>
        </div>

        {/* Hesabı Sil */}
        <div style={{ ...cardStyle, borderColor: "#3a1010" }}>
          <h2 style={{ ...sectionTitle, color: "#C62A2A" }}>Hesabı Sil</h2>
          <p
            style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}
          >
            Bu işlem geri alınamaz.
          </p>
          <form
            onSubmit={handleDeleteAccount}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>Şifrenizi Girin</label>
              <input
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm({ password: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              style={{
                background: "#C62A2A",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Hesabı Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#111118",
  border: "1px solid #1a1a2e",
  borderRadius: "8px",
  padding: "1.5rem",
  marginBottom: "1.5rem",
};
const sectionTitle = {
  color: "#e0e0e0",
  fontSize: "1rem",
  fontWeight: 600,
  margin: "0 0 1.25rem",
};
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
const saveButtonStyle = {
  background: "#E8C547",
  color: "#0D0D0F",
  border: "none",
  borderRadius: "4px",
  padding: "0.75rem",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.95rem",
};
const uploadButtonStyle = {
  background: "transparent",
  border: "1px solid #2a2a3e",
  borderRadius: "4px",
  padding: "0.4rem 0.8rem",
  color: "#e0e0e0",
  fontSize: "0.85rem",
  cursor: "pointer",
};
