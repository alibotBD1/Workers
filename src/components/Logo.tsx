export function Marque({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#13392a" />
      <circle cx="45" cy="19" r="7" fill="#fbb924" />
      <path d="M10 50 L23 24 L32 38 L41 24 L54 50" fill="none" stroke="#fbf7ef" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Marque />
      <span className={`font-display text-[1.35rem] font-bold leading-none tracking-tight ${clair ? "text-creme" : "text-encre"}`}>
        melanyne<span className="text-soleil-500">.</span>work
      </span>
    </span>
  );
}
