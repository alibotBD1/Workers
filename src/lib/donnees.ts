// Opérations sur la base Firestore : candidatures, offres des recruteurs, CV.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db, obtenirStockage, suivreEvenement } from "./firebase";
import type { Offre } from "@/data/types";
import type { Utilisateur } from "./auth";
import { slugify } from "./format";

export type StatutCand = "Envoyée" | "Vue" | "Entretien" | "Retenue" | "Non retenue";
export const STATUTS_CAND: StatutCand[] = ["Envoyée", "Vue", "Entretien", "Retenue", "Non retenue"];

export interface CandidatureBase {
  id: string;
  offreSlug: string;
  offreTitre: string;
  entrepriseNom: string;
  ville: string;
  candidatId: string;
  recruteurId: string | null;
  externe: boolean;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  cvUrl: string | null;
  cvNom: string | null;
  statut: StatutCand;
  creeLe: string;
}

const avecId = <T,>(d: { id: string; data: () => DocumentData }) => ({ id: d.id, ...d.data() }) as T;

// ------------------------------------------------------------- CV

const TYPES_CV = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];

export async function envoyerCv(uid: string, fichier: File) {
  if (!TYPES_CV.includes(fichier.type)) throw new Error("Format accepté : PDF, Word, JPG ou PNG.");
  if (fichier.size > 5 * 1024 * 1024) throw new Error("Le fichier dépasse 5 Mo.");
  const chemin = `cv/${uid}/${Date.now()}-${slugify(fichier.name.replace(/\.[^.]+$/, ""))}.${fichier.name.split(".").pop()}`;
  const { getDownloadURL, ref, uploadBytes } = await import("firebase/storage");
  const r = ref(await obtenirStockage(), chemin);
  await uploadBytes(r, fichier, { contentType: fichier.type });
  const url = await getDownloadURL(r);
  await updateDoc(doc(db!, "utilisateurs", uid), { cvUrl: url, cvChemin: chemin, cvNom: fichier.name });
  return { url, chemin };
}

// ------------------------------------------------------------- candidatures

export async function candidater(offre: Offre, profil: Utilisateur, message: string) {
  const externe = Boolean(offre.candidature.url) && !offre.recruteurId;
  await addDoc(collection(db!, "candidatures"), {
    offreSlug: offre.slug,
    offreId: offre.id ?? null,
    offreTitre: offre.titre,
    entrepriseNom: offre.entrepriseNom,
    ville: offre.ville,
    candidatId: profil.uid,
    recruteurId: offre.recruteurId ?? null,
    externe,
    nom: `${profil.prenom} ${profil.nom}`.trim(),
    email: profil.email,
    telephone: profil.telephone,
    message: message.slice(0, 3000),
    cvUrl: profil.cvUrl ?? null,
    cvNom: profil.cvNom ?? null,
    statut: "Envoyée",
    creeLe: new Date().toISOString(),
    horodatage: serverTimestamp(),
  });
  suivreEvenement(externe ? "candidature_externe" : "candidature", { secteur: offre.secteur, ville: offre.ville });
}

export async function mesCandidatures(uid: string) {
  const snap = await getDocs(query(collection(db!, "candidatures"), where("candidatId", "==", uid), orderBy("creeLe", "desc"), limit(200)));
  return snap.docs.map((d) => avecId<CandidatureBase>(d));
}

export async function candidaturesRecues(recruteurId: string) {
  const snap = await getDocs(query(collection(db!, "candidatures"), where("recruteurId", "==", recruteurId), orderBy("creeLe", "desc"), limit(500)));
  return snap.docs.map((d) => avecId<CandidatureBase>(d));
}

export const changerStatutCandidature = (id: string, statut: StatutCand) => updateDoc(doc(db!, "candidatures", id), { statut });
export const retirerCandidature = (id: string) => deleteDoc(doc(db!, "candidatures", id));

// ------------------------------------------------------------- offres des recruteurs

export async function mesOffres(recruteurId: string) {
  const snap = await getDocs(query(collection(db!, "offres"), where("recruteurId", "==", recruteurId), orderBy("creeLe", "desc"), limit(200)));
  return snap.docs.map((d) => avecId<Offre & { id: string }>(d));
}

export type BrouillonOffre = Omit<Offre, "slug" | "publieeLe" | "entreprise" | "statut" | "origine" | "recruteurId" | "demo">;

export async function soumettreOffre(recruteurId: string, b: BrouillonOffre, origine: "recruteur" | "admin" = "recruteur", statut: "en_attente" | "publiee" = "en_attente") {
  const maintenant = new Date();
  const slug = `${slugify(b.titre)}-${slugify(b.entrepriseNom)}-${maintenant.getTime().toString(36)}`.slice(0, 100);
  await addDoc(collection(db!, "offres"), {
    ...b,
    slug,
    entreprise: slugify(b.entrepriseNom),
    publieeLe: maintenant.toISOString(),
    expireLe: b.expireLe ?? new Date(maintenant.getTime() + 60 * 86400000).toISOString(),
    statut,
    origine,
    recruteurId: origine === "recruteur" ? recruteurId : null,
    creeLe: maintenant.toISOString(),
    majLe: maintenant.toISOString(),
  });
  suivreEvenement("offre_soumise", { secteur: b.secteur });
}

export const cloturerOffre = (id: string) => updateDoc(doc(db!, "offres", id), { statut: "expiree", majLe: new Date().toISOString() });
