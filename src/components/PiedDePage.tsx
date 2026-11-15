import { Link } from "react-router-dom";
import Logo from "./Logo";
import Motif from "./Motif";
import { SECTEURS, VILLES } from "@/data/taxonomie";
import { CONFIG } from "@/lib/config";

export default function PiedDePage() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-foret-900 text-creme">
      <Motif className="pointer-events-none absolute inset-0 text-soleil-300" opacite={0.07} id="ndop-pied" />
      <div className="h-1.5 bg-[linear-gradient(90deg,#2d7d57_0_33%,#d14d31_33%_66%,#fbb924_66%)]" />
      <div className="container relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo clair />
          <p className="mt-4 max-w-xs text-creme/65">{CONFIG.slogan}</p>
          <p className="mt-6 text-sm text-creme/50">
            Fait au Cameroun, pour le Cameroun. <br />
            Hébergé sur GitHub Pages.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-soleil-300">Emploi par ville</h3>
          <ul className="mt-4 space-y-2 text-creme/70">
            {VILLES.slice(0, 7).map((v) => (
              <li key={v.nom}>
                <Link className="hover:text-white" to={`/offres?ville=${encodeURIComponent(v.nom)}`}>
                  Emploi {v.nom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-soleil-300">Par secteur</h3>
          <ul className="mt-4 space-y-2 text-creme/70">
            {SECTEURS.slice(0, 7).map((s) => (
              <li key={s.id}>
                <Link className="hover:text-white" to={`/offres?secteur=${s.id}`}>
                  {s.nom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-soleil-300">Melanyne Work</h3>
          <ul className="mt-4 space-y-2 text-creme/70">
            <li><Link className="hover:text-white" to="/recruteurs">Publier une offre</Link></li>
            <li><Link className="hover:text-white" to="/salaires">Baromètre des salaires</Link></li>
            <li><Link className="hover:text-white" to="/conseils">Conseils carrière</Link></li>
            <li><Link className="hover:text-white" to="/mon-espace">Mon espace</Link></li>
            <li><Link className="hover:text-white" to="/mentions-legales">Mentions légales</Link></li>
            <li><Link className="hover:text-white" to="/confidentialite">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="container relative flex flex-col gap-2 border-t border-creme/10 py-6 text-sm text-creme/45 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Melanyne Work</span>
        <span>Rappel : un recruteur sérieux ne vous demandera jamais d'argent pour un emploi.</span>
      </div>
    </footer>
  );
}
