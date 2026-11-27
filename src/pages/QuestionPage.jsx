import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import RoundIntro from "../components/RoundIntro";
import PlayerAvatar from "../components/PlayerAvatar";
import { ArrowIcon } from "../components/Icons";
import { CountdownRing, GoogleBar, RoundProgress, SOFT_TINTS } from "../components/Ui";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

function PlayerRail({ players, offset, caption, onAdjustScore, showAnswers }) {
  const { scoresHidden } = useGame();
  const { t } = useSettings();
  return (
    <aside
      aria-label={t("players")}
      className="hidden min-h-0 min-w-0 flex-col gap-1.5 rounded-panel border border-line bg-surface p-4 lg:flex"
    >
      <div className="flex shrink-0 items-center justify-between px-1.5 pb-2.5 pt-1">
        <strong className="text-sm">{t("players")}</strong>
        <span className="text-xs text-muted">{caption}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center gap-2.5 rounded-[14px] bg-field p-2">
            <div
              className={`relative size-11 shrink-0 rounded-[30%] ${SOFT_TINTS[(index + offset) % 4]}`}
            >
              <PlayerAvatar player={player} />
              <i
                className={`absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-field ${
                  player.status === "answered" ? "bg-g-green" : "bg-track"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm" dir="auto">
                {player.name}
              </strong>
              {!scoresHidden && (
                <span className="text-xs tabular-nums text-muted">
                  {t("pts", { n: player.score.toLocaleString() })}
                </span>
              )}
              {showAnswers && player.roundAnswer && (
                <small className="block truncate text-xs text-action" dir="auto">
                  “{player.roundAnswer}”
                </small>
              )}
            </div>

            <button
              type="button"
              aria-label={t("removePoint", { name: player.name })}
              onClick={() => onAdjustScore(player.id, -1)}
              className="size-7 cursor-pointer rounded-[10px] border border-line bg-surface text-sm text-muted transition-all hover:bg-chip active:scale-95"
            >
              −
            </button>
            <button
              type="button"
              aria-label={t("givePoint", { name: player.name })}
              onClick={() => onAdjustScore(player.id, 1)}
              className="h-7 cursor-pointer rounded-[10px] bg-green-soft px-2 text-xs font-semibold text-green-ink transition-all hover:brightness-95 active:scale-95"
            >
              +1
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function QuestionPage() {
  const navigate = useNavigate();
  const { game, timeLeft, currentQuestion, adjustScore, nextRound, endRound, startRound } = useGame();
  const { t } = useSettings();

  const half = Math.ceil(game.players.length / 2);
  const leftPlayers = game.players.slice(0, half);
  const rightPlayers = game.players.slice(half);
  const answered = game.players.filter((p) => p.status === "answered").length;
  const waiting = game.roundStarted === false;
  const isRoundOver = !waiting && timeLeft === 0;

  // Ends the round now and shows the results (answers are scored as if the timer ran out).
  const handleSkip = () => {
    endRound();
    navigate("/results");
  };

  // Moves straight to the next question; the skipped one awards no points.
  const handleNext = () => {
    if (game.currentRound >= game.totalRounds) {
      navigate("/leaderboard");
      return;
    }
    nextRound();
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header>
        <span className="pill bg-blue-soft text-action">{t("room", { code: game.roomCode })}</span>
        <span className="pill border border-line bg-surface text-muted">
          {game.totalRounds > 0
            ? t("questionOf", { n: game.currentRound, m: game.totalRounds })
            : t("questionN", { n: game.currentRound })}
        </span>
      </Header>

      <main className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-6 px-8 py-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,280px)]">
        <PlayerRail
          players={leftPlayers}
          offset={0}
          caption={t("answeredOf", { a: answered, n: game.players.length })}
          onAdjustScore={adjustScore}
          showAnswers={isRoundOver}
        />

        <section
          aria-labelledby="question"
          className="relative flex min-h-0 min-w-0 flex-col items-center justify-center gap-[clamp(10px,2.4dvh,28px)] overflow-hidden rounded-card border border-line bg-surface p-[clamp(16px,3dvh,40px)] text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-[360px] rounded-full bg-g-blue opacity-10 blur-[80px]"
          />
          {waiting ? (
            <RoundIntro
              round={game.currentRound}
              total={game.totalRounds}
              hasFile={game.questions.length > 0}
              players={game.players.length}
              onStart={startRound}
            />
          ) : (
            <>
          <CountdownRing timeLeft={timeLeft} total={game.roundTime} size="clamp(96px,22dvh,168px)" />

          {currentQuestion.category && (
            <span className="pill bg-yellow-soft font-semibold text-yellow-ink">
              <i className="size-2 rounded-full bg-g-yellow" />
              {currentQuestion.category}
            </span>
          )}

          <h1
            id="question"
            className="m-0 max-w-[760px] text-balance text-[clamp(1.6rem,min(4.4vw,6.5dvh),3.75rem)] font-bold leading-[1.08] tracking-[-0.04em]"
          >
            {currentQuestion.baseText}{" "}
            <span className="text-g-blue">{currentQuestion.highlightText}</span>
          </h1>

          {isRoundOver ? (
            <div className="flex flex-col items-center gap-3.5">
              <p className="m-0 text-lg text-muted">{t("timesUp")}</p>
              <button type="button" className="btn-primary" onClick={() => navigate("/results")}>
                {t("viewResults")} <ArrowIcon />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5">
              <p className="m-0 text-lg text-muted">{t("answering", { n: game.players.length })}</p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button type="button" className="btn-outline h-11" onClick={handleNext}>
                  {t("nextQuestionBtn")}
                </button>
                <button type="button" className="btn-primary h-11" onClick={handleSkip}>
                  {t("skipQuestion")} <ArrowIcon />
                </button>
              </div>
            </div>
          )}

          <div className="flex w-full justify-center">
            <RoundProgress current={game.currentRound} total={game.totalRounds} />
          </div>
            </>
          )}
        </section>

        <PlayerRail
          players={rightPlayers}
          offset={half}
          caption={t("hostControls")}
          onAdjustScore={adjustScore}
          showAnswers={isRoundOver}
        />
      </main>
      <GoogleBar />
    </div>
  );
}
