import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellRing, BriefcaseBusiness, Heart, Sparkles, Trash2, UserRound, X } from "lucide-react";
import CarteOffre from "@/components/CarteOffre";
import Vide from "@/components/Vide";
import { offreParSlug, useCatalogue } from "@/data";
import { CONTRATS, SECTEURS, VILLES, type Contrat } from "@/data/taxonomie";
import { actions, STATUTS, useEspace, type Profil, type StatutCandidature } from "@/lib/store";
import { compatibilite } from "@/lib/recherche";
import { dateLongue, ilYa, pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const ONGLETS = [
  { id: "candidatures", label: "Candidatures", icone: BriefcaseBusiness },
  { id: "favoris", label: "Favoris", icone: Heart },
  { id: "alertes", label: "Alertes", icone: BellRing },
  { id: "profil", label: "Mon profil", icone: UserRound },
] as const;

const couleurStatut: Record<StatutCandidature, string> = {
  Envoyée: "bg-sky-100 text-sky-800",
  Relancée: "bg-soleil-100 text-soleil-800",
  Entretien: "bg-violet-100 text-violet-800",
  "Offre reçue": "bg-foret-100 text-foret-800",
  Refusée: "bg-stone-200 text-stone-700",
};

export default function MonEspaceLocal() {
  useSeo("Mon espace");
  const [sp, setSp] = useSearchParams();
  const { offres: OFFRES } = useCatalogue();
  const onglet = sp.get("onglet") ?? "candidatures";
  const { favoris, candidatures, alertes, profil } = {
    favoris: useEspace((e) => e.favoris),
    candidatures: useEspace((e) => e.candidatures),
    alertes: useEspace((e) => e.alertes),
    profil: useEspace((e) => e.profil),
  };
  const compteurs: Record<string, number> = { candidatures: candidatures.length, favoris: favoris.length, alertes: alertes.length };
  const recommandees = profil
    ? OFFRES.map((o) => ({ o, c: compatibilite(o, profil) }))
        .filter((x) => x.c >= 40 && !candidatures.some((c) => c.slug === x.o.slug))
        .sort((a, b) => b.c - a.c)
        .slice(0, 4)
    : [];

  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1 className="mt-2 text-4xl font-bold">{profil?.prenom ? `Bonjour ${profil.prenom} 👋` : "Bienvenue 👋"}</h1>
          <p className="mt-2 text-encre/60">Tout est enregistré dans ce navigateur, sans création de compte.</p>
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl bg-encre/[.05] p-1" role="tablist">
        {ONGLETS.map(({ id, label, icone: I }) => (
          <button
            key={id}
            role="tab"
            aria-selected={onglet === id}
            onClick={() => setSp({ onglet: id })}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${onglet === id ? "bg-white text-encre shadow-carte" : "text-encre/60 hover:text-encre"}`}
          >
            <I className="h-4 w-4" /> {label}
            {compteurs[id] ? <span className="rounded-full bg-terre-500 px-1.5 text-[11px] text-white">{compteurs[id]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {onglet === "candidatures" && (
          <div className="space-y-10">
            {candidatures.length ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {STATUTS.map((s) => (
                    <div key={s} className="carte p-4">
                      <p className="font-display text-3xl font-bold">{candidatures.filter((c) => c.statut === s).length}</p>
                      <p className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold ${couleurStatut[s]}`}>{s}</p>
                    </div>
                  ))}
                </div>
                <div className="carte divide-y divide-encre/[.07]">
                  {candidatures.map((c) => (
                    <div key={c.slug} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        {offreParSlug(c.slug) ? (
                          <Link to={`/offres/${c.slug}`} className="font-semibold hover:text-foret-700">{c.titre}</Link>
                        ) : (
                          <span className="font-semibold">{c.titre} <span className="text-xs text-encre/40">(offre expirée)</span></span>
                        )}
                        <p className="text-sm text-encre/55">{c.entrepriseNom} · {c.ville} · postulé {ilYa(c.date)}</p>
                      </div>
                      <select
                        value={c.statut}
                        onChange={(e) => actions.changerStatut(c.slug, e.target.value as StatutCandidature)}
                        className={`rounded-full border-0 px-3 py-2 text-sm font-bold ${couleurStatut[c.statut]}`}
                        aria-label="Statut de la candidature"
                      >
                        {STATUTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button onClick={() => actions.retirerCandidature(c.slug)} className="grid h-9 w-9 place-items-center rounded-full text-encre/40 hover:bg-terre-50 hover:text-terre-600" aria-label="Retirer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Vide icone={<BriefcaseBusiness className="h-6 w-6" />} titre="Aucune candidature pour l'instant" texte="Quand vous postulez à une offre, elle apparaît ici pour que vous puissiez suivre son avancement." action={<Link to="/offres" className="btn-primaire">Parcourir les offres</Link>} />
            )}
            {recommandees.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="h-5 w-5 text-soleil-500" /> Recommandées pour vous</h2>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {recommandees.map(({ o, c }) => <CarteOffre key={o.slug} offre={o} compat={c} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {onglet === "favoris" &&
          (favoris.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {favoris.map((s) => offreParSlug(s)).filter(Boolean).map((o) => <CarteOffre key={o!.slug} offre={o!} compat={profil ? compatibilite(o!, profil) : null} />)}
            </div>
          ) : (
            <Vide icone={<Heart className="h-6 w-6" />} titre="Pas encore de favoris" texte="Touchez le cœur sur une offre pour la retrouver ici." action={<Link to="/offres" className="btn-primaire">Découvrir les offres</Link>} />
          ))}

        {onglet === "alertes" &&
          (alertes.length ? (
            <div className="space-y-3">
              {alertes.map((a) => {
                const sp = new URLSearchParams();
                if (a.q) sp.set("q", a.q);
                if (a.ville) sp.set("ville", a.ville);
                if (a.contrat) sp.set("contrat", a.contrat);
                const depuis = OFFRES.filter((o) => o.publieeLe > a.creeeLe).length;
                return (
                  <div key={a.id} className="carte flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <BellRing className="h-6 w-6 shrink-0 text-soleil-600" />
                    <div className="flex-1">
                      <p className="font-semibold">{[a.q || "Toutes les offres", a.ville && `à ${a.ville}`, a.contrat && `(${a.contrat.replace(/,/g, ", ")})`].filter(Boolean).join(" ")}</p>
                      <p className="text-sm text-encre/55">Créée le {dateLongue(a.creeeLe)}{depuis ? ` · ${pluriel(depuis, "nouvelle offre", "nouvelles offres")} depuis` : ""}</p>
                    </div>
                    <Link to={`/offres?${sp}&tri=recent`} className="btn-contour">Voir les offres</Link>
                    <button onClick={() => actions.retirerAlerte(a.id)} className="grid h-9 w-9 place-items-center rounded-full text-encre/40 hover:bg-terre-50 hover:text-terre-600" aria-label="Supprimer l'alerte">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <Vide icone={<BellRing className="h-6 w-6" />} titre="Aucune alerte" texte="Lancez une recherche puis cliquez sur « Créer une alerte » pour la retrouver ici en un clic." action={<Link to="/offres" className="btn-primaire">Lancer une recherche</Link>} />
          ))}

        {onglet === "profil" && <FormulaireProfil initial={profil} />}
      </div>

      <div className="mt-16 border-t border-encre/10 pt-6 text-sm">
        <button
          onClick={() => {
            if (window.confirm("Effacer définitivement votre profil, vos favoris, alertes et candidatures enregistrés dans ce navigateur ?")) actions.toutEffacer();
          }}
          className="font-semibold text-terre-600 hover:underline"
        >
          Effacer toutes mes données
        </button>
      </div>
    </div>
  );
}

function FormulaireProfil({ initial }: { initial: Profil | null }) {
  const { offres: OFFRES } = useCatalogue();
  const [p, setP] = useState<Profil>(initial ?? { prenom: "", metier: "", ville: "", competences: [], contrats: [], secteurs: [] });
  const [saisie, setSaisie] = useState("");
  const [ok, setOk] = useState(false);

  const ajouter = () => {
    const nouvelles = saisie.split(",").map((s) => s.trim()).filter((s) => s && !p.competences.includes(s));
    if (nouvelles.length) setP({ ...p, competences: [...p.competences, ...nouvelles] });
    setSaisie("");
  };
  const touche = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      ajouter();
    }
  };
  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    actions.enregistrerProfil(p);
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  };
  const toutesComps = [...new Set(OFFRES.flatMap((o) => o.competences))].sort();
  const suggestions = toutesComps.filter((c) => !p.competences.includes(c) && (!saisie || c.toLowerCase().includes(saisie.toLowerCase()))).slice(0, 10);

  return (
    <form onSubmit={soumettre} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="carte space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="etiquette">Prénom</span>
            <input className="champ" value={p.prenom} onChange={(e) => setP({ ...p, prenom: e.target.value })} />
          </label>
          <label>
            <span className="etiquette">Ville</span>
            <select className="champ" value={p.ville} onChange={(e) => setP({ ...p, ville: e.target.value })}>
              <option value="">— Choisir —</option>
              {VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="etiquette">Métier recherché</span>
          <input className="champ" placeholder="ex. Développeur web, Comptable, Infirmier…" value={p.metier} onChange={(e) => setP({ ...p, metier: e.target.value })} />
        </label>
        <div>
          <span className="etiquette">Compétences</span>
          <div className="champ flex min-h-[52px] flex-wrap items-center gap-2 !py-2">
            {p.competences.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-foret-700 py-1 pl-3 pr-1.5 text-sm font-medium text-creme">
                {c}
                <button type="button" onClick={() => setP({ ...p, competences: p.competences.filter((x) => x !== c) })} className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/20" aria-label={`Retirer ${c}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input value={saisie} onChange={(e) => setSaisie(e.target.value)} onKeyDown={touche} onBlur={ajouter} placeholder={p.competences.length ? "" : "Tapez puis Entrée"} className="min-w-[140px] flex-1 bg-transparent py-1 focus:outline-none" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button type="button" key={s} onClick={() => setP({ ...p, competences: [...p.competences, s] })} className="rounded-full border border-dashed border-encre/20 px-2.5 py-1 text-xs text-encre/70 hover:border-foret-500 hover:text-foret-700">
                + {s}
              </button>
            ))}
          </div>
        </div>
        <fieldset>
          <legend className="etiquette">Contrats souhaités</legend>
          <div className="flex flex-wrap gap-2">
            {CONTRATS.map((c) => {
              const actif = p.contrats.includes(c);
              return (
                <button type="button" key={c} aria-pressed={actif} onClick={() => setP({ ...p, contrats: actif ? p.contrats.filter((x) => x !== c) : [...p.contrats, c as Contrat] })} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${actif ? "border-foret-700 bg-foret-800 text-creme" : "border-encre/15 bg-white hover:border-encre/40"}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="etiquette">Secteurs qui vous intéressent</legend>
          <div className="flex flex-wrap gap-2">
            {SECTEURS.map((s) => {
              const actif = p.secteurs.includes(s.id);
              return (
                <button type="button" key={s.id} aria-pressed={actif} onClick={() => setP({ ...p, secteurs: actif ? p.secteurs.filter((x) => x !== s.id) : [...p.secteurs, s.id] })} className={`rounded-full border px-3.5 py-2 text-sm transition ${actif ? "border-foret-700 bg-foret-800 text-creme" : "border-encre/15 bg-white hover:border-encre/40"}`}>
                  {s.emoji} {s.nom}
                </button>
              );
            })}
          </div>
        </fieldset>
        <button type="submit" className="btn-primaire !px-8 !py-3.5">{ok ? "✓ Profil enregistré" : "Enregistrer mon profil"}</button>
      </div>
      <aside className="h-fit rounded-3xl bg-foret-900 p-7 text-creme">
        <Sparkles className="h-7 w-7 text-soleil-400" />
        <h3 className="mt-4 text-xl font-bold">Comment est calculé mon score ?</h3>
        <ul className="mt-4 space-y-2 text-sm text-creme/75">
          <li><strong className="text-creme">50 pts</strong> · compétences en commun</li>
          <li><strong className="text-creme">20 pts</strong> · métier proche du titre de l'offre</li>
          <li><strong className="text-creme">15 pts</strong> · même ville (ou télétravail)</li>
          <li><strong className="text-creme">10 pts</strong> · type de contrat souhaité</li>
          <li><strong className="text-creme">5 pts</strong> · secteur d'intérêt</li>
        </ul>
        <p className="mt-5 text-xs text-creme/50">Le calcul se fait dans votre navigateur. Rien n'est envoyé sur Internet.</p>
      </aside>
    </form>
  );
}
