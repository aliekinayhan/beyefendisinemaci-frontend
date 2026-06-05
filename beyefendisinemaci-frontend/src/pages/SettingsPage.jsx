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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      showToast(t("settings.profile_photo_updated"));
    } catch (err) {
      showToast(t("settings.photo_failed"), "error");
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
      showToast(t("settings.cover_photo_updated"));
    } catch (err) {
      showToast(t("settings.photo_failed"), "error");
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
      showToast(t("settings.profile_updated"));
    } catch (err) {
      showToast(
        err.response?.data?.message || t("settings.update_failed"),
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
      showToast(t("settings.password_updated"));
    } catch (err) {
      showToast(
        err.response?.data?.message || t("settings.password_failed"),
        "error",
      );
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm(t("settings.confirm_delete"))) return;
    try {
      await deleteAccount({ password: deleteForm.password });
      logoutUser();
      navigate("/");
    } catch (err) {
      showToast(
        err.response?.data?.message || t("settings.account_delete_failed"),
        "error",
      );
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
        <p style={{ color: "#666" }}>{t("settings.loading")}</p>
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
          {t("settings.title")}
        </h1>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>{t("settings.photos")}</h2>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <p style={labelStyle}>{t("settings.profile_photo")}</p>
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
                  {t("settings.change")}
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
              <p style={labelStyle}>{t("settings.cover_photo")}</p>
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
                  {t("settings.change")}
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

        <div style={cardStyle}>
          <h2 style={sectionTitle}>{t("settings.profile_info")}</h2>
          <form
            onSubmit={handleProfileUpdate}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>{t("settings.username")}</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t("settings.first_name")}</label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t("settings.last_name")}</label>
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
              {saving ? t("settings.saving") : t("settings.save")}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>{t("settings.change_password")}</h2>
          <form
            onSubmit={handlePasswordChange}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>{t("settings.current_password")}</label>
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
              <label style={labelStyle}>{t("settings.new_password")}</label>
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
              {t("settings.update_password")}
            </button>
          </form>
        </div>

        <div style={{ ...cardStyle, borderColor: "#3a1010" }}>
          <h2 style={{ ...sectionTitle, color: "#C62A2A" }}>
            {t("settings.delete_account")}
          </h2>
          <p
            style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}
          >
            {t("settings.delete_warning")}
          </p>
          <form
            onSubmit={handleDeleteAccount}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={labelStyle}>{t("settings.enter_password")}</label>
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
              {t("settings.delete_btn")}
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
