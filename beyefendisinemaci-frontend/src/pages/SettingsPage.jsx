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
    confirmPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({ password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [previewPhoto, setPreviewPhoto] = useState(null);
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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast(t("settings.passwords_not_match"), "error");
      return;
    }
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
      <div className="bg-[#0D0D0F] min-h-screen flex items-center justify-center">
        <p className="text-[#666]">{t("settings.loading")}</p>
      </div>
    );

  return (
    <div className="bg-[#0D0D0F] min-h-screen p-4 sm:p-8">
      <Toast message={toast.message} type={toast.type} />

      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] cursor-pointer"
        >
          <img
            src={previewPhoto}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <h1 className="text-[#E8C547] font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
          {t("settings.title")}
        </h1>

        {/* Fotoğraflar */}
        <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
            {t("settings.photos")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div>
              <p className="text-[#aaa] text-sm mb-2">
                {t("settings.profile_photo")}
              </p>
              <div className="flex items-center gap-4">
                <div
                  onClick={() =>
                    profile?.profilePhoto &&
                    setPreviewPhoto(profile.profilePhoto)
                  }
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 border-[#2a2a3e] ${profile?.profilePhoto ? "cursor-pointer" : "cursor-default"}`}
                >
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar size={64} />
                  )}
                </div>
                <label className="bg-transparent border border-[#2a2a3e] rounded px-3 py-1.5 text-[#e0e0e0] text-sm cursor-pointer hover:border-[#444] transition-colors min-h-[44px] flex items-center">
                  {t("settings.change")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div>
              <p className="text-[#aaa] text-sm mb-2">
                {t("settings.cover_photo")}
              </p>
              <div className="flex items-center gap-4">
                <div
                  onClick={() =>
                    profile?.coverPhoto && setPreviewPhoto(profile.coverPhoto)
                  }
                  className={`w-28 h-10 rounded overflow-hidden border-2 border-[#2a2a3e] ${profile?.coverPhoto ? "cursor-pointer" : "cursor-default"}`}
                >
                  {profile?.coverPhoto ? (
                    <img
                      src={profile.coverPhoto}
                      alt="kapak"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a2e]" />
                  )}
                </div>
                <label className="bg-transparent border border-[#2a2a3e] rounded px-3 py-1.5 text-[#e0e0e0] text-sm cursor-pointer hover:border-[#444] transition-colors min-h-[44px] flex items-center">
                  {t("settings.change")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Profil Bilgileri */}
        <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
            {t("settings.profile_info")}
          </h2>
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#aaa] text-sm mb-1">
                {t("settings.username")}
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[#aaa] text-sm mb-1">
                  {t("settings.first_name")}
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[#aaa] text-sm mb-1">
                  {t("settings.last_name")}
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className={`bg-[#E8C547] text-[#0D0D0F] border-none rounded py-3 font-bold cursor-pointer transition-opacity ${saving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
            >
              {saving ? t("settings.saving") : t("settings.save")}
            </button>
          </form>
        </div>

        {/* Şifre Değiştir */}
        <div className="bg-[#111118] border border-[#1a1a2e] rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-[#e0e0e0] text-base font-semibold mb-5">
            {t("settings.change_password")}
          </h2>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#aaa] text-sm mb-1">
                {t("settings.current_password")}
              </label>
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
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#aaa] text-sm mb-1">
                {t("settings.new_password")}
              </label>
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
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#E8C547] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#aaa] text-sm mb-1">
                {t("settings.confirm_new_password")}
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className={`w-full bg-[#0D0D0F] border rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none transition-colors ${
                  passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword
                    ? "border-[#C62A2A]"
                    : "border-[#2a2a3e] focus:border-[#E8C547]"
                }`}
              />
              {passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-[#C62A2A] text-xs mt-1">
                    {t("settings.passwords_not_match")}
                  </p>
                )}
            </div>
            <button
              type="submit"
              className="bg-[#E8C547] text-[#0D0D0F] border-none rounded py-3 font-bold cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t("settings.update_password")}
            </button>
          </form>
        </div>

        {/* Hesabı Sil */}
        <div className="bg-[#111118] border border-[#3a1010] rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-[#C62A2A] text-base font-semibold mb-5">
            {t("settings.delete_account")}
          </h2>
          <p className="text-[#666] text-sm mb-4">
            {t("settings.delete_warning")}
          </p>
          <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#aaa] text-sm mb-1">
                {t("settings.enter_password")}
              </label>
              <input
                type="password"
                value={deleteForm.password}
                onChange={(e) => setDeleteForm({ password: e.target.value })}
                required
                className="w-full bg-[#0D0D0F] border border-[#2a2a3e] rounded px-3 py-2.5 text-[#e0e0e0] text-sm outline-none focus:border-[#C62A2A] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#C62A2A] text-white border-none rounded py-3 font-bold cursor-pointer hover:opacity-90 transition-opacity"
            >
              {t("settings.delete_btn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
