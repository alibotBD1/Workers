import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { BriefcaseBusiness, Building2, CheckCircle2 } from "lucide-react";
import CarteAuth, { Alerte, BoutonGoogle, NonConfigure, Separateur } from "@/components/CarteAuth";
import { completerInscription, connecterAvecGoogle, inscrireParEmail, useAuth, type DonneesInscription, type Role } from "@/lib/auth";
import { firebaseActif, messageErreur } from "@/lib/firebase";
import { SECTEURS, VILLES } from "@/data/taxonomie";
import { destinationApres } from "./Connexion";
import useSeo from "@/lib/useSeo";

export default function Inscription() {
  useSeo("Créer un compte");
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const retour = sp.get("retour");
  const { utilisateur, profil, pret } = useAuth();
  const role = (sp.get("role") as Role | null) ?? null;
  const etapeProfil = sp.get("etape") === "profil" || Boolean(utilisateur && !profil);

  const [d, setD] = useState<DonneesInscription>({
    role: role ?? "candidat",
    prenom: utilisateur?.displayName?.split(" ")[0] ?? "",
    nom: utilisateur?.displayName?.split(" ").slice(1).join(" ") ?? "",
    telephone: "",
    ville: "",
    marketing: false,
  });
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [cgu, setCgu] = useState(false);
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);

  if (!firebaseActif) return <NonConfigure />;
  if (pret && utilisateur && profil) return <Navigate to={destinationApres(profil.role, retour)} replace />;

  const choisir = (r: Role) => {
    const n = new URLSearchParams(sp);
    n.set("role", r);
    setSp(n);
    setD({ ...d, role: r });
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!cgu) return setErreur("Merci d'accepter les conditions d'utilisation et la politique de confidentialité.");
    if (!/^\+?[\d\s-]{8,}$/.test(d.telephone)) return setErreur("Numéro de téléphone invalide.");
    if (!etapeProfil && mdp.length < 8) return setErreur("Le mot de passe doit contenir au moins 8 caractères.");
    setOccupe(true);
    try {
      const donnees = { ...d, role: role ?? d.role };
      if (etapeProfil) await completerInscription(donnees);
      else await inscrireParEmail(email, mdp, donnees);
      nav(destinationApres(donnees.role, retour) + (donnees.role === "candidat" && !retour ? "?onglet=profil&bienvenue=1" : ""), { replace: true });
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
      if (!nouveau) return; // compte existant : redirection automatique
      const n = new URLSearchParams(sp);
      n.set("etape", "profil");
      setSp(n);
    } catch (err) {
      setErreur(messageErreur(err));
    }
  };

  const aside = (
    <>
      <p className="font-display text-3xl font-bold leading-tight">{role === "recruteur" ? "Recrutez partout au Cameroun." : "Le job qui vous ressemble vous attend."}</p>
      <ul className="mt-8 space-y-4 text-creme/80">
        {(role === "recruteur"
          ? ["Publiez vos offres gratuitement", "Recevez et triez vos candidatures", "Suivez chaque candidat dans votre espace"]
          : ["Postulez en un clic avec votre CV enregistré", "Score de compatibilité sur chaque offre", "Suivi de toutes vos candidatures"]
        ).map((t) => (
          <li key={t} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-soleil-400" /> {t}</li>
        ))}
      </ul>
    </>
  );

  // Étape 1 : choix du type de compte
  if (!role) {
    return (
      <CarteAuth titre="Créer un compte" sousTitre="Gratuit, en moins d'une minute." aside={aside}>
        <div className="grid gap-4">
          {[
            { r: "candidat" as Role, i: BriefcaseBusiness, t: "Je cherche un emploi", d: "Postuler, sauvegarder des offres, suivre mes candidatures." },
            { r: "recruteur" as Role, i: Building2, t: "Je recrute", d: "Publier des offres et gérer les candidatures reçues." },
          ].map(({ r, i: I, t, d: desc }) => (
            <button key={r} onClick={() => choisir(r)} className="carte flex items-center gap-5 p-6 text-left transition hover:border-foret-400 hover:shadow-flotte">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-foret-100 text-foret-700"><I className="h-7 w-7" /></span>
              <span>
                <span className="block text-lg font-semibold">{t}</span>
                <span className="text-sm text-encre/60">{desc}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-encre/60">
          Déjà inscrit ? <Link to={`/connexion${retour ? `?retour=${encodeURIComponent(retour)}` : ""}`} className="lien">Se connecter</Link>
        </p>
      </CarteAuth>
    );
  }

  const set = (k: keyof DonneesInscription) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value });

  return (
    <CarteAuth
      titre={etapeProfil ? "Plus qu'une étape" : role === "recruteur" ? "Compte recruteur" : "Compte candidat"}
      sousTitre={etapeProfil ? "Complétez votre profil pour terminer l'inscription." : "Gratuit, en moins d'une minute."}
      aside={aside}
    >
      {!etapeProfil && (
        <>
          <BoutonGoogle onClick={google} />
          <Separateur />
        </>
      )}
      <form onSubmit={soumettre} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="etiquette">Prénom</span><input required className="champ" autoComplete="given-name" value={d.prenom} onChange={set("prenom")} /></label>
          <label><span className="etiquette">Nom</span><input required className="champ" autoComplete="family-name" value={d.nom} onChange={set("nom")} /></label>
          <label><span className="etiquette">Téléphone / WhatsApp</span><input required type="tel" className="champ" placeholder="+237 6XX XX XX XX" autoComplete="tel" value={d.telephone} onChange={set("telephone")} /></label>
          <label>
            <span className="etiquette">Ville</span>
            <select required className="champ" value={d.ville} onChange={set("ville")}>
              <option value="">— Choisir —</option>
              {VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}
              <option>Autre</option>
            </select>
          </label>
        </div>
        {role === "candidat" ? (
          <label className="block"><span className="etiquette">Métier recherché</span><input className="champ" placeholder="ex. Comptable, Développeur web…" value={d.metier ?? ""} onChange={set("metier")} /></label>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="etiquette">Entreprise</span><input required className="champ" autoComplete="organization" value={d.entreprise ?? ""} onChange={set("entreprise")} /></label>
            <label><span className="etiquette">Votre fonction</span><input required className="champ" placeholder="ex. Responsable RH" value={d.fonction ?? ""} onChange={set("fonction")} /></label>
            <label>
              <span className="etiquette">Secteur</span>
              <select required className="champ" value={d.secteurEntreprise ?? ""} onChange={set("secteurEntreprise")}>
                <option value="">— Choisir —</option>
                {SECTEURS.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </label>
          </div>
        )}
        {!etapeProfil && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="etiquette">E-mail</span><input required type="email" className="champ" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label><span className="etiquette">Mot de passe</span><input required type="password" minLength={8} className="champ" autoComplete="new-password" placeholder="8 caractères minimum" value={mdp} onChange={(e) => setMdp(e.target.value)} /></label>
          </div>
        )}
        <div className="space-y-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-encre/10">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" checked={cgu} onChange={(e) => setCgu(e.target.checked)} />
            <span>
              J'accepte les <Link to="/conditions" target="_blank" className="lien">conditions d'utilisation</Link> et la{" "}
              <Link to="/confidentialite" target="_blank" className="lien">politique de confidentialité</Link>. <span className="text-terre-600">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" checked={d.marketing} onChange={(e) => setD({ ...d, marketing: e.target.checked })} />
            <span className="text-encre/70">
              J'accepte de recevoir par e-mail, SMS ou WhatsApp des offres et des actualités de Workers et du groupe Melanyne adaptées à mon profil. (Facultatif, modifiable à tout moment.)
            </span>
          </label>
        </div>
        {erreur && <Alerte>{erreur}</Alerte>}
        <button type="submit" disabled={occupe} className="btn-primaire w-full !py-3.5">{occupe ? "Création…" : etapeProfil ? "Terminer l'inscription" : "Créer mon compte"}</button>
      </form>
      {!etapeProfil && (
        <p className="mt-8 text-center text-encre/60">
          Déjà inscrit ? <Link to={`/connexion${retour ? `?retour=${encodeURIComponent(retour)}` : ""}`} className="lien">Se connecter</Link>
          {" · "}
          <button onClick={() => { const n = new URLSearchParams(sp); n.delete("role"); setSp(n); }} className="lien">Changer de type de compte</button>
        </p>
      )}
    </CarteAuth>
  );
}
