import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CircleCheckBig, ExternalLink, Mail } from "lucide-react";
import Fenetre from "./Fenetre";
import type { Offre } from "@/data/types";
import { actions, useEspace } from "@/lib/store";

export default function DialogueCandidature({ offre, ouverte, fermer }: { offre: Offre; ouverte: boolean; fermer: () => void }) {
  const profil = useEspace((e) => e.profil);
  const [envoye, setEnvoye] = useState(false);
  const [form, setForm] = useState({ nom: profil?.prenom ?? "", email: "", tel: "", message: "" });

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    actions.candidater({ slug: offre.slug, titre: offre.titre, entrepriseNom: offre.entrepriseNom, ville: offre.ville });
    if (offre.candidature.url) {
      window.open(offre.candidature.url, "_blank", "noopener");
    } else if (offre.candidature.email && !offre.demo) {
      const corps = `Bonjour,\n\nJe vous adresse ma candidature pour le poste « ${offre.titre} » publié sur Melanyne Work.\n\n${form.message}\n\nVous trouverez mon CV en pièce jointe.\n\n${form.nom}\n${form.tel}\n${form.email}`;
      window.location.href = `mailto:${offre.candidature.email}?subject=${encodeURIComponent(`Candidature — ${offre.titre}`)}&body=${encodeURIComponent(corps)}`;
    }
    setEnvoye(true);
  };

  const fermerTout = () => {
    fermer();
    setTimeout(() => setEnvoye(false), 300);
  };

  return (
    <Fenetre ouverte={ouverte} fermer={fermerTout} titre={envoye ? "Candidature enregistrée" : `Postuler — ${offre.entrepriseNom}`}>
      {envoye ? (
        <div className="py-4 text-center">
          <CircleCheckBig className="mx-auto h-14 w-14 text-foret-600" />
          <p className="mt-4 text-lg font-semibold">C'est noté !</p>
          <p className="mt-2 text-encre/65">
            {offre.demo
              ? "Cette offre est un exemple de démonstration : aucun message n'a été envoyé. La candidature apparaît quand même dans votre espace pour que vous puissiez tester le suivi."
              : offre.candidature.url
                ? "Le site du recruteur s'est ouvert dans un nouvel onglet pour finaliser votre candidature."
                : "Votre messagerie s'est ouverte avec un message pré-rempli : n'oubliez pas de joindre votre CV avant d'envoyer."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/mon-espace?onglet=candidatures" className="btn-primaire" onClick={fermerTout}>
              Suivre mes candidatures
            </Link>
            <button className="btn-contour" onClick={fermerTout}>
              Continuer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={soumettre} className="space-y-4">
          <p className="rounded-xl bg-white p-3 text-sm text-encre/70">
            <strong className="text-encre">{offre.titre}</strong> · {offre.ville}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="etiquette">Nom complet</span>
              <input required className="champ" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} autoComplete="name" />
            </label>
            <label>
              <span className="etiquette">Téléphone / WhatsApp</span>
              <input required className="champ" type="tel" placeholder="+237 6XX XX XX XX" value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} autoComplete="tel" />
            </label>
          </div>
          <label className="block">
            <span className="etiquette">E-mail</span>
            <input required className="champ" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </label>
          <label className="block">
            <span className="etiquette">Message au recruteur (facultatif)</span>
            <textarea rows={4} className="champ resize-y" placeholder="Quelques lignes sur votre motivation…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </label>
          <p className="flex items-start gap-2 text-xs text-encre/55">
            {offre.candidature.url ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" /> : <Mail className="mt-0.5 h-4 w-4 shrink-0" />}
            {offre.candidature.url
              ? "Vous serez redirigé vers le site du recruteur pour joindre votre CV."
              : "Votre messagerie s'ouvrira avec un message pré-rempli ; vous y joindrez votre CV. Melanyne Work ne stocke aucune donnée sur ses serveurs."}
          </p>
          <button type="submit" className="btn-primaire w-full !py-3.5">
            Envoyer ma candidature
          </button>
        </form>
      )}
    </Fenetre>
  );
}
