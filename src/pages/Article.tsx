import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ARTICLES, articleParSlug } from "@/data/articles";
import Motif from "@/components/Motif";
import Introuvable from "./Introuvable";
import useSeo from "@/lib/useSeo";

export default function Article() {
  const { slug = "" } = useParams();
  const a = articleParSlug(slug);
  useSeo(a?.titre ?? "Article introuvable", a?.chapo);
  if (!a) return <Introuvable />;
  const suivant = ARTICLES[(ARTICLES.indexOf(a) + 1) % ARTICLES.length];
  return (
    <article>
      <header className="relative overflow-hidden py-16 text-white" style={{ background: a.couleur }}>
        <Motif className="absolute inset-0 text-white" opacite={0.2} id="m-article" />
        <div className="conteneur-etroit relative">
          <Link to="/conseils" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Conseils</Link>
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-white/80">{a.categorie} · {a.minutes} min de lecture</p>
          <h1 className="texte-equilibre mt-3 text-4xl font-bold leading-tight sm:text-5xl">{a.titre}</h1>
          <p className="mt-4 text-xl text-white/85">{a.chapo}</p>
        </div>
      </header>
      <div className="conteneur-etroit py-14">
        {a.sections.map((s) => (
          <section key={s.titre} className="mb-10">
            <h2 className="mb-4 text-2xl font-bold">{s.titre}</h2>
            <div className="prose-mw text-[17px]">{s.texte.map((t) => <p key={t.slice(0, 30)}>{t}</p>)}</div>
          </section>
        ))}
        <div className="mt-14 flex flex-col gap-4 rounded-3xl bg-foret-900 p-8 text-creme sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-semibold">Prêt·e à passer à l'action ?</p>
          <Link to="/offres" className="btn-soleil">Voir les offres <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <Link to={`/conseils/${suivant.slug}`} className="group mt-8 block rounded-2xl border border-encre/10 p-6 hover:border-foret-300">
          <span className="text-sm text-encre/50">Article suivant</span>
          <span className="mt-1 block text-lg font-semibold group-hover:text-foret-700">{suivant.titre} →</span>
        </Link>
      </div>
    </article>
  );
}
