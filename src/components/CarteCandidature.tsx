import { useState } from "react";
import { Check, ChevronDown, Clock, FileText, Loader2, Mail, MessageCircleQuestion, Phone, RefreshCw, Sparkles, TriangleAlert, X } from "lucide-react";
import AnneauCompat from "./AnneauCompat";
import { changerStatutCandidature, relancerAnalyse, STATUTS_CAND, type AnalyseCv, type CandidatureBase, type StatutCand } from "@/lib/donnees";
import { messageErreur } from "@/lib/firebase";
import { ilYa } from "@/lib/format";

const couleurReco: Record<string, string> = {
  "À rencontrer": "bg-foret-100 text-foret-800",
  "À étudier": "bg-soleil-100 text-soleil-800",
  "Peu adapté": "bg-stone-200 text-stone-700",
};

/** Carte d'une candidature reçue, avec l'analyse IA du CV quand le module Insight est actif. */
export default function CarteCandidature({ c, analyse, insight, majStatut }: { c: CandidatureBase; analyse?: AnalyseCv; insight: boolean; majStatut: (s: StatutCand) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [relance, setRelance] = useState(false);
  const [erreur, setErreur] = useState("");
  const enCours = insight && c.cvUrl && !analyse && Date.now() - new Date(c.creeLe).getTime() < 5 * 60000;

  const relancer = async () => {
    setRelance(true);
    setErreur("");
    try {
      await relancerAnalyse(c.id);
    } catch (e) {
      setErreur((e as { message?: string }).message ?? messageErreur(e));
    } finally {
      setRelance(false);
    }
  };

  return (
    <div className="carte p-5">
      <div className="flex items-start gap-4">
        {insight && analyse?.statut === "ok" && <AnneauCompat valeur={analyse.score} taille={56} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{c.nom}</p>
            {insight && analyse?.statut === "ok" && <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${couleurReco[analyse.recommandation]}`}>{analyse.recommandation}</span>}
          </div>
          <p className="text-sm text-encre/55">{c.offreTitre} · <Clock className="inline h-3.5 w-3.5" /> {ilYa(c.creeLe)}</p>
        </div>
        <select value={c.statut} onChange={async (e) => { const s = e.target.value as StatutCand; await changerStatutCandidature(c.id, s); majStatut(s); }} className="rounded-full border-0 bg-encre/[.05] px-3 py-2 text-sm font-bold" aria-label="Statut">
          {STATUTS_CAND.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {insight && analyse?.statut === "ok" && (
        <div className="mt-4 rounded-2xl bg-violet-50/70 p-4 ring-1 ring-violet-100">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-700"><Sparkles className="h-3.5 w-3.5" /> Analyse IA du CV</p>
          {analyse.resume && <p className="mt-2 text-sm leading-relaxed text-encre/80">{analyse.resume}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analyse.competencesTrouvees.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded-full bg-foret-700 px-2.5 py-1 text-xs font-medium text-creme"><Check className="h-3 w-3" />{k}</span>)}
            {analyse.competencesManquantes.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-terre-700 ring-1 ring-terre-200"><X className="h-3 w-3" />{k}</span>)}
          </div>
          <p className="mt-3 text-xs text-encre/55">{[analyse.experienceAnnees != null && `${analyse.experienceAnnees} an(s) d'expérience pertinente`, analyse.diplome, analyse.langues.length && analyse.langues.join(", ")].filter(Boolean).join(" · ")}</p>
          <button onClick={() => setOuvert(!ouvert)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline">
            {ouvert ? "Masquer le détail" : "Points forts, vigilance et questions d'entretien"} <ChevronDown className={`h-4 w-4 transition ${ouvert ? "rotate-180" : ""}`} />
          </button>
          {ouvert && (
            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
              <Liste titre="Points forts" icone={<Check className="h-4 w-4 text-foret-600" />} items={analyse.pointsForts} />
              <Liste titre="À vérifier" icone={<TriangleAlert className="h-4 w-4 text-soleil-600" />} items={analyse.pointsVigilance} />
              <Liste titre="Questions à poser" icone={<MessageCircleQuestion className="h-4 w-4 text-violet-600" />} items={analyse.questionsEntretien} />
            </div>
          )}
          <p className="mt-3 text-[11px] text-encre/45">Aide à la décision générée par IA, sur les seuls critères professionnels. Vérifiez toujours le CV : la décision vous appartient.</p>
        </div>
      )}
      {insight && enCours && <p className="mt-4 flex items-center gap-2 text-sm text-violet-700"><Loader2 className="h-4 w-4 animate-spin" /> Analyse du CV en cours…</p>}
      {insight && analyse?.statut === "erreur" && <p className="mt-4 rounded-xl bg-terre-50 p-3 text-sm text-terre-800">Analyse impossible : {analyse.erreur}</p>}

      {c.message && <p className="mt-3 rounded-xl bg-creme p-3 text-sm text-encre/75">{c.message}</p>}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href={`mailto:${c.email}`} className="btn-contour !py-2"><Mail className="h-4 w-4" /> {c.email}</a>
        <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="btn-contour !py-2"><Phone className="h-4 w-4" /> {c.telephone}</a>
        {c.cvUrl && <a href={c.cvUrl} target="_blank" rel="noopener noreferrer" onClick={() => { if (c.statut === "Envoyée") { changerStatutCandidature(c.id, "Vue"); majStatut("Vue"); } }} className="btn-primaire !py-2"><FileText className="h-4 w-4" /> Voir le CV</a>}
        {insight && c.cvUrl && !enCours && (
          <button onClick={relancer} disabled={relance} className="btn-fantome !py-2 text-violet-700">
            {relance ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {analyse ? "Relancer l'analyse" : "Analyser le CV"}
          </button>
        )}
      </div>
      {erreur && <p className="mt-2 text-sm text-terre-700">{erreur}</p>}
    </div>
  );
}

function Liste({ titre, icone, items }: { titre: string; icone: React.ReactNode; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 font-semibold">{titre}</p>
      {items.length ? (
        <ul className="space-y-1.5">{items.map((i) => <li key={i} className="flex gap-2 text-encre/75"><span className="mt-0.5 shrink-0">{icone}</span>{i}</li>)}</ul>
      ) : (
        <p className="text-encre/45">—</p>
      )}
    </div>
  );
}
