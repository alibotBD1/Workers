// Cloud Functions de Workers.
// Déploiement : npx firebase deploy --only functions --project production
// (nécessite la formule Blaze de Firebase).
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { analyserCv, blocCv, MODELE_PAR_DEFAUT } from "./insight.js";

initializeApp();
const db = getFirestore();

// Clé API Claude, stockée dans Secret Manager :
//   npx firebase functions:secrets:set ANTHROPIC_API_KEY --project production
const CLE_IA = defineSecret("ANTHROPIC_API_KEY");
const MODELE = process.env.INSIGHT_MODELE || MODELE_PAR_DEFAUT;
const LIMITE_JOUR = Number(process.env.INSIGHT_LIMITE_JOUR || 300);
// Les déclencheurs Firestore doivent tourner dans la région de la base
const REGION_BASE = process.env.REGION_BASE || "africa-south1";

/**
 * « Se connecter en tant que » (support client).
 * Vérifie que l'appelant est administrateur, refuse de cibler un autre admin,
 * journalise l'action, puis renvoie un jeton de connexion d'une heure marqué « ouvertPar ».
 * Une session ainsi ouverte ne donne jamais les droits d'administration (voir firestore.rules).
 */
export const connecterEnTantQue = onCall({ region: "europe-west1" }, async (req) => {
  const appelant = req.auth;
  if (!appelant || appelant.token.ouvertPar) throw new HttpsError("unauthenticated", "Connexion administrateur requise.");
  const estAdmin = (await db.doc(`admins/${appelant.uid}`).get()).exists;
  if (!estAdmin) throw new HttpsError("permission-denied", "Réservé aux administrateurs.");

  const uid = String(req.data?.uid ?? "");
  if (!uid) throw new HttpsError("invalid-argument", "Utilisateur manquant.");
  if ((await db.doc(`admins/${uid}`).get()).exists) throw new HttpsError("permission-denied", "Impossible de se connecter en tant qu'un autre administrateur.");
  const cible = await db.doc(`utilisateurs/${uid}`).get();
  if (!cible.exists) throw new HttpsError("not-found", "Utilisateur introuvable.");

  await db.collection("journal").add({
    action: "Connexion en tant que",
    acteurUid: appelant.uid,
    acteurEmail: appelant.token.email ?? "",
    cible: cible.get("email") ?? uid,
    details: `${cible.get("prenom") ?? ""} ${cible.get("nom") ?? ""} (${cible.get("role")})`.trim(),
    date: new Date().toISOString(),
    horodatage: FieldValue.serverTimestamp(),
  });

  const jeton = await getAuth().createCustomToken(uid, { ouvertPar: appelant.uid });
  return { jeton };
});

// =====================================================================
// Module Insight — analyse IA des CV
// =====================================================================

async function recruteurAInsight(recruteurId) {
  if (!recruteurId) return false;
  const r = await db.doc(`utilisateurs/${recruteurId}`).get();
  return r.exists && r.get("role") === "recruteur" && r.get("insight") === true && r.get("statut") === "actif";
}

async function quotaAtteint(recruteurId) {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  const n = (await db.collection("analyses").where("recruteurId", "==", recruteurId).where("analyseeLe", ">=", debut.toISOString()).count().get()).data().count;
  return n >= LIMITE_JOUR;
}

async function offreDeLaCandidature(c) {
  if (c.offreId) {
    const d = await db.doc(`offres/${c.offreId}`).get();
    if (d.exists) return d.data();
  }
  const q = await db.collection("offres").where("slug", "==", c.offreSlug).limit(1).get();
  return q.empty ? null : q.docs[0].data();
}

