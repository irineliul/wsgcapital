import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Twitter, Github, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-yellow-500/20 pt-16 pb-8 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-yellow-600 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-orange-600 rounded-full filter blur-[100px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/wolfsnake-gold-logo.png"
                  alt="Wolf Snake Gold - The Dacian Treasure"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Wolf Snake Gold
                </span>
                <span className="text-xs text-white/60">The Dacian Treasure</span>
              </div>
            </div>
            <p className="text-white/70 mb-4">
              The premier platform for staking SOL on the Solana blockchain. Unleash the power of the legendary
              creature.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 hover:bg-yellow-900/30">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 hover:bg-yellow-900/30">
                <Discord className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 hover:bg-yellow-900/30">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-white/70 hover:text-white transition-colors">
                  About WSG
                </Link>
              </li>
              <li>
                <Link href="#staking" className="text-white/70 hover:text-white transition-colors">
                  Staking
                </Link>
              </li>
              <li>
                <Link href="#stats" className="text-white/70 hover:text-white transition-colors">
                  Statistics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                  Tokenomics
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-white/70 mb-4">Subscribe to our newsletter for the latest updates and announcements.</p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/5 border-yellow-500/30 focus:border-yellow-500"
              />
              <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-500/20 pt-8 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Wolf Snake Gold - The Dacian Treasure. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-2">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
