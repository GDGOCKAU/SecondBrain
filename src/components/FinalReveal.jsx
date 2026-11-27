import { useCallback, useEffect, useRef, useState } from "react";
import ConfettiBurst from "./ConfettiBurst";
import PlayerAvatar from "./PlayerAvatar";
import { ArrowIcon } from "./Icons";
import { useSettings } from "../context/SettingsContext";
import { useCountUp } from "../useCountUp";

const PLACE = {
  3: { label: "place3", color: "#34a853" },
  2: { label: "place2", color: "#4285f4" },
  1: { label: "champion", color: "#f9ab00" },
};

function Score({ value }) {
  const { t } = useSettings();
  const n = useCountUp(value);
  return (
    <div className="flex items-baseline justify-center gap-2" style={{ animation: "pop 0.5s ease-out 0.35s both" }}>
      <b className="text-[clamp(2.5rem,8dvh,4.5rem)] font-bold leading-none tabular-nums">{n.toLocaleString()}</b>
      <span className="text-lg text-white/60">{t("sharePointsLabel")}</span>
    </div>
  );
}

function Avatars({ players, big }) {
  const size =
    players.length === 1
      ? big
        ? "size-[clamp(120px,26dvh,220px)]"
        : "size-[clamp(100px,22dvh,180px)]"
      : players.length <= 3
        ? "size-[clamp(80px,16dvh,130px)]"
        : "size-[clamp(56px,11dvh,90px)]";
  return (
    <div className="flex max-w-4xl flex-wrap items-end justify-center gap-[clamp(12px,3vw,32px)]">
      {players.map((p, i) => (
        <div
          key={p.id}
          className="flex flex-col items-center gap-2"
          style={{ animation: `pop 0.7s cubic-bezier(.34,1.5,.64,1) ${0.1 + i * 0.12}s both` }}
        >
          <span className={`${size} block`}>
            <PlayerAvatar player={p} />
          </span>
          <strong
            className={`max-w-[240px] truncate font-bold tracking-tight ${big ? "text-[clamp(1.75rem,5dvh,3rem)]" : "text-[clamp(1.25rem,3.6dvh,2rem)]"}`}
            dir="auto"
          >
            {p.name}
          </strong>
        </div>
      ))}
    </div>
  );
}

