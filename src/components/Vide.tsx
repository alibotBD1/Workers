import type { ReactNode } from "react";

export default function Vide({ icone, titre, texte, action }: { icone: ReactNode; titre: string; texte?: string; action?: ReactNode }) {
  return (
    <div className="carte flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-soleil-100 text-soleil-700">{icone}</span>
      <h3 className="mt-4 text-xl font-semibold">{titre}</h3>
      {texte && <p className="mt-2 max-w-md text-encre/60">{texte}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
