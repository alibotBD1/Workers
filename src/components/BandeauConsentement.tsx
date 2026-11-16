import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { activerStatistiques, firebaseActif } from "@/lib/firebase";

const CLE = "workers:consentement";

/** Mesure d'audience uniquement après accord explicite du visiteur. */
export default function BandeauConsentement() {
  const [choix, setChoix] = useState<string | null>(() => {
    try { return localStorage.getItem(CLE); } catch { return "refuse"; }
  });
  useEffect(() => {
    if (choix === "accepte") activerStatistiques();
  }, [choix]);
  if (!firebaseActif || choix) return null;
  const decider = (v: "accepte" | "refuse") => {
    try { localStorage.setItem(CLE, v); } catch { /* ignoré */ }
    setChoix(v);
  };
  return (
    <div role="dialog" aria-label="Mesure d'audience" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl animate-monte rounded-2xl bg-foret-950 p-5 text-creme shadow-flotte sm:flex sm:items-center sm:gap-6">
      <p className="text-sm text-creme/80">
        Nous mesurons l'audience du site (pages vues, provenance) pour l'améliorer et adapter nos offres. Acceptez-vous ces statistiques ?{" "}
        <Link to="/confidentialite" className="underline">En savoir plus</Link>
      </p>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <button onClick={() => decider("refuse")} className="btn border border-creme/25 text-creme hover:bg-creme/10">Refuser</button>
        <button onClick={() => decider("accepte")} className="btn-soleil">Accepter</button>
      </div>
    </div>
  );
}
