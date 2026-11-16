import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Marque } from "./Logo";
import Motif from "./Motif";

/** Mise en page commune des écrans de connexion et d'inscription. */
export default function CarteAuth({ titre, sousTitre, children, aside }: { titre: string; sousTitre?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="container grid min-h-[calc(100vh-200px)] gap-10 py-12 lg:grid-cols-[1fr_440px] lg:items-center">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="inline-block"><Marque className="h-12 w-12" /></Link>
        <h1 className="mt-6 text-4xl font-bold">{titre}</h1>
        {sousTitre && <p className="mt-2 text-lg text-encre/60">{sousTitre}</p>}
        <div className="mt-8">{children}</div>
      </div>
      <aside className="relative hidden overflow-hidden rounded-[2rem] bg-foret-900 p-10 text-creme lg:block">
        <Motif className="pointer-events-none absolute inset-0 text-soleil-200" opacite={0.08} id="ndop-auth" />
        <div className="relative">{aside}</div>
      </aside>
    </div>
  );
}

export function BoutonGoogle({ onClick, desactive }: { onClick: () => void; desactive?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={desactive} className="btn-contour w-full !py-3.5">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
      </svg>
      Continuer avec Google
    </button>
  );
}

export function Separateur() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-encre/40">
      <span className="h-px flex-1 bg-encre/10" /> ou <span className="h-px flex-1 bg-encre/10" />
    </div>
  );
}

export function Alerte({ children, type = "erreur" }: { children: ReactNode; type?: "erreur" | "succes" | "info" }) {
  const c = { erreur: "border-terre-200 bg-terre-50 text-terre-800", succes: "border-foret-200 bg-foret-50 text-foret-800", info: "border-soleil-200 bg-soleil-50 text-soleil-900" }[type];
  return <p role={type === "erreur" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</p>;
}

export function NonConfigure() {
  return (
    <div className="conteneur-etroit py-24 text-center">
      <h1 className="text-3xl font-bold">Comptes bientôt disponibles</h1>
      <p className="mt-3 text-encre/60">La création de compte sera ouverte dès que le site sera relié à sa base de données.</p>
      <Link to="/offres" className="btn-primaire mt-8">Voir les offres</Link>
    </div>
  );
}
