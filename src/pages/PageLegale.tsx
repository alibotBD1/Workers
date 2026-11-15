import { CONFIG } from "@/lib/config";
import useSeo from "@/lib/useSeo";

export default function PageLegale({ type }: { type: "mentions" | "confidentialite" }) {
  const mentions = type === "mentions";
  useSeo(mentions ? "Mentions légales" : "Politique de confidentialité");
  return (
    <div className="conteneur-etroit py-14">
      <h1 className="text-4xl font-bold">{mentions ? "Mentions légales" : "Confidentialité"}</h1>
      <div className="prose-mw mt-8 text-[17px]">
        {mentions ? (
          <>
            <h2 className="mb-3 mt-8 text-xl font-bold">Éditeur</h2>
            <p>{CONFIG.nom} — à compléter : raison sociale, adresse du siège, numéro de contribuable (NIU), responsable de la publication.</p>
            <p>Contact : {CONFIG.contact}</p>
            <h2 className="mb-3 mt-8 text-xl font-bold">Hébergement</h2>
            <p>Site statique hébergé par GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis).</p>
            <h2 className="mb-3 mt-8 text-xl font-bold">Offres d'emploi</h2>
            <p>Les offres sont publiées sous la responsabilité des recruteurs. Chaque annonce est relue avant sa mise en ligne. Toute offre demandant un paiement au candidat est refusée.</p>
            {CONFIG.modeDemo && <p>En mode démonstration, les offres et entreprises affichées sont fictives.</p>}
          </>
        ) : (
          <>
            <p>
              <strong>Vos données restent chez vous.</strong> {CONFIG.nom} ne dispose d'aucun serveur ni d'aucune base de données utilisateurs. Votre profil, vos favoris, vos alertes et le suivi de vos candidatures sont enregistrés uniquement dans le stockage local de votre navigateur.
            </p>
            <p>Lorsque vous postulez, votre messagerie ou le site du recruteur s'ouvre : les informations transmises le sont directement entre vous et le recruteur.</p>
            <p>Vous pouvez effacer toutes vos données à tout moment depuis « Mon espace », ou en vidant les données du site dans votre navigateur.</p>
            <p>Le site n'utilise ni cookie publicitaire ni outil de suivi tiers.</p>
          </>
        )}
      </div>
    </div>
  );
}
