// Espace personnel du candidat, conservé dans le navigateur (localStorage).
// Aucune donnée n'est envoyée à un serveur.
import { useSyncExternalStore } from "react";
import type { Contrat } from "@/data/taxonomie";

export type StatutCandidature = "Envoyée" | "Relancée" | "Entretien" | "Offre reçue" | "Refusée";
export const STATUTS: StatutCandidature[] = ["Envoyée", "Relancée", "Entretien", "Offre reçue", "Refusée"];

export interface Candidature {
  slug: string;
  titre: string;
  entrepriseNom: string;
  ville: string;
  date: string;
  statut: StatutCandidature;
  note?: string;
}

export interface Profil {
  prenom: string;
  metier: string;
  ville: string;
  competences: string[];
  contrats: Contrat[];
  secteurs: string[];
  salaireSouhaite?: number;
}

export interface Alerte {
  id: string;
  q: string;
  ville: string;
  contrat: string;
  creeeLe: string;
}

interface Etat {
  favoris: string[];
  candidatures: Candidature[];
  profil: Profil | null;
  alertes: Alerte[];
  recherches: string[];
}

const CLE = "melanyne-work:v1";
const VIDE: Etat = { favoris: [], candidatures: [], profil: null, alertes: [], recherches: [] };

function lire(): Etat {
  try {
    const brut = localStorage.getItem(CLE);
    return brut ? { ...VIDE, ...JSON.parse(brut) } : VIDE;
  } catch {
    return VIDE;
  }
}

let etat: Etat = lire();
const abonnes = new Set<() => void>();

function ecrire(maj: (e: Etat) => Etat) {
  etat = maj(etat);
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    /* stockage indisponible : on garde l'état en mémoire */
  }
  abonnes.forEach((f) => f());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CLE) {
      etat = lire();
      abonnes.forEach((f) => f());
    }
  });
}

const abonner = (f: () => void) => {
  abonnes.add(f);
  return () => abonnes.delete(f);
};

export function useEspace<T>(selecteur: (e: Etat) => T): T {
  return useSyncExternalStore(abonner, () => selecteur(etat));
}

export const actions = {
  basculerFavori(slug: string) {
    ecrire((e) => ({
      ...e,
      favoris: e.favoris.includes(slug) ? e.favoris.filter((s) => s !== slug) : [slug, ...e.favoris],
    }));
  },
  candidater(c: Omit<Candidature, "date" | "statut">) {
    ecrire((e) => ({
      ...e,
      candidatures: [
        { ...c, date: new Date().toISOString(), statut: "Envoyée" as const },
        ...e.candidatures.filter((x) => x.slug !== c.slug),
      ],
    }));
  },
  changerStatut(slug: string, statut: StatutCandidature) {
    ecrire((e) => ({ ...e, candidatures: e.candidatures.map((c) => (c.slug === slug ? { ...c, statut } : c)) }));
  },
  retirerCandidature(slug: string) {
    ecrire((e) => ({ ...e, candidatures: e.candidatures.filter((c) => c.slug !== slug) }));
  },
  enregistrerProfil(profil: Profil) {
    ecrire((e) => ({ ...e, profil }));
  },
  ajouterAlerte(a: Omit<Alerte, "id" | "creeeLe">) {
    ecrire((e) => ({
      ...e,
      alertes: [{ ...a, id: Math.random().toString(36).slice(2, 9), creeeLe: new Date().toISOString() }, ...e.alertes],
    }));
  },
  retirerAlerte(id: string) {
    ecrire((e) => ({ ...e, alertes: e.alertes.filter((a) => a.id !== id) }));
  },
  memoriserRecherche(q: string) {
    const t = q.trim();
    if (!t) return;
    ecrire((e) => ({ ...e, recherches: [t, ...e.recherches.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6) }));
  },
  toutEffacer() {
    ecrire(() => VIDE);
  },
};
