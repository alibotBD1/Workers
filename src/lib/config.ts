// Réglages du site. Modifiables via les variables VITE_* (voir .env.example).
export const CONFIG = {
  nom: "Workers",
  groupe: "Melanyne",
  version: __APP_VERSION__,
  slogan: "Le travail qui vous ressemble, partout au Cameroun.",
  depotGithub: (import.meta.env.VITE_GITHUB_REPO as string | undefined) ?? "alibotBD1/workers",
  modeDemo: (import.meta.env.VITE_DEMO ?? "true") !== "false",
  contact: "contact@votre-domaine.cm",
};

/** URL d'une nouvelle issue GitHub pré-remplie avec le formulaire « nouvelle offre ». */
export function urlNouvelleOffre(champs: Record<string, string>): string {
  const p = new URLSearchParams({ template: "nouvelle-offre.yml", title: `[Offre] ${champs.titre ?? ""}`.trim(), labels: "offre" });
  for (const [k, v] of Object.entries(champs)) if (v) p.set(k, v);
  return `https://github.com/${CONFIG.depotGithub}/issues/new?${p.toString()}`;
}
