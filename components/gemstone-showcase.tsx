"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gem, ChevronLeft, ChevronRight } from "lucide-react"

interface Gemstone {
  name: string
  subtitle: string
  value: string
  edition: string
  tier: string
  description: string
  image: string
  accent: string
}

// Custom display order: Golden Sovereign, Sapphire, Ruby, Emerald, Diamond
const gemstones: Gemstone[] = [
  {
    name: "The Golden Sovereign",
    subtitle: "The Core of the Collection",
    value: "€5,000",
    edition: "Limited Edition: 50 pieces globally",
    tier: "Tier 1",
    description:
      "The centerpiece of our sculptural vision, centered on the purity and fluid forms of solid gold. A masterpiece featuring intricate organic details inspired by mythology and nature.",
    image: "/images/golden-sovereign.jpg",
    accent: "from-yellow-500 to-amber-600",
  },
  {
    name: "Sapphire Serenity",
    subtitle: "Blue Majesty",
    value: "$12,000 USD",
    edition: "Limited Edition: 25 pieces worldwide",
    tier: "Tier 2",
    description:
      "Fluid solid-gold architecture enriched with natural faceted blue sapphires, carefully set to capture the light and impart a deep, regal elegance.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/with-Sapphire-Serenity-gemstones-4-g2bitILTRPWzzSKs61ogFJGklHISHc.jpg",
    accent: "from-blue-600 to-indigo-700",
  },
  {
    name: "Ruby Radiance",
    subtitle: "Passion & Power",
    value: "$16,000 USD",
    edition: "Limited Edition: 15 pieces worldwide",
    tier: "Tier 3",
    description:
      "A dramatic expression of luxury where solid gold fuses with vivid pigeon-blood red rubies. Hand-sculpted textures showcase the stones' intensity for a spectacular visual contrast.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/with-Ruby-Radiance-gemstones-6yifEFH1JkGwV6ROAFnmWEcBaHLrVe.jpg",
    accent: "from-rose-600 to-red-700",
  },
  {
    name: "Emerald Enchantment",
    subtitle: "Royal Elegance",
    value: "$22,000 USD",
    edition: "Limited Edition: 10 pieces worldwide",
    tier: "Tier 4",
    description:
      "Pure 18K solid gold adorned with natural emeralds, blending organic sculptural forms with the lush green brilliance of one of the world's most coveted gemstones.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/with-Emerald-Enchantment-gemstones-4-7fRsfoawFAshOfvXIA1mSJWFXSjhRO.jpg",
    accent: "from-emerald-600 to-green-700",
  },
  {
    name: "Diamond Dreams",
    subtitle: "Eternal Brilliance",
    value: "$30,000+ USD",
    edition: "Limited Edition: 5 pieces worldwide",
    tier: "Tier 5",
    description:
      "The pinnacle of the collection. Pure 18K solid gold crowned with flawless natural diamonds, a legendary masterpiece reserved for the most distinguished collectors.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/with-Diamond-Dreams-gemstones-1-qxMVkOlcfpYHaQFZsKpPeUW5MO7I5U.jpg",
    accent: "from-yellow-400 to-amber-500",
  },
]

export function GemstoneShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + gemstones.length) % gemstones.length)
  }, [])

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % gemstones.length)
  }, [])

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + gemstones.length) % gemstones.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % gemstones.length)
    }, 3500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused])

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-yellow-600 rounded-full filter blur-[120px] opacity-15"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-rose-600 rounded-full filter blur-[110px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-900/50 to-amber-900/50 rounded-full border border-yellow-500/30 text-sm font-medium text-yellow-200 mb-6">
            <Gem className="h-4 w-4" />
            The Gemstone Collection
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
            The Sculptural Gold Collection
          </h2>
          <p className="text-lg text-white/70 text-pretty">
            Each tier pairs pure 18K solid gold with the world&apos;s finest natural gemstones, from regal
            sapphires to legendary diamonds, every piece a limited-edition work of art.
          </p>
        </div>

        <div
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slide */}
          <Card className="relative overflow-hidden bg-black border-yellow-500/20 rounded-2xl">
            <div className="relative aspect-[16/10] md:aspect-[16/8]">
              {gemstones.map((gem, index) => (
                <div
                  key={gem.name}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={gem.image || "/placeholder.svg"}
                    alt={`${gem.name} - ${gem.subtitle}`}
                    className="w-full h-full object-contain bg-black"
                  />
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Slide Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${gem.accent} text-sm font-semibold text-white mb-3`}
                    >
                      {gem.tier}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-1">{gem.name}</h3>
                    <p className="text-white/70 mb-3">{gem.subtitle}</p>
                    <p className="hidden md:block text-sm text-white/60 max-w-2xl mb-3 text-pretty leading-relaxed">
                      {gem.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                        {gem.value}
                      </p>
                      <p className="text-xs md:text-sm text-white/50">{gem.edition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              size="icon"
              variant="outline"
              onClick={prev}
              aria-label="Previous gemstone"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border-yellow-500/40 bg-black/50 hover:bg-black/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={next}
              aria-label="Next gemstone"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border-yellow-500/40 bg-black/50 hover:bg-black/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Card>

          {/* Thumbnail / Indicator Strip */}
          <div className="grid grid-cols-5 gap-3 mt-6">
            {gemstones.map((gem, index) => (
              <button
                key={gem.name}
                onClick={() => goTo(index)}
                aria-label={`View ${gem.name}`}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                  index === activeIndex
                    ? "border-yellow-500 ring-2 ring-yellow-500/40 scale-100"
                    : "border-white/10 opacity-60 hover:opacity-100 scale-95"
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={gem.image || "/placeholder.svg"}
                    alt={gem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-1 left-0 right-0 text-[10px] md:text-xs font-medium text-white text-center px-1 truncate">
                  {gem.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {gemstones.map((gem, index) => (
              <button
                key={gem.name}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-8 bg-yellow-500" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
