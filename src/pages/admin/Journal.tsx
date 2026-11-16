import { useEffect, useState } from "react";
import { lireJournal, type EntreeJournal } from "@/lib/admin";
import { EnTete } from "./Admin";

export default function Journal() {
  const [liste, setListe] = useState<EntreeJournal[] | null>(null);
  useEffect(() => { lireJournal().then(setListe).catch(() => setListe([])); }, []);
  return (
    <>
      <EnTete titre="Journal d'audit" sousTitre="Toutes les actions sensibles du back office : connexions en tant que, exports, modération, paiements." />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-carte">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-encre/10 text-xs uppercase tracking-wider text-encre/50"><tr><th className="p-4">Date</th><th className="p-4">Administrateur</th><th className="p-4">Action</th><th className="p-4">Cible</th><th className="p-4">Détails</th></tr></thead>
          <tbody>
            {liste?.map((e) => (
              <tr key={e.id} className="border-b border-encre/[.05]">
                <td className="whitespace-nowrap p-4 text-encre/60">{new Date(e.date).toLocaleString("fr-FR")}</td>
                <td className="p-4">{e.acteurEmail}</td>
                <td className="p-4 font-semibold">{e.action}</td>
                <td className="p-4">{e.cible ?? "—"}</td>
                <td className="p-4 text-encre/60">{e.details ?? ""}</td>
              </tr>
            ))}
            {liste && !liste.length && <tr><td colSpan={5} className="p-8 text-center text-encre/50">Aucune action enregistrée.</td></tr>}
            {!liste && <tr><td colSpan={5} className="p-8 text-center text-encre/50">Chargement…</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
