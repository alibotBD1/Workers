import { entrepriseParSlug } from "@/data";

export default function Monogramme({ slug, nom, taille = "md" }: { slug: string; nom: string; taille?: "sm" | "md" | "lg" }) {
  const ent = entrepriseParSlug(slug);
  const couleur = ent?.couleur ?? "#194f38";
  const initiales = nom
    .split(/[\s-]+/)
    .filter((m) => m.length > 2 || /^[A-Z]/.test(m))
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");
  const dims = { sm: "h-10 w-10 text-sm rounded-xl", md: "h-12 w-12 text-base rounded-xl", lg: "h-20 w-20 text-2xl rounded-2xl" }[taille];
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden font-display font-bold text-white ${dims}`}
      style={{ background: couleur }}
      aria-hidden="true"
    >
      <span className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/15" />
      <span className="relative">{initiales || "?"}</span>
    </span>
  );
}
