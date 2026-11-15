// Marque Workers : un « W » formé de deux vallées, sous le soleil du groupe Melanyne.
export function Marque({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#13392a" />
      <circle cx="32" cy="17" r="6.5" fill="#fbb924" />
      <path d="M9 26 L20 49 L32 31 L44 49 L55 26" fill="none" stroke="#fbf7ef" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ clair = false, signature = true }: { clair?: boolean; signature?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Marque />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.4rem] font-bold tracking-tight ${clair ? "text-creme" : "text-encre"}`}>
          workers<span className="text-soleil-500">.</span>
        </span>
        {signature && (
          <span className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[.2em] ${clair ? "text-creme/55" : "text-encre/45"}`}>par Melanyne</span>
        )}
      </span>
    </span>
  );
}
