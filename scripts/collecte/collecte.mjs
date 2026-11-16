// Robot de collecte IA des offres d'emploi camerounaises.
//
// Lancé toutes les 6 heures par .github/workflows/collecte.yml. Pour chaque source active
// (collection Firestore « sources », conditions d'utilisation vérifiées) :
//   1. lit la page de liste (ou le flux RSS) en respectant robots.txt ;
//   2. demande à l'IA d'y repérer les annonces ;
//   3. ouvre chaque nouvelle annonce et demande à l'IA d'en tirer une fiche reformulée
//      (missions, profil, compétences, lien de candidature) ;
//   4. enregistre la fiche dans « offres » (à valider, ou publiée si la source l'autorise).
//
// Variables : FIREBASE_SERVICE_ACCOUNT (JSON), ANTHROPIC_API_KEY,
//             COLLECTE_MODELE (défaut claude-haiku-5-5), DRY_RUN=1 (aucune écriture),
//             SOURCES_FICHIER=chemin.json (sources locales, pour tester sans Firestore).
import { readFileSync } from "node:fs";
import { UA, extraireJson, htmlVersTexte, idOffre, lireFlux, normaliserOffre, robotsAutorise, SECTEURS } from "./outils.mjs";

const DRY = process.env.DRY_RUN === "1";
const MODELE = process.env.COLLECTE_MODELE || "claude-haiku-5-5";
const CLE_IA = process.env.ANTHROPIC_API_KEY;
const PAUSE_MS = process.env.NODE_ENV === "test" ? 10 : 2500;
const URL_IA = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
const MAX_TEXTE = 60000;

// ------------------------------------------------------------------ Firestore
let db = null;
async function initFirestore() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return null;
  const { initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  return getFirestore();
}

// ------------------------------------------------------------------ réseau poli
const derniereVisite = new Map();
const robotsCache = new Map();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function telecharger(url, { accepter = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5" } = {}) {
  const u = new URL(url);
  const attente = (derniereVisite.get(u.host) ?? 0) + PAUSE_MS - Date.now();
  if (attente > 0) await pause(attente);
  derniereVisite.set(u.host, Date.now());
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), 20000);
  try {
    const rep = await fetch(url, { headers: { "User-Agent": UA, Accept: accepter, "Accept-Language": "fr,en;q=0.7" }, signal: ctrl.signal, redirect: "follow" });
    if (!rep.ok) throw new Error(`HTTP ${rep.status} sur ${url}`);
    const texte = await rep.text();
    return texte.slice(0, 2_000_000);
  } finally {
    clearTimeout(minuteur);
  }
}

async function autorise(url) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    let robots = "";
    try {
      robots = await telecharger(`${u.origin}/robots.txt`, { accepter: "text/plain" });
    } catch {
      robots = ""; // pas de robots.txt : pas de restriction déclarée
    }
    robotsCache.set(u.origin, robots);
  }
  return robotsAutorise(robotsCache.get(u.origin), u.pathname + u.search);
}

