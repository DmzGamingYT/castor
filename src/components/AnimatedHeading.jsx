import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import "./AnimatedHeading.css";

/**
 * Composant de titre animé avec plusieurs modes d'animation :
 * - "letters" : chaque lettre apparaît une par une avec un stagger
 * - "gradient" : un dégradé animé parcourt le texte
 * - "words" : chaque mot apparaît un par un
 * - "slide" : le titre slide depuis le bas avec un fade
 */
export default function AnimatedHeading({
  tag: Tag = "h2",
  children,
  variant = "letters",
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const text = typeof children === "string" ? children : "";
  const chars = useMemo(() => text.split(""), [text]);

  if (variant === "gradient") {
    return (
      <Tag ref={ref} className={`ah ah--gradient ${visible ? "ah--in" : ""} ${className}`}>
        <span className="ah__text">{text}</span>
      </Tag>
    );
  }

  if (variant === "words") {
    const words = text.split(" ");
    return (
      <Tag ref={ref} className={`ah ah--words ${className}`}>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span
              className={`ah__word ${visible ? "ah__word--in" : ""}`}
              style={{ transitionDelay: `${delay + i * 0.08}s` }}
            >
              {w}
            </span>
            {/* l'espace doit être HORS du span inline-block, sinon il s'effondre */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </Tag>
    );
  }

  if (variant === "slide") {
    return (
      <Tag ref={ref} className={`ah ah--slide ${visible ? "ah--in" : ""} ${className}`}
        style={{ transitionDelay: `${delay}s` }}>
        {text}
      </Tag>
    );
  }

  // défaut : letters
  return (
    <Tag ref={ref} className={`ah ah--letters ${className}`}>
      {chars.map((c, i) => (
        <span
          key={`${i}-${c}`}
          className={`ah__char ${visible ? "ah__char--in" : ""}`}
          style={{ transitionDelay: `${delay + i * 0.035}s` }}
          aria-hidden="true"
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
      {/* texte accessible pour les lecteurs d'écran */}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
