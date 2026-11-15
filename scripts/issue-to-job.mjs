// Convertit le corps d'une issue « Nouvelle offre » (formulaire GitHub)
// en fichier JSON dans src/data/offres/.
//
// Utilisé par .github/workflows/publier-offre.yml, mais aussi en local :
//   ISSUE_BODY="$(cat corps.md)" ISSUE_NUMBER=12 node scripts/issue-to-job.mjs
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";

const corps = (process.env.ISSUE_BODY ?? "").replace(/\r\n/g, "\n");
const numero = process.env.ISSUE_NUMBER ?? String(Date.now());
const creee = process.env.ISSUE_CREATED_AT ?? new Date().toISOString();

// Libellés du formulaire → clés
const LIBELLES = {
  "Intitulé du poste": "titre",
  Entreprise: "entreprise",
  Ville: "ville",
  Contrat: "contrat",
  Expérience: "niveau",
  "Mode de travail": "teletravail",
  Secteur: "secteur",
  "Salaire brut minimum (FCFA / mois)": "salaire_min",
  "Salaire brut maximum (FCFA / mois)": "salaire_max",
  "Résumé du poste": "resume",
  "Missions (une par ligne)": "missions",
  "Profil recherché (une ligne par critère)": "profil",
  "Compétences (séparées par des virgules)": "competences",
  "Avantages (un par ligne)": "avantages",
  "E-mail de candidature": "email",
  "Lien de candidature": "lien",
};

const champs = {};
for (const bloc of corps.split(/^###\s+/m).slice(1)) {
  const [ligne, ...reste] = bloc.split("\n");
  const cle = LIBELLES[ligne.trim()];
  const valeur = reste.join("\n").trim();
  if (cle && valeur && valeur !== "_No response_") champs[cle] = valeur;
}

const requis = ["titre", "entreprise", "ville", "contrat", "resume", "missions", "profil"];
const manquants = requis.filter((k) => !champs[k]);
if (manquants.length) {
  console.error(`Champs manquants : ${manquants.join(", ")}`);
  process.exit(1);
}

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/·/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const lignes = (s = "") => s.split("\n").map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
const choisir = (valeur, options, defaut) => options.find((o) => slugify(o) === slugify(valeur ?? "")) ?? defaut;
const montant = (s) => {
  const n = Number(String(s ?? "").replace(/[^\d]/g, ""));
  return n > 0 ? n : undefined;
};

const SECTEURS = {
  tech: "Tech & Digital", banque: "Banque & Finance", telecom: "Télécoms", btp: "BTP & Immobilier",
  agro: "Agro-industrie", sante: "Santé", logistique: "Transport & Logistique", commerce: "Commerce & Vente",
  energie: "Énergie & Mines", education: "Éducation & Formation", hotellerie: "Hôtellerie & Tourisme", ong: "ONG & Développement",
};
const secteur =
  Object.entries(SECTEURS).find(([id, nom]) => slugify(nom) === slugify(champs.secteur ?? "") || id === slugify(champs.secteur ?? ""))?.[0] ?? "commerce";

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email ?? "") ? champs.email : undefined;
const url = /^https:\/\/\S+$/.test(champs.lien ?? "") ? champs.lien : undefined;
if (!email && !url) {
  console.error("Il faut un e-mail ou un lien https:// de candidature valide.");
  process.exit(1);
}

const publiee = new Date();
const offre = {
  slug: `${slugify(champs.titre)}-${slugify(champs.entreprise)}-${numero}`.slice(0, 100),
  titre: champs.titre.slice(0, 120),
  entreprise: slugify(champs.entreprise),
  entrepriseNom: champs.entreprise.slice(0, 80),
  ville: champs.ville.slice(0, 60),
  contrat: choisir(champs.contrat, ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Intérim"], "CDI"),
  niveau: choisir(champs.niveau, ["Débutant", "Confirmé", "Senior", "Direction"], "Confirmé"),
  teletravail: choisir(champs.teletravail, ["Sur site", "Hybride", "Télétravail"], "Sur site"),
  secteur,
  salaireMin: montant(champs.salaire_min),
  salaireMax: montant(champs.salaire_max),
  publieeLe: publiee.toISOString(),
  expireLe: new Date(publiee.getTime() + 60 * 86400000).toISOString(),
  resume: champs.resume.slice(0, 600),
  missions: lignes(champs.missions),
  profil: lignes(champs.profil),
  avantages: lignes(champs.avantages),
  competences: (champs.competences ?? "").split(",").map((c) => c.trim()).filter(Boolean),
  candidature: { email, url },
  source: { issue: Number(numero), creeeLe: creee },
};

mkdirSync("src/data/offres", { recursive: true });
const fichier = `src/data/offres/${offre.slug}.json`;
writeFileSync(fichier, JSON.stringify(offre, null, 2) + "\n");
console.log(`✓ ${fichier}`);

if (process.env.GITHUB_OUTPUT) {
  const titreSur = offre.titre.replace(/[\r\n]/g, " ");
  appendFileSync(process.env.GITHUB_OUTPUT, `slug=${offre.slug}\ntitre=${titreSur}\n`);
}
