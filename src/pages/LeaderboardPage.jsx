import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { ReplayIcon, CheckIcon, HomeIcon } from "../components/Icons";
import ConfettiBurst from "../components/ConfettiBurst";
import { Glow, GoogleBar } from "../components/Ui";
import BrainCrown from "../components/BrainCrown";
import WinnerReveal from "../components/WinnerReveal";
import { useGame } from "../context/GameContext";
import { rankPlayers } from "../ranking";
import { useSettings } from "../context/SettingsContext";

function Crown({ label }) {
  return (
    <svg viewBox="0 0 100 70" role="img" aria-label={label} className="h-auto w-[clamp(36px,7dvh,56px)]">
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
    avatar: "size-[clamp(56px,12dvh,128px)]",
    name: "text-[22px]",
    block: "h-[clamp(84px,20dvh,210px)] border-current/25 bg-yellow-soft text-yellow-ink",
    number: "text-[clamp(2rem,6dvh,3.75rem)]",
  },
  second: {
    label: "place2",
    avatar: "size-[clamp(48px,10dvh,104px)]",
    name: "text-lg",
    block: "h-[clamp(62px,14.5dvh,150px)] border-current/25 bg-blue-soft text-action",
    number: "text-[clamp(1.75rem,5dvh,3rem)]",
  },
  third: {
    label: "place3",
    avatar: "size-[clamp(44px,9dvh,96px)]",
    name: "text-lg",
    block: "h-[clamp(46px,10.5dvh,110px)] border-current/25 bg-green-soft text-green-ink",
    number: "text-[clamp(1.5rem,4.2dvh,2.5rem)]",
  },
};

const RISE_DELAY = { first: "0s", second: "0.15s", third: "0.3s" };

// Positions of up to four avatars inside one square, for a place shared by several players.
const CLUSTER = {
  2: ["left-0 top-0", "right-0 bottom-0"],
  3: ["left-1/4 top-0", "left-0 bottom-0", "right-0 bottom-0"],
  4: ["left-0 top-0", "right-0 top-0", "left-0 bottom-0", "right-0 bottom-0"],
};