// Full-screen show before the podium: a countdown, then 3rd, 2nd, a drumroll and the champion.
// `ranked` comes from rankPlayers. Runs on its own; the host can click (or press Space) to move on.
export default function FinalReveal({ ranked, onChampion, onDone }) {
  const { t } = useSettings();
  const at = (rank) => ranked.filter((p) => p.rank === rank);
  const champions = at(1);

  const steps = [
    { kind: "intro", ms: 2200 },
    { kind: "count", n: 3, ms: 900 },
    { kind: "count", n: 2, ms: 900 },
    { kind: "count", n: 1, ms: 900 },
    ...[3, 2].filter((r) => at(r).length).map((rank) => ({ kind: "place", rank, ms: 4200 })),
    { kind: "drumroll", ms: 2600 },
    { kind: "champion" },
  ];

  const [step, setStep] = useState(0);
  const current = steps[step];
  const last = step === steps.length - 1;
  const next = useCallback(() => setStep((s) => Math.min(s + 1, steps.length - 1)), [steps.length]);

  useEffect(() => {
    if (ranked.length === 0) onDone();
  }, [ranked.length, onDone]);

  useEffect(() => {
    if (!current.ms) return;
    const id = window.setTimeout(next, current.ms);
    return () => window.clearTimeout(id);
  }, [step, current.ms, next]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onDone();
      else if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (last) onDone();
        else next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, next, onDone]);

  // Champion: three waves of confetti from the left, the middle and the right.
  const leftRef = useRef(null);
  const midRef = useRef(null);
  const rightRef = useRef(null);
  const [waves, setWaves] = useState(0);
  // the moment the champion shows up, every phone may show its own result
  const announced = useRef(false);
  useEffect(() => {
    if (current.kind !== "champion" || announced.current) return;
    announced.current = true;
    onChampion?.();
  }, [current.kind, onChampion]);

  useEffect(() => {
    if (current.kind !== "champion") return;
    const ids = [0, 350, 700, 1800, 2200].map((ms, i) => window.setTimeout(() => setWaves(i + 1), ms));
    return () => ids.forEach(window.clearTimeout);
  }, [current.kind]);

  if (ranked.length === 0) return null;

  const glow =
    current.kind === "place" ? PLACE[current.rank].color : current.kind === "champion" ? PLACE[1].color : "#4285f4";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("revealTitle")}
      className="fixed inset-0 z-[100] flex select-none flex-col overflow-hidden bg-[#070b14] text-white"
      onClick={() => (last ? null : next())}
    >
      {/* coloured spotlight that follows the place being revealed */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px] transition-[background-color] duration-700"
        style={{ backgroundColor: glow }}
      />

      {current.kind === "champion" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[.13]"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, #f9ab00 0deg 7deg, transparent 7deg 22deg)",
              animation: "rays-spin 40s linear infinite",
              maskImage: "radial-gradient(circle, #000 10%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(circle, #000 10%, transparent 60%)",
            }}
          />
          <span ref={leftRef} className="absolute bottom-[20%] left-[12%]" />
          <span ref={midRef} className="absolute bottom-[35%] left-1/2" />
          <span ref={rightRef} className="absolute bottom-[20%] right-[12%]" />
          {waves >= 1 && <ConfettiBurst originRef={midRef} className="z-[110]" />}
          {waves >= 2 && <ConfettiBurst originRef={leftRef} className="z-[110]" />}
          {waves >= 3 && <ConfettiBurst originRef={rightRef} className="z-[110]" />}
          {waves >= 4 && <ConfettiBurst originRef={leftRef} className="z-[110]" />}
          {waves >= 5 && <ConfettiBurst originRef={rightRef} className="z-[110]" />}
        </>
      )}

      <div className="relative z-[120] flex justify-end p-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
        >
          {t("skipReveal")}
        </button>
      </div>

      <main
        key={step}
        className="relative z-[120] flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(12px,3dvh,32px)] px-6 text-center"
      >
        {current.kind === "intro" && (
          <>
            <span
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/70"
              style={{ animation: "pop 0.6s ease-out both" }}
            >
              {t("revealEyebrow")}
            </span>
            <h1
              className="m-0 text-[clamp(2.75rem,min(9vw,13dvh),7rem)] font-bold leading-none tracking-[-0.045em]"
              style={{ animation: "pop 0.8s cubic-bezier(.34,1.5,.64,1) 0.2s both" }}
            >
              {t("revealTitle")}
            </h1>
            <p className="m-0 text-xl text-white/60" style={{ animation: "pop 0.6s ease-out 0.7s both" }}>
              {t("revealQuestion")}
            </p>
          </>
        )}

        {current.kind === "count" && (
          <strong
            className="text-[clamp(8rem,40dvh,22rem)] font-bold leading-none tabular-nums"
            style={{
              color: ["#34a853", "#4285f4", "#ea4335"][current.n - 1],
              animation: "count-pop 0.9s ease-out both",
            }}
          >
            {current.n}
          </strong>
        )}

        {current.kind === "place" && (
          <>
            <span
              className="rounded-full px-5 py-2 text-[clamp(1rem,2.6dvh,1.5rem)] font-bold"
              style={{
                backgroundColor: `${PLACE[current.rank].color}26`,
                color: PLACE[current.rank].color,
                animation: "pop 0.5s ease-out both",
              }}
            >
              {t(PLACE[current.rank].label)}
            </span>
            <Avatars players={at(current.rank)} />
            <Score value={at(current.rank)[0].score} />
          </>
        )}

        {current.kind === "drumroll" && (
          <>
            <h2
              className="m-0 text-[clamp(2.25rem,min(7vw,10dvh),5.5rem)] font-bold leading-tight tracking-[-0.04em]"
              style={{ animation: "pop 0.7s ease-out both" }}
            >
              {champions.length > 1 ? t("andTheWinners") : t("andTheWinner")}
            </h2>
            <div className="flex gap-3" aria-hidden="true">
              {["#4285f4", "#ea4335", "#f9ab00", "#34a853"].map((c, i) => (
                <i
                  key={c}
                  className="size-4 rounded-full"
                  style={{ backgroundColor: c, animation: `drum 0.5s ease-in-out ${i * 0.12}s infinite alternate` }}
                />
              ))}
            </div>
          </>
        )}

        {current.kind === "champion" && (
          <>
            <svg
              viewBox="0 0 100 70"
              aria-hidden="true"
              className="h-auto w-[clamp(56px,11dvh,100px)]"
              style={{ animation: "crown-drop 0.9s cubic-bezier(.34,1.5,.64,1) 0.5s both" }}
            >
              <path
                d="m13 18 21 19 16-28 16 28 21-19-8 40H21Z"
                fill="#f9ab00"
                stroke="#e37400"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
            <Avatars players={champions} big />
            <span
              className="rounded-full bg-[#f9ab00] px-5 py-2 text-[clamp(1rem,2.6dvh,1.5rem)] font-bold text-[#3b2600]"
              style={{ animation: "pop 0.5s ease-out 0.6s both" }}
            >
              {champions.length > 1 ? `${t("champion")} · ${t("tie")}` : t("champion")}
            </span>
            <Score value={champions[0].score} />
          </>
        )}
      </main>

      <div className="relative z-[120] flex justify-center p-6">
        {last ? (
          <button
            type="button"
            className="btn-primary h-12"
            style={{ animation: "pop 0.5s ease-out 1.6s both" }}
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
          >
            {t("seeStandings")} <ArrowIcon />
          </button>
        ) : (
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            {current.ms && (
              <i
                key={step}
                className="block h-full origin-left rounded-full bg-white/60 rtl:origin-right"
                style={{ animation: `reveal-bar ${current.ms}ms linear both` }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
