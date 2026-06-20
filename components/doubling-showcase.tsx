"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Play, RotateCcw, Zap } from "lucide-react"

interface DayData {
  day: number
  start: number
  end: number
  formatted: string
}

export function DoublingShowcase() {
  const [currentDay, setCurrentDay] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const days: DayData[] = [
    { day: 1, start: 100, end: 200, formatted: "$100 → $200" },
    { day: 2, start: 200, end: 400, formatted: "$200 → $400" },
    { day: 3, start: 400, end: 800, formatted: "$400 → $800" },
    { day: 4, start: 800, end: 1600, formatted: "$800 → $1,600" },
    { day: 5, start: 1600, end: 3200, formatted: "$1,600 → $3,200" },
    { day: 6, start: 3200, end: 6400, formatted: "$3,200 → $6,400" },
    { day: 7, start: 6400, end: 12800, formatted: "$6,400 → $12,800" },
    { day: 8, start: 12800, end: 25600, formatted: "$12,800 → $25,600" },
    { day: 9, start: 25600, end: 51200, formatted: "$25,600 → $51,200" },
    { day: 10, start: 51200, end: 102400, formatted: "$51,200 → $102,400" },
  ]

  const startAnimation = () => {
    setIsAnimating(true)
    setCurrentDay(0)
    setShowAll(false)

    const interval = setInterval(() => {
      setCurrentDay((prev) => {
        if (prev >= 9) {
          clearInterval(interval)
          setIsAnimating(false)
          setShowAll(true)
          return 9
        }
        return prev + 1
      })
    }, 800)
  }

  const reset = () => {
    setCurrentDay(0)
    setIsAnimating(false)
    setShowAll(false)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount}`
  }

  return (
    <section className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-green-600 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-600 rounded-full filter blur-[100px] opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/50 to-yellow-900/50 rounded-full border border-green-500/30 text-sm font-medium text-green-200 mb-6">
            <Zap className="h-4 w-4" />
            The Power of Daily Doubling
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Double Your Money Every Day</h2>
          <p className="text-xl text-white/80 mb-4">⏳ How much do you have after 10 business days of doubling?</p>
          <p className="text-lg text-white/70">
            See the incredible power of compound doubling with binary trading YOUR SOL staking rewards!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={startAnimation}
                disabled={isAnimating}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
              >
                <Play className="mr-2 h-4 w-4" />
                {isAnimating ? "Playing..." : "Start Animation"}
              </Button>
              <Button onClick={reset} variant="outline" className="border-green-500/50 bg-transparent">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {days.map((day, index) => (
              <Card
                key={day.day}
                className={`transition-all duration-500 transform ${
                  index <= currentDay || showAll
                    ? "bg-gradient-to-b from-green-900/60 to-black/60 border-green-500/40 scale-100 opacity-100"
                    : "bg-gradient-to-b from-gray-900/40 to-black/40 border-gray-500/20 scale-95 opacity-50"
                } backdrop-blur-sm hover:scale-105`}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp
                      className={`h-5 w-5 mr-1 ${index <= currentDay || showAll ? "text-green-400" : "text-gray-500"}`}
                    />
                    <span className="font-semibold">Day {day.day}</span>
                  </div>
                  <div
                    className={`text-sm transition-colors ${
                      index <= currentDay || showAll ? "text-green-300" : "text-gray-400"
                    }`}
                  >
                    {day.formatted}
                  </div>
                  {index === currentDay && isAnimating && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(showAll || currentDay >= 9) && (
            <div className="text-center">
              <Card className="bg-gradient-to-r from-yellow-900/60 via-green-900/60 to-yellow-900/60 border-yellow-500/40 backdrop-blur-sm max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400">
                    In just 10 days of doubling, from $100 to $102,400!
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-600 to-green-600 hover:from-yellow-700 hover:to-green-700"
                      onClick={() => document.getElementById("staking")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Start Your Journey
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-yellow-500/50 text-white hover:bg-yellow-900/20 bg-transparent"
                      onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Learn How
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
