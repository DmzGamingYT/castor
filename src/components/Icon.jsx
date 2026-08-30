/* Set d'icônes Castor — dessinées à la main, trait 1.8, viewBox 24. */
const PATHS = {
  home: (
    <>
      <path d="M3.5 10.5L12 3l8.5 7.5V20a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 20z" />
      <path d="M9 21.5V13h6v8.5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.5" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
      <path d="M9 10.5h6M9 14h6M9 17.5h3.5" />
    </>
  ),
  hammer: (
    <>
      <path d="M13.8 6.2l2.4-2.4a1.5 1.5 0 0 1 2.1 0l1.9 1.9a1.5 1.5 0 0 1 0 2.1l-2.4 2.4z" />
      <path d="M13.5 8L4.8 16.7a1.9 1.9 0 0 0 2.7 2.7L16.2 10.7" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 12.4l2.6 2.6 5-5.4" />
    </>
  ),
  desktop: (
    <>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M9 20.5h6M12 16.5v4" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7 9.5l3.5 3L7 15.5" />
      <path className="ic-cursor" d="M12.8 16H17" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.5 3.8 5.3 3.8 8.5s-1.2 6-3.8 8.5c-2.6-2.5-3.8-5.3-3.8-8.5s1.2-6 3.8-8.5z" />
    </>
  ),
  cloud: (
    <path d="M7.2 18.5a4.3 4.3 0 0 1-.5-8.6 5.4 5.4 0 0 1 10.5-.9 3.9 3.9 0 0 1-.7 9.5H7.2z" />
  ),
  chat: (
    <path d="M5.5 4.5h13A1.5 1.5 0 0 1 20 6v9a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 3.7V16.7A1.5 1.5 0 0 1 4 15.2V6a1.5 1.5 0 0 1 1.5-1.5z" />
  ),
  download: <path d="M12 3.5V15M7.5 10.5L12 15l4.5-4.5M4.5 19.5h15" />,
  apple: (
    <>
      <path d="M12 8c-1.1-1.9-3.1-2.7-4.9-1.9-2.5 1.1-3.5 4.5-2.3 7.7 1 2.8 3.1 5.4 4.9 5.4.8 0 1.5-.5 2.3-.5s1.5.5 2.3.5c1.8 0 3.9-2.6 4.9-5.4 1.2-3.2.2-6.6-2.3-7.7C14.9 5.3 13.1 6.1 12 8z" />
      <path d="M12 7.5c-.2-2 .9-3.6 2.8-4.2" />
    </>
  ),
  windows: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="7" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="13" width="7" height="7" rx="1.4" />
    </>
  ),
  linux: (
    <>
      <path d="M12 3c2.2 0 3.6 1.8 3.6 4.4 0 1.9.7 3.3 1.8 5 1 1.5 1.6 3.1.9 4.6-.5 1.1-1.7 1.6-3 1.3a12 12 0 0 0-6.6 0c-1.3.3-2.5-.2-3-1.3-.7-1.5-.1-3.1.9-4.6 1.1-1.7 1.8-3.1 1.8-5C8.4 4.8 9.8 3 12 3z" />
      <path d="M10 19.5v1.2M14 19.5v1.2M10.6 7.2h.01M13.4 7.2h.01" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5l8.5 4.5L12 12.5 3.5 8z" />
      <path d="M4 12.2l8 4.3 8-4.3M4 16.2l8 4.3 8-4.3" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3.5V8M15 3.5V8" />
      <path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 16.5v4" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </>
  ),
  zap: <path d="M13 3L5.5 13.5H11L10 21l7.8-11H12.5z" />,
  branch: (
    <>
      <circle cx="6.5" cy="6" r="2.3" />
      <circle cx="6.5" cy="18" r="2.3" />
      <circle cx="17.5" cy="8" r="2.3" />
      <path d="M6.5 8.3v7.4M17.5 10.3c0 3.5-4 4-8 4.5" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3.5h5M10.5 3.5v5L5.2 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.8-2.9L13.5 8.5v-5" />
      <path d="M7.5 14.5h9" />
    </>
  ),
  listCheck: (
    <>
      <path d="M4.5 6.5l1.7 1.7L9.5 5M4.5 12.5l1.7 1.7 3.3-3.2M4.5 18.5l1.7 1.7 3.3-3.2" />
      <path d="M12.5 6.5h7M12.5 12.5h7M12.5 18.5h7" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 15.5c-1.5-4.5 0-9 5.5-12 .5 5.5-1 10-5.5 12z" />
      <path d="M12 15.5L8.5 12c-2 .3-3.5 1.3-4.5 3.5 2 .5 3.5.3 4.7-.3M12 15.5l3.5 3.5c-.3 2-1.3 3.5-3.5 4.5-.5-2-.3-3.5.3-4.7" opacity="0" />
      <path d="M9 13l-4 1.5L8.5 12M11 15l-1.5 4L12 15.5" />
      <circle cx="14.5" cy="9.5" r="1.4" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-.8 2-1.7 0-1.4-1.3-1.8-1.3-3 0-1 .8-1.8 2-1.8h1.8a4 4 0 0 0 4-4c0-3.6-3.8-6.5-8.5-6.5z" />
      <circle cx="8" cy="9" r="1.1" /><circle cx="12.5" cy="7" r="1.1" /><circle cx="7.5" cy="13.5" r="1.1" />
    </>
  ),
  eye: (
    <>
      <path d="M3 12s3.3-5.5 9-5.5S21 12 21 12s-3.3 5.5-9 5.5S3 12 3 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  box: (
    <>
      <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z" />
      <path d="M4 7.2l8 4.3 8-4.3M12 11.5V21" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L20.5 20.5" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 4.5A3 3 0 0 0 6.6 8 3.2 3.2 0 0 0 4.5 11c0 1.2.6 2.2 1.5 2.8A3.1 3.1 0 0 0 8 19c.6 0 1.1-.1 1.5-.4V4.9a3 3 0 0 0 0-.4z" />
      <path d="M14.5 4.5A3 3 0 0 1 17.4 8a3.2 3.2 0 0 1 2.1 3c0 1.2-.6 2.2-1.5 2.8A3.1 3.1 0 0 1 16 19c-.6 0-1.1-.1-1.5-.4" />
      <path d="M12 4.5v15" />
    </>
  ),
  paperclip: (
    <path d="M17.5 11l-6.3 6.3a4 4 0 0 1-5.6-5.6l7.4-7.4a2.7 2.7 0 0 1 3.8 3.8l-7.1 7.1a1.35 1.35 0 0 1-1.9-1.9l6.2-6.2" />
  ),
  spark: (
    <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  ),
  /* logo GitHub (marque — rempli, trait neutralisé) */
  github: (
    <path
      d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.833 1.769 1.179 1.035 1.742 2.688 1.253 3.349.95.101-.747.402-1.253.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.978 0 1.955.129 2.875.388 2.2-1.495 3.163-1.179 3.163-1.179.632 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.153 0 .302.216.662.79.547a10.505 10.505 0 0 0 7.86-10.911C23.5 5.896 18.354.75 12.5.75Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  /* planifier : presse-papier + crayon */
  tools: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.5" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
      <path d="M18.9 6.9l1.6 1.6-5.1 5.1-2.3.7.7-2.3z" />
    </>
  ),
};

