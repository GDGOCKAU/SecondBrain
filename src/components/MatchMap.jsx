import { useState } from "react";
import { getAvatarSrc } from "./PlayerAvatar";
import { useSettings } from "../context/SettingsContext";

export const GROUP_STYLES = [
  { stroke: "stroke-g-yellow", fill: "fill-yellow-soft", dot: "fill-g-yellow", chip: "bg-yellow-soft text-yellow-ink", bar: "bg-g-yellow" },
  { stroke: "stroke-g-blue", fill: "fill-blue-soft", dot: "fill-g-blue", chip: "bg-blue-soft text-action", bar: "bg-g-blue" },
  { stroke: "stroke-g-red", fill: "fill-red-soft", dot: "fill-g-red", chip: "bg-red-soft text-red-ink", bar: "bg-g-red" },
  { stroke: "stroke-g-green", fill: "fill-green-soft", dot: "fill-g-green", chip: "bg-green-soft text-green-ink", bar: "bg-g-green" },
  { stroke: "stroke-g-blue", fill: "fill-blue-soft", dot: "fill-g-blue", chip: "bg-blue-soft text-action", bar: "bg-g-blue" },
];

// Bubble slots (viewBox 640x380). The most-matched answer takes the biggest, centre-left slot.
const SLOTS = [
  { x: 215, y: 180 },
  { x: 470, y: 105 },
  { x: 525, y: 262 },
  { x: 375, y: 282 },
  { x: 95, y: 330 },
];
export const MAP_SLOTS = SLOTS.length;

function radiusFor(count) {
  return Math.min(92, 36 + (count - 1) * 22);
}

// Answers as bubbles; players link to the bubble they picked, and to each other when they matched.
export default function MatchMap({ groups, onSelect }) {
  const { t, tn } = useSettings();
  const [hover, setHover] = useState(-1);
  const shown = groups.slice(0, SLOTS.length);

  const bubbles = shown.map((g, i) => {
    const slot = SLOTS[i];
    const r = radiusFor(g.count);
    const out = Math.atan2(slot.y - 190, slot.x - 320);
    const spread = g.players.length > 1 ? Math.min(1.6, 0.5 * g.players.length) : 0;
    const people = g.players.map((p, k) => {
      const a = out - spread / 2 + (g.players.length > 1 ? (spread * k) / (g.players.length - 1) : 0);
      return { p, x: slot.x + Math.cos(a) * (r + 32), y: slot.y + Math.sin(a) * (r + 32) };
    });
    return { g, slot, r, people, style: GROUP_STYLES[i % GROUP_STYLES.length] };
  });

  return (
    <svg
      viewBox="0 0 640 380"
      className="h-auto w-full"
      role="img"
      aria-label={t("matchMap")}
    >
      {bubbles.map(({ g, slot, r, people, style }, i) => (
        <g
          key={g.answer}
          className="cursor-pointer outline-none transition-all duration-200 focus-visible:[&>circle:first-of-type]:stroke-[4]"
          role="button"
          tabIndex={0}
          aria-label={`${g.answer} · ${t("editPoints")}`}
          onClick={() => onSelect?.(g.answer)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(-1)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect?.(g.answer);
            }
          }}
          style={{
            opacity: hover === -1 || hover === i ? 1 : 0.28,
            transformOrigin: `${slot.x}px ${slot.y}px`,
            transform: hover === i ? "scale(1.05)" : undefined,
          }}
          onPointerEnter={() => setHover(i)}
          onPointerLeave={() => setHover(-1)}
        >
          {people.flatMap((a, ai) =>
            people.slice(ai + 1).map((b, bi) => (
              <line
                key={`${ai}-${bi}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                pathLength="1"
                strokeDasharray="1"
                strokeWidth="1.5"
                opacity=".5"
                className={style.stroke}
                style={{ animation: "draw 0.9s ease-out both" }}
              />
            ))
          )}
          {people.map((o) => (
            <line
              key={o.p.id}
              x1={o.x}
              y1={o.y}
              x2={slot.x}
              y2={slot.y}
              pathLength="1"
              strokeDasharray="1"
              strokeWidth="2"
              className={style.stroke}
              style={{ animation: "draw 0.9s ease-out both" }}
            />
          ))}

          <circle cx={slot.x} cy={slot.y} r={r} strokeWidth="2" className={`${style.fill} ${style.stroke}`} />
          <text
            x={slot.x}
            y={slot.y + (r > 50 ? 10 : 6)}
            textAnchor="middle"
            fontWeight="700"
            fontSize={r > 80 ? 34 : r > 50 ? 22 : 15}
            className="fill-ink"
          >
            {g.answer}
          </text>
          {g.count > 1 && (
            <text x={slot.x} y={slot.y + r * 0.58} textAnchor="middle" fontSize="12" className="fill-muted">
              {tn("matchedOne", "matchedMany", g.count)}
            </text>
          )}

          {people.map((o) => (
            <g key={`${o.p.id}-av`}>
              <circle cx={o.x} cy={o.y} r="17" className={style.dot} />
              <image
                href={getAvatarSrc(o.p)}
                x={o.x - 14}
                y={o.y - 14}
                width="28"
                height="28"
                preserveAspectRatio="xMidYMid meet"
              />
              <title>{o.p.name}</title>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
