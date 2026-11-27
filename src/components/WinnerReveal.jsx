import { useEffect, useRef, useState } from "react";
import ConfettiBurst from "./ConfettiBurst";
import { ArrowIcon, CloseIcon } from "./Icons";
import PlayerAvatar from "./PlayerAvatar";
import { useSettings } from "../context/SettingsContext";

// Shows the winners one at a time, each with their own confetti burst. `winners` come in reveal order.
export default function WinnerReveal({ winners, onClose }) {
  const { t } = useSettings();
  const [step, setStep] = useState(0);
  const avatarRef = useRef(null);
  const winner = winners[step];
  const last = step === winners.length - 1;
  const tied = winners.filter((w) => w.rank === winner.rank).length > 1;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-name"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <ConfettiBurst trigger={step} originRef={avatarRef} className="z-[110]" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-3 rounded-card border border-line bg-surface p-8 text-center shadow-hero">
        <button
          type="button"
          aria-label={t("close")}
          onClick={onClose}
          className="absolute end-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-chip"
        >
          <CloseIcon />
        </button>

        <span className="pill bg-blue-soft font-semibold text-action">
          {t("revealProgress", { n: step + 1, m: winners.length })}
        </span>

        {/* keyed so every winner pops in fresh */}
        <div key={winner.id} className="flex flex-col items-center gap-3" style={{ animation: "rise 0.6s cubic-bezier(.34,1.4,.64,1) both" }}>
          <div ref={avatarRef} className="size-36 rounded-[30%] bg-yellow-soft p-2">
            <PlayerAvatar player={winner} />
          </div>
          <strong id="reveal-name" className="max-w-full truncate text-3xl tracking-tight" dir="auto">
            {winner.name}
          </strong>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="pill bg-yellow-soft font-semibold text-yellow-ink">
              {t("shareRank", { n: winner.rank })}
            </span>
            {tied && <span className="pill bg-chip font-semibold text-muted">{t("tie")}</span>}
          </div>
          <div>
            <b className="block text-5xl font-bold tabular-nums">{winner.score.toLocaleString()}</b>
            <span className="text-sm text-muted">{t("sharePointsLabel")}</span>
          </div>
        </div>

        <button type="button" className="btn-primary mt-2 w-full" onClick={() => (last ? onClose() : setStep(step + 1))}>
          {last ? t("close") : t("nextWinner")} {!last && <ArrowIcon />}
        </button>
      </div>
    </div>
  );
}
