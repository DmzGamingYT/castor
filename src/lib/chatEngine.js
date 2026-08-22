/* Moteur de chat Castor — streaming OpenRouter + mode démo locale. */

export async function streamChat({ apiKey, model, messages, onDelta, signal }) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} — ${txt.slice(0, 120)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split(/\n\n/);
      buf = parts.pop() || "";
      for (const evt of parts) {
        for (const line of evt.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") return;
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue; /* fragment incomplet */
          }
          /* certains providers renvoient l'erreur DANS le flux SSE */
          if (parsed.error) {
            throw new Error(parsed.error.message || "erreur du provider en cours de stream");
          }
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        }
      }
    }
  } finally {
    try {
      await reader.cancel();
      reader.releaseLock();
    } catch {
      /* stream déjà terminé */
    }
  }
}

/* ---------- mode démo : réponses locales originales ---------- */

const DEMOS = [
  {
    k: /llm|mod[eè]le|ia|intelligence|machine/i,
    a: `Bonne question ! Un LLM (grand modèle de langue), en très simple :

**1.** Il a lu énormément de texte — livres, code, articles.
**2.** Il a appris à prédire le mot suivant. C'est tout. Mais répété des milliards de fois, ça donne un modèle du monde assez bon pour discuter, résumer, coder.

**Ce que ça implique :**
- il ne « sait » pas, il **devine bien** — d'où les erreurs assurées ;
- plus la fenêtre de contexte est grande, plus il retient ta conversation ;
- le raisonnement s'améliore quand on lui demande d'y aller étape par étape.

*Astuce castor : demande-lui toujours le format de sortie voulu — liste, tableau, code — tu gagneras deux allers-retours.*`,
  },
  {
    k: /recette|cuisine|manger/i,
    a: `Voici une pâte à crêpes inratable (pour ~12 crêpes) :

**Ingrédients**
- 250 g de farine
- 4 œufs
- 500 ml de lait
- 1 pincée de sel
- 2 c. à soupe de sucre (optionnel)
- 50 g de beurre fondu

**Marche à suivre**
1. Mélange farine + sel + sucre.
2. Ajoute les œufs, puis le lait **progressivement** pour éviter les grumeaux.
3. Termine par le beurre fondu. Repose 30 min si tu peux.

*Astuce castor : la première crêpe est toujours sacrifiée — c'est la loi.*`,
  },
  {
    k: /code|fonction|bug|javascript|python|react/i,
    a: `Pour t'aider efficacement sur du code, envoie-moi :

1. **L'extrait concerné** (même approximatif)
2. **Le comportement attendu** vs observé
3. Le message d'erreur complet, s'il y en a un

Avec ça, je peux généralement pointer le problème du premier coup.

*En attendant ta clé : le studio \`/web\` et l'app Desktop parlent déjà aux modèles gratuits d'OpenRouter.*`,
  },
];

const DEFAULT_DEMO = `Je suis en **mode démo locale** — mes réponses sont limitées mais honnêtes.

Pour un vrai dialogue avec Ox Alpha, Nemotron ou Laguna (gratuits via OpenRouter) :

1. Clique sur **« clé ? »** dans la barre du composeur
2. Colle ta clé gratuite (créée en 30 s sur openrouter.ai)
3. Elle reste dans ton navigateur, envoyée uniquement à OpenRouter

D'ici là, pose-moi une question sur les LLM, le code ou une recette de crêpes — j'ai quelques cordes à mon arc.`;

export function demoAnswer(prompt) {
  const found = DEMOS.find((d) => d.k.test(prompt));
  const body = found ? found.a : DEFAULT_DEMO;
  return body + `\n\n---\n*Réponse de démonstration locale · 0 réseau · 0 €*`;
}

/* Stream local mot à mot pour imiter le rendu réseau */
export async function streamDemo(text, onDelta, signal) {
  const chunks = text.match(/\S+\s*/g) || [text];
  for (const w of chunks) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 24));
    onDelta(w);
  }
}
