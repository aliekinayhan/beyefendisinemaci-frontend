import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const toggle = () => {
    i18n.changeLanguage(isEN ? "tr" : "en");
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: "transparent",
        border: "1px solid #444",
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        color: "#e0e0e0",
        fontSize: "0.85rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}
    >
      {isEN ? "TR" : "EN"}
    </button>
  );
}
