import { useEffect } from "react";
import { CloseIcon } from "./Icons";
import { getAvatarSrc } from "./PlayerAvatar";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

const fmt = (n) => (n > 0 ? `+${n}` : String(n));

// Host view of one answer bubble: who wrote it, and +/- points for each of them.
export default function GroupPointsModal({ group, styleSet, onClose }) {
  const { game, adjustScore, scoresHidden } = useGame();
  const { t } = useSettings();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // always read live values, the group object is a snapshot
  const members = group.players
    .map((p) => game.players.find((x) => x.id === p.id))
    .filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-hero"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t("close")}
          onClick={onClose}
          className="absolute end-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-chip"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col gap-1.5 pe-10">
          <span className={`pill w-fit ${styleSet.chip}`}>{t("editPoints")}</span>
          <h2 id="group-title" className="m-0 text-xl font-bold" dir="auto">
            {t("editGroupTitle", { answer: group.answer })}
          </h2>
          <p className="m-0 text-sm text-muted">{t("editGroupHint")}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-tonal" onClick={() => members.forEach((m) => adjustScore(m.id, 1))}>
            {t("allPlus")}
          </button>
          <button type="button" className="btn-outline" onClick={() => members.forEach((m) => adjustScore(m.id, -1))}>
            {t("allMinus")}
          </button>
        </div>

        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {members.map((m) => {
            const round = (m.matchPoints || 0) + (m.hostBonus || 0);
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-[14px] bg-field p-3">
                <img src={getAvatarSrc(m)} alt="" className="size-10 shrink-0 object-contain" draggable={false} />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate" dir="auto">
                    {m.name}
                  </strong>
                  {!scoresHidden && (
                    <span className="text-xs text-muted">
                      {t("roundPts")} {fmt(round)} · {t("totalPts")} {m.score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={t("removePoints", { name: m.name })}
                    onClick={() => adjustScore(m.id, -1)}
                    disabled={m.score <= 0}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-lg font-semibold hover:bg-chip disabled:opacity-40"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={t("addPoints", { name: m.name })}
                    onClick={() => adjustScore(m.id, 1)}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-action-fill text-lg font-semibold text-white hover:bg-action-fill-hover"
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <button type="button" className="btn-primary" onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>
  );
}
