import { useEffect, useRef, useState } from "react";
import { BRAIN_FOLDS, BRAIN_OUTLINE } from "./brainShape";
import { getAvatarSrc } from "./PlayerAvatar";
import { useSettings } from "../context/SettingsContext";

export const GROUP_STYLES = [
  { stroke: "stroke-g-yellow", fill: "fill-yellow-soft", dot: "fill-g-yellow", chip: "bg-yellow-soft text-yellow-ink", bar: "bg-g-yellow" },
  { stroke: "stroke-g-blue", fill: "fill-blue-soft", dot: "fill-g-blue", chip: "bg-blue-soft text-action", bar: "bg-g-blue" },
  { stroke: "stroke-g-red", fill: "fill-red-soft", dot: "fill-g-red", chip: "bg-red-soft text-red-ink", bar: "bg-g-red" },
  { stroke: "stroke-g-green", fill: "fill-green-soft", dot: "fill-g-green", chip: "bg-green-soft text-green-ink", bar: "bg-g-green" },
  { stroke: "stroke-g-blue", fill: "fill-blue-soft", dot: "fill-g-blue", chip: "bg-blue-soft text-action", bar: "bg-g-blue" },
];

// The drawing spans about x 2.5-30, y 3.3-22 (see brainShape.js).
const BRAIN_W = 27.5; // drawing units
const BRAIN_H = 19;
const BRAIN_CX = 16.25;
const BRAIN_CY = 12.7;

// Brain slots (viewBox 640x420). The most-matched answer takes the biggest, centre-left slot.
const SLOTS = [
  { x: 200, y: 175 },
  { x: 470, y: 100 },
  { x: 535, y: 265 },
  { x: 370, y: 325 },
  { x: 85, y: 335 },
];
export const MAP_SLOTS = SLOTS.length;

// More people with the same answer = a bigger brain.
function widthFor(count) {
  return Math.min(150, 56 + (count - 1) * 18);
}

const shorten = (text, max = 16) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const MERGE_MS = 1150;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const brainTransform = (cx, cy, w) => {
  const s = w / BRAIN_W;
  return `translate(${cx - BRAIN_CX * s} ${cy - BRAIN_CY * s}) scale(${s})`;
};

