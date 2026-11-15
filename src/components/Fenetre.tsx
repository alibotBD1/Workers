import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** Fenêtre modale accessible basée sur l'élément natif <dialog>. */
export default function Fenetre({ ouverte, fermer, titre, children }: { ouverte: boolean; fermer: () => void; titre: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouverte && !d.open) d.showModal();
    if (!ouverte && d.open) d.close();
  }, [ouverte]);
  return (
    <dialog
      ref={ref}
      onClose={fermer}
      onClick={(e) => e.target === ref.current && fermer()}
      className="w-[min(560px,calc(100vw-2rem))] rounded-3xl bg-creme p-0 text-encre shadow-flotte backdrop:bg-foret-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-encre/10 px-6 py-4">
        <h2 className="text-lg font-semibold">{titre}</h2>
        <button onClick={fermer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-encre/5" aria-label="Fermer">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
    </dialog>
  );
}
