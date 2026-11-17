import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CircleCheckBig, ExternalLink, FileText, LockKeyhole, Mail, Upload } from "lucide-react";
import Fenetre from "./Fenetre";
import type { Offre } from "@/data/types";
import { actions } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { candidater, envoyerCv } from "@/lib/donnees";
import { firebaseActif, messageErreur } from "@/lib/firebase";

/** Candidature : compte obligatoire quand la base est branchée, mode local sinon. */
export default function DialogueCandidature({ offre, ouverte, fermer }: { offre: Offre; ouverte: boolean; fermer: () => void }) {
  const { utilisateur, profil } = useAuth();
  const [envoye, setEnvoye] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const externe = Boolean(offre.candidature.url) && !offre.recruteurId;
  const retour = `/offres/${offre.slug}?postuler=1`;

  const fermerTout = () => {
    fermer();
    setTimeout(() => { setEnvoye(false); setErreur(""); }, 300);
  };

  const finaliser = async () => {
    actions.candidater({ slug: offre.slug, titre: offre.titre, entrepriseNom: offre.entrepriseNom, ville: offre.ville });
    if (firebaseActif && profil && !offre.demo) await candidater(offre, profil, message);
    if (externe) window.open(offre.candidature.url, "_blank", "noopener");
    else if (offre.candidature.email && !offre.recruteurId && !offre.demo) {
      const corps = `Bonjour,\n\nJe vous adresse ma candidature pour le poste « ${offre.titre} » publié sur Workers.\n\n${message}\n\n${profil?.cvUrl ? `Mon CV : ${profil.cvUrl}\n\n` : ""}${profil ? `${profil.prenom} ${profil.nom}\n${profil.telephone}\n${profil.email}` : ""}`;
      window.location.href = `mailto:${offre.candidature.email}?subject=${encodeURIComponent(`Candidature — ${offre.titre}`)}&body=${encodeURIComponent(corps)}`;
    }
    setEnvoye(true);
  };

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    setOccupe(true);
    try {
      await finaliser();
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setOccupe(false);
    }
  };

  const ajouterCv = async (f?: File) => {
    if (!f || !profil) return;
    setOccupe(true);
    try {
      await envoyerCv(profil.uid, f);
    } catch (err) {
      setErreur(err instanceof Error && !("code" in err) ? err.message : messageErreur(err));
    } finally {
      setOccupe(false);
    }
  };

  let contenu;
  if (envoye) {
    contenu = (
      <div className="py-4 text-center">
        <CircleCheckBig className="mx-auto h-14 w-14 text-foret-600" />
        <p className="mt-4 text-lg font-semibold">C'est noté !</p>
        <p className="mt-2 text-encre/65">
          {offre.demo
            ? "Cette offre est un exemple de démonstration : aucun message n'a été envoyé."
            : externe
              ? "Le site du recruteur s'est ouvert dans un nouvel onglet pour finaliser votre candidature. Nous l'avons ajoutée à votre suivi."
              : offre.recruteurId
                ? "Votre candidature et votre CV ont été transmis au recruteur. Vous serez informé·e de son avancement dans votre espace."
                : "Votre messagerie s'est ouverte avec un message pré-rempli : vérifiez-le puis envoyez-le."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/mon-espace?onglet=candidatures" className="btn-primaire" onClick={fermerTout}>Suivre mes candidatures</Link>
          <button className="btn-contour" onClick={fermerTout}>Continuer</button>
        </div>
      </div>
    );
  } else if (firebaseActif && !utilisateur) {
    contenu = (
      <div className="py-2 text-center">
        <LockKeyhole className="mx-auto h-12 w-12 text-foret-600" />
        <p className="mt-4 text-lg font-semibold">Créez votre compte pour postuler</p>
        <p className="mt-2 text-encre/65">Gratuit et rapide. Votre profil et votre CV seront réutilisés pour vos prochaines candidatures, et vous suivrez leur avancement.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to={`/inscription?role=candidat&retour=${encodeURIComponent(retour)}`} className="btn-primaire !py-3.5">Créer mon compte</Link>
          <Link to={`/connexion?retour=${encodeURIComponent(retour)}`} className="btn-contour !py-3.5">J'ai déjà un compte</Link>
        </div>
      </div>
    );
  } else if (firebaseActif && profil?.role === "recruteur") {
    contenu = <p className="py-6 text-center text-encre/70">Vous êtes connecté·e avec un compte recruteur. Utilisez un compte candidat pour postuler.</p>;
  } else if (firebaseActif && utilisateur && !profil) {
    contenu = (
      <div className="py-4 text-center">
        <p className="text-encre/70">Terminez votre inscription pour postuler.</p>
        <Link to={`/inscription?etape=profil&retour=${encodeURIComponent(retour)}`} className="btn-primaire mt-4">Compléter mon profil</Link>
      </div>
    );
  } else {
    contenu = (
      <form onSubmit={soumettre} className="space-y-4">
        <p className="rounded-xl bg-white p-3 text-sm text-encre/70"><strong className="text-encre">{offre.titre}</strong> · {offre.ville}</p>
        {profil && (
          <div className="rounded-xl bg-white p-4 text-sm ring-1 ring-encre/10">
            <p className="font-semibold">{profil.prenom} {profil.nom}</p>
            <p className="text-encre/60">{profil.email} · {profil.telephone}</p>
            {!externe && (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-encre/10 pt-3">
                {profil.cvUrl ? (
                  <span className="flex min-w-0 items-center gap-2 text-foret-700"><FileText className="h-4 w-4 shrink-0" /> <span className="truncate">{profil.cvNom}</span></span>
                ) : (
                  <span className="text-terre-700">Aucun CV enregistré</span>
                )}
                <label className="cursor-pointer whitespace-nowrap text-sm font-semibold text-foret-700 hover:underline">
                  <Upload className="mr-1 inline h-4 w-4" />{profil.cvUrl ? "Changer" : "Ajouter mon CV"}
                  <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => ajouterCv(e.target.files?.[0])} />
                </label>
              </div>
            )}
          </div>
        )}
        {!externe && (
          <label className="block">
            <span className="etiquette">Message au recruteur (facultatif)</span>
            <textarea rows={4} className="champ resize-y" placeholder="Quelques lignes sur votre motivation…" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        )}
        <p className="flex items-start gap-2 text-xs text-encre/55">
          {externe ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" /> : <Mail className="mt-0.5 h-4 w-4 shrink-0" />}
          {externe
            ? `Cette offre a été repérée sur ${offre.source?.nom ?? "le site du recruteur"}. Vous allez être redirigé·e vers sa page de candidature.`
            : offre.recruteurId
              ? "Votre profil, votre message et votre CV seront transmis uniquement à ce recruteur. Il peut s'aider d'une analyse automatique de votre CV (critères professionnels uniquement) ; la décision reste humaine."
              : "Votre messagerie s'ouvrira avec un message pré-rempli contenant le lien vers votre CV."}
        </p>
        {erreur && <p role="alert" className="rounded-xl border border-terre-200 bg-terre-50 px-4 py-3 text-sm text-terre-800">{erreur}</p>}
        <button type="submit" disabled={occupe} className="btn-primaire w-full !py-3.5">
          {occupe ? "Envoi…" : externe ? "Continuer vers la candidature" : "Envoyer ma candidature"}
        </button>
      </form>
    );
  }

  return (
    <Fenetre ouverte={ouverte} fermer={fermerTout} titre={envoye ? "Candidature enregistrée" : `Postuler — ${offre.entrepriseNom}`}>
      {contenu}
    </Fenetre>
  );
}
