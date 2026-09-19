import dynamic from 'next/dynamic'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { StatsBand } from '@/components/StatsBand'

// Below-the-fold sections load lazily so the hero paints first
const LiveActivity = dynamic(() => import('@/components/LiveActivity').then((m) => m.LiveActivity))
const HowItWorks = dynamic(() => import('@/components/HowItWorks').then((m) => m.HowItWorks))
const PopularServices = dynamic(() => import('@/components/PopularServices').then((m) => m.PopularServices))
const TrustSafety = dynamic(() => import('@/components/TrustSafety').then((m) => m.TrustSafety))
const SavingsCalculator = dynamic(() => import('@/components/SavingsCalculator').then((m) => m.SavingsCalculator))
const Testimonials = dynamic(() => import('@/components/Testimonials').then((m) => m.Testimonials))
const FAQ = dynamic(() => import('@/components/FAQ').then((m) => m.FAQ))
const CtaBand = dynamic(() => import('@/components/CtaBand').then((m) => m.CtaBand))
const Footer = dynamic(() => import('@/components/Footer').then((m) => m.Footer))

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBand />
      <LiveActivity />
      <HowItWorks />
      <PopularServices />
      <TrustSafety />
      <SavingsCalculator />
      <Testimonials />
      <FAQ />
      <CtaBand />
      <Footer />
    </>
  )
}
