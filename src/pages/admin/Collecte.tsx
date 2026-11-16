import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, ExternalLink, Pencil, Play, PlusCircle, Trash2, X } from "lucide-react";
import { enregistrerSource, listerCollectes, listerSources, supprimerSource, type Collecte as Run, type Source } from "@/lib/admin";
import { CONFIG } from "@/lib/config";
import { ilYa } from "@/lib/format";
import { EnTete } from "./Admin";

const VIDE: Omit<Source, "id"> = { nom: "", url: "", type: "page", actif: false, conditionsVerifiees: false, publicationAuto: false, maxOffres: 15, note: "" };

export default function Collecte() {
  const [sources, setSources] = useState<Source[] | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [edition, setEdition] = useState<(Omit<Source, "id"> & { id?: string }) | null>(null);
  const charger = () => { listerSources().then(setSources).catch(() => setSources([])); listerCollectes().then(setRuns).catch(() => {}); };
  useEffect(charger, []);

  const basculer = async (s: Source) => {
    if (!s.actif && !s.conditionsVerifiees) return window.alert("Cochez d'abord « Conditions d'utilisation vérifiées » dans la fiche de la source.");
    await enregistrerSource({ ...s, actif: !s.actif });
    charger();
  };

  return (
    <>
      <EnTete
        titre="Collecte IA"
        sousTitre="Sources d'offres d'emploi visitées automatiquement toutes les 6 heures."
        actions={
          <>
            <a href={`https://github.com/${CONFIG.depotGithub}/actions/workflows/collecte.yml`} target="_blank" rel="noopener noreferrer" className="btn-contour"><Play className="h-4 w-4" /> Lancer une collecte</a>
            <button onClick={() => setEdition({ ...VIDE })} className="btn-primaire"><PlusCircle className="h-4 w-4" /> Ajouter une source</button>
          </>
        }
      />
      <div className="mb-6 flex gap-3 rounded-2xl border border-soleil-300 bg-soleil-50 p-4 text-sm text-soleil-900">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>N'activez une source qu'après avoir vérifié ses conditions d'utilisation : beaucoup de sites interdisent la collecte automatique. Le robot respecte robots.txt, s'identifie comme « WorkersBot », espace ses requêtes, reformule les annonces et renvoie toujours vers l'annonce d'origine.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-carte">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-encre/10 text-xs uppercase tracking-wider text-encre/50">
            <tr><th className="p-4">Source</th><th className="p-4">Type</th><th className="p-4">Publication</th><th className="p-4">Dernière collecte</th><th className="p-4">Active</th><th className="p-4" /></tr>
          </thead>
          <tbody>
            {sources?.map((s) => (
              <tr key={s.id} className="border-b border-encre/[.05]">
                <td className="p-4"><p className="font-semibold">{s.nom}</p><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-foret-700 hover:underline">{s.url.slice(0, 60)} <ExternalLink className="h-3 w-3" /></a>{!s.conditionsVerifiees && <p className="text-xs font-semibold text-terre-600">Conditions non vérifiées</p>}</td>
                <td className="p-4 uppercase text-encre/60">{s.type}</td>
                <td className="p-4">{s.publicationAuto ? "Automatique" : "À valider"}</td>
                <td className="p-4 text-encre/60">{s.derniereCollecte ? <>{ilYa(s.derniereCollecte)}<br />{s.dernierResultat?.erreur ? <span className="text-terre-600">{s.dernierResultat.erreur}</span> : `${s.dernierResultat?.ajoutees ?? 0} ajoutée(s) / ${s.dernierResultat?.trouvees ?? 0}`}</> : "Jamais"}</td>
                <td className="p-4"><button onClick={() => basculer(s)} role="switch" aria-checked={s.actif} className={`relative h-6 w-11 rounded-full transition ${s.actif ? "bg-foret-600" : "bg-encre/20"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${s.actif ? "left-[22px]" : "left-0.5"}`} /></button></td>
                <td className="p-4 text-right"><button onClick={() => setEdition(s)} className="btn-fantome !px-3"><Pencil className="h-4 w-4" /></button><button onClick={async () => { if (window.confirm(`Supprimer la source ${s.nom} ?`)) { await supprimerSource(s); charger(); } }} className="btn-fantome !px-3 text-terre-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {sources && !sources.length && <tr><td colSpan={6} className="p-8 text-center text-encre/50">Aucune source. Ajoutez des pages carrières d'employeurs ou des flux RSS publics.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold">Dernières collectes</h2>
      <div className="space-y-2">
        {runs.map((r) => (
          <details key={r.id} className="rounded-2xl bg-white p-4 shadow-carte">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold">{new Date(r.debut).toLocaleString("fr-FR")}</span>
              <span className="rounded-md bg-foret-100 px-2 py-0.5 text-xs font-bold text-foret-800">{r.ajoutees} ajoutée(s)</span>
              {r.erreurs > 0 && <span className="rounded-md bg-terre-100 px-2 py-0.5 text-xs font-bold text-terre-700">{r.erreurs} erreur(s)</span>}
              <span className="text-encre/50">{r.declencheur}</span>
            </summary>
            <ul className="mt-3 space-y-1 text-sm">
              {r.sources.map((s, i) => <li key={i} className="flex justify-between gap-4"><span>{s.nom}</span><span className={s.erreur ? "text-terre-600" : "text-encre/60"}>{s.erreur ?? `${s.ajoutees} / ${s.trouvees}`}</span></li>)}
            </ul>
          </details>
        ))}
        {!runs.length && <p className="text-sm text-encre/50">Aucune collecte pour l'instant.</p>}
      </div>

      {edition && <FicheSource s={edition} fermer={() => setEdition(null)} apres={() => { setEdition(null); charger(); }} />}
    </>
  );
}

function FicheSource({ s: initial, fermer, apres }: { s: Omit<Source, "id"> & { id?: string }; fermer: () => void; apres: () => void }) {
  const [s, setS] = useState(initial);
  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    await enregistrerSource({ ...s, actif: s.actif && s.conditionsVerifiees });
    apres();
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foret-950/40" onClick={fermer} />
      <form onSubmit={soumettre} className="relative h-full w-full max-w-md space-y-4 overflow-y-auto bg-creme p-6 shadow-flotte">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{s.id ? "Modifier la source" : "Nouvelle source"}</h2><button type="button" onClick={fermer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer"><X className="h-5 w-5" /></button></div>
        <label className="block"><span className="etiquette">Nom</span><input required className="champ" value={s.nom} onChange={(e) => setS({ ...s, nom: e.target.value })} placeholder="ex. Page carrières de l'entreprise X" /></label>
        <label className="block"><span className="etiquette">Adresse de la page des offres (https://)</span><input required type="url" pattern="https://.*" className="champ" value={s.url} onChange={(e) => setS({ ...s, url: e.target.value })} /></label>
        <label className="block"><span className="etiquette">Type</span><select className="champ" value={s.type} onChange={(e) => setS({ ...s, type: e.target.value as Source["type"] })}><option value="page">Page web (liste d'offres)</option><option value="rss">Flux RSS / Atom</option></select></label>
        <label className="block"><span className="etiquette">Nombre maximum d'offres analysées par collecte</span><input type="number" min={1} max={50} className="champ" value={s.maxOffres} onChange={(e) => setS({ ...s, maxOffres: Number(e.target.value) })} /></label>
        <label className="block"><span className="etiquette">Note interne</span><textarea rows={3} className="champ" value={s.note ?? ""} onChange={(e) => setS({ ...s, note: e.target.value })} placeholder="ex. Autorisation obtenue par e-mail le…" /></label>
        <div className="space-y-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-encre/10">
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" checked={s.conditionsVerifiees} onChange={(e) => setS({ ...s, conditionsVerifiees: e.target.checked })} /><span><strong>Conditions d'utilisation vérifiées</strong> : le site autorise la réutilisation de ses offres (ou nous avons son accord).</span></label>
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" checked={s.publicationAuto} onChange={(e) => setS({ ...s, publicationAuto: e.target.checked })} /><span>Publier automatiquement les offres trouvées (sinon elles arrivent « à valider »).</span></label>
          <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" disabled={!s.conditionsVerifiees} checked={s.actif && s.conditionsVerifiees} onChange={(e) => setS({ ...s, actif: e.target.checked })} /><span>Source active</span></label>
        </div>
        <button className="btn-primaire w-full !py-3.5">Enregistrer</button>
      </form>
    </div>
  );
}
