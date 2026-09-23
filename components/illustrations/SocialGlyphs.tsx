/** Social marks, drawn rather than imported so they inherit colour and stroke weight. */
export function InstagramGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.6" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="17.5" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  )
}
