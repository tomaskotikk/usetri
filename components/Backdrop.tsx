export function Backdrop({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  if (variant === 'light') {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-light" />
        <div className="absolute -left-40 top-1/4 h-[420px] w-[420px] animate-drift-a glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_10%,transparent)]" />
        <div className="absolute -right-32 bottom-0 h-[380px] w-[380px] animate-drift-b glow scale-150 [--glow:color-mix(in_srgb,var(--cyan-accent)_10%,transparent)]" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none grain">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 8%, #10305c 0%, #071229 45%, #050b1a 100%)',
        }}
      />
      <div className="absolute inset-0 bg-grid-dark" />
      <div className="absolute -left-32 top-10 h-[520px] w-[520px] animate-drift-a glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_16%,transparent)]" />
      <div className="absolute right-0 top-1/3 h-[460px] w-[460px] animate-drift-b glow scale-150 [--glow:color-mix(in_srgb,var(--cyan-accent)_14%,transparent)]" />
    </div>
  )
}
