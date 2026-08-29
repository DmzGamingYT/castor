import { useMemo } from "react";

/**
 * Particules flottantes décoratives pour le hero.
 * Planches de bois, copeaux et étincelles qui dérivent doucement.
 */
const PARTICLE_CHARS = ["🪵", "🪚", "🔩", "✨", "🪵", "⚙️", "🪵"];
const PARTICLE_COUNT = 14;

export default function HeroParticles() {
  /* aucune particule si l'utilisateur préfère moins de mouvement */
  const particles = useMemo(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const char = PARTICLE_CHARS[i % PARTICLE_CHARS.length];
      const left = 5 + Math.random() * 90;
      const delay = Math.random() * 12;
      const duration = 14 + Math.random() * 10;
      const size = 0.65 + Math.random() * 0.7;
      const opacity = 0.12 + Math.random() * 0.18;
      return { char, left, delay, duration, size, opacity, id: i };
    });
  }, []);

  if (particles.length === 0) return null;

  return (
    <span className="hero__particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero__particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
            opacity: p.opacity,
          }}
        >
          {p.char}
        </span>
      ))}
    </span>
  );
}
