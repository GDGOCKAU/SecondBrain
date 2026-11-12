import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { normalizeText, useGame } from "../context/GameContext";

function buildBubblesFromPlayers(allPlayers) {
  const groups = new Map();
  allPlayers.forEach((player) => {
    const raw = player.roundAnswer?.trim();
    if (!raw) return;
    const key = normalizeText(raw);
    if (!groups.has(key)) {
      groups.set(key, { answer: raw, players: [] });
    }
    groups.get(key).players.push(player);
  });

  const sorted = Array.from(groups.values()).sort(
    (a, b) => b.players.length - a.players.length
  );

  const layoutSpecs = [
    { tone: "yellow", size: "hero", position: "center", delay: "0ms" },
    { tone: "blue", size: "large", position: "left-mid", delay: "120ms" },
    { tone: "red", size: "medium", position: "right-high", delay: "200ms" },
    { tone: "green", size: "medium", position: "right-low", delay: "280ms" },
    { tone: "red", size: "small", position: "left-low", delay: "360ms" },
  ];

  return sorted.slice(0, 5).map((group, index) => {
    const spec = layoutSpecs[index] || layoutSpecs[layoutSpecs.length - 1];
    const count = group.players.length;
    return {
      answer: group.answer,
      count,
      points: Math.max(0, count - 1),
      tone: spec.tone,
      size: index === 0 ? "hero" : spec.size,
      position: spec.position,
      players: group.players,
      delay: spec.delay,
    };
  });
}

function AnswerBubbleCard({ bubble }) {
  const maxVisibleAvatars = 5;
  const visiblePlayers = bubble.players.slice(0, maxVisibleAvatars);
  const extraCount = Math.max(0, bubble.players.length - maxVisibleAvatars);

  return (
    <article
      className={`answer-bubble ${bubble.tone} ${bubble.size} ${bubble.position}`}
      style={{ "--delay": bubble.delay }}
      tabIndex={0}
    >
      <div className="bubble-surface">
        {bubble.size === "hero" && <span className="popular-label">MOST POPULAR</span>}
        <h2 dir="auto">{bubble.answer}</h2>
        <p>
          {bubble.count} {bubble.count === 1 ? "PLAYER" : "PLAYERS"} MATCHED
        </p>

        <div className="bubble-players">
          {visiblePlayers.map((player) => (
            <div
              className="bubble-avatar"
              key={player.id}
              title={`${player.name} (${player.score} PTS)`}
            >
              <PlayerAvatar player={player} className="player-avatar mini-avatar" />
              {player.id === "you" && <span>YOU</span>}
            </div>
          ))}
          {extraCount > 0 && (
            <div
              className="bubble-avatar !bg-[#15162c] !border-[#5be0ff]/40 text-[#5be0ff] text-[10px] font-extrabold"
              title={`+${extraCount} more players`}
            >
              +{extraCount}
            </div>
          )}
        </div>

        <div className="points-badge">
          +{bubble.points} {bubble.points === 1 ? "POINT" : "POINTS"}
        </div>
      </div>
    </article>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { game, myPlayer, nextRound } = useGame();

  const bubbles = buildBubblesFromPlayers(game.players);
  const topBubble = bubbles[0];

  const [nextRoundIn, setNextRoundIn] = useState(12);

  useEffect(() => {
    if (nextRoundIn <= 0) return;
    const timer = window.setInterval(
      () => setNextRoundIn((current) => Math.max(0, current - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [nextRoundIn]);


const handleAdvance = () => {
    if (game.currentRound >= game.totalRounds) {
      navigate("/leaderboard");
      return;
    }
    nextRound();
    navigate("/game");
  };

  return (
    <main className="results-page game-page">
      <div className="results-grid game-grid" />
      <div className="haze haze-red ambient ambient-red" />
      <div className="haze haze-blue ambient ambient-blue" />
      <div className="haze haze-green ambient ambient-green" />

      <Header />

      <section className="results-canvas pt-[76px]" aria-labelledby="results-title">
        <div className="results-heading">
          <p>
            <span /> ROUND {String(game.currentRound).padStart(2, "0")} BRAINWAVE
          </p>
          <h1 id="results-title">Great minds think alike.</h1>
          <div className="answer-key">
            <span>QUESTION {game.currentRound} OF {game.totalRounds}</span>
            <i />
            <span>{game.players.length} PLAYERS</span>
            <i />
            <span>{bubbles.length} UNIQUE GUESSES</span>
          </div>
        </div>

        <div className="bubble-field">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="floating-dot dot-yellow" />
          <span className="floating-dot dot-red" />
          <span className="floating-dot dot-green" />
          <span className="floating-dot dot-blue" />
          {bubbles.map((bubble) => (
            <AnswerBubbleCard bubble={bubble} key={bubble.answer} />
          ))}
        </div>

        <div className="result-footer">
          <div className="correct-answer">
            <span className="check">★</span>
            <div>
              <small>TOP MATCHED ANSWER</small>
              <strong dir="auto">{topBubble?.answer?.toUpperCase() || "—"}</strong>
            </div>
          </div>

          <div className="result-legend">
            <span>
              <i className="legend-dot yellow" /> {topBubble?.count || 0} MATCHED
            </span>
            <span>
              <i className="legend-dot blue" /> YOUR SCORE: {myPlayer.score} PTS
            </span>
          </div>

          <button type="button" onClick={handleAdvance} className="cursor-pointer">
            <span>
              {game.currentRound >= game.totalRounds ? "FINISH GAME" : "NEXT ROUND"}
            </span>
            <small>
              {game.currentRound >= game.totalRounds
                ? "FINAL SCORES"
                : `ROUND ${String(game.currentRound + 1).padStart(2, "0")} (${nextRoundIn}s)`}
            </small>
            <i>→</i>
          </button>
        </div>
      </section>
    </main>
  );
}