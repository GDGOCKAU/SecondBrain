import { useEffect, useRef } from "react";
import { Routes, useLocation } from "react-router-dom";

const COLOR_VARS = ["--color-g-blue", "--color-g-red", "--color-g-yellow", "--color-g-green"];
const DURATION = 240;

function LinesOverlay({ pathname }) {
  const ref = useRef(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    window.scrollTo(0, 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    const c = canvas.getContext("2d");
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const style = getComputedStyle(document.documentElement);
    const colors = COLOR_VARS.map((v) => style.getPropertyValue(v).trim());

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

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.max(0, (now - t0) / DURATION);
      c.clearRect(0, 0, w, h);
      if (t >= 1) return;

      const draw = Math.min(1, t / 0.5);
      c.globalAlpha = Math.min(1, (1 - t) * 2);
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

      frame = requestAnimationFrame(step);
    };
    let frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      c.clearRect(0, 0, w, h);
    };
  }, [pathname]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] size-full" />;
}

export default function AnimatedRoutes({ children }) {
  const { pathname } = useLocation();

  return (
    <>
      <Routes>{children}</Routes>
      <LinesOverlay pathname={pathname} />
    </>
  );
}
