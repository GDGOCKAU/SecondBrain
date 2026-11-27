import { BRAIN_FOLDS, BRAIN_OUTLINE } from "./brainShape";

// A pink, natural-looking brain wearing a crown: marks first place in a list.
export default function BrainCrown({ label, className = "h-8 w-9" }) {
  return (
    <svg viewBox="0 -2.5 32 26" role="img" aria-label={label} className={className}>
      <path d={BRAIN_OUTLINE} fill="#f4b6c4" stroke="#c9708a" strokeWidth="1.1" strokeLinejoin="round" />
      <path
        d={BRAIN_FOLDS}
        fill="none"
        stroke="#c9708a"
        strokeWidth=".9"
        strokeLinecap="round"
        opacity=".75"
      />
      <path
        d="M10.5 5.5 11.5-1 14 2.2 16-2.2 18 2.2 20.5-1 21.5 5.5Z"
        fill="#f9ab00"
        stroke="#e37400"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
