import { useEffect, useRef, useState } from "react";
import { Routes, useLocation } from "react-router-dom";

const COLOR_VARS = ["--color-g-blue", "--color-g-red", "--color-g-yellow", "--color-g-green"];
const DURATION = 1100;

// Draws a web of connected nodes over the page; calls onSwap at the midpoint (page changes under it).
function LinesOverlay({ onSwap, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const style = getComputedStyle(document.documentElement);
    const colors = COLOR_VARS.map((v) => style.getPropertyValue(v).trim());
    const bg = style.getPropertyValue("--color-canvas").trim();

    const count = Math.min(40, Math.max(16, Math.round((w * h) / 30000)));
    const pts = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      c: colors[i % 4],
    }));
    const edges = [];
    pts.forEach((a, i) => {
      pts
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j > i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach((o) => edges.push([i, o.j]));
    });

    let swapped = false;
    let frame;
    const t0 = performance.now();
    const step = (now) => {
      const t = (now - t0) / DURATION;
      const draw = Math.min(1, t / 0.5);
      const fade = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;

      c.clearRect(0, 0, w, h);
      if (t > 0.42 && t < 0.8) {
        c.globalAlpha = Math.min(1, (t - 0.42) / 0.1) * fade;
        c.fillStyle = bg;
        c.fillRect(0, 0, w, h);
      }
      c.globalAlpha = fade;
      edges.forEach(([ai, bi], k) => {
        const a = pts[ai];
        const b = pts[bi];
        const p = Math.min(1, Math.max(0, draw * 1.4 - (k / edges.length) * 0.4));
        c.strokeStyle = a.c;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p);
        c.stroke();
      });
      pts.forEach((a) => {
        c.fillStyle = a.c;
        c.beginPath();
        c.arc(a.x, a.y, 4 * Math.min(1, draw * 2), 0, Math.PI * 2);
        c.fill();
      });

      if (t > 0.55 && !swapped) {
        swapped = true;
        onSwap();
      }
      if (t < 1) frame = requestAnimationFrame(step);
      else onDone();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] size-full" />;
}

// <Routes> whose page change is covered by the connecting-lines transition.
export default function AnimatedRoutes({ children }) {
  const location = useLocation();
  const [shown, setShown] = useState(location);
  const [active, setActive] = useState(false);
  const latest = useRef(location);
  const shownRef = useRef(location);
  latest.current = location;
  shownRef.current = shown;

  useEffect(() => {
    if (location.key === shownRef.current.key) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || location.pathname === shownRef.current.pathname) {
      setShown(location);
      return;
    }
    setActive(true);
  }, [location]);

  const swap = () => {
    setShown(latest.current);
    window.scrollTo(0, 0);
  };
  const done = () => {
    setActive(false);
    if (latest.current.key !== shownRef.current.key && latest.current.pathname !== shownRef.current.pathname) {
      setShown(latest.current);
    }
  };

  return (
    <>
      <Routes location={shown}>{children}</Routes>
      {active && <LinesOverlay onSwap={swap} onDone={done} />}
    </>
  );
}