// ------------------------------------------------------------------ IA
async function demanderIA(systeme, contenu, maxTokens = 2500) {
  if (!CLE_IA) throw new Error("ANTHROPIC_API_KEY manquante");
  for (let essai = 1; essai <= 3; essai++) {
    const rep = await fetch(`${URL_IA}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": CLE_IA, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODELE, max_tokens: maxTokens, temperature: 0, system: systeme, messages: [{ role: "user", content: contenu }] }),
    });
    if (rep.status === 429 || rep.status >= 500) {
      await pause(4000 * essai);
      continue;
    }
    const json = await rep.json();
    if (!rep.ok) throw new Error(`IA : ${json?.error?.message ?? rep.status}`);
    return json.content.map((c) => c.text ?? "").join("");
  }
  throw new Error("IA indisponible après 3 essais");
}

const PROMPT_LISTE = `Tu aides un job board camerounais. On te donne le texte d'une page web (liens au format [texte](url)).
Repère uniquement les annonces d'offres d'emploi, de stage ou de mission individuelles qui y figurent.
Réponds UNIQUEMENT par un tableau JSON : [{"titre": "...", "lien": "url absolue de l'annonce"}].
Ignore les liens de navigation, de catégories, de connexion, les articles et les publicités. Tableau vide si aucune offre.`;

const PROMPT_FICHE = `Tu rédiges des fiches d'offres d'emploi pour Workers, job board camerounais.
On te donne le texte d'une annonce publiée sur un autre site. Produis une fiche UNIQUEMENT à partir des informations présentes.
Règles :
- Reformule entièrement avec tes propres mots, en français clair : ne recopie jamais de phrases de l'annonce.
- N'invente rien : si une information manque, mets null ou une liste vide.
- Si ce n'est pas une offre d'emploi, si le poste n'est pas au Cameroun (ou en télétravail ouvert au Cameroun), ou si l'annonce demande de l'argent aux candidats, réponds {"ignorer": true, "raison": "..."}.
Réponds UNIQUEMENT par un objet JSON :
{
 "titre": "intitulé du poste",
 "entreprise": "nom de l'employeur ou null",
 "ville": "ville au Cameroun",
 "contrat": "CDI|CDD|Stage|Alternance|Freelance|Intérim",
 "niveau": "Débutant|Confirmé|Senior|Direction",
 "teletravail": "Sur site|Hybride|Télétravail",
 "secteur": "${SECTEURS.join("|")}",
 "resume": "2 phrases qui présentent le poste",
 "missions": ["3 à 6 missions principales, reformulées"],
 "profil": ["3 à 6 critères du profil recherché"],
 "competences": ["jusqu'à 8 compétences clés, 1 à 3 mots chacune"],
 "avantages": ["avantages mentionnés"],
 "salaire_min": nombre en FCFA par mois ou null,
 "salaire_max": nombre en FCFA par mois ou null,
 "date_publication": "AAAA-MM-JJ ou null",
 "date_limite": "AAAA-MM-JJ ou null",
 "lien_candidature": "url absolue du formulaire ou de la page de candidature si elle figure dans le texte, sinon null",
 "email_candidature": "adresse e-mail de candidature si indiquée, sinon null"
}`;

// ------------------------------------------------------------------ collecte d'une source
async function annoncesDeLaSource(source) {
  if (!(await autorise(source.url))) throw new Error("robots.txt interdit cette page");
  const brut = await telecharger(source.url);
  if (source.type === "rss") return lireFlux(brut).map((i) => ({ titre: i.titre, lien: i.lien }));
  const texte = htmlVersTexte(brut, source.url).slice(0, MAX_TEXTE);
  const reponse = await demanderIA(PROMPT_LISTE, `Page : ${source.url}\n\n${texte}`, 3000);
  const liste = extraireJson(reponse);
  return (Array.isArray(liste) ? liste : []).filter((a) => a && typeof a.lien === "string" && /^https?:\/\//.test(a.lien));
}

async function existe(id) {
  if (!db) return false;
  return (await db.doc(`offres/${id}`).get()).exists;
}

async function collecterSource(source) {
  const bilan = { nom: source.nom, trouvees: 0, ajoutees: 0, ignorees: 0, erreur: null };
  const annonces = await annoncesDeLaSource(source);
  bilan.trouvees = annonces.length;
  const vues = new Set();
  let analysees = 0;
  for (const a of annonces) {
    if (analysees >= (source.maxOffres ?? 15)) break;
    const id = idOffre(a.lien);
    if (vues.has(id) || (await existe(id))) continue;
    vues.add(id);
    try {
      if (!(await autorise(a.lien))) { bilan.ignorees++; continue; }
      analysees++;
      const page = htmlVersTexte(await telecharger(a.lien), a.lien).slice(0, MAX_TEXTE);
      const fiche = normaliserOffre(extraireJson(await demanderIA(PROMPT_FICHE, `Annonce : ${a.lien}\n\n${page}`)), { source, lienAnnonce: a.lien });
      if (!fiche) { bilan.ignorees++; continue; }
      const doc = { ...fiche, statut: source.publicationAuto ? "publiee" : "en_attente", creeLe: new Date().toISOString(), majLe: new Date().toISOString() };
      if (DRY || !db) console.log(JSON.stringify(doc, null, 2));
      else await db.doc(`offres/${id}`).create(doc);
      bilan.ajoutees++;
      console.log(`  + ${fiche.titre} — ${fiche.entrepriseNom} (${fiche.ville})`);
    } catch (e) {
      bilan.ignorees++;
      console.warn(`  ! ${a.lien} : ${e.message}`);
    }
  }
  return bilan;
}

// ------------------------------------------------------------------ expiration
async function expirerOffresCollectees() {
  if (!db || DRY) return 0;
  const maintenant = new Date().toISOString();
  const snap = await db.collection("offres").where("origine", "==", "collecte").where("statut", "in", ["publiee", "en_attente"]).get();
  const lot = db.batch();
  let n = 0;
  snap.docs.forEach((d) => {
    if (d.get("expireLe") && d.get("expireLe") < maintenant) {
      lot.update(d.ref, { statut: "expiree", majLe: maintenant });
      n++;
    }
  });
  if (n) await lot.commit();
  return n;
}

// ------------------------------------------------------------------ programme principal
async function main() {
  db = await initFirestore();
  const debut = new Date().toISOString();
  let sources;
  if (process.env.SOURCES_FICHIER) sources = JSON.parse(readFileSync(process.env.SOURCES_FICHIER, "utf8"));
  else if (db) sources = (await db.collection("sources").where("actif", "==", true).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
  else throw new Error("Ni FIREBASE_SERVICE_ACCOUNT ni SOURCES_FICHIER : rien à collecter.");

  const protocole = process.env.NODE_ENV === "test" ? /^https?:\/\// : /^https:\/\//;
  sources = sources.filter((s) => s.actif && s.conditionsVerifiees && protocole.test(s.url ?? ""));
  console.log(`${sources.length} source(s) active(s) · modèle ${MODELE}${DRY ? " · essai à blanc" : ""}`);

  const bilans = [];
  for (const s of sources) {
    console.log(`→ ${s.nom} (${s.url})`);
    let bilan;
    try {
      bilan = await collecterSource(s);
    } catch (e) {
      bilan = { nom: s.nom, trouvees: 0, ajoutees: 0, ignorees: 0, erreur: e.message.slice(0, 200) };
      console.warn(`  ✗ ${e.message}`);
    }
    bilans.push(bilan);
    if (db && !DRY && s.id) {
      await db.doc(`sources/${s.id}`).update({ derniereCollecte: new Date().toISOString(), dernierResultat: { trouvees: bilan.trouvees, ajoutees: bilan.ajoutees, erreur: bilan.erreur } });
    }
  }

  const expirees = await expirerOffresCollectees();
  const resume = {
    debut,
    fin: new Date().toISOString(),
    declencheur: process.env.GITHUB_EVENT_NAME === "workflow_dispatch" ? "manuel" : "planifié",
    sources: bilans,
    ajoutees: bilans.reduce((n, b) => n + b.ajoutees, 0),
    erreurs: bilans.filter((b) => b.erreur).length,
    expirees,
  };
  if (db && !DRY) await db.collection("collectes").add(resume);
  console.log(`Terminé : ${resume.ajoutees} offre(s) ajoutée(s), ${resume.erreurs} source(s) en erreur, ${expirees} expirée(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
