import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { enregistrerPaiement, exporterCsv, FORMULES, listerPaiements, MOYENS, supprimerPaiement, type Paiement } from "@/lib/admin";
import { fcfa, kfcfa } from "@/lib/format";
import { EnTete, Kpi } from "./Admin";

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default function Revenus() {
  const [liste, setListe] = useState<Paiement[] | null>(null);
  const [edition, setEdition] = useState<(Omit<Paiement, "id"> & { id?: string }) | null>(null);
  const charger = () => listerPaiements().then(setListe).catch(() => setListe([]));
  useEffect(() => { charger(); }, []);

  const stats = useMemo(() => {
    const payes = (liste ?? []).filter((p) => p.statut === "payé");
    const now = new Date();
    const cleMois = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mois: { cle: string; label: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); mois.push({ cle: cleMois(d), label: MOIS[d.getMonth()], total: 0 }); }
    payes.forEach((p) => { const m = mois.find((x) => x.cle === p.date.slice(0, 7)); if (m) m.total += p.montant; });
    const parFormule: Record<string, number> = {};
    const parMoyen: Record<string, number> = {};
    payes.filter((p) => p.date.startsWith(String(now.getFullYear()))).forEach((p) => { parFormule[p.formule] = (parFormule[p.formule] ?? 0) + p.montant; parMoyen[p.moyen] = (parMoyen[p.moyen] ?? 0) + p.montant; });
    return {
      mois, parFormule, parMoyen,
      moisCourant: mois[11].total,
      annee: payes.filter((p) => p.date.startsWith(String(now.getFullYear()))).reduce((s, p) => s + p.montant, 0),
      attente: (liste ?? []).filter((p) => p.statut === "en attente").reduce((s, p) => s + p.montant, 0),
      clients: new Set(payes.map((p) => p.entreprise.toLowerCase())).size,
    };
  }, [liste]);
  const max = Math.max(1, ...stats.mois.map((m) => m.total));

  return (
    <>
      <EnTete
        titre="Revenus"
        sousTitre="Paiements des recruteurs (Mobile Money, virement…) et chiffre d'affaires."
        actions={
          <>
            <button onClick={() => liste && exporterCsv(`workers-paiements-${new Date().toISOString().slice(0, 10)}.csv`, liste.map(({ id, ...p }) => p))} className="btn-contour"><Download className="h-4 w-4" /> Export CSV</button>
            <button onClick={() => setEdition({ entreprise: "", formule: FORMULES[0], montant: 0, moyen: MOYENS[0], reference: "", date: new Date().toISOString().slice(0, 10), statut: "payé", note: "" })} className="btn-primaire"><PlusCircle className="h-4 w-4" /> Enregistrer un paiement</button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi v={fcfa(stats.moisCourant)} l="encaissé ce mois-ci" accent />
        <Kpi v={fcfa(stats.annee)} l={`encaissé en ${new Date().getFullYear()}`} />
        <Kpi v={fcfa(stats.attente)} l="en attente de paiement" />
        <Kpi v={stats.clients} l="clients payants" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-carte">
          <h2 className="text-lg font-semibold">Chiffre d'affaires — 12 derniers mois</h2>
          <div className="mt-6 flex h-52 items-end gap-2">
            {stats.mois.map((m) => (
              <div key={m.cle} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] font-semibold tabular-nums text-encre/60">{m.total ? kfcfa(m.total) : ""}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-foret-700 to-foret-400" style={{ height: `${(m.total / max) * 160}px` }} />
                <span className="text-[11px] text-encre/50">{m.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-6 rounded-2xl bg-white p-6 shadow-carte">
          {[["Par formule", stats.parFormule], ["Par moyen de paiement", stats.parMoyen]].map(([t, d]) => (
            <div key={t as string}>
              <h2 className="font-semibold">{t as string} <span className="text-xs font-normal text-encre/50">(année)</span></h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {Object.entries(d as Record<string, number>).sort((a, b) => b[1] - a[1]).map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold tabular-nums">{fcfa(v)}</span></li>)}
                {!Object.keys(d as object).length && <li className="text-encre/50">—</li>}
              </ul>
            </div>
          ))}
        </section>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-carte">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-encre/10 text-xs uppercase tracking-wider text-encre/50"><tr><th className="p-4">Date</th><th className="p-4">Client</th><th className="p-4">Formule</th><th className="p-4">Moyen</th><th className="p-4">Référence</th><th className="p-4 text-right">Montant</th><th className="p-4">Statut</th><th className="p-4" /></tr></thead>
          <tbody>
            {liste?.map((p) => (
              <tr key={p.id} className="border-b border-encre/[.05]">
                <td className="p-4">{new Date(p.date).toLocaleDateString("fr-FR")}</td><td className="p-4 font-semibold">{p.entreprise}</td><td className="p-4">{p.formule}</td><td className="p-4">{p.moyen}</td><td className="p-4 text-encre/60">{p.reference}</td>
                <td className="p-4 text-right font-semibold tabular-nums">{fcfa(p.montant)}</td>
                <td className="p-4"><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${p.statut === "payé" ? "bg-foret-100 text-foret-800" : p.statut === "en attente" ? "bg-soleil-100 text-soleil-800" : "bg-stone-200 text-stone-700"}`}>{p.statut}</span></td>
                <td className="whitespace-nowrap p-4 text-right"><button onClick={() => setEdition(p)} className="btn-fantome !px-2"><Pencil className="h-4 w-4" /></button><button onClick={async () => { if (window.confirm("Supprimer ce paiement ?")) { await supprimerPaiement(p); charger(); } }} className="btn-fantome !px-2 text-terre-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
            {liste && !liste.length && <tr><td colSpan={8} className="p-8 text-center text-encre/50">Aucun paiement enregistré.</td></tr>}
          </tbody>
        </table>
      </div>
      {edition && <FichePaiement p={edition} fermer={() => setEdition(null)} apres={() => { setEdition(null); charger(); }} />}
    </>
  );
}

function FichePaiement({ p: initial, fermer, apres }: { p: Omit<Paiement, "id"> & { id?: string }; fermer: () => void; apres: () => void }) {
  const [p, setP] = useState(initial);
  const soumettre = async (e: FormEvent) => { e.preventDefault(); await enregistrerPaiement(p); apres(); };
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foret-950/40" onClick={fermer} />
      <form onSubmit={soumettre} className="relative h-full w-full max-w-md space-y-4 overflow-y-auto bg-creme p-6 shadow-flotte">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{p.id ? "Modifier le paiement" : "Nouveau paiement"}</h2><button type="button" onClick={fermer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer"><X className="h-5 w-5" /></button></div>
        <label className="block"><span className="etiquette">Client (entreprise)</span><input required className="champ" value={p.entreprise} onChange={(e) => setP({ ...p, entreprise: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-4">
          <label><span className="etiquette">Formule</span><select className="champ" value={p.formule} onChange={(e) => setP({ ...p, formule: e.target.value })}>{FORMULES.map((f) => <option key={f}>{f}</option>)}</select></label>
          <label><span className="etiquette">Montant (FCFA)</span><input required inputMode="numeric" className="champ" value={p.montant || ""} onChange={(e) => setP({ ...p, montant: Number(e.target.value.replace(/[^\d]/g, "")) })} /></label>
          <label><span className="etiquette">Moyen</span><select className="champ" value={p.moyen} onChange={(e) => setP({ ...p, moyen: e.target.value })}>{MOYENS.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label><span className="etiquette">Date</span><input required type="date" className="champ" value={p.date} onChange={(e) => setP({ ...p, date: e.target.value })} /></label>
        </div>
        <label className="block"><span className="etiquette">Référence (n° de transaction, facture…)</span><input className="champ" value={p.reference} onChange={(e) => setP({ ...p, reference: e.target.value })} /></label>
        <label className="block"><span className="etiquette">Statut</span><select className="champ" value={p.statut} onChange={(e) => setP({ ...p, statut: e.target.value as Paiement["statut"] })}><option>payé</option><option>en attente</option><option>remboursé</option></select></label>
        <label className="block"><span className="etiquette">Note</span><textarea rows={3} className="champ" value={p.note ?? ""} onChange={(e) => setP({ ...p, note: e.target.value })} /></label>
        <button className="btn-primaire w-full !py-3.5">Enregistrer</button>
      </form>
    </div>
  );
}
