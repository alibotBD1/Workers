import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BellRing, Gauge, Heart, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import BarreRecherche from "@/components/BarreRecherche";
import CarteOffre from "@/components/CarteOffre";
import Monogramme from "@/components/Monogramme";
import Motif from "@/components/Motif";
import AnneauCompat from "@/components/AnneauCompat";
import { ENTREPRISES, OFFRES, offresDe } from "@/data";
import { ARTICLES } from "@/data/articles";
import { SECTEURS, VILLES } from "@/data/taxonomie";
import { compatibilite } from "@/lib/recherche";
import { useEspace } from "@/lib/store";
import { fourchette, pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const POPULAIRES = ["Développeur", "Comptable", "Stage", "Infirmier", "Commercial", "Bilingue"];

export default function Accueil() {
  useSeo("");
  const profil = useEspace((e) => e.profil);
  const recentes = OFFRES.slice(0, 6);
  const parVille = VILLES.map((v) => ({ ...v, n: OFFRES.filter((o) => o.ville === v.nom).length })).filter((v) => v.n > 0);
  const parSecteur = SECTEURS.map((s) => ({ ...s, n: OFFRES.filter((o) => o.secteur === s.id).length }));
  const vitrine = OFFRES.filter((o) => o.salaireMin).slice(0, 3);
  const recruteurs = [...ENTREPRISES].sort((a, b) => offresDe(b.slug).length - offresDe(a.slug).length).slice(0, 8);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-foret-900 text-creme">
        <Motif className="pointer-events-none absolute inset-0 text-soleil-200" opacite={0.09} />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-soleil-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 h-[420px] w-[420px] rounded-full bg-terre-500/20 blur-3xl" />
        <div className="container relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.15fr_.85fr] lg:pb-28 lg:pt-20">
          <div className="animate-monte">
            <span className="inline-flex items-center gap-2 rounded-full border border-creme/15 bg-creme/5 px-3 py-1.5 text-sm text-creme/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-soleil-400" />
              {pluriel(OFFRES.length, "offre en ligne", "offres en ligne")} · 10 régions
            </span>
            <h1 className="texte-equilibre mt-6 text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
              Le job qui vous ressemble, <span className="relative whitespace-nowrap text-soleil-400">de Douala<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 50 2, 150 2, 198 8" stroke="#fbb924" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span> à Maroua.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-creme/70">
              CDI, stages, alternance, missions : des offres claires, avec le salaire affiché, et un score de compatibilité calculé à partir de votre profil.
            </p>
            <div className="mt-9 max-w-2xl text-encre">
              <BarreRecherche />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-creme/50">Populaire :</span>
              {POPULAIRES.map((p) => (
                <Link key={p} to={`/offres?q=${encodeURIComponent(p)}`} className="rounded-full border border-creme/15 px-3 py-1 text-creme/80 transition hover:border-soleil-400 hover:text-soleil-300">
                  {p}
                </Link>
              ))}
            </div>
          </div>

          {/* Pile de cartes décorative */}
          <div className="relative hidden h-[440px] lg:block" aria-hidden="true">
            {vitrine.map((o, i) => (
              <div key={o.slug} className="absolute w-[340px]" style={{ top: `${i * 128 + 10}px`, left: `${[40, 0, 70][i]}px`, transform: `rotate(${[-4, 2.5, -1.5][i]}deg)` }}>
              <div
                className="rounded-2xl bg-white p-5 text-encre shadow-flotte"
                style={{ animation: `monte .6s ${0.15 + i * 0.12}s cubic-bezier(.2,.7,.2,1) both` }}
              >
                <div className="flex items-start gap-3">
                  <Monogramme slug={o.entreprise} nom={o.entrepriseNom} taille="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold">{o.titre}</p>
                    <p className="text-sm text-encre/55">{o.entrepriseNom} · {o.ville}</p>
                  </div>
                  <AnneauCompat valeur={[92, 78, 64][i]} taille={40} />
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="rounded-md bg-foret-100 px-2 py-0.5 font-bold text-foret-800">{o.contrat}</span>
                  <span className="rounded-md bg-soleil-100 px-2 py-0.5 font-bold text-soleil-800">{fourchette(o.salaireMin, o.salaireMax)}</span>
                </div>
              </div>
              </div>
            ))}
            <div className="absolute bottom-2 right-0 flex items-center gap-3 rounded-2xl bg-soleil-400 px-4 py-3 text-encre shadow-flotte">
              <Heart className="h-5 w-5 fill-terre-500 text-terre-500" />
              <span className="text-sm font-semibold">Sauvegardez, postulez, suivez.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VILLES (bandeau défilant) ---------- */}
      <section className="border-b border-encre/10 bg-white py-5">
        <div className="masque-defile overflow-hidden">
          <div className="flex w-max animate-defile gap-3 hover:[animation-play-state:paused]">
            {[...parVille, ...parVille].map((v, i) => (
              <Link key={i} to={`/offres?ville=${encodeURIComponent(v.nom)}`} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-encre/10 px-4 py-2 text-sm transition hover:border-foret-400 hover:bg-foret-50">
                <MapPin className="h-4 w-4 text-terre-500" />
                <span className="font-semibold">{v.nom}</span>
                <span className="text-encre/45">{v.n}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SECTEURS ---------- */}
      <section className="container py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="surtitre">Explorer</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Trouvez par secteur</h2>
          </div>
          <Link to="/offres" className="btn-contour">
            Toutes les offres <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {parSecteur.map((s) => (
            <Link key={s.id} to={`/offres?secteur=${s.id}`} className="group carte flex items-center gap-3 p-3.5 transition hover:border-foret-300 hover:bg-foret-50/50 sm:gap-4 sm:p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-creme text-xl transition group-hover:scale-110 group-hover:-rotate-6 sm:h-12 sm:w-12 sm:text-2xl">{s.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight sm:text-base">{s.nom}</span>
                <span className="text-sm text-encre/50">{pluriel(s.n, "offre")}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- OFFRES RÉCENTES ---------- */}
      <section className="bg-white/60 py-20">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="surtitre">Fraîchement publiées</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Les dernières offres</h2>
            </div>
            <Link to="/offres?tri=recent" className="lien">
              Voir tout
            </Link>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {recentes.map((o) => (
              <CarteOffre key={o.slug} offre={o} compat={profil ? compatibilite(o, profil) : null} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FONCTIONNALITÉS ---------- */}
      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="surtitre">Pensé pour vous</p>
            <h2 className="texte-equilibre mt-2 text-3xl font-bold sm:text-5xl">Moins de recherche, plus d'entretiens.</h2>
            <p className="mt-5 text-lg text-encre/65">
              Créez votre profil en une minute. Melanyne Work calcule votre compatibilité avec chaque offre, directement dans votre navigateur : vos données restent chez vous.
            </p>
            <Link to="/mon-espace?onglet=profil" className="btn-primaire mt-8">
              <Sparkles className="h-4 w-4" /> {profil ? "Mettre à jour mon profil" : "Créer mon profil"}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { i: Gauge, t: "Score de compatibilité", d: "Compétences, ville, contrat : voyez en un coup d'œil les offres faites pour vous.", c: "bg-foret-100 text-foret-700" },
              { i: BellRing, t: "Alertes emploi", d: "Enregistrez vos recherches et retrouvez les nouvelles offres en un clic.", c: "bg-soleil-100 text-soleil-700" },
              { i: Heart, t: "Suivi des candidatures", d: "Envoyée, entretien, offre reçue : votre tableau de bord personnel.", c: "bg-terre-100 text-terre-600" },
              { i: ShieldCheck, t: "Salaires affichés", d: "Des fourchettes en FCFA, et un baromètre pour savoir où vous en êtes.", c: "bg-sky-100 text-sky-700" },
            ].map(({ i: Icone, t, d, c }, k) => (
              <div key={t} className={`carte p-6 ${k % 2 ? "sm:translate-y-6" : ""}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${c}`}>
                  <Icone className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-1.5 text-encre/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ENTREPRISES ---------- */}
      {recruteurs.length > 0 && (
        <section className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold">Ils recrutent en ce moment</h2>
            <Link to="/entreprises" className="lien">
              Toutes les entreprises
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {recruteurs.map((e) => (
              <Link key={e.slug} to={`/entreprises/${e.slug}`} className="carte group flex items-center gap-3 p-4 transition hover:border-foret-300">
                <Monogramme slug={e.slug} nom={e.nom} taille="sm" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold group-hover:text-foret-700">{e.nom}</span>
                  <span className="text-sm text-encre/50">{pluriel(offresDe(e.slug).length, "offre")}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- CONSEILS ---------- */}
      <section className="container py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="surtitre">Conseils carrière</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Mettez toutes les chances de votre côté</h2>
          </div>
          <Link to="/conseils" className="lien">
            Tous les conseils
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link key={a.slug} to={`/conseils/${a.slug}`} className="group carte overflow-hidden transition hover:-translate-y-1 hover:shadow-flotte">
              <div className="relative h-36 overflow-hidden" style={{ background: a.couleur }}>
                <Motif className="absolute inset-0 text-white" opacite={0.25} id={`m-${a.slug}`} />
                <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold">{a.categorie}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold leading-snug group-hover:text-foret-700">{a.titre}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-encre/60">{a.chapo}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foret-700">
                  Lire · {a.minutes} min <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- RECRUTEURS ---------- */}
      <section className="container">
        <div className="relative overflow-hidden rounded-[2rem] bg-soleil-400 px-8 py-14 sm:px-14">
          <Motif className="pointer-events-none absolute inset-0 text-foret-900" opacite={0.1} id="ndop-cta" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="texte-equilibre text-3xl font-bold sm:text-5xl">Vous recrutez ? Publiez votre offre gratuitement.</h2>
              <p className="mt-4 text-lg text-encre/75">Remplissez le formulaire, notre équipe vérifie l'annonce puis la met en ligne. Simple, rapide et sans frais.</p>
            </div>
            <Link to="/recruteurs" className="btn-primaire !px-8 !py-4 !text-base">
              Publier une offre <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
