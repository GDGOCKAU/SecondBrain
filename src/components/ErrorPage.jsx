import Header from "./Header";
import { GoogleBar } from "./Ui";
import { ReplayIcon, HomeIcon } from "./Icons";
import { useSettings } from "../context/SettingsContext";

// Same look as the rest of the app. kind="crash" (something threw) or "notFound" (no such route).
export default function ErrorPage({ kind = "crash", onRetry }) {
  const { t } = useSettings();
  const notFound = kind === "notFound";

  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 items-center justify-center p-5">
        <section className="card flex w-full max-w-[460px] flex-col items-center gap-5 p-8 text-center shadow-hero">
          <div className="flex items-center gap-2" aria-hidden="true">
            <i className="size-3 rounded-full bg-g-blue" />
            <i className="size-3 rounded-full bg-g-red" />
            <i className="size-3 rounded-full bg-g-yellow" />
            <i className="size-3 rounded-full bg-g-green" />
          </div>
          <b className="text-[clamp(3.5rem,14vw,5.5rem)] font-bold leading-none tracking-[-0.05em] text-g-red">
            {notFound ? "404" : "!"}
          </b>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-2xl font-bold tracking-tight">
              {notFound ? t("errNotFoundTitle") : t("errCrashTitle")}
            </h1>
            <p className="m-0 text-base text-muted">{notFound ? t("errNotFoundBody") : t("errCrashBody")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {!notFound && onRetry && (
              <button type="button" className="btn-primary !h-11" onClick={onRetry}>
                <ReplayIcon />
                {t("errTryAgain")}
              </button>
            )}
            {/* A plain link (full reload) so it also works after a crash */}
            <a href="/" className={`${notFound ? "btn-primary" : "btn-tonal"} !h-11`}>
              <HomeIcon />
              {t("homePage")}
            </a>
          </div>
        </section>
      </main>
      <GoogleBar />
    </div>
  );
}
