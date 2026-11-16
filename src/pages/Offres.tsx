import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellPlus, Check, ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import BarreRecherche from "@/components/BarreRecherche";
import CarteOffre from "@/components/CarteOffre";
import Vide from "@/components/Vide";
import { useCatalogue } from "@/data";
import { CONTRATS, NIVEAUX, SECTEURS, TELETRAVAIL, secteurNom } from "@/data/taxonomie";
import { FILTRES_VIDES, filtresDepuisUrl, filtresVersUrl, rechercher, type Filtres } from "@/lib/recherche";
import { actions, useEspace } from "@/lib/store";
import { pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const PAR_PAGE = 20;

export default function Offres() {
  const [sp, setSp] = useSearchParams();
  const { offres: OFFRES } = useCatalogue();
  const f = useMemo(() => filtresDepuisUrl(sp), [sp]);
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const profil = useEspace((e) => e.profil);
  const alertes = useEspace((e) => e.alertes);
  const [tiroir, setTiroir] = useState(false);

  const titre = [f.q || "Offres d'emploi", f.ville && `à ${f.ville}`].filter(Boolean).join(" ");
  useSeo(titre, `${titre} au Cameroun : CDI, CDD, stages et alternance sur Workers.`);

  const resultats = useMemo(() => rechercher(OFFRES, f, profil), [OFFRES, f, profil]);
  const pages = Math.max(1, Math.ceil(resultats.length / PAR_PAGE));
  const visibles = resultats.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  const maj = (patch: Partial<Filtres>) => {
    const n = filtresVersUrl({ ...f, ...patch });
    setSp(n, { replace: false });
  };
  const allerPage = (p: number) => {
    const n = filtresVersUrl(f);
    if (p > 1) n.set("page", String(p));
    setSp(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const basculer = (cle: "contrats" | "secteurs" | "niveaux" | "teletravail", v: string) =>
    maj({ [cle]: f[cle].includes(v) ? f[cle].filter((x) => x !== v) : [...f[cle], v] });

  const actifs: { label: string; retirer: () => void }[] = [
    ...(f.q ? [{ label: `« ${f.q} »`, retirer: () => maj({ q: "" }) }] : []),
    ...(f.ville ? [{ label: f.ville, retirer: () => maj({ ville: "" }) }] : []),
    ...f.contrats.map((c) => ({ label: c, retirer: () => basculer("contrats", c) })),
    ...f.secteurs.map((s) => ({ label: secteurNom(s), retirer: () => basculer("secteurs", s) })),
    ...f.niveaux.map((n) => ({ label: n, retirer: () => basculer("niveaux", n) })),
    ...f.teletravail.map((t) => ({ label: t, retirer: () => basculer("teletravail", t) })),
    ...(f.salaireMin ? [{ label: `≥ ${f.salaireMin / 1000}k FCFA`, retirer: () => maj({ salaireMin: 0 }) }] : []),
    ...(f.depuis ? [{ label: `< ${f.depuis} j`, retirer: () => maj({ depuis: 0 }) }] : []),
  ];

  const alerteExiste = alertes.some((a) => a.q === f.q && a.ville === f.ville && a.contrat === f.contrats.join(","));

  const panneau = (
    <div className="space-y-7">
      <Groupe titre="Type de contrat">
        {CONTRATS.map((c) => (
          <Case key={c} label={c} n={OFFRES.filter((o) => o.contrat === c).length} actif={f.contrats.includes(c)} onClick={() => basculer("contrats", c)} />
        ))}
      </Groupe>
      <Groupe titre="Publiée depuis">
        <div className="flex flex-wrap gap-2">
          {[
            [0, "Peu importe"],
            [1, "24 h"],
            [7, "7 jours"],
            [30, "30 jours"],
          ].map(([v, l]) => (
            <button key={v} onClick={() => maj({ depuis: v as number })} className={`rounded-full border px-3 py-1.5 text-sm transition ${f.depuis === v ? "border-foret-700 bg-foret-800 text-creme" : "border-encre/15 hover:border-encre/40"}`}>
              {l}
            </button>
          ))}
        </div>
      </Groupe>
      <Groupe titre="Salaire minimum (brut / mois)">
        <input
          type="range"
          min={0}
          max={1500000}
          step={50000}
          value={f.salaireMin}
          onChange={(e) => maj({ salaireMin: Number(e.target.value) })}
          className="w-full accent-foret-700"
          aria-label="Salaire minimum"
        />
        <p className="mt-1 text-sm font-semibold">{f.salaireMin ? `${new Intl.NumberFormat("fr-FR").format(f.salaireMin)} FCFA` : "Tous les salaires"}</p>
      </Groupe>
      <Groupe titre="Télétravail">
        {TELETRAVAIL.map((t) => (
          <Case key={t} label={t} actif={f.teletravail.includes(t)} onClick={() => basculer("teletravail", t)} />
        ))}
      </Groupe>
      <Groupe titre="Expérience">
        {NIVEAUX.map((n) => (
          <Case key={n} label={n} actif={f.niveaux.includes(n)} onClick={() => basculer("niveaux", n)} />
        ))}
      </Groupe>
      <Groupe titre="Secteur">
        {SECTEURS.map((s) => (
          <Case key={s.id} label={`${s.emoji} ${s.nom}`} n={OFFRES.filter((o) => o.secteur === s.id).length} actif={f.secteurs.includes(s.id)} onClick={() => basculer("secteurs", s.id)} />
        ))}
      </Groupe>
    </div>
  );

  return (
    <div>
      <div className="border-b border-encre/10 bg-white/70">
        <div className="container py-6">
          <BarreRecherche key={`${f.q}|${f.ville}`} initQ={f.q} initVille={f.ville} variante="compacte" />
        </div>
      </div>

      <div className="container grid gap-8 py-8 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtres</h2>
              {actifs.length > 0 && (
                <button onClick={() => setSp(filtresVersUrl(FILTRES_VIDES))} className="text-sm font-semibold text-terre-600 hover:underline">
                  Tout effacer
                </button>
              )}
            </div>
            {panneau}
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{titre}</h1>
              <p className="mt-1 text-encre/60">{pluriel(resultats.length, "offre trouvée", "offres trouvées")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTiroir(true)} className="btn-contour lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filtres{actifs.length ? ` (${actifs.length})` : ""}
              </button>
              <select value={f.tri} onChange={(e) => maj({ tri: e.target.value as Filtres["tri"] })} className="champ !w-auto !rounded-full !py-2.5 text-sm font-medium" aria-label="Trier par">
                <option value="pertinence">Pertinence</option>
                <option value="recent">Plus récentes</option>
                <option value="salaire">Salaire</option>
                {profil && <option value="compatibilite">Compatibilité</option>}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {actifs.map((a) => (
              <button key={a.label} onClick={a.retirer} className="inline-flex items-center gap-1.5 rounded-full bg-foret-800 px-3 py-1.5 text-sm font-medium text-creme hover:bg-foret-700">
                {a.label} <X className="h-3.5 w-3.5" />
              </button>
            ))}
            {(f.q || f.ville || f.contrats.length > 0) && (
              <button
                disabled={alerteExiste}
                onClick={() => actions.ajouterAlerte({ q: f.q, ville: f.ville, contrat: f.contrats.join(",") })}
                className="inline-flex items-center gap-1.5 rounded-full border border-soleil-500 bg-soleil-50 px-3 py-1.5 text-sm font-semibold text-soleil-800 hover:bg-soleil-100 disabled:opacity-70"
              >
                {alerteExiste ? <Check className="h-4 w-4" /> : <BellPlus className="h-4 w-4" />}
                {alerteExiste ? "Alerte enregistrée" : "Créer une alerte"}
              </button>
            )}
          </div>

          {!profil && resultats.length > 0 && (
            <Link to="/mon-espace?onglet=profil" className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-foret-400 bg-foret-50 px-5 py-4 text-sm hover:bg-foret-100">
              <span>
                <strong className="text-foret-800">Astuce :</strong> créez votre profil pour afficher votre score de compatibilité sur chaque offre.
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-foret-700" />
            </Link>
          )}

          <div className="mt-6 space-y-3">
            {visibles.length ? (
              visibles.map(({ offre, compat }) => <CarteOffre key={offre.slug} offre={offre} compat={compat} />)
            ) : (
              <Vide
                icone={<SearchX className="h-6 w-6" />}
                titre="Aucune offre ne correspond"
                texte="Essayez d'élargir votre recherche : retirez un filtre, changez de ville ou utilisez un terme plus général."
                action={
                  <button onClick={() => setSp(new URLSearchParams())} className="btn-primaire">
                    Réinitialiser la recherche
                  </button>
                }
              />
            )}
          </div>

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <button disabled={page <= 1} onClick={() => allerPage(page - 1)} className="btn-contour !px-3" aria-label="Page précédente">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => allerPage(p)} aria-current={p === page ? "page" : undefined} className={`h-10 w-10 rounded-full text-sm font-semibold ${p === page ? "bg-foret-800 text-creme" : "hover:bg-encre/5"}`}>
                  {p}
                </button>
              ))}
              <button disabled={page >= pages} onClick={() => allerPage(page + 1)} className="btn-contour !px-3" aria-label="Page suivante">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Tiroir de filtres mobile */}
      {tiroir && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0 bg-foret-950/50" onClick={() => setTiroir(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-monte overflow-y-auto rounded-t-3xl bg-creme p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filtres</h2>
              <button onClick={() => setTiroir(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer">
                <X />
              </button>
            </div>
            {panneau}
            <button onClick={() => setTiroir(false)} className="btn-primaire sticky bottom-0 mt-8 w-full !py-4">
              Voir {pluriel(resultats.length, "offre")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-widest text-encre/50">{titre}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function Case({ label, n, actif, onClick }: { label: string; n?: number; actif: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={actif} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[15px] hover:bg-encre/[.04]">
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${actif ? "border-foret-700 bg-foret-700 text-white" : "border-encre/25 bg-white"}`}>
        {actif && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {n != null && <span className="text-xs text-encre/40">{n}</span>}
    </button>
  );
}
