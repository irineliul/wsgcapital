"use client"

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { GemstoneShowcase } from "@/components/gemstone-showcase"
import { DoublingShowcase } from "@/components/doubling-showcase"
import { About } from "@/components/about"
import { StakingSection } from "@/components/staking-section"
import { Stats } from "@/components/stats"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white">
      <Navbar />
      <Hero />
      <GemstoneShowcase />
      <DoublingShowcase />
      <About />
      <StakingSection />
      <Stats />
      <Footer />
    </main>
  )
}
