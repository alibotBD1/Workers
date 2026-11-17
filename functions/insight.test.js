import { test } from "node:test";
import assert from "node:assert/strict";
import { analyserCv, blocCv, construireMessage, decrireOffre, normaliserAnalyse } from "./insight.js";

const offre = { titre: "Analyste crédit PME", entrepriseNom: "Banque des Savanes", ville: "Yaoundé", contrat: "CDI", niveau: "Confirmé", missions: ["Analyser les états financiers"], profil: ["Bac+5 finance"], competences: ["OHADA", "Excel", "COBAC"] };

test("decrireOffre reprend missions et compétences", () => {
  const t = decrireOffre(offre);
  assert.match(t, /Analyste crédit PME/);
  assert.match(t, /- OHADA/);
});

test("blocCv selon le format", () => {
  assert.equal(blocCv({ contentType: "application/pdf", base64: "QQ==" }).type, "document");
  assert.equal(blocCv({ contentType: "image/png", base64: "QQ==" }).source.media_type, "image/png");
  assert.equal(blocCv({ contentType: "application/msword", texteWord: "Jean, comptable" }).type, "text");
  assert.throws(() => blocCv({ contentType: "application/zip", base64: "" }));
});

test("construireMessage contient l'offre puis le CV", () => {
  const m = construireMessage(offre, { type: "text", text: "CV" }, "Motivé");
  assert.equal(m[0].content[0].type, "text");
  assert.equal(m[0].content[1].text, "CV");
  assert.match(m[0].content[2].text, /Motivé/);
});

test("normaliserAnalyse borne les valeurs", () => {
  const a = normaliserAnalyse({ score: 140, recommandation: "Super", resume: "x".repeat(900), experience_annees: "4", competences_trouvees: ["OHADA"], cv_lisible: true });
  assert.equal(a.score, 100);
  assert.equal(a.recommandation, "À rencontrer");
  assert.equal(a.resume.length, 600);
  assert.equal(a.experienceAnnees, 4);
  const illisible = normaliserAnalyse({ score: 80, cv_lisible: false });
  assert.equal(illisible.score, 0);
  assert.equal(illisible.cvLisible, false);
});

test("analyserCv appelle l'API et normalise la réponse", async () => {
  let appel;
  const fetchFn = async (url, opts) => {
    appel = { url, corps: JSON.parse(opts.body), cle: opts.headers["x-api-key"] };
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: '```json\n{"score": 82, "recommandation": "À rencontrer", "resume": "Quatre ans en analyse de crédit.", "competences_trouvees": ["OHADA", "Excel"], "competences_manquantes": ["COBAC"], "cv_lisible": true}\n```' }], usage: { input_tokens: 1000, output_tokens: 200 } }) };
  };
  const r = await analyserCv({ offre, bloc: blocCv({ contentType: "application/pdf", base64: "QQ==" }), cle: "test", fetchFn });
  assert.equal(appel.url, "https://api.anthropic.com/v1/messages");
  assert.equal(appel.cle, "test");
  assert.match(appel.corps.system, /Ignore totalement l'âge/);
  assert.equal(appel.corps.messages[0].content[1].type, "document");
  assert.equal(r.score, 82);
  assert.deepEqual(r.competencesManquantes, ["COBAC"]);
  assert.equal(r.jetons, 1200);
});
