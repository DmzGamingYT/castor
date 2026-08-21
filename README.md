<div align="center">

<img src="docs/logo.svg" width="110" alt="Castor" />

# Castor

**Le castor qui code pour toi. Gratuit pour toujours.**

Site vitrine · studio de création web · app Desktop multi-providers

[![React](https://img.shields.io/badge/React-18-2e3320?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Electron](https://img.shields.io/badge/Electron-33-2e3320?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-2e3320?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Licence](https://img.shields.io/badge/Licence-MIT-e2952a?style=flat-square)](LICENSE)
[![Prix](https://img.shields.io/badge/prix-0%20€-93a862?style=flat-square)](#)

</div>

---

**Castor** est un projet complet autour d'un agent de code gratuit :

- un **site vitrine** au thème « papier & encre » avec un hero interactif où le castor bâtit une app sous tes yeux,
- une **page Modèles** qui recense les modèles IA **gratuits** de chaque provider (type, contexte, actualisation live),
- un **studio Web fonctionnel** : tu décris une app, elle est générée, prévisualisée, téléchargeable — avec les modèles gratuits d'OpenRouter ou des gabarits 100 % locaux,
- une **app Desktop** (Windows / macOS / Linux) qui branche OpenRouter, Groq, OpenCode Zen et tes modèles locaux, avec compétences `/`, mémoire persistante, suivi d'usage et plan de tâches en direct.

## Aperçus

| Accueil — le chantier | Modèles gratuits |
| --- | --- |
| ![Accueil](docs/screenshots/accueil.png) | ![Modèles](docs/screenshots/modeles.png) |

| Studio Web | Page Desktop |
| --- | --- |
| ![Studio](docs/screenshots/studio-web.png) | ![Desktop](docs/screenshots/desktop.png) |

## Fonctionnalités

### Site & studio Web

- **Hero « Le Chantier »** : écris un chantier, regarde l'app se construire bloc par bloc avec son journal de bord
- **Page `/models`** : modèles gratuits par provider, filtres par type (multimodal, vision, raisonnement, code, rapide, outils), fenêtre de contexte, **actualisation live** depuis l'API publique d'OpenRouter
- **Studio `/web`** : composeur + sélection de modèle (Ox Alpha, Nemotron, Laguna…) :
  - **sans clé** → gabarits locaux instantanés (quiz jouable, todo interactif, dashboard, blog, portfolio, landing)
  - **avec une clé OpenRouter gratuite** → génération de code sur mesure par le modèle choisi, aperçu iframe, export `.html`, projets sauvegardés dans le navigateur
- Thème clair « papier & encre », icônes SVG dessinées main, zéro framework CSS

### App Desktop

- **Multi-providers** via le protocole OpenAI-compatible : OpenRouter · Groq · OpenCode Zen · Ollama · LM Studio
- **Streaming token par token**, arrêt à la volée (Échap), stats : latence, tok/s, premier token, ↑↓ tokens
- **Compétences `/`** : tes prompts réutilisables (`/review`, `/tests`… ou les tiens), menu filtrable au clavier
- **Mémoire persistante** : des faits injectés dans chaque requête, qui survivent aux redémarrages
- **Plan de tâches live** : la checklist du modèle devient une todo avec barre de progression
- **Jauge de contexte** : remplissage estimé de la fenêtre 128k en temps réel
- Clés API **chiffrées** via `safeStorage` du système · icône et thème maison · packaging DMG / NSIS / AppImage

## Démarrage rapide

Prérequis : **Node 18+**

```bash
# le site + studio
npm install
npm run dev            # → http://localhost:5173

# l'app Desktop
cd desktop
npm install
npm start              # lance Castor Desktop

# empaqueter l'app (icônes incluses)
npm run dist:dir       # build non signé local
npm run dist           # DMG (mac) · NSIS (win) · AppImage/deb (linux)
```

> Générer l'icône après modification : `npx electron scripts/make-icon.cjs`
> Capturer les écrans du README : `npx electron scripts/capture.cjs` (dev server requis)

## Providers

| Provider | Clé requise | Particularité |
| --- | --- | --- |
| **OpenRouter** | oui (gratuit) | 400+ modèles, tier `:free`, endpoint éditable |
| **Groq** | oui (gratuit) | inférence LPU ultra-rapide |
| **OpenCode Zen** | oui | passerelle spécialisée code |
| **Ollama** | non | 100 % local, hors ligne |
| **LM Studio** | non | serveur local, modèles détectés auto |

## Sécurité

- Clés Desktop chiffrées par le coffre de l'OS (`safeStorage`), jamais en clair sur le disque
- Clé du studio Web conservée uniquement dans le `localStorage` de ton navigateur
- Aucune donnée envoyée ailleurs qu'aux providers que tu choisis

## Structure

```
castor/
├── index.html               # site (Vite + React)
├── src/
│   ├── pages/               # accueil, modèles, studio web, pages produits
│   ├── components/          # UI (DamScene, Icon, DownloadModal…)
│   ├── data/                # produits, catalogue de modèles
│   └── lib/generator.js     # gabarits locaux + appel OpenRouter
├── scripts/                 # capture.cjs (screenshots), audit
└── desktop/
    ├── main.js              # fenêtre, IPC, streaming SSE, coffre à clés
    ├── preload.js           # pont sécurisé (contextIsolation)
    ├── src/providers.js     # registre des providers
    ├── scripts/make-icon.cjs# icône générée par rendu Chromium
    └── renderer/            # UI Desktop (même DA que le site)
```

## Notes de packaging

- Binaires produits en **arm64** (machine de build Apple Silicon) — ajouter les cibles x64 dans `desktop/package.json` si besoin
- macOS : builds **non notarisés** (compte Developer requis) — premier lancement via *Réglages → Confidentialité et sécurité → Ouvrir même ainsi*, ou `xattr -cr /Applications/Castor.app`
- Le dossier `public/downloads/` (binaires du modal) est généré et ignoré par git

## Roadmap

- [ ] Mode agent Desktop : lecture/écriture de fichiers, exécution de tests
- [ ] Connexion GitHub dans le studio Web
- [ ] Carte du monde temps réel (retour du Live)
- [ ] Builds x64 + signature & notarisation macOS
- [ ] Version anglaise du site

## Licence

[MIT](LICENSE) — fais-en ce que tu veux, avec un petit crédit fait plaisir.

<div align="center">
<img src="docs/logo.svg" width="42" alt="" />
<br/><sub>Bâti avec 🦫 · 0 € pour toujours</sub>
</div>
