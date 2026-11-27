import { useEffect, useState } from "react";

// Counts from 0 up to `target` once the step appears, so the score lands with a little drama.
export function useCountUp(target, duration = 1300, delay = 450) {
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [value, setValue] = useState(() => (reduced ? target : 0));
  useEffect(() => {
    if (reduced) return;
    let frame;
    const start = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay, reduced]);
  return value;
}
