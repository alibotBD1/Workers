import { test } from "node:test";
import assert from "node:assert/strict";
import { extraireJson, htmlVersTexte, idOffre, lireFlux, normaliserOffre, robotsAutorise } from "./outils.mjs";

test("htmlVersTexte garde les liens absolus et retire les scripts", () => {
  const t = htmlVersTexte(`<html><head><title>x</title></head><body><script>alert(1)</script><h1>Offres</h1><ul><li><a href="/emploi/42">Comptable &amp; fiscaliste</a></li></ul></body></html>`, "https://exemple.cm/carrieres");
  assert.match(t, /\[Comptable & fiscaliste\]\(https:\/\/exemple\.cm\/emploi\/42\)/);
  assert.doesNotMatch(t, /alert/);
});

test("robots.txt : règles « * » et règle la plus précise", () => {
  const r = "User-agent: *\nDisallow: /admin\nAllow: /admin/offres\n\nUser-agent: BadBot\nDisallow: /";
  assert.equal(robotsAutorise(r, "/emplois"), true);
  assert.equal(robotsAutorise(r, "/admin/compte"), false);
  assert.equal(robotsAutorise(r, "/admin/offres/1"), true);
  assert.equal(robotsAutorise("User-agent: WorkersBot\nDisallow: /", "/x"), false);
  assert.equal(robotsAutorise("User-agent: *\nDisallow:", "/x"), true);
});

test("lireFlux lit le RSS", () => {
  const items = lireFlux(`<rss><channel><item><title><![CDATA[Chef de chantier]]></title><link>https://ex.cm/o/1</link><description>Douala</description></item></channel></rss>`);
  assert.deepEqual(items[0].titre, "Chef de chantier");
  assert.equal(items[0].lien, "https://ex.cm/o/1");
});

test("extraireJson tolère le texte autour", () => {
  assert.deepEqual(extraireJson('Voici :\n```json\n[{"a":1}]\n```'), [{ a: 1 }]);
  assert.deepEqual(extraireJson('{"ignorer": true}'), { ignorer: true });
});

test("normaliserOffre valide et complète", () => {
  const o = normaliserOffre(
    { titre: "Comptable", entreprise: "Test SA", ville: "Douala", contrat: "cdd", secteur: "banque", resume: "Tenir la comptabilité.", missions: ["Saisie", "Déclarations"], profil: ["BTS"], competences: ["Sage"], salaire_min: "300 000", lien_candidature: "https://ex.cm/postuler" },
    { source: { nom: "Ex", url: "https://ex.cm" }, lienAnnonce: "https://ex.cm/o/1", maintenant: new Date("2026-11-17") },
  );
  assert.equal(o.contrat, "CDD");
  assert.equal(o.salaireMin, 300000);
  assert.equal(o.candidature.url, "https://ex.cm/postuler");
  assert.equal(o.origine, "collecte");
  assert.equal(normaliserOffre({ ignorer: true }, { source: { nom: "Ex", url: "" }, lienAnnonce: "https://ex.cm" }), null);
  assert.equal(normaliserOffre({ titre: "X", resume: "y", missions: ["un"] }, { source: { nom: "Ex", url: "" }, lienAnnonce: "https://ex.cm" }), null);
});

test("idOffre ignore la query string", () => {
  assert.equal(idOffre("https://ex.cm/o/1?utm=x"), idOffre("https://ex.cm/o/1/"));
});
