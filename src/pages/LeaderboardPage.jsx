import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { ReplayIcon, CheckIcon } from "../components/Icons";
import ConfettiBurst from "../components/ConfettiBurst";
import { Glow, GoogleBar } from "../components/Ui";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

function Crown({ label }) {
  return (
    <svg width="56" height="40" viewBox="0 0 100 70" role="img" aria-label={label}>
      <path
        d="m13 18 21 19 16-28 16 28 21-19-8 40H21Z"
        fill="#f9ab00"
        stroke="#e37400"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PLACES = {
  first: {
    label: "champion",
    avatar: "size-32",
    name: "text-[22px]",
    block: "h-[210px] border-current/25 bg-yellow-soft text-yellow-ink",
    number: "text-6xl",
  },
  second: {
    label: "place2",
    avatar: "size-[104px]",
    name: "text-lg",
    block: "h-[150px] border-current/25 bg-blue-soft text-action",
    number: "text-5xl",
  },
  third: {
    label: "place3",
    avatar: "size-24",
    name: "text-lg",
    block: "h-[110px] border-current/25 bg-green-soft text-green-ink",
    number: "text-[40px]",
  },
};

const RISE_DELAY = { first: "0s", second: "0.15s", third: "0.3s" };

function PodiumPlace({ player, place }) {
  const { t } = useSettings();
  if (!player) return <div className="flex-1" />;
  const s = PLACES[place];
  return (
    <div className="flex flex-1 flex-col items-center gap-2.5">
      {place === "first" && <Crown label={t("crown")} />}
      <div className={`${s.avatar} max-w-full`}>
        <PlayerAvatar player={player} />
      </div>
      <div>
        <strong className={`block max-w-[140px] truncate ${s.name}`} dir="auto">
          {player.name}
        </strong>
        <span className="text-sm text-muted">{t("pts", { n: player.score.toLocaleString() })}</span>
      </div>
      <div
        className={`flex w-full origin-bottom flex-col items-center justify-center rounded-t-panel border ${s.block}`}
        style={{ animation: `rise 0.8s cubic-bezier(.34,1.4,.64,1) ${RISE_DELAY[place]} both` }}
      >
        <strong className={`font-bold leading-none ${s.number}`}>{player.rank}</strong>
        <span className="text-xs font-semibold">{t(s.label)}</span>
      </div>
    </div>
  );
}

const ROW_TINTS = ["bg-yellow-soft", "bg-blue-soft", "bg-green-soft"];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { game, startGame } = useGame();
  const { t } = useSettings();
  const [rematch, setRematch] = useState(false);
  const [burst, setBurst] = useState(0);

  const rankedPlayers = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({ ...player, rank: index + 1 }));
  const winners = rankedPlayers.slice(0, 3);

  const handlePlayAgain = () => {
    setRematch(true);
    startGame({
      roomCode: game.roomCode,
      totalRounds: game.totalRounds,
      timeLimit: game.roundTime,
    });
    navigate("/game");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Glow color="#f9ab00" className="left-[22%] top-20 size-[380px] opacity-[.18]" />
      <Glow color="#4285f4" className="-bottom-16 -left-10 size-[300px] opacity-[.14]" />

      <ConfettiBurst trigger={burst} />

      <Header>
        <span className="pill bg-green-soft text-green-ink">{t("gameOver")}</span>
      </Header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-wrap items-stretch gap-8 px-8 py-10">
        <section
          aria-labelledby="winner-title"
          className="flex min-w-0 flex-[999_1_560px] flex-col items-center gap-7 text-center"
        >
          <div className="flex flex-col items-center gap-2.5">
            <span className="eyebrow">
              <i className="size-2 rounded-full bg-g-yellow shadow-[0_0_0_3px_var(--color-yellow-soft)]" />
              {t("finalStandings")}
            </span>
            <h1
              id="winner-title"
              className="m-0 text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.045em]"
            >
              {t("brainiest")}
              <span className="text-g-red">!</span>
            </h1>
            <p className="m-0 text-base text-muted">
              {t("summary", { rounds: game.totalRounds, players: rankedPlayers.length })}
            </p>
          </div>

          <div className="mt-2 flex w-full max-w-[640px] items-end justify-center gap-4">
            <PodiumPlace player={winners[1]} place="second" />
            <PodiumPlace player={winners[0]} place="first" />
            <PodiumPlace player={winners[2]} place="third" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={handlePlayAgain}>
              {rematch ? <CheckIcon /> : <ReplayIcon />}
              {rematch ? t("rematch") : t("playAgain")}
            </button>
            <button type="button" className="btn-outline !h-[52px]" onClick={() => setBurst((n) => n + 1)}>
              {t("celebrate")}
            </button>
          </div>
        </section>

        <aside
          aria-labelledby="standings-title"
          className="flex min-w-0 max-w-[420px] flex-[1_1_340px] flex-col gap-3.5 rounded-card border border-line bg-surface p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 id="standings-title" className="m-0 text-xl font-semibold tracking-tight">
              {t("fullLeaderboard")}
            </h2>
            <span className="text-xs text-muted">{t("finalScore")}</span>
          </div>

          <ol className="m-0 flex list-none flex-col gap-1.5 overflow-y-auto p-0">
            {rankedPlayers.map((player) => (
              <li
                key={player.id}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${
                  ROW_TINTS[player.rank - 1] || "bg-field"
                }`}
              >
                <span className="w-7 text-sm font-semibold tabular-nums text-muted">
                  {String(player.rank).padStart(2, "0")}
                </span>
                <span className="size-9 shrink-0">
                  <PlayerAvatar player={player} />
                </span>
                <strong className="min-w-0 flex-1 truncate text-[15px] font-medium" dir="auto">
                  {player.name}
                </strong>
                <b className="text-[15px] tabular-nums">{player.score.toLocaleString()}</b>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-auto flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-action hover:text-action-dark"
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ←
            </span>
            {t("backLobby")}
          </button>
        </aside>
      </main>
      <div className="relative z-10">
        <GoogleBar />
      </div>
    </div>
  );
}
