// Référentiels du job board : régions, villes, secteurs, contrats, niveaux.

export const REGIONS = [
  "Adamaoua",
  "Centre",
  "Est",
  "Extrême-Nord",
  "Littoral",
  "Nord",
  "Nord-Ouest",
  "Ouest",
  "Sud",
  "Sud-Ouest",
] as const;
export type Region = (typeof REGIONS)[number];

export interface Ville {
  nom: string;
  region: Region;
}

export const VILLES: Ville[] = [
  { nom: "Douala", region: "Littoral" },
  { nom: "Yaoundé", region: "Centre" },
  { nom: "Bafoussam", region: "Ouest" },
  { nom: "Garoua", region: "Nord" },
  { nom: "Bamenda", region: "Nord-Ouest" },
  { nom: "Maroua", region: "Extrême-Nord" },
  { nom: "Ngaoundéré", region: "Adamaoua" },
  { nom: "Bertoua", region: "Est" },
  { nom: "Buea", region: "Sud-Ouest" },
  { nom: "Limbé", region: "Sud-Ouest" },
  { nom: "Kribi", region: "Sud" },
  { nom: "Ebolowa", region: "Sud" },
  { nom: "Edéa", region: "Littoral" },
  { nom: "Dschang", region: "Ouest" },
  { nom: "Kumba", region: "Sud-Ouest" },
];

export const regionDe = (ville: string): Region | undefined =>
  VILLES.find((v) => v.nom === ville)?.region;

export const CONTRATS = ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Intérim"] as const;
export type Contrat = (typeof CONTRATS)[number];

export const NIVEAUX = ["Débutant", "Confirmé", "Senior", "Direction"] as const;
export type Niveau = (typeof NIVEAUX)[number];

export const TELETRAVAIL = ["Sur site", "Hybride", "Télétravail"] as const;
export type Teletravail = (typeof TELETRAVAIL)[number];

export interface Secteur {
  id: string;
  nom: string;
  emoji: string;
}

export const SECTEURS: Secteur[] = [
  { id: "tech", nom: "Tech & Digital", emoji: "💻" },
  { id: "banque", nom: "Banque & Finance", emoji: "🏦" },
  { id: "telecom", nom: "Télécoms", emoji: "📡" },
  { id: "btp", nom: "BTP & Immobilier", emoji: "🏗️" },
  { id: "agro", nom: "Agro-industrie", emoji: "🌱" },
  { id: "sante", nom: "Santé", emoji: "🩺" },
  { id: "logistique", nom: "Transport & Logistique", emoji: "🚚" },
  { id: "commerce", nom: "Commerce & Vente", emoji: "🛍️" },
  { id: "energie", nom: "Énergie & Mines", emoji: "⚡" },
  { id: "education", nom: "Éducation & Formation", emoji: "🎓" },
  { id: "hotellerie", nom: "Hôtellerie & Tourisme", emoji: "🏨" },
  { id: "ong", nom: "ONG & Développement", emoji: "🤝" },
];

export const secteurNom = (id: string) => SECTEURS.find((s) => s.id === id)?.nom ?? id;
export const secteurEmoji = (id: string) => SECTEURS.find((s) => s.id === id)?.emoji ?? "💼";
