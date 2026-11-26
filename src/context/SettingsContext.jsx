import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translations } from "../i18n";

const SettingsContext = createContext(null);
const THEME_KEY = "mindsync_theme";
const LANG_KEY = "mindsync_lang";

function readStored(key, allowed, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored(THEME_KEY, ["light", "dark"], "light"));
  const [lang, setLang] = useState(() => readStored(LANG_KEY, ["en", "ar"], "en"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const text = translations[lang][key] ?? translations.en[key] ?? key;
      return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : text;
    },
    [lang]
  );

  // Picks the singular/plural key for a count.
  const tn = useCallback(
    (oneKey, manyKey, n, vars) => t(n === 1 ? oneKey : manyKey, { n, ...vars }),
    [t]
  );

  const value = {
    theme,
    lang,
    t,
    tn,
    toggleTheme: () => setTheme((v) => (v === "dark" ? "light" : "dark")),
    toggleLang: () => setLang((v) => (v === "ar" ? "en" : "ar")),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
