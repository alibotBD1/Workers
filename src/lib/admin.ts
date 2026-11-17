// Opérations du back office. Toutes sont protégées par les règles Firestore :
// seul un utilisateur présent dans la collection « admins » peut les exécuter.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { signInWithCustomToken } from "firebase/auth";
import { auth, db, obtenirFonctions } from "./firebase";
import type { Utilisateur } from "./auth";
import type { Offre } from "@/data/types";

const col = (nom: string) => collection(db!, nom);
const lignes = <T,>(snap: Awaited<ReturnType<typeof getDocs>>) => snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);

// ------------------------------------------------------------- journal d'audit

export interface EntreeJournal { id: string; action: string; acteurUid: string; acteurEmail: string; cible?: string; details?: string; date: string }

export async function journaliser(action: string, cible?: string, details?: string) {
  const u = auth!.currentUser;
  await addDoc(col("journal"), { action, acteurUid: u?.uid ?? "", acteurEmail: u?.email ?? "", cible: cible ?? null, details: details ?? null, date: new Date().toISOString(), horodatage: serverTimestamp() });
}

export async function lireJournal(n = 200) {
  return lignes<EntreeJournal>(await getDocs(query(col("journal"), orderBy("date", "desc"), limit(n))));
}

// ------------------------------------------------------------- tableau de bord

const compter = async (nom: string, ...c: QueryConstraint[]) => (await getCountFromServer(query(col(nom), ...c))).data().count;

export async function indicateurs() {
  const il30j = new Date(Date.now() - 30 * 86400000).toISOString();
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [candidats, recruteurs, marketing, offresEnLigne, aValider, collectees, cands30, paiementsMois] = await Promise.all([
    compter("utilisateurs", where("role", "==", "candidat")),
    compter("utilisateurs", where("role", "==", "recruteur")),
    compter("utilisateurs", where("consentements.marketing", "==", true)),
    compter("offres", where("statut", "==", "publiee")),
    compter("offres", where("statut", "==", "en_attente")),
    compter("offres", where("origine", "==", "collecte")),
    compter("candidatures", where("creeLe", ">=", il30j)),
    getDocs(query(col("paiements"), where("date", ">=", debutMois))),
  ]);
  const caMois = paiementsMois.docs.map((d) => d.data()).filter((p) => p.statut === "payé").reduce((s, p) => s + (Number(p.montant) || 0), 0);
  return { candidats, recruteurs, marketing, offresEnLigne, aValider, collectees, cands30, caMois };
}

/** Inscriptions par jour sur les N derniers jours (lecture des dates de création). */
export async function inscriptionsParJour(jours = 30) {
  const depuis = new Date(Date.now() - jours * 86400000);
  const snap = await getDocs(query(col("utilisateurs"), where("creeLe", ">=", depuis), orderBy("creeLe", "asc"), limit(5000)));
  const parJour: Record<string, { candidat: number; recruteur: number }> = {};
  for (let i = jours - 1; i >= 0; i--) parJour[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = { candidat: 0, recruteur: 0 };
  const sources: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const u = d.data();
    const date = (u.creeLe?.toDate?.() as Date | undefined)?.toISOString().slice(0, 10);
    if (date && parJour[date]) parJour[date][u.role as "candidat" | "recruteur"]++;
    const src = u.origine?.utm_source ?? (u.origine?.referent ? new URL(u.origine.referent).hostname : "direct");
    sources[src] = (sources[src] ?? 0) + 1;
  });
  return { parJour, sources };
}

// ------------------------------------------------------------- utilisateurs

export async function listerUtilisateurs(filtres: { role?: string; ville?: string; marketing?: boolean }, n = 300) {
  const c: QueryConstraint[] = [];
  if (filtres.role) c.push(where("role", "==", filtres.role));
  if (filtres.ville) c.push(where("ville", "==", filtres.ville));
  if (filtres.marketing) c.push(where("consentements.marketing", "==", true));
  c.push(orderBy("creeLe", "desc"), limit(n));
  return lignes<Utilisateur & { id: string }>(await getDocs(query(col("utilisateurs"), ...c))).map((u) => ({ ...u, uid: u.id }));
}

export async function changerInsight(u: Utilisateur, actif: boolean) {
  await updateDoc(doc(db!, "utilisateurs", u.uid), { insight: actif });
  await journaliser(actif ? "Module Insight activé" : "Module Insight désactivé", u.entreprise ?? u.email);
}

export async function changerStatutUtilisateur(u: Utilisateur, statut: "actif" | "suspendu") {
  await updateDoc(doc(db!, "utilisateurs", u.uid), { statut });
  await journaliser(statut === "suspendu" ? "Compte suspendu" : "Compte réactivé", u.email);
}

