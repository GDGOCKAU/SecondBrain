import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ArrowIcon } from "../components/Icons";
import MatchMap, { GROUP_STYLES } from "../components/MatchMap";
import { GoogleBar } from "../components/Ui";
import { normalizeText, useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";

function groupAnswers(players) {
  const groups = new Map();
  players.forEach((player) => {
    const raw = player.roundAnswer?.trim();
    if (!raw) return;
    const key = normalizeText(raw);
    if (!groups.has(key)) groups.set(key, { answer: raw, spellings: new Set(), players: [] });
    const group = groups.get(key);
    group.spellings.add(raw);
    group.players.push(player);
  });

  return Array.from(groups.values())
    .map((g) => ({ ...g, count: g.players.length, points: Math.max(0, g.players.length - 1) }))
    .sort((a, b) => b.count - a.count);
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { game, currentQuestion, nextRound } = useGame();
  const { t, tn } = useSettings();
  const [nextRoundIn, setNextRoundIn] = useState(12);

  const groups = groupAnswers(game.players);
  const unanswered = game.players.filter((p) => !p.roundAnswer?.trim());
  const isLastRound = game.currentRound >= game.totalRounds;

  useEffect(() => {
    if (nextRoundIn <= 0) return;
    const timer = window.setInterval(
      () => setNextRoundIn((current) => Math.max(0, current - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [nextRoundIn]);

  const handleAdvance = () => {
    if (isLastRound) {
      navigate("/leaderboard");
      return;
    }
    nextRound();
    navigate("/game");
  };

  const pointsLabel = (points) =>
    points > 0 ? tn("ptEach", "ptsEach", points) : t("noMatch");

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <span className="pill bg-blue-soft text-action">{t("room", { code: game.roomCode })}</span>
        <span className="pill border border-line bg-surface text-muted">
          {t("questionOf", { n: game.currentRound, m: game.totalRounds })}
        </span>
      </Header>

      <main
        aria-labelledby="results-title"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-7 px-8 py-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-2.5">
            <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-muted">
              <i className="h-[3px] w-6 rounded-sm bg-g-yellow" />
              {t("roundResults", { n: String(game.currentRound).padStart(2, "0") })}
            </span>
            <h1
              id="results-title"
              className="m-0 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em]"
            >
              {t("greatMinds")}
            </h1>
            <p className="m-0 text-base text-muted">
              “{`${currentQuestion.baseText} ${currentQuestion.highlightText}`.trim()}” · {t("eachMatch")}
            </p>
          </div>
          <button type="button" className="btn-primary h-12" onClick={handleAdvance}>
            {isLastRound ? t("finishGame") : t("nextQuestionIn", { n: nextRoundIn })} <ArrowIcon />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="card p-10 text-center text-muted">{t("nobody")}</div>
        ) : (
          <div className="flex flex-wrap items-start gap-5">
            <section
              aria-label={t("matchMap")}
              className="card relative min-w-0 flex-[2_1_480px] overflow-hidden p-4 md:p-6"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-20 size-72 rounded-full bg-g-yellow opacity-[.14] blur-[70px]"
              />
              <div className="relative">
                <MatchMap groups={groups} />
              </div>
            </section>

            <section className="card flex min-w-0 flex-[1_1_300px] flex-col gap-3 p-5">
              <ol className="m-0 flex list-none flex-col gap-2 p-0">
                {groups.map((g, i) => {
                  const style = GROUP_STYLES[i % GROUP_STYLES.length];
                  const also = [...g.spellings].filter((s) => s !== g.answer);
                  return (
                    <li key={g.answer} className="flex items-start gap-3 rounded-[14px] bg-field p-3">
                      <i className={`mt-1.5 size-2.5 shrink-0 rounded-full ${style.bar}`} />
                      <div className="min-w-0 flex-1">
                        <strong className="block break-words text-lg" dir="auto">
                          {g.answer}
                        </strong>
                        <span className="text-[13px] text-muted">
                          {tn("playerCountOne", "playerCountMany", g.count)} ·{" "}
                          {g.players.map((p) => p.name).join(", ")}
                        </span>
                        {also.length > 0 && (
                          <span className="block text-xs text-muted" dir="auto">
                            {t("alsoWritten", { list: also.map((s) => `“${s}”`).join(", ") })}
                          </span>
                        )}
                        {g.points === 0 && (
                          <span className="block text-xs text-muted">{t("awardHost")}</span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          g.points > 0 ? "bg-green-soft text-green-ink" : "bg-chip text-muted"
                        }`}
                      >
                        {pointsLabel(g.points)}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {unanswered.length > 0 && (
                <p className="m-0 rounded-full bg-chip px-3.5 py-1.5 text-sm font-medium text-muted">
                  {t("noAnswer")} · {unanswered.map((p) => p.name).join(", ")}
                </p>
              )}
              <p className="m-0 text-[13px] text-muted">{t("spellingNote")}</p>
            </section>
          </div>
        )}
      </main>
      <GoogleBar />
    </div>
  );
}
