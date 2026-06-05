import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const toggle = () => {
    i18n.changeLanguage(isEN ? "tr" : "en");
  };

  return <button onClick={toggle}>{isEN ? "🇹🇷 TR" : "🇬🇧 EN"}</button>;
}
