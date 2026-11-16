import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ExternalLink, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { listerOffres, majOffre, modererOffre, supprimerOffre, type OffreAdmin } from "@/lib/admin";
import { soumettreOffre } from "@/lib/donnees";
import { useAuth } from "@/lib/auth";
import FormulaireOffre, { versChamps } from "@/components/FormulaireOffre";
import { ilYa } from "@/lib/format";
import { EnTete } from "./Admin";

const ONGLETS = [
  { statut: "en_attente", label: "À valider" },
  { statut: "publiee", label: "En ligne" },
  { statut: "refusee", label: "Refusées" },
  { statut: "expiree", label: "Clôturées" },
];
const ORIGINES: Record<string, string> = { recruteur: "Recruteur", collecte: "Collecte IA", admin: "Admin", github: "GitHub" };

export default function OffresAdmin() {
  const [sp, setSp] = useSearchParams();
  const statut = sp.get("statut") ?? "en_attente";
  const origine = sp.get("origine") ?? "";
  const { utilisateur } = useAuth();
  const [liste, setListe] = useState<OffreAdmin[] | null>(null);
  const [edition, setEdition] = useState<OffreAdmin | "nouvelle" | null>(null);
  const [erreur, setErreur] = useState("");
  const charger = () => { setListe(null); listerOffres(statut, origine || undefined).then(setListe).catch((e) => { setErreur(String(e?.message ?? e)); setListe([]); }); };
  useEffect(charger, [statut, origine]);

  const moderer = async (o: OffreAdmin, s: "publiee" | "refusee" | "expiree") => {
    let motif: string | undefined;
    if (s === "refusee") { motif = window.prompt("Motif du refus (visible par le recruteur) :") ?? undefined; if (motif === undefined) return; }
    await modererOffre(o, s, motif);
    charger();
  };

  return (
    <>
      <EnTete titre="Offres" sousTitre="Modération des offres des recruteurs et de la collecte IA." actions={<button onClick={() => setEdition("nouvelle")} className="btn-primaire"><PlusCircle className="h-4 w-4" /> Créer une offre</button>} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ONGLETS.map((o) => (
          <button key={o.statut} onClick={() => setSp({ statut: o.statut, ...(origine ? { origine } : {}) })} className={`rounded-full px-4 py-2 text-sm font-semibold ${statut === o.statut ? "bg-foret-800 text-creme" : "bg-white text-encre/70 ring-1 ring-encre/10"}`}>{o.label}</button>
        ))}
        <select className="champ ml-auto !w-auto" value={origine} onChange={(e) => setSp({ statut, ...(e.target.value ? { origine: e.target.value } : {}) })}>
          <option value="">Toutes origines</option>{Object.entries(ORIGINES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {erreur && <p className="mb-4 rounded-xl bg-terre-50 p-3 text-sm text-terre-800">{erreur}</p>}
      <div className="space-y-3">
        {liste === null && <p className="text-encre/50">Chargement…</p>}
        {liste?.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-5 shadow-carte">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-encre/[.06] px-2 py-0.5 font-bold">{ORIGINES[o.origine ?? ""] ?? o.origine}</span>
                  {o.source?.nom && <span className="rounded-md bg-sky-100 px-2 py-0.5 font-bold text-sky-800">{o.source.nom}</span>}
                  <span className="text-encre/50">{ilYa(o.publieeLe)}</span>
                </div>
                <p className="mt-2 text-lg font-semibold">{o.titre}</p>
                <p className="text-sm text-encre/60">{o.entrepriseNom} · {o.ville} · {o.contrat}</p>
                <p className="mt-2 line-clamp-2 text-sm text-encre/70">{o.resume}</p>
                {o.motifRefus && <p className="mt-2 text-sm text-terre-700">Motif du refus : {o.motifRefus}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(o.source?.lienAnnonce || o.candidature?.url) && <a href={o.source?.lienAnnonce ?? o.candidature.url} target="_blank" rel="noopener noreferrer" className="btn-fantome !px-3"><ExternalLink className="h-4 w-4" /> Source</a>}
                <button onClick={() => setEdition(o)} className="btn-fantome !px-3"><Pencil className="h-4 w-4" /> Modifier</button>
                {o.statut !== "publiee" && <button onClick={() => moderer(o, "publiee")} className="btn-primaire !px-4"><Check className="h-4 w-4" /> Publier</button>}
                {o.statut === "en_attente" && <button onClick={() => moderer(o, "refusee")} className="btn-contour !px-4"><X className="h-4 w-4" /> Refuser</button>}
                {o.statut === "publiee" && <button onClick={() => moderer(o, "expiree")} className="btn-contour !px-4">Clôturer</button>}
                <button onClick={async () => { if (window.confirm("Supprimer définitivement cette offre ?")) { await supprimerOffre(o); charger(); } }} className="grid h-10 w-10 place-items-center rounded-full text-encre/40 hover:bg-terre-50 hover:text-terre-600" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {liste && !liste.length && <p className="rounded-2xl bg-white p-8 text-center text-encre/50 shadow-carte">Aucune offre dans cette liste.</p>}
      </div>

      {edition && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foret-950/40" onClick={() => setEdition(null)} />
          <div className="relative h-full w-full max-w-3xl overflow-y-auto bg-creme p-6 shadow-flotte sm:p-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold">{edition === "nouvelle" ? "Nouvelle offre" : "Modifier l'offre"}</h2><button onClick={() => setEdition(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer"><X className="h-5 w-5" /></button></div>
            <FormulaireOffre
              initial={versChamps(edition === "nouvelle" ? undefined : edition)}
              libelle={edition === "nouvelle" ? "Publier l'offre" : "Enregistrer"}
              onSubmit={async (b) => {
                if (edition === "nouvelle") await soumettreOffre(utilisateur!.uid, b, "admin", "publiee");
                else await majOffre(edition.id, b);
                setEdition(null);
                charger();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
