import { useContext } from "react";
import { navigateTo } from "./useHistoryRoute.js";
import { NavigationContext } from "./navigationContext.js";

/**
 * Fournit la fonction navigate() à tout le composant tree.
 * Utilise : const navigate = useNavigate();
 *          navigate("/desktop");           // page Desktop
 *          navigate("/", "produits");      // Accueil → scroll #produits
 */
/* Module infrastructure : le hook est lié au context, fast-refresh sans objet ici. */
// eslint-disable-next-line react-refresh/only-export-components
export function useNavigate() {
  return useContext(NavigationContext);
}

/** Wrapper : appelle navigateTo et propage via context */
export function NavigationProvider({ children }) {
  return (
    <NavigationContext.Provider value={navigateTo}>
      {children}
    </NavigationContext.Provider>
  );
}