import { Link } from "react-router-dom";
import gdgLogo from "../assets/gdg-logo.png";
import { useSettings } from "../context/SettingsContext";
import SettingsControls from "./SettingsControls";

export default function Header({ children, showOrg = false, compact = false, homeLink = true }) {
  const { t } = useSettings();
  // Participants mid-game get a plain logo: tapping it must not throw them out to the home page
  const Brand = homeLink ? Link : "div";
  const brandProps = homeLink ? { to: "/", "aria-label": t("home") } : {};
  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-line bg-surface/80 backdrop-blur-xl ${
        compact ? "h-14 px-4" : "h-16 px-5 md:px-8"
      }`}
    >
      <Brand className="flex min-w-0 items-center gap-3" {...brandProps}>
        <img src={gdgLogo} alt="GDG logo" className={compact ? "w-9 shrink-0" : "w-10 shrink-0"} />
        {showOrg ? (
          <span className="flex flex-col leading-tight">
            <strong className="text-[15px] font-bold">GDG KAU</strong>
            <span className="hidden text-[11px] text-muted sm:block">King Abdulaziz University</span>
          </span>
        ) : (
          <strong
            className={`font-semibold ${compact ? "hidden text-sm min-[400px]:block" : "text-[15px]"}`}
          >
            MindSync
          </strong>
        )}
      </Brand>
      <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2.5"}`}>
        {children}
        <SettingsControls compact={compact} />
      </div>
    </header>
  );
}
