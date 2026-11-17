// Comptes utilisateurs : candidats, recruteurs et administrateurs.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db, firebaseActif, obtenirStockage, suivreEvenement } from "./firebase";
import { actions } from "./store";
import type { Contrat } from "@/data/taxonomie";

export type Role = "candidat" | "recruteur";

export interface Utilisateur {
  uid: string;
  role: Role;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  // Candidat
  metier?: string;
  competences?: string[];
  contrats?: Contrat[];
  secteurs?: string[];
  experience?: string;
  cvUrl?: string;
  cvChemin?: string;
  cvNom?: string;
  // Recruteur
  entreprise?: string;
  fonction?: string;
  secteurEntreprise?: string;
  tailleEntreprise?: string;
  insight?: boolean; // module d'analyse IA des CV, activé par un admin
  // Commun
  consentements: { cgu: string; marketing: boolean; majLe: string };
  statut: "actif" | "suspendu";
  origine?: Record<string, string>;
  creeLe?: unknown;
  derniereConnexion?: unknown;
}

interface EtatAuth {
  pret: boolean;
  utilisateur: User | null;
  profil: Utilisateur | null;
  estAdmin: boolean;
  /** UID de l'admin quand la session a été ouverte avec « se connecter en tant que ». */
  ouvertPar: string | null;
}

const Contexte = createContext<EtatAuth>({ pret: !firebaseActif, utilisateur: null, profil: null, estAdmin: false, ouvertPar: null });

export const useAuth = () => useContext(Contexte);

/** Mémorise la provenance du visiteur (utm_source, utm_campaign…) pour l'associer à son inscription. */
export function memoriserOrigine() {
  try {
    if (localStorage.getItem("workers:origine")) return;
    const sp = new URLSearchParams(window.location.search);
    const o: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"]) {
      const v = sp.get(k);
      if (v) o[k] = v.slice(0, 100);
    }
    if (document.referrer && !document.referrer.includes(window.location.host)) o.referent = document.referrer.slice(0, 200);
    o.premiereVisite = new Date().toISOString();
    localStorage.setItem("workers:origine", JSON.stringify(o));
  } catch {
    /* stockage indisponible */
  }
}

function origine(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("workers:origine") ?? "{}");
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<EtatAuth>({ pret: !firebaseActif, utilisateur: null, profil: null, estAdmin: false, ouvertPar: null });

  useEffect(() => {
    if (!auth || !db) return;
    let stopProfil: (() => void) | undefined;
    const stop = onAuthStateChanged(auth, async (u) => {
      stopProfil?.();
      if (!u) {
        setEtat({ pret: true, utilisateur: null, profil: null, estAdmin: false, ouvertPar: null });
        return;
      }
      const [jeton, adminDoc] = await Promise.all([u.getIdTokenResult(), getDoc(doc(db!, "admins", u.uid)).catch(() => null)]);
      const ouvertPar = (jeton.claims.ouvertPar as string | undefined) ?? null;
      const estAdmin = Boolean(adminDoc?.exists()) && !ouvertPar;
      stopProfil = onSnapshot(
        doc(db!, "utilisateurs", u.uid),
        (snap) => {
          const profil = snap.exists() ? ({ uid: u.uid, ...snap.data() } as Utilisateur) : null;
          if (profil?.role === "candidat") {
            // Copie locale pour le score de compatibilité affiché sur les offres
            actions.enregistrerProfil({
              prenom: profil.prenom,
              metier: profil.metier ?? "",
              ville: profil.ville,
              competences: profil.competences ?? [],
              contrats: profil.contrats ?? [],
              secteurs: profil.secteurs ?? [],
            });
          }
          setEtat({ pret: true, utilisateur: u, profil, estAdmin, ouvertPar });
        },
        () => setEtat({ pret: true, utilisateur: u, profil: null, estAdmin, ouvertPar }),
      );
      // Dernière connexion (une fois par session de navigateur)
      if (!ouvertPar && !sessionStorage.getItem("workers:vu")) {
        sessionStorage.setItem("workers:vu", "1");
        updateDoc(doc(db!, "utilisateurs", u.uid), { derniereConnexion: serverTimestamp() }).catch(() => {});
      }
    });
    return () => {
      stop();
      stopProfil?.();
    };
  }, []);

  return <Contexte.Provider value={etat}>{children}</Contexte.Provider>;
}

