import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { firebaseActif } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { ArrowRight, BadgeCheck, Eye, Mail, Rocket, ShieldCheck, Wallet } from "lucide-react";
import Motif from "@/components/Motif";
import { CONTRATS, NIVEAUX, SECTEURS, TELETRAVAIL, VILLES } from "@/data/taxonomie";
import { CONFIG, urlNouvelleOffre } from "@/lib/config";
import { useCatalogue } from "@/data";
import { pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const VIDE = {
  titre: "",
  entreprise: "",
  ville: "Douala",
  contrat: "CDI",
  niveau: "Confirmé",
  teletravail: "Sur site",
  secteur: SECTEURS[0].nom,
  salaire_min: "",
  salaire_max: "",
  resume: "",
  missions: "",
  profil: "",
  competences: "",
  avantages: "",
  email: "",
  lien: "",
};

export default function Recruteurs() {
  useSeo("Recruteurs : publiez une offre gratuitement", "Publiez gratuitement vos offres d'emploi sur Workers et touchez les talents de tout le Cameroun.");
  const { offres: OFFRES } = useCatalogue();
  const { profil } = useAuth();
  const cta = profil?.role === "recruteur" ? "/recruteur?onglet=publier" : "/inscription?role=recruteur";
  const [f, setF] = useState(VIDE);
  const set = (k: keyof typeof VIDE) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    window.open(urlNouvelleOffre(f), "_blank", "noopener");
  };
  const parEmail = () => {
    const corps = Object.entries(f).map(([k, v]) => `${k.toUpperCase()} :\n${v}\n`).join("\n");
    window.location.href = `mailto:${CONFIG.contact}?subject=${encodeURIComponent(`Nouvelle offre — ${f.titre}`)}&body=${encodeURIComponent(corps)}`;
  };

  return (
    <>
      <section className="relative overflow-hidden bg-soleil-400">
        <Motif className="pointer-events-none absolute inset-0 text-foret-900" opacite={0.1} id="ndop-rec" />
        <div className="container relative grid gap-10 py-16 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-foret-800">Espace recruteurs</p>
            <h1 className="texte-equilibre mt-3 text-4xl font-bold leading-[1.05] sm:text-6xl">Recrutez les meilleurs talents du Cameroun.</h1>
            <p className="mt-5 max-w-xl text-lg text-encre/75">Publication gratuite, annonces vérifiées, candidats qui postulent directement chez vous. Pas d'intermédiaire, pas d'abonnement.</p>
            {firebaseActif ? (
              <Link to={cta} className="btn-primaire mt-8 !px-8 !py-4 !text-base">{profil?.role === "recruteur" ? "Publier une offre" : "Créer mon compte recruteur"} <ArrowRight className="h-5 w-5" /></Link>
            ) : (
              <a href="#publier" className="btn-primaire mt-8 !px-8 !py-4 !text-base">Publier une offre <ArrowRight className="h-5 w-5" /></a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: pluriel(OFFRES.length, "offre"), l: "en ligne" },
              { v: "0 FCFA", l: "pour publier" },
              { v: "10", l: "régions couvertes" },
              { v: "100 %", l: "des annonces relues" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/80 p-5 backdrop-blur">
                <p className="font-display text-3xl font-bold">{s.v}</p>
                <p className="text-sm text-encre/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { i: Rocket, t: "1. Décrivez le poste", d: "Remplissez le formulaire ci-dessous : missions, profil, salaire, contact." },
            { i: ShieldCheck, t: "2. Nous vérifions", d: "Chaque annonce est relue par l'équipe pour protéger les candidats des fausses offres." },
            { i: Eye, t: "3. Les candidats postulent", d: "Votre offre est en ligne et les candidatures arrivent directement par e-mail ou sur votre site." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="carte p-7">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-foret-800 text-soleil-400"><I className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-encre/65">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {firebaseActif ? (
        <section className="container">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-foret-900 p-10 text-creme sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold">Votre espace recruteur, gratuit.</h2>
              <p className="mt-2 text-creme/70">Publiez vos offres, recevez les candidatures avec CV et suivez chaque candidat au même endroit.</p>
            </div>
            <Link to={cta} className="btn-soleil !px-8 !py-4 !text-base">{profil?.role === "recruteur" ? "Publier une offre" : "Créer mon compte"} <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </section>
      ) : (
      <section id="publier" className="container scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <form onSubmit={soumettre} className="carte space-y-8 p-6 sm:p-10">
            <div>
              <h2 className="text-3xl font-bold">Publier une offre</h2>
              <p className="mt-2 text-encre/60">Les champs marqués * sont obligatoires.</p>
            </div>
            <Section titre="Le poste">
              <Champ label="Intitulé du poste *" pleine><input required className="champ" value={f.titre} onChange={set("titre")} placeholder="ex. Comptable confirmé·e" /></Champ>
              <Champ label="Entreprise *"><input required className="champ" value={f.entreprise} onChange={set("entreprise")} /></Champ>
              <Champ label="Ville *">
                <select className="champ" value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}</select>
              </Champ>
              <Champ label="Contrat"><select className="champ" value={f.contrat} onChange={set("contrat")}>{CONTRATS.map((c) => <option key={c}>{c}</option>)}</select></Champ>
              <Champ label="Expérience"><select className="champ" value={f.niveau} onChange={set("niveau")}>{NIVEAUX.map((c) => <option key={c}>{c}</option>)}</select></Champ>
              <Champ label="Mode de travail"><select className="champ" value={f.teletravail} onChange={set("teletravail")}>{TELETRAVAIL.map((c) => <option key={c}>{c}</option>)}</select></Champ>
              <Champ label="Secteur"><select className="champ" value={f.secteur} onChange={set("secteur")}>{SECTEURS.map((s) => <option key={s.id}>{s.nom}</option>)}</select></Champ>
              <Champ label="Salaire brut min. (FCFA / mois)"><input inputMode="numeric" className="champ" value={f.salaire_min} onChange={set("salaire_min")} placeholder="350000" /></Champ>
              <Champ label="Salaire brut max. (FCFA / mois)"><input inputMode="numeric" className="champ" value={f.salaire_max} onChange={set("salaire_max")} placeholder="500000" /></Champ>
            </Section>
            <Section titre="Description">
              <Champ label="Résumé du poste *" pleine><textarea required rows={3} className="champ" value={f.resume} onChange={set("resume")} placeholder="Deux ou trois phrases pour donner envie." /></Champ>
              <Champ label="Missions (une par ligne) *" pleine><textarea required rows={4} className="champ" value={f.missions} onChange={set("missions")} /></Champ>
              <Champ label="Profil recherché (une ligne par critère) *" pleine><textarea required rows={4} className="champ" value={f.profil} onChange={set("profil")} /></Champ>
              <Champ label="Compétences (séparées par des virgules)" pleine><input className="champ" value={f.competences} onChange={set("competences")} placeholder="Excel, SYSCOHADA, Sage" /></Champ>
              <Champ label="Avantages (un par ligne)" pleine><textarea rows={3} className="champ" value={f.avantages} onChange={set("avantages")} placeholder={"Assurance maladie\nPrime de transport"} /></Champ>
            </Section>
            <Section titre="Recevoir les candidatures">
              <Champ label="E-mail de candidature"><input type="email" className="champ" value={f.email} onChange={set("email")} placeholder="rh@entreprise.cm" /></Champ>
              <Champ label="ou lien vers votre page carrière"><input type="url" className="champ" value={f.lien} onChange={set("lien")} placeholder="https://" /></Champ>
            </Section>
            <div className="flex flex-col gap-3 border-t border-encre/10 pt-6 sm:flex-row">
              <button type="submit" className="btn-primaire !px-7 !py-3.5">Soumettre via GitHub <ArrowRight className="h-4 w-4" /></button>
              <button type="button" onClick={parEmail} className="btn-contour !py-3.5"><Mail className="h-4 w-4" /> Envoyer par e-mail</button>
            </div>
            <p className="text-xs text-encre/50">
              « Soumettre via GitHub » ouvre un formulaire pré-rempli (compte GitHub gratuit requis). Une fois l'annonce validée par l'équipe, elle est publiée automatiquement sur le site. Sans compte GitHub, choisissez « Envoyer par e-mail ».
            </p>
          </form>

          <aside className="space-y-4">
            {[
              { i: Wallet, t: "100 % gratuit", d: "Aucun frais pour publier. Et nous refusons toute offre qui demande de l'argent aux candidats." },
              { i: BadgeCheck, t: "Annonces vérifiées", d: "La relue manuelle rassure les candidats : vous recevez des candidatures plus sérieuses." },
              { i: Eye, t: "Affichez le salaire", d: "Une fourchette claire aide les candidats à se positionner et vous évite des entretiens inutiles." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="carte p-6">
                <I className="h-6 w-6 text-foret-600" />
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-encre/60">{d}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>
      )}
    </>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 text-xs font-bold uppercase tracking-widest text-terre-600">{titre}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Champ({ label, pleine, children }: { label: string; pleine?: boolean; children: ReactNode }) {
  return (
    <label className={pleine ? "sm:col-span-2" : ""}>
      <span className="etiquette">{label}</span>
      {children}
    </label>
  );
}
