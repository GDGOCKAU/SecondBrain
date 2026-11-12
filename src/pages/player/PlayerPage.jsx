import { useEffect, useState } from "react";
import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import { useGame } from "../../context/GameContext";

export default function PlayerPage() {
  const { game, timeLeft, currentQuestion, myPlayer, submitAnswer } = useGame();

  const [answer, setAnswer] = useState(myPlayer.roundAnswer || "");
  const [submitted, setSubmitted] = useState(Boolean(myPlayer.roundAnswer));
  const [message, setMessage] = useState("");

  // Reset input automatically when the host starts a new round
  useEffect(() => {
    setAnswer(myPlayer.roundAnswer || "");
    setSubmitted(Boolean(myPlayer.roundAnswer));
    setMessage(myPlayer.roundAnswer ? "Answer locked in! Waiting for timer..." : "");
  }, [game.roundEndTime]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!answer.trim() || submitted || timeLeft === 0) return;

    setSubmitted(true);
    submitAnswer(answer);
    setMessage("Answer locked in! Waiting for the timer to finish...");
  };

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

      <div className="play-area pt-[64px] !flex !flex-col">
        <section className="question-stage flex-col w-full" aria-labelledby="question">
          {/* Synced Countdown Clock */}
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

          <div className="question-content mx-auto">
            {/* Player Identity Card (Only their own avatar & points) */}
            <div className="flex items-center justify-between w-full px-4 py-3 mb-5 rounded-2xl border border-[#41d7ff]/30 bg-white/[0.04] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="player-avatar-wrap !w-12 !h-12 !rounded-xl border-[#3dd7ff]/50">
                  <PlayerAvatar player={myPlayer} />
                  <i className={`player-status ${submitted ? "answered" : "you"}`} />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold tracking-[0.16em] text-[#5be0ff]">
                    PLAYER
                  </span>
                  <strong className="text-sm font-bold text-white">
                    {myPlayer.name}
                  </strong>
                </div>
              </div>
              <div className="text-right px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                <span className="block text-[7px] font-bold tracking-[0.14em] text-white/40">
                  YOUR SCORE
                </span>
                <strong className="font-['Syne'] text-base font-bold text-[#f7dc4b]">
                  {myPlayer.score.toLocaleString()} PTS
                </strong>
              </div>
            </div>

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
              Type your best answer in Arabic or English before the clock runs out.
            </p>

            <form className="answer-form" onSubmit={handleSubmit}>
              <div className={`answer-shell ${submitted ? "locked" : ""}`}>
                <span className="answer-prompt">A</span>
                <input
                  dir="auto"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (!submitted) setMessage("");
                  }}
                  placeholder="TYPE YOUR ANSWER / اكتب إجابتك..."
                  aria-label="Your answer"
                  aria-describedby="answer-feedback"
                  disabled={submitted || isRoundOver}
                  autoFocus
                  autoComplete="off"
                />
                <span className="key-hint">ENTER ↵</span>
              </div>
              <button
                type="submit"
                disabled={!answer.trim() || submitted || isRoundOver}
              >
                <span>{submitted ? "ANSWER LOCKED" : "SUBMIT ANSWER"}</span>
                <i>{submitted ? "✓" : "→"}</i>
              </button>
            </form>

            <p
              id="answer-feedback"
              className={`answer-feedback ${message ? "visible" : ""}`}
              aria-live="polite"
            >
              {message || "\u00A0"}
            </p>
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
      </div>

      {/* SCORE POPUP: Opens when timer hits 0 and updates live if Host clicks +1 / -1 */}
      {isRoundOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-5">
          <div className="w-full max-w-sm rounded-3xl border border-[#41d7ff]/35 bg-[#0b0c1b]/95 p-6 text-center shadow-[0_0_50px_rgba(54,217,255,0.22)] flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-[#5be0ff]/10 border border-[#5be0ff]/30 text-[#5be0ff] text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
              ROUND {String(game.currentRound).padStart(2, "0")} COMPLETE
            </span>

            <div className="player-avatar-wrap !w-20 !h-20 !rounded-2xl border-[#3dd7ff]/60 mb-3 shadow-[0_0_24px_rgba(61,215,255,0.25)]">
              <PlayerAvatar player={myPlayer} />
            </div>

            <strong className="font-['Syne'] text-xl text-white mb-1">
              {myPlayer.name}
            </strong>

            <p className="text-xs text-white/50 mb-5" dir="auto">
              Your answer:{" "}
              <span className="text-white/90 font-semibold">
                {answer.trim() ? `“${answer.trim()}”` : "No answer"}
              </span>
            </p>

            <div className="w-full rounded-2xl bg-black/50 border border-white/10 p-4 mb-4">
              <span className="block text-[9px] font-bold tracking-[0.2em] text-white/40 mb-1">
                YOUR TOTAL SCORE
              </span>
              <strong className="font-['Syne'] text-4xl font-extrabold text-[#f7dc4b] block">
                {myPlayer.score.toLocaleString()} PTS
              </strong>

              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-[#68f496]/10 text-[#68f496] text-[10px] font-bold">
                  +{myPlayer.matchPoints || 0} MATCH PTS
                </span>
                {Boolean(myPlayer.hostBonus) && (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      myPlayer.hostBonus > 0
                        ? "bg-[#5be0ff]/15 text-[#5be0ff]"
                        : "bg-[#ff516b]/15 text-[#ff516b]"
                    }`}
                  >
                    HOST {myPlayer.hostBonus > 0 ? `+${myPlayer.hostBonus}` : myPlayer.hostBonus} PT
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-white/40 tracking-wide">
              Waiting for host to start the next round...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}