// One podium place. `players` are everyone on that rank: one person shows their name,
// several show "Multiple" and tapping the coloured block reveals them one by one.
function PodiumPlace({ players, place, avatarRef, onOpen }) {
  const { t, tn } = useSettings();
  if (players.length === 0) return <div className="flex-1" />;
  const s = PLACES[place];
  const multi = players.length > 1;
  const first = players[0];
  const shown = players.slice(0, 4);
  const blockClass = `flex w-full origin-bottom flex-col items-center justify-center rounded-t-panel border ${s.block}`;
  const blockStyle = { animation: `rise 0.8s cubic-bezier(.34,1.4,.64,1) ${RISE_DELAY[place]} both` };
  const blockBody = (
    <>
      <strong className={`font-bold leading-none ${s.number}`}>{first.rank}</strong>
      <span className="text-xs font-semibold">{t(s.label)}</span>
      {multi && <span className="mt-0.5 text-[11px] font-medium opacity-80">{t("tapToReveal")}</span>}
    </>
  );

  return (
    <div className="flex flex-1 flex-col items-center gap-[clamp(4px,1dvh,10px)]">
      {place === "first" && <Crown label={t("crown")} />}
      <div ref={avatarRef} className={`${s.avatar} relative max-w-full`}>
        {multi ? (
          shown.map((p, k) => (
            <span key={p.id} className={`absolute size-[58%] ${CLUSTER[shown.length][k]}`}>
              <PlayerAvatar player={p} />
            </span>
          ))
        ) : (
          <PlayerAvatar player={first} />
        )}
      </div>
      <div>
        <strong className={`block max-w-[140px] truncate ${s.name}`} dir="auto">
          {multi ? t("multiple") : first.name}
        </strong>
        <span className="text-sm text-muted">
          {t("pts", { n: first.score.toLocaleString() })}
          {multi && ` · ${tn("playerCountOne", "playerCountMany", players.length)}`}
        </span>
      </div>
      {multi ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${t("multiple")} · ${t("tapToReveal")}`}
          className={`${blockClass} cursor-pointer transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2`}
          style={blockStyle}
        >
          {blockBody}
        </button>
      ) : (
        <div className={blockClass} style={blockStyle}>
          {blockBody}
        </div>
      )}
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
  const winnerRef = useRef(null);

  const rankedPlayers = rankPlayers(game.players);
  // players on each podium place (several when scores tie)
  const place = (rank) => rankedPlayers.filter((p) => p.rank === rank);
  const [revealing, setRevealing] = useState(null); // the group being revealed one by one

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
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <Glow color="#f9ab00" className="left-[22%] top-20 size-[380px] opacity-[.18]" />
      <Glow color="#4285f4" className="-bottom-16 -left-10 size-[300px] opacity-[.14]" />

      <ConfettiBurst trigger={burst} originRef={winnerRef} />

      <Header>
        <span className="pill bg-green-soft text-green-ink">{t("gameOver")}</span>
      </Header>

      {/* A grid with a fixed-height row: the standings box is always exactly as tall as the free space,
          so the page never scrolls and only the list inside the box does. */}
      <main className="relative z-10 mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 px-8 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8">
        <section
          aria-labelledby="winner-title"
          className="flex min-h-0 min-w-0 flex-col text-center"
        >
          <div className="my-auto flex flex-col items-center gap-[clamp(10px,2.2dvh,20px)]">
          <div className="flex flex-col items-center gap-[clamp(10px,2dvh,18px)]">
            <span className="eyebrow">
              <i className="size-2 rounded-full bg-g-yellow shadow-[0_0_0_3px_var(--color-yellow-soft)]" />
              {t("finalStandings")}
            </span>
            <h1
              id="winner-title"
              className="m-0 text-[clamp(1.75rem,min(5vw,7dvh),4rem)] font-bold leading-[1.05] tracking-[-0.045em]"
            >
              {t("brainiest")}
              <span className="text-g-red">!</span>
            </h1>
            <p className="m-0 text-base text-muted [@media(max-height:650px)]:hidden">
              {t("summary", { rounds: game.totalRounds, players: rankedPlayers.length })}
            </p>
          </div>

          <div className="flex w-full max-w-[640px] items-end justify-center gap-4">
            <PodiumPlace players={place(2)} place="second" onOpen={() => setRevealing(place(2))} />
            <PodiumPlace players={place(1)} place="first" avatarRef={winnerRef} onOpen={() => setRevealing(place(1))} />
            <PodiumPlace players={place(3)} place="third" onOpen={() => setRevealing(place(3))} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button type="button" className="btn-primary !h-11" onClick={handlePlayAgain}>
              {rematch ? <CheckIcon /> : <ReplayIcon />}
              {rematch ? t("rematch") : t("playAgain")}
            </button>
            <button type="button" className="btn-outline !h-11" onClick={() => setBurst((n) => n + 1)}>
              {t("celebrate")}
            </button>
            <button type="button" className="btn-tonal !h-11" onClick={() => navigate("/")}>
              <HomeIcon />
              {t("homePage")}
            </button>
          </div>
          </div>
        </section>

        <aside
          aria-labelledby="standings-title"
          className="flex min-h-0 min-w-0 flex-col gap-3.5 rounded-card border border-line bg-surface p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 id="standings-title" className="m-0 text-xl font-semibold tracking-tight">
              {t("fullLeaderboard")}
            </h2>
            <span className="text-xs text-muted">{t("finalScore")}</span>
          </div>

          <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-1.5 overflow-y-auto p-0">
            {rankedPlayers.map((player) => (
              <li
                key={player.id}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${
                  ROW_TINTS[player.rank - 1] || "bg-field"
                }`}
              >
                <span className="flex w-9 shrink-0 justify-center text-sm font-semibold tabular-nums text-muted">
                  {player.rank === 1 ? (
                    <BrainCrown label={t("champion")} />
                  ) : (
                    String(player.rank).padStart(2, "0")
                  )}
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
        </aside>
      </main>
      <div className="relative z-10">
        <GoogleBar />
      </div>

      {revealing && <WinnerReveal winners={revealing} onClose={() => setRevealing(null)} />}
    </div>
  );
}
