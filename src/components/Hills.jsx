export default function Hills({ flip = false }) {
  return (
    <svg
      className={`hills ${flip ? "hills--flip" : ""}`}
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,160 C240,90 420,200 720,150 C1020,100 1200,180 1440,130 L1440,220 L0,220 Z"
        fill="#dde5c9"
      />
      <path
        d="M0,190 C260,140 520,215 780,185 C1040,155 1240,210 1440,175 L1440,220 L0,220 Z"
        fill="#cfdab4"
      />
      <path
        d="M0,205 C300,175 600,225 900,200 C1150,182 1320,215 1440,198 L1440,220 L0,220 Z"
        fill="#c1ce9e"
      />
    </svg>
  );
}