// Answers as brains with the number of people inside; players link to the brain they picked, and to each
// other when they matched. Drag a whole brain onto another one: the two melt into one brain whose number is the sum.
export default function MatchMap({ groups, onSelect, onMergeGroup }) {
  const { t } = useSettings();
  const svgRef = useRef(null);
  const justDragged = useRef(false);
  const [hover, setHover] = useState(-1);
  const [drag, setDrag] = useState(null); // { id, from, startX, startY, x, y, moved }
  const [merge, setMerge] = useState(null); // { key, src, dst, ids, start, p }
  const shown = groups.slice(0, SLOTS.length);

  const brains = shown.map((g, i) => {
    const slot = SLOTS[i];
    const bw = widthFor(g.count);
    const s = bw / BRAIN_W;
    const bh = BRAIN_H * s;
    const orbit = bw / 2 + 34;
    const out = Math.atan2(slot.y - 190, slot.x - 320);
    const spread = g.players.length > 1 ? Math.min(1.6, 0.5 * g.players.length) : 0;
    const people = g.players.map((p, k) => {
      const a = out - spread / 2 + (g.players.length > 1 ? (spread * k) / (g.players.length - 1) : 0);
      return { p, x: slot.x + Math.cos(a) * orbit, y: slot.y + Math.sin(a) * orbit };
    });
    return { g, slot, bw, bh, s, people, style: GROUP_STYLES[i % GROUP_STYLES.length] };
  });

  // Plays the melt, then hands the real merge to the game (the list re-forms with one brain).
  useEffect(() => {
    if (!merge) return;
    const { ids, dst } = merge;
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / MERGE_MS);
      if (p < 1) {
        setMerge((m) => m && { ...m, p });
        raf = requestAnimationFrame(step);
      } else {
        onMergeGroup?.(ids, dst.g.answer);
        setMerge(null);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merge?.key]);

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  // the brain under a point, other than the one the player came from
  const dropTarget = (x, y, from) =>
    brains.findIndex(
      ({ g, slot, bw }) => g.answer !== from && Math.hypot(x - slot.x, y - slot.y) < bw / 2 + 14
    );

  const startDrag = (e, from) => {
    if (merge) return;
    justDragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = toSvg(e);
    setDrag({ from, startX: x, startY: y, x, y, moved: false });
  };

  const moveDrag = (e) => {
    if (!drag) return;
    const { x, y } = toSvg(e);
    setDrag({ ...drag, x, y, moved: drag.moved || Math.hypot(x - drag.startX, y - drag.startY) > 5 });
  };

  const endDrag = (e) => {
    if (!drag) return;
    if (drag.moved) {
      justDragged.current = true; // swallow the click that follows the release
      const { x, y } = toSvg(e);
      const target = dropTarget(x, y, drag.from);
      const src = brains.find((b) => b.g.answer === drag.from);
      if (target >= 0 && src) {
        const dst = brains[target];
        const ids = src.g.players.map((p) => p.id);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          onMergeGroup?.(ids, dst.g.answer);
        } else {
          setMerge({
            key: Date.now(),
            src,
            dst,
            ids,
            start: { x: src.slot.x + (x - drag.startX), y: src.slot.y + (y - drag.startY) },
            p: 0,
          });
        }
      }
    }
    setDrag(null);
  };

  const dragTarget = drag?.moved ? dropTarget(drag.x, drag.y, drag.from) : -1;
  // the brain being carried is drawn last so it floats above the others
  const ordered = brains.map((b, i) => ({ ...b, i }));
  if (drag?.moved) ordered.sort((a, b) => (a.g.answer === drag.from) - (b.g.answer === drag.from));

  // Everything that belongs to one brain: links, outline, number, label and its people.
  // Options let the merge fade the parts separately.
  const body = (b, { lineAnim = true, outline = 1, number = 1, people: peopleOp = 1, label = 1 } = {}) => {
    const { g, slot, bw, bh, s, people, style } = b;
    return (
      <>
        <g opacity={peopleOp}>
          {people.flatMap((a, ai) =>
            people.slice(ai + 1).map((c, bi) => (
              <line
                key={`${ai}-${bi}`}
                x1={a.x}
                y1={a.y}
                x2={c.x}
                y2={c.y}
                pathLength="1"
                strokeDasharray="1"
                strokeWidth="1.5"
                opacity=".5"
                className={style.stroke}
                style={lineAnim ? { animation: "draw 0.9s ease-out both" } : undefined}
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
              style={lineAnim ? { animation: "draw 0.9s ease-out both" } : undefined}
            />
          ))}
        </g>

        {/* hollow brain: soft fill, coloured outline */}
        <g
          opacity={outline}
          transform={`translate(${slot.x - BRAIN_CX * s} ${slot.y - BRAIN_CY * s}) scale(${s})`}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d={BRAIN_OUTLINE}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            className={`${style.fill} ${style.stroke}`}
          />
          <path
            d={BRAIN_FOLDS}
            fill="none"
            strokeWidth="1.2"
            opacity=".5"
            vectorEffect="non-scaling-stroke"
            className={style.stroke}
          />
        </g>
        <text
          x={slot.x}
          y={slot.y + bw * 0.13}
          textAnchor="middle"
          fontWeight="800"
          fontSize={Math.round(bw * 0.38)}
          className="fill-ink"
          opacity={number}
          style={{ pointerEvents: "none" }}
        >
          {g.count}
        </text>
        <text
          x={slot.x}
          y={slot.y + bh / 2 + 22}
          textAnchor="middle"
          fontWeight="700"
          fontSize="17"
          className="fill-ink"
          opacity={label}
          style={{ pointerEvents: "none" }}
        >
          {shorten(g.answer)}
        </text>

        <g opacity={peopleOp}>
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
                draggable={false}
              />
              <title>{o.p.name}</title>
            </g>
          ))}
        </g>
      </>
    );
  };

  // The melt: the dragged brain glides into the other, both soften into one gooey blob, and a single
  // brain (bigger, numbered with the sum) settles out of it.
  const meltScene = () => {
    const { src, dst, start, p } = merge;
    const move = ease(Math.min(1, p / 0.6));
    const cx = lerp(start.x, dst.slot.x, move);
    const cy = lerp(start.y, dst.slot.y, move);
    const dx = cx - src.slot.x;
    const dy = cy - src.slot.y;
    const total = src.g.count + dst.g.count;
    const finalW = widthFor(total);
    const grow = ease(smooth(0.35, 1, p));
    const mergedW = lerp(dst.bw, finalW, grow);
    const mergedIn = smooth(0.6, 0.95, p);
    const parts = 1 - smooth(0.22, 0.55, p); // the two outlined brains soften away
    const blob = smooth(0.12, 0.35, p) * (1 - smooth(0.72, 1, p));
    const fade = { lineAnim: false, outline: parts, number: 1 - smooth(0.1, 0.4, p), people: 1 - smooth(0.45, 0.85, p), label: 1 - smooth(0.5, 0.9, p) };
    const pop = 1 + 0.18 * Math.sin(Math.PI * smooth(0.7, 1, p));

    return (
      <g>
        <g>{body(dst, fade)}</g>
        <g transform={`translate(${dx} ${dy})`}>{body(src, { ...fade, label: fade.label })}</g>

        <g opacity={blob}>
          <g filter="url(#brain-goo)">
            <path
              d={BRAIN_OUTLINE}
              transform={`${brainTransform(dst.slot.x, dst.slot.y, lerp(dst.bw, mergedW, 0.6))}`}
              className={dst.style.dot}
            />
            <path
              d={BRAIN_OUTLINE}
              transform={brainTransform(cx, cy, lerp(src.bw, dst.bw, move))}
              className={src.style.dot}
            />
          </g>
        </g>

        <g opacity={mergedIn} strokeLinejoin="round" strokeLinecap="round">
          <g transform={brainTransform(dst.slot.x, dst.slot.y, mergedW)}>
            <path
              d={BRAIN_OUTLINE}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              className={`${dst.style.fill} ${dst.style.stroke}`}
            />
            <path
              d={BRAIN_FOLDS}
              fill="none"
              strokeWidth="1.2"
              opacity=".5"
              vectorEffect="non-scaling-stroke"
              className={dst.style.stroke}
            />
          </g>
          <text
            x={dst.slot.x}
            y={dst.slot.y + mergedW * 0.13}
            textAnchor="middle"
            fontWeight="800"
            fontSize={Math.round(mergedW * 0.38 * pop)}
            className="fill-ink"
            style={{ pointerEvents: "none" }}
          >
            {total}
          </text>
          <text
            x={dst.slot.x}
            y={dst.slot.y + (BRAIN_H * mergedW) / BRAIN_W / 2 + 22}
            textAnchor="middle"
            fontWeight="700"
            fontSize="17"
            className="fill-ink"
            style={{ pointerEvents: "none" }}
          >
            {shorten(dst.g.answer)}
          </text>
        </g>
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 420"
      className="h-full w-full select-none"
      role="img"
      aria-label={t("matchMap")}
    >
      <defs>
        <filter id="brain-goo" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>

      {ordered.map(({ g, slot, bw, bh, s, people, style, i }) => {
        if (merge && (g.answer === merge.src.g.answer || g.answer === merge.dst.g.answer)) return null;
        const carried = drag?.moved && drag.from === g.answer;
        const active = merge ? false : drag?.moved ? dragTarget === i || carried : hover === -1 || hover === i;
        const move = carried ? `translate(${drag.x - drag.startX}px, ${drag.y - drag.startY}px) ` : "";
        const grow = carried || hover === i || dragTarget === i ? "scale(1.05)" : "";
        return (
          <g
            key={g.answer}
            className={`${carried ? "cursor-grabbing" : "cursor-grab"} touch-none outline-none ${
              carried ? "" : "transition-all duration-200"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`${g.answer} · ${g.count} · ${t("editPoints")}`}
            onPointerDown={(e) => startDrag(e, g.answer)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDrag(null)}
            onClick={() => {
              if (justDragged.current) {
                justDragged.current = false;
                return;
              }
              if (!merge) onSelect?.(g.answer);
            }}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(-1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(g.answer);
              }
            }}
            style={{
              opacity: merge ? 0.45 : active ? 1 : 0.28,
              transformOrigin: `${slot.x}px ${slot.y}px`,
              transform: `${move}${grow}`.trim() || undefined,
            }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(-1)}
          >
            {body({ g, slot, bw, bh, s, people, style })}
          </g>
        );
      })}

      {merge && meltScene()}
    </svg>
  );
}
