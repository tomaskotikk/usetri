import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ušetři — reklamní plátno',
  // This route exists only to be screen-recorded; it should never rank or be crawled.
  robots: { index: false, follow: false },
}

export default function AdLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 overflow-hidden bg-[#0b0d12]">{children}</div>
}
