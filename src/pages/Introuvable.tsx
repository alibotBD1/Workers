import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import useSeo from "@/lib/useSeo";

export default function Introuvable({ message = "La page que vous cherchez a peut-être changé d'adresse." }: { message?: string }) {
  useSeo("Page introuvable");
  return (
    <div className="container flex flex-col items-center py-28 text-center">
      <span className="font-display text-[8rem] font-bold leading-none text-soleil-400">404</span>
      <h1 className="mt-2 text-3xl font-bold">On s'est perdu en chemin…</h1>
      <p className="mt-3 max-w-md text-encre/60">{message}</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-contour">Accueil</Link>
        <Link to="/offres" className="btn-primaire"><Compass className="h-4 w-4" /> Voir les offres</Link>
      </div>
    </div>
  );
}
