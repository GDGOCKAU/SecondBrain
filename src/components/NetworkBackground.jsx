import { useEffect, useRef } from "react";

const NODE_VARS = ["--color-g-blue", "--color-g-red", "--color-g-yellow", "--color-g-green"];
const LINK_DISTANCE = 120;
const MOUSE_DISTANCE = 160;

// Drifting Google-coloured nodes that link up when close, and reach for the pointer.
export default function NetworkBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes = [];
    let colors = [];
    let ink = "#1f2328";
    let pointer = { x: -9999, y: -9999 };
    let frame = 0;

    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors = NODE_VARS.map((v) => style.getPropertyValue(v).trim() || "#4285f4");
      ink = style.getPropertyValue("--color-ink").trim() || "#1f2328";
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(80, Math.round((width * height) / 14000));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 2 + Math.random() * 2.2,
        c: i % 4,
      }));
      draw(false);
    };

    function draw(advance) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (advance) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > width) a.vx *= -1;
          if (a.y < 0 || a.y > height) a.vy *= -1;
        }

        const dx = a.x - pointer.x;
        const dy = a.y - pointer.y;
        const dm = Math.hypot(dx, dy);
        if (dm < MOUSE_DISTANCE) {
          if (advance) {
            a.x -= dx * 0.008;
            a.y -= dy * 0.008;
          }
          ctx.globalAlpha = (1 - dm / MOUSE_DISTANCE) * 0.8;
          ctx.strokeStyle = colors[a.c];
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.globalAlpha = (1 - d / LINK_DISTANCE) * 0.2;
            ctx.strokeStyle = ink;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.6;
      for (const n of nodes) {
        ctx.fillStyle = colors[n.c];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const loop = () => {
      draw(true);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (!reduceMotion && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    readColors();
    resize();
    start();

    // Re-read colours when the theme class changes on <html>.
    const observer = new MutationObserver(() => {
      readColors();
      draw(false);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
