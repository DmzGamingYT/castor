import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DownloadModal from "./components/DownloadModal.jsx";
import { PRODUCTS } from "./data/products.jsx";

/* les studios et pages secondaires sont chargés à la demande */
const Home = lazy(() => import("./pages/Home.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));
const Models = lazy(() => import("./pages/Models.jsx"));
const WebStudio = lazy(() => import("./pages/WebStudio.jsx"));
const ChatStudio = lazy(() => import("./pages/ChatStudio.jsx"));

const PRODUCT_SLUGS = new Set(PRODUCTS.map((p) => `/${p.slug}`));
const PRODUCT_BY_PATH = Object.fromEntries(PRODUCTS.map((p) => [`/${p.slug}`, p]));

function titleFor(path) {
  const product = PRODUCT_BY_PATH[path];
  if (product) return `${product.name} — Castor`;
  const titles = {
    "/": "Castor — le castor qui code pour toi",
    "/models": "Modèles gratuits — Castor",
    "/web": "Castor Web — le studio de génération — Castor",
    "/chat": "Castor Chat — le studio de dialogue — Castor",
  };
  return titles[path] || titles["/"];
}

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const parts = hash.replace(/^#/, "").split("#");
  const path = parts[0] || "/";
  const anchor = parts[1];

  /* titre d'onglet par page + remontée en haut à chaque changement de route
     (sauf navigation vers une ancre, qui gère son propre scroll) */
  useEffect(() => {
    document.title = titleFor(path);
    if (!anchor) window.scrollTo(0, 0);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
  }, [anchor]);

  return { path, anchor };
}

function PageFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Chargement de la page">
      🦫 chargement…
    </div>
  );
}

export default function App() {
  const { path } = useHashRoute();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const openDownload = () => setDownloadOpen(true);

  const page =
    path === "/web" ? (
      <WebStudio />
    ) : path === "/chat" ? (
      <ChatStudio />
    ) : PRODUCT_SLUGS.has(path) ? (
      <ProductPage slug={path.slice(1)} onDownload={openDownload} />
    ) : path === "/models" ? (
      <Models />
    ) : (
      <Home onDownload={openDownload} />
    );

  return (
    <div className="app">
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById("main")?.focus()}
      >
        Aller au contenu
      </button>
      <Header route={path} onDownload={openDownload} />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>{page}</Suspense>
      </main>
      <Footer onDownload={openDownload} />
      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </div>
  );
}
