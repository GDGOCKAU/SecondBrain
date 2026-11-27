import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import ShareCard from "../../components/ShareCard";
import { GoogleBar } from "../../components/Ui";
import { useGame } from "../../context/GameContext";
import { rankPlayers } from "../../ranking";
import { useSettings } from "../../context/SettingsContext";

const BADGES = [
  "bg-yellow-soft text-yellow-ink",
  "bg-blue-soft text-action",
  "bg-green-soft text-green-ink",
];

export default function PlayerLeaderboard() {
  const { game, myPlayer } = useGame();
  const { t } = useSettings();

  const rankedPlayers = rankPlayers(game.players);

  const me = rankedPlayers.find((p) => p.id === myPlayer.id) || rankedPlayers[0];

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden md:max-w-2xl">
      <Header compact homeLink={false}>
        <span className="pill !px-3 !py-[5px] !text-xs bg-green-soft text-green-ink">
          {t("gameOverShort")}
        </span>
      </Header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:gap-4 md:p-5">
        <section className="relative flex items-center gap-3.5 overflow-hidden rounded-card border border-line bg-surface p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 size-[180px] rounded-full bg-g-blue opacity-[.16] blur-[60px]"
          />
          <span className="relative size-[72px] shrink-0 rounded-[30%] bg-blue-soft">
            <PlayerAvatar player={me} />
          </span>
          <div className="relative min-w-0 flex-1">
            <span className="text-xs font-semibold text-action">{t("yourFinalRank")}</span>
            <strong className="block truncate text-[22px] tracking-tight" dir="auto">
              {me.name}
            </strong>
            <span className="text-sm text-muted">{t("pts", { n: me.score.toLocaleString() })}</span>
          </div>
          <div className="relative flex size-[72px] shrink-0 flex-col items-center justify-center rounded-panel bg-blue-soft text-action">
            <span className="text-[11px] font-semibold">{t("rank")}</span>
            <strong className="text-[32px] font-bold leading-none">#{me.rank}</strong>
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
