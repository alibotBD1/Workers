import { useSyncExternalStore } from "react";
import type { Entreprise, Offre } from "./types";
import { ENTREPRISES_DEMO } from "./entreprises";
import { genererOffresDemo } from "./demo";
import { CONFIG } from "@/lib/config";
import { slugify } from "@/lib/format";
import { db, firebaseActif } from "@/lib/firebase";

// Trois sources d'offres :
//  1. les fichiers JSON de src/data/offres/ (publication via GitHub Issues) ;
//  2. la base Firestore (offres des recruteurs, collecte IA, saisies admin) ;
//  3. les offres de démonstration (si VITE_DEMO n'est pas « false »).
const fichiers = import.meta.glob<Offre>("./offres/*.json", { eager: true, import: "default" });
const OFFRES_FICHIERS: Offre[] = Object.values(fichiers);
const OFFRES_DEMO: Offre[] = CONFIG.modeDemo ? genererOffresDemo() : [];

let offresBase: Offre[] = [];
let chargementBase = firebaseActif;

interface Catalogue {
  offres: Offre[];
  entreprises: Entreprise[];
  chargement: boolean;
}

function construire(): Catalogue {
  const maintenant = Date.now();
  const enCours = (o: Offre) => !o.expireLe || new Date(o.expireLe).getTime() > maintenant;
  const parSlug = new Map<string, Offre>();
  for (const o of [...offresBase, ...OFFRES_FICHIERS, ...OFFRES_DEMO]) if (!parSlug.has(o.slug)) parSlug.set(o.slug, o);
  const offres = [...parSlug.values()].filter(enCours).sort((a, b) => b.publieeLe.localeCompare(a.publieeLe));

  const reelles = offres.filter((o) => !o.demo);
  const deduites: Entreprise[] = reelles
    .filter((o) => !ENTREPRISES_DEMO.some((e) => e.slug === o.entreprise))
    .map((o) => ({
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
  const entreprises = [...new Map([...deduites, ...(CONFIG.modeDemo ? ENTREPRISES_DEMO : [])].map((e) => [e.slug, e])).values()];
  return { offres, entreprises, chargement: chargementBase };
}

let catalogue = construire();
const abonnes = new Set<() => void>();
const notifier = () => {
  catalogue = construire();
  abonnes.forEach((f) => f());
};

// Abonnement temps réel aux offres publiées dans Firestore
if (firebaseActif && db) {
  Promise.all([import("firebase/firestore")]).then(([{ collection, onSnapshot, orderBy, query, where, limit }]) => {
    onSnapshot(
      query(collection(db!, "offres"), where("statut", "==", "publiee"), orderBy("publieeLe", "desc"), limit(1000)),
      (snap) => {
        offresBase = snap.docs.map((d) => ({ ...(d.data() as Offre), slug: (d.data().slug as string) || d.id, id: d.id }));
        chargementBase = false;
        notifier();
      },
      () => {
        chargementBase = false;
        notifier();
      },
    );
  });
}

export function useCatalogue(): Catalogue {
  return useSyncExternalStore(
    (f) => {
      abonnes.add(f);
      return () => abonnes.delete(f);
    },
    () => catalogue,
  );
}

export const offreParSlug = (slug: string) => catalogue.offres.find((o) => o.slug === slug);
export const entrepriseParSlug = (slug: string) => catalogue.entreprises.find((e) => e.slug === slug);
export const offresDe = (slugEntreprise: string) => catalogue.offres.filter((o) => o.entreprise === slugEntreprise);
