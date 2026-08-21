import { useEffect, useRef } from "react";
import Products from "../components/Products.jsx";
import FAQ from "../components/FAQ.jsx";
import DamScene from "../components/DamScene.jsx";
import Hills from "../components/Hills.jsx";
import Icon, { BeaverMark } from "../components/Icon.jsx";

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

function Hero({ onDownload }) {
  return (
    <section className="hero">
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

      <DamScene />

      <div className="hero__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
          Télécharger Desktop
        </button>
        <a className="btn btn--ghost btn--lg" href="#/#produits">
          Découvrir les produits
        </a>
      </div>
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
  return (
    <section className="manifesto">
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

const STEPS = [
  {
    num: "01",
    icon: "clipboard",
    title: "Tu donnes un chantier",
    desc: "Une phrase suffit. Pas de configuration, pas de scaffold à écrire.",
  },
  {
    num: "02",
    icon: "hammer",
    title: "Le castor construit",
    desc: "Structure, styles, tests : il monte tout, bloc par bloc, devant toi.",
  },
  {
    num: "03",
    icon: "checkCircle",
    title: "Tu valides, c'est à toi",
    desc: "Chaque brique est lisible et modifiable. Le code t'appartient, point.",
  },
];

function Steps() {
  return (
    <section className="section steps">
      <h2>Le chantier en trois coups de patte</h2>
      <p className="section-sub">Pas de tunnel magique : tu vois chaque étape.</p>
      <div className="steps__grid">
        {STEPS.map((s) => (
          <article key={s.num} className="step-card">
            <span className="step-card__num">{s.num}</span>
            <span className="step-card__icon" aria-hidden="true">
              <Icon name={s.icon} size={26} />
            </span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </article>
        ))}
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
      <Products />
      <FAQ />
    </>
  );
}
