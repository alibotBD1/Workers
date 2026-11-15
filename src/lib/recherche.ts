import type { Offre } from "@/data/types";
import type { Profil } from "./store";
import { regionDe } from "@/data/taxonomie";

export interface Filtres {
  q: string;
  ville: string;
  contrats: string[];
  secteurs: string[];
  niveaux: string[];
  teletravail: string[];
  salaireMin: number;
  depuis: number; // jours, 0 = peu importe
  tri: "pertinence" | "recent" | "salaire" | "compatibilite";
}

export const FILTRES_VIDES: Filtres = {
  q: "",
  ville: "",
  contrats: [],
  secteurs: [],
  niveaux: [],
  teletravail: [],
  salaireMin: 0,
  depuis: 0,
  tri: "pertinence",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Score textuel simple : titre > compétences > entreprise > description. */
function scoreTexte(o: Offre, q: string): number {
  const termes = norm(q).split(/\s+/).filter((t) => t.length > 1);
  if (!termes.length) return 1;
  const titre = norm(o.titre);
  const comp = norm(o.competences.join(" "));
  const ent = norm(o.entrepriseNom);
  const corps = norm([o.resume, ...o.missions, ...o.profil].join(" "));
  let total = 0;
  for (const t of termes) {
    let s = 0;
    if (titre.includes(t)) s += 10;
    if (comp.includes(t)) s += 6;
    if (ent.includes(t)) s += 5;
    if (corps.includes(t)) s += 2;
    if (!s) return 0; // tous les termes doivent être trouvés
    total += s;
  }
  return total;
}

export function rechercher(offres: Offre[], f: Filtres, profil: Profil | null): { offre: Offre; score: number; compat: number | null }[] {
  const limite = f.depuis ? Date.now() - f.depuis * 86400000 : 0;
  const villeN = norm(f.ville);
  const res = [];
  for (const o of offres) {
    if (f.ville) {
      const ok = norm(o.ville) === villeN || norm(regionDe(o.ville) ?? "") === villeN || (villeN === "teletravail" && o.teletravail === "Télétravail");
      if (!ok) continue;
    }
    if (f.contrats.length && !f.contrats.includes(o.contrat)) continue;
    if (f.secteurs.length && !f.secteurs.includes(o.secteur)) continue;
    if (f.niveaux.length && !f.niveaux.includes(o.niveau)) continue;
    if (f.teletravail.length && !f.teletravail.includes(o.teletravail)) continue;
    if (f.salaireMin && (o.salaireMax ?? o.salaireMin ?? 0) < f.salaireMin) continue;
    if (limite && new Date(o.publieeLe).getTime() < limite) continue;
    const score = scoreTexte(o, f.q);
    if (!score) continue;
    res.push({ offre: o, score, compat: profil ? compatibilite(o, profil) : null });
  }
  const parDate = (a: Offre, b: Offre) => b.publieeLe.localeCompare(a.publieeLe);
  switch (f.tri) {
    case "recent":
      res.sort((a, b) => parDate(a.offre, b.offre));
      break;
    case "salaire":
      res.sort((a, b) => (b.offre.salaireMax ?? 0) - (a.offre.salaireMax ?? 0));
      break;
    case "compatibilite":
      res.sort((a, b) => (b.compat ?? 0) - (a.compat ?? 0) || parDate(a.offre, b.offre));
      break;
    default:
      res.sort((a, b) => b.score - a.score || (b.offre.urgent ? 1 : 0) - (a.offre.urgent ? 1 : 0) || parDate(a.offre, b.offre));
  }
  return res;
}

/**
 * Score de compatibilité 0–100 entre une offre et le profil du candidat.
 * Calculé localement, sans IA ni serveur : compétences (50), métier (20),
 * localisation (15), contrat (10), secteur (5).
 */
export function compatibilite(o: Offre, p: Profil): number {
  let s = 0;
  const comps = p.competences.map(norm);
  if (comps.length && o.competences.length) {
    const communes = o.competences.filter((c) => comps.some((x) => norm(c).includes(x) || x.includes(norm(c)))).length;
    s += Math.round((communes / o.competences.length) * 50);
  }
  if (p.metier) {
    const mots = norm(p.metier).split(/\s+/).filter((m) => m.length > 2);
    const titre = norm(o.titre);
    const trouves = mots.filter((m) => titre.includes(m)).length;
    if (mots.length) s += Math.round((trouves / mots.length) * 20);
  }
  if (p.ville) {
    if (norm(p.ville) === norm(o.ville) || o.teletravail === "Télétravail") s += 15;
    else if (regionDe(p.ville) && regionDe(p.ville) === regionDe(o.ville)) s += 8;
  }
  if (!p.contrats.length || p.contrats.includes(o.contrat)) s += 10;
  if (!p.secteurs.length || p.secteurs.includes(o.secteur)) s += 5;
  return Math.min(100, s);
}

/** Lecture / écriture des filtres dans l'URL (?q=...&ville=...). */
export function filtresDepuisUrl(sp: URLSearchParams): Filtres {
  const liste = (k: string) => (sp.get(k) ? sp.get(k)!.split(",").filter(Boolean) : []);
  return {
    q: sp.get("q") ?? "",
    ville: sp.get("ville") ?? "",
    contrats: liste("contrat"),
    secteurs: liste("secteur"),
    niveaux: liste("niveau"),
    teletravail: liste("teletravail"),
    salaireMin: Number(sp.get("salaire") ?? 0) || 0,
    depuis: Number(sp.get("depuis") ?? 0) || 0,
    tri: (sp.get("tri") as Filtres["tri"]) || "pertinence",
  };
}

export function filtresVersUrl(f: Filtres): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.ville) sp.set("ville", f.ville);
  if (f.contrats.length) sp.set("contrat", f.contrats.join(","));
  if (f.secteurs.length) sp.set("secteur", f.secteurs.join(","));
  if (f.niveaux.length) sp.set("niveau", f.niveaux.join(","));
  if (f.teletravail.length) sp.set("teletravail", f.teletravail.join(","));
  if (f.salaireMin) sp.set("salaire", String(f.salaireMin));
  if (f.depuis) sp.set("depuis", String(f.depuis));
  if (f.tri !== "pertinence") sp.set("tri", f.tri);
  return sp;
}
