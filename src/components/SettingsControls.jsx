import { useSettings } from "../context/SettingsContext";

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function SettingsControls({ compact = false }) {
  const { theme, toggleTheme, toggleLang, t } = useSettings();
  const dark = theme === "dark";

  return (
    <>
      <button
        type="button"
        onClick={toggleLang}
        aria-label={t("switchLangAria")}
        className={`cursor-pointer rounded-full border border-line bg-surface font-medium text-ink transition-all hover:bg-field active:scale-[0.97] ${
          compact ? "h-8 px-3 text-xs" : "h-9 px-4 text-[13px]"
        }`}
      >
        {t("switchLang")}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? t("toLight") : t("toDark")}
        className={`flex cursor-pointer items-center justify-center border border-line bg-surface text-muted transition-all hover:bg-field active:scale-[0.97] ${
          compact ? "size-8 rounded-[10px]" : "size-9 rounded-xl"
        }`}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    </>
  );
}
