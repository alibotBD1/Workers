import type { ReactNode } from "react";
import { CONFIG } from "@/lib/config";
import { firebaseActif } from "@/lib/firebase";
import useSeo from "@/lib/useSeo";

const H = ({ children }: { children: ReactNode }) => <h2 className="mb-3 mt-10 text-xl font-bold">{children}</h2>;

export default function PageLegale({ type }: { type: "mentions" | "confidentialite" | "conditions" }) {
  const titres = { mentions: "Mentions légales", confidentialite: "Politique de confidentialité", conditions: "Conditions d'utilisation" };
  useSeo(titres[type]);
  return (
    <div className="conteneur-etroit py-14">
      <h1 className="text-4xl font-bold">{titres[type]}</h1>
      <p className="mt-2 text-sm text-encre/50">Dernière mise à jour : novembre 2026 · Document à faire valider par un juriste avant la mise en production.</p>
      <div className="prose-mw mt-6 text-[17px]">
        {type === "mentions" && <Mentions />}
        {type === "confidentialite" && <Confidentialite />}
        {type === "conditions" && <Conditions />}
      </div>
    </div>
  );
}

function Mentions() {
  return (
    <>
      <H>Éditeur</H>
      <p>{CONFIG.nom} ({CONFIG.domaine}) est une application éditée par le groupe {CONFIG.groupe} — <a className="lien" href={CONFIG.siteGroupe} target="_blank" rel="noopener">melanyne.com</a>.</p>
      <p>Raison sociale, adresse du siège, numéro de contribuable (NIU) et responsable de la publication : [à compléter].</p>
      <p>Contact : <a className="lien" href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a></p>
      <H>Hébergement</H>
      <p>Site : GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis).</p>
      {firebaseActif && <p>Comptes, base de données et fichiers : Google Firebase (Google LLC / Google Cloud), région de stockage indiquée dans la politique de confidentialité.</p>}
      <H>Offres d'emploi</H>
      <p>Les offres sont publiées sous la responsabilité des recruteurs. Les offres repérées automatiquement sur des sites tiers sont résumées par Workers et renvoient vers l'annonce d'origine. Toute offre demandant un paiement au candidat est refusée.</p>
      {CONFIG.modeDemo && <p>En mode démonstration, certaines offres et entreprises affichées sont fictives.</p>}
    </>
  );
}

