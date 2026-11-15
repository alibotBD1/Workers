import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Info, TrendingUp } from "lucide-react";
import { OFFRES } from "@/data";
import { NIVEAUX, SECTEURS, VILLES } from "@/data/taxonomie";
import type { Offre } from "@/data/types";
import { fcfa, kfcfa, pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const milieu = (o: Offre) => ((o.salaireMin ?? 0) + (o.salaireMax ?? o.salaireMin ?? 0)) / 2;
const mediane = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export default function Salaires() {
  useSeo("Baromètre des salaires au Cameroun", "Salaires médians par secteur, ville et niveau d'expérience, calculés à partir des offres publiées.");
  const avecSalaire = OFFRES.filter((o) => o.salaireMin);
  const [secteur, setSecteur] = useState("tech");
  const [niveau, setNiveau] = useState("");
  const [montant, setMontant] = useState(500000);

  const parSecteur = useMemo(
    () =>
      SECTEURS.map((s) => {
        const xs = avecSalaire.filter((o) => o.secteur === s.id).map(milieu);
        return { ...s, med: mediane(xs), n: xs.length, min: Math.min(...xs), max: Math.max(...xs) };
      })
        .filter((s) => s.n)
        .sort((a, b) => b.med - a.med),
    [avecSalaire],
  );
  const parNiveau = NIVEAUX.map((n) => ({ n, med: mediane(avecSalaire.filter((o) => o.niveau === n).map(milieu)) })).filter((x) => x.med > 0);
  const parVille = VILLES.map((v) => {
    const xs = avecSalaire.filter((o) => o.ville === v.nom).map(milieu);
    return { nom: v.nom, med: mediane(xs), n: xs.length };
  })
    .filter((v) => v.n >= 2)
    .sort((a, b) => b.med - a.med);
  const maxSecteur = Math.max(...parSecteur.map((s) => s.max));

  const echantillon = avecSalaire.filter((o) => o.secteur === secteur && (!niveau || o.niveau === niveau)).map(milieu);
  const rang = echantillon.length ? Math.round((echantillon.filter((x) => x <= montant).length / echantillon.length) * 100) : null;

  return (
    <div className="container py-12">
      <p className="surtitre">Baromètre</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">Combien gagne-t-on au Cameroun ?</h1>
      <p className="mt-3 max-w-2xl text-lg text-encre/60">
        Salaires bruts mensuels médians, calculés en temps réel à partir des {pluriel(avecSalaire.length, "offre")} qui affichent une rémunération.
      </p>

      {/* Calculateur */}
      <section className="mt-10 overflow-hidden rounded-[2rem] bg-foret-900 text-creme">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold">Où vous situez-vous ?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-semibold text-creme/70">Secteur</span>
                <select value={secteur} onChange={(e) => setSecteur(e.target.value)} className="champ text-encre">
                  {SECTEURS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-semibold text-creme/70">Expérience</span>
                <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className="champ text-encre">
                  <option value="">Tous niveaux</option>
                  {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-semibold text-creme/70">Votre salaire brut mensuel : <strong className="text-soleil-300">{fcfa(montant)}</strong></span>
              <input type="range" min={50000} max={2000000} step={25000} value={montant} onChange={(e) => setMontant(Number(e.target.value))} className="w-full accent-soleil-400" />
            </label>
          </div>
          <div className="rounded-3xl bg-creme/5 p-8 text-center ring-1 ring-creme/10">
            {rang == null ? (
              <p className="text-creme/70">Pas encore assez d'offres pour ce profil.</p>
            ) : (
              <>
                <p className="font-display text-7xl font-bold text-soleil-400">{rang}<span className="text-4xl">%</span></p>
                <p className="mt-3 text-lg">des offres comparables proposent <strong>autant ou moins</strong> que vous.</p>
                <p className="mt-2 text-sm text-creme/55">Médiane du segment : {fcfa(Math.round(mediane(echantillon) / 1000) * 1000)} · {pluriel(echantillon.length, "offre")}</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Par secteur */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Par secteur</h2>
        <div className="mt-6 space-y-3">
          {parSecteur.map((s) => (
            <Link key={s.id} to={`/offres?secteur=${s.id}&tri=salaire`} className="group grid items-center gap-2 sm:grid-cols-[220px_1fr_110px]">
              <span className="font-medium group-hover:text-foret-700">{s.emoji} {s.nom}</span>
              <span className="relative h-9 rounded-full bg-encre/[.05]">
                <span className="absolute inset-y-0 rounded-full bg-foret-200" style={{ left: `${(s.min / maxSecteur) * 100}%`, width: `${((s.max - s.min) / maxSecteur) * 100}%` }} />
                <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-foret-700 shadow" style={{ left: `${(s.med / maxSecteur) * 100}%` }} />
              </span>
              <span className="text-right font-display font-bold tabular-nums">{kfcfa(s.med)} <span className="text-xs font-normal text-encre/50">FCFA</span></span>
            </Link>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-encre/50">
          <span className="inline-block h-3 w-6 rounded-full bg-foret-200" /> fourchette observée
          <span className="ml-3 inline-block h-3 w-3 rounded-full bg-foret-700" /> médiane
        </p>
      </section>

      <div className="mt-16 grid items-start gap-8 lg:grid-cols-2">
        <section className="carte p-7">
          <h2 className="flex items-center gap-2 text-xl font-bold"><TrendingUp className="h-5 w-5 text-terre-500" /> Selon l'expérience</h2>
          <div className="mt-6 flex h-56 items-end gap-4">
            {parNiveau.map(({ n, med }) => {
              const max = Math.max(...parNiveau.map((x) => x.med)) || 1;
              return (
                <div key={n} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-bold tabular-nums">{med ? kfcfa(med) : "—"}</span>
                  <span className="w-full rounded-t-xl bg-gradient-to-t from-terre-500 to-soleil-400" style={{ height: `${(med / max) * 160}px` }} />
                  <span className="text-xs font-medium text-encre/60">{n}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="carte p-7">
          <h2 className="text-xl font-bold">Selon la ville</h2>
          <ul className="mt-5 divide-y divide-encre/[.07]">
            {parVille.map((v, i) => (
              <li key={v.nom} className="flex items-center gap-3 py-3">
                <span className="w-6 text-sm font-bold text-encre/35">{i + 1}</span>
                <Link to={`/offres?ville=${encodeURIComponent(v.nom)}`} className="font-medium hover:text-foret-700">{v.nom}</Link>
                <span className="text-xs text-encre/40">{pluriel(v.n, "offre")}</span>
                <span className="ml-auto font-display font-bold tabular-nums">{kfcfa(v.med)} FCFA</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-10 flex items-start gap-2 text-sm text-encre/50">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Chiffres indicatifs, calculés à partir du milieu de la fourchette affichée dans chaque offre. Ils ne remplacent pas une étude de rémunération.
      </p>
    </div>
  );
}
