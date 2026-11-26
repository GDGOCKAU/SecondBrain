import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowIcon, CloseIcon } from "./Icons";
import PlayerAvatar from "./PlayerAvatar";
import StyledQr from "./StyledQr";
import { SOFT_TINTS } from "./Ui";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

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
  const { game, startGame, removePlayer } = useGame();
  const { t, tn } = useSettings();
  const [timeLimit, setTimeLimit] = useState(20);

  if (!roomCode) return null;

  const joinUrl = `${window.location.origin}/avatar?code=${roomCode}`;
  const lobbyPlayers = game.players;

  const handleStart = () => {
    startGame({ roomCode, timeLimit, fresh: true });
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

          <ul className="m-0 grid max-h-[300px] min-h-[200px] list-none grid-cols-1 content-start gap-2 overflow-y-auto rounded-panel border border-line bg-field p-3 sm:grid-cols-2">
            {lobbyPlayers.length === 0 && (
              <li className="col-span-full py-8 text-center text-sm text-muted">{t("noPlayersYet")}</li>
            )}
            {lobbyPlayers.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5"
              >
                <div className={`size-11 shrink-0 rounded-[30%] p-1 ${SOFT_TINTS[i % 4]}`}>
                  <PlayerAvatar player={p} />
                </div>
                <span className="min-w-0 flex-1 break-words text-sm font-semibold" dir="auto">
                  {p.name}
                </span>
                <button
                  type="button"
                  aria-label={t("removePlayer", { name: p.name })}
                  title={t("removePlayer", { name: p.name })}
                  onClick={() => removePlayer(p.id)}
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-g-red hover:bg-red-soft hover:text-red-ink"
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-4">
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
          >
            {t("startGame")} <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
