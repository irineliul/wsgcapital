"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@/components/wallet-multi-button"
import { useWallet } from "@/providers/wallet-provider"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { connected } = useWallet()

  const navLinks = [
    { href: "#staking", label: "Stake SOL" },
    { href: "#about", label: "About" },
    { href: "#stats", label: "Statistics" },
  ]

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/50 border-b border-yellow-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/wolfsnake-gold-logo.png"
                alt="Wolf Snake Gold - The Dacian Treasure"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Wolf Snake Gold
              </span>
              <span className="text-xs text-white/70 hidden sm:block">The Dacian Treasure</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/80 hover:text-yellow-400 transition-all duration-300 font-medium relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}

            <WalletMultiButton />
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-yellow-400 hover:bg-yellow-900/20 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-3 text-white/80 hover:text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-all duration-300 font-medium"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 px-4">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
