import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Globe, MapPin, Users } from "lucide-react";
import { entrepriseParSlug, offresDe } from "@/data";
import { secteurEmoji, secteurNom } from "@/data/taxonomie";
import Monogramme from "@/components/Monogramme";
import Motif from "@/components/Motif";
import CarteOffre from "@/components/CarteOffre";
import Introuvable from "./Introuvable";
import { compatibilite } from "@/lib/recherche";
import { useEspace } from "@/lib/store";
import { pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

export default function Entreprise() {
  const { slug = "" } = useParams();
  const e = entrepriseParSlug(slug);
  const profil = useEspace((s) => s.profil);
  useSeo(e ? `${e.nom} recrute` : "Entreprise introuvable", e?.accroche);
  if (!e) return <Introuvable message="Cette entreprise n'est pas (ou plus) référencée." />;
  const offres = offresDe(e.slug);
  return (
    <>
      <div className="relative h-44 overflow-hidden sm:h-56" style={{ background: e.couleur }}>
        <Motif className="absolute inset-0 text-white" opacite={0.18} id="ndop-ent" />
      </div>
      <div className="container">
        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="rounded-3xl bg-creme p-2"><Monogramme slug={e.slug} nom={e.nom} taille="lg" /></div>
          <div className="pb-2">
            <Link to="/entreprises" className="inline-flex items-center gap-1 text-sm text-encre/55 hover:text-encre"><ArrowLeft className="h-4 w-4" /> Entreprises</Link>
            <h1 className="mt-1 text-4xl font-bold">{e.nom}</h1>
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            {e.accroche && <p className="font-display text-2xl font-semibold leading-snug text-foret-800">« {e.accroche} »</p>}
            {e.description && <p className="mt-5 text-lg leading-relaxed text-encre/75">{e.description}</p>}
            {e.valeurs.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {e.valeurs.map((v) => <span key={v} className="rounded-full bg-soleil-100 px-3.5 py-1.5 text-sm font-semibold text-soleil-800">{v}</span>)}
              </div>
            )}
            <h2 className="mt-12 text-2xl font-bold">{pluriel(offres.length, "offre en cours", "offres en cours")}</h2>
            <div className="mt-5 space-y-3">
              {offres.map((o) => <CarteOffre key={o.slug} offre={o} compat={profil ? compatibilite(o, profil) : null} />)}
              {!offres.length && <p className="text-encre/60">Aucune offre pour le moment.</p>}
            </div>
          </div>
          <aside className="carte h-fit divide-y divide-encre/[.07]">
            {[
              { i: MapPin, l: "Siège", v: e.ville },
              { i: Users, l: "Effectif", v: e.taille },
              { i: CalendarDays, l: "Création", v: e.fondee ? String(e.fondee) : "—" },
              { i: Globe, l: "Secteur", v: `${secteurEmoji(e.secteur)} ${secteurNom(e.secteur)}` },
            ].map(({ i: I, l, v }) => (
              <div key={l} className="flex items-center gap-3 px-5 py-4">
                <I className="h-5 w-5 text-foret-600" />
                <span className="text-sm text-encre/55">{l}</span>
                <span className="ml-auto text-sm font-semibold">{v}</span>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </>
  );
}
