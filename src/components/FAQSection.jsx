import { useState } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

/* mêmes questions que le JSON-LD FAQPage dans index.html — une seule source
   à maintenir à jour dans les deux endroits. */
const FAQ_KEYS = [
  { q: "faq_q1", a: "faq_a1" },
  { q: "faq_q2", a: "faq_a2" },
  { q: "faq_q3", a: "faq_a3" },
  { q: "faq_q4", a: "faq_a4" },
  { q: "faq_q5", a: "faq_a5" },
];

function FaqItem({ t, faq, open, onToggle, index }) {
  return (
    <div className={`faq__item ${open ? "faq__item--open" : ""}`}>
      <button
        type="button"
        className="faq__question"
        onClick={() => onToggle(index)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="faq__q-icon" aria-hidden="true">?</span>
        <span>{t(faq.q)}</span>
        <span className="faq__chevron" aria-hidden="true">⌄</span>
      </button>
      <div id={`faq-answer-${index}`} className="faq__answer" role="region">
        <p>{t(faq.a)}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <section className="section faq">
      <AnimatedHeading variant="words">{t("faq_heading")}</AnimatedHeading>
      <p className="section-sub">
        {t("faq_sub")}
      </p>
      <div className="faq__list">
        {FAQ_KEYS.map((faq, i) => (
          <FaqItem
            key={i}
            t={t}
            faq={faq}
            index={i}
            open={openIndex === i}
            onToggle={toggle}
          />
        ))}
      </div>
    </section>
  );
}
