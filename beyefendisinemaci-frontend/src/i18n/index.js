import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        movies: "Movies",
        login: "Login",
        register: "Register",
        logout: "Logout",
        profile: "Profile",
        admin: "Admin Panel",
        settings: "Settings",
      },
      common: {
        loading: "Loading...",
        error: "Something went wrong.",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        search: "Search",
        see_all: "See All",
      },
    },
  },
  tr: {
    translation: {
      nav: {
        home: "Ana Sayfa",
        movies: "Filmler",
        login: "Giriş Yap",
        register: "Kayıt Ol",
        logout: "Çıkış Yap",
        profile: "Profil",
        admin: "Admin Paneli",
        settings: "Ayarlar",
      },
      common: {
        loading: "Yükleniyor...",
        error: "Bir şeyler ters gitti.",
        save: "Kaydet",
        cancel: "İptal",
        delete: "Sil",
        edit: "Düzenle",
        search: "Ara",
        see_all: "Tümünü Gör",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
