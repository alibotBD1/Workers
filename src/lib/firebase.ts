// Connexion à Firebase (comptes, base Firestore, stockage des CV, statistiques).
// Sans configuration (variables VITE_FIREBASE_*), le site reste en mode local :
// tout fonctionne dans le navigateur, sans comptes.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

/** Vrai quand le site est branché à un projet Firebase. */
export const firebaseActif = Boolean(config.apiKey && config.projectId && config.appId);

/** "production" ou "recette" (bandeau affiché en recette). */
export const ENVIRONNEMENT = ((env.VITE_ENV as string | undefined) ?? "production") as "production" | "recette";

export const REGION_FONCTIONS = (env.VITE_FIREBASE_FUNCTIONS_REGION as string | undefined) ?? "europe-west1";

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (firebaseActif) {
  app = initializeApp(config);
  auth = getAuth(app);
  auth.languageCode = "fr";
  db = initializeFirestore(app, { ignoreUndefinedProperties: true });
}

/** Stockage des fichiers (CV), chargé à la demande pour alléger la page. */
export async function obtenirStockage() {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app!);
}

/** Cloud Functions, chargées à la demande (back office). */
export async function obtenirFonctions() {
  const { getFunctions } = await import("firebase/functions");
  return getFunctions(app!, REGION_FONCTIONS);
}

/** Statistiques d'audience (Google Analytics), chargées seulement après consentement. */
export async function activerStatistiques() {
  if (!app || !config.measurementId) return;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (await isSupported()) getAnalytics(app);
}

export async function suivreEvenement(nom: string, params?: Record<string, string | number>) {
  if (!app || !config.measurementId) return;
  try {
    if (localStorage.getItem("workers:consentement") !== "accepte") return;
    const { getAnalytics, logEvent, isSupported } = await import("firebase/analytics");
    if (await isSupported()) logEvent(getAnalytics(app), nom, params);
  } catch {
    /* statistiques indisponibles */
  }
}

/** Erreurs Firebase → messages lisibles. */
export function messageErreur(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/wrong-password": "E-mail ou mot de passe incorrect.",
    "auth/user-not-found": "Aucun compte n'existe avec cet e-mail.",
    "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail. Connectez-vous.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 8 caractères.",
    "auth/invalid-email": "Cette adresse e-mail n'est pas valide.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
    "auth/popup-closed-by-user": "La fenêtre de connexion a été fermée.",
    "auth/network-request-failed": "Connexion Internet indisponible. Réessayez.",
    "permission-denied": "Vous n'avez pas les droits pour cette action.",
    "storage/unauthorized": "Vous n'avez pas les droits pour envoyer ce fichier.",
  };
  return messages[code] ?? "Une erreur est survenue. Réessayez.";
}
