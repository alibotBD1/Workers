import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import CarteAuth, { Alerte, BoutonGoogle, NonConfigure, Separateur } from "@/components/CarteAuth";
import { connecterAvecGoogle, connecterParEmail, motDePasseOublie, useAuth } from "@/lib/auth";
import { firebaseActif, messageErreur } from "@/lib/firebase";
import useSeo from "@/lib/useSeo";

export const destinationApres = (role?: string, retour?: string | null) =>
  retour && retour.startsWith("/") ? retour : role === "recruteur" ? "/recruteur" : "/mon-espace";

export default function Connexion() {
  useSeo("Connexion");
  const [sp] = useSearchParams();
  const retour = sp.get("retour");
  const nav = useNavigate();
  const { utilisateur, profil, pret } = useAuth();
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [occupe, setOccupe] = useState(false);

  if (!firebaseActif) return <NonConfigure />;
  if (pret && utilisateur && profil) return <Navigate to={destinationApres(profil.role, retour)} replace />;
  if (pret && utilisateur && !profil) return <Navigate to={`/inscription?etape=profil${retour ? `&retour=${encodeURIComponent(retour)}` : ""}`} replace />;

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    setOccupe(true);
    try {
      await connecterParEmail(email, mdp);
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setOccupe(false);
    }
  };
  const google = async () => {
    setErreur("");
    try {
      const nouveau = await connecterAvecGoogle();
      if (nouveau) nav(`/inscription?etape=profil${retour ? `&retour=${encodeURIComponent(retour)}` : ""}`);
    } catch (err) {
      setErreur(messageErreur(err));
    }
  };
  const oubli = async () => {
    if (!email) return setErreur("Saisissez d'abord votre e-mail ci-dessus.");
    try {
      await motDePasseOublie(email);
      setInfo("Un e-mail de réinitialisation vient de vous être envoyé.");
    } catch (err) {
      setErreur(messageErreur(err));
    }
  };

  return (
    <CarteAuth
      titre="Bon retour parmi nous"
      sousTitre="Connectez-vous pour postuler et suivre vos candidatures."
      aside={
        <>
          <p className="font-display text-3xl font-bold leading-tight">Votre carrière, au même endroit.</p>
          <ul className="mt-8 space-y-4 text-creme/80">
            {["Postulez en un clic avec votre profil", "Suivez l'avancement de chaque candidature", "Recevez des offres compatibles avec vous"].map((t) => (
              <li key={t} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-soleil-400" /> {t}</li>
            ))}
          </ul>
        </>
      }
    >
      {retour && <div className="mb-5"><Alerte type="info">Connectez-vous ou créez un compte gratuit pour continuer.</Alerte></div>}
      <BoutonGoogle onClick={google} />
      <Separateur />
      <form onSubmit={soumettre} className="space-y-4">
        <label className="block">
          <span className="etiquette">E-mail</span>
          <input type="email" required autoComplete="email" className="champ" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="etiquette">Mot de passe</span>
          <input type="password" required autoComplete="current-password" className="champ" value={mdp} onChange={(e) => setMdp(e.target.value)} />
        </label>
        <button type="button" onClick={oubli} className="text-sm font-semibold text-foret-700 hover:underline">Mot de passe oublié ?</button>
        {erreur && <Alerte>{erreur}</Alerte>}
        {info && <Alerte type="succes">{info}</Alerte>}
        <button type="submit" disabled={occupe} className="btn-primaire w-full !py-3.5">{occupe ? "Connexion…" : "Se connecter"}</button>
      </form>
      <p className="mt-8 text-center text-encre/60">
        Pas encore de compte ?{" "}
        <Link to={`/inscription${retour ? `?retour=${encodeURIComponent(retour)}` : ""}`} className="lien">Créer un compte gratuit</Link>
      </p>
    </CarteAuth>
  );
}
