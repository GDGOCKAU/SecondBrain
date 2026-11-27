import { useEffect, useState } from "react";
import { isAdmin, unlockAdmin } from "../adminAuth";
import { useSettings } from "../context/SettingsContext";
import Header from "./Header";
import { ArrowIcon, CloseIcon } from "./Icons";
import { Glow, GoogleBar } from "./Ui";

// One password box. Calls onUnlock when the password is right.
function PasswordCard({ onUnlock, onClose }) {
  const { t } = useSettings();
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (unlockAdmin(password)) onUnlock();
    else setWrong(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="admin-title"
      className="relative flex w-full max-w-sm flex-col gap-4 rounded-card border border-line bg-surface p-8 shadow-hero"
    >
      {onClose && (
        <button
          type="button"
          aria-label={t("close")}
          onClick={onClose}
          className="absolute end-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-chip"
        >
          <CloseIcon />
        </button>
      )}
      <div className="flex gap-1.5" aria-hidden="true">
        <i className="size-1.5 rounded-full bg-g-blue" />
        <i className="size-1.5 rounded-full bg-g-red" />
        <i className="size-1.5 rounded-full bg-g-yellow" />
        <i className="size-1.5 rounded-full bg-g-green" />
      </div>
      <div>
        <h2 id="admin-title" className="m-0 mb-1 text-[26px] font-semibold tracking-[-0.035em]">
          {t("adminTitle")}
        </h2>
        <p className="m-0 text-sm text-muted">{t("adminSub")}</p>
      </div>

      <label htmlFor="admin-password" className="sr-only">
        {t("adminPassword")}
      </label>
      <input
        id="admin-password"
        type="password"
        dir="ltr"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setWrong(false);
        }}
        placeholder={t("adminPassword")}
        aria-describedby="admin-feedback"
        aria-invalid={wrong}
        className="field h-14 px-[18px] text-lg font-semibold"
      />
      <p id="admin-feedback" role="alert" className="m-0 -mt-2 min-h-[1.25rem] text-[13px] text-red-ink">
        {wrong ? t("adminWrong") : ""}
      </p>
      <button type="submit" className="btn-primary" disabled={!password}>
        {t("adminEnter")} <ArrowIcon />
      </button>
    </form>
  );
}

// Pop-up version, opened from a button. onUnlock runs the action the person was after.
export default function AdminGate({ onUnlock, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex w-full justify-center" onClick={(e) => e.stopPropagation()}>
        <PasswordCard onUnlock={onUnlock} onClose={onClose} />
      </div>
    </div>
  );
}

// Page version: wraps a route so it only shows after the password was entered.
export function RequireAdmin({ children }) {
  const [ok, setOk] = useState(isAdmin);
  if (ok) return children;
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <Glow color="#4285f4" className="-right-20 -top-28 h-[420px] w-[420px] opacity-[.18]" />
      <Glow color="#34a853" className="-bottom-24 -left-16 h-80 w-80 opacity-[.16]" />
      <Header />
      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <PasswordCard onUnlock={() => setOk(true)} />
      </main>
      <GoogleBar />
    </div>
  );
}
