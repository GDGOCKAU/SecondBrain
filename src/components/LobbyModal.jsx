import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowIcon, CloseIcon } from "./Icons";
import PlayerAvatar from "./PlayerAvatar";
import StyledQr from "./StyledQr";
import { SOFT_TINTS } from "./Ui";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";
import { loadAllSets, roundOptions } from "../questionSets";

const TIME_OPTIONS = [15, 20, 30, 45];

function Segmented({ label, options, value, onChange, format }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="grid gap-1 rounded-full bg-chip p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={`h-9 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              value === n ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {format(n)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LobbyModal({ roomCode, onClose }) {
  const navigate = useNavigate();
  const { game, startGame } = useGame();
  const { t, tn } = useSettings();
  const [sets] = useState(loadAllSets);
  const [setId, setSetId] = useState(sets[0].id);
  const [roundsPick, setRoundsPick] = useState(10);
  const [timeLimit, setTimeLimit] = useState(20);

  if (!roomCode) return null;

  const selectedSet = sets.find((x) => x.id === setId) || sets[0];
  const setName = (x) => (x.builtIn ? t("defaultSetName") : x.name || t("untitledSet"));
  const options = roundOptions(selectedSet.questions.length);
  const rounds = options.includes(roundsPick)
    ? roundsPick
    : options.includes(10)
      ? 10
      : options[options.length - 1];
  const canStart = selectedSet.questions.length > 0;

  const joinUrl = `${window.location.origin}/avatar?code=${roomCode}`;
  const lobbyPlayers = game.players;

  const handleStart = () => {
    if (!canStart) return;
    startGame({ roomCode, totalRounds: rounds, timeLimit, questions: selectedSet.questions });
    navigate("/game");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lobby-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl gap-10 overflow-y-auto rounded-card border border-line bg-surface p-10 shadow-hero">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute end-6 top-6 flex size-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-field"
        >
          <CloseIcon />
        </button>

        <div className="flex w-1/3 shrink-0 flex-col items-center justify-center gap-5 border-e border-line pe-10 text-center">
          <div className="w-full rounded-panel bg-blue-soft px-4 py-5">
            <span className="text-xs font-semibold tracking-[0.08em] text-action">
              {t("roomCodeCaps")}
            </span>
            <strong
              dir="ltr"
              className="block text-[56px] font-bold leading-tight tracking-[0.12em] tabular-nums"
            >
              {roomCode}
            </strong>
          </div>
          <div className="rounded-panel border border-line bg-white p-4 shadow-card">
            <StyledQr value={joinUrl} size={196} label={t("roomCodeCaps")} />
          </div>
          <p className="m-0 text-[13px] text-muted">{t("qrNote")}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center justify-between pe-12">
            <h2 id="lobby-title" className="m-0 text-[28px] font-semibold tracking-[-0.035em]">
              {t("roomReady")}
            </h2>
            <span className="pill bg-green-soft text-green-ink">
              <i className="size-2 rounded-full bg-g-green" />
              {tn("joinedOne", "joinedMany", lobbyPlayers.length)}
            </span>
          </div>

          <ul className="m-0 grid max-h-[260px] min-h-[200px] list-none grid-cols-4 content-start gap-3 overflow-y-auto rounded-panel border border-line bg-field p-4 sm:grid-cols-5">
            {lobbyPlayers.map((p, i) => (
              <li
                key={p.id}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3"
              >
                <div className={`size-14 rounded-[30%] p-1.5 ${SOFT_TINTS[i % 4]}`}>
                  <PlayerAvatar player={p} />
                </div>
                <span className="max-w-full truncate text-xs font-medium" dir="auto">
                  {p.name}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="question-set" className="text-[13px] font-medium text-muted">
                {t("questionSet")}
              </label>
              <button
                type="button"
                onClick={() => navigate("/sets")}
                className="cursor-pointer text-[13px] font-medium text-action hover:text-action-dark"
              >
                {t("manageSets")}
              </button>
            </div>
            <select
              id="question-set"
              value={selectedSet.id}
              onChange={(e) => setSetId(e.target.value)}
              className="field h-11 cursor-pointer px-3.5 text-sm font-medium"
            >
              {sets.map((x) => (
                <option key={x.id} value={x.id}>
                  {t("setOption", { name: setName(x), n: x.questions.length })}
                </option>
              ))}
            </select>
            {!canStart && <p className="m-0 text-[13px] text-red-ink">{t("setEmptyHint")}</p>}
          </div>

          <div className="flex gap-4">
            <Segmented
              label={t("rounds")}
              options={options}
              value={rounds}
              onChange={setRoundsPick}
              format={(n) => `${n}`}
            />
            <Segmented
              label={t("timePer")}
              options={TIME_OPTIONS}
              value={timeLimit}
              onChange={setTimeLimit}
              format={(n) => t("secShort", { n })}
            />
          </div>

          <button
            type="button"
            className="btn-primary mt-auto w-full"
            onClick={handleStart}
            disabled={!canStart}
          >
            {t("startGame")} <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
