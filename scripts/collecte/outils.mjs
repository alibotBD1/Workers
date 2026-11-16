// Fonctions pures du robot de collecte (testées dans outils.test.mjs).
import { createHash } from "node:crypto";

export const UA = "WorkersBot/1.0 (+https://workers-melanyne.com/robot; recrutement@workers-melanyne.com)";

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", eacute: "é", egrave: "è", ecirc: "ê", agrave: "à", acirc: "â", ccedil: "ç", ocirc: "ô", ucirc: "û", icirc: "î", euml: "ë", iuml: "ï", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…", ndash: "–", mdash: "—", laquo: "«", raquo: "»" };
export const decoder = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n.toLowerCase()] ?? m);

/** HTML → texte lisible, liens conservés au format [texte](url absolue). */
export function htmlVersTexte(html, base) {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|iframe|template|head)[\s\S]*?<\/\1>/gi, " ");
  s = s.replace(/<a\b[^>]*href\s*=\s*["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = txt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return " ";
    try {
      const abs = new URL(decoder(href), base);
      if (!/^https?:$/.test(abs.protocol)) return t;
      return `[${t}](${abs.href})`;
    } catch {
      return t;
    }
  });
  s = s
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article|header|footer|ul|ol|table|dd|dt)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ");
  return decoder(s)
    .replace(/[ \t\f\v\r]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Lecture minimale de robots.txt : groupes « * » et « WorkersBot », règles Disallow/Allow (préfixe le plus long). */
export function robotsAutorise(robots, chemin, agent = "WorkersBot") {
  if (!robots) return true;
  const groupes = [];
  let courant = null;
  let dernierEtaitAgent = false;
  for (const brut of robots.split(/\r?\n/)) {
    const ligne = brut.replace(/#.*/, "").trim();
    if (!ligne) continue;
    const [cle, ...reste] = ligne.split(":");
    const k = cle.trim().toLowerCase();
    const v = reste.join(":").trim();
    if (k === "user-agent") {
      if (!dernierEtaitAgent) groupes.push((courant = { agents: [], regles: [] }));
      courant.agents.push(v.toLowerCase());
      dernierEtaitAgent = true;
    } else {
      dernierEtaitAgent = false;
      if (courant && (k === "disallow" || k === "allow")) courant.regles.push({ type: k, chemin: v });
    }
  }
  const a = agent.toLowerCase();
  const groupe = groupes.find((g) => g.agents.some((x) => x !== "*" && a.includes(x))) ?? groupes.find((g) => g.agents.includes("*"));
  if (!groupe) return true;
  let meilleur = null;
  for (const r of groupe.regles) {
    if (r.type === "disallow" && r.chemin === "") continue;
    const motif = r.chemin.replace(/\*/g, ".*").replace(/\$$/, "$");
    if (new RegExp("^" + motif.replace(/[?]/g, "\\?")).test(chemin)) {
      if (!meilleur || r.chemin.length > meilleur.chemin.length || (r.chemin.length === meilleur.chemin.length && r.type === "allow")) meilleur = r;
    }
  }
  return !meilleur || meilleur.type === "allow";
}

/** Flux RSS 2.0 ou Atom → [{ titre, lien, resume, date }] */
export function lireFlux(xml) {
  const items = [];
  const blocs = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const champ = (b, tag) => {
    const m = b.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return m ? decoder(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() : "";
  };
  for (const b of blocs) {
    const lienAtom = b.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1];
    items.push({ titre: champ(b, "title"), lien: champ(b, "link") || lienAtom || "", resume: champ(b, "description") || champ(b, "summary") || champ(b, "content"), date: champ(b, "pubDate") || champ(b, "updated") || champ(b, "published") });
  }
  return items.filter((i) => i.titre && /^https?:\/\//.test(i.lien));
}

/** Extrait le premier objet ou tableau JSON d'une réponse de l'IA. */
export function extraireJson(texte) {
  const bloc = texte.match(/```(?:json)?\s*([\s\S]*?)```/);
  const brut = (bloc ? bloc[1] : texte).trim();
  const debut = brut.search(/[[{]/);
  if (debut < 0) throw new Error("Aucun JSON dans la réponse de l'IA");
  const ouvrant = brut[debut];
  const fermant = ouvrant === "[" ? "]" : "}";
  const fin = brut.lastIndexOf(fermant);
  return JSON.parse(brut.slice(debut, fin + 1));
}

export const slugify = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/·/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const idOffre = (lien) => "c_" + createHash("sha1").update(lien.replace(/[?#].*$/, "").replace(/\/$/, "")).digest("hex").slice(0, 20);

const CONTRATS = ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Intérim"];
const NIVEAUX = ["Débutant", "Confirmé", "Senior", "Direction"];
const TELETRAVAIL = ["Sur site", "Hybride", "Télétravail"];
export const SECTEURS = ["tech", "banque", "telecom", "btp", "agro", "sante", "logistique", "commerce", "energie", "education", "hotellerie", "ong"];
const choisir = (v, liste, defaut) => liste.find((x) => slugify(x) === slugify(v ?? "")) ?? defaut;
const texteCourt = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const liste = (v, n, max = 220) => (Array.isArray(v) ? v.map((x) => texteCourt(x, max)).filter(Boolean).slice(0, n) : []);
const montant = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return n >= 20000 && n <= 50000000 ? n : undefined;
};
const dateIso = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined;
};

/** Valide et normalise l'offre renvoyée par l'IA. Renvoie null si elle est inutilisable. */
export function normaliserOffre(brut, { source, lienAnnonce, maintenant = new Date() }) {
  if (!brut || brut.ignorer) return null;
  const titre = texteCourt(brut.titre, 120);
  const entrepriseNom = texteCourt(brut.entreprise, 80) || source.nom;
  const resume = texteCourt(brut.resume, 600);
  const missions = liste(brut.missions, 8);
  if (!titre || !resume || missions.length < 2) return null;
  const urlCandidature = typeof brut.lien_candidature === "string" && /^https?:\/\//.test(brut.lien_candidature) ? brut.lien_candidature : lienAnnonce;
  const email = typeof brut.email_candidature === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brut.email_candidature) ? brut.email_candidature : undefined;
  const publiee = dateIso(brut.date_publication);
  const limite = dateIso(brut.date_limite);
  const publieeLe = publiee && new Date(publiee) <= maintenant ? publiee : maintenant.toISOString();
  const expireLe = limite && new Date(limite) > maintenant ? limite : new Date(maintenant.getTime() + 30 * 86400000).toISOString();
  const min = montant(brut.salaire_min);
  const max = montant(brut.salaire_max);
  return {
    slug: `${slugify(titre)}-${slugify(entrepriseNom)}-${idOffre(lienAnnonce).slice(2, 8)}`.slice(0, 100),
    titre,
    entreprise: slugify(entrepriseNom),
    entrepriseNom,
    ville: texteCourt(brut.ville, 60) || "Cameroun",
    contrat: choisir(brut.contrat, CONTRATS, "CDI"),
    niveau: choisir(brut.niveau, NIVEAUX, "Confirmé"),
    teletravail: choisir(brut.teletravail, TELETRAVAIL, "Sur site"),
    secteur: SECTEURS.includes(brut.secteur) ? brut.secteur : "commerce",
    ...(min ? { salaireMin: min } : {}),
    ...(max && (!min || max >= min) ? { salaireMax: max } : {}),
    publieeLe,
    expireLe,
    resume,
    missions,
    profil: liste(brut.profil, 8),
    avantages: liste(brut.avantages, 6),
    competences: liste(brut.competences, 8, 40),
    candidature: { url: urlCandidature, ...(email ? { email } : {}) },
    origine: "collecte",
    source: { nom: source.nom, url: source.url, lienAnnonce, collecteeLe: maintenant.toISOString() },
  };
}
