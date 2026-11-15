import { Heart } from "lucide-react";
import { actions, useEspace } from "@/lib/store";

export default function BoutonFavori({ slug, grand = false }: { slug: string; grand?: boolean }) {
  const favoris = useEspace((e) => e.favoris);
  const actif = favoris.includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.basculerFavori(slug);
      }}
      aria-pressed={actif}
      aria-label={actif ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={
        grand
          ? `btn-contour ${actif ? "!border-terre-300 !bg-terre-50 text-terre-600" : ""}`
          : `grid h-10 w-10 place-items-center rounded-full transition hover:bg-terre-50 ${actif ? "text-terre-500" : "text-encre/35 hover:text-terre-500"}`
      }
    >
      <Heart className={`h-5 w-5 transition ${actif ? "scale-110 fill-current" : ""}`} />
      {grand && (actif ? "Sauvegardée" : "Sauvegarder")}
    </button>
  );
}
