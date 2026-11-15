export default function AnneauCompat({ valeur, taille = 44 }: { valeur: number; taille?: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const couleur = valeur >= 70 ? "#2d7d57" : valeur >= 45 ? "#eea00b" : "#b9b2a5";
  return (
    <span className="relative inline-grid place-items-center" style={{ width: taille, height: taille }} title={`Compatibilité avec votre profil : ${valeur} %`}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#14201a12" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={couleur} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(valeur / 100) * c} ${c}`} />
      </svg>
      <span className="text-[11px] font-bold tabular-nums">{valeur}%</span>
    </span>
  );
}
