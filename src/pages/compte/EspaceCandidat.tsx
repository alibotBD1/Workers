import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { BellRing, BriefcaseBusiness, Download, ExternalLink, FileText, Heart, LogOut, ShieldCheck, Sparkles, Trash2, Upload, UserRound, X } from "lucide-react";
import CarteOffre from "@/components/CarteOffre";
import Vide from "@/components/Vide";
import { Alerte } from "@/components/CarteAuth";
import { offreParSlug, useCatalogue } from "@/data";
import { CONTRATS, SECTEURS, VILLES, type Contrat } from "@/data/taxonomie";
import { deconnecter, exporterMesDonnees, majConsentementMarketing, majProfil, supprimerMonCompte, useAuth, type Utilisateur } from "@/lib/auth";
import { envoyerCv, mesCandidatures, retirerCandidature, type CandidatureBase } from "@/lib/donnees";
import { messageErreur } from "@/lib/firebase";
import { actions, useEspace } from "@/lib/store";
import { compatibilite } from "@/lib/recherche";
import { dateLongue, ilYa, pluriel } from "@/lib/format";
import useSeo from "@/lib/useSeo";

const ONGLETS = [
  { id: "candidatures", label: "Candidatures", icone: BriefcaseBusiness },
  { id: "favoris", label: "Favoris", icone: Heart },
  { id: "alertes", label: "Alertes", icone: BellRing },
  { id: "profil", label: "Profil & CV", icone: UserRound },
  { id: "donnees", label: "Mes données", icone: ShieldCheck },
] as const;

const couleurStatut: Record<string, string> = {
  Envoyée: "bg-sky-100 text-sky-800",
  Vue: "bg-soleil-100 text-soleil-800",
  Entretien: "bg-violet-100 text-violet-800",
  Retenue: "bg-foret-100 text-foret-800",
  "Non retenue": "bg-stone-200 text-stone-700",
};

