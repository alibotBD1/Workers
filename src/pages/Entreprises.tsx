import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin, Search } from "lucide-react";
import { ENTREPRISES, offresDe } from "@/data";
import { SECTEURS, secteurNom } from "@/data/taxonomie";
import Monogramme from "@/components/Monogramme";
import Vide from "@/components/Vide";
import { pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

export default function Entreprises() {
  useSeo("Entreprises qui recrutent au Cameroun");
  const [q, setQ] = useState("");
  const [secteur, setSecteur] = useState("");
  const liste = useMemo(
    () =>
      ENTREPRISES.filter((e) => (!secteur || e.secteur === secteur) && (!q || e.nom.toLowerCase().includes(q.toLowerCase())))
        .map((e) => ({ e, n: offresDe(e.slug).length }))
        .sort((a, b) => b.n - a.n),
    [q, secteur],
  );
  return (
    <div className="container py-12">
      <p className="surtitre">Annuaire</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Les entreprises qui recrutent</h1>
      <p className="mt-3 max-w-2xl text-lg text-encre/60">Découvrez leur culture, leurs valeurs et toutes leurs offres en cours.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-encre/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une entreprise" className="champ !pl-12" />
        </label>
        <select value={secteur} onChange={(e) => setSecteur(e.target.value)} className="champ sm:!w-64" aria-label="Secteur">
          <option value="">Tous les secteurs</option>
          {SECTEURS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map(({ e, n }) => (
          <Link key={e.slug} to={`/entreprises/${e.slug}`} className="carte group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-foret-300 hover:shadow-flotte">
            <div className="flex items-center gap-4">
              <Monogramme slug={e.slug} nom={e.nom} />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold group-hover:text-foret-700">{e.nom}</h2>
                <p className="flex items-center gap-1 text-sm text-encre/55"><MapPin className="h-3.5 w-3.5" /> {e.ville} · {secteurNom(e.secteur)}</p>
              </div>
            </div>
            {e.accroche && <p className="mt-4 flex-1 text-encre/70">{e.accroche}</p>}
            <span className="mt-5 inline-flex w-fit rounded-full bg-foret-50 px-3 py-1 text-sm font-semibold text-foret-700">{pluriel(n, "offre en cours", "offres en cours")}</span>
          </Link>
        ))}
      </div>
      {!liste.length && <Vide icone={<Building2 className="h-6 w-6" />} titre="Aucune entreprise trouvée" />}
    </div>
  );
}
