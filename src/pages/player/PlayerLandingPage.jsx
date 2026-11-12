import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import BrainMark from "../../components/BrainMark";
import { ArrowIcon } from "../../components/Icons";

export default function PlayerLandingPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");

  const handleJoin = (event) => {
    event.preventDefault();
    const normalizedCode = roomCode.trim().toUpperCase();

    if (normalizedCode.length < 4) {
      setMessage("Enter a valid room code to continue.");
      return;
    }

    navigate(`/avatar?code=${normalizedCode}`);
  };

  return (
    <main className="app-shell min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto flex flex-col items-center">
      <div className="ambient-grid" />
      <div className="aurora aurora-red" />
      <div className="aurora aurora-blue" />
      <div className="aurora aurora-green" />

      <Header />

      {/* Centered Mobile Container */}
      <section className="w-full max-w-md mx-auto px-5 pt-24 pb-16 flex flex-col items-center text-center">
        
        {/* Brain pulled down & dead-centered */}
        <div className="w-full flex flex-col items-center justify-center mt-2">
          <div className="[&_.brain-wrap]:!m-0 [&_.brain-wrap]:!w-[72vw] [&_.brain-wrap]:!max-w-[280px] flex justify-center">
            <BrainMark />
          </div>

          {/* Centered Title Block */}
          <div className="title-block mt-2 flex flex-col items-center text-center">
            <p className="eyebrow justify-center !mb-3">
              <span /> THINK FAST. PLAY SMART.
            </p>
            <h1 className="!text-[52px] !leading-[0.82] text-center">
              SECOND
              <span>BRAIN</span>
            </h1>
            <p className="tagline !mt-4 !text-xs max-w-[280px] mx-auto text-center">
              The game for people who think they know everything.
            </p>
          </div>
        </div>

        {/* Centered Join Card */}
        <div className="game-card-wrap !w-full !max-w-full mt-7 mx-auto">
          <div className="game-card !p-6">
            <div className="card-shine" />
            <div className="card-heading !mb-6 text-left">
              <span className="step-number">01</span>
              <div>
                <p className="card-kicker">READY TO PLAY?</p>
                <h2 className="!text-2xl">Join the game</h2>
              </div>
            </div>

            <form onSubmit={handleJoin} noValidate className="text-left">
              <label htmlFor="mobile-room-code">ROOM CODE</label>
              <div className="input-shell !h-14">
                <span className="hash">#</span>
                <input
                  id="mobile-room-code"
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(event.target.value.replace(/\s/g, "").slice(0, 8));
                    setMessage("");
                  }}
                  placeholder="ENTER CODE"
                  autoComplete="off"
                  aria-describedby="mobile-room-feedback"
                />
                <span className="input-status" />
              </div>

              <button className="primary-button !h-14" type="submit">
                <span>JOIN GAME</span>
                <span className="button-icon">
                  <ArrowIcon />
                </span>
              </button>
            </form>

            <p
              id="mobile-room-feedback"
              className={`feedback ${message ? "visible" : ""}`}
              aria-live="polite"
            >
              {message || "\u00A0"}
            </p>

            <p className="card-note !mt-1">
              <span className="shield">✓</span>
              No account needed. Just bring your brain.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}