export default function EspaceCandidat() {
  useSeo("Mon espace");
  const { pret, utilisateur, profil } = useAuth();
  const [sp, setSp] = useSearchParams();
  const onglet = sp.get("onglet") ?? "candidatures";
  const favoris = useEspace((e) => e.favoris);
  const alertes = useEspace((e) => e.alertes);
  const profilLocal = useEspace((e) => e.profil);
  const { offres } = useCatalogue();
  const [cands, setCands] = useState<CandidatureBase[] | null>(null);

  useEffect(() => {
    if (profil?.role === "candidat") mesCandidatures(profil.uid).then(setCands).catch(() => setCands([]));
  }, [profil?.uid, profil?.role]);

  if (!pret) return <div className="container py-24 text-center text-encre/50">Chargement…</div>;
  if (!utilisateur) return <Navigate to="/connexion?retour=/mon-espace" replace />;
  if (!profil) return <Navigate to="/inscription?etape=profil" replace />;
  if (profil.role === "recruteur") return <Navigate to="/recruteur" replace />;

  const recommandees = profilLocal
    ? offres.map((o) => ({ o, c: compatibilite(o, profilLocal) })).filter((x) => x.c >= 40 && !cands?.some((c) => c.offreSlug === x.o.slug)).sort((a, b) => b.c - a.c).slice(0, 4)
    : [];
  const completude = [profil.telephone, profil.ville, profil.metier, profil.competences?.length, profil.cvUrl].filter(Boolean).length * 20;

  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1 className="mt-2 text-4xl font-bold">Bonjour {profil.prenom} 👋</h1>
          {sp.get("bienvenue") && <p className="mt-2 text-foret-700">Bienvenue sur Workers ! Complétez votre profil et ajoutez votre CV pour postuler en un clic.</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-48">
            <div className="flex justify-between text-xs font-semibold text-encre/60"><span>Profil complété</span><span>{completude} %</span></div>
            <div className="mt-1 h-2 rounded-full bg-encre/10"><div className="h-2 rounded-full bg-foret-600" style={{ width: `${completude}%` }} /></div>
          </div>
          <button onClick={deconnecter} className="btn-fantome"><LogOut className="h-4 w-4" /> Déconnexion</button>
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl bg-encre/[.05] p-1" role="tablist">
        {ONGLETS.map(({ id, label, icone: I }) => (
          <button key={id} role="tab" aria-selected={onglet === id} onClick={() => setSp({ onglet: id })}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${onglet === id ? "bg-white text-encre shadow-carte" : "text-encre/60 hover:text-encre"}`}>
            <I className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {onglet === "candidatures" && (
          <div className="space-y-10">
            {cands === null ? (
              <p className="text-encre/50">Chargement…</p>
            ) : cands.length ? (
              <div className="carte divide-y divide-encre/[.07]">
                {cands.map((c) => (
                  <div key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      {offreParSlug(c.offreSlug) ? <Link to={`/offres/${c.offreSlug}`} className="font-semibold hover:text-foret-700">{c.offreTitre}</Link> : <span className="font-semibold">{c.offreTitre}</span>}
                      <p className="text-sm text-encre/55">{c.entrepriseNom} · {c.ville} · {ilYa(c.creeLe)}</p>
                    </div>
                    {c.externe ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-encre/5 px-3 py-1.5 text-xs font-semibold text-encre/60"><ExternalLink className="h-3.5 w-3.5" /> Sur le site du recruteur</span>
                    ) : (
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${couleurStatut[c.statut] ?? ""}`}>{c.statut}</span>
                    )}
                    <button onClick={async () => { await retirerCandidature(c.id); setCands(cands.filter((x) => x.id !== c.id)); }} className="grid h-9 w-9 place-items-center rounded-full text-encre/40 hover:bg-terre-50 hover:text-terre-600" aria-label="Retirer de la liste">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Vide icone={<BriefcaseBusiness className="h-6 w-6" />} titre="Aucune candidature pour l'instant" texte="Vos candidatures et leur avancement apparaîtront ici." action={<Link to="/offres" className="btn-primaire">Parcourir les offres</Link>} />
            )}
            {recommandees.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="h-5 w-5 text-soleil-500" /> Recommandées pour vous</h2>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">{recommandees.map(({ o, c }) => <CarteOffre key={o.slug} offre={o} compat={c} />)}</div>
              </section>
            )}
          </div>
        )}

        {onglet === "favoris" &&
          (favoris.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {favoris.map((s) => offreParSlug(s)).filter(Boolean).map((o) => <CarteOffre key={o!.slug} offre={o!} compat={profilLocal ? compatibilite(o!, profilLocal) : null} />)}
            </div>
          ) : (
            <Vide icone={<Heart className="h-6 w-6" />} titre="Pas encore de favoris" texte="Touchez le cœur sur une offre pour la retrouver ici." action={<Link to="/offres" className="btn-primaire">Découvrir les offres</Link>} />
          ))}

        {onglet === "alertes" &&
          (alertes.length ? (
            <div className="space-y-3">
              {alertes.map((a) => {
                const q = new URLSearchParams();
                if (a.q) q.set("q", a.q);
                if (a.ville) q.set("ville", a.ville);
                if (a.contrat) q.set("contrat", a.contrat);
                const depuis = offres.filter((o) => o.publieeLe > a.creeeLe).length;
                return (
                  <div key={a.id} className="carte flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <BellRing className="h-6 w-6 shrink-0 text-soleil-600" />
                    <div className="flex-1">
                      <p className="font-semibold">{[a.q || "Toutes les offres", a.ville && `à ${a.ville}`, a.contrat && `(${a.contrat.replace(/,/g, ", ")})`].filter(Boolean).join(" ")}</p>
                      <p className="text-sm text-encre/55">Créée le {dateLongue(a.creeeLe)}{depuis ? ` · ${pluriel(depuis, "nouvelle offre", "nouvelles offres")} depuis` : ""}</p>
                    </div>
                    <Link to={`/offres?${q}&tri=recent`} className="btn-contour">Voir les offres</Link>
                    <button onClick={() => actions.retirerAlerte(a.id)} className="grid h-9 w-9 place-items-center rounded-full text-encre/40 hover:bg-terre-50 hover:text-terre-600" aria-label="Supprimer l'alerte"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
          ) : (
            <Vide icone={<BellRing className="h-6 w-6" />} titre="Aucune alerte" texte="Lancez une recherche puis cliquez sur « Créer une alerte »." action={<Link to="/offres" className="btn-primaire">Lancer une recherche</Link>} />
          ))}

        {onglet === "profil" && <ProfilCandidat profil={profil} />}
        {onglet === "donnees" && <MesDonnees profil={profil} />}
      </div>
    </div>
  );
}

function ProfilCandidat({ profil }: { profil: Utilisateur }) {
  const { offres } = useCatalogue();
  const [p, setP] = useState({
    prenom: profil.prenom, nom: profil.nom, telephone: profil.telephone, ville: profil.ville, metier: profil.metier ?? "",
    experience: profil.experience ?? "", competences: profil.competences ?? [], contrats: profil.contrats ?? [], secteurs: profil.secteurs ?? [],
  });
  const [saisie, setSaisie] = useState("");
  const [msg, setMsg] = useState<{ t: "succes" | "erreur"; m: string } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const ajouter = () => {
    const n = saisie.split(",").map((s) => s.trim()).filter((s) => s && !p.competences.includes(s));
    if (n.length) setP({ ...p, competences: [...p.competences, ...n] });
    setSaisie("");
  };
  const touche = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); ajouter(); } };
  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await majProfil(profil.uid, p);
      setMsg({ t: "succes", m: "Profil enregistré." });
    } catch (err) {
      setMsg({ t: "erreur", m: messageErreur(err) });
    }
  };
  const cv = async (f?: File) => {
    if (!f) return;
    setEnvoi(true);
    setMsg(null);
    try {
      await envoyerCv(profil.uid, f);
      setMsg({ t: "succes", m: "CV enregistré. Il sera joint à vos prochaines candidatures." });
    } catch (err) {
      setMsg({ t: "erreur", m: err instanceof Error && !("code" in err) ? err.message : messageErreur(err) });
    } finally {
      setEnvoi(false);
    }
  };
  const suggestions = [...new Set(offres.flatMap((o) => o.competences))].sort().filter((c) => !p.competences.includes(c) && (!saisie || c.toLowerCase().includes(saisie.toLowerCase()))).slice(0, 10);
  const basculer = <T extends string>(liste: T[], v: T) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);

  return (
    <form onSubmit={soumettre} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="carte space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label><span className="etiquette">Prénom</span><input className="champ" value={p.prenom} onChange={(e) => setP({ ...p, prenom: e.target.value })} /></label>
          <label><span className="etiquette">Nom</span><input className="champ" value={p.nom} onChange={(e) => setP({ ...p, nom: e.target.value })} /></label>
          <label><span className="etiquette">Téléphone / WhatsApp</span><input className="champ" value={p.telephone} onChange={(e) => setP({ ...p, telephone: e.target.value })} /></label>
          <label><span className="etiquette">Ville</span><select className="champ" value={p.ville} onChange={(e) => setP({ ...p, ville: e.target.value })}>{VILLES.map((v) => <option key={v.nom}>{v.nom}</option>)}<option>Autre</option></select></label>
          <label><span className="etiquette">Métier recherché</span><input className="champ" value={p.metier} onChange={(e) => setP({ ...p, metier: e.target.value })} /></label>
          <label><span className="etiquette">Expérience</span><select className="champ" value={p.experience} onChange={(e) => setP({ ...p, experience: e.target.value })}><option value="">—</option>{["Moins d'1 an", "1 à 3 ans", "3 à 5 ans", "5 à 10 ans", "Plus de 10 ans"].map((x) => <option key={x}>{x}</option>)}</select></label>
        </div>
        <div>
          <span className="etiquette">Compétences</span>
          <div className="champ flex min-h-[52px] flex-wrap items-center gap-2 !py-2">
            {p.competences.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-foret-700 py-1 pl-3 pr-1.5 text-sm font-medium text-creme">
                {c}<button type="button" onClick={() => setP({ ...p, competences: p.competences.filter((x) => x !== c) })} className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/20" aria-label={`Retirer ${c}`}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <input value={saisie} onChange={(e) => setSaisie(e.target.value)} onKeyDown={touche} onBlur={ajouter} placeholder={p.competences.length ? "" : "Tapez puis Entrée"} className="min-w-[140px] flex-1 bg-transparent py-1 focus:outline-none" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => <button type="button" key={s} onClick={() => setP({ ...p, competences: [...p.competences, s] })} className="rounded-full border border-dashed border-encre/20 px-2.5 py-1 text-xs text-encre/70 hover:border-foret-500 hover:text-foret-700">+ {s}</button>)}
          </div>
        </div>
        <fieldset>
          <legend className="etiquette">Contrats souhaités</legend>
          <div className="flex flex-wrap gap-2">
            {CONTRATS.map((c) => <button type="button" key={c} aria-pressed={p.contrats.includes(c)} onClick={() => setP({ ...p, contrats: basculer<Contrat>(p.contrats, c) })} className={`rounded-full border px-4 py-2 text-sm font-medium ${p.contrats.includes(c) ? "border-foret-700 bg-foret-800 text-creme" : "border-encre/15 bg-white"}`}>{c}</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="etiquette">Secteurs</legend>
          <div className="flex flex-wrap gap-2">
            {SECTEURS.map((s) => <button type="button" key={s.id} aria-pressed={p.secteurs.includes(s.id)} onClick={() => setP({ ...p, secteurs: basculer(p.secteurs, s.id) })} className={`rounded-full border px-3.5 py-2 text-sm ${p.secteurs.includes(s.id) ? "border-foret-700 bg-foret-800 text-creme" : "border-encre/15 bg-white"}`}>{s.emoji} {s.nom}</button>)}
          </div>
        </fieldset>
        {msg && <Alerte type={msg.t}>{msg.m}</Alerte>}
        <button type="submit" className="btn-primaire !px-8 !py-3.5">Enregistrer mon profil</button>
      </div>
      <aside className="space-y-5">
        <div className="carte p-6">
          <h3 className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5 text-foret-600" /> Mon CV</h3>
          {profil.cvUrl ? (
            <a href={profil.cvUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate text-sm font-semibold text-foret-700 hover:underline">{profil.cvNom}</a>
          ) : (
            <p className="mt-2 text-sm text-encre/60">Ajoutez votre CV pour postuler en un clic.</p>
          )}
          <label className="btn-contour mt-4 w-full cursor-pointer">
            <Upload className="h-4 w-4" /> {envoi ? "Envoi…" : profil.cvUrl ? "Remplacer le CV" : "Ajouter mon CV"}
            <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => cv(e.target.files?.[0])} disabled={envoi} />
          </label>
          <p className="mt-2 text-xs text-encre/50">PDF, Word ou photo · 5 Mo maximum. Votre CV n'est transmis qu'aux recruteurs à qui vous postulez.</p>
        </div>
      </aside>
    </form>
  );
}

function MesDonnees({ profil }: { profil: Utilisateur }) {
  const [msg, setMsg] = useState<{ t: "succes" | "erreur"; m: string } | null>(null);
  const supprimer = async () => {
    if (!window.confirm("Supprimer définitivement votre compte, votre CV et vos candidatures ? Cette action est irréversible.")) return;
    try {
      await supprimerMonCompte(profil);
      window.location.href = import.meta.env.BASE_URL;
    } catch (err) {
      const code = (err as { code?: string }).code;
      setMsg({ t: "erreur", m: code === "auth/requires-recent-login" ? "Par sécurité, déconnectez-vous puis reconnectez-vous avant de supprimer votre compte." : messageErreur(err) });
    }
  };
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="carte p-6">
        <h3 className="font-semibold">Communications</h3>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 h-5 w-5 accent-foret-700" defaultChecked={profil.consentements?.marketing}
            onChange={async (e) => { await majConsentementMarketing(profil.uid, e.target.checked); setMsg({ t: "succes", m: "Préférence enregistrée." }); }} />
          <span className="text-encre/70">Recevoir des offres et actualités de Workers et du groupe Melanyne (e-mail, SMS, WhatsApp).</span>
        </label>
      </div>
      <div className="carte p-6">
        <h3 className="font-semibold">Télécharger mes données</h3>
        <p className="mt-2 text-sm text-encre/60">Profil et candidatures, au format JSON.</p>
        <button onClick={() => exporterMesDonnees(profil.uid)} className="btn-contour mt-4"><Download className="h-4 w-4" /> Télécharger</button>
      </div>
      <div className="carte p-6">
        <h3 className="font-semibold text-terre-700">Supprimer mon compte</h3>
        <p className="mt-2 text-sm text-encre/60">Efface votre profil, votre CV et vos candidatures.</p>
        <button onClick={supprimer} className="btn mt-4 border border-terre-300 bg-terre-50 text-terre-700 hover:bg-terre-100"><Trash2 className="h-4 w-4" /> Supprimer</button>
      </div>
      {msg && <div className="lg:col-span-3"><Alerte type={msg.t}>{msg.m}</Alerte></div>}
      <p className="text-sm text-encre/50 lg:col-span-3">Questions sur vos données : <Link to="/confidentialite" className="lien">politique de confidentialité</Link>.</p>
    </div>
  );
}
