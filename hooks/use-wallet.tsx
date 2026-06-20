"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types for wallet providers
type WalletEvent = "connect" | "disconnect" | "accountChanged"

export type WalletType = "phantom" | "solflare" | null

interface PhantomProvider {
  publicKey: { toString: () => string } | null
  isPhantom?: boolean
  isConnected: boolean
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: WalletEvent, callback: (args: any) => void) => void
  off: (event: WalletEvent, callback: (args: any) => void) => void
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
}

interface SolflareProvider {
  publicKey: { toString: () => string } | null
  isSolflare?: boolean
  isConnected: boolean
  connect: (options?: any) => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: WalletEvent, callback: (args: any) => void) => void
  off: (event: WalletEvent, callback: (args: any) => void) => void
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
}

interface WalletContextType {
  connected: boolean
  publicKey: string | null
  solBalance: number | null
  wsgoldBalance: number | null
  connecting: boolean
  walletType: WalletType
  error: string | null
  isPhantomInstalled: boolean
  isSolflareInstalled: boolean
  phantomAddress: string | null
  connect: (type: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array | string) => Promise<any>
  getPhantomProvider: () => PhantomProvider | null
  getSolflareProvider: () => SolflareProvider | null
  getSolBalance: () => Promise<number>
  getWSGoldBalance: () => Promise<number>
  refreshBalances: () => Promise<void>
  setPhantomReceiveAddress: (address: string) => void
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  solBalance: null,
  wsgoldBalance: null,
  connecting: false,
  walletType: null,
  error: null,
  isPhantomInstalled: false,
  isSolflareInstalled: false,
  phantomAddress: null,
  connect: async () => {},
  disconnect: async () => {},
  signTransaction: async (transaction) => transaction,
  signAllTransactions: async (transactions) => transactions,
  signMessage: async (message) => ({ signature: new Uint8Array() }),
  getPhantomProvider: () => null,
  getSolflareProvider: () => null,
  getSolBalance: async () => 0,
  getWSGoldBalance: async () => 0,
  refreshBalances: async () => {},
  setPhantomReceiveAddress: () => {},
})

// WSGold Token Configuration
const WSGOLD_TOKEN_CONFIG = {
  name: "WolfSnake Gold",
  symbol: "WSGold",
  decimals: 9,
  mintAddress: "HqgWWXhqfSAuhds7XfAiFDycK3kuSFeYdyfKTdDBwh9j",
  description: "Bonus airdrop token earned from SOL staking rewards",
}

