"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"
import { WalletModal } from "@/components/wallet-modal"
import {
  Wallet,
  ChevronDown,
  LogOut,
  Copy,
  ExternalLink,
  LayoutDashboard,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export function WalletMultiButton() {
  const {
    connected,
    publicKey,
    solBalance,
    disconnect,
    walletType,
    connecting,
    error,
    isPhantomInstalled,
    isSolflareInstalled,
    balanceLoading,
    refreshBalances,
  } = useWallet()
  const { toast } = useToast()

  const formatPublicKey = (key: string | null) => {
    if (!key) return ""
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      toast({
        title: "Address copied! 📋",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const viewOnExplorer = () => {
    if (!publicKey) return
    window.open(`https://explorer.solana.com/address/${publicKey}?cluster=devnet`, "_blank")
  }

  const handleRefreshBalance = async () => {
    toast({
      title: "Refreshing balance...",
      description: "Fetching latest balance from Solana blockchain",
    })
    await refreshBalances()
  }

  const getWalletIcon = () => {
    if (walletType === "phantom") {
      return (
        <div className="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <Wallet className="h-2.5 w-2.5 text-white" />
        </div>
      )
    } else if (walletType === "solflare") {
      return (
        <div className="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
          <Wallet className="h-2.5 w-2.5 text-white" />
        </div>
      )
    }
    return <Wallet className="mr-2 h-4 w-4 text-purple-400" />
  }

  const getWalletName = () => {
    if (walletType === "phantom") return "Phantom"
    if (walletType === "solflare") return "Solflare"
    return "Wallet"
  }

  const formatBalance = (balance: number | null) => {
    if (balance === null) return "Loading..."
    if (balance === 0) return "0 SOL"
    if (balance < 0.0001) return "< 0.0001 SOL"
    return `${balance.toFixed(4)} SOL`
  }

  if (error && !connected) {
    return (
      <WalletModal
        trigger={
          <Button variant="outline" className="border-red-500/50 bg-red-900/20 text-red-300 hover:bg-red-900/30">
            <AlertCircle className="mr-2 h-4 w-4" />
            Connection Error
          </Button>
        }
      />
    )
  }

  if (connecting) {
    return (
      <Button disabled className="bg-gradient-to-r from-purple-600 to-blue-600 opacity-70">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Connecting...
      </Button>
    )
  }

  if (!connected) {
    const hasAnyWallet = isPhantomInstalled || isSolflareInstalled
    return (
      <WalletModal
        trigger={
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Wallet className="mr-2 h-4 w-4" />
            {!hasAnyWallet ? "Install Wallet" : "Connect Wallet"}
          </Button>
        }
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-purple-500/50 bg-black/50 hover:bg-purple-900/20">
          {getWalletIcon()}
          {formatPublicKey(publicKey)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-black/90 border-purple-500/30 backdrop-blur-lg">
        <DropdownMenuLabel className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs text-white/70">Connected with {getWalletName()}</span>
          </div>
          <span className="font-mono text-sm">{formatPublicKey(publicKey)}</span>

          {/* Balance Display */}
          <div className="flex items-center justify-between mt-1 bg-blue-500/20 rounded-md px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm font-medium text-blue-300">
                {balanceLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  formatBalance(solBalance)
                )}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshBalance}
              disabled={balanceLoading}
              className="h-6 w-6 p-0 hover:bg-blue-500/30"
            >
              <Loader2 className={`h-3 w-3 ${balanceLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Network indicator */}
          <div className="flex items-center gap-2 text-xs text-orange-400">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span>Solana Devnet</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="focus:bg-purple-900/30 cursor-pointer" onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-purple-900/30 cursor-pointer" onClick={viewOnExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-purple-900/30 cursor-pointer" onClick={handleRefreshBalance}>
          <Loader2 className={`mr-2 h-4 w-4 ${balanceLoading ? "animate-spin" : ""}`} />
          Refresh Balance
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-purple-900/30 cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          My Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-purple-900/30 cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          Transaction History
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="focus:bg-red-900/30 cursor-pointer text-red-400" onClick={disconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
