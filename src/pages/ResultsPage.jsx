import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import GroupPointsModal from "../components/GroupPointsModal";
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
    if (!groups.has(key)) groups.set(key, { answer: raw, players: [] });
    const group = groups.get(key);
    group.players.push(player);
  });

  return Array.from(groups.values())
    .map((g) => ({ ...g, count: g.players.length, points: Math.max(0, g.players.length - 1) }))
    .sort((a, b) => b.count - a.count);
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { game, currentQuestion, nextRound, mergeGroups, scoresHidden } = useGame();
  const { t, tn } = useSettings();

  const [selected, setSelected] = useState(null);
  const groups = groupAnswers(game.players);
  const selectedIndex = groups.findIndex((g) => g.answer === selected);
  const selectedGroup = selectedIndex >= 0 ? groups[selectedIndex] : null;
  const unanswered = game.players.filter((p) => !p.roundAnswer?.trim());
  const isLastRound = game.currentRound >= game.totalRounds;

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
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header>
        <span className="pill bg-blue-soft text-action">{t("room", { code: game.roomCode })}</span>
        <span className="pill border border-line bg-surface text-muted">
          {t("questionOf", { n: game.currentRound, m: game.totalRounds })}
        </span>
      </Header>

      <main
        aria-labelledby="results-title"
        className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-[clamp(10px,2.4dvh,28px)] px-8 py-[clamp(10px,2.4dvh,32px)]"
      >
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-[clamp(4px,1dvh,10px)]">
            <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-muted">
              <i className="h-[3px] w-6 rounded-sm bg-g-yellow" />
              {t("roundResults", { n: String(game.currentRound).padStart(2, "0") })}
            </span>
            <h1
              id="results-title"
              className="m-0 text-[clamp(1.5rem,min(4vw,6dvh),3rem)] font-bold leading-[1.08] tracking-[-0.04em]"
            >
              {t("greatMinds")}
            </h1>
            <p className="m-0 text-base text-muted">
              “{`${currentQuestion.baseText} ${currentQuestion.highlightText}`.trim()}”
              {!scoresHidden && ` · ${t("eachMatch")}`}
            </p>
          </div>
          <button type="button" className="btn-primary h-12" onClick={handleAdvance}>
            {isLastRound ? t("showFinalResult") : t("nextQuestionBtn")} <ArrowIcon />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="card shrink-0 p-10 text-center text-muted">{t("nobody")}</div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:grid-rows-[minmax(0,1fr)]">
            <section
              aria-label={t("matchMap")}
              className="card relative flex min-h-0 min-w-0 flex-col overflow-hidden p-4 md:p-5"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-20 size-72 rounded-full bg-g-yellow opacity-[.14] blur-[70px]"
              />
              <div className="relative min-h-0 flex-1">
                <MatchMap groups={groups} onSelect={setSelected} onMergeGroup={mergeGroups} />
              </div>
              <p className="relative m-0 mt-2 shrink-0 text-center text-[13px] text-muted">{t("tapBubble")}</p>
            </section>

            <section className="card flex min-h-0 min-w-0 flex-col gap-2.5 p-4">
              <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-0">
                {groups.map((g, i) => {
                  const style = GROUP_STYLES[i % GROUP_STYLES.length];
                  return (
                    <li
                      key={g.answer}
                      className="flex cursor-pointer items-center gap-2.5 rounded-[12px] bg-field p-2.5 transition-colors hover:bg-chip"
                      onClick={() => setSelected(g.answer)}
                    >
                      <i className={`size-2.5 shrink-0 rounded-full ${style.bar}`} />
                      <div className="min-w-0 flex-1">
                        <strong className="block break-words text-base" dir="auto">
                          {g.answer}
                        </strong>
                        <span className="text-xs text-muted">
                          {tn("playerCountOne", "playerCountMany", g.count)} ·{" "}
                          {g.players.map((p) => p.name).join(", ")}
                        </span>
                      </div>
                      {!scoresHidden && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            g.points > 0 ? "bg-green-soft text-green-ink" : "bg-chip text-muted"
                          }`}
                        >
                          {pointsLabel(g.points)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>

              {unanswered.length > 0 && (
                <p className="m-0 shrink-0 rounded-full bg-chip px-3.5 py-1.5 text-sm font-medium text-muted">
                  {t("noAnswer")} · {unanswered.map((p) => p.name).join(", ")}
                </p>
              )}
            </section>
          </div>
        )}
      </main>
      <GoogleBar />
      {selectedGroup && (
        <GroupPointsModal
          group={selectedGroup}
          styleSet={GROUP_STYLES[selectedIndex % GROUP_STYLES.length]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
