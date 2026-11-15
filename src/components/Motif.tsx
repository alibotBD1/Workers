// Motif géométrique inspiré des tissus ndop des Grassfields.
export default function Motif({ className = "", couleur = "currentColor", opacite = 0.12, id = "ndop" }: { className?: string; couleur?: string; opacite?: number; id?: string }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={couleur} strokeWidth="2" opacity={opacite}>
            <path d="M0 28 L14 14 L28 28 L14 42 Z" />
            <path d="M28 28 L42 14 L56 28 L42 42 Z" />
            <circle cx="14" cy="28" r="3" fill={couleur} />
            <circle cx="42" cy="28" r="3" fill={couleur} />
            <path d="M0 0 H56 M0 56 H56" strokeDasharray="4 6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
