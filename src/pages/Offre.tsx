import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Copy,
  GraduationCap,
  Laptop,
  MapPin,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { entrepriseParSlug, offreParSlug, OFFRES } from "@/data";
import { secteurEmoji, secteurNom } from "@/data/taxonomie";
import Monogramme from "@/components/Monogramme";
import BoutonFavori from "@/components/BoutonFavori";
import CarteOffre from "@/components/CarteOffre";
import AnneauCompat from "@/components/AnneauCompat";
import DialogueCandidature from "@/components/DialogueCandidature";
import Introuvable from "./Introuvable";
import { compatibilite } from "@/lib/recherche";
import { useEspace } from "@/lib/store";
import { dateLongue, fcfa, ilYa } from "@/lib/format";
import useSeo from "@/lib/useSeo";

function IconeWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

export default function Offre() {
  const { slug = "" } = useParams();
  const offre = offreParSlug(slug);
  const profil = useEspace((e) => e.profil);
  const candidatures = useEspace((e) => e.candidatures);
  const [dialogue, setDialogue] = useState(false);
  const [copie, setCopie] = useState(false);

  useSeo(offre ? `${offre.titre} — ${offre.entrepriseNom}, ${offre.ville}` : "Offre introuvable", offre?.resume);

  // Données structurées JobPosting (Google for Jobs) — seulement pour les vraies offres
  useEffect(() => {
    if (!offre || offre.demo) return;
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: offre.titre,
      description: [offre.resume, ...offre.missions, ...offre.profil].join("\n"),
      datePosted: offre.publieeLe,
      validThrough: offre.expireLe,
      employmentType: { CDI: "FULL_TIME", CDD: "TEMPORARY", Stage: "INTERN", Alternance: "INTERN", Freelance: "CONTRACTOR", Intérim: "TEMPORARY" }[offre.contrat],
      hiringOrganization: { "@type": "Organization", name: offre.entrepriseNom },
      jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: offre.ville, addressCountry: "CM" } },
      ...(offre.salaireMin && { baseSalary: { "@type": "MonetaryAmount", currency: "XAF", value: { "@type": "QuantitativeValue", minValue: offre.salaireMin, maxValue: offre.salaireMax, unitText: "MONTH" } } }),
    });
    document.head.appendChild(s);
    return () => s.remove();
  }, [offre]);

  if (!offre) return <Introuvable message="Cette offre n'existe pas ou a expiré." />;

  const ent = entrepriseParSlug(offre.entreprise);
  const compat = profil ? compatibilite(offre, profil) : null;
  const dejaPostule = candidatures.some((c) => c.slug === offre.slug);
  const similaires = OFFRES.filter((o) => o.slug !== offre.slug && (o.secteur === offre.secteur || o.entreprise === offre.entreprise)).slice(0, 4);
  const url = window.location.href;
  const comps = (profil?.competences ?? []).map((c) => c.toLowerCase());
  const maitrisee = (c: string) => comps.some((x) => c.toLowerCase().includes(x) || x.includes(c.toLowerCase()));

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const infos = [
    { i: BriefcaseBusiness, l: "Contrat", v: offre.contrat },
    { i: GraduationCap, l: "Expérience", v: offre.niveau },
    { i: Laptop, l: "Mode de travail", v: offre.teletravail },
    { i: MapPin, l: "Lieu", v: offre.ville },
    { i: Banknote, l: "Salaire brut", v: offre.salaireMin ? `${fcfa(offre.salaireMin)}${offre.salaireMax && offre.salaireMax !== offre.salaireMin ? ` à ${fcfa(offre.salaireMax)}` : ""}` : "Selon profil" },
    { i: CalendarClock, l: "Date limite", v: offre.expireLe ? dateLongue(offre.expireLe) : "Non précisée" },
  ];

  return (
    <>
      <div className="border-b border-encre/10 bg-white/70">
        <div className="container py-8">
          <nav className="flex items-center gap-1.5 text-sm text-encre/55" aria-label="Fil d'Ariane">
            <Link to="/offres" className="inline-flex items-center gap-1 hover:text-encre">
              <ArrowLeft className="h-4 w-4" /> Offres
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/offres?secteur=${offre.secteur}`} className="hover:text-encre">
              {secteurNom(offre.secteur)}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/offres?ville=${encodeURIComponent(offre.ville)}`} className="hover:text-encre">
              {offre.ville}
            </Link>
          </nav>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
            <Monogramme slug={offre.entreprise} nom={offre.entrepriseNom} taille="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 text-xs">
                {offre.urgent && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-terre-500 px-2 py-0.5 font-bold text-white">
                    <Zap className="h-3 w-3" /> Recrutement urgent
                  </span>
                )}
                <span className="puce">
                  {secteurEmoji(offre.secteur)} {secteurNom(offre.secteur)}
                </span>
                <span className="puce">
                  <Clock className="h-3.5 w-3.5" /> Publiée {ilYa(offre.publieeLe)}
                </span>
              </div>
              <h1 className="texte-equilibre mt-3 text-3xl font-bold leading-tight sm:text-[2.6rem]">{offre.titre}</h1>
              <p className="mt-2 text-lg">
                {ent ? (
                  <Link to={`/entreprises/${ent.slug}`} className="lien">
                    {offre.entrepriseNom}
                  </Link>
                ) : (
                  <span className="font-semibold">{offre.entrepriseNom}</span>
                )}
                <span className="text-encre/50"> · {offre.ville}</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setDialogue(true)} className="btn-primaire !px-7 !py-3">
                  {dejaPostule ? <Check className="h-4 w-4" /> : null}
                  {dejaPostule ? "Déjà postulé · Repostuler" : "Postuler"}
                </button>
                <BoutonFavori slug={offre.slug} grand />
                <a href={`https://wa.me/?text=${encodeURIComponent(`${offre.titre} chez ${offre.entrepriseNom} (${offre.ville}) ${url}`)}`} target="_blank" rel="noopener noreferrer" className="btn-contour">
                  <IconeWhatsApp /> Partager
                </a>
                <button onClick={copier} className="btn-fantome">
                  {copie ? <Check className="h-4 w-4 text-foret-600" /> : <Copy className="h-4 w-4" />}
                  {copie ? "Lien copié" : "Copier le lien"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 space-y-10">
          <p className="text-xl leading-relaxed text-encre/80">{offre.resume}</p>
          <Bloc titre="Vos missions" items={offre.missions} puce="◆" couleur="text-foret-600" />
          <Bloc titre="Profil recherché" items={offre.profil} puce="●" couleur="text-terre-500" />
          <section>
            <h2 className="text-2xl font-semibold">Compétences clés</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {offre.competences.map((c) => (
                <span key={c} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${profil && maitrisee(c) ? "bg-foret-700 text-creme" : "bg-white text-encre/75 ring-1 ring-encre/10"}`}>
                  {profil && maitrisee(c) && <Check className="h-3.5 w-3.5" />}
                  {c}
                </span>
              ))}
            </div>
            {profil && <p className="mt-3 text-sm text-encre/50">Les compétences en vert figurent dans votre profil.</p>}
          </section>
          {offre.avantages.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold">Les avantages</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {offre.avantages.map((a) => (
                  <li key={a} className="flex items-center gap-3 rounded-xl bg-soleil-50 px-4 py-3 font-medium ring-1 ring-soleil-200">
                    <Sparkles className="h-4 w-4 shrink-0 text-soleil-600" /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="flex items-start gap-3 rounded-2xl border border-terre-200 bg-terre-50 p-5 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-terre-600" />
            <p className="text-encre/75">
              <strong className="text-encre">Restez vigilant·e :</strong> aucun recruteur ne doit vous demander d'argent (frais de dossier, de formation, de visa…).{" "}
              <Link to="/conseils/eviter-arnaques-emploi" className="lien">
                Reconnaître une fausse offre
              </Link>
            </p>
          </div>
        </article>

        <aside className="space-y-5">
          {compat != null ? (
            <div className="carte flex items-center gap-4 p-5">
              <AnneauCompat valeur={compat} taille={64} />
              <div>
                <p className="font-semibold">{compat >= 70 ? "Excellent match !" : compat >= 45 ? "Bon potentiel" : "Profil éloigné"}</p>
                <p className="text-sm text-encre/60">Compatibilité calculée à partir de votre profil.</p>
              </div>
            </div>
          ) : (
            <Link to="/mon-espace?onglet=profil" className="carte flex items-center gap-4 p-5 transition hover:border-foret-300">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foret-100 text-foret-700">
                <Sparkles className="h-6 w-6" />
              </span>
              <span className="text-sm">
                <strong className="block text-base">Cette offre est-elle faite pour vous ?</strong>
                Créez votre profil pour obtenir votre score.
              </span>
            </Link>
          )}

          <div className="carte divide-y divide-encre/[.07]">
            {infos.map(({ i: Icone, l, v }) => (
              <div key={l} className="flex items-center gap-3 px-5 py-3.5">
                <Icone className="h-5 w-5 shrink-0 text-foret-600" />
                <span className="text-sm text-encre/55">{l}</span>
                <span className="ml-auto text-right text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>

          {ent && (
            <div className="carte p-5">
              <div className="flex items-center gap-3">
                <Monogramme slug={ent.slug} nom={ent.nom} taille="sm" />
                <div>
                  <p className="font-semibold">{ent.nom}</p>
                  {ent.taille !== "—" && <p className="text-sm text-encre/55">{ent.taille}</p>}
                </div>
              </div>
              {ent.accroche && <p className="mt-3 text-sm text-encre/70">{ent.accroche}</p>}
              <Link to={`/entreprises/${ent.slug}`} className="btn-contour mt-4 w-full">
                Voir l'entreprise
              </Link>
            </div>
          )}
        </aside>
      </div>

      {similaires.length > 0 && (
        <section className="container pb-10">
          <h2 className="text-2xl font-bold">Offres similaires</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {similaires.map((o) => (
              <CarteOffre key={o.slug} offre={o} compat={profil ? compatibilite(o, profil) : null} />
            ))}
          </div>
        </section>
      )}

      {/* Barre d'action mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-encre/10 bg-creme/95 p-3 backdrop-blur md:hidden">
        <BoutonFavori slug={offre.slug} grand />
        <button onClick={() => setDialogue(true)} className="btn-primaire flex-1">
          Postuler
        </button>
      </div>

      <DialogueCandidature offre={offre} ouverte={dialogue} fermer={() => setDialogue(false)} />
    </>
  );
}

function Bloc({ titre, items, puce, couleur }: { titre: string; items: string[]; puce: string; couleur: string }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-semibold">{titre}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((m) => (
          <li key={m} className="flex gap-3 text-[17px] leading-relaxed text-encre/80">
            <span className={`mt-0.5 text-sm ${couleur}`}>{puce}</span>
            {m}
          </li>
        ))}
      </ul>
    </section>
  );
}
