import { useEffect, useState } from "react";
import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import { CheckIcon } from "../../components/Icons";
import { CountdownRing, GoogleBar } from "../../components/Ui";
import { useGame } from "../../context/GameContext";
import { useSettings } from "../../context/SettingsContext";

export default function PlayerPage() {
  const { game, timeLeft, currentQuestion, myPlayer, submitAnswer } = useGame();
  const { t } = useSettings();

  const [answer, setAnswer] = useState(myPlayer.roundAnswer || "");
  const [submitted, setSubmitted] = useState(Boolean(myPlayer.roundAnswer));

  // Reset input automatically when the host starts a new round
  useEffect(() => {
    setAnswer(myPlayer.roundAnswer || "");
    setSubmitted(Boolean(myPlayer.roundAnswer));
  }, [game.roundEndTime]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!answer.trim() || submitted || timeLeft === 0) return;

    setSubmitted(true);
    submitAnswer(answer);
  };

  const isRoundOver = timeLeft === 0;

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
      <Header compact>
        <span className="flex items-center gap-2">
          <span className="size-8 shrink-0">
            <PlayerAvatar player={myPlayer} />
          </span>
          <span className="text-start leading-tight">
            <strong className="block max-w-[72px] truncate text-sm" dir="auto">
              {myPlayer.name}
            </strong>
            <span className="text-xs text-muted">
              {t("pts", { n: myPlayer.score.toLocaleString() })}
            </span>
          </span>
        </span>
        <span className="pill !px-2.5 !py-[5px] !text-xs border border-line bg-surface text-muted">
          {t("qShort", { n: game.currentRound, m: game.totalRounds })}
        </span>
      </Header>

      <main className="flex flex-1 flex-col items-center gap-5 px-5 pb-5 pt-6 text-center">
        <CountdownRing timeLeft={timeLeft} total={game.roundTime} size={120} />

        {currentQuestion.category && (
          <span className="pill !px-3 !py-[5px] !text-xs bg-yellow-soft font-semibold text-yellow-ink">
            <i className="size-[7px] rounded-full bg-g-yellow" />
            {currentQuestion.category}
          </span>
        )}

        <h1 className="m-0 text-balance text-[28px] font-bold leading-[1.15] tracking-[-0.035em]">
          {currentQuestion.baseText}{" "}
          <span className="text-g-blue">{currentQuestion.highlightText}</span>
        </h1>

        <p className="m-0 text-sm text-muted">{t("scoreByMatching")}</p>

        {submitted ? (
          <div
            role="status"
            className="mt-auto flex w-full flex-col items-center gap-2 rounded-card border border-line bg-green-soft p-5"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-g-green text-page">
              <CheckIcon size={22} />
            </span>
            <strong className="text-[22px]" dir="auto">
              “{answer.trim()}”
            </strong>
            <span className="text-sm text-green-ink">{t("lockedIn")}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-auto flex w-full flex-col gap-3 rounded-card border border-line bg-surface p-4 text-start"
          >
            <label htmlFor="answer" className="text-[13px] font-medium text-muted">
              {t("yourAnswer")}
            </label>
            <input
              id="answer"
              dir="auto"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={t("answerPlaceholder")}
              disabled={isRoundOver}
              autoComplete="off"
              className="field h-14 px-4 text-lg font-semibold"
            />
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={!answer.trim() || isRoundOver}
            >
              {t("lockIn")}
            </button>
          </form>
        )}
      </main>
      <GoogleBar />

      {isRoundOver && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="round-complete"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="flex w-full max-w-sm flex-col items-center rounded-card border border-line bg-surface p-6 text-center shadow-hero">
            <span
              id="round-complete"
              className="pill mb-4 bg-blue-soft !py-1 !text-xs font-semibold text-action"
            >
              {t("roundComplete", { n: String(game.currentRound).padStart(2, "0") })}
            </span>

            <span className="mb-3 size-20 rounded-[30%] bg-blue-soft p-1">
              <PlayerAvatar player={myPlayer} />
            </span>
            <strong className="mb-1 text-xl" dir="auto">
              {myPlayer.name}
            </strong>

            <p className="mb-5 mt-0 text-sm text-muted">
              {t("yourAnswerColon")}{" "}
              <span className="font-semibold text-ink" dir="auto">
                {answer.trim() ? `“${answer.trim()}”` : t("noAnswer")}
              </span>
            </p>

            <div className="mb-4 w-full rounded-panel bg-field p-4">
              <span className="block text-xs font-semibold text-muted">{t("totalScore")}</span>
              <strong className="block text-4xl font-bold tabular-nums">
                {t("pts", { n: myPlayer.score.toLocaleString() })}
              </strong>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green-ink">
                  {t("matchPts", { n: myPlayer.matchPoints || 0 })}
                </span>
                {Boolean(myPlayer.hostBonus) && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      myPlayer.hostBonus > 0
                        ? "bg-blue-soft text-action"
                        : "bg-red-soft text-red-ink"
                    }`}
                  >
                    {t("hostPt", {
                      n: myPlayer.hostBonus > 0 ? `+${myPlayer.hostBonus}` : myPlayer.hostBonus,
                    })}
                  </span>
                )}
              </div>
            </div>

            <p className="m-0 text-xs text-muted">{t("waitingHost")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
