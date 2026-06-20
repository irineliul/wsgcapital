"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
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
  isConnected?: boolean
  connect: (options?: any) => Promise<any>
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
  connecting: boolean
  walletType: WalletType
  error: string | null
  isPhantomInstalled: boolean
  isSolflareInstalled: boolean
  balanceLoading: boolean
  connect: (type: WalletType) => Promise<void>
  disconnect: () => Promise<void>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  signMessage: (message: Uint8Array | string) => Promise<any>
  getPhantomProvider: () => PhantomProvider | null
  getSolflareProvider: () => SolflareProvider | null
  getSolBalance: () => Promise<number>
  refreshBalances: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  solBalance: null,
  connecting: false,
  walletType: null,
  error: null,
  isPhantomInstalled: false,
  isSolflareInstalled: false,
  balanceLoading: false,
  connect: async () => {},
  disconnect: async () => {},
  signTransaction: async (transaction) => transaction,
  signAllTransactions: async (transactions) => transactions,
  signMessage: async (message) => ({ signature: new Uint8Array() }),
  getPhantomProvider: () => null,
  getSolflareProvider: () => null,
  getSolBalance: async () => 0,
  refreshBalances: async () => {},
})

// Solana connection - using Devnet for testing
const connection = new Connection("https://api.devnet.solana.com", "confirmed")

