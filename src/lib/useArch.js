import { useEffect, useState } from "react";
import { normalizeArch } from "../data/platforms.js";

/* Architecture UA détectée via getHighEntropyValues ("x64" | "arm64" | null).
   Partagée entre DownloadModal et DownloadCompare pour afficher le bon build. */
export function useArch() {
  const [arch, setArch] = useState(null);

  useEffect(() => {
    const uad = navigator.userAgentData;
    if (!uad?.getHighEntropyValues) return;
    let alive = true;
    uad
      .getHighEntropyValues(["architecture"])
      .then((v) => {
        if (!alive) return;
        setArch(normalizeArch(v.architecture));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return arch;
}