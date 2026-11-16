import { lazy, Suspense } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Gauge, History, LogOut, Radar, Users, Wallet } from "lucide-react";
import { deconnecter, useAuth } from "@/lib/auth";
import { ENVIRONNEMENT, firebaseActif } from "@/lib/firebase";
import { Marque } from "@/components/Logo";
import useSeo from "@/lib/useSeo";

const Tableau = lazy(() => import("./Tableau"));
const Utilisateurs = lazy(() => import("./Utilisateurs"));
const OffresAdmin = lazy(() => import("./OffresAdmin"));
const Collecte = lazy(() => import("./Collecte"));
const Revenus = lazy(() => import("./Revenus"));
const Journal = lazy(() => import("./Journal"));

const MENU = [
  { to: "/admin", label: "Tableau de bord", icone: Gauge, fin: true },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icone: Users },
  { to: "/admin/offres", label: "Offres", icone: BriefcaseBusiness },
  { to: "/admin/collecte", label: "Collecte IA", icone: Radar },
  { to: "/admin/revenus", label: "Revenus", icone: Wallet },
  { to: "/admin/journal", label: "Journal d'audit", icone: History },
];

export default function Admin() {
  useSeo("Back office");
  const { pret, utilisateur, estAdmin } = useAuth();

  if (!firebaseActif)
    return (
      <div className="conteneur-etroit py-24 text-center">
        <h1 className="text-3xl font-bold">Back office indisponible</h1>
        <p className="mt-3 text-encre/60">Le back office fonctionne dès que le site est relié à son projet Firebase (voir le README, section « Comptes et back office »).</p>
      </div>
    );
  if (!pret) return <div className="py-24 text-center text-encre/50">Chargement…</div>;
  if (!utilisateur) return <Navigate to="/connexion?retour=/admin" replace />;
  if (!estAdmin)
    return (
      <div className="conteneur-etroit py-24 text-center">
        <h1 className="text-3xl font-bold">Accès réservé</h1>
        <p className="mt-3 text-encre/60">Votre compte n'a pas les droits d'administration.</p>
        <Link to="/" className="btn-primaire mt-6">Retour au site</Link>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#f4f1ea]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-foret-950 p-5 text-creme lg:flex">
        <Link to="/admin" className="flex items-center gap-3">
          <Marque className="h-10 w-10" />
          <span className="leading-tight"><span className="block font-display text-lg font-bold">workers.</span><span className="text-xs uppercase tracking-widest text-creme/50">Back office</span></span>
        </Link>
        {ENVIRONNEMENT === "recette" && <span className="mt-4 rounded-lg bg-violet-600 px-3 py-1 text-center text-xs font-bold uppercase tracking-widest">Recette</span>}
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Back office">
          {MENU.map(({ to, label, icone: I, fin }) => (
            <NavLink key={to} to={to} end={fin} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-creme/10 text-white" : "text-creme/65 hover:bg-creme/5 hover:text-white"}`}>
              <I className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-creme/10 pt-4 text-sm">
          <p className="truncate px-3 text-creme/50">{utilisateur.email}</p>
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-creme/65 hover:text-white"><ArrowLeft className="h-4 w-4" /> Voir le site</Link>
          <button onClick={deconnecter} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-creme/65 hover:text-white"><LogOut className="h-4 w-4" /> Déconnexion</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="flex gap-1 overflow-x-auto bg-foret-950 p-2 lg:hidden">
          {MENU.map(({ to, label, fin }) => (
            <NavLink key={to} to={to} end={fin} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive ? "bg-creme/10 text-white" : "text-creme/65"}`}>{label}</NavLink>
          ))}
        </nav>
        <main className="p-5 sm:p-8 lg:p-10">
          <Suspense fallback={<p className="text-encre/50">Chargement…</p>}>
            <Routes>
              <Route index element={<Tableau />} />
              <Route path="utilisateurs" element={<Utilisateurs />} />
              <Route path="offres" element={<OffresAdmin />} />
              <Route path="collecte" element={<Collecte />} />
              <Route path="revenus" element={<Revenus />} />
              <Route path="journal" element={<Journal />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function EnTete({ titre, sousTitre, actions }: { titre: string; sousTitre?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{titre}</h1>
        {sousTitre && <p className="mt-1 text-encre/60">{sousTitre}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({ v, l, accent }: { v: string | number; l: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? "bg-foret-900 text-creme" : "bg-white shadow-carte"}`}>
      <p className="font-display text-3xl font-bold tabular-nums">{v}</p>
      <p className={`mt-1 text-sm ${accent ? "text-creme/65" : "text-encre/60"}`}>{l}</p>
    </div>
  );
}
