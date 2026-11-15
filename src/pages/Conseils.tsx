import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES } from "@/data/articles";
import Motif from "@/components/Motif";
import useSeo from "@/lib/useSeo";

export default function Conseils() {
  useSeo("Conseils carrière", "CV, entretien, salaire, premier emploi : nos guides pratiques pour réussir votre recherche d'emploi au Cameroun.");
  const [une, ...autres] = ARTICLES;
  return (
    <div className="container py-12">
      <p className="surtitre">Le guide</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Conseils carrière</h1>
      <p className="mt-3 max-w-2xl text-lg text-encre/60">Des guides concrets, écrits pour le marché de l'emploi camerounais.</p>

      <Link to={`/conseils/${une.slug}`} className="group mt-10 grid overflow-hidden rounded-[2rem] bg-white shadow-carte ring-1 ring-encre/[.06] md:grid-cols-2">
        <div className="relative min-h-[240px]" style={{ background: une.couleur }}>
          <Motif className="absolute inset-0 text-white" opacite={0.25} id="m-une" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <span className="surtitre">{une.categorie} · {une.minutes} min</span>
          <h2 className="mt-3 text-3xl font-bold leading-tight group-hover:text-foret-700">{une.titre}</h2>
          <p className="mt-3 text-lg text-encre/65">{une.chapo}</p>
          <span className="mt-6 inline-flex items-center gap-1 font-semibold text-foret-700">Lire l'article <ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </Link>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {autres.map((a) => (
          <Link key={a.slug} to={`/conseils/${a.slug}`} className="group carte overflow-hidden transition hover:-translate-y-1 hover:shadow-flotte">
            <div className="relative h-32" style={{ background: a.couleur }}>
              <Motif className="absolute inset-0 text-white" opacite={0.25} id={`m-${a.slug}`} />
            </div>
            <div className="p-6">
              <span className="text-xs font-bold uppercase tracking-widest text-encre/45">{a.categorie} · {a.minutes} min</span>
              <h2 className="mt-2 text-xl font-semibold leading-snug group-hover:text-foret-700">{a.titre}</h2>
              <p className="mt-2 text-sm text-encre/60">{a.chapo}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
