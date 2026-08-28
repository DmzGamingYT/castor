import { createContext, useContext } from "react";
import { navigateTo } from "./useHistoryRoute.js";

export const NavigationContext = createContext(null);

/**
 * Fournit la fonction navigate() à tout le composant tree.
 * Utilise : const navigate = useNavigate();
 *          navigate("/desktop");           // page Desktop
 *          navigate("/", "produits");      // Accueil → scroll #produits
 */
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
