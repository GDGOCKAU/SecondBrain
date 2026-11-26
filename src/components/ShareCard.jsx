import { useEffect, useRef, useState } from "react";
import { getAvatarSrc } from "./PlayerAvatar";
import gdgLogo from "../assets/gdg-logo.png";
import { useSettings } from "../context/SettingsContext";

const W = 1080;
const H = 1350;
const FONT = '"Google Sans Flex", "Noto Sans Arabic", system-ui, sans-serif';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

const hasArabic = (s) => /[؀-ۿ]/.test(s);

// A result card the player can save or share as an image (always light, for any chat app).
export default function ShareCard({ player, rank }) {
  const { t, lang } = useSettings();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts?.ready;
      const [avatar, logo] = await Promise.all([loadImage(getAvatarSrc(player)), loadImage(gdgLogo)]);
      if (cancelled) return;
      const canvas = ref.current;
      canvas.width = W;
      canvas.height = H;
      const c = canvas.getContext("2d");

      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, W, H);

      // soft colour blobs
      [[W - 80, 140, 360, "#4285f4", 0.18], [120, H - 220, 320, "#f9ab00", 0.2], [W - 160, H - 160, 240, "#34a853", 0.16]].forEach(
        ([x, y, r, col, a]) => {
          const g = c.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, col);
          g.addColorStop(1, "rgba(255,255,255,0)");
          c.globalAlpha = a * 2.2;
          c.fillStyle = g;
          c.fillRect(0, 0, W, H);
        }
      );
      c.globalAlpha = 1;

      c.textAlign = "center";
      c.direction = "inherit";

      if (logo) {
        const lw = 190;
        c.drawImage(logo, W / 2 - lw / 2, 110, lw, lw * (logo.height / logo.width));
      }

      // avatar
      const as = 340;
      const ax = W / 2 - as / 2;
      const ay = 330;
      c.fillStyle = "#e8f0fe";
      roundRect(c, ax, ay, as, as, as * 0.3);
      c.fill();
      if (avatar) c.drawImage(avatar, ax + 20, ay + 20, as - 40, as - 40);

      // name
      c.fillStyle = "#1f2328";
      c.font = `700 84px ${FONT}`;
      c.direction = hasArabic(player.name) ? "rtl" : "ltr";
      c.fillText(player.name, W / 2, 800, W - 160);
      c.direction = "inherit";

      // rank chip
      const chip = t("shareRank", { n: rank });
      c.font = `600 44px ${FONT}`;
      const cw = c.measureText(chip).width + 90;
      c.fillStyle = "#e8f0fe";
      roundRect(c, W / 2 - cw / 2, 850, cw, 84, 42);
      c.fill();
      c.fillStyle = "#1a73e8";
      c.fillText(chip, W / 2, 908);

      // score
      c.fillStyle = "#1f2328";
      c.font = `700 150px ${FONT}`;
      c.fillText(String(player.score.toLocaleString()), W / 2, 1100);
      c.fillStyle = "#5f6570";
      c.font = `500 40px ${FONT}`;
      c.fillText(t("sharePointsLabel"), W / 2, 1160);

      c.font = `500 34px ${FONT}`;
      c.fillText("MindSync · GDG KAU", W / 2, 1262);

      // four-colour bar
      ["#4285f4", "#ea4335", "#f9ab00", "#34a853"].forEach((col, i) => {
        c.fillStyle = col;
        c.fillRect((W / 4) * i, H - 14, W / 4, 14);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [player, rank, t, lang]);

  const share = async () => {
    setBusy(true);
    try {
      const blob = await new Promise((resolve) => ref.current.toBlob(resolve, "image/png"));
      if (!blob) return;
      const file = new File([blob], "mindsync-result.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "MindSync" });
          return;
        } catch {
          // cancelled or failed: fall back to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mindsync-result.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="share-title"
      className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-4"
    >
      <h2 id="share-title" className="m-0 self-start px-1 text-[17px] font-semibold">
        {t("shareCardTitle")}
      </h2>
      <canvas
        ref={ref}
        role="img"
        aria-label={t("shareCardTitle")}
        className="aspect-[4/5] w-full max-w-[300px] rounded-2xl border border-line"
      />
      <button type="button" className="btn-primary w-full" onClick={share} disabled={busy}>
        {t("shareSave")}
      </button>
    </section>
  );
}
