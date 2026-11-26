import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CloseIcon } from "./Icons";
import { useSettings } from "../context/SettingsContext";

// Accepts a join link (…?code=KAU1) or a plain room code.
export function extractRoomCode(text) {
  const value = (text || "").trim();
  try {
    const code = new URL(value).searchParams.get("code");
    if (code) return code.toUpperCase().slice(0, 8);
  } catch {
    // not a URL
  }
  return /^[A-Za-z0-9]{4,8}$/.test(value) ? value.toUpperCase() : null;
}

export function QrIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8" />
    </svg>
  );
}

export default function QrScanner({ onCode, onClose }) {
  const { t } = useSettings();
  const videoRef = useRef(null);
  const [errorKey, setErrorKey] = useState("");

  useEffect(() => {
    let stream;
    let frame;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const scan = () => {
      const video = videoRef.current;
      if (stopped || !video) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(img.data, img.width, img.height);
        const code = result && extractRoomCode(result.data);
        if (code) {
          onCode(code);
          return;
        }
      }
      frame = requestAnimationFrame(scan);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorKey("scanErrNoCam");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        frame = requestAnimationFrame(scan);
      } catch {
        setErrorKey("scanErrDenied");
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-title"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-hero">
        <div className="flex items-center justify-between">
          <h2 id="scan-title" className="m-0 text-xl font-semibold tracking-tight">
            {t("scanTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("scanClose")}
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-muted hover:bg-field"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-panel bg-black">
          <video ref={videoRef} playsInline muted className="size-full object-cover" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80"
          />
        </div>

        <p
          role={errorKey ? "alert" : undefined}
          className={`m-0 text-sm ${errorKey ? "text-red-ink" : "text-muted"}`}
        >
          {errorKey ? t(errorKey) : t("scanHint")}
        </p>
      </div>
    </div>
  );
}
