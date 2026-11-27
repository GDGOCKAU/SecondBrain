import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Routes, useLocation } from "react-router-dom";

const COLOR_VARS = ["--color-g-blue", "--color-g-red", "--color-g-yellow", "--color-g-green"];
const DURATION = 1000; // a calm, soft pass: fades in, draws gently, fades out

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

    const count = Math.min(12, Math.max(7, Math.round((w * h) / 110000)));
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
        .slice(0, 1)
        .forEach((o) => edges.push([i, o.j]));
    });

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.max(0, (now - t0) / DURATION);
      c.clearRect(0, 0, w, h);
      if (t >= 1) return;

      const raw = Math.min(1, t / 0.7);
      const draw = 1 - (1 - raw) ** 2; // gentle ease out
      // one smooth swell: fades in and out, never fully opaque
      c.globalAlpha = 0.42 * Math.sin(Math.PI * t) ** 1.5;
      edges.forEach(([ai, bi], k) => {
        const a = pts[ai];
        const b = pts[bi];
        const p = Math.min(1, Math.max(0, draw * 1.4 - (k / edges.length) * 0.4));
        c.strokeStyle = a.c;
        c.lineWidth = 1.3;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p);
        c.stroke();
      });
      pts.forEach((a) => {
        c.fillStyle = a.c;
        c.beginPath();
        c.arc(a.x, a.y, 3.2 * Math.min(1, draw * 2), 0, Math.PI * 2);
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

  // Portaled to <body> so it sits in the root stacking context: above the
  // NetworkBackground (z-0) but below the page content wrapper (z-10).
  return createPortal(
    <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] size-full" />,
    document.body,
  );
}

export default function AnimatedRoutes({ children }) {
  const { pathname } = useLocation();

  return (
    <>
      <div key={pathname} className="page-enter">
        <Routes>{children}</Routes>
      </div>
      <LinesOverlay pathname={pathname} />
    </>
  );
}
