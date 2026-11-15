export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/·/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nf = new Intl.NumberFormat("fr-FR");

/** 450000 → « 450 000 FCFA » */
export const fcfa = (n: number) => `${nf.format(n)} FCFA`;

/** 450000 → « 450k » */
export const kfcfa = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : `${Math.round(n / 1000)}k`);

export function fourchette(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  if (min && max && min !== max) return `${kfcfa(min)} – ${kfcfa(max)} FCFA / mois`;
  return `${kfcfa((min ?? max)!)} FCFA / mois`;
}

export function ilYa(iso: string, maintenant = Date.now()): string {
  const diff = Math.max(0, maintenant - new Date(iso).getTime());
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  if (j < 7) return `il y a ${j} jours`;
  const s = Math.floor(j / 7);
  if (j < 31) return `il y a ${s} semaine${s > 1 ? "s" : ""}`;
  const m = Math.floor(j / 30);
  return `il y a ${m} mois`;
}

export const dateLongue = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export const pluriel = (n: number, mot: string, motPluriel = mot + "s") => `${nf.format(n)} ${n > 1 ? motPluriel : mot}`;
