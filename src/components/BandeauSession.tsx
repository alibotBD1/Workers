import { useNavigate } from "react-router-dom";
import { deconnecter, useAuth } from "@/lib/auth";
import { ENVIRONNEMENT } from "@/lib/firebase";

/** Bandeaux d'avertissement : environnement de recette, session ouverte « en tant que ». */
export default function BandeauSession() {
  const { ouvertPar, profil } = useAuth();
  const nav = useNavigate();
  return (
    <>
      {ENVIRONNEMENT === "recette" && (
        <div className="bg-violet-700 px-4 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-white">Environnement de recette · données de test</div>
      )}
      {ouvertPar && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-terre-600 px-4 py-2 text-sm text-white">
          <span>Vous naviguez en tant que <strong>{profil ? `${profil.prenom} ${profil.nom}` : "cet utilisateur"}</strong> (session ouverte depuis le back office).</span>
          <button onClick={async () => { await deconnecter(); nav("/connexion?retour=/admin/utilisateurs"); }} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-terre-700">Quitter cette session</button>
        </div>
      )}
    </>
  );
}
