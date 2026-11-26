import a1 from "../assets/avatars/a1.png";
import a2 from "../assets/avatars/a2.png";
import a3 from "../assets/avatars/a3.png";
import a4 from "../assets/avatars/a4.png";
import a5 from "../assets/avatars/a5.png";
import a6 from "../assets/avatars/a6.png";
import a7 from "../assets/avatars/a7.png";
import a8 from "../assets/avatars/a8.png";
import a9 from "../assets/avatars/a9.png";
import a10 from "../assets/avatars/a10.png";
import a11 from "../assets/avatars/a11.png";
import a12 from "../assets/avatars/a12.png";
import a13 from "../assets/avatars/a13.png";
import a14 from "../assets/avatars/a14.png";

export const AVATARS = [
  { id: "a1", src: a1 },
  { id: "a2", src: a2 },
  { id: "a3", src: a3 },
  { id: "a4", src: a4 },
  { id: "a5", src: a5 },
  { id: "a6", src: a6 },
  { id: "a7", src: a7 },
  { id: "a8", src: a8 },
  { id: "a9", src: a9 },
  { id: "a10", src: a10 },
  { id: "a11", src: a11 },
  { id: "a12", src: a12 },
  { id: "a13", src: a13 },
  { id: "a14", src: a14 },
];

// Maps both a1-a14 AND any legacy mock avatar names in GameContext
const AVATAR_MAP = {
  a1,
  a2,
  a3,
  a4,
  a5,
  a6,
  a7,
  a8,
  a9,
  a10,
  a11,
  a12,
  a13,
  a14,
  blob: a1,
  cat: a2,
  robot: a3,
  alien: a4,
  frog: a5,
  ghost: a6,
  star: a7,
  monster: a8,
};

export function getAvatarSrc(player) {
  const avatarKey = typeof player === "string" ? player : player?.avatar;
  return AVATAR_MAP[avatarKey] || a1;
}

export default function PlayerAvatar({ player, className = "player-avatar" }) {
  const imgSrc = getAvatarSrc(player);

  return (
    <img
      src={imgSrc}
      alt={player?.name ? `${player.name}'s avatar` : "Player avatar"}
      className={`${className} w-full h-full object-contain select-none`}
      draggable={false}
    />
  );
}