/* Set d'icônes Castor — dessinées à la main, trait 1.8, viewBox 24. */
const PATHS = {
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
      <path d="M7 9.5l3.5 3L7 15.5M12.8 16H17" />
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

/* Marque castor pleine (pour tuiles de logo) */
export function BeaverMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#33260a">
        <ellipse cx="45" cy="42" rx="15" ry="8" transform="rotate(-20 45 42)" />
        <circle cx="27" cy="30" r="17" />
        <circle cx="14.5" cy="15" r="5.5" />
        <circle cx="34.5" cy="11" r="5.5" />
      </g>
      <rect x="23.5" y="38" width="5" height="10" rx="2" fill="#fffdf6" />
      <circle cx="21" cy="27" r="2.4" fill="#fffdf6" />
      <circle cx="32.5" cy="25" r="2.4" fill="#fffdf6" />
      <path d="M26.5 33.5l-2.6 3h5.6z" fill="#fffdf6" opacity="0.55" />
    </svg>
  );
}
