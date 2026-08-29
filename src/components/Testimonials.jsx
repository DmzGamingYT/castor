import { useEffect, useRef, useState, useCallback } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";

const TESTIMONIALS = [
  {
    initials: "ML",
    name: "Marc L.",
    role: "Étudiant en info",
    color: "var(--accent)",
    quote:
      "J'ai refait tout mon site de portfolio en une soirée au lieu d'une semaine. Le castor comprend les conventions et respecte la structure — j'ai juste validé les diffs.",
  },
  {
    initials: "SC",
    name: "Sarah C.",
    role: "Développeuse indie",
    color: "var(--river)",
    quote:
      "Le mode local est ce qui m'a convaincue. Aucune donnée qui part, les clés restent chez moi, et ça tourne même sans connexion. Enfin un outil IA sans compromis.",
  },
  {
    initials: "TK",
    name: "Thomas K.",
    role: "Freelance full-stack",
    color: "var(--sage)",
    quote:
      "Je bascule entre Groq pour le rapide et un modèle local pour le sensible. Le fait de choisir le cerveau à la minute, c'est la vraie liberté — pas un abonnement qui décide pour moi.",
  },
  {
    initials: "AN",
    name: "Amira N.",
    role: "Cheffe de projet web",
    color: "var(--accent-2)",
    quote:
      "J'ai recommandé Castor à toute mon équipe. Zéro formation, zéro abonnement, et on a retrouvé notre façon de travailler — juste plus vite. Les clients ont rien changé de leur côté.",
  },
];

function TestimonialCard({ t, state }) {
  return (
    <article className={`testimonial testimonial--${state}`}>
      <div className="testimonial__stars" aria-hidden="true">
        {"★★★★★"}
      </div>
      <blockquote className="testimonial__quote">{t.quote}</blockquote>
      <div className="testimonial__footer">
        <div className="testimonial__author">
          <span
            className="testimonial__avatar"
            style={{ background: t.color }}
            aria-hidden="true"
          >
            {t.initials}
          </span>
          <div className="testimonial__meta">
            <strong>{t.name}</strong>
            <span>{t.role}</span>
          </div>
        </div>
        <span className="testimonial__badge">Recommande ✓</span>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef({ startX: 0, startTime: 0, dragging: false });

  const next = useCallback(() => {
    setActive((i) => (i + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // auto-advance (désactivé si l'utilisateur préfère moins de mouvement)
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // drag / swipe
  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startTime: Date.now(), dragging: true };
  };
  const onPointerUp = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dt = Date.now() - dragRef.current.startTime;
    if (Math.abs(dx) > 50 || (Math.abs(dx) > 20 && dt < 300)) {
      dx < 0 ? next() : prev();
    }
    dragRef.current.dragging = false;
  };

  const getIdx = (offset) => (active + offset + TESTIMONIALS.length) % TESTIMONIALS.length;

  return (
    <section className="section testimonials">
      <AnimatedHeading variant="gradient">Ils ont donné un chantier.</AnimatedHeading>
      <p className="section-sub">
        Retours de vrais utilisateurs — pas de fake, pas de script.
      </p>

      <div
        className="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* carte précédente (peek) */}
        <div className="carousel__side carousel__side--left">
          <TestimonialCard t={TESTIMONIALS[getIdx(-1)]} state="side" />
        </div>

        {/* carte active */}
        <div className="carousel__center">
          <TestimonialCard t={TESTIMONIALS[active]} state="active" key={active} />
        </div>

        {/* carte suivante (peek) */}
        <div className="carousel__side carousel__side--right">
          <TestimonialCard t={TESTIMONIALS[getIdx(1)]} state="side" />
        </div>

        {/* flèches */}
        <button className="carousel__arrow carousel__arrow--left" onClick={prev} aria-label="Précédent">
          ‹
        </button>
        <button className="carousel__arrow carousel__arrow--right" onClick={next} aria-label="Suivant">
          ›
        </button>
      </div>

      {/* dots */}
      <div className="testimonials__dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`testimonials__dot ${i === active ? "testimonials__dot--on" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Témoignage ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
