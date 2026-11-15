import type { Entreprise, Offre } from "./types";
import { ENTREPRISES_DEMO } from "./entreprises";
import { genererOffresDemo } from "./demo";
import { CONFIG } from "@/lib/config";
import { slugify } from "@/lib/format";

// Les vraies offres : un fichier JSON par offre dans src/data/offres/
// (ajoutées automatiquement par le workflow « Publier une offre »).
const fichiers = import.meta.glob<Offre>("./offres/*.json", { eager: true, import: "default" });
const OFFRES_REELLES: Offre[] = Object.values(fichiers);

const maintenant = Date.now();
const enCours = (o: Offre) => !o.expireLe || new Date(o.expireLe).getTime() > maintenant;

export const OFFRES: Offre[] = [...OFFRES_REELLES, ...(CONFIG.modeDemo ? genererOffresDemo() : [])]
  .filter(enCours)
  .sort((a, b) => b.publieeLe.localeCompare(a.publieeLe));

// Entreprises : celles de la démo + celles déduites des vraies offres
const entreprisesDeduites: Entreprise[] = OFFRES_REELLES.filter(
  (o) => !ENTREPRISES_DEMO.some((e) => e.slug === o.entreprise),
).map((o) => ({
  slug: o.entreprise || slugify(o.entrepriseNom),
  nom: o.entrepriseNom,
  secteur: o.secteur,
  ville: o.ville,
  taille: "—",
  fondee: 0,
  accroche: "",
  description: "",
  valeurs: [],
  couleur: "#194f38",
}));

export const ENTREPRISES: Entreprise[] = [
  ...new Map([...entreprisesDeduites, ...(CONFIG.modeDemo ? ENTREPRISES_DEMO : [])].map((e) => [e.slug, e])).values(),
];

export const offreParSlug = (slug: string) => OFFRES.find((o) => o.slug === slug);
export const entrepriseParSlug = (slug: string) => ENTREPRISES.find((e) => e.slug === slug);
export const offresDe = (slugEntreprise: string) => OFFRES.filter((o) => o.entreprise === slugEntreprise);