// ------------------------------------------------------------------ actions

export interface DonneesInscription {
  role: Role;
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  marketing: boolean;
  metier?: string;
  entreprise?: string;
  fonction?: string;
  secteurEntreprise?: string;
}

function documentProfil(u: User, d: DonneesInscription) {
  const maintenant = new Date().toISOString();
  return {
    role: d.role,
    prenom: d.prenom.trim(),
    nom: d.nom.trim(),
    email: u.email ?? "",
    telephone: d.telephone.trim(),
    ville: d.ville,
    ...(d.role === "candidat"
      ? { metier: d.metier?.trim() ?? "", competences: [], contrats: [], secteurs: [] }
      : { entreprise: d.entreprise?.trim() ?? "", fonction: d.fonction?.trim() ?? "", secteurEntreprise: d.secteurEntreprise ?? "" }),
    consentements: { cgu: maintenant, marketing: d.marketing, majLe: maintenant },
    statut: "actif",
    origine: origine(),
    creeLe: serverTimestamp(),
    derniereConnexion: serverTimestamp(),
  };
}

export async function inscrireParEmail(email: string, motDePasse: string, d: DonneesInscription) {
  const { user } = await createUserWithEmailAndPassword(auth!, email.trim(), motDePasse);
  await updateProfile(user, { displayName: `${d.prenom} ${d.nom}`.trim() });
  await setDoc(doc(db!, "utilisateurs", user.uid), documentProfil(user, d));
  sendEmailVerification(user).catch(() => {});
  suivreEvenement("sign_up", { method: "email", role: d.role });
}

/** Termine l'inscription d'un compte Google (profil Firestore encore absent). */
export async function completerInscription(d: DonneesInscription) {
  const u = auth!.currentUser!;
  await setDoc(doc(db!, "utilisateurs", u.uid), documentProfil(u, d));
  suivreEvenement("sign_up", { method: "google", role: d.role });
}

export async function connecterParEmail(email: string, motDePasse: string) {
  await signInWithEmailAndPassword(auth!, email.trim(), motDePasse);
  suivreEvenement("login", { method: "email" });
}

/** Renvoie vrai si le compte Google n'a pas encore de profil Workers. */
export async function connecterAvecGoogle(): Promise<boolean> {
  const { user } = await signInWithPopup(auth!, new GoogleAuthProvider());
  suivreEvenement("login", { method: "google" });
  const snap = await getDoc(doc(db!, "utilisateurs", user.uid));
  return !snap.exists();
}

export const motDePasseOublie = (email: string) => sendPasswordResetEmail(auth!, email.trim());

export async function deconnecter() {
  await signOut(auth!);
  sessionStorage.removeItem("workers:vu");
  actions.toutEffacer(); // on ne laisse pas de données personnelles sur un appareil partagé
}

export async function majProfil(uid: string, champs: Partial<Utilisateur>) {
  await updateDoc(doc(db!, "utilisateurs", uid), champs as Record<string, unknown>);
}

export async function majConsentementMarketing(uid: string, marketing: boolean) {
  await updateDoc(doc(db!, "utilisateurs", uid), { "consentements.marketing": marketing, "consentements.majLe": new Date().toISOString() });
}

/** Droit d'accès : télécharge toutes les données du compte au format JSON. */
export async function exporterMesDonnees(uid: string) {
  const profil = (await getDoc(doc(db!, "utilisateurs", uid))).data();
  const cands = await getDocs(query(collection(db!, "candidatures"), where("candidatId", "==", uid)));
  const blob = new Blob([JSON.stringify({ exporteLe: new Date().toISOString(), profil, candidatures: cands.docs.map((d) => d.data()) }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mes-donnees-workers.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Droit à l'effacement : supprime CV, candidatures, profil puis le compte. */
export async function supprimerMonCompte(profil: Utilisateur) {
  const u = auth!.currentUser!;
  if (profil.cvChemin) {
    const { deleteObject, ref } = await import("firebase/storage");
    await deleteObject(ref(await obtenirStockage(), profil.cvChemin)).catch(() => {});
  }
  const cands = await getDocs(query(collection(db!, "candidatures"), where("candidatId", "==", u.uid)));
  await Promise.all(cands.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db!, "utilisateurs", u.uid));
  await deleteUser(u); // peut exiger une reconnexion récente
  actions.toutEffacer();
}
