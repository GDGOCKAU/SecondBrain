export default function BrainMark() {
  return (
    <div className="brain-wrap" aria-hidden="true">
      <div className="brain-orbit brain-orbit-one" />
      <div className="brain-orbit brain-orbit-two" />
      <svg
        className="brain-svg"
        viewBox="0 0 560 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brainGradient" x1="100" y1="60" x2="475" y2="410">
            <stop stopColor="#ffdf3d" />
            <stop offset=".28" stopColor="#ff4f75" />
            <stop offset=".63" stopColor="#8b5cff" />
            <stop offset="1" stopColor="#2ad9ff" />
          </linearGradient>
          <filter id="brainGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="13" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          className="brain-lines"
          stroke="url(#brainGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#brainGlow)"
        >
          <path d="M279 390V108c0-39-32-70-71-70-30 0-56 19-66 46-38 3-68 35-68 74 0 10 2 20 6 29-25 16-41 44-41 76 0 44 31 81 72 89 6 39 40 69 81 69 28 0 53-14 68-36" />
          <path d="M281 390V108c0-39 32-70 71-70 30 0 56 19 66 46 38 3 68 35 68 74 0 10-2 20-6 29 25 16 41 44 41 76 0 44-31 81-72 89-6 39-40 69-81 69-28 0-53-14-68-36" />
          <path d="M142 84c20 2 38 14 49 31m-80 237c-4-23 3-46 20-63m349-102c-18-6-37-5-54 4m23 161c4-23-3-46-20-63" />
          <path d="M80 187c15 9 33 13 51 9 23-5 41-22 49-43m-61 62c-7 31 9 64 38 78 15 7 31 8 46 4m-35-16c-10-21-4-46 14-61" />
          <path d="M480 187c-15 9-33 13-51 9-23-5-41-22-49-43m61 62c7 31-9 64-38 78-15 7-31 8-46 4m35-16c10-21 4-46-14-61" />
          <path d="M279 161c-22-5-44 8-50 30m52 54c-24 0-43 19-43 43m43 49c-20-2-40 8-50 26m50-202c22-5 44 8 50 30m-52 54c24 0 43 19 43 43m-43 49c20-2 40 8 50 26" />
        </g>

        <g className="brain-nodes">
          <circle cx="142" cy="84" r="10" fill="#ffdc3f" />
          <circle cx="80" cy="187" r="10" fill="#ff5b6e" />
          <circle cx="111" cy="352" r="10" fill="#7dff72" />
          <circle cx="480" cy="187" r="10" fill="#28d9ff" />
          <circle cx="449" cy="352" r="10" fill="#7dff72" />
          <circle cx="418" cy="84" r="10" fill="#ffdc3f" />
        </g>
      </svg>
      <div className="spark spark-red" />
      <div className="spark spark-yellow" />
      <div className="spark spark-green" />
      <div className="spark spark-blue" />
    </div>
  );
}