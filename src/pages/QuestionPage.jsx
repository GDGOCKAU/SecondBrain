import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PlayerAvatar from "../components/PlayerAvatar";
import { ArrowIcon } from "../components/Icons";
import { CountdownRing, GoogleBar, RoundProgress, SOFT_TINTS } from "../components/Ui";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

function PlayerRail({ players, offset, caption, onAdjustScore, showAnswers }) {
  const { t } = useSettings();
  return (
    <aside
      aria-label={t("players")}
      className="flex max-h-[calc(100vh-8rem)] min-w-0 max-w-[300px] flex-[1_1_260px] flex-col gap-1.5 rounded-panel border border-line bg-surface p-4"
    >
      <div className="flex shrink-0 items-center justify-between px-1.5 pb-2.5 pt-1">
        <strong className="text-sm">{t("players")}</strong>
        <span className="text-xs text-muted">{caption}</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
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
              <span className="text-xs tabular-nums text-muted">
                {t("pts", { n: player.score.toLocaleString() })}
              </span>
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
  const { game, timeLeft, currentQuestion, adjustScore } = useGame();
  const { t } = useSettings();

  const half = Math.ceil(game.players.length / 2);
  const leftPlayers = game.players.slice(0, half);
  const rightPlayers = game.players.slice(half);
  const answered = game.players.filter((p) => p.status === "answered").length;
  const isRoundOver = timeLeft === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <span className="pill bg-blue-soft text-action">{t("room", { code: game.roomCode })}</span>
        <span className="pill border border-line bg-surface text-muted">
          {t("questionOf", { n: game.currentRound, m: game.totalRounds })}
        </span>
      </Header>

      <main className="flex flex-1 flex-wrap gap-6 px-8 py-6">
        <PlayerRail
          players={leftPlayers}
          offset={0}
          caption={t("answeredOf", { a: answered, n: game.players.length })}
          onAdjustScore={adjustScore}
          showAnswers={isRoundOver}
        />

        <section
          aria-labelledby="question"
          className="relative flex min-w-0 flex-[999_1_480px] flex-col items-center justify-center gap-7 overflow-hidden rounded-card border border-line bg-surface p-10 text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-[360px] rounded-full bg-g-blue opacity-10 blur-[80px]"
          />
          <CountdownRing timeLeft={timeLeft} total={game.roundTime} size={168} />

          {currentQuestion.category && (
            <span className="pill bg-yellow-soft font-semibold text-yellow-ink">
              <i className="size-2 rounded-full bg-g-yellow" />
              {currentQuestion.category}
            </span>
          )}

          <h1
            id="question"
            className="m-0 max-w-[760px] text-balance text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.04em]"
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
            <p className="m-0 text-lg text-muted">{t("answering", { n: game.players.length })}</p>
          )}

          <div className="mt-2 flex w-full justify-center">
            <RoundProgress current={game.currentRound} total={game.totalRounds} />
          </div>
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
