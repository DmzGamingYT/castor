/* Générateur de sites Castor Web — 100 % local, sans clé API.
   Analyse le prompt, choisit un gabarit original et un thème,
   renvoie une page HTML complète et autonome. */

const THEMES = {
  ambre: { bg: "#faf6ec", ink: "#2e3320", muted: "#7c7860", accent: "#e2952a", soft: "#fdf3dd", border: "#eadfc6" },
  ciel: { bg: "#f4f9fc", ink: "#1f2d36", muted: "#6b7f8c", accent: "#2b8fb0", soft: "#e3f2f8", border: "#d3e5ee" },
  sauge: { bg: "#f6f9f0", ink: "#26301c", muted: "#75815f", accent: "#7a9449", soft: "#ecf3dd", border: "#dde7cb" },
  bois: { bg: "#fbf5ee", ink: "#33291c", muted: "#87765c", accent: "#b07a2e", soft: "#f6ead6", border: "#ecdcc4" },
};

const STOP = new Set([
  "un", "une", "des", "le", "la", "les", "de", "du", "pour", "avec", "mon", "ma",
  "mes", "ton", "ta", "tes", "son", "sa", "ses", "qui", "que", "à", "au", "aux",
  "en", "et", "sur", "dans", "the", "a", "of", "app", "application", "site",
]);

function hash(s) {
  return [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7);
}

