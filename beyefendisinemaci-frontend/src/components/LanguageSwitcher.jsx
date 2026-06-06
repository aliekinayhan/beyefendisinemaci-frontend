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
      className="bg-transparent border border-[#444] rounded px-2.5 py-1 cursor-pointer text-[#e0e0e0] text-sm font-semibold tracking-wider hover:border-[#666] transition-colors"
    >
      {isEN ? "TR" : "EN"}
    </button>
  );
}
