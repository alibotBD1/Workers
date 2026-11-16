import type { Contrat, Niveau, Teletravail } from "./taxonomie";

export interface Entreprise {
  slug: string;
  nom: string;
  secteur: string;
  ville: string;
  taille: string;
  fondee: number;
  accroche: string;
  description: string;
  valeurs: string[];
  couleur: string; // couleur du monogramme
  site?: string;
  demo?: boolean;
}

export interface Offre {
  id?: string; // identifiant Firestore
  slug: string;
  titre: string;
  entreprise: string; // slug de l'entreprise, ou nom libre si non référencée
  entrepriseNom: string;
  ville: string;
  contrat: Contrat;
  niveau: Niveau;
  teletravail: Teletravail;
  secteur: string;
  salaireMin?: number; // FCFA brut mensuel
  salaireMax?: number;
  publieeLe: string; // ISO
  expireLe?: string; // ISO
  resume: string;
  missions: string[];
  profil: string[];
  avantages: string[];
  competences: string[];
  candidature: { email?: string; url?: string };
  urgent?: boolean;
  demo?: boolean;
  // Champs de la base
  statut?: "en_attente" | "publiee" | "refusee" | "expiree";
  origine?: "recruteur" | "collecte" | "admin" | "github";
  recruteurId?: string;
  source?: { nom: string; url: string; lienAnnonce?: string; collecteeLe?: string };
  motifRefus?: string;
}

export interface Article {
  slug: string;
  titre: string;
  chapo: string;
  categorie: string;
  minutes: number;
  couleur: string;
  sections: { titre: string; texte: string[] }[];
}
