import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ConfettiBurst from "../../components/ConfettiBurst";
import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import ShareCard from "../../components/ShareCard";
import { GoogleBar } from "../../components/Ui";
import { useGame } from "../../context/GameContext";
import { rankPlayers } from "../../ranking";
import { useSettings } from "../../context/SettingsContext";
import { useCountUp } from "../../useCountUp";

const TONES = {
  1: { headline: "myResultChampion", color: "#f9ab00", pill: "bg-yellow-soft text-yellow-ink" },
  2: { headline: "myResultPodium", color: "#4285f4", pill: "bg-blue-soft text-action" },
  3: { headline: "myResultPodium", color: "#34a853", pill: "bg-green-soft text-green-ink" },
  rest: { headline: "myResultGood", color: "#4285f4", pill: "bg-blue-soft text-action" },
};

const BADGES = [
  "bg-yellow-soft text-yellow-ink",
  "bg-blue-soft text-action",
  "bg-green-soft text-green-ink",
];

export default function PlayerLeaderboard() {
  const { game, myPlayer } = useGame();
  const { t } = useSettings();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Not revealed yet (or the host started a new game): back to the play screen
  useEffect(() => {
    if (!game.resultsRevealed) navigate("/player", { replace: true });
  }, [game.resultsRevealed, navigate]);

  const rankedPlayers = rankPlayers(game.players);

  const me = rankedPlayers.find((p) => p.id === myPlayer.id) || rankedPlayers[0];
  const tone = TONES[me?.rank] || TONES.rest;
  const score = useCountUp(me?.score || 0, 1400, 700);

  if (!me) return null;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden md:max-w-2xl">
      {me.rank <= 3 && <ConfettiBurst originRef={heroRef} className="z-[60]" />}
      <Header compact homeLink={false}>
        <span className="pill !px-3 !py-[5px] !text-xs bg-green-soft text-green-ink">
          {t("gameOverShort")}
        </span>
      </Header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:gap-4 md:p-5">
        {/* Personal result: lands the moment the champion appears on the big screen */}
        <section
          ref={heroRef}
          className="relative flex shrink-0 flex-col items-center gap-2 overflow-hidden rounded-card border border-line bg-surface p-5 text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 size-[260px] -translate-x-1/2 rounded-full opacity-[.22] blur-[70px]"
            style={{ backgroundColor: tone.color }}
          />
          <span
            className={`relative pill !py-1 font-semibold ${tone.pill}`}
            style={{ animation: "pop 0.5s ease-out both" }}
          >
            {t("yourFinalRank")}
          </span>
          <span
            className="relative size-[clamp(84px,14dvh,120px)]"
            style={{ animation: "pop 0.7s cubic-bezier(.34,1.5,.64,1) 0.15s both" }}
          >
            <PlayerAvatar player={me} />
          </span>
          <strong className="relative text-2xl tracking-tight md:text-3xl" style={{ animation: "pop 0.5s ease-out 0.35s both" }}>
            {t(tone.headline)}
          </strong>
          <div className="relative flex items-center gap-4" style={{ animation: "pop 0.6s ease-out 0.55s both" }}>
            <div className="flex flex-col items-center">
              <strong className="text-[44px] font-bold leading-none tabular-nums" style={{ color: tone.color }}>
                #{me.rank}
              </strong>
              <span className="text-xs text-muted">{t("outOf", { n: rankedPlayers.length })}</span>
            </div>
            <i className="h-10 w-px bg-line" />
            <div className="flex flex-col items-center">
              <strong className="text-[44px] font-bold leading-none tabular-nums">{score.toLocaleString()}</strong>
              <span className="text-xs text-muted">{t("sharePointsLabel")}</span>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="standings-title"
          className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-card border border-line bg-surface p-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 id="standings-title" className="m-0 text-[17px] font-semibold">
              {t("allPlayers")}
            </h2>
            <span className="text-xs text-muted">{t("playersCount", { n: rankedPlayers.length })}</span>
          </div>
          <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-1 overflow-y-auto p-0">
            {rankedPlayers.map((player) => {
              const isMe = player.id === me.id;
              return (
                <li
                  key={player.id}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
                    isMe ? "bg-blue-soft" : ""
                  }`}
                >
                  <span
                    className={`flex size-[26px] items-center justify-center rounded-lg text-xs font-bold ${
                      BADGES[player.rank - 1] || "bg-chip text-muted"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <span className="size-8 shrink-0">
                    <PlayerAvatar player={player} />
                  </span>
                  <strong className="min-w-0 flex-1 truncate text-sm font-medium" dir="auto">
                    {player.name}
                    {isMe && ` (${t("you")})`}
                  </strong>
                  <b className="text-sm tabular-nums">{player.score.toLocaleString()}</b>
                </li>
              );
            })}
          </ol>
        </section>

        <ShareCard player={me} rank={me.rank} />
      </main>
      <GoogleBar />
    </div>
  );
}
