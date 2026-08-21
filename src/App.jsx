import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DownloadModal from "./components/DownloadModal.jsx";
import Home from "./pages/Home.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import Models from "./pages/Models.jsx";
import WebStudio from "./pages/WebStudio.jsx";
import { PRODUCTS } from "./data/products.jsx";

const PRODUCT_SLUGS = new Set(PRODUCTS.map((p) => `/${p.slug}`));

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

  useEffect(() => {
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    }
  }, [anchor]);

  return { path, anchor };
}

export default function App() {
  const { path, anchor } = useHashRoute();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const openDownload = () => setDownloadOpen(true);

  const page =
    path === "/web" ? (
      <WebStudio />
    ) : PRODUCT_SLUGS.has(path) ? (
      <ProductPage slug={path.slice(1)} onDownload={openDownload} />
    ) : path === "/models" ? (
      <Models />
    ) : (
      <Home onDownload={openDownload} />
    );

  return (
    <div className="app">
      <Header route={path} onDownload={openDownload} />
      <main>{page}</main>
      <Footer onDownload={openDownload} />
      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </div>
  );
}
