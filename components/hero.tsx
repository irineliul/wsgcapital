"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-600 rounded-full filter blur-[120px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Stake Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600">
                SOL Tokens
              </span>{" "}
              for 100x Returns
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Achieve returns of up to 100x in 14 days by staking SOL tokens on Solana blockchain. Lock your SOL for 14
              days and earn massive rewards through our advanced trading strategies. Minimum stake: 1 SOL. Fast, secure,
              and highly rewarding. 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 transition-all duration-300"
                onClick={() => document.getElementById("staking")?.scrollIntoView({ behavior: "smooth" })}
              >
                Start SOL Staking Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-500/50 text-white hover:bg-blue-900/20 bg-transparent hover:border-blue-400 transition-all duration-300"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn About SOL Staking
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/wolfsnake-gold-logo.png"
                    alt="Wolf Snake Gold - The Dacian Treasure"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-10 right-10 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-70"></div>
              <div
                className="absolute bottom-20 left-10 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-1/2 right-5 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
