import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, CloseIcon } from "./Icons";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";
import { loadAllSets } from "../questionSets";

export function useSetName() {
  const { t } = useSettings();
  return (set) => (set.builtIn ? t("defaultSetName") : set.name || t("untitledSet"));
}

// Header pill showing the room's question file; opens a picker so the host can switch any time.
export default function SetSwitcher({ variant = "pill", attention = false }) {
  const navigate = useNavigate();
  const { game, queueQuestionSet } = useGame();
  const { t } = useSettings();
  const nameOf = useSetName();
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState([]);

  useEffect(() => {
    if (!open) return;
    setSets(loadAllSets());
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentId = game.setId;
  const nextId = game.pendingSet?.setId;
  const shownId = nextId || currentId;
  const known = shownId ? loadAllSets().find((x) => x.id === shownId) : null;
  const shownName = !shownId ? t("fileNone") : known ? nameOf(known) : game.pendingSet?.setName || game.setName;

  const pickRandom = () => {
    const usable = sets.filter((x) => x.questions.length > 0);
    const others = usable.filter((x) => x.id !== shownId);
    const pool = others.length ? others : usable;
    if (pool.length) queueQuestionSet(pool[Math.floor(Math.random() * pool.length)]);
    setOpen(false);
  };

  return (
    <>
      {variant === "small" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            attention
              ? "border-g-red bg-red-soft text-red-ink"
              : "border-line bg-surface text-muted hover:bg-chip"
          }`}
        >
          <span className="truncate" dir="auto">
            {t("fileLabel", { name: shownName })}
          </span>
          <span className={`shrink-0 font-semibold ${attention ? "" : "text-action"}`}>
            · {shownId ? t("changeShort") : t("chooseShort")}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={t("changeFile")}
          className="pill max-w-[200px] cursor-pointer border border-line bg-surface text-muted transition-colors hover:bg-chip"
        >
          <span className="truncate" dir="auto">
            {t("fileLabel", { name: shownName })}
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pick-file-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-hero"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="absolute end-4 top-4 inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-chip"
            >
              <CloseIcon />
            </button>

            <div className="flex flex-col gap-1.5 pe-10">
              <h2 id="pick-file-title" className="m-0 text-xl font-bold">
                {t("pickFileTitle")}
              </h2>
              <p className="m-0 text-sm text-muted">{t("pickFileNote")}</p>
            </div>

            <button
              type="button"
              onClick={pickRandom}
              disabled={!sets.some((x) => x.questions.length > 0)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-dashed border-action bg-blue-soft p-3 text-start font-semibold text-action transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true" className="text-xl">🎲</span>
              {t("randomFile")}
            </button>

            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {sets.map((x) => {
                const empty = x.questions.length === 0;
                const selected = x.id === shownId;
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      disabled={empty}
                      aria-pressed={selected}
                      onClick={() => {
                        queueQuestionSet(x);
                        setOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-[14px] border p-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected ? "border-action bg-blue-soft" : "border-line bg-field hover:bg-chip"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate" dir="auto">
                          {nameOf(x)}
                        </strong>
                        <span className="text-xs text-muted">{t("nQuestions", { n: x.questions.length })}</span>
                      </div>
                      {x.id === currentId && (
                        <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-semibold text-muted">
                          {t("currentFile")}
                        </span>
                      )}
                      {x.id === nextId && (
                        <span className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green-ink">
                          {t("queuedNext")}
                        </span>
                      )}
                      {selected && <CheckIcon size={18} />}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => navigate("/sets")}
              className="cursor-pointer self-start text-sm font-medium text-action hover:text-action-dark"
            >
              {t("manageSets")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