// SOL Staking Contract Address - Real Program ID
const SOL_STAKING_CONTRACT = "9Kc71kvmUwk8tmexcEWXNvjZJHUzM7Jhf63V8jjcXYb"

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [walletType, setWalletType] = useState<WalletType>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false)
  const [isSolflareInstalled, setIsSolflareInstalled] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const { toast } = useToast()

  // Enhanced Phantom provider detection
  const getPhantomProvider = (): PhantomProvider | null => {
    if (typeof window === "undefined") return null

    try {
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

  // Enhanced Solflare provider detection
  const getSolflareProvider = (): SolflareProvider | null => {
    if (typeof window === "undefined") return null

    try {
      console.log("🔍 Searching for Solflare provider...")

      let provider = null

      // Method 1: Check window.solflare (most common)
      if ((window as any).solflare) {
        console.log("📍 Found window.solflare")
        provider = (window as any).solflare

        // Validate it's actually Solflare
        if (provider && (provider.isSolflare || provider.name === "Solflare")) {
          console.log("✅ Confirmed Solflare provider via window.solflare")
          return provider as SolflareProvider
        }
      }

      // Method 2: Check window.solana for Solflare
      if ((window as any).solana) {
        const solanaProvider = (window as any).solana
        console.log("📍 Found window.solana, checking if it's Solflare...")

        // Check various Solflare identifiers
        if (
          solanaProvider.isSolflare ||
          solanaProvider.name === "Solflare" ||
          solanaProvider._name === "Solflare" ||
          (solanaProvider.constructor && solanaProvider.constructor.name === "SolflareWallet")
        ) {
          console.log("✅ Confirmed Solflare provider via window.solana")
          return solanaProvider as SolflareProvider
        }
      }

      // Method 3: Check for multiple wallet providers
      if ((window as any).solana?.providers) {
        console.log("📍 Found multiple providers, searching for Solflare...")
        const providers = (window as any).solana.providers

        for (const p of providers) {
          if (p.isSolflare || p.name === "Solflare" || p._name === "Solflare") {
            console.log("✅ Found Solflare in providers array")
            return p as SolflareProvider
          }
        }
      }

      // Method 4: Check window.SolflareWallet
      if ((window as any).SolflareWallet) {
        console.log("📍 Found window.SolflareWallet")
        provider = (window as any).SolflareWallet
        return provider as SolflareProvider
      }

      // Method 5: Check for Solflare in global scope
      const globalSolflare = (window as any)["Solflare"] || (window as any)["solflareWallet"]
      if (globalSolflare) {
        console.log("📍 Found Solflare in global scope")
        return globalSolflare as SolflareProvider
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

  // Real SOL balance fetching from Solana blockchain
  const fetchRealSolBalance = async (address: string | null, retries = 3): Promise<number> => {
    if (!address) {
      console.log("❌ No address provided for balance fetch")
      return 0
    }

    setBalanceLoading(true)

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`💰 Fetching real SOL balance for ${address} (attempt ${attempt}/${retries})`)

        // Create PublicKey from address string
        const publicKey = new PublicKey(address)

        // Fetch balance from Solana blockchain
        const balanceInLamports = await connection.getBalance(publicKey)

        // Convert lamports to SOL
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL

        console.log(`✅ Real SOL Balance fetched: ${balanceInSol} SOL (${balanceInLamports} lamports)`)

        setSolBalance(balanceInSol)
        setBalanceLoading(false)
        return balanceInSol
      } catch (error: any) {
        console.error(`❌ SOL balance fetch attempt ${attempt} failed:`, error)

        if (attempt === retries) {
          console.error("❌ All SOL balance fetch attempts failed")

          // Show user-friendly error message
          if (error.message?.includes("Invalid public key")) {
            toast({
              title: "Invalid wallet address",
              description: "The wallet address format is invalid",
              variant: "destructive",
            })
          } else if (error.message?.includes("network")) {
            toast({
              title: "Network error",
              description: "Unable to connect to Solana network. Please try again.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Balance fetch failed",
              description: "Unable to fetch wallet balance. Please try again.",
              variant: "destructive",
            })
          }

          setSolBalance(0)
          setBalanceLoading(false)
          return 0
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    setBalanceLoading(false)
    return 0
  }

  // Enhanced balance refresh with real blockchain data
  const refreshBalances = async (address?: string | null) => {
    const targetAddress = address || publicKey
    if (!targetAddress) {
      console.log("❌ No address provided for balance refresh")
      return
    }

    console.log("🔄 Refreshing real balances for:", targetAddress)

    try {
      await fetchRealSolBalance(targetAddress)
      console.log("✅ Real balance refresh completed")
    } catch (error) {
      console.error("❌ Balance refresh failed:", error)
    }
  }

  // Enhanced wallet initialization with better error handling
  useEffect(() => {
    const initializeWallet = async () => {
      console.log("🚀 Initializing wallet connections...")

      try {
        // Wait for wallet extensions to load
        await new Promise((resolve) => setTimeout(resolve, 2000))

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

  // Enhanced Solflare connection with better error handling
  const connectSolflare = async () => {
    const provider = getSolflareProvider()
    if (!provider) {
      throw new Error("Solflare wallet not found. Please install Solflare wallet extension and refresh the page.")
    }

    console.log("🔄 Attempting to connect to Solflare...")

    try {
      let result = null
      let publicKeyResult = null

      // Method 1: Try the standard connect method
      if (typeof provider.connect === "function") {
        console.log("📞 Trying standard connect method...")
        try {
          result = await provider.connect()
          console.log("Connect result:", result)

          if (result && result.publicKey) {
            publicKeyResult = result.publicKey
          } else if (provider.publicKey) {
            publicKeyResult = provider.publicKey
          }
        } catch (connectError: any) {
          console.log("⚠️ Standard connect failed:", connectError.message)

          // Method 2: Try connect with options
          try {
            console.log("📞 Trying connect with options...")
            result = await provider.connect({ onlyIfTrusted: false })
            console.log("Connect with options result:", result)

            if (result && result.publicKey) {
              publicKeyResult = result.publicKey
            } else if (provider.publicKey) {
              publicKeyResult = provider.publicKey
            }
          } catch (optionsError: any) {
            console.log("⚠️ Connect with options failed:", optionsError.message)

            // Method 3: Try to trigger wallet popup manually
            try {
              console.log("📞 Trying manual wallet trigger...")

              if (provider.connect) {
                result = await provider.connect({})
                if (result && result.publicKey) {
                  publicKeyResult = result.publicKey
                } else if (provider.publicKey) {
                  publicKeyResult = provider.publicKey
                }
              }
            } catch (manualError: any) {
              console.log("⚠️ Manual trigger failed:", manualError.message)
              throw new Error("Unable to connect to Solflare. Please ensure Solflare is unlocked and try again.")
            }
          }
        }
      } else {
        throw new Error("Solflare wallet connect method not available. Please update your Solflare extension.")
      }

      // Validate we got a public key
      if (!publicKeyResult) {
        if (provider.publicKey) {
          publicKeyResult = provider.publicKey
          console.log("📍 Using existing public key from provider")
        } else {
          throw new Error(
            "Failed to obtain public key from Solflare wallet. Please ensure your wallet is unlocked and try again.",
          )
        }
      }

      // Convert public key to string
      let publicKeyString: string
      if (typeof publicKeyResult === "string") {
        publicKeyString = publicKeyResult
      } else if (publicKeyResult && typeof publicKeyResult.toString === "function") {
        publicKeyString = publicKeyResult.toString()
      } else if (publicKeyResult && publicKeyResult.toBase58) {
        publicKeyString = publicKeyResult.toBase58()
      } else {
        throw new Error("Invalid public key format received from Solflare wallet.")
      }

      console.log("✅ Solflare connected successfully:", publicKeyString)

      setPublicKey(publicKeyString)
      setConnected(true)
      setError(null)

      // Fetch real balance from blockchain
      await refreshBalances(publicKeyString)

      return { publicKey: { toString: () => publicKeyString } }
    } catch (error: any) {
      console.error("❌ Solflare connection error:", error)

      if (error.code === 4001 || error.message?.includes("User rejected") || error.message?.includes("rejected")) {
        throw new Error("Connection rejected by user. Please approve the connection in Solflare wallet.")
      } else if (error.code === -32002 || error.message?.includes("pending")) {
        throw new Error("Connection request already pending. Please check your Solflare wallet.")
      } else if (error.message?.includes("not found") || error.message?.includes("install")) {
        throw new Error("Solflare wallet not detected. Please install Solflare extension and refresh the page.")
      } else if (error.message?.includes("unlock") || error.message?.includes("locked")) {
        throw new Error("Please unlock your Solflare wallet and try again.")
      } else {
        throw new Error(
          error.message ||
            "Failed to connect to Solflare wallet. Please ensure Solflare is installed, unlocked, and try again.",
        )
      }
    }
  }

  // Enhanced Phantom connection with better error handling
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

      // Fetch real balance from blockchain
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

      const walletNames = {
        phantom: "Phantom",
        solflare: "Solflare",
      }

      toast({
        title: `${walletNames[type]} Connected! 🎉`,
        description: `Wallet connected successfully. Balance loaded from Solana Devnet.`,
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
      setWalletType(null)
      setError(null)
      setBalanceLoading(false)

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

  // Get current real SOL balance
  const getSolBalance = async (): Promise<number> => {
    if (!publicKey) return 0
    return (await fetchRealSolBalance(publicKey)) || solBalance || 0
  }

  // Enhanced transaction signing with wallet-specific implementations
  const signTransaction = async (transaction: any) => {
    console.log(`🔐 Signing transaction with ${walletType} wallet...`)

    if (walletType === "phantom") {
      const provider = getPhantomProvider()
      if (!provider) throw new Error("Phantom wallet not connected")
      console.log("👻 Using Phantom to sign transaction")
      return await provider.signTransaction(transaction)
    } else if (walletType === "solflare") {
      const provider = getSolflareProvider()
      if (!provider) throw new Error("Solflare wallet not connected")
      console.log("🔥 Using Solflare to sign transaction")
      return await provider.signTransaction(transaction)
    }

    throw new Error("No wallet connected")
  }

  const signAllTransactions = async (transactions: any[]) => {
    console.log(`🔐 Signing ${transactions.length} transactions with ${walletType} wallet...`)

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
    console.log(`🔐 Signing message with ${walletType} wallet...`)

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

  // Handle disconnect
  const handleDisconnect = () => {
    setConnected(false)
    setPublicKey(null)
    setSolBalance(null)
    setWalletType(null)
    setError(null)
    setBalanceLoading(false)
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

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!connected || !publicKey) return

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing balance...")
      refreshBalances()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [connected, publicKey])

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        solBalance,
        connecting,
        walletType,
        error,
        isPhantomInstalled,
        isSolflareInstalled,
        balanceLoading,
        connect,
        disconnect,
        signTransaction,
        signAllTransactions,
        signMessage,
        getPhantomProvider,
        getSolflareProvider,
        getSolBalance,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
export { SOL_STAKING_CONTRACT }
