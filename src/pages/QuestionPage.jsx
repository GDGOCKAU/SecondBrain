import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { useGame } from "../context/GameContext";

function PlayerRail({ players, side, onAdjustScore, showAnswers }) {
  return (
    <aside
      className={`player-rail ${side} max-h-[calc(100vh-64px)] overflow-hidden`}
      aria-label={`${side} side players`}
    >
      <div className="rail-heading shrink-0">
        <span>PLAYERS ({players.length})</span>
        <small>HOST CONTROLS</small>
      </div>

      {/* Scrollable list so 15–20+ players per side fit cleanly */}
      <div className="player-list !gap-4 overflow-y-auto pr-1 flex-1">
        {players.map((player, index) => (
          <div
            className={`player-item ${player.id === "you" ? "is-you" : ""}`}
            key={player.id}
            style={{ "--delay": `${Math.min(index * 40, 600)}ms` }}
          >
            <div className="player-avatar-wrap !w-11 !h-11">
              <PlayerAvatar player={player} />
              <i className={`player-status ${player.status}`} />
            </div>

            <div className="player-info flex-1">
              <div className="flex items-baseline gap-2">
                <strong>{player.name}</strong>
                <span>{player.score.toLocaleString()} PTS</span>
              </div>
              {showAnswers && player.roundAnswer && (
                <small className="text-[9px] text-[#5be0ff] truncate max-w-[90px]" dir="auto">
                  “{player.roundAnswer}”
                </small>
              )}
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => onAdjustScore(player.id, -1)}
                title={`Remove 1 point from ${player.name}`}
                className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-white/60 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onAdjustScore(player.id, 1)}
                title={`Give 1 point to ${player.name}`}
                className="px-1.5 h-5 flex items-center justify-center rounded bg-[#5be0ff]/15 hover:bg-[#5be0ff]/30 text-[#5be0ff] text-[9px] font-extrabold transition-colors cursor-pointer"
              >
                +1
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function QuestionPage() {
  const navigate = useNavigate();
  const { game, timeLeft, currentQuestion, adjustScore } = useGame();

  // Dynamically splits any number of players (e.g., 30 -> 15 left, 15 right)
  const half = Math.ceil(game.players.length / 2);
  const leftPlayers = game.players.slice(0, half);
  const rightPlayers = game.players.slice(half);

  const progressPercent = (game.currentRound / game.totalRounds) * 100;
  const timerProgress = (timeLeft / game.roundTime) * 100;
  const isUrgent = timeLeft <= 7;
  const isRoundOver = timeLeft === 0;

  return (
    <main className={`game-page ${isUrgent ? "urgent" : ""}`}>
      <div className="game-grid" />
      <div className="ambient ambient-red" />
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-green" />

      <Header />

      <div className="play-area pt-[64px]">
        <PlayerRail
          players={leftPlayers}
          side="left"
          onAdjustScore={adjustScore}
          showAnswers={isRoundOver}
        />

        <section className="question-stage flex-col" aria-labelledby="question">
          <div className="timer-zone" aria-label={`${timeLeft} seconds remaining`}>
            <div
              className="timer-glow"
              style={{ "--progress": `${timerProgress * 3.6}deg` }}
            >
              <div className="timer-face">
                <strong>{timeLeft}</strong>
                <span>SECONDS</span>
              </div>
            </div>
            <i className="timer-tick tick-one" />
            <i className="timer-tick tick-two" />
            <i className="timer-tick tick-three" />
          </div>

          <div className="question-content">
            <p className="category">
              <span /> {currentQuestion.category} <span />
            </p>

            <div className="question-number">
              QUESTION {game.currentRound} OF {game.totalRounds}
            </div>

            <h1 id="question">
              {currentQuestion.baseText} <em>{currentQuestion.highlightText}</em>
            </h1>

            <p className="question-hint">
              {isRoundOver
                ? "Time’s up! Review answers in the sidebars and award any +1 bonus points."
                : `${game.players.length} players are answering on their phones...`}
            </p>

            {isRoundOver && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/results")}
                  className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#48dcff] to-[#6af0cc] text-[#06151b] font-extrabold text-xs tracking-[0.14em] flex items-center gap-3 transition-all cursor-pointer shadow-[0_12px_33px_rgba(47,203,244,0.28)] hover:brightness-110"
                >
                  <span>NEXT: VIEW ROUND RESULTS</span>
                  <i className="not-italic text-base">→</i>
                </button>
              </div>
            )}
          </div>

          <div className="bottom-progress">
            <span>ROUND PROGRESS</span>
            <div>
              <i style={{ width: `${progressPercent}%` }} />
            </div>
            <strong>
              {game.currentRound} / {game.totalRounds}
            </strong>
          </div>
        </section>

        <PlayerRail
          players={rightPlayers}
          side="right"
          onAdjustScore={adjustScore}
          showAnswers={isRoundOver}
        />
      </div>
    </main>
  );
}