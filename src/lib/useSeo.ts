import { useEffect } from "react";

/** Met à jour le titre de l'onglet et la meta description. */
export default function useSeo(titre: string, description?: string) {
  useEffect(() => {
    document.title = titre ? `${titre} · Melanyne Work` : "Melanyne Work — Offres d'emploi au Cameroun";
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [titre, description]);
}
