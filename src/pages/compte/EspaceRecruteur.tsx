import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { BriefcaseBusiness, Building2, Clock, ExternalLink, FileText, LogOut, Mail, Phone, PlusCircle, ShieldCheck, Users } from "lucide-react";
import FormulaireOffre, { versChamps } from "@/components/FormulaireOffre";
import Vide from "@/components/Vide";
import { Alerte } from "@/components/CarteAuth";
import { deconnecter, exporterMesDonnees, majConsentementMarketing, majProfil, useAuth, type Utilisateur } from "@/lib/auth";
import { candidaturesRecues, changerStatutCandidature, cloturerOffre, mesOffres, soumettreOffre, STATUTS_CAND, type CandidatureBase, type StatutCand } from "@/lib/donnees";
import { messageErreur } from "@/lib/firebase";
import { SECTEURS, VILLES } from "@/data/taxonomie";
import type { Offre } from "@/data/types";
import { ilYa, pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const ONGLETS = [
  { id: "offres", label: "Mes offres", icone: BriefcaseBusiness },
  { id: "candidatures", label: "Candidatures reçues", icone: Users },
  { id: "publier", label: "Publier une offre", icone: PlusCircle },
  { id: "entreprise", label: "Mon entreprise", icone: Building2 },
] as const;

const badgeStatut: Record<string, { t: string; c: string }> = {
  en_attente: { t: "En vérification", c: "bg-soleil-100 text-soleil-800" },
  publiee: { t: "En ligne", c: "bg-foret-100 text-foret-800" },
  refusee: { t: "Refusée", c: "bg-terre-100 text-terre-700" },
  expiree: { t: "Clôturée", c: "bg-stone-200 text-stone-700" },
};

export default function EspaceRecruteur() {
  useSeo("Espace recruteur");
  const { pret, utilisateur, profil } = useAuth();
  const [sp, setSp] = useSearchParams();
  const onglet = sp.get("onglet") ?? "offres";
  const [offres, setOffres] = useState<(Offre & { id: string })[] | null>(null);
  const [cands, setCands] = useState<CandidatureBase[] | null>(null);
  const [filtreOffre, setFiltreOffre] = useState("");

  const charger = useCallback(() => {
    if (!profil || profil.role !== "recruteur") return;
    mesOffres(profil.uid).then(setOffres).catch(() => setOffres([]));
    candidaturesRecues(profil.uid).then(setCands).catch(() => setCands([]));
  }, [profil]);
  useEffect(charger, [charger]);

  const parOffre = useMemo(() => {
    const m: Record<string, number> = {};
    cands?.forEach((c) => (m[c.offreSlug] = (m[c.offreSlug] ?? 0) + 1));
    return m;
  }, [cands]);

  if (!pret) return <div className="container py-24 text-center text-encre/50">Chargement…</div>;
  if (!utilisateur) return <Navigate to="/connexion?retour=/recruteur" replace />;
  if (!profil) return <Navigate to="/inscription?etape=profil&role=recruteur" replace />;
  if (profil.role !== "recruteur") return <Navigate to="/mon-espace" replace />;

  const enLigne = offres?.filter((o) => o.statut === "publiee").length ?? 0;
  const nouvelles = cands?.filter((c) => c.statut === "Envoyée").length ?? 0;
  const candsFiltrees = cands?.filter((c) => !filtreOffre || c.offreSlug === filtreOffre) ?? [];

  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="surtitre">Espace recruteur · {profil.entreprise}</p>
          <h1 className="mt-2 text-4xl font-bold">Bonjour {profil.prenom} 👋</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSp({ onglet: "publier" })} className="btn-soleil"><PlusCircle className="h-4 w-4" /> Nouvelle offre</button>
          <button onClick={deconnecter} className="btn-fantome"><LogOut className="h-4 w-4" /> Déconnexion</button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { v: enLigne, l: "offres en ligne" },
          { v: offres?.filter((o) => o.statut === "en_attente").length ?? 0, l: "en vérification" },
          { v: cands?.length ?? 0, l: "candidatures reçues" },
          { v: nouvelles, l: "à traiter" },
        ].map((k) => (
          <div key={k.l} className="carte p-5"><p className="font-display text-4xl font-bold">{k.v}</p><p className="text-sm text-encre/60">{k.l}</p></div>
        ))}
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl bg-encre/[.05] p-1" role="tablist">
        {ONGLETS.map(({ id, label, icone: I }) => (
          <button key={id} role="tab" aria-selected={onglet === id} onClick={() => setSp({ onglet: id })}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${onglet === id ? "bg-white text-encre shadow-carte" : "text-encre/60 hover:text-encre"}`}>
            <I className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {onglet === "offres" &&
          (offres === null ? <p className="text-encre/50">Chargement…</p> : offres.length ? (
            <div className="carte divide-y divide-encre/[.07]">
              {offres.map((o) => (
                <div key={o.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    {o.statut === "publiee" ? <Link to={`/offres/${o.slug}`} className="font-semibold hover:text-foret-700">{o.titre}</Link> : <span className="font-semibold">{o.titre}</span>}
                    <p className="text-sm text-encre/55">{o.ville} · {o.contrat} · soumise {ilYa(o.publieeLe)}</p>
                    {o.statut === "refusee" && o.motifRefus && <p className="mt-1 text-sm text-terre-700">Motif : {o.motifRefus}</p>}
                  </div>
                  <button onClick={() => { setFiltreOffre(o.slug); setSp({ onglet: "candidatures" }); }} className="text-sm font-semibold text-foret-700 hover:underline">{pluriel(parOffre[o.slug] ?? 0, "candidature")}</button>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStatut[o.statut ?? "en_attente"].c}`}>{badgeStatut[o.statut ?? "en_attente"].t}</span>
                  {o.statut === "publiee" && <button onClick={async () => { await cloturerOffre(o.id); charger(); }} className="btn-fantome !px-3 !py-1.5 text-xs">Clôturer</button>}
                </div>
              ))}
            </div>
          ) : (
            <Vide icone={<BriefcaseBusiness className="h-6 w-6" />} titre="Aucune offre pour l'instant" texte="Publiez votre première offre : elle sera vérifiée par l'équipe puis mise en ligne." action={<button onClick={() => setSp({ onglet: "publier" })} className="btn-primaire">Publier une offre</button>} />
          ))}

        {onglet === "candidatures" && (
          <div className="space-y-4">
            {offres && offres.length > 0 && (
              <select value={filtreOffre} onChange={(e) => setFiltreOffre(e.target.value)} className="champ !w-auto" aria-label="Filtrer par offre">
                <option value="">Toutes les offres</option>
                {offres.map((o) => <option key={o.id} value={o.slug}>{o.titre}</option>)}
              </select>
            )}
            {cands === null ? <p className="text-encre/50">Chargement…</p> : candsFiltrees.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {candsFiltrees.map((c) => (
                  <div key={c.id} className="carte p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{c.nom}</p>
                        <p className="text-sm text-encre/55">{c.offreTitre} · <Clock className="inline h-3.5 w-3.5" /> {ilYa(c.creeLe)}</p>
                      </div>
                      <select value={c.statut} onChange={async (e) => { const s = e.target.value as StatutCand; await changerStatutCandidature(c.id, s); setCands(cands.map((x) => (x.id === c.id ? { ...x, statut: s } : x))); }}
                        className="rounded-full border-0 bg-encre/[.05] px-3 py-2 text-sm font-bold" aria-label="Statut">
                        {STATUTS_CAND.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    {c.message && <p className="mt-3 rounded-xl bg-creme p-3 text-sm text-encre/75">{c.message}</p>}
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <a href={`mailto:${c.email}`} className="btn-contour !py-2"><Mail className="h-4 w-4" /> {c.email}</a>
                      <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="btn-contour !py-2"><Phone className="h-4 w-4" /> {c.telephone}</a>
                      {c.cvUrl && <a href={c.cvUrl} target="_blank" rel="noopener noreferrer" onClick={() => c.statut === "Envoyée" && changerStatutCandidature(c.id, "Vue")} className="btn-primaire !py-2"><FileText className="h-4 w-4" /> Voir le CV</a>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Vide icone={<Users className="h-6 w-6" />} titre="Pas encore de candidature" texte="Les candidats qui postulent à vos offres apparaîtront ici avec leur CV." />
            )}
          </div>
        )}

        {onglet === "publier" && <Publier profil={profil} apres={() => { charger(); setSp({ onglet: "offres" }); }} />}
        {onglet === "entreprise" && <MonEntreprise profil={profil} />}
      </div>
    </div>
  );
}

function Publier({ profil, apres }: { profil: Utilisateur; apres: () => void }) {
  const [ok, setOk] = useState(false);
  if (ok)
    return (
      <div className="carte p-8 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-foret-600" />
        <p className="mt-3 text-xl font-semibold">Offre envoyée !</p>
        <p className="mt-1 text-encre/60">Notre équipe la vérifie avant sa mise en ligne. Vous la retrouvez dans « Mes offres ».</p>
        <div className="mt-5 flex justify-center gap-2"><button onClick={apres} className="btn-primaire">Voir mes offres</button><button onClick={() => setOk(false)} className="btn-contour">Publier une autre offre</button></div>
      </div>
    );
  return (
    <div className="carte p-6 sm:p-10">
      <FormulaireOffre
        initial={{ ...versChamps(undefined, profil.entreprise ?? "", profil.email), secteur: profil.secteurEntreprise || SECTEURS[0].id }}
        entrepriseFixe
        libelle="Envoyer pour vérification"
        onSubmit={async (b) => { await soumettreOffre(profil.uid, b); setOk(true); }}
        pied={<p className="text-xs text-encre/50">Chaque offre est relue par l'équipe Workers. Toute offre demandant de l'argent aux candidats est refusée.</p>}
      />
    </div>
  );
}

function MonEntreprise({ profil }: { profil: Utilisateur }) {
  const [p, setP] = useState({ entreprise: profil.entreprise ?? "", fonction: profil.fonction ?? "", secteurEntreprise: profil.secteurEntreprise ?? "", tailleEntreprise: profil.tailleEntreprise ?? "", telephone: profil.telephone, ville: profil.ville, prenom: profil.prenom, nom: profil.nom });
  const [msg, setMsg] = useState<{ t: "succes" | "erreur"; m: string } | null>(null);
  const set = (k: keyof typeof p) => (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form className="carte grid gap-5 p-6 sm:grid-cols-2 sm:p-8" onSubmit={async (e) => { e.preventDefault(); try { await majProfil(profil.uid, p); setMsg({ t: "succes", m: "Informations enregistrées." }); } catch (err) { setMsg({ t: "erreur", m: messageErreur(err) }); } }}>
        <label className="sm:col-span-2"><span className="etiquette">Entreprise</span><input className="champ" value={p.entreprise} onChange={set("entreprise")} /></label>
        <label><span className="etiquette">Secteur</span><select className="champ" value={p.secteurEntreprise} onChange={set("secteurEntreprise")}>{SECTEURS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}</select></label>
        <label><span className="etiquette">Taille</span><select className="champ" value={p.tailleEntreprise} onChange={set("tailleEntreprise")}><option value="">—</option>{["1-10", "10-50", "50-200", "200-500", "500-1 000", "1 000+"].map((t) => <option key={t}>{t} salariés</option>)}</select></label>
        <label><span className="etiquette">Prénom</span><input className="champ" value={p.prenom} onChange={set("prenom")} /></label>
        <label><span className="etiquette">Nom</span><input className="champ" value={p.nom} onChange={set("nom")} /></label>
        <label><span className="etiquette">Fonction</span><input className="champ" value={p.fonction} onChange={set("fonction")} /></label>
        <label><span className="etiquette">Téléphone</span><input className="champ" value={p.telephone} onChange={set("telephone")} /></label>
        <label><span className="etiquette">Ville</span><select className="champ" value={p.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}<option>Autre</option></select></label>
        {msg && <div className="sm:col-span-2"><Alerte type={msg.t}>{msg.m}</Alerte></div>}
        <div className="sm:col-span-2"><button className="btn-primaire">Enregistrer</button></div>
      </form>
      <aside className="space-y-4">
        <div className="carte p-6 text-sm">
          <h3 className="font-semibold">Communications</h3>
          <label className="mt-3 flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" defaultChecked={profil.consentements?.marketing} onChange={(e) => majConsentementMarketing(profil.uid, e.target.checked)} />
            <span className="text-encre/70">Recevoir les actualités et offres commerciales de Workers et du groupe Melanyne.</span>
          </label>
        </div>
        <div className="carte p-6 text-sm">
          <h3 className="font-semibold">Mes données</h3>
          <button onClick={() => exporterMesDonnees(profil.uid)} className="btn-contour mt-3 w-full">Télécharger mes données</button>
          <p className="mt-3 text-encre/55">Pour supprimer votre compte recruteur : <a className="lien" href="mailto:recrutement@workers-melanyne.com">recrutement@workers-melanyne.com</a> <ExternalLink className="inline h-3 w-3" /></p>
        </div>
      </aside>
    </div>
  );
}
