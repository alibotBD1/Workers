import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { indicateurs, inscriptionsParJour } from "@/lib/admin";
import { fcfa } from "@/lib/format";
import { EnTete, Kpi } from "./Admin";

type Ind = Awaited<ReturnType<typeof indicateurs>>;
type Insc = Awaited<ReturnType<typeof inscriptionsParJour>>;

export default function Tableau() {
  const [ind, setInd] = useState<Ind | null>(null);
  const [insc, setInsc] = useState<Insc | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    indicateurs().then(setInd).catch((e) => setErreur(String(e?.message ?? e)));
    inscriptionsParJour(30).then(setInsc).catch(() => {});
  }, []);

  const jours = insc ? Object.entries(insc.parJour) : [];
  const max = Math.max(1, ...jours.map(([, v]) => v.candidat + v.recruteur));
  const sources = insc ? Object.entries(insc.sources).sort((a, b) => b[1] - a[1]).slice(0, 8) : [];
  const totalSources = sources.reduce((s, [, n]) => s + n, 0) || 1;

  return (
    <>
      <EnTete titre="Tableau de bord" sousTitre="Vue d'ensemble de l'activité de Workers." />
      {erreur && <p className="mb-6 rounded-xl bg-terre-50 p-4 text-sm text-terre-800">Impossible de charger les indicateurs : {erreur}. Vérifiez les index Firestore (voir le README).</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi v={ind?.candidats ?? "…"} l="candidats inscrits" />
        <Kpi v={ind?.recruteurs ?? "…"} l="recruteurs inscrits" />
        <Kpi v={ind?.marketing ?? "…"} l="contacts marketing (consentement)" />
        <Kpi v={ind ? fcfa(ind.caMois) : "…"} l="chiffre d'affaires du mois" accent />
        <Kpi v={ind?.offresEnLigne ?? "…"} l="offres en ligne" />
        <Link to="/admin/offres?statut=en_attente" className="block"><Kpi v={ind?.aValider ?? "…"} l="offres à valider →" /></Link>
        <Kpi v={ind?.collectees ?? "…"} l="offres issues de la collecte IA" />
        <Kpi v={ind?.cands30 ?? "…"} l="candidatures (30 jours)" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-carte">
          <h2 className="text-lg font-semibold">Inscriptions — 30 derniers jours</h2>
          <div className="mt-6 flex h-48 items-end gap-1">
            {jours.map(([j, v]) => (
              <div key={j} className="group relative flex flex-1 flex-col justify-end" title={`${j} : ${v.candidat} candidats, ${v.recruteur} recruteurs`}>
                <div className="rounded-t bg-soleil-400" style={{ height: `${(v.recruteur / max) * 180}px` }} />
                <div className="bg-foret-600" style={{ height: `${(v.candidat / max) * 180}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-5 text-xs text-encre/60">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-foret-600" /> Candidats</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-soleil-400" /> Recruteurs</span>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-carte">
          <h2 className="text-lg font-semibold">Provenance des inscrits</h2>
          <p className="text-xs text-encre/50">Paramètre utm_source ou site référent, 30 jours</p>
          <ul className="mt-4 space-y-3">
            {sources.map(([s, n]) => (
              <li key={s}>
                <div className="flex justify-between text-sm"><span className="truncate font-medium">{s}</span><span className="tabular-nums text-encre/60">{n}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-encre/10"><div className="h-1.5 rounded-full bg-terre-500" style={{ width: `${(n / totalSources) * 100}%` }} /></div>
              </li>
            ))}
            {!sources.length && <li className="text-sm text-encre/50">Pas encore de données.</li>}
          </ul>
          <p className="mt-6 text-xs text-encre/50">Le trafic détaillé (pages vues, appareils, pays) est dans Google Analytics, pour les visiteurs ayant accepté les statistiques.</p>
        </section>
      </div>
    </>
  );
}