export default function Icon({ name, size = 22, className = "" }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

/* Marque castor de chantier (casque, grandes dents, marteau) —
   utilisée dans le logo, le footer, le bot et les studios. */
export function BeaverMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
      <defs>
        <linearGradient id="bm-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4a14" />
          <stop offset="100%" stopColor="#3d2808" />
        </linearGradient>
        <linearGradient id="bm-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf6" />
          <stop offset="100%" stopColor="#f3e9cf" />
        </linearGradient>
        <linearGradient id="bm-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe071" />
          <stop offset="100%" stopColor="#efb63a" />
        </linearGradient>
      </defs>
      {/* queue plate (pagaie) + stries */}
      <g transform="rotate(-22 96 92)">
        <ellipse cx="96" cy="92" rx="23" ry="12" fill="#4a3210" />
        <g stroke="#33220a" strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
          <line x1="80" y1="90" x2="112" y2="90" />
          <line x1="80" y1="94" x2="112" y2="94" />
        </g>
      </g>
      {/* corps + ventre */}
      <ellipse cx="62" cy="86" rx="30" ry="24" fill="url(#bm-fur)" />
      <ellipse cx="57" cy="90" rx="18" ry="15" fill="url(#bm-belly)" opacity="0.95" />
      {/* petit marteau tenu devant le ventre */}
      <g transform="rotate(-28 52 88)">
        <rect x="46" y="85" width="17" height="5" rx="2.5" fill="#c98a2b" />
        <rect x="37" y="79.5" width="10" height="16" rx="3" fill="#9aa5b2" />
        <rect x="37" y="79.5" width="10" height="5.5" rx="2.75" fill="#c6ced8" />
      </g>
      {/* pattes qui tiennent le marteau */}
      <ellipse cx="38" cy="88" rx="9" ry="7" fill="#4a3210" transform="rotate(-18 38 88)" />
      <ellipse cx="70" cy="80" rx="9" ry="7" fill="#4a3210" transform="rotate(22 70 80)" />
      {/* tête */}
      <circle cx="62" cy="50" r="26" fill="url(#bm-fur)" />
      {/* oreilles */}
      <circle cx="40" cy="28" r="9" fill="#4a3210" />
      <circle cx="40" cy="28" r="5.5" fill="#c98820" opacity="0.75" />
      <circle cx="84" cy="28" r="9" fill="#4a3210" />
      <circle cx="84" cy="28" r="5.5" fill="#c98820" opacity="0.75" />
      {/* ombre sous le casque */}
      <ellipse cx="62" cy="36" rx="20" ry="4.2" fill="#000" opacity="0.10" />
      {/* casque de chantier */}
      <path d="M45.5 35 a16.5 16.5 0 1 1 33 0 Z" fill="url(#bm-hat)" />
      <ellipse cx="62" cy="35" rx="22" ry="5.4" fill="#e3a72f" />
      <circle cx="62" cy="17.8" r="2.6" fill="#d99a26" />
      <path d="M48 24 a14 14 0 0 1 28 0" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
      {/* yeux expressifs */}
      <ellipse cx="50" cy="50" rx="7.5" ry="8.5" fill="#fffdf6" />
      <ellipse cx="74" cy="50" rx="7.5" ry="8.5" fill="#fffdf6" />
      <circle cx="51.6" cy="51" r="4.6" fill="#241303" />
      <circle cx="75.6" cy="51" r="4.6" fill="#241303" />
      <circle cx="53.2" cy="49.4" r="1.7" fill="#fff" opacity="0.95" />
      <circle cx="77.2" cy="49.4" r="1.7" fill="#fff" opacity="0.95" />
      {/* nez */}
      <ellipse cx="62" cy="60" rx="5.2" ry="4.2" fill="#241303" />
      {/* sourire + grandes dents de castor */}
      <path d="M54.5 64 Q58 67.5 62 64 Q66 67.5 69.5 64" fill="none" stroke="#241303" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="57" y="64.5" width="4.4" height="6.5" rx="1.4" fill="#fffdf6" />
      <rect x="62.6" y="64.5" width="4.4" height="6.5" rx="1.4" fill="#fffdf6" />
      {/* moustaches */}
      <g stroke="#fffdf6" strokeWidth="1.1" opacity="0.55" strokeLinecap="round">
        <line x1="34" y1="55" x2="46" y2="57" />
        <line x1="33" y1="60" x2="46" y2="60" />
        <line x1="34" y1="65" x2="46" y2="63" />
        <line x1="78" y1="57" x2="90" y2="55" />
        <line x1="78" y1="60" x2="91" y2="60" />
        <line x1="78" y1="63" x2="90" y2="65" />
      </g>
      {/* joues */}
      <circle cx="42" cy="64" r="4.6" fill="#e2952a" opacity="0.4" />
      <circle cx="82" cy="64" r="4.6" fill="#e2952a" opacity="0.4" />
    </svg>
  );
}
