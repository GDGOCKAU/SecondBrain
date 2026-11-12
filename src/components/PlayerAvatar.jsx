export const AVATARS = [
  { id: "blob", name: "Bloop", tagline: "Big ideas, zero bones", color: "#35d9ff", accent: "#1854ff" },
  { id: "robot", name: "Byte", tagline: "Processing good vibes", color: "#806dff", accent: "#45e9ff" },
  { id: "cat", name: "Mochi", tagline: "Curious by nature", color: "#ff7a6c", accent: "#ffca3a" },
  { id: "alien", name: "Zorp", tagline: "Definitely from Earth", color: "#78f067", accent: "#13b8a6" },
  { id: "frog", name: "Pogo", tagline: "Ready to leap ahead", color: "#9ee85a", accent: "#f3e84b" },
  { id: "ghost", name: "Wisp", tagline: "Here for a good time", color: "#d6c9ff", accent: "#7868ff" },
  { id: "cyclops", name: "Blink", tagline: "Single-minded genius", color: "#ff5c91", accent: "#843cff" },
  { id: "star", name: "Nova", tagline: "Born to stand out", color: "#ffd83d", accent: "#ff7b25" },
  { id: "mushroom", name: "Shroomy", tagline: "A very fun guy", color: "#ff5e5e", accent: "#fff0bd" },
  { id: "flame", name: "Fizz", tagline: "A little bit brilliant", color: "#ff703d", accent: "#ffdf38" },
  { id: "cloud", name: "Nimbus", tagline: "Head in the clouds", color: "#81d9ff", accent: "#e2f7ff" },
  { id: "monster", name: "Noodle", tagline: "Wildly overqualified", color: "#ca70ff", accent: "#58f2bd" },
];

