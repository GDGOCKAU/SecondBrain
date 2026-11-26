import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import PlayerAvatar, { AVATARS } from "../../components/PlayerAvatar";
import { GoogleBar } from "../../components/Ui";
import { useGame } from "../../context/GameContext";
import { useSettings } from "../../context/SettingsContext";

export default function AvatarSelection() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { game, registerPlayer } = useGame();
  const { t } = useSettings();
  const [selectedId, setSelectedId] = useState(AVATARS[0].id);
  const [nickname, setNickname] = useState("");

  const roomCode = (params.get("code") || game.roomCode || "").toUpperCase();
  const ready = nickname.trim().length > 0;

  const handleReady = (e) => {
    e.preventDefault();
    if (!ready) return;
    registerPlayer({ name: nickname.trim(), avatar: selectedId });
    navigate("/player");
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
      <Header compact>
        <span className="pill !px-3 !py-[5px] !text-xs bg-blue-soft text-action">
          {t("room", { code: roomCode })}
        </span>
      </Header>

      <main className="flex flex-1 flex-col gap-4 px-5 pb-4 pt-5">
        <div>
          <h1 className="m-0 text-[30px] font-bold tracking-[-0.035em]">{t("pickPlayer")}</h1>
          <p className="m-0 mt-1 text-sm text-muted">{t("chooseFace")}</p>
        </div>

        <div role="radiogroup" aria-label={t("avatars")} className="grid grid-cols-4 gap-2">
          {AVATARS.map((avatar, i) => {
            const on = avatar.id === selectedId;
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={t("avatarN", { n: i + 1 })}
                onClick={() => setSelectedId(avatar.id)}
                className={`aspect-square cursor-pointer rounded-2xl p-1.5 transition-transform duration-200 hover:-rotate-3 hover:scale-105 ${
                  on ? "border-2 border-g-blue bg-blue-soft" : "border border-line bg-surface"
                }`}
              >
                <PlayerAvatar player={{ avatar: avatar.id }} />
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleReady}
          className="mt-auto flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <span className="size-14 shrink-0 rounded-[30%] bg-blue-soft">
              <PlayerAvatar player={{ avatar: selectedId }} />
            </span>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="nick" className="text-[13px] font-medium text-muted">
                {t("nickname")}
              </label>
              <input
                id="nick"
                dir="auto"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 12))}
                placeholder={t("yourName")}
                maxLength={12}
                autoComplete="off"
                className="field h-11 px-3.5 text-base font-semibold"
              />
            </div>
          </div>
          <button type="submit" disabled={!ready} className="btn-primary w-full">
            {ready ? t("imReady") : t("typeNick")}
          </button>
        </form>
      </main>
      <GoogleBar />
    </div>
  );
}
