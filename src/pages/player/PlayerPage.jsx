import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import PlayerAvatar from "../../components/PlayerAvatar";
import { CheckIcon } from "../../components/Icons";
import { CountdownRing, GoogleBar } from "../../components/Ui";
import { useGame } from "../../context/GameContext";
import { useSettings } from "../../context/SettingsContext";

// The participant's screen: phone or laptop, never scrolls as a page.
// Answers are never echoed back on screen so nobody can copy from a neighbour's device.
export default function PlayerPage() {
  const { game, timeLeft, currentQuestion, myPlayer, submitAnswer } = useGame();
  const { t } = useSettings();
  const navigate = useNavigate();

  // The big screen has revealed the champion: show this player their own result
  useEffect(() => {
    if (game.resultsRevealed) navigate("/player/leaderboard", { replace: true });
  }, [game.resultsRevealed, navigate]);

  const [answer, setAnswer] = useState(myPlayer.roundAnswer || "");
  const [submitted, setSubmitted] = useState(Boolean(myPlayer.roundAnswer));

  // Reset input automatically when the host starts a new round
  useEffect(() => {
    setAnswer(myPlayer.roundAnswer || "");
    setSubmitted(Boolean(myPlayer.roundAnswer));
  }, [game.roundEndTime, game.currentRound]);

  const waiting = game.roundStarted === false;
  const isRoundOver = timeLeft === 0 && game.roundStarted !== false;
  const finalShow = game.gameOver && !game.resultsRevealed;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!answer.trim() || submitted || isRoundOver || waiting) return;

    setSubmitted(true);
    submitAnswer(answer);
  };

  const roundLabel =
    game.totalRounds > 0
      ? t("qShort", { n: game.currentRound, m: game.totalRounds })
      : t("questionN", { n: game.currentRound });

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden md:max-w-3xl">
      <Header compact homeLink={false}>
        <span className="flex items-center gap-2">
          <span className="size-8 shrink-0 md:size-10">
            <PlayerAvatar player={myPlayer} />
          </span>
          <span className="text-start leading-tight">
            <strong className="block max-w-[110px] truncate text-sm md:max-w-[220px] md:text-base" dir="auto">
              {myPlayer.name}
            </strong>
          </span>
        </span>
        <span className="pill !px-2.5 !py-[5px] !text-xs border border-line bg-surface text-muted md:!text-sm">
          {roundLabel}
        </span>
      </Header>

      <main className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-5 pb-5 pt-6 text-center md:gap-7 md:px-10 md:pt-8">
        {!finalShow && (
          <div className="shrink-0 md:my-3 md:scale-125">
            <CountdownRing timeLeft={timeLeft} total={game.roundTime} size={120} />
          </div>
        )}

        {waiting && !finalShow && (
          <div role="status" className="flex w-full flex-1 flex-col items-center justify-center gap-3">
            <span className="pill bg-blue-soft font-semibold text-action">{roundLabel}</span>
            <strong className="text-[28px] leading-tight md:text-5xl">{t("getReady")}</strong>
            <p className="m-0 text-sm text-muted md:text-lg">{t("waitingStart")}</p>
          </div>
        )}

        {!waiting && !finalShow && currentQuestion.category && (
          <span className="pill !px-3 !py-[5px] !text-xs bg-yellow-soft font-semibold text-yellow-ink md:!text-sm">
            <i className="size-[7px] rounded-full bg-g-yellow" />
            {currentQuestion.category}
          </span>
        )}

        {!waiting && !finalShow && (
          <h1 className="m-0 text-balance text-[28px] font-bold leading-[1.15] tracking-[-0.035em] md:text-5xl">
            {currentQuestion.baseText}{" "}
            <span className="text-g-blue">{currentQuestion.highlightText}</span>
          </h1>
        )}

        {!waiting && !finalShow && !isRoundOver && (
          <p className="m-0 text-sm text-muted md:text-lg">{t("scoreByMatching")}</p>
        )}

        {finalShow ? (
          // The host is playing the final show: keep the suspense, the phone follows when the champion appears
          <div role="status" className="flex w-full flex-1 flex-col items-center justify-center gap-4">
            <span className="pill bg-yellow-soft font-semibold text-yellow-ink">{t("revealEyebrow")}</span>
            <strong className="text-[28px] leading-tight md:text-5xl">{t("revealTitle")}</strong>
            <p className="m-0 text-sm text-muted md:text-lg">{t("finalOnBigScreen")}</p>
            <div className="mt-2 flex gap-2.5" aria-hidden="true">
              {["#4285f4", "#ea4335", "#f9ab00", "#34a853"].map((c, i) => (
                <i
                  key={c}
                  className="size-3 rounded-full"
                  style={{ backgroundColor: c, animation: `drum 0.5s ease-in-out ${i * 0.12}s infinite alternate` }}
                />
              ))}
            </div>
          </div>
        ) : isRoundOver ? (
          // Round finished: no answer and no score here, the host reveals everything on the big screen
          <div
            role="status"
            className="mt-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-card border border-line bg-surface p-5 md:p-7"
          >
            <span className="pill bg-blue-soft !py-1 !text-xs font-semibold text-action md:!text-sm">
              {t("roundComplete", { n: String(game.currentRound).padStart(2, "0") })}
            </span>
            <span className="size-16 rounded-[30%] bg-blue-soft p-1 md:size-20">
              <PlayerAvatar player={myPlayer} />
            </span>
            <p className="m-0 text-sm text-muted md:text-base">{t("lockedIn")}</p>
            <p className="m-0 text-xs text-muted md:text-sm">{t("waitingHost")}</p>
          </div>
        ) : waiting ? null : submitted ? (
          <div
            role="status"
            className="mt-auto flex w-full max-w-xl flex-col items-center gap-2 rounded-card border border-line bg-green-soft p-5 md:p-7"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-g-green text-page md:size-14">
              <CheckIcon size={22} />
            </span>
            <span className="text-base font-semibold text-green-ink md:text-xl">{t("lockedIn")}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-auto flex w-full max-w-xl flex-col gap-3 rounded-card border border-line bg-surface p-4 text-start md:p-6"
          >
            <label htmlFor="answer" className="text-[13px] font-medium text-muted md:text-sm">
              {t("yourAnswer")}
            </label>
            <input
              id="answer"
              dir="auto"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={t("answerPlaceholder")}
              autoComplete="off"
              className="field h-14 px-4 text-lg font-semibold md:h-16 md:text-2xl"
            />
            <button type="submit" className="btn-primary w-full" disabled={!answer.trim()}>
              {t("lockIn")}
            </button>
          </form>
        )}
      </main>
      <GoogleBar />
    </div>
  );
}