function Confidentialite() {
  return (
    <>
      <p>
        Cette politique explique quelles données personnelles {CONFIG.nom} collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits, conformément à la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel au Cameroun et, pour les personnes situées dans l'Union européenne, au RGPD.
      </p>
      <H>Responsable du traitement</H>
      <p>Groupe {CONFIG.groupe}, éditeur de {CONFIG.nom}. Contact pour toute question relative à vos données : <a className="lien" href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a>. Délégué à la protection des données : [à désigner].</p>

      <H>Données collectées</H>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-encre/80">
        <li><strong>Compte candidat</strong> : prénom, nom, e-mail, téléphone, ville, métier recherché, expérience, compétences, contrats et secteurs souhaités, CV.</li>
        <li><strong>Compte recruteur</strong> : prénom, nom, e-mail, téléphone, ville, entreprise, fonction, secteur, taille de l'entreprise.</li>
        <li><strong>Candidatures</strong> : offre concernée, message, CV transmis, statut.</li>
        <li><strong>Données de connexion et de provenance</strong> : dates d'inscription et de dernière connexion, site ou campagne d'origine (paramètres utm).</li>
        <li><strong>Mesure d'audience</strong> (uniquement si vous l'acceptez) : pages consultées, type d'appareil, pays, via Google Analytics.</li>
      </ul>

      <H>Finalités et bases légales</H>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-encre/80">
        <li>Créer et gérer votre compte, publier des offres, transmettre vos candidatures aux recruteurs choisis — <em>exécution du service que vous demandez</em>.</li>
        <li>Calculer votre compatibilité avec les offres et vous recommander des offres — <em>exécution du service</em>.</li>
        <li>Pour les recruteurs ayant activé le module Insight : analyser automatiquement le CV joint à votre candidature (score d'adéquation, résumé, compétences présentes ou manquantes) afin d'aider le recruteur à trier les candidatures — <em>intérêt légitime du recruteur et de {CONFIG.nom}</em>. L'analyse porte uniquement sur des critères professionnels ; l'âge, le sexe, la photo, l'origine, la religion ou la situation familiale sont exclus. Elle ne prend aucune décision : le recruteur examine chaque candidature. Vous pouvez demander à connaître le résultat de l'analyse vous concernant, présenter vos observations ou vous y opposer en écrivant à {CONFIG.contact}.</li>
        <li>Mesurer l'audience et la provenance des utilisateurs pour améliorer le service — <em>votre consentement</em> (bandeau de statistiques).</li>
        <li>Vous envoyer des offres et actualités de {CONFIG.nom} et du groupe {CONFIG.groupe} par e-mail, SMS ou WhatsApp, adaptées à votre profil — <em>votre consentement</em>, que vous pouvez retirer à tout moment dans « Mes données ».</li>
        <li>Sécuriser la plateforme, lutter contre la fraude et les fausses offres, tenir un journal des actions d'administration — <em>intérêt légitime</em>.</li>
        <li>Facturation des recruteurs — <em>obligation légale et contractuelle</em>.</li>
      </ul>

      <H>Destinataires</H>
      <p>Votre CV et votre candidature ne sont transmis qu'au recruteur de l'offre à laquelle vous postulez. Les administrateurs habilités de {CONFIG.nom} peuvent accéder aux comptes pour l'assistance et la modération ; chaque accès sensible est enregistré. Nous ne vendons pas vos données.</p>
      <p>Sous-traitants techniques : Google (Firebase : authentification, base de données, stockage, statistiques), GitHub (hébergement du site), Anthropic (Anthropic PBC, États-Unis : reformulation des offres d'emploi publiques collectées et, pour les recruteurs ayant activé Insight, analyse du CV joint à une candidature ; Anthropic agit comme sous-traitant et n'utilise pas ces données pour entraîner ses modèles selon ses conditions commerciales — à vérifier dans le contrat souscrit).</p>

      <H>Lieu de stockage et transferts</H>
      <p>Les données sont stockées par Google Cloud dans la région [africa-south1, Johannesburg — à confirmer]. Ce stockage hors du Cameroun constitue un transfert soumis à l'autorisation de l'Autorité de protection des données à caractère personnel ; {CONFIG.nom} s'engage à accomplir ces formalités avant la mise en production. L'analyse des CV par le module Insight implique en outre un transfert vers les États-Unis (Anthropic), soumis à la même autorisation.</p>

      <H>Durées de conservation</H>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-encre/80">
        <li>Compte et CV : tant que le compte est actif, puis suppression après 24 mois sans connexion.</li>
        <li>Candidatures et analyses IA des CV : 24 mois après l'envoi de la candidature.</li>
        <li>Consentement marketing : jusqu'à son retrait, ou 3 ans sans activité.</li>
        <li>Données de facturation : durée imposée par la loi fiscale.</li>
        <li>Journal d'audit : 12 mois.</li>
      </ul>

      <H>Vos droits</H>
      <p>Vous disposez d'un droit d'accès, de rectification, d'opposition, d'effacement et de retrait de votre consentement. Depuis votre espace (« Mes données »), vous pouvez modifier votre profil, télécharger vos données, changer vos préférences de communication et supprimer votre compte. Pour toute autre demande : <a className="lien" href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a>. Vous pouvez aussi saisir l'Autorité de protection des données à caractère personnel.</p>

      <H>Sécurité</H>
      <p>Les échanges sont chiffrés (HTTPS). L'accès aux données est limité par des règles de sécurité : chaque utilisateur n'accède qu'à ses propres données, un recruteur ne voit que les candidatures reçues pour ses offres.</p>

      <H>Stockage local</H>
      <p>Vos favoris, alertes et préférences d'affichage sont aussi enregistrés dans votre navigateur. Ils sont effacés à la déconnexion.</p>
    </>
  );
}

function Conditions() {
  return (
    <>
      <H>Objet</H>
      <p>{CONFIG.nom} met en relation des candidats et des recruteurs au Cameroun. L'inscription est gratuite pour les candidats. Certaines options pour les recruteurs peuvent être payantes, selon les conditions communiquées avant toute commande.</p>
      <H>Compte</H>
      <p>Vous vous engagez à fournir des informations exactes et à garder votre mot de passe confidentiel. Un compte est personnel. {CONFIG.nom} peut suspendre un compte en cas d'usage frauduleux, d'informations fausses ou de non-respect des présentes conditions.</p>
      <H>Engagements des recruteurs</H>
      <p>Les offres doivent correspondre à un poste réel, respecter la législation du travail camerounaise et ne comporter aucune discrimination. Il est strictement interdit de demander de l'argent aux candidats. Les données des candidats reçues via {CONFIG.nom} ne peuvent être utilisées que pour le recrutement concerné.</p>
      <H>Engagements des candidats</H>
      <p>Vous vous engagez à transmettre des informations sincères. Votre CV n'est envoyé qu'aux recruteurs auxquels vous postulez.</p>
      <H>Offres collectées</H>
      <p>Certaines offres sont repérées sur des sites publics, résumées et liées à leur source. {CONFIG.nom} ne garantit pas leur disponibilité : la candidature se fait sur le site d'origine.</p>
      <H>Responsabilité</H>
      <p>{CONFIG.nom} vérifie les offres mais ne peut garantir l'issue d'un recrutement. Signalez toute offre suspecte à <a className="lien" href={`mailto:${CONFIG.contact}`}>{CONFIG.contact}</a>.</p>
      <H>Droit applicable</H>
      <p>Les présentes conditions sont soumises au droit camerounais.</p>
    </>
  );
}
