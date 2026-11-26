import { useEffect, useRef } from "react";
import qrcode from "qrcode-generator";
import gdgLogo from "../assets/gdg-logo.png";

// Slightly deeper than the UI tokens so every dot keeps enough contrast on white to scan reliably.
const DOT_COLORS = ["#4285f4", "#ea4335", "#d99200", "#34a853"];
const INK = "#1f2328";

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// A scannable QR code: dots coloured by quadrant, dark finder squares, GDG logo in the middle.
export default function StyledQr({ value, size = 200, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const px = size * dpr;
    canvas.width = px;
    canvas.height = px;
    const c = canvas.getContext("2d");

    const qr = qrcode(0, "H");
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const quiet = 2;
    const cell = px / (n + quiet * 2);
    const isFinder = (r, k) => (r < 7 && k < 7) || (r < 7 && k >= n - 7) || (r >= n - 7 && k < 7);

    const logoW = px * 0.24;
    const logoH = logoW * (557 / 973);
    const clear = { x: px / 2 - logoW * 0.62, y: px / 2 - logoH * 0.9, w: logoW * 1.24, h: logoH * 1.8 };

    let cancelled = false;
    const paint = (logo) => {
      if (cancelled) return;
      c.clearRect(0, 0, px, px);
      c.fillStyle = "#fff";
      c.fillRect(0, 0, px, px);

      for (let r = 0; r < n; r++) {
        for (let k = 0; k < n; k++) {
          if (!qr.isDark(r, k) || isFinder(r, k)) continue;
          const x = (k + quiet) * cell;
          const y = (r + quiet) * cell;
          if (x + cell > clear.x && x < clear.x + clear.w && y + cell > clear.y && y < clear.y + clear.h) continue;
          c.fillStyle = DOT_COLORS[(r < n / 2 ? 0 : 2) + (k < n / 2 ? 0 : 1)];
          c.beginPath();
          c.arc(x + cell / 2, y + cell / 2, cell * 0.43, 0, Math.PI * 2);
          c.fill();
        }
      }

      [[0, 0], [0, n - 7], [n - 7, 0]].forEach(([r, k]) => {
        const x = (k + quiet) * cell;
        const y = (r + quiet) * cell;
        c.fillStyle = INK;
        roundRect(c, x, y, cell * 7, cell * 7, cell * 2);
        c.fill();
        c.fillStyle = "#fff";
        roundRect(c, x + cell, y + cell, cell * 5, cell * 5, cell * 1.4);
        c.fill();
        c.fillStyle = INK;
        roundRect(c, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.9);
        c.fill();
      });

      c.fillStyle = "#fff";
      roundRect(c, clear.x, clear.y, clear.w, clear.h, px * 0.03);
      c.fill();
      if (logo) c.drawImage(logo, px / 2 - logoW / 2, px / 2 - logoH / 2, logoW, logoH);
    };

    paint(null);
    const img = new Image();
    img.onload = () => paint(img);
    img.src = gdgLogo;
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      className="block rounded-xl bg-white"
    />
  );
}