function Face({ wide = false, wink = false }) {
  return (
    <>
      {wink ? (
        <path d="M32 48c3-3 7-3 10 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="37" cy="47" r={wide ? 4.5 : 3.5} fill="#101122" />
      )}
      <circle cx="63" cy="47" r={wide ? 4.5 : 3.5} fill="#101122" />
      <path d="M43 60c4 5 10 5 14 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

export default function PlayerAvatar({ player, className = "mini-avatar" }) {
  const avatarId = player?.avatar || player?.id || "blob";
  const preset = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const style = {
    "--avatar": player?.color || preset.color,
    "--accent": player?.accent || preset.accent,
  };

  let art;
  switch (avatarId) {
    case "robot":
      art = (
        <>
          <path d="M50 12v11" stroke="var(--avatar)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="11" r="5" fill="var(--accent)" />
          <rect x="19" y="25" width="62" height="57" rx="18" fill="var(--avatar)" />
          <rect x="26" y="36" width="48" height="32" rx="11" fill="#17172c" />
          <circle cx="38" cy="49" r="5" fill="var(--accent)" />
          <circle cx="62" cy="49" r="5" fill="var(--accent)" />
          <path d="M40 60h20" stroke="var(--accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "cat":
      art = (
        <>
          <path d="m21 36 4-24 20 14c4-1 7-1 11 0l20-14 4 24c6 17 3 37-13 45-9 5-25 5-34 0-16-8-18-29-12-45Z" fill="var(--avatar)" />
          <path d="m28 24 9 7-11 5Zm44 0-9 7 11 5Z" fill="var(--accent)" />
          <Face wink />
        </>
      );
      break;
    case "alien":
      art = (
        <>
          <path d="M50 12c23 0 36 16 31 37-5 20-21 36-31 36S24 69 19 49c-5-21 8-37 31-37Z" fill="var(--avatar)" />
          <ellipse cx="35" cy="45" rx="9" ry="13" fill="#121326" transform="rotate(-18 35 45)" />
          <ellipse cx="65" cy="45" rx="9" ry="13" fill="#121326" transform="rotate(18 65 45)" />
          <circle cx="38" cy="42" r="2.5" fill="white" />
          <circle cx="62" cy="42" r="2.5" fill="white" />
          <path d="M43 67c5 3 9 3 14 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "frog":
      art = (
        <>
          <circle cx="29" cy="30" r="16" fill="var(--avatar)" />
          <circle cx="71" cy="30" r="16" fill="var(--avatar)" />
          <path d="M18 52c0-20 14-30 32-30s32 10 32 30v10c0 15-12 24-32 24S18 77 18 62Z" fill="var(--avatar)" />
          <circle cx="29" cy="29" r="7" fill="white" />
          <circle cx="71" cy="29" r="7" fill="white" />
          <circle cx="30" cy="30" r="3.5" fill="#101122" />
          <circle cx="70" cy="30" r="3.5" fill="#101122" />
          <path d="M37 63c8 7 18 7 26 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "ghost":
      art = (
        <>
          <path d="M19 48c0-22 13-36 31-36s31 14 31 36v38L69 76 58 86 48 76 37 86 27 76l-8 10Z" fill="var(--avatar)" />
          <ellipse cx="37" cy="47" rx="5" ry="7" fill="#17172c" />
          <ellipse cx="63" cy="47" rx="5" ry="7" fill="#17172c" />
          <ellipse cx="50" cy="64" rx="6" ry="4" fill="#17172c" />
        </>
      );
      break;
    case "cyclops":
      art = (
        <>
          <path d="M18 54c0-24 13-40 32-40s32 16 32 40-13 33-32 33-32-9-32-33Z" fill="var(--avatar)" />
          <ellipse cx="50" cy="48" rx="17" ry="14" fill="white" />
          <circle cx="50" cy="48" r="8" fill="var(--accent)" />
          <circle cx="50" cy="48" r="3.5" fill="#101122" />
          <path d="M43 72c5 3 9 3 14 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "star":
      art = (
        <>
          <path d="m50 6 12 25 28 4-20 19 5 28-25-13-25 13 5-28-20-19 28-4Z" fill="var(--avatar)" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
          <Face wink />
        </>
      );
      break;
    case "mushroom":
      art = (
        <>
          <path d="M36 51h28l7 31c-10 6-32 6-42 0Z" fill="var(--accent)" />
          <path d="M10 50c1-23 17-38 40-38s39 15 40 38c-17 7-63 7-80 0Z" fill="var(--avatar)" />
          <circle cx="31" cy="30" r="7" fill="var(--accent)" />
          <circle cx="66" cy="38" r="9" fill="var(--accent)" />
          <path d="M45 76c3 3 7 3 10 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "flame":
      art = (
        <>
          <path d="M50 5c3 18 25 23 25 48 0 20-11 34-27 34S20 75 20 57c0-14 8-25 19-34-1 13 3 17 7 16 8-2 9-19 4-34Z" fill="var(--avatar)" />
          <path d="M51 43c4 9 11 12 9 24-1 9-6 14-13 14S34 75 34 66c0-7 4-13 10-17 0 7 3 9 7-6Z" fill="var(--accent)" />
          <circle cx="42" cy="61" r="3" fill="#101122" />
          <circle cx="58" cy="61" r="3" fill="#101122" />
          <path d="M44 70c4 3 8 3 12 0" stroke="#101122" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "cloud":
      art = (
        <>
          <path d="M25 77c-12 0-19-8-19-18 0-9 7-16 16-18 0-15 11-27 26-27 12 0 22 7 26 18 12 0 21 10 21 22 0 13-9 23-23 23Z" fill="var(--avatar)" />
          <Face />
        </>
      );
      break;
    case "monster":
      art = (
        <>
          <path d="M19 49c0-22 12-35 31-35s31 13 31 35v34c-9 5-15-4-21 0-7 5-13 5-20 0-6-4-12 5-21 0Z" fill="var(--avatar)" />
          <path d="m27 22-8-13m54 13 8-13" stroke="var(--avatar)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="9" r="4" fill="var(--accent)" />
          <circle cx="81" cy="9" r="4" fill="var(--accent)" />
          <Face wide />
        </>
      );
      break;
    default:
      art = (
        <>
          <path d="M22 73c-6-9-5-26 1-40 7-15 18-23 29-21 13 2 14 14 25 20 10 5 12 20 7 32-5 13-16 20-31 20-14 0-25-3-31-11Z" fill="var(--avatar)" />
          <Face wide />
          <circle cx="74" cy="31" r="6" fill="var(--accent)" />
        </>
      );
  }

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      role="img"
      aria-label={player?.name || preset.name}
    >
      {art}
    </svg>
  );
}