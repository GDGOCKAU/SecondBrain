import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon, XIcon } from "./Icons";
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
  const [note, setNote] = useState("");

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

      c.fillStyle = "#5f6570";
      c.font = `500 34px ${FONT}`;
      c.fillText("MindSync · GDG KAU", W / 2, 1300);

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

  const message = t("shareMessage", { n: rank, pts: player.score.toLocaleString() });
  const getBlob = () => new Promise((resolve) => ref.current.toBlob(resolve, "image/png"));

  const download = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindsync-result.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Phones: the system share sheet with the image and the message together.
  // Elsewhere: save the image.
  const share = async () => {
    setBusy(true);
    setNote("");
    try {
      const blob = await getBlob();
      if (!blob) return;
      const file = new File([blob], "mindsync-result.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: message, title: "MindSync" });
          return;
        } catch {
          // cancelled or failed: fall back to download
        }
      }
      download(blob);
      setNote(t("shareSaved"));
    } finally {
      setBusy(false);
    }
  };

  // X and WhatsApp links can only carry text, never a picture. So the image goes to the clipboard
  // (or is saved when the browser refuses) and the post opens with the message already written.
  const shareTo = async (kind) => {
    setBusy(true);
    setNote("");
    // opened inside the click so popup blockers allow it; pointed at the app once the image is ready
    const win = window.open("", "_blank");
    if (win) win.opener = null;
    try {
      const blob = await getBlob();
      let status = "shareSaved";
      if (blob) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          status = "shareCopied";
        } catch {
          download(blob);
        }
      }
      const text = encodeURIComponent(message);
      const url =
        kind === "x" ? `https://twitter.com/intent/tweet?text=${text}` : `https://wa.me/?text=${text}`;
      if (win) win.location.href = url;
      else window.open(url, "_blank", "noopener");
      setNote(t(status));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="share-title"
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-3"
    >
      <canvas
        ref={ref}
        role="img"
        aria-label={t("shareCardTitle")}
        className="aspect-[4/5] w-24 shrink-0 rounded-xl border border-line md:w-28"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 id="share-title" className="m-0 text-[15px] font-semibold">
          {t("shareCardTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-primary !h-11 !px-3 text-sm" onClick={() => shareTo("whatsapp")} disabled={busy}>
            <WhatsAppIcon />
            {t("shareWhatsApp")}
          </button>
          <button type="button" className="btn-primary !h-11 !px-3 text-sm" onClick={() => shareTo("x")} disabled={busy}>
            <XIcon />
            {t("shareX")}
          </button>
        </div>
        <button type="button" className="btn-outline !h-10 text-sm" onClick={share} disabled={busy}>
          {t("shareSave")}
        </button>
        {note && (
          <p role="status" className="m-0 text-xs text-muted">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
