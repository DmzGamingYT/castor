import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DownloadModal from "./components/DownloadModal.jsx";
import CastorBot from "./components/CastorBot.jsx";
import { PRODUCTS } from "./data/products.jsx";
import useHistoryRoute from "./lib/useHistoryRoute.js";
import { NavigationProvider } from "./lib/NavigationContext.jsx";
import { LanguageProvider, useLanguage } from "./lib/LanguageContext.jsx";
import { BeaverMark } from "./components/Icon.jsx";

/* les studios et pages secondaires sont chargés à la demande */
const Home = lazy(() => import("./pages/Home.jsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.jsx"));
const CloudSpace = lazy(() => import("./pages/CloudSpace.jsx"));
const CliPage = lazy(() => import("./pages/CliPage.jsx"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage.jsx"));
const Avancement = lazy(() => import("./pages/Avancement.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const PRODUCT_SLUGS = new Set(PRODUCTS.map((p) => `/${p.slug}`));

function PageFallback() {
  const { t } = useLanguage();
  return (
    <div className="route-loading" role="status" aria-label={t("loading_page")}>
      <span className="route-loading__beaver">
        <BeaverMark size={36} />
      </span>
      <span className="route-loading__dots">
        <span /><span /><span />
      </span>
    </div>
  );
}

function AppInner() {
  const { t } = useLanguage();
  const path = useHistoryRoute(t);
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
    path === "/espace" ? (
      <CloudSpace />
    ) : PRODUCT_SLUGS.has(path) ? (
      <ProductPage slug={path.slice(1)} onDownload={openDownload} />
    ) : path === "/cli" ? (
      <CliPage />
    ) : path === "/templates" ? (
      <TemplatesPage />
    ) : path === "/" ? (
      <Home onDownload={openDownload} />
    ) : path === "/avancement" ? (
      <Avancement />
    ) : (
      <NotFound />
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
        <div className={`page-transition${animKey > 0 ? " page-transition--anim" : ""}`} key={animKey}>
          <Suspense fallback={<PageFallback />}>{page}</Suspense>
        </div>
      </main>
      <Footer onDownload={openDownload} />
      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
      <CastorBot />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
    <NavigationProvider>
      <AppInner />
    </NavigationProvider>
    </LanguageProvider>
  );
}
