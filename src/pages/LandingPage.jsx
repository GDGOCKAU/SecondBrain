import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BrainMark from "../components/BrainMark";
import { ArrowIcon, PlusIcon } from "../components/Icons";
import LobbyModal from "../components/LobbyModal";

export default function LandingPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [hostedCode, setHostedCode] = useState(null);

  const handleJoin = (event) => {
    event.preventDefault();
    const normalizedCode = roomCode.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      setMessage("Enter a valid room code to continue.");
      return;
    }

    navigate(`/avatar?code=${normalizedCode}`);
  };

  const handleHost = () => {
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setHostedCode(newCode);
    setMessage("");
  };

  return (
    <main className="app-shell">
      <div className="ambient-grid" />
      <div className="aurora aurora-red" />
      <div className="aurora aurora-blue" />
      <div className="aurora aurora-green" />

      <Header />

      <section className="hero-layout pt-24">
        <div className="brand-stage">
          <BrainMark />
          <div className="title-block mt-8">
            <p className="eyebrow">
              <span /> THINK FAST. PLAY SMART.
            </p>
            <h1>
              SECOND
              <span>BRAIN</span>
            </h1>
            <p className="tagline">The game for people who think they know everything.</p>
          </div>
        </div>

        <div className="game-card-wrap">
          <div className="decor-dot decor-dot-one" />
          <div className="decor-dot decor-dot-two" />
          <div className="game-card">
            <div className="card-shine" />
            <div className="card-heading">
              <span className="step-number">01</span>
              <div>
                <p className="card-kicker">READY TO PLAY?</p>
                <h2>Join the game</h2>
              </div>
            </div>

            <form onSubmit={handleJoin} noValidate>
              <label htmlFor="room-code">ROOM CODE</label>
              <div className="input-shell">
                <span className="hash">#</span>
                <input
                  id="room-code"
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(event.target.value.replace(/\s/g, "").slice(0, 8));
                    setMessage("");
                  }}
                  placeholder="ENTER CODE"
                  autoComplete="off"
                  aria-describedby="room-feedback"
                />
                <span className="input-status" />
              </div>

              <button className="primary-button" type="submit">
                <span>JOIN GAME</span>
                <span className="button-icon">
                  <ArrowIcon />
                </span>
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="secondary-button" type="button" onClick={handleHost}>
              <span className="button-icon">
                <PlusIcon />
              </span>
              <span>HOST A GAME</span>
              <small>CREATE A NEW ROOM</small>
            </button>

            <p
              id="room-feedback"
              className={`feedback ${message ? "visible" : ""}`}
              aria-live="polite"
            >
              {message || "\u00A0"}
            </p>

            <p className="card-note">
              <span className="shield">✓</span>
              No account needed. Just bring your brain.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <p>
          PLAY WITH FRIENDS
        </p>
        <div className="footer-line" />
        <p>BEST PLAYED LOUD</p>
      </footer>

      <LobbyModal roomCode={hostedCode} onClose={() => setHostedCode(null)} />
    </main>
  );
}