function esc(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function extractTitle(prompt) {
  const words = prompt
    .toLowerCase()
    .replace(/[^\wàâäéèêëîïôöùûüç' -]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
  const picked = words.slice(0, 4);
  if (!picked.length) return "Mon site";
  return picked.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 28) || "mon-site";
}

function detectKind(p) {
  if (/quiz|qcm|question|révision|revision/.test(p)) return "quiz";
  if (/todo|tâche|tache|habitude|checklist|liste de course/.test(p)) return "todo";
  if (/dashboard|tableau de bord|météo|meteo|stats|statistique|suivi/.test(p)) return "dashboard";
  if (/portfolio|galerie|photo|illustrateur|cv|artiste/.test(p)) return "portfolio";
  if (/blog|article|recette|magazine|journal|news/.test(p)) return "blog";
  return "landing";
}

const KIND_LABEL = {
  quiz: "Quiz",
  todo: "Liste interactive",
  dashboard: "Tableau de bord",
  portfolio: "Portfolio",
  blog: "Blog",
  landing: "Landing page",
};

function baseCss(t) {
  return `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;background:${t.bg};color:${t.ink};line-height:1.55}
    .wrap{max-width:880px;margin:0 auto;padding:2.5rem 1.4rem}
    .badge{display:inline-block;background:${t.soft};color:${t.accent};border-radius:999px;padding:.25rem .9rem;font-size:.78rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
    h1{font-size:clamp(1.9rem,5vw,3rem);letter-spacing:-.02em;line-height:1.1;margin:.9rem 0 .6rem}
    .sub{color:${t.muted};font-size:1.05rem;max-width:34rem}
    .btn{display:inline-block;background:${t.accent};color:#fff;border:none;border-radius:999px;padding:.75rem 1.5rem;font-weight:700;font-size:.95rem;cursor:pointer;text-decoration:none}
    .card{background:#fff;border:1px solid ${t.border};border-radius:16px;padding:1.2rem}
    footer{margin-top:3rem;color:${t.muted};font-size:.8rem;text-align:center}
  `;
}

const TEMPLATES = {
  landing: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
.hero{text-align:center;padding:4rem 0 3rem}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:2.5rem}
.feature b{display:block;margin-bottom:.3rem}
.feature p{color:${t.muted};font-size:.88rem}
.cta-band{text-align:center;margin-top:3rem;background:${t.soft};border-radius:20px;padding:2.2rem}
</style></head><body><div class="wrap">
<div class="hero"><span class="badge">Nouveau</span><h1>${esc(title)}</h1>
<p class="sub">Une page claire, rapide et prête à convaincre. Modifie ce texte directement dans le code — il t'appartient.</p>
<p style="margin-top:1.4rem"><a class="btn" href="#decouvrir">Découvrir</a></p></div>
<div class="features" id="decouvrir">
<div class="card feature"><b>⚡ Rapide</b><p>Un seul fichier HTML, aucun dépendance, chargement instantané.</p></div>
<div class="card feature"><b>📱 Responsive</b><p>S'adapte du téléphone au grand écran sans effort.</p></div>
<div class="card feature"><b>🎨 À ta marque</b><p>Couleurs et textes pensés pour être personnalisés en deux minutes.</p></div>
</div>
<div class="cta-band"><h2 style="margin-bottom:.5rem">Prêt à commencer ?</h2>
<p style="color:${t.muted};margin-bottom:1.1rem">Rejoins les premiers inscrits et garde une longueur d'avance.</p>
<a class="btn" href="#">Je m'inscris</a></div>
<footer>Généré par Castor Web · ${esc(title)}</footer>
</div></body></html>`,

  blog: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
header{padding:2.5rem 0 1rem;border-bottom:1px solid ${t.border}}
.posts{display:grid;gap:1rem;margin-top:1.8rem}
.post time{color:${t.muted};font-size:.78rem;font-family:ui-monospace,monospace}
.post h2{font-size:1.15rem;margin:.25rem 0}
.post p{color:${t.muted};font-size:.9rem}
.post:hover{border-color:${t.accent}}
</style></head><body><div class="wrap">
<header><span class="badge">Blog</span><h1>${esc(title)}</h1>
<p class="sub">Des articles simples, lisibles, sans distraction.</p></header>
<div class="posts">
<div class="card post"><time>2026-08-18</time><h2>Le premier article</h2><p>Chaque voyage commence par une première ligne. Voici pourquoi écrire régulièrement change tout.</p></div>
<div class="card post"><time>2026-08-12</time><h2>Montrer son travail</h2><p>Publier imparfait mais publier quand même : la meilleure habitude d'un créatif.</p></div>
<div class="card post"><time>2026-08-05</time><h2>Ralentir pour avancer</h2><p>Sur la lenteur volontaire et ce qu'elle produit de meilleur.</p></div>
</div>
<footer>Généré par Castor Web · ${esc(title)}</footer>
</div></body></html>`,

  portfolio: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
.hero{padding:3.5rem 0 2rem;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:2rem}
.tile{aspect-ratio:4/3;border-radius:14px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:1.1rem;letter-spacing:-.02em}
.contact{text-align:center;margin-top:3rem}
</style></head><body><div class="wrap">
<div class="hero"><span class="badge">Portfolio</span><h1>${esc(title)}</h1>
<p class="sub" style="margin:0 auto">Sélection de travaux récents — cliquez, regardez, écrivez-moi.</p></div>
<div class="grid">
<div class="tile" style="background:${t.accent}">Projet 01</div>
<div class="tile" style="background:${t.ink}">Projet 02</div>
<div class="tile" style="background:${t.soft};color:${t.accent};border:1px solid ${t.border}">Projet 03</div>
<div class="tile" style="background:${t.muted}">Projet 04</div>
<div class="tile" style="background:${t.border};color:${t.ink}">Projet 05</div>
<div class="tile" style="background:${t.accent};opacity:.75">Projet 06</div>
</div>
<div class="contact"><h2>Travaillons ensemble</h2>
<p style="color:${t.muted};margin:.5rem 0 1.1rem">Disponible pour vos projets.</p>
<a class="btn" href="mailto:bonjour@example.fr">Écrire</a></div>
<footer>Généré par Castor Web · ${esc(title)}</footer>
</div></body></html>`,

  dashboard: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-top:1.8rem}
.stat b{font-size:1.7rem;letter-spacing:-.02em;display:block}
.stat span{color:${t.muted};font-size:.8rem}
.chart{margin-top:1.4rem}
svg{width:100%;height:auto;display:block}
</style></head><body><div class="wrap">
<span class="badge">Tableau de bord</span><h1 style="font-size:2rem">${esc(title)}</h1>
<div class="stats">
<div class="card stat"><b>1 248</b><span>visites cette semaine</span></div>
<div class="card stat"><b>+18 %</b><span>vs semaine dernière</span></div>
<div class="card stat"><b>4 min 32</b><span>durée moyenne</span></div>
<div class="card stat"><b>97 %</b><span>satisfaction</span></div>
</div>
<div class="card chart"><b style="font-size:.9rem">Tendance</b>
<svg viewBox="0 0 600 160"><polyline fill="none" stroke="${t.accent}" stroke-width="3" stroke-linecap="round"
points="0,130 60,118 120,124 180,96 240,102 300,74 360,80 420,52 480,58 540,30 600,38"/>
<g fill="${t.accent}">${[0,60,120,180,240,300,360,420,480,540,600].map((x,i)=>`<circle cx="${x}" cy="${[130,118,124,96,102,74,80,52,58,30,38][i]}" r="4"/>`).join("")}</g></svg>
</div>
<footer>Généré par Castor Web · données de démonstration</footer>
</div></body></html>`,

  todo: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
.add{display:flex;gap:.6rem;margin:1.6rem 0 1rem}
.add input{flex:1;border:1px solid ${t.border};border-radius:999px;padding:.7rem 1.1rem;font-size:.95rem;outline:none}
ul{list-style:none;display:grid;gap:.45rem}
li{display:flex;align-items:center;gap:.7rem;background:#fff;border:1px solid ${t.border};border-radius:12px;padding:.65rem .9rem}
li.done span{text-decoration:line-through;color:${t.muted}}
li button{margin-left:auto;border:none;background:none;cursor:pointer;color:${t.muted};font-size:1rem}
.box{width:20px;height:20px;border-radius:6px;border:2px solid ${t.accent};cursor:pointer;display:grid;place-items:center;color:${t.accent};font-weight:900}
</style></head><body><div class="wrap">
<span class="badge">Interactif</span><h1 style="font-size:2rem">${esc(title)}</h1>
<form class="add" id="f"><input id="i" placeholder="Nouvelle tâche…" autocomplete="off"><button class="btn">Ajouter</button></form>
<ul id="l"></ul>
<footer>Généré par Castor Web · tout reste dans ton navigateur</footer>
<script>
const l=document.getElementById("l");
function add(text,done){
  const li=document.createElement("li");if(done)li.className="done";
  const box=document.createElement("span");box.className="box";box.textContent=done?"✓":"";
  const sp=document.createElement("span");sp.textContent=text;
  const del=document.createElement("button");del.textContent="✕";
  box.onclick=()=>{li.classList.toggle("done");box.textContent=li.classList.contains("done")?"✓":""};
  del.onclick=()=>li.remove();
  li.append(box,sp,del);l.prepend(li);
}
document.getElementById("f").onsubmit=e=>{e.preventDefault();const i=document.getElementById("i");if(i.value.trim()){add(i.value.trim());i.value=""}};
add("Essayer mon nouveau castor",true);add("Personnaliser les couleurs");add("Partager à un ami");
</script></div></body></html>`,

  quiz: (title, t) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
${baseCss(t)}
.q{margin-top:1.6rem;display:grid;gap:.7rem}
.q h2{font-size:1.1rem}
.opt{display:block;width:100%;text-align:left;background:#fff;border:1px solid ${t.border};border-radius:12px;padding:.75rem 1rem;font-size:.95rem;cursor:pointer;font-family:inherit}
.opt:hover{border-color:${t.accent}}
.opt.ok{border-color:#5a9e4b;background:#eef6e6}
.opt.ko{border-color:#c25b45;background:#fbeae6}
#score{margin-top:1.4rem;font-weight:700;font-size:1.1rem}
</style></head><body><div class="wrap">
<span class="badge">Quiz</span><h1 style="font-size:2rem">${esc(title)}</h1>
<p class="sub">Trois questions pour tester tes connaissances. Bonne chance !</p>
<div class="q" id="q"></div>
<p id="score"></p>
<footer>Généré par Castor Web · ${esc(title)}</footer>
<script>
const QS=[
 {q:"Quel animal bâtit des barrages ?",o:["Le castor","Le hérisson","Le renard"],a:0},
 {q:"Combien de pattes a une araignée ?",o:["6","8","10"],a:1},
 {q:"Que produit un arbre en le plantant ?",o:["Du wifi","De l'ombre et des fruits","Des notifications"],a:1}];
let s=0,i=0;
const el=document.getElementById("q");
function show(){
 if(i>=QS.length){el.innerHTML="";document.getElementById("score").textContent="Score : "+s+"/"+QS.length+" "+(s===3?"🦫 Parfait !":"— retente ta chance !");return}
 const q=QS[i];el.innerHTML="<h2>"+(i+1)+". "+q.q+"</h2>";
 q.o.forEach((o,idx)=>{
   const b=document.createElement("button");b.className="opt";b.textContent=o;
   b.onclick=()=>{const ok=idx===q.a;if(ok)s++;b.classList.add(ok?"ok":"ko");
     [...el.querySelectorAll(".opt")].forEach(x=>x.disabled=true);
     setTimeout(()=>{i++;show()},650)};
   el.appendChild(b)});
}
show();
</script></div></body></html>`,
};

export function generateSite(prompt, themeName) {
  const p = prompt.toLowerCase();
  const kind = detectKind(p);
  const theme = THEMES[themeName] || THEMES[Object.keys(THEMES)[hash(prompt) % 4]];
  const title = extractTitle(prompt);
  const slug = slugify(title);
  return {
    kind,
    kindLabel: KIND_LABEL[kind],
    title,
    slug,
    theme: Object.keys(THEMES).find((k) => THEMES[k] === theme),
    html: TEMPLATES[kind](title, theme),
    createdAt: Date.now(),
  };
}

export const THEME_LIST = Object.keys(THEMES);

/* ---------- génération par IA (OpenRouter) ---------- */

export async function fetchFreeModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.data || [])
    .filter((m) => m.pricing?.prompt === "0")
    .map((m) => ({ id: m.id, name: m.name || m.id, ctx: m.context_length || null }));
}

