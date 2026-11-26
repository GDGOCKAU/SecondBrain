import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowIcon, PlusIcon } from "../components/Icons";
import { Glow, GoogleBar } from "../components/Ui";
import LobbyModal from "../components/LobbyModal";
import QrScanner, { QrIcon } from "../components/QrScanner";
import { useSettings } from "../context/SettingsContext";

const FEATURES = [
  { title: "feat1Title", text: "feat1Text", bar: "bg-g-blue" },
  { title: "feat2Title", text: "feat2Text", bar: "bg-g-red" },
  { title: "feat3Title", text: "feat3Text", bar: "bg-g-green" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [roomCode, setRoomCode] = useState("");
  const [showError, setShowError] = useState(false);
  const [hostedCode, setHostedCode] = useState(null);
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

  const handleHost = () => {
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setHostedCode(newCode);
    setShowError(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Glow color="#4285f4" className="-right-20 -top-28 h-[420px] w-[420px] opacity-[.18]" />
      <Glow color="#34a853" className="-bottom-24 -left-16 h-80 w-80 opacity-[.16]" />
      <Glow color="#f9ab00" className="bottom-32 right-[30%] h-64 w-64 opacity-[.16]" />

      <Header showOrg />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-wrap items-center gap-16 px-8 pb-12 pt-16">
        <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-7">
          <span className="eyebrow">
            <i className="size-2 rounded-full bg-g-green shadow-[0_0_0_3px_var(--color-green-soft)]" />
            {t("badge")}
          </span>
          <h1 className="m-0 text-[clamp(3.5rem,8vw,6.25rem)] font-bold leading-none tracking-[-0.045em]">
            {t("heroThink")}
            <span className="text-g-blue">.</span> {t("heroMatch")}
            <span className="text-g-red">.</span>
            <br />
            {t("heroWin")}
            <span className="text-g-yellow">.</span>
          </h1>
          <p className="m-0 max-w-[520px] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.7] text-muted">
            {t("heroText")}
          </p>
          <div className="grid max-w-[560px] grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden rounded-[1.35rem] border border-line bg-surface/80 py-4 ps-5 pe-4 backdrop-blur-md"
              >
                <i className={`absolute bottom-4 start-0 top-4 w-[3px] rounded-sm ${f.bar}`} />
                <strong className="block text-[15px]">{t(f.title)}</strong>
                <span className="text-[13px] text-muted">{t(f.text)}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="join-title" className="min-w-0 max-w-[440px] flex-[1_1_400px]">
          <div className="flex flex-col gap-5 rounded-card border border-line bg-surface p-8 shadow-hero">
            <div className="flex gap-1.5" aria-hidden="true">
              <i className="size-1.5 rounded-full bg-g-blue" />
              <i className="size-1.5 rounded-full bg-g-red" />
              <i className="size-1.5 rounded-full bg-g-yellow" />
              <i className="size-1.5 rounded-full bg-g-green" />
            </div>
            <div>
              <h2 id="join-title" className="m-0 mb-1 text-[28px] font-semibold tracking-[-0.035em]">
                {t("joinTitle")}
              </h2>
              <p className="m-0 text-sm text-muted">{t("joinSub")}</p>
            </div>

            <form onSubmit={handleJoin} noValidate className="flex flex-col gap-3">
              <label htmlFor="room-code" className="text-[13px] font-medium text-muted">
                {t("roomCode")}
              </label>
              <input
                id="room-code"
                dir="ltr"
                value={roomCode}
                onChange={(event) => {
                  setRoomCode(event.target.value.replace(/\s/g, "").slice(0, 8));
                  setShowError(false);
                }}
                placeholder={t("roomPlaceholder")}
                autoComplete="off"
                aria-describedby="room-feedback"
                className="field h-14 px-[18px] text-[22px] font-semibold uppercase tracking-[0.2em]"
              />
              <p
                id="room-feedback"
                role="alert"
                aria-live="polite"
                className="m-0 min-h-[1.25rem] text-[13px] text-red-ink"
              >
                {showError ? t("joinError") : ""}
              </p>
              <button className="btn-primary" type="submit">
                {t("joinGame")} <ArrowIcon />
              </button>
              <button type="button" className="btn-outline h-[52px]" onClick={() => setScanning(true)}>
                <QrIcon /> {t("scanQr")}
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-subtle">
              <span className="h-px flex-1 bg-line" />
              {t("or")}
              <span className="h-px flex-1 bg-line" />
            </div>

            <button className="btn-tonal" type="button" onClick={handleHost}>
              <PlusIcon /> {t("hostNew")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/sets")}
              className="cursor-pointer self-center text-sm font-medium text-action hover:text-action-dark"
            >
              {t("manageSets")}
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex flex-wrap justify-between gap-3 px-8 py-4 text-xs text-muted">
        <span>{t("footerMade")}</span>
        <span dir="ltr">X @GDGoC_Team · Instagram @GDGteam_ · gdgkau.com</span>
      </footer>
      <div className="relative">
        <GoogleBar />
      </div>

      {scanning && (
        <QrScanner
          onClose={() => setScanning(false)}
          onCode={(code) => navigate(`/avatar?code=${code}`)}
        />
      )}
      <LobbyModal roomCode={hostedCode} onClose={() => setHostedCode(null)} />
    </div>
  );
}
