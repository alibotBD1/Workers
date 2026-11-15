import { Link } from "react-router-dom";
import { Banknote, Clock, MapPin, Zap } from "lucide-react";
import type { Offre } from "@/data/types";
import { fourchette, ilYa } from "@/lib/format";
import Monogramme from "./Monogramme";
import BoutonFavori from "./BoutonFavori";
import AnneauCompat from "./AnneauCompat";

const couleurContrat: Record<string, string> = {
  CDI: "bg-foret-100 text-foret-800",
  CDD: "bg-soleil-100 text-soleil-800",
  Stage: "bg-sky-100 text-sky-800",
  Alternance: "bg-violet-100 text-violet-800",
  Freelance: "bg-terre-100 text-terre-800",
  Intérim: "bg-stone-200 text-stone-800",
};

export default function CarteOffre({ offre, compat, compacte = false }: { offre: Offre; compat?: number | null; compacte?: boolean }) {
  const salaire = fourchette(offre.salaireMin, offre.salaireMax);
  const nouvelle = Date.now() - new Date(offre.publieeLe).getTime() < 2 * 86400000;
  return (
    <Link
      to={`/offres/${offre.slug}`}
      className="group carte relative flex gap-4 p-5 transition hover:-translate-y-0.5 hover:border-foret-300 hover:shadow-flotte"
    >
      <Monogramme slug={offre.entreprise} nom={offre.entrepriseNom} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-md px-2 py-0.5 font-bold ${couleurContrat[offre.contrat] ?? ""}`}>{offre.contrat}</span>
          {offre.urgent && (
            <span className="inline-flex items-center gap-1 rounded-md bg-terre-500 px-2 py-0.5 font-bold text-white">
              <Zap className="h-3 w-3" /> Urgent
            </span>
          )}
          {nouvelle && <span className="rounded-md bg-soleil-300 px-2 py-0.5 font-bold text-encre">Nouveau</span>}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-encre group-hover:text-foret-700">{offre.titre}</h3>
        <p className="mt-0.5 text-sm font-medium text-encre/60">{offre.entrepriseNom}</p>
        {!compacte && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-encre/65">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-terre-500" />
              {offre.ville}
              {offre.teletravail !== "Sur site" && <span className="text-encre/45">· {offre.teletravail}</span>}
            </span>
            {salaire && (
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-foret-500" />
                {salaire}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-encre/45">
              <Clock className="h-4 w-4" />
              {ilYa(offre.publieeLe)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <BoutonFavori slug={offre.slug} />
        {compat != null && <AnneauCompat valeur={compat} />}
      </div>
    </Link>
  );
}