/** « Se connecter en tant que » : la Cloud Function vérifie le rôle admin, journalise et renvoie un jeton. */
export async function seConnecterEnTantQue(u: Utilisateur) {
  const { httpsCallable } = await import("firebase/functions");
  const appel = httpsCallable<{ uid: string }, { jeton: string }>(await obtenirFonctions(), "connecterEnTantQue");
  const { data } = await appel({ uid: u.uid });
  await signInWithCustomToken(auth!, data.jeton);
}

export function exporterCsv(nom: string, lignesCsv: Record<string, unknown>[]) {
  if (!lignesCsv.length) return;
  const cols = Object.keys(lignesCsv[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + [cols.join(";"), ...lignesCsv.map((l) => cols.map((c) => esc(l[c])).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = nom;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ------------------------------------------------------------- offres

export type OffreAdmin = Offre & { id: string; creeLe?: string };

export async function listerOffres(statut?: string, origine?: string) {
  const c: QueryConstraint[] = [];
  if (statut) c.push(where("statut", "==", statut));
  if (origine) c.push(where("origine", "==", origine));
  c.push(orderBy("publieeLe", "desc"), limit(300));
  return lignes<OffreAdmin>(await getDocs(query(col("offres"), ...c)));
}

export async function modererOffre(o: OffreAdmin, statut: "publiee" | "refusee" | "expiree", motif?: string) {
  await updateDoc(doc(db!, "offres", o.id), {
    statut,
    motifRefus: statut === "refusee" ? motif ?? "" : null,
    ...(statut === "publiee" ? { publieeLe: new Date().toISOString() } : {}),
    majLe: new Date().toISOString(),
  });
  await journaliser(statut === "publiee" ? "Offre publiée" : statut === "refusee" ? "Offre refusée" : "Offre clôturée", o.titre, motif);
}

export async function majOffre(id: string, champs: Partial<Offre>) {
  await updateDoc(doc(db!, "offres", id), { ...champs, majLe: new Date().toISOString() });
  await journaliser("Offre modifiée", champs.titre ?? id);
}

export async function supprimerOffre(o: OffreAdmin) {
  await deleteDoc(doc(db!, "offres", o.id));
  await journaliser("Offre supprimée", o.titre);
}

// ------------------------------------------------------------- sources de collecte

export interface Source {
  id: string; nom: string; url: string; type: "page" | "rss"; actif: boolean; conditionsVerifiees: boolean; publicationAuto: boolean;
  maxOffres: number; note?: string; derniereCollecte?: string; dernierResultat?: { trouvees: number; ajoutees: number; erreur?: string | null };
}

export const listerSources = async () => lignes<Source>(await getDocs(query(col("sources"), orderBy("nom"))));

export async function enregistrerSource(s: Omit<Source, "id"> & { id?: string }) {
  const { id, ...donnees } = s;
  if (id) await setDoc(doc(db!, "sources", id), donnees, { merge: true });
  else await addDoc(col("sources"), donnees);
  await journaliser(id ? "Source modifiée" : "Source ajoutée", s.nom, s.url);
}

export async function supprimerSource(s: Source) {
  await deleteDoc(doc(db!, "sources", s.id));
  await journaliser("Source supprimée", s.nom);
}

export interface Collecte { id: string; debut: string; fin?: string; sources: { nom: string; trouvees: number; ajoutees: number; erreur?: string | null }[]; ajoutees: number; erreurs: number; declencheur?: string }
export const listerCollectes = async () => lignes<Collecte>(await getDocs(query(col("collectes"), orderBy("debut", "desc"), limit(30))));

// ------------------------------------------------------------- revenus

export const FORMULES = ["Visibilité", "Entreprise", "Pack offres", "Autre"] as const;
export const MOYENS = ["MTN Mobile Money", "Orange Money", "Virement", "Chèque", "Espèces", "Carte"] as const;

export interface Paiement {
  id: string; entreprise: string; recruteurId?: string | null; formule: string; montant: number; moyen: string; reference: string;
  date: string; statut: "payé" | "en attente" | "remboursé"; note?: string; saisiPar?: string;
}

export const listerPaiements = async () => lignes<Paiement>(await getDocs(query(col("paiements"), orderBy("date", "desc"), limit(1000))));

export async function enregistrerPaiement(p: Omit<Paiement, "id"> & { id?: string }) {
  const { id, ...donnees } = p;
  const complet = { ...donnees, saisiPar: auth!.currentUser?.email ?? "", majLe: new Date().toISOString() };
  if (id) await setDoc(doc(db!, "paiements", id), complet, { merge: true });
  else await addDoc(col("paiements"), complet);
  await journaliser(id ? "Paiement modifié" : "Paiement enregistré", p.entreprise, `${p.montant} FCFA · ${p.formule} · ${p.statut}`);
}

export async function supprimerPaiement(p: Paiement) {
  await deleteDoc(doc(db!, "paiements", p.id));
  await journaliser("Paiement supprimé", p.entreprise, `${p.montant} FCFA`);
}
