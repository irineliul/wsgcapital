"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface WalletConnectionGuideProps {
  isPhantomInstalled: boolean
  isSolflareInstalled: boolean
}

export function WalletConnectionGuide({ isPhantomInstalled, isSolflareInstalled }: WalletConnectionGuideProps) {
  const openWalletDownload = (wallet: "phantom" | "solflare") => {
    const urls = {
      phantom: "https://phantom.app/download",
      solflare: "https://solflare.com/download",
    }
    window.open(urls[wallet], "_blank")
  }

  return (
    <Card className="bg-gradient-to-b from-blue-900/40 to-purple-900/30 border-blue-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Solana Wallet Setup Guide</CardTitle>
        <CardDescription>Install and connect your Solana wallet to start staking SOL tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phantom Wallet */}
        <div className="border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Phantom Wallet</h3>
                <p className="text-sm text-white/60">Most popular Solana wallet</p>
              </div>
            </div>
            {isPhantomInstalled ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            )}
          </div>

          {!isPhantomInstalled && (
            <div className="space-y-2">
              <Button
                onClick={() => openWalletDownload("phantom")}
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-900/30 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Install Phantom Wallet
              </Button>
              <p className="text-xs text-white/60">After installation, refresh this page and click "Connect Wallet"</p>
            </div>
          )}
        </div>

        {/* Solflare Wallet */}
        <div className="border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Solflare Wallet</h3>
                <p className="text-sm text-white/60">Advanced Solana wallet</p>
              </div>
            </div>
            {isSolflareInstalled ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            )}
          </div>

          {!isSolflareInstalled && (
            <div className="space-y-2">
              <Button
                onClick={() => openWalletDownload("solflare")}
                variant="outline"
                className="w-full border-orange-500/50 hover:bg-orange-900/30 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Install Solflare Wallet
              </Button>
              <p className="text-xs text-white/60">After installation, refresh this page and click "Connect Wallet"</p>
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-medium text-blue-300 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
            <li>Install a Solana wallet (Phantom or Solflare)</li>
            <li>Create a new wallet or import existing one</li>
            <li>Switch to Devnet in wallet settings</li>
            <li>Get some Devnet SOL from faucet for testing</li>
            <li>Return here and connect your wallet</li>
          </ol>
        </div>

        {/* Helpful Links */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://faucet.solana.com", "_blank")}
            className="text-white/60 hover:text-white"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Devnet Faucet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://docs.solana.com/wallet-guide", "_blank")}
            className="text-white/60 hover:text-white"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Wallet Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
