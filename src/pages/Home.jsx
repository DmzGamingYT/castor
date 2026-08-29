import { useEffect, useRef, useState } from "react";
import DemoSection from "../components/DemoSection.jsx";
import Testimonials from "../components/Testimonials.jsx";
import DamScene from "../components/DamScene.jsx";
import Hills from "../components/Hills.jsx";
import HeroParticles from "../components/HeroParticles.jsx";
import DownloadSection from "../components/DownloadSection.jsx";
import FAQSection from "../components/FAQSection.jsx";
import AnimatedHeading from "../components/AnimatedHeading.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import { BeaverMark } from "../components/Icon.jsx";

/* révèle un élément quand il entre dans le viewport */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const glows = el.querySelectorAll(".hero__glow");
          const particles = el.querySelector(".hero__particles");
          glows.forEach((g, i) => {
            const speed = 0.12 + i * 0.06;
            g.style.transform = `translateY(${y * speed}px) ${g.classList.contains("hero__glow--lime") ? "translateX(-88%)" : g.classList.contains("hero__glow--wood") ? "translateX(-6%)" : "translateX(-52%)"}`;
          });
          if (particles) particles.style.transform = `translateY(${y * 0.04}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

function Hero({ onDownload }) {
  const parallaxRef = useParallax();
  return (
    <section className="hero" ref={parallaxRef}>
      <HeroParticles />
      <div className="hero__glow hero__glow--lime" aria-hidden="true" />
      <div className="hero__glow hero__glow--wood" aria-hidden="true" />
      <div className="hero__glow hero__glow--river" aria-hidden="true" />
      <Hills />

      <span className="hero__badge">
        <BeaverMark size={15} /> Gratuit pour toujours. Sans mauvaise surprise.
      </span>

      <h1>
        Donne-lui un chantier.
        <br />
        <span className="hero__accent">Il construit.</span>
      </h1>

      <p className="hero__sub">
        Castor est un agent de code qui bâtit tes projets bloc par bloc.
        <br className="br-desktop" />
        Cloud ou sous ton toit, avec les modèles que tu choisis.
      </p>

      <div className="hero__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
          Télécharger Desktop
        </button>
        <a
          className="btn btn--ghost btn--lg"
          href="/castor/#chantier"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("chantier")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Voir la démo
        </a>
      </div>

      <DamScene />
    </section>
  );
}

const MANIFESTO = [
  { pre: "Le code n'est pas ", highlight: "un abonnement", post: ".", strike: true },
  { pre: "Ton modèle, ton choix. ", highlight: "Cloud ou sous ton toit", post: "." },
  { pre: "0 € n'est pas une promo. ", highlight: "C'est la règle.", post: "" },
];

function MLine({ variant, children }) {
  const ref = useReveal();
  return (
    <p ref={ref} className={`m-line m-line--${variant}`}>
      {children}
    </p>
  );
}

function Manifesto() {
  const progressRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bar = progressRef.current;
    if (!section || !bar) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const viewH = window.innerHeight;
          const start = viewH * 0.8;
          const end = -rect.height * 0.2;
          const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
          bar.style.setProperty("--manifesto-progress", progress);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="manifesto" ref={sectionRef}>
      <div className="manifesto__track" aria-hidden="true">
        <div className="manifesto__bar" ref={progressRef} />
      </div>
      {MANIFESTO.map((m, i) => (
        <MLine key={i} variant={i + 1}>
          {m.pre}
          <span className={`m-word m-word--${(i % 3) + 1}`}>
            {m.strike ? <s>{m.highlight}</s> : m.highlight}
          </span>
          {m.post}
        </MLine>
      ))}
    </section>
  );
}

function StepsMockup() {
  const [phase, setPhase] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [building, setBuilding] = useState([]);

  useEffect(() => {
    /* Auto-play : un cycle complet s'enchaîne tout seul et se reprogramme à la
       fin — les phases tournent strictement dans l'ordre et la boucle ne
       chevauche jamais. (L'ancienne version dépendait de [phase] : chaque
       changement de phase relançait tout le script et annulait le timer de
       reset, laissant la démo bloquée ~9 s sur l'écran « terminé ».) */
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
    };
    const every = (fn, ms) => {
      const t = setInterval(fn, ms);
      timers.add(t);
      return t;
    };
    const prompt = "un blog de recettes végé";

    const runCycle = () => {
      setPhase(0);
      setInputVal("");
      setBuilding([]);

      /* Phase 1 : tape le chantier */
      later(() => {
        let i = 0;
        const ty = every(() => {
          i++;
          setInputVal(prompt.slice(0, i));
          if (i >= prompt.length) {
            clearInterval(ty);
            timers.delete(ty);
            later(() => setPhase(1), 600);
          }
        }, 50);
      }, 800);

      /* Phase 2 : construction */
      later(() => {
        const files = [
          "> Structure index.html...",
          "> Styles.css appliqués...",
          "> Composants montés...",
          "> Tests passés ✔",
        ];
        let f = 0;
        const build = every(() => {
          setBuilding((prev) => [...prev, files[f]]);
          f++;
          if (f >= files.length) {
            clearInterval(build);
            timers.delete(build);
            later(() => setPhase(2), 500);
          }
        }, 700);
      }, 3200);

      /* Cycle suivant — démarre seulement quand celui-ci est terminé */
      later(runCycle, 10000);
    };

    runCycle();
    return () => timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  }, []);

  return (
    <div className="steps-mockup">
      <div className="steps-mockup__window">
        <div className="steps-mockup__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <em>Castor Desktop</em>
        </div>
        <div className="steps-mockup__body">
          {/* Sidebar */}
          <div className="steps-mockup__sidebar">
            <div className="steps-mockup__sidebar-logo">🦫</div>
            <div className={`steps-mockup__sidebar-item ${phase >= 0 ? "active" : ""}`}>
              <span className="steps-mockup__sidebar-dot" style={{ background: phase >= 0 ? "var(--accent)" : "var(--border)" }} />
              <span>Chantier</span>
            </div>
            <div className={`steps-mockup__sidebar-item ${phase >= 1 ? "active" : ""}`}>
              <span className="steps-mockup__sidebar-dot" style={{ background: phase >= 1 ? "var(--wood)" : "var(--border)" }} />
              <span>Construction</span>
            </div>
            <div className={`steps-mockup__sidebar-item ${phase >= 2 ? "active" : ""}`}>
              <span className="steps-mockup__sidebar-dot" style={{ background: phase >= 2 ? "#28c840" : "var(--border)" }} />
              <span>Validation</span>
            </div>
          </div>
          {/* Main area */}
          <div className="steps-mockup__main">
            {phase === 0 && (
              <div className="steps-mockup__prompt">
                <span className="steps-mockup__prompt-label">Décris ton chantier</span>
                <div className="steps-mockup__input">
                  <span className="steps-mockup__cursor">▸</span>
                  <span>{inputVal}</span>
                  <span className="steps-mockup__blinker">▊</span>
                </div>
              </div>
            )}
            {phase === 1 && (
              <div className="steps-mockup__build">
                <div className="steps-mockup__build-header">
                  <span className="pulse-dot" />
                  <strong>Le castor construit…</strong>
                </div>
                <div className="steps-mockup__build-log">
                  {building.map((line, i) => (
                    <span key={i} className="steps-mockup__build-line">{line}</span>
                  ))}
                </div>
                <div className="steps-mockup__progress">
                  <div className="steps-mockup__progress-fill" style={{ width: `${Math.min(100, building.length * 25)}%` }} />
                </div>
              </div>
            )}
            {phase === 2 && (
              <div className="steps-mockup__done">
                <div className="steps-mockup__done-icon">✔</div>
                <strong>Chantier terminé</strong>
                <span className="steps-mockup__done-sub">Le blog de recettes végé est prêt à exporter.</span>
                <div className="steps-mockup__done-files">
                  <span>📄 index.html</span>
                  <span>🎨 styles.css</span>
                  <span>🧪 tests.html</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Steps legend below */}
      <div className="steps-legend">
        <div className={`steps-legend__item ${phase >= 0 ? "steps-legend__item--active" : ""}`}>
          <span className="steps-legend__num">01</span>
          <div>
            <strong>Tu donnes un chantier</strong>
            <p>Une phrase suffit. Pas de config.</p>
          </div>
        </div>
        <div className={`steps-legend__item ${phase >= 1 ? "steps-legend__item--active" : ""}`}>
          <span className="steps-legend__num">02</span>
          <div>
            <strong>Le castor construit</strong>
            <p>Structure, styles, tests, bloc par bloc.</p>
          </div>
        </div>
        <div className={`steps-legend__item ${phase >= 2 ? "steps-legend__item--active" : ""}`}>
          <span className="steps-legend__num">03</span>
          <div>
            <strong>Tu valides, c'est à toi</strong>
            <p>Le code t'appartient, point.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Steps() {
  return (
    <section className="section steps" id="chantier">
      <AnimatedHeading variant="letters">Le chantier en trois coups de patte</AnimatedHeading>
      <p className="section-sub">Pas de tunnel magique : tu vois chaque étape.</p>
      <StepsMockup />
    </section>
  );
}

/* aperçu de l'avancement → pointe vers la page dédiée /avancement */
function ProgressTeaser() {
  const navigate = useNavigate();
  return (
    <section className="section prog-teaser" id="avancement">
      <div className="prog-teaser__inner">
        <div className="prog-teaser__text">
          <span className="prog__badge">🔨 Avancement du projet</span>
          <h2>Le chantier avance, patte après patte</h2>
          <p className="section-sub">
            Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse
            promesse ni date artificielle.
          </p>
        </div>
        <a
          className="btn btn--primary btn--lg"
          href="/castor/avancement"
          onClick={(e) => {
            e.preventDefault();
            navigate("/avancement");
          }}
        >
          Voir l'avancement du projet →
        </a>
      </div>
    </section>
  );
}

export default function Home({ onDownload }) {
  return (
    <>
      <Hero onDownload={onDownload} />
      <Manifesto />
      <Steps />
      <DemoSection />
      <Testimonials />
      <ProgressTeaser />
      <FAQSection />
      <DownloadSection onDownload={onDownload} />
    </>
  );
}
