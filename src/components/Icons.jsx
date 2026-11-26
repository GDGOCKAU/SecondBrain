const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

// Points in the reading direction (flips in RTL).
export const ArrowIcon = () => (
  <svg {...base} className="rtl:-scale-x-100">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base} width={16} height={16}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.5}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const ReplayIcon = () => (
  <svg {...base}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
