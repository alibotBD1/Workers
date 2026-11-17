import { useEffect, useMemo, useState } from "react";
import { Download, LogIn, Search, ShieldOff, ShieldCheck, X } from "lucide-react";
import { changerInsight, changerStatutUtilisateur, exporterCsv, journaliser, listerUtilisateurs, seConnecterEnTantQue } from "@/lib/admin";
import type { Utilisateur } from "@/lib/auth";
import { messageErreur } from "@/lib/firebase";
import { secteurNom, VILLES } from "@/data/taxonomie";
import { EnTete } from "./Admin";

const date = (v: unknown) => {
  const d = (v as { toDate?: () => Date })?.toDate?.();
  return d ? d.toLocaleDateString("fr-FR") : "—";
};

export default function Utilisateurs() {
  const [filtres, setFiltres] = useState<{ role?: string; ville?: string; marketing?: boolean }>({});
  const [liste, setListe] = useState<Utilisateur[] | null>(null);
  const [q, setQ] = useState("");
  const [choisi, setChoisi] = useState<Utilisateur | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    setListe(null);
    listerUtilisateurs(filtres).then(setListe).catch((e) => { setErreur(messageErreur(e) + " " + (e?.message ?? "")); setListe([]); });
  }, [filtres]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (liste ?? []).filter((u) => !t || [u.prenom, u.nom, u.email, u.telephone, u.entreprise, u.metier].join(" ").toLowerCase().includes(t));
  }, [liste, q]);

  const exporter = async (marketingSeulement: boolean) => {
    const cible = marketingSeulement ? visibles.filter((u) => u.consentements?.marketing) : visibles;
    exporterCsv(`workers-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`, cible.map((u) => ({
      role: u.role, prenom: u.prenom, nom: u.nom, email: u.email, telephone: u.telephone, ville: u.ville,
      metier: u.metier ?? "", entreprise: u.entreprise ?? "", secteur: u.secteurEntreprise ? secteurNom(u.secteurEntreprise) : (u.secteurs ?? []).map(secteurNom).join(", "),
      competences: (u.competences ?? []).join(", "), consentement_marketing: u.consentements?.marketing ? "oui" : "non", inscrit_le: date(u.creeLe),
      source: u.origine?.utm_source ?? "", campagne: u.origine?.utm_campaign ?? "",
    })));
    await journaliser("Export d'utilisateurs", marketingSeulement ? "contacts marketing" : "tous", `${cible.length} lignes`);
  };

  return (
    <>
      <EnTete
        titre="Utilisateurs"
        sousTitre={liste ? `${visibles.length} affiché(s)` : "Chargement…"}
        actions={
          <>
            <button onClick={() => exporter(true)} className="btn-primaire"><Download className="h-4 w-4" /> Exporter les contacts marketing</button>
            <button onClick={() => exporter(false)} className="btn-contour"><Download className="h-4 w-4" /> Exporter la sélection</button>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="relative min-w-[240px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-encre/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, e-mail, téléphone, entreprise…" className="champ !pl-11" />
        </label>
        <select className="champ !w-auto" value={filtres.role ?? ""} onChange={(e) => setFiltres({ ...filtres, role: e.target.value || undefined })}>
          <option value="">Tous les rôles</option><option value="candidat">Candidats</option><option value="recruteur">Recruteurs</option>
        </select>
        <select className="champ !w-auto" value={filtres.ville ?? ""} onChange={(e) => setFiltres({ ...filtres, ville: e.target.value || undefined })}>
          <option value="">Toutes les villes</option>{VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}
        </select>
        <label className="flex items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium ring-1 ring-encre/10">
          <input type="checkbox" className="h-4 w-4 accent-foret-700" checked={Boolean(filtres.marketing)} onChange={(e) => setFiltres({ ...filtres, marketing: e.target.checked || undefined })} /> Consentement marketing
        </label>
      </div>
      {erreur && <p className="mb-4 rounded-xl bg-terre-50 p-3 text-sm text-terre-800">{erreur}</p>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-carte">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-encre/10 text-xs uppercase tracking-wider text-encre/50">
            <tr><th className="p-4">Nom</th><th className="p-4">Rôle</th><th className="p-4">Contact</th><th className="p-4">Ville</th><th className="p-4">Métier / entreprise</th><th className="p-4">Marketing</th><th className="p-4">Inscrit le</th><th className="p-4">Statut</th></tr>
          </thead>
          <tbody>
            {visibles.map((u) => (
              <tr key={u.uid} onClick={() => setChoisi(u)} className="cursor-pointer border-b border-encre/[.05] hover:bg-creme">
                <td className="p-4 font-semibold">{u.prenom} {u.nom}</td>
                <td className="p-4"><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${u.role === "recruteur" ? "bg-soleil-100 text-soleil-800" : "bg-foret-100 text-foret-800"}`}>{u.role}</span></td>
                <td className="p-4 text-encre/70">{u.email}<br />{u.telephone}</td>
                <td className="p-4">{u.ville}</td>
                <td className="p-4 text-encre/70">{u.role === "recruteur" ? u.entreprise : u.metier}{u.insight && <span className="ml-2 rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-bold text-violet-800">Insight</span>}</td>
                <td className="p-4">{u.consentements?.marketing ? "✓" : "—"}</td>
                <td className="p-4 text-encre/60">{date(u.creeLe)}</td>
                <td className="p-4">{u.statut === "suspendu" ? <span className="font-semibold text-terre-600">Suspendu</span> : "Actif"}</td>
              </tr>
            ))}
            {liste && !visibles.length && <tr><td colSpan={8} className="p-8 text-center text-encre/50">Aucun utilisateur.</td></tr>}
          </tbody>
        </table>
      </div>
      {choisi && <Fiche u={choisi} fermer={() => setChoisi(null)} maj={(u) => { setListe((l) => l?.map((x) => (x.uid === u.uid ? u : x)) ?? null); setChoisi(u); }} />}
    </>
  );
}

function Fiche({ u, fermer, maj }: { u: Utilisateur; fermer: () => void; maj: (u: Utilisateur) => void }) {
  const [msg, setMsg] = useState("");
  const logAs = async () => {
    if (!window.confirm(`Ouvrir une session en tant que ${u.prenom} ${u.nom} ? Votre session admin sera fermée ; l'action est enregistrée dans le journal d'audit.`)) return;
    try {
      await seConnecterEnTantQue(u);
      window.location.href = import.meta.env.BASE_URL + (u.role === "recruteur" ? "recruteur" : "mon-espace");
    } catch (e) {
      setMsg(`Échec : ${messageErreur(e)} — la Cloud Function « connecterEnTantQue » est-elle déployée ?`);
    }
  };
  const statut = async () => {
    const s = u.statut === "suspendu" ? "actif" : "suspendu";
    await changerStatutUtilisateur(u, s);
    maj({ ...u, statut: s });
  };
  const ligne = (l: string, v?: string | number | null) => v ? <div className="flex justify-between gap-4 py-2"><span className="text-encre/55">{l}</span><span className="text-right font-medium">{v}</span></div> : null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foret-950/40" onClick={fermer} />
      <div className="relative h-full w-full max-w-md animate-monte overflow-y-auto bg-creme p-6 shadow-flotte">
        <div className="flex items-start justify-between">
          <div><h2 className="text-2xl font-bold">{u.prenom} {u.nom}</h2><p className="text-encre/60">{u.role} · {u.email}</p></div>
          <button onClick={fermer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 divide-y divide-encre/10 rounded-2xl bg-white px-5 text-sm">
          {ligne("Téléphone", u.telephone)}{ligne("Ville", u.ville)}{ligne("Métier", u.metier)}{ligne("Expérience", u.experience)}
          {ligne("Entreprise", u.entreprise)}{ligne("Fonction", u.fonction)}{ligne("Compétences", u.competences?.join(", "))}
          {ligne("Consentement marketing", u.consentements?.marketing ? `Oui (${u.consentements.majLe?.slice(0, 10)})` : "Non")}
          {ligne("CGU acceptées le", u.consentements?.cgu?.slice(0, 10))}
          {ligne("Provenance", [u.origine?.utm_source, u.origine?.utm_campaign, u.origine?.referent].filter(Boolean).join(" · "))}
        </div>
        {u.cvUrl && <a href={u.cvUrl} target="_blank" rel="noopener noreferrer" onClick={() => journaliser("CV consulté", u.email)} className="btn-contour mt-4 w-full">Voir le CV</a>}
        {u.role === "recruteur" && (
          <label className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-encre/10">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-violet-700" checked={Boolean(u.insight)} onChange={async (e) => { await changerInsight(u, e.target.checked); maj({ ...u, insight: e.target.checked }); }} />
            <span><strong>Module Insight</strong> — analyse IA automatique des CV reçus par ce recruteur (formule Entreprise ou pilote).</span>
          </label>
        )}
        <div className="mt-6 grid gap-2">
          <button onClick={logAs} className="btn-primaire"><LogIn className="h-4 w-4" /> Se connecter en tant que</button>
          <button onClick={statut} className="btn-contour">{u.statut === "suspendu" ? <><ShieldCheck className="h-4 w-4" /> Réactiver le compte</> : <><ShieldOff className="h-4 w-4" /> Suspendre le compte</>}</button>
        </div>
        {msg && <p className="mt-4 rounded-xl bg-terre-50 p-3 text-sm text-terre-800">{msg}</p>}
      </div>
    </div>
  );
}
