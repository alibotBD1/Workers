import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { REGIONS, VILLES } from "@/data/taxonomie";
import { actions, useEspace } from "@/lib/store";

export default function BarreRecherche({ initQ = "", initVille = "", variante = "hero" }: { initQ?: string; initVille?: string; variante?: "hero" | "compacte" }) {
  const [q, setQ] = useState(initQ);
  const [ville, setVille] = useState(initVille);
  const recherches = useEspace((e) => e.recherches);
  const nav = useNavigate();

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    actions.memoriserRecherche(q);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (ville.trim()) sp.set("ville", ville.trim());
    nav(`/offres${sp.size ? `?${sp}` : ""}`);
  };

  const hero = variante === "hero";
  return (
    <form
      onSubmit={soumettre}
      role="search"
      className={`flex flex-col gap-2 rounded-[1.75rem] bg-white p-2 sm:flex-row sm:items-center sm:gap-0 ${hero ? "shadow-flotte" : "border border-encre/10 shadow-carte"}`}
    >
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2 sm:py-0">
        <Search className="h-5 w-5 shrink-0 text-foret-600" />
        <span className="sr-only">Quel emploi ?</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          list="mw-recherches"
          placeholder="Métier, compétence, entreprise…"
          className={`w-full bg-transparent placeholder:text-encre/40 focus:outline-none ${hero ? "py-3 text-base" : "py-2.5 text-[15px]"}`}
        />
        <datalist id="mw-recherches">
          {recherches.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </label>
      <span className="hidden h-8 w-px bg-encre/10 sm:block" />
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2 sm:py-0">
        <MapPin className="h-5 w-5 shrink-0 text-terre-500" />
        <span className="sr-only">Où ?</span>
        <input
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          list="mw-villes"
          placeholder="Ville ou région"
          className={`w-full bg-transparent placeholder:text-encre/40 focus:outline-none ${hero ? "py-3 text-base" : "py-2.5 text-[15px]"}`}
        />
        <datalist id="mw-villes">
          {VILLES.map((v) => (
            <option key={v.nom} value={v.nom}>{v.region}</option>
          ))}
          {REGIONS.map((r) => (
            <option key={r} value={r}>Région</option>
          ))}
          <option value="Télétravail" />
        </datalist>
      </label>
      <button type="submit" className={`btn-primaire ${hero ? "!px-7 !py-4 !text-base" : ""}`}>
        <Search className="h-4 w-4 sm:hidden" />
        Rechercher
      </button>
    </form>
  );
}
