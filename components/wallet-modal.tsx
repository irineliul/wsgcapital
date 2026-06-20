"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WalletModalProps {
  trigger?: React.ReactNode
}

export function WalletModal({ trigger }: WalletModalProps) {
  const { connect, connecting, error, isPhantomInstalled, isSolflareInstalled } = useWallet()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = async (walletType: "phantom" | "solflare") => {
    try {
      await connect(walletType)
      setIsOpen(false)
      const walletNames = {
        phantom: "Phantom",
        solflare: "Solflare",
      }
      toast({
        title: "Wallet Connected! 🎉",
        description: `Successfully connected to ${walletNames[walletType]} wallet`,
      })
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const openWalletDownload = (wallet: "phantom" | "solflare") => {
    const urls = {
      phantom: "https://phantom.app/download",
      solflare: "https://solflare.com/download",
    }
    window.open(urls[wallet], "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black/95 border-purple-500/30 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" />
            Connect Your Solana Wallet
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Connect your Solana wallet to start staking SOL and earning rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Connection Issue</span>
              </div>
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          )}

          {/* Phantom Wallet Option */}
          <div className="border border-purple-500/30 rounded-lg p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
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

            {isPhantomInstalled ? (
              <Button
                onClick={() => handleConnect("phantom")}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Phantom
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => openWalletDownload("phantom")}
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-900/30 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Install Phantom
              </Button>
            )}
          </div>

          {/* Solflare Wallet Option */}
          <div className="border border-orange-500/30 rounded-lg p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
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

            {isSolflareInstalled ? (
              <Button
                onClick={() => handleConnect("solflare")}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Solflare
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => openWalletDownload("solflare")}
                variant="outline"
                className="w-full border-orange-500/50 hover:bg-orange-900/30 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Install Solflare
              </Button>
            )}
          </div>

          {/* SOL Staking Info */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-300">SOL Staking Platform</h4>
                <p className="text-xs text-blue-200/70">Stake SOL and earn 100x multiplier rewards</p>
              </div>
            </div>
            <p className="text-xs text-white/60">
              Connect your Solana wallet to stake SOL tokens for 14 days and earn massive 100x multiplier returns.
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-300 font-medium">Secure Connection</p>
                <p className="text-xs text-green-200/70">
                  Your wallet connection is secure and encrypted. We never store your private keys.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Links */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://docs.solana.com/wallet-guide", "_blank")}
            className="text-white/60 hover:text-white"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Wallet Guide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://solana.com/ecosystem/explore?categories=wallet", "_blank")}
            className="text-white/60 hover:text-white"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            More Wallets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
