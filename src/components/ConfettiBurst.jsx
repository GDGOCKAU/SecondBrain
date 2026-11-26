import { useEffect, useRef } from "react";

const COLORS = ["#4285f4", "#ea4335", "#f9ab00", "#34a853"];

// Fires a burst of Google-coloured confetti whenever `trigger` changes (and once on mount).
export default function ConfettiBurst({ trigger }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    let particles = Array.from({ length: 160 }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 8 + Math.random() * 11;
      return {
        x: w / 2,
        y: h * 0.6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        color: COLORS[i % 4],
        pw: 6 + Math.random() * 6,
        ph: 4 + Math.random() * 6,
      };
    });

    let frame;
    const step = () => {
      c.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.vy += 0.25;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph);
        c.restore();
      });
      particles = particles.filter((p) => p.y < h + 30);
      if (particles.length) frame = requestAnimationFrame(step);
      else c.clearRect(0, 0, w, h);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  return (
    <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />
  );
}