export async function generateWithAI({ prompt, model, apiKey, themeName }) {
  const t = THEMES[themeName] || THEMES.ambre;
  const system =
    "Tu es un générateur de pages web. Réponds UNIQUEMENT avec le code HTML complet " +
    "d'une page autonome en un seul fichier, commençant par <!doctype html>. " +
    "Tout le CSS est dans un <style> interne, le JS éventuel dans un <script> interne. " +
    "Pas de markdown, pas d'explication, pas de texte autour du code. " +
    `Contenu en français. Direction artistique : fond ${t.bg}, texte ${t.ink}, ` +
    `accent ${t.accent}, tons doux, arrondis généreux, responsive, typographie système moderne.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} — ${txt.slice(0, 140)}`);
  }

  const json = await res.json();
  let out = json.choices?.[0]?.message?.content || "";
  out = out.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, "").trim();

  const iDoc = out.toLowerCase().indexOf("<!doctype");
  const iHtml = out.toLowerCase().indexOf("<html");
  const start = iDoc >= 0 ? iDoc : iHtml;
  if (start > 0) out = out.slice(start);
  if (!/<html/i.test(out)) throw new Error("le modèle n'a pas renvoyé de HTML complet");

  return out;
}

export function titleFromHtml(html, fallbackPrompt) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (m && m[1].trim()) return m[1].trim().slice(0, 60);
  const h = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h && h[1].trim()) return h[1].replace(/<[^>]+>/g, "").trim().slice(0, 60);
  return extractTitle(fallbackPrompt);
}