/** Télécharge le CV et prépare le bloc de contenu pour l'IA. */
async function preparerCv(chemin) {
  const fichier = getStorage().bucket().file(chemin);
  const [meta] = await fichier.getMetadata();
  const [contenu] = await fichier.download();
  const type = meta.contentType ?? "";
  if (type.includes("wordprocessingml") || type === "application/msword") {
    const mammoth = (await import("mammoth")).default;
    const { value } = await mammoth.extractRawText({ buffer: contenu });
    if (!value.trim()) throw new Error("Document Word vide ou non lisible (format .doc ancien ?)");
    return blocCv({ contentType: type, texteWord: value });
  }
  return blocCv({ contentType: type, base64: contenu.toString("base64") });
}

async function executerAnalyse(candidatureId, c, declencheur) {
  const ref = db.doc(`analyses/${candidatureId}`);
  const base = { candidatureId, recruteurId: c.recruteurId, candidatId: c.candidatId, offreSlug: c.offreSlug, declencheur };
  try {
    const offre = await offreDeLaCandidature(c);
    if (!offre) throw new Error("Offre introuvable");
    const bloc = await preparerCv(c.cvChemin);
    const analyse = await analyserCv({ offre, bloc, messageCandidat: c.message, cle: CLE_IA.value(), modele: MODELE });
    await ref.set({ ...base, ...analyse, statut: "ok", analyseeLe: new Date().toISOString(), horodatage: FieldValue.serverTimestamp() });
    return analyse;
  } catch (e) {
    await ref.set({ ...base, statut: "erreur", erreur: String(e.message ?? e).slice(0, 300), analyseeLe: new Date().toISOString() });
    throw e;
  }
}

/** Analyse automatique de chaque nouvelle candidature avec CV, pour les recruteurs ayant Insight. */
export const analyserNouvelleCandidature = onDocumentCreated(
  { document: "candidatures/{id}", region: REGION_BASE, secrets: [CLE_IA], timeoutSeconds: 180, memory: "512MiB", retry: false },
  async (event) => {
    const c = event.data?.data();
    if (!c || c.externe || !c.cvChemin || !c.recruteurId) return;
    if (!(await recruteurAInsight(c.recruteurId))) return;
    if (await quotaAtteint(c.recruteurId)) {
      await db.doc(`analyses/${event.params.id}`).set({ candidatureId: event.params.id, recruteurId: c.recruteurId, statut: "erreur", erreur: `Quota quotidien de ${LIMITE_JOUR} analyses atteint`, analyseeLe: new Date().toISOString() });
      return;
    }
    await executerAnalyse(event.params.id, c, "automatique").catch((e) => console.error("Analyse échouée", event.params.id, e.message));
  },
);

/** Relance manuelle depuis l'espace recruteur ou le back office. */
export const relancerAnalyse = onCall({ region: "europe-west1", secrets: [CLE_IA], timeoutSeconds: 180, memory: "512MiB" }, async (req) => {
  if (!req.auth || req.auth.token.ouvertPar) throw new HttpsError("unauthenticated", "Connexion requise.");
  const id = String(req.data?.candidatureId ?? "");
  const snap = await db.doc(`candidatures/${id}`).get();
  if (!snap.exists) throw new HttpsError("not-found", "Candidature introuvable.");
  const c = snap.data();
  const estAdmin = (await db.doc(`admins/${req.auth.uid}`).get()).exists;
  if (!estAdmin && c.recruteurId !== req.auth.uid) throw new HttpsError("permission-denied", "Cette candidature ne vous est pas adressée.");
  if (!estAdmin && !(await recruteurAInsight(req.auth.uid))) throw new HttpsError("failed-precondition", "Le module Insight n'est pas activé pour votre compte.");
  if (!c.cvChemin) throw new HttpsError("failed-precondition", "Aucun CV joint à cette candidature.");
  if (!estAdmin && (await quotaAtteint(req.auth.uid))) throw new HttpsError("resource-exhausted", "Quota quotidien d'analyses atteint.");
  try {
    return await executerAnalyse(id, c, estAdmin ? "admin" : "relance");
  } catch (e) {
    throw new HttpsError("internal", `Analyse impossible : ${e.message}`);
  }
});
