import { useState } from "react";
import { ArrowIcon } from "./Icons";
import SetSwitcher from "./SetSwitcher";
import { useSettings } from "../context/SettingsContext";

const LEFT = "M15.2 6C11 3 5 5 5 10c-3 1-3 6 0 7.5C3.5 21 6 25 10 24.5c1.5 2.5 5.2 2.5 5.2-.5z";
const RIGHT = "M16.8 6C21 3 27 5 27 10c3 1 3 6 0 7.5C28.5 21 26 25 22 24.5c-1.5 2.5-5.2 2.5-5.2-.5z";

// [x, y, colour, anchor on the brain]
const NODES = [
  [34, 58, "#4285f4", [92, 96]],
  [286, 48, "#ea4335", [228, 90]],
  [300, 176, "#f9ab00", [236, 150]],
  [30, 196, "#34a853", [96, 156]],
  [160, 10, "#4285f4", [160, 62]],
  [246, 236, "#ea4335", [196, 196]],
  [78, 240, "#f9ab00", [124, 196]],
];

// Brain in the four GDG colours, wired up to pulsing nodes.
function BrainArt() {
  return (
    <svg viewBox="0 0 320 256" className="h-auto w-[min(320px,80%)]" aria-hidden="true">
      <defs>
        <clipPath id="clip-l">
          <path d={LEFT} />
        </clipPath>
        <clipPath id="clip-r">
          <path d={RIGHT} />
        </clipPath>
      </defs>

      <g stroke="currentColor" strokeWidth="1.4" opacity=".22" strokeLinecap="round">
        {NODES.map(([x, y, , [ax, ay]], i) => (
          <line key={i} x1={x} y1={y} x2={ax} y2={ay} />
        ))}
      </g>
      {NODES.map(([x, y, c], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="6"
          fill={c}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: `node-pulse 2.4s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}

      <g style={{ animation: "float 4s ease-in-out infinite" }}>
        <g transform="translate(64 42) scale(6)" strokeLinejoin="round" strokeLinecap="round">
          <g stroke="#fff" strokeWidth="1.6" fill="#fff">
            <path d={LEFT} />
            <path d={RIGHT} />
          </g>
          <g clipPath="url(#clip-l)">
            <rect x="0" y="0" width="16" height="15" fill="#4285f4" />
            <rect x="0" y="15" width="16" height="14" fill="#ea4335" />
          </g>
          <g clipPath="url(#clip-r)">
            <rect x="16" y="0" width="16" height="15" fill="#fbbc04" />
            <rect x="16" y="15" width="16" height="14" fill="#34a853" />
          </g>
          <g fill="none" stroke="#282d2c" strokeWidth=".55">
            <path d={LEFT} />
            <path d={RIGHT} />
            <g opacity=".6" strokeWidth=".4">
              <path d="M9 10c2-1 3.5 0 3.5 2M8 17c2 .5 3.5-.5 4-2M23 10c-2-1-3.5 0-3.5 2M24 17c-2 .5-3.500-.5-4-2" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

// What the host sees before a round opens: brain art, round number, Start.
export default function RoundIntro({ round, total, players, hasFile, onStart }) {
  const { t, tn } = useSettings();
  const [missing, setMissing] = useState(false);
  const handleStart = () => {
    if (!hasFile) {
      setMissing(true);
      return;
    }
    onStart();
  };
  return (
    <div className="relative flex w-full flex-col items-center gap-5 text-ink">
      <BrainArt />

      {total > 0 && (
        <span className="eyebrow self-center">
          <i className="size-2 rounded-full bg-g-blue shadow-[0_0_0_3px_var(--color-blue-soft)]" />
          {t("roundOfTotal", { n: round, m: total })}
        </span>
      )}

      <h1
        id="question"
        className="m-0 text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[1.08] tracking-[-0.04em]"
      >
        {t("roundN", { n: round })}
        <span className="text-g-red">.</span>
      </h1>

      <p className="m-0 max-w-[420px] text-balance text-base text-muted">
        {tn("introReadyOne", "introReadyMany", players)}
      </p>

      <div className="relative mt-1">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-action-fill"
          style={{ animation: "ring-out 1.8s ease-out infinite" }}
        />
        <button type="button" className="btn-primary relative !h-16 px-14 text-xl" onClick={handleStart}>
          {t("startQuestion")} <ArrowIcon />
        </button>
      </div>

      {missing && !hasFile && (
        <p role="alert" className="m-0 rounded-full bg-red-soft px-4 py-2 text-sm font-medium text-red-ink">
          {t("chooseFileFirst")}
        </p>
      )}
      <SetSwitcher variant="small" attention={missing && !hasFile} />
    </div>
  );
}
