import { useState, type FormEvent, type ReactNode } from "react";
import { CONTRATS, NIVEAUX, SECTEURS, TELETRAVAIL, VILLES, type Contrat, type Niveau, type Teletravail } from "@/data/taxonomie";
import type { Offre } from "@/data/types";
import type { BrouillonOffre } from "@/lib/donnees";

interface Champs {
  titre: string; entrepriseNom: string; ville: string; contrat: Contrat; niveau: Niveau; teletravail: Teletravail; secteur: string;
  salaireMin: string; salaireMax: string; resume: string; missions: string; profil: string; competences: string; avantages: string;
  email: string; url: string; urgent: boolean; expireLe: string;
}

const lignes = (s: string) => s.split("\n").map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
const montant = (s: string) => { const n = Number(s.replace(/[^\d]/g, "")); return n > 0 ? n : undefined; };

export function versChamps(o?: Partial<Offre>, entreprise = "", email = ""): Champs {
  return {
    titre: o?.titre ?? "", entrepriseNom: o?.entrepriseNom ?? entreprise, ville: o?.ville ?? "Douala", contrat: o?.contrat ?? "CDI",
    niveau: o?.niveau ?? "Confirmé", teletravail: o?.teletravail ?? "Sur site", secteur: o?.secteur ?? SECTEURS[0].id,
    salaireMin: o?.salaireMin ? String(o.salaireMin) : "", salaireMax: o?.salaireMax ? String(o.salaireMax) : "",
    resume: o?.resume ?? "", missions: (o?.missions ?? []).join("\n"), profil: (o?.profil ?? []).join("\n"),
    competences: (o?.competences ?? []).join(", "), avantages: (o?.avantages ?? []).join("\n"),
    email: o?.candidature?.email ?? email, url: o?.candidature?.url ?? "", urgent: Boolean(o?.urgent),
    expireLe: o?.expireLe ? o.expireLe.slice(0, 10) : "",
  };
}

export function versBrouillon(f: Champs): BrouillonOffre {
  return {
    titre: f.titre.trim(), entrepriseNom: f.entrepriseNom.trim(), ville: f.ville, contrat: f.contrat, niveau: f.niveau, teletravail: f.teletravail,
    secteur: f.secteur, salaireMin: montant(f.salaireMin), salaireMax: montant(f.salaireMax), resume: f.resume.trim(),
    missions: lignes(f.missions), profil: lignes(f.profil), avantages: lignes(f.avantages),
    competences: f.competences.split(",").map((c) => c.trim()).filter(Boolean),
    candidature: { email: f.email.trim() || undefined, url: f.url.trim() || undefined },
    urgent: f.urgent, expireLe: f.expireLe ? new Date(f.expireLe + "T23:59:00").toISOString() : undefined,
  };
}

export default function FormulaireOffre({ initial, onSubmit, libelle = "Soumettre l'offre", entrepriseFixe = false, urgentAutorise = true, pied }: {
  initial: Champs; onSubmit: (b: BrouillonOffre) => Promise<void>; libelle?: string; entrepriseFixe?: boolean; urgentAutorise?: boolean; pied?: ReactNode;
}) {
  const [f, setF] = useState(initial);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");
  const set = (k: keyof Champs) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!f.email.trim() && !f.url.trim()) return setErreur("Indiquez un e-mail ou un lien pour recevoir les candidatures.");
    if (f.url && !/^https:\/\//.test(f.url.trim())) return setErreur("Le lien de candidature doit commencer par https://");
    setOccupe(true);
    try {
      await onSubmit(versBrouillon(f));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setOccupe(false);
    }
  };

  return (
    <form onSubmit={soumettre} className="space-y-8">
      <Section titre="Le poste">
        <Champ label="Intitulé du poste *" pleine><input required className="champ" value={f.titre} onChange={set("titre")} placeholder="ex. Comptable confirmé·e" /></Champ>
        <Champ label="Entreprise *"><input required readOnly={entrepriseFixe} className={`champ ${entrepriseFixe ? "bg-encre/[.03]" : ""}`} value={f.entrepriseNom} onChange={set("entrepriseNom")} /></Champ>
        <Champ label="Ville *"><select className="champ" value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}</select></Champ>
        <Champ label="Contrat"><select className="champ" value={f.contrat} onChange={set("contrat")}>{CONTRATS.map((c) => <option key={c}>{c}</option>)}</select></Champ>
        <Champ label="Expérience"><select className="champ" value={f.niveau} onChange={set("niveau")}>{NIVEAUX.map((c) => <option key={c}>{c}</option>)}</select></Champ>
        <Champ label="Mode de travail"><select className="champ" value={f.teletravail} onChange={set("teletravail")}>{TELETRAVAIL.map((c) => <option key={c}>{c}</option>)}</select></Champ>
        <Champ label="Secteur"><select className="champ" value={f.secteur} onChange={set("secteur")}>{SECTEURS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></Champ>
        <Champ label="Salaire brut min. (FCFA / mois)"><input inputMode="numeric" className="champ" value={f.salaireMin} onChange={set("salaireMin")} placeholder="350000" /></Champ>
        <Champ label="Salaire brut max. (FCFA / mois)"><input inputMode="numeric" className="champ" value={f.salaireMax} onChange={set("salaireMax")} placeholder="500000" /></Champ>
        <Champ label="Date limite de candidature"><input type="date" className="champ" value={f.expireLe} onChange={set("expireLe")} /></Champ>
        {urgentAutorise && (
          <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold">
            <input type="checkbox" className="h-5 w-5 accent-terre-500" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> Recrutement urgent
          </label>
        )}
      </Section>
      <Section titre="Description">
        <Champ label="Résumé du poste *" pleine><textarea required rows={3} className="champ" value={f.resume} onChange={set("resume")} /></Champ>
        <Champ label="Missions (une par ligne) *" pleine><textarea required rows={4} className="champ" value={f.missions} onChange={set("missions")} /></Champ>
        <Champ label="Profil recherché (une ligne par critère) *" pleine><textarea required rows={4} className="champ" value={f.profil} onChange={set("profil")} /></Champ>
        <Champ label="Compétences (séparées par des virgules)" pleine><input className="champ" value={f.competences} onChange={set("competences")} placeholder="Excel, SYSCOHADA, Sage" /></Champ>
        <Champ label="Avantages (un par ligne)" pleine><textarea rows={3} className="champ" value={f.avantages} onChange={set("avantages")} /></Champ>
      </Section>
      <Section titre="Recevoir les candidatures">
        <Champ label="E-mail de réception"><input type="email" className="champ" value={f.email} onChange={set("email")} placeholder="rh@entreprise.cm" /></Champ>
        <Champ label="ou lien vers votre page carrière"><input type="url" className="champ" value={f.url} onChange={set("url")} placeholder="https://" /></Champ>
      </Section>
      {erreur && <p role="alert" className="rounded-xl border border-terre-200 bg-terre-50 px-4 py-3 text-sm text-terre-800">{erreur}</p>}
      <div className="flex flex-col gap-3 border-t border-encre/10 pt-6 sm:flex-row sm:items-center">
        <button type="submit" disabled={occupe} className="btn-primaire !px-7 !py-3.5">{occupe ? "Envoi…" : libelle}</button>
        {pied}
      </div>
    </form>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 text-xs font-bold uppercase tracking-widest text-terre-600">{titre}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Champ({ label, pleine, children }: { label: string; pleine?: boolean; children: ReactNode }) {
  return (
    <label className={pleine ? "sm:col-span-2" : ""}>
      <span className="etiquette">{label}</span>
      {children}
    </label>
  );
}
