import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import { useGame } from "../../context/GameContext";

export default function PlayerLeaderboard() {
  const { game, myPlayer } = useGame();

  // Sort all players by score descending and assign 1-based ranks
  const rankedPlayers = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

  const myRankedPlayer =
    rankedPlayers.find((p) => p.id === myPlayer.id) || rankedPlayers[0];

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) return "text-[#ffe054] border-[#ffe054]/40 bg-[#ffe054]/10";
    if (rank === 2) return "text-[#5be0ff] border-[#5be0ff]/40 bg-[#5be0ff]/10";
    if (rank === 3) return "text-[#63f294] border-[#63f294]/40 bg-[#63f294]/10";
    return "text-white/40 border-white/10 bg-white/5";
  };

  return (
    <main className="leaderboard-page min-h-[100dvh] overflow-y-auto pb-10">
      <div className="background-grid" />
      <div className="color-haze haze-red" />
      <div className="color-haze haze-blue" />
      <div className="color-haze haze-green" />

      <Header />

      <div className="w-full max-w-md mx-auto px-4 pt-24 flex flex-col gap-5">
        {/* Player's Own Final Rank Highlight Card */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-[#41d7ff]/35 bg-white/[0.04] backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl p-1.5 border border-[#41d7ff]/50 bg-black/30 flex items-center justify-center shrink-0">
              <PlayerAvatar player={myRankedPlayer} className="player-avatar" />
            </div>
            <div className="min-w-0">
              <span className="block text-[8px] font-bold tracking-[0.2em] text-[#5be0ff] uppercase">
                YOUR FINAL RANK
              </span>
              <strong className="font-['Syne'] text-lg text-white truncate block">
                {myRankedPlayer.name}
              </strong>
              <span className="text-[10px] font-bold text-[#f7dc4b]">
                {myRankedPlayer.score.toLocaleString()} PTS
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-black/50 border border-white/10 shrink-0">
            <span className="text-[7px] font-bold tracking-[0.16em] text-white/40">
              RANK
            </span>
            <strong className="font-['Syne'] text-2xl font-extrabold text-[#ffe054]">
              #{myRankedPlayer.rank}
            </strong>
          </div>
        </div>

        {/* Full Standings Panel */}
        <aside className="standings-panel !m-0 !h-auto !w-full" aria-labelledby="mobile-standings-title">
          <div className="panel-glow" />
          <div className="standings-heading">
            <div>
              <p>FINAL STANDINGS</p>
              <h2 id="mobile-standings-title">All Player Ranks</h2>
            </div>
            <span>{rankedPlayers.length} PLAYERS</span>
          </div>

          <div className="standing-labels">
            <span>RANK & PLAYER</span>
            <span>FINAL SCORE</span>
          </div>

          <div className="standings-list !h-auto !max-h-none divide-y divide-white/5">
            {rankedPlayers.map((player) => {
              const isMe = player.id === myPlayer.id;
              return (
                <div
                  key={player.id}
                  className={`standing-row px-2 rounded-xl items-center ${
                    isMe ? "bg-[#41d7ff]/[0.08]" : ""
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md border flex items-center justify-center font-['Syne'] text-[10px] font-bold ${getRankBadgeStyle(
                      player.rank
                    )}`}
                  >
                    {String(player.rank).padStart(2, "0")}
                  </span>

                  <div className="row-avatar">
                    <PlayerAvatar player={player} className="player-avatar" />
                  </div>

                  <div className="row-name">
                    <strong className={isMe ? "!text-[#72e6ff]" : ""}>
                      {player.name} {isMe && "(YOU)"}
                    </strong>
                    <small>
                      {player.rank === 1
                        ? "CHAMPION 👑"
                        : player.rank <= 3
                        ? "TOP 3 PODIUM"
                        : "GREAT GAME"}
                    </small>
                  </div>

                  <b className={`text-right ${player.rank === 1 ? "!text-[#ffe054]" : ""}`}>
                    {player.score.toLocaleString()}
                  </b>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}