import { useSettings } from "../context/SettingsContext";

export function GoogleBar() {
  return (
    <div aria-hidden="true" className="grid h-1 grid-cols-4">
      <i className="bg-g-blue" />
      <i className="bg-g-red" />
      <i className="bg-g-yellow" />
      <i className="bg-g-green" />
    </div>
  );
}

export function Glow({ color, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-[80px] ${className}`}
      style={{ background: color }}
    />
  );
}

export const SOFT_TINTS = ["bg-blue-soft", "bg-red-soft", "bg-yellow-soft", "bg-green-soft"];

export function CountdownRing({ timeLeft, total, size = 168 }) {
  const { t } = useSettings();
  const urgent = timeLeft <= 7;
  const color = urgent ? "var(--color-g-red)" : "var(--color-g-blue)";
  const deg = (timeLeft / Math.max(1, total)) * 360;
  const inner = size - 24;
  return (
    <div
      role="timer"
      aria-label={t("secondsLeft", { n: timeLeft })}
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${deg}deg, var(--color-chip) 0deg)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full bg-surface"
        style={{
          width: inner,
          height: inner,
          animation: urgent && timeLeft > 0 ? "beat 1s ease-in-out infinite" : undefined,
        }}
      >
        <strong
          className={`font-bold leading-none tracking-tight tabular-nums ${urgent ? "text-red-ink" : "text-ink"}`}
          style={{ fontSize: size * 0.33 }}
        >
          {timeLeft}
        </strong>
        <span className="mt-1 text-xs text-muted">{t("seconds")}</span>
      </div>
    </div>
  );
}

export function RoundProgress({ current, total }) {
  const { t } = useSettings();
  const colors = ["bg-g-blue", "bg-g-red", "bg-g-yellow", "bg-g-green"];
  return (
    <div className="flex w-full max-w-[520px] items-center gap-3.5">
      <span className="whitespace-nowrap text-xs text-muted">{t("roundProgress")}</span>
      <div
        className="grid flex-1 gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <i
            key={i}
            className={`h-1.5 rounded-sm ${i < current ? colors[i % 4] : "bg-track"}`}
          />
        ))}
      </div>
      <strong className="text-[13px] tabular-nums">
        {current} / {total}
      </strong>
    </div>
  );
}
