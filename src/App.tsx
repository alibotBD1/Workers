import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Entete from "@/components/Entete";
import PiedDePage from "@/components/PiedDePage";
import Accueil from "@/pages/Accueil";
import Offres from "@/pages/Offres";
import Offre from "@/pages/Offre";
import BandeauConsentement from "@/components/BandeauConsentement";
import { firebaseActif } from "@/lib/firebase";

const Entreprises = lazy(() => import("@/pages/Entreprises"));
const Entreprise = lazy(() => import("@/pages/Entreprise"));
const Salaires = lazy(() => import("@/pages/Salaires"));
const Conseils = lazy(() => import("@/pages/Conseils"));
const Article = lazy(() => import("@/pages/Article"));
const MonEspaceLocal = lazy(() => import("@/pages/MonEspaceLocal"));
const EspaceCandidat = lazy(() => import("@/pages/compte/EspaceCandidat"));
const EspaceRecruteur = lazy(() => import("@/pages/compte/EspaceRecruteur"));
const Connexion = lazy(() => import("@/pages/compte/Connexion"));
const Inscription = lazy(() => import("@/pages/compte/Inscription"));
const Admin = lazy(() => import("@/pages/admin/Admin"));
const Recruteurs = lazy(() => import("@/pages/Recruteurs"));
const PageLegale = lazy(() => import("@/pages/PageLegale"));
const Introuvable = lazy(() => import("@/pages/Introuvable"));

function RemonteEnHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith("/admin");
  return (
    <div className="flex min-h-screen flex-col">
      <RemonteEnHaut />
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn-soleil">
        Aller au contenu
      </a>
      {!admin && <Entete />}
      <main id="contenu" className="flex-1">
        <Suspense fallback={<div className="container py-24 text-center text-encre/50">Chargement…</div>}>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/offres" element={<Offres />} />
            <Route path="/offres/:slug" element={<Offre />} />
            <Route path="/entreprises" element={<Entreprises />} />
            <Route path="/entreprises/:slug" element={<Entreprise />} />
            <Route path="/salaires" element={<Salaires />} />
            <Route path="/conseils" element={<Conseils />} />
            <Route path="/conseils/:slug" element={<Article />} />
            <Route path="/mon-espace" element={firebaseActif ? <EspaceCandidat /> : <MonEspaceLocal />} />
            <Route path="/recruteur" element={<EspaceRecruteur />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/recruteurs" element={<Recruteurs />} />
            <Route path="/mentions-legales" element={<PageLegale type="mentions" />} />
            <Route path="/confidentialite" element={<PageLegale type="confidentialite" />} />
            <Route path="/conditions" element={<PageLegale type="conditions" />} />
            <Route path="*" element={<Introuvable />} />
          </Routes>
        </Suspense>
      </main>
      {!admin && <PiedDePage />}
      {!admin && <BandeauConsentement />}
    </div>
  );
}
