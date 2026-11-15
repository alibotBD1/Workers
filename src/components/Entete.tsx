import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import { useEspace } from "@/lib/store";
import { CONFIG } from "@/lib/config";

const LIENS = [
  { to: "/offres", label: "Offres d'emploi" },
  { to: "/entreprises", label: "Entreprises" },
  { to: "/salaires", label: "Salaires" },
  { to: "/conseils", label: "Conseils" },
];

export default function Entete() {
  const [ouvert, setOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const favoris = useEspace((e) => e.favoris);
  const { pathname } = useLocation();

  useEffect(() => {
    setOuvert(false);
  }, [pathname]);
  useEffect(() => {
    const f = () => setDefile(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const lien = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-[15px] font-medium transition ${isActive ? "bg-foret-800/[.07] text-foret-800" : "text-encre/70 hover:text-encre"}`;

  return (
    <>
      {CONFIG.modeDemo && (
        <div className="bg-foret-950 px-4 py-1.5 text-center text-xs text-creme/80">
          Version de démonstration : les offres et entreprises affichées sont fictives.
        </div>
      )}
      <header className={`sticky top-0 z-40 transition ${defile ? "border-b border-encre/10 bg-creme/85 backdrop-blur-lg" : "bg-creme"}`}>
        <div className="container flex h-[68px] items-center justify-between gap-4">
          <Link to="/" aria-label="Melanyne Work, accueil">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {LIENS.map((l) => (
              <NavLink key={l.to} to={l.to} className={lien}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/mon-espace" className="btn-fantome relative">
              <UserRound className="h-4 w-4" /> Mon espace
              {favoris.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-full bg-terre-500 px-1 text-[10px] font-bold text-white">
                  <Heart className="h-2.5 w-2.5 fill-current" />
                  {favoris.length}
                </span>
              )}
            </Link>
            <Link to="/recruteurs" className="btn-soleil">
              Recruteurs
            </Link>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-encre/5 lg:hidden" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert} aria-label="Menu">
            {ouvert ? <X /> : <Menu />}
          </button>
        </div>
        {ouvert && (
          <nav className="container animate-monte border-t border-encre/10 pb-6 pt-3 lg:hidden" aria-label="Navigation mobile">
            <div className="flex flex-col">
              {[...LIENS, { to: "/mon-espace", label: `Mon espace${favoris.length ? ` (${favoris.length} favoris)` : ""}` }].map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `rounded-xl px-3 py-3 text-lg font-medium ${isActive ? "bg-foret-800/[.07] text-foret-800" : ""}`}>
                  {l.label}
                </NavLink>
              ))}
            </div>
            <Link to="/recruteurs" className="btn-soleil mt-4 w-full">
              Espace recruteurs
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
