import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { useGame } from "../context/GameContext";

const confetti = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 7) % 100}%`,
  delay: `${-((index * 0.37) % 7)}s`,
  duration: `${5 + (index % 5) * 0.65}s`,
  color: ["red", "yellow", "green", "blue"][index % 4],
  shape: ["strip", "square", "dot"][index % 3],
  drift: `${(index % 2 === 0 ? 1 : -1) * (25 + (index % 4) * 13)}px`,
}));

function Crown() {
  return (
    <svg className="winner-crown" viewBox="0 0 100 70" aria-label="Winner crown">
      <defs>
        <linearGradient id="crownGold" x1="15" y1="10" x2="80" y2="65">
          <stop stopColor="#fff27a" />
          <stop offset="1" stopColor="#ffbd2e" />
        </linearGradient>
      </defs>
      <path
        d="m13 18 21 19 16-28 16 28 21-19-8 40H21Z"
        fill="url(#crownGold)"
        stroke="#fff39a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="16" r="6" fill="#ffdc3f" />
      <circle cx="50" cy="8" r="6" fill="#ffdc3f" />
      <circle cx="87" cy="16" r="6" fill="#ffdc3f" />
      <path d="M24 48h52" stroke="#fff7ac" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

function PodiumPlace({ player, place }) {
  if (!player) return null;
  return (
    <div className={`podium-place ${place}`}>
      <div className="winner-character">
        {place === "first" && <Crown />}
        <div className="winner-avatar">
          <PlayerAvatar player={player} className="player-avatar" />
        </div>
        <div className="winner-name">
          <strong>{player.name}</strong>
          <span>{player.score.toLocaleString()} PTS</span>
        </div>
      </div>
      <div className="podium-block">
        <span className="place-number">{player.rank}</span>
        <small>{place.toUpperCase()} PLACE</small>
        <div className="podium-edge" />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { game, startGame } = useGame();
  const [rematch, setRematch] = useState(false);

  // Sort all players by highest score and assign ranks
  const rankedPlayers = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

  const winners = rankedPlayers.slice(0, 3);
  const remainingPlayers = rankedPlayers.slice(3);

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
    <main className="leaderboard-page">
      <div className="background-grid" />
      <div className="color-haze haze-red" />
      <div className="color-haze haze-blue" />
      <div className="color-haze haze-green" />

      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((piece) => (
          <i
            key={piece.id}
            className={`confetti ${piece.color} ${piece.shape}`}
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              "--drift": piece.drift,
            }}
          />
        ))}
      </div>

      <Header />

      <div className="leaderboard-layout pt-[64px]">
        <section className="podium-section" aria-labelledby="winner-title">
          <div className="winner-heading">
            <p>
              <span /> FINAL STANDINGS <span />
            </p>
            <h1 id="winner-title">Brainiest of the bunch!</h1>
            <small>
              {game.totalRounds} ROUNDS · {rankedPlayers.length} PLAYERS · 1 CHAMPION
            </small>
          </div>

          <div className="podium-scene">
            <div className="victory-rays" />
            <div className="podium-floor" />
            <div className="podium-group">
              <PodiumPlace player={winners[1]} place="second" />
              <PodiumPlace player={winners[0]} place="first" />
              <PodiumPlace player={winners[2]} place="third" />
            </div>
          </div>

          <button
            type="button"
            className={`play-again ${rematch ? "requested" : ""}`}
            onClick={handlePlayAgain}
          >
            <span className="replay-icon">{rematch ? "✓" : "↻"}</span>
            <span>
              <strong>{rematch ? "REMATCH STARTING" : "PLAY AGAIN"}</strong>
              <small>SAME ROOM, FRESH QUESTIONS</small>
            </span>
            <i>→</i>
          </button>
        </section>

        <aside className="standings-panel" aria-labelledby="standings-title">
          <div className="panel-glow" />
          <div className="standings-heading">
            <div>
              <p>FULL LEADERBOARD</p>
              <h2 id="standings-title">The final scores</h2>
            </div>
            <span>{game.totalRounds} ROUNDS</span>
          </div>

          {winners[0] && (
            <div className="top-player-summary">
              <div className="mini-winner">
                <PlayerAvatar player={winners[0]} className="player-avatar" />
              </div>
              <div>
                <small>TONIGHT’S CHAMPION</small>
                <strong>{winners[0].name}</strong>
              </div>
              <b>{winners[0].score.toLocaleString()} PTS</b>
            </div>
          )}

          <div className="standing-labels">
            <span>RANK & PLAYER</span>
            <span>FINAL SCORE</span>
          </div>

          <div className="standings-list" tabIndex={0} aria-label="Remaining players">
            {remainingPlayers.map((player) => (
              <div className="standing-row" key={player.id}>
                <span className="rank-number">
                  {String(player.rank).padStart(2, "0")}
                </span>
                <div className="row-avatar">
                  <PlayerAvatar player={player} className="player-avatar" />
                </div>
                <div className="row-name">
                  <strong>{player.name}</strong>
                  <small>{player.rank === 4 ? "SO CLOSE!" : "GREAT GAME"}</small>
                </div>
                <span className="rank-change up">★</span>
                <b>{player.score.toLocaleString()}</b>
              </div>
            ))}
          </div>

          <div className="panel-footer">
            <span>
              <i /> SCORES SAVED
            </span>
            <button type="button" onClick={() => navigate("/")}>
              BACK TO LOBBY ↗
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}