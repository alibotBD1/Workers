// Module Insight — analyse IA des CV. Fonctions pures, testées dans insight.test.js.

export const MODELE_PAR_DEFAUT = "claude-sonnet-5-5";

export const RECOMMANDATIONS = ["À rencontrer", "À étudier", "Peu adapté"];

export const PROMPT_SYSTEME = `Tu assistes les recruteurs de Workers, job board camerounais, pour trier les candidatures.
On te donne une offre d'emploi et le CV d'un candidat. Évalue l'adéquation du CV avec l'offre.

Règles d'équité, impératives :
- Base-toi UNIQUEMENT sur les compétences, l'expérience, les diplômes, les certifications et les langues utiles au poste.
- Ignore totalement l'âge, le sexe, la photo, l'origine ethnique ou régionale, la nationalité, la religion, la situation familiale, le handicap, l'adresse et tout autre critère sans lien avec le poste. Ne les mentionne jamais.
- N'invente rien : si une information n'est pas dans le CV, dis qu'elle manque.
- Tu aides le recruteur, tu ne décides pas : reste factuel et nuancé.

Réponds UNIQUEMENT par un objet JSON :
{
 "score": entier de 0 à 100 (adéquation avec l'offre),
 "recommandation": "À rencontrer" | "À étudier" | "Peu adapté",
 "resume": "3 phrases maximum sur le parcours, en lien avec le poste",
 "experience_annees": nombre d'années d'expérience professionnelle pertinente, ou null,
 "diplome": "diplôme le plus élevé, ou null",
 "competences_trouvees": ["compétences de l'offre présentes dans le CV"],
 "competences_manquantes": ["compétences de l'offre absentes du CV"],
 "points_forts": ["2 à 4 points forts pour ce poste"],
 "points_vigilance": ["0 à 3 points à vérifier en entretien"],
 "questions_entretien": ["2 ou 3 questions utiles à poser au candidat"],
 "langues": ["langues mentionnées"],
 "cv_lisible": true | false (false si le document n'est pas un CV ou est illisible)
}`;

/** Texte de l'offre transmis à l'IA. */
export function decrireOffre(o) {
  const l = (titre, v) => (Array.isArray(v) && v.length ? `${titre} :\n${v.map((x) => `- ${x}`).join("\n")}` : "");
  return [
    `Poste : ${o.titre}`,
    `Entreprise : ${o.entrepriseNom ?? ""}`,
    `Lieu : ${o.ville ?? ""} · Contrat : ${o.contrat ?? ""} · Niveau : ${o.niveau ?? ""}`,
    o.resume ? `Résumé : ${o.resume}` : "",
    l("Missions", o.missions),
    l("Profil recherché", o.profil),
    l("Compétences clés", o.competences),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Bloc de contenu « CV » pour l'API Claude selon le type de fichier.
 * PDF et images sont lus directement par le modèle (y compris les scans) ;
 * un document Word est converti en texte au préalable (texteWord).
 */
export function blocCv({ contentType, base64, texteWord }) {
  if (contentType === "application/pdf") return { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } };
  if (contentType === "image/jpeg" || contentType === "image/png") return { type: "image", source: { type: "base64", media_type: contentType, data: base64 } };
  if (texteWord) return { type: "text", text: `CV du candidat (converti depuis Word) :\n\n${texteWord.slice(0, 60000)}` };
  throw new Error(`Format de CV non pris en charge : ${contentType}`);
}

export function construireMessage(offre, bloc, messageCandidat) {
  return [
    {
      role: "user",
      content: [
        { type: "text", text: `OFFRE D'EMPLOI\n\n${decrireOffre(offre)}` },
        bloc,
        ...(messageCandidat ? [{ type: "text", text: `Message d'accompagnement du candidat :\n${String(messageCandidat).slice(0, 3000)}` }] : []),
        { type: "text", text: "Évalue ce CV pour cette offre en respectant strictement les règles. Réponds par l'objet JSON demandé." },
      ],
    },
  ];
}

export function extraireJson(texte) {
  const bloc = texte.match(/```(?:json)?\s*([\s\S]*?)```/);
  const brut = (bloc ? bloc[1] : texte).trim();
  const debut = brut.indexOf("{");
  const fin = brut.lastIndexOf("}");
  if (debut < 0 || fin < debut) throw new Error("Réponse de l'IA sans JSON");
  return JSON.parse(brut.slice(debut, fin + 1));
}

const court = (v, n) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");
const liste = (v, n, max = 160) => (Array.isArray(v) ? v.map((x) => court(x, max)).filter(Boolean).slice(0, n) : []);

/** Valide et borne la réponse de l'IA avant enregistrement. */
export function normaliserAnalyse(brut) {
  const score = Math.max(0, Math.min(100, Math.round(Number(brut?.score) || 0)));
  const lisible = brut?.cv_lisible !== false;
  const reco = RECOMMANDATIONS.includes(brut?.recommandation) ? brut.recommandation : score >= 70 ? "À rencontrer" : score >= 45 ? "À étudier" : "Peu adapté";
  const exp = Number(brut?.experience_annees);
  return {
    score: lisible ? score : 0,
    recommandation: lisible ? reco : "À étudier",
    resume: court(brut?.resume, 600) || (lisible ? "" : "Le document transmis n'a pas pu être lu comme un CV."),
    experienceAnnees: Number.isFinite(exp) && exp >= 0 && exp < 60 ? Math.round(exp * 10) / 10 : null,
    diplome: court(brut?.diplome, 120) || null,
    competencesTrouvees: liste(brut?.competences_trouvees, 12, 50),
    competencesManquantes: liste(brut?.competences_manquantes, 12, 50),
    pointsForts: liste(brut?.points_forts, 4),
    pointsVigilance: liste(brut?.points_vigilance, 3),
    questionsEntretien: liste(brut?.questions_entretien, 3, 220),
    langues: liste(brut?.langues, 6, 30),
    cvLisible: lisible,
  };
}

/** Appel à l'API Claude (fetch injectable pour les tests). */
export async function analyserCv({ offre, bloc, messageCandidat, cle, modele = MODELE_PAR_DEFAUT, fetchFn = fetch, urlApi = "https://api.anthropic.com" }) {
  for (let essai = 1; essai <= 3; essai++) {
    const rep = await fetchFn(`${urlApi}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": cle, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: modele, max_tokens: 1800, temperature: 0, system: PROMPT_SYSTEME, messages: construireMessage(offre, bloc, messageCandidat) }),
    });
    if (rep.status === 429 || rep.status >= 500) {
      await new Promise((r) => setTimeout(r, 3000 * essai));
      continue;
    }
    const json = await rep.json();
    if (!rep.ok) throw new Error(`IA : ${json?.error?.message ?? rep.status}`);
    const texte = (json.content ?? []).map((c) => c.text ?? "").join("");
    return { ...normaliserAnalyse(extraireJson(texte)), modele, jetons: (json.usage?.input_tokens ?? 0) + (json.usage?.output_tokens ?? 0) };
  }
  throw new Error("IA indisponible après 3 essais");
}
