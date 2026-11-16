// Cloud Functions de Workers.
// Déploiement : npx firebase deploy --only functions --project production
// (nécessite la formule Blaze de Firebase).
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

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
