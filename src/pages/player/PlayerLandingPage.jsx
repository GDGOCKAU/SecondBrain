import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { CheckIcon } from "../../components/Icons";
import QrScanner, { QrIcon } from "../../components/QrScanner";
import { Glow, GoogleBar } from "../../components/Ui";
import { useSettings } from "../../context/SettingsContext";

export default function PlayerLandingPage() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [roomCode, setRoomCode] = useState("");
  const [showError, setShowError] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleJoin = (event) => {
    event.preventDefault();
    const normalizedCode = roomCode.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      setShowError(true);
      return;
    }

    navigate(`/avatar?code=${normalizedCode}`);
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden">
      <Glow color="#4285f4" className="-right-20 -top-20 size-[260px] opacity-[.18] blur-[70px]" />
      <Glow color="#34a853" className="-left-24 bottom-28 size-[220px] opacity-[.14] blur-[70px]" />

      <Header compact showOrg />

      <main className="relative flex flex-1 flex-col gap-6 px-6 pb-6 pt-7">
        <div className="flex flex-col gap-3.5">
          <span className="eyebrow !px-3 !py-[5px]">
            <i className="size-[7px] rounded-full bg-g-red shadow-[0_0_0_3px_var(--color-red-soft)]" />
            {t("tagline")}
          </span>
          <h1 dir="ltr" className="m-0 text-start text-[56px] font-bold leading-[0.98] tracking-[-0.045em]">
            Mind
            <br />
            Sync<span className="text-g-blue">.</span>
          </h1>
          <p className="m-0 text-base leading-relaxed text-muted">{t("taglineSub")}</p>
        </div>

        <form
          onSubmit={handleJoin}
          noValidate
          className="mt-auto flex flex-col gap-3 rounded-card border border-line bg-surface p-[22px] shadow-float"
        >
          <label htmlFor="mobile-room-code" className="text-sm font-medium">
            {t("roomCode")}
          </label>
          <input
            id="mobile-room-code"
            dir="ltr"
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value.replace(/\s/g, "").slice(0, 8));
              setShowError(false);
            }}
            placeholder="KAU1"
            autoComplete="off"
            inputMode="text"
            aria-describedby="mobile-room-feedback"
            className="field h-[60px] px-4 text-center text-[26px] font-bold uppercase tracking-[0.3em]"
          />
          <p
            id="mobile-room-feedback"
            role="alert"
            aria-live="polite"
            className="m-0 min-h-[1.25rem] text-[13px] text-red-ink"
          >
            {showError ? t("playerCodeError") : ""}
          </p>
          <button className="btn-primary w-full" type="submit">
            {t("joinGame")}
          </button>
          <button type="button" className="btn-tonal w-full" onClick={() => setScanning(true)}>
            <QrIcon /> {t("scanQr")}
          </button>
          <p className="m-0 flex items-center justify-center gap-1.5 text-xs text-muted">
            <span className="text-g-green">
              <CheckIcon size={14} />
            </span>
            {t("noAccount")}
          </p>
        </form>
      </main>
      <GoogleBar />
      {scanning && (
        <QrScanner
          onClose={() => setScanning(false)}
          onCode={(code) => navigate(`/avatar?code=${code}`)}
        />
      )}
    </div>
  );
}
