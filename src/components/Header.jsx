import { Link } from "react-router-dom";
import gdgLogo from "../assets/gdg-logo.png";

export default function Header() {
  return (
    <header className="topbar fixed top-0 w-full z-50 bg-[#090914]/90 backdrop-blur-md">
      <Link className="mini-brand" to="/" aria-label="Second Brain home">
        <div className="w-8 h-8 flex items-center justify-center rounded-md overflow-hidden">
          <img
            src={gdgLogo}
            alt="Second Brain Logo"
          />
        </div>
        GDG KAU
      </Link>

      <div className="live-badge">
        <span />
        LIVE & READY
      </div>
    </header>
  );
}