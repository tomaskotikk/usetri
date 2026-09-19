export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-deep text-white py-12 px-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-display font-extrabold text-xl">
          Ušetři<span className="text-brand">.</span>
        </span>
        <div className="flex gap-6 text-sm text-white/60">
          <span>GDPR</span>
          <span>Bezpečné platby</span>
          <span>Podmínky</span>
        </div>
        <span className="text-sm text-white/40">© 2026</span>
      </div>
    </footer>
  )
}