// SOL Staking Contract Address - Phantom wallet for receiving rewards
const SOL_STAKING_CONTRACT = "2KFSPxB6TKaBtE4gWZ7XpLhyiBWwMpzWR8WqcP7MDQCg"

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [wsgoldBalance, setWSGoldBalance] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false)
  const [isSolflareInstalled, setIsSolflareInstalled] = useState(false)
  const [phantomAddress, setPhantomAddress] = useState<string | null>(SOL_STAKING_CONTRACT)
  const { toast } = useToast()

  // Enhanced Phantom provider detection
  const getPhantomProvider = (): PhantomProvider | null => {
    if (typeof window === "undefined") return null

    try {
      // Check multiple possible locations for Phantom
      let provider = null

      // Method 1: window.phantom.solana
      if ((window as any).phantom?.solana) {
        provider = (window as any).phantom.solana
      }
      // Method 2: window.solana (if it's Phantom)
      else if ((window as any).solana && (window as any).solana.isPhantom) {
        provider = (window as any).solana
      }

      if (provider && provider.isPhantom) {
        console.log("✅ Phantom provider found")
        return provider as PhantomProvider
      }

      return null
    } catch (error) {
      console.error("❌ Error accessing Phantom provider:", error)
      return null
    }
  }

  // Enhanced Solflare provider detection with multiple methods
  const getSolflareProvider = (): SolflareProvider | null => {
    if (typeof window === "undefined") return null

    try {
      let provider = null

      console.log("🔍 Searching for Solflare provider...")

      // Method 1: Direct window.solflare
      if ((window as any).solflare) {
        console.log("📍 Found Solflare at window.solflare")
        provider = (window as any).solflare
      }
      // Method 2: window.solana with isSolflare flag
      else if ((window as any).solana && (window as any).solana.isSolflare) {
        console.log("📍 Found Solflare at window.solana (isSolflare=true)")
        provider = (window as any).solana
      }
      // Method 3: Check constructor name
      else if ((window as any).solana && (window as any).solana.constructor?.name === "SolflareWallet") {
        console.log("📍 Found Solflare via constructor name")
        provider = (window as any).solana
      }
      // Method 4: Check for Solflare-specific properties
      else if ((window as any).solana && (window as any).solana._solflare) {
        console.log("📍 Found Solflare via _solflare property")
        provider = (window as any).solana
      }
      // Method 5: Check window.solana.providers array (for multi-wallet)
      else if ((window as any).solana?.providers) {
        const providers = (window as any).solana.providers
        provider = providers.find((p: any) => p.isSolflare || p.constructor?.name === "SolflareWallet")
        if (provider) {
          console.log("📍 Found Solflare in providers array")
        }
      }

      // Validate the provider
      if (provider) {
        const isSolflare =
          provider.isSolflare ||
          provider.constructor?.name === "SolflareWallet" ||
          provider._solflare ||
          (provider.name && provider.name.toLowerCase().includes("solflare"))

        if (isSolflare) {
          console.log("✅ Solflare provider validated and ready")
          return provider as SolflareProvider
        }
      }

      console.log("❌ Solflare provider not found")
      return null
    } catch (error) {
      console.error("❌ Error accessing Solflare provider:", error)
      return null
    }
  }

  // Enhanced wallet installation check
  const checkWalletInstallations = () => {
    console.log("🔍 Checking wallet installations...")

    const phantomInstalled = !!getPhantomProvider()
    const solflareInstalled = !!getSolflareProvider()

    console.log(`📊 Wallet status: Phantom=${phantomInstalled}, Solflare=${solflareInstalled}`)

    setIsPhantomInstalled(phantomInstalled)
    setIsSolflareInstalled(solflareInstalled)

    return { phantomInstalled, solflareInstalled }
  }

  // Enhanced wallet initialization with better error handling
  useEffect(() => {
    const initializeWallet = async () => {
      console.log("🚀 Initializing wallet connections...")

      try {
        // Wait for wallet extensions to load
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const { phantomInstalled, solflareInstalled } = checkWalletInstallations()

        // Check for existing connections
        if (phantomInstalled) {
          const phantomProvider = getPhantomProvider()
          if (phantomProvider?.isConnected && phantomProvider?.publicKey) {
            console.log("🔗 Phantom already connected:", phantomProvider.publicKey.toString())
            setConnected(true)
            setPublicKey(phantomProvider.publicKey.toString())
            setWalletType("phantom")
            setError(null)
            await refreshBalances(phantomProvider.publicKey.toString())
            return
          }
        }

        if (solflareInstalled) {
          const solflareProvider = getSolflareProvider()
          if (solflareProvider?.isConnected && solflareProvider?.publicKey) {
            console.log("🔗 Solflare already connected:", solflareProvider.publicKey.toString())
            setConnected(true)
            setPublicKey(solflareProvider.publicKey.toString())
            setWalletType("solflare")
            setError(null)
            await refreshBalances(solflareProvider.publicKey.toString())
            return
          }
        }

        // Set error if no wallets found
        if (!phantomInstalled && !solflareInstalled) {
          setError("No Solana wallet detected. Please install Phantom or Solflare wallet.")
          console.log("❌ No Solana wallets found")
        } else {
          setError(null)
          console.log("✅ Wallet initialization complete")
        }
      } catch (error) {
        console.error("❌ Wallet initialization error:", error)
        setError("Failed to initialize wallet connections")
      }
    }

    const timer = setTimeout(initializeWallet, 500)
    return () => clearTimeout(timer)
  }, [])

  // Enhanced balance fetching with retry logic
  const fetchSolBalance = async (address: string | null, retries = 3): Promise<number> => {
    if (!address) return 0

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`💰 Fetching SOL balance for ${address} (attempt ${attempt}/${retries})`)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Generate consistent balance based on wallet address
        const addressHash = address.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0)

        // Generate balance between 0.5 and 50 SOL
        const mockSolBalance = Math.abs(addressHash % 4950) / 100 + 0.5
        const roundedBalance = Number.parseFloat(mockSolBalance.toFixed(4))

        console.log(`✅ SOL Balance fetched: ${roundedBalance} SOL`)
        setSolBalance(roundedBalance)
        return roundedBalance
      } catch (error) {
        console.error(`❌ SOL balance fetch attempt ${attempt} failed:`, error)

        if (attempt === retries) {
          console.error("❌ All SOL balance fetch attempts failed")
          setSolBalance(0)
          return 0
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return 0
  }

  // Enhanced WSGold balance fetching with retry logic
  const fetchWSGoldBalance = async (address: string | null, retries = 3): Promise<number> => {
    if (!address) return 0

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🪙 Fetching WSGold balance for ${address} (attempt ${attempt}/${retries})`)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Generate consistent WSGold balance
        const addressHash = address.split("").reduce((a, b) => {
          a = (a << 7) - a + b.charCodeAt(0)
          return a & a
        }, 0)

        const mockWSGoldBalance = Math.abs(addressHash % 2000) + 50 // 50-2050 WSGold
        const roundedBalance = Number.parseFloat(mockWSGoldBalance.toFixed(2))

        console.log(`✅ WSGold Balance fetched: ${roundedBalance} WSGold`)
        setWSGoldBalance(roundedBalance)
        return roundedBalance
      } catch (error) {
        console.error(`❌ WSGold balance fetch attempt ${attempt} failed:`, error)

        if (attempt === retries) {
          console.error("❌ All WSGold balance fetch attempts failed")
          setWSGoldBalance(0)
          return 0
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return 0
  }

  // Enhanced balance refresh with loading state
  const refreshBalances = async (address?: string | null) => {
    const targetAddress = address || publicKey
    if (!targetAddress) {
      console.log("❌ No address provided for balance refresh")
      return
    }

    console.log("🔄 Refreshing balances for:", targetAddress)

    try {
      await Promise.all([fetchSolBalance(targetAddress), fetchWSGoldBalance(targetAddress)])
      console.log("✅ Balance refresh completed")
    } catch (error) {
      console.error("❌ Balance refresh failed:", error)
    }
  }

  // Enhanced Solflare connection with multiple fallback methods
  const connectSolflare = async () => {
    const provider = getSolflareProvider()
    if (!provider) {
      throw new Error("Solflare wallet not found. Please install Solflare wallet extension and refresh the page.")
    }

    console.log("🔄 Attempting to connect to Solflare...")

    try {
      let response

      // Method 1: Standard connect
      try {
        console.log("📞 Trying standard connect method...")
        response = await provider.connect()
      } catch (connectError: any) {
        console.log("⚠️ Standard connect failed, trying alternatives...")

        // Method 2: Connect with empty options
        try {
          console.log("📞 Trying connect with empty options...")
          response = await provider.connect({})
        } catch (optionsError) {
          // Method 3: Connect with onlyIfTrusted false
          try {
            console.log("📞 Trying connect with onlyIfTrusted: false...")
            response = await provider.connect({ onlyIfTrusted: false })
          } catch (trustedError) {
            console.error("❌ All connection methods failed")
            throw new Error("Failed to connect to Solflare wallet. Please try again or restart your browser.")
          }
        }
      }

      // Validate response
      if (!response || !response.publicKey) {
        throw new Error("Failed to get public key from Solflare wallet. Please try connecting again.")
      }

      const publicKeyString = response.publicKey.toString()
      console.log("✅ Solflare connected successfully:", publicKeyString)

      setPublicKey(publicKeyString)
      setConnected(true)
      setError(null)

      // Fetch balances
      await refreshBalances(publicKeyString)

      return response
    } catch (error: any) {
      console.error("❌ Solflare connection error:", error)

      // Handle specific error codes
      if (error.code === 4001 || error.message?.includes("User rejected")) {
        throw new Error("Connection rejected by user. Please approve the connection in Solflare wallet.")
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check your Solflare wallet.")
      } else if (error.message?.includes("not found")) {
        throw new Error("Solflare wallet not detected. Please install Solflare extension and refresh the page.")
      } else {
        throw new Error(error.message || "Failed to connect to Solflare wallet. Please try again.")
      }
    }
  }

  // Enhanced Phantom connection
  const connectPhantom = async () => {
    const provider = getPhantomProvider()
    if (!provider) {
      throw new Error("Phantom wallet not found. Please install Phantom wallet extension and refresh the page.")
    }

    console.log("🔄 Attempting to connect to Phantom...")

    try {
      const response = await provider.connect({ onlyIfTrusted: false })

      if (!response || !response.publicKey) {
        throw new Error("Failed to get public key from Phantom wallet. Please try connecting again.")
      }

      const publicKeyString = response.publicKey.toString()
      console.log("✅ Phantom connected successfully:", publicKeyString)

      setPublicKey(publicKeyString)
      setConnected(true)
      setError(null)

      // Fetch balances
      await refreshBalances(publicKeyString)

      return response
    } catch (error: any) {
      console.error("❌ Phantom connection error:", error)

      if (error.code === 4001) {
        throw new Error("Connection rejected by user. Please approve the connection in Phantom wallet.")
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check your Phantom wallet.")
      } else {
        throw new Error(error.message || "Failed to connect to Phantom wallet. Please try again.")
      }
    }
  }

  // Enhanced wallet connection with better error handling
  const connect = async (type: WalletType) => {
    if (!type) return

    setConnecting(true)
    setError(null)

    try {
      console.log(`🔗 Connecting to ${type} wallet...`)

      // Re-check installations
      checkWalletInstallations()

      if (type === "phantom") {
        if (!isPhantomInstalled) {
          throw new Error("Phantom wallet not installed. Please install Phantom wallet extension.")
        }
        await connectPhantom()
        setWalletType("phantom")
      } else if (type === "solflare") {
        if (!isSolflareInstalled) {
          throw new Error("Solflare wallet not installed. Please install Solflare wallet extension.")
        }
        await connectSolflare()
        setWalletType("solflare")
      }

      console.log(`✅ Successfully connected to ${type}`)

      toast({
        title: `${type === "phantom" ? "Phantom" : "Solflare"} Connected! 🎉`,
        description: `Ready to stake SOL and earn WSGold bonuses. ${type === "solflare" ? "Rewards will be sent to Phantom address." : ""}`,
      })
    } catch (error: any) {
      console.error(`❌ Connection error (${type}):`, error)
      setError(error.message || `Failed to connect to ${type} wallet`)

      toast({
        title: "Connection failed",
        description: error.message || `Failed to connect to ${type} wallet`,
        variant: "destructive",
      })
      throw error
    } finally {
      setConnecting(false)
    }
  }

  // Enhanced disconnect with cleanup
  const disconnect = async () => {
    try {
      console.log("🔌 Disconnecting wallet...")

      if (walletType === "phantom") {
        const provider = getPhantomProvider()
        if (provider) {
          await provider.disconnect()
        }
      } else if (walletType === "solflare") {
        const provider = getSolflareProvider()
        if (provider) {
          await provider.disconnect()
        }
      }

      // Clean up state
      setConnected(false)
      setPublicKey(null)
      setSolBalance(null)
      setWSGoldBalance(null)
      setWalletType(null)
      setError(null)

      console.log("✅ Wallet disconnected successfully")

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error: any) {
      console.error("❌ Disconnect error:", error)
      toast({
        title: "Disconnect failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  // Get current SOL balance
  const getSolBalance = async (): Promise<number> => {
    if (!publicKey) return 0
    return (await fetchSolBalance(publicKey)) || solBalance || 0
  }

  // Get current WSGold balance
  const getWSGoldBalance = async (): Promise<number> => {
    if (!publicKey) return 0
    return (await fetchWSGoldBalance(publicKey)) || wsgoldBalance || 0
  }

  // Enhanced transaction signing
  const signTransaction = async (transaction: any) => {
    if (walletType === "phantom") {
      const provider = getPhantomProvider()
      if (!provider) throw new Error("Phantom wallet not connected")
      return await provider.signTransaction(transaction)
    } else if (walletType === "solflare") {
      const provider = getSolflareProvider()
      if (!provider) throw new Error("Solflare wallet not connected")
      return await provider.signTransaction(transaction)
    }

    throw new Error("No wallet connected")
  }

  const signAllTransactions = async (transactions: any[]) => {
    if (walletType === "phantom") {
      const provider = getPhantomProvider()
      if (!provider) throw new Error("Phantom wallet not connected")
      return await provider.signAllTransactions(transactions)
    } else if (walletType === "solflare") {
      const provider = getSolflareProvider()
      if (!provider) throw new Error("Solflare wallet not connected")
      return await provider.signAllTransactions(transactions)
    }

    throw new Error("No wallet connected")
  }

  const signMessage = async (message: Uint8Array | string) => {
    if (walletType === "phantom") {
      const provider = getPhantomProvider()
      if (!provider) throw new Error("Phantom wallet not connected")

      if (typeof message === "string") {
        message = new TextEncoder().encode(message)
      }

      return await provider.signMessage(message as Uint8Array)
    } else if (walletType === "solflare") {
      const provider = getSolflareProvider()
      if (!provider) throw new Error("Solflare wallet not connected")

      if (typeof message === "string") {
        message = new TextEncoder().encode(message)
      }

      return await provider.signMessage(message as Uint8Array)
    }

    throw new Error("No wallet connected")
  }

  // Set Phantom receive address
  const setPhantomReceiveAddress = (address: string) => {
    setPhantomAddress(address)
    console.log("📍 Phantom receive address set:", address)
  }

  // Handle disconnect
  const handleDisconnect = () => {
    setConnected(false)
    setPublicKey(null)
    setSolBalance(null)
    setWSGoldBalance(null)
    setWalletType(null)
    setError(null)
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Setup event listeners
  useEffect(() => {
    if (!connected || !walletType) return

    const setupEventListeners = () => {
      if (walletType === "phantom") {
        const provider = getPhantomProvider()
        if (provider) {
          const onConnect = (publicKey: any) => {
            console.log("🔗 Phantom connected:", publicKey.toString())
            setConnected(true)
            setPublicKey(publicKey.toString())
            setError(null)
            refreshBalances(publicKey.toString())
          }

          const onDisconnect = () => {
            console.log("🔌 Phantom disconnected")
            handleDisconnect()
          }

          const onAccountChange = (publicKey: any) => {
            if (publicKey) {
              console.log("🔄 Phantom account changed:", publicKey.toString())
              setPublicKey(publicKey.toString())
              refreshBalances(publicKey.toString())
            }
          }

          provider.on("connect", onConnect)
          provider.on("disconnect", onDisconnect)
          provider.on("accountChanged", onAccountChange)

          return () => {
            provider.off("connect", onConnect)
            provider.off("disconnect", onDisconnect)
            provider.off("accountChanged", onAccountChange)
          }
        }
      } else if (walletType === "solflare") {
        const provider = getSolflareProvider()
        if (provider) {
          const onConnect = (publicKey: any) => {
            console.log("🔗 Solflare connected:", publicKey.toString())
            setConnected(true)
            setPublicKey(publicKey.toString())
            setError(null)
            refreshBalances(publicKey.toString())
          }

          const onDisconnect = () => {
            console.log("🔌 Solflare disconnected")
            handleDisconnect()
          }

          const onAccountChange = (publicKey: any) => {
            if (publicKey) {
              console.log("🔄 Solflare account changed:", publicKey.toString())
              setPublicKey(publicKey.toString())
              refreshBalances(publicKey.toString())
            }
          }

          provider.on("connect", onConnect)
          provider.on("disconnect", onDisconnect)
          provider.on("accountChanged", onAccountChange)

          return () => {
            provider.off("connect", onConnect)
            provider.off("disconnect", onDisconnect)
            provider.off("accountChanged", onAccountChange)
          }
        }
      }
    }

    return setupEventListeners()
  }, [walletType, connected])

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        solBalance,
        wsgoldBalance,
        connecting,
        walletType,
        error,
        isPhantomInstalled,
        isSolflareInstalled,
        phantomAddress,
        connect,
        disconnect,
        signTransaction,
        signAllTransactions,
        signMessage,
        getPhantomProvider,
        getSolflareProvider,
        getSolBalance,
        getWSGoldBalance,
        refreshBalances,
        setPhantomReceiveAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
export { WSGOLD_TOKEN_CONFIG, SOL_STAKING_CONTRACT }
