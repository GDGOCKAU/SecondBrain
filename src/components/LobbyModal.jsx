import { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { ArrowIcon } from "./Icons";
import PlayerAvatar from "./PlayerAvatar";
import { useGame } from "../context/GameContext";

export default function LobbyModal({ roomCode, onClose }) {
  const navigate = useNavigate();
  const { game, startGame } = useGame();
  const [rounds, setRounds] = useState(10);
  const [timeLimit, setTimeLimit] = useState(20);

  if (!roomCode) return null;

  const joinUrl = `${window.location.origin}/avatar?code=${roomCode}`;
  const lobbyPlayers = game.players; // Shows all players dynamically (no 8 or 12 cap)

  const handleStart = () => {
    startGame({ roomCode, totalRounds: rounds, timeLimit });
    navigate("/game");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="game-card relative flex w-full max-w-5xl gap-10 p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white text-xl font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Left Side: QR Code & Room ID */}
        <div className="flex flex-col items-center justify-center w-1/3 border-r border-white/10 pr-10">
          <p className="card-kicker text-sm mb-2">JOIN THE ROOM</p>
          <div className="font-['Syne'] text-[42px] text-[#5be0ff] tracking-widest font-bold mb-6 leading-none">
            {roomCode}
          </div>

          <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(73,215,255,0.3)]">
            <QRCode value={joinUrl} size={180} fgColor="#090914" bgColor="#ffffff" />
          </div>

          <p className="text-white/40 text-[10px] tracking-widest font-bold text-center">
            SCAN WITH PHONE CAMERA
            <br />
            TO PLAY
          </p>
        </div>

        {/* Right Side: Dynamic Scrollable Players Grid */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl">Lobby</h2>
            <div className="live-badge">
              <span style={{ background: "#6dff6a", boxShadow: "0 0 10px #6dff6a" }} />
              {lobbyPlayers.length} {lobbyPlayers.length === 1 ? "PLAYER" : "PLAYERS"} JOINED
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-auto bg-black/20 p-5 rounded-[24px] border border-white/5 min-h-[280px] max-h-[320px] overflow-y-auto">
            {lobbyPlayers.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center justify-center gap-2 bg-white/5 rounded-2xl p-3 border border-white/10 shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center p-1.5">
                  <PlayerAvatar player={p} />
                </div>
                <span className="font-bold tracking-widest text-[10px] uppercase truncate max-w-full">
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {/* Settings Selectors */}
          <div className="flex gap-4 mt-6 mb-2 w-full text-left">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-white/50 ml-1">
                TOTAL QUESTIONS
              </label>
              <div className="input-shell h-16 !mb-0 bg-black/40 border-white/10 flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => setRounds((r) => Math.max(5, r - 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <strong className="text-[#5be0ff] font-['Syne'] text-2xl">{rounds}</strong>
                <button
                  type="button"
                  onClick={() => setRounds((r) => Math.min(20, r + 1))}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-white/50 ml-1">
                SECONDS PER ROUND
              </label>
              <div className="input-shell h-16 !mb-0 bg-black/40 border-white/10 flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => setTimeLimit((t) => Math.max(5, t - 5))}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <strong className="text-[#5be0ff] font-['Syne'] text-2xl">{timeLimit}</strong>
                <button
                  type="button"
                  onClick={() => setTimeLimit((t) => Math.min(60, t + 5))}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            className="primary-button mt-4 w-full justify-center h-16 text-sm"
            onClick={handleStart}
          >
            <span>START GAME</span>
            <span className="button-icon">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}