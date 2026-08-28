import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DownloadModal from "./components/DownloadModal.jsx";
import { PRODUCTS } from "./data/products.jsx";
import useHistoryRoute from "./lib/useHistoryRoute.js";
import { NavigationProvider } from "./lib/NavigationContext.jsx";
import { BeaverMark } from "./components/Icon.jsx";

/* les studios et pages secondaires sont chargés à la demande */
const Home = lazy(() => import("./pages/Home.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));
const Models = lazy(() => import("./pages/Models.jsx"));
const ChatStudio = lazy(() => import("./pages/ChatStudio.jsx"));

const PRODUCT_SLUGS = new Set(PRODUCTS.map((p) => `/${p.slug}`));

function PageFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Chargement de la page">
      <span className="route-loading__beaver">
        <BeaverMark size={36} />
      </span>
      <span className="route-loading__dots">
        <span /><span /><span />
      </span>
    </div>
  );
}

export default function App() {
  const path = useHistoryRoute();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const openDownload = () => setDownloadOpen(true);

  /* animation key : change à chaque navigation pour déclencher la transition */
  const [animKey, setAnimKey] = useState(0);
  const firstLoad = useRef(true);
  const prevPath = useRef(path);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (prevPath.current !== path) {
      setAnimKey((k) => k + 1);
      prevPath.current = path;
    }
  }, [path]);

  const page =
    path === "/chat" ? (
      <ChatStudio />
    ) : PRODUCT_SLUGS.has(path) ? (
      <ProductPage slug={path.slice(1)} onDownload={openDownload} />
    ) : path === "/models" ? (
      <Models />
    ) : (
      <Home onDownload={openDownload} />
    );

  return (
    <NavigationProvider>
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
          <div className={`page-transition${animKey > 0 ? " page-transition--anim" : ""}`} key={animKey}>
            <Suspense fallback={<PageFallback />}>{page}</Suspense>
          </div>
        </main>
        <Footer onDownload={openDownload} />
        <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
      </div>
    </NavigationProvider>
  );
}
