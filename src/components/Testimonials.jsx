import { useEffect, useRef, useState, useCallback } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

const TESTIMONIALS = [
  { initials: "ML", name: "Marc L.", roleKey: "tr1", quoteKey: "tq1", color: "var(--accent)" },
  { initials: "SC", name: "Sarah C.", roleKey: "tr2", quoteKey: "tq2", color: "var(--river)" },
  { initials: "TK", name: "Thomas K.", roleKey: "tr3", quoteKey: "tq3", color: "var(--sage)" },
  { initials: "AN", name: "Amira N.", roleKey: "tr4", quoteKey: "tq4", color: "var(--accent-2)" },
];

function TestimonialCard({ item, state }) {
  const { t } = useLanguage();
  return (
    <article className={`testimonial testimonial--${state}`}>
      <div className="testimonial__stars" aria-hidden="true">
        {"★★★★★"}
      </div>
      <blockquote className="testimonial__quote">{t(item.quoteKey)}</blockquote>
      <div className="testimonial__footer">
        <div className="testimonial__author">
          <span
            className="testimonial__avatar"
            style={{ background: item.color }}
            aria-hidden="true"
          >
            {item.initials}
          </span>
          <div className="testimonial__meta">
            <strong>{item.name}</strong>
            <span>{t(item.roleKey)}</span>
          </div>
        </div>
        <span className="testimonial__badge">{t("tests_recommends")}</span>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const { t } = useLanguage();
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
      <AnimatedHeading variant="gradient">{t("tests_heading")}</AnimatedHeading>
      <p className="section-sub">
        {t("tests_sub")}
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
          <TestimonialCard item={TESTIMONIALS[getIdx(-1)]} state="side" />
        </div>

        {/* carte active */}
        <div className="carousel__center">
          <TestimonialCard item={TESTIMONIALS[active]} state="active" key={active} />
        </div>

        {/* carte suivante (peek) */}
        <div className="carousel__side carousel__side--right">
          <TestimonialCard item={TESTIMONIALS[getIdx(1)]} state="side" />
        </div>

        {/* flèches */}
        <button className="carousel__arrow carousel__arrow--left" onClick={prev} aria-label={t("tests_prev")}>
          ‹
        </button>
        <button className="carousel__arrow carousel__arrow--right" onClick={next} aria-label={t("tests_next")}>
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
            aria-label={`${t("tests_dot")} ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
