import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import PlayerAvatar, { AVATARS } from "../../components/PlayerAvatar";
import { useGame } from "../../context/GameContext";

export default function AvatarSelection() {
  const navigate = useNavigate();
  const { registerPlayer } = useGame();
  const [selectedId, setSelectedId] = useState("blob");
  const [nickname, setNickname] = useState("");

  const selected = AVATARS.find((a) => a.id === selectedId) ?? AVATARS[0];

  const handleReady = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    registerPlayer({ name: nickname.trim(), avatar: selectedId });
    navigate("/player");
  };

  return (
    <main className="app-shell min-h-screen overflow-y-auto">
      <div className="ambient-grid" />
      <div className="aurora aurora-red top-10" />
      <div className="aurora aurora-blue bottom-10" />

      <Header />

      <div className="flex flex-col p-6 pt-28 gap-8 pb-32">
        <section aria-labelledby="picker-title">
          <div className="mb-6 flex flex-col items-center text-center">
            <p className="eyebrow justify-center">
              <span /> MAKE IT YOURS
            </p>
            <div id="picker-title" className="font-['Syne'] text-4xl font-bold tracking-tight mb-2 leading-none">
              Pick your player
            </div>
            <p className="text-white/40 text-[11px] uppercase tracking-widest mt-2">
              Choose the face your friends will remember.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-sm mx-auto" role="list">
            {AVATARS.map((avatar) => {
              const isSelected = avatar.id === selectedId;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  className={`relative flex flex-col items-center justify-center p-4 aspect-square rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#44d8ff] bg-[rgba(26,40,61,0.94)] shadow-[0_0_20px_rgba(73,215,255,0.4)] scale-105"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setSelectedId(avatar.id)}
                >
                  <span className="w-24 h-24 flex items-center justify-center transition-transform">
                    <PlayerAvatar player={{ avatar: avatar.id }} className="w-full h-full overflow-visible" />
                  </span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase mt-3 ${isSelected ? "text-[#8ceaff]" : "text-white/60"}`}>
                    {avatar.name}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-[#4cddff] text-[#07141a] text-[9px] font-black shadow-[0_0_10px_rgba(76,221,255,0.7)]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="w-full max-w-sm mx-auto flex flex-col mt-4 p-6 bg-[rgba(10,11,25,0.8)] border border-white/10 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-bold text-white/40 tracking-widest uppercase">Your Player</span>
            <span className="w-[5px] h-[5px] rounded-full bg-[#5ff58e] shadow-[0_0_9px_#5ff58e] animate-pulse" />
          </div>

          <div className="h-[180px] w-full flex items-center justify-center relative mb-6">
            <div className="absolute w-[80%] aspect-square rounded-full border border-white/10" />
            <div className="absolute w-[60%] aspect-square rounded-full border border-[#3ad6ff]/20" />
            <div className="w-[140px] z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <PlayerAvatar player={{ avatar: selected.id }} className="w-full h-full overflow-visible" />
            </div>
          </div>

          <form onSubmit={handleReady} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-white/50 mb-2 ml-1">
                NICKNAME
              </label>
              <div className="input-shell h-14 mb-0 bg-black/40 border-white/10">
                <input
                  dir="auto"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                  placeholder="ENTER NAME"
                  autoComplete="off"
                  className="text-center !px-4 w-full bg-transparent text-white font-bold tracking-widest placeholder:text-white/20 outline-none uppercase"
                />
              </div>
            </div>

            <button
              className="flex items-center justify-between w-full h-14 px-5 rounded-xl text-[11px] font-black tracking-widest transition-all bg-gradient-to-r from-[#45d9ff] to-[#65f3d0] text-[#07141b] border border-[#47daff] cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={!nickname.trim()}
            >
              <span>READY!</span>
              <i className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/10 text-lg not-italic">
                →
              </i>
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}