import { Connection, PublicKey } from "@solana/web3.js"

const connection = new Connection("https://api.devnet.solana.com", "confirmed")
const PROGRAM_ID = new PublicKey("21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw")

// Debug program deployment
export async function debugProgramDeployment(): Promise<void> {
  console.log("🔍 DEBUGGING PROGRAM DEPLOYMENT...")

  try {
    // Check if program exists
    const programAccount = await connection.getAccountInfo(PROGRAM_ID)

    if (!programAccount) {
      console.error("❌ PROGRAM NOT FOUND ON DEVNET!")
      console.log("📍 Program ID:", PROGRAM_ID.toString())
      console.log("🌐 Network: Devnet")
      console.log("💡 Solution: Deploy the program first using 'anchor deploy'")
      return
    }

    console.log("✅ Program found on-chain")
    console.log("📊 Program account details:")
    console.log("- Owner:", programAccount.owner.toString())
    console.log("- Executable:", programAccount.executable)
    console.log("- Data length:", programAccount.data.length)
    console.log("- Lamports:", programAccount.lamports)

    // Check if it's a valid program
    if (!programAccount.executable) {
      console.error("❌ ACCOUNT IS NOT EXECUTABLE!")
      console.log("💡 This means the program is not properly deployed")
      return
    }

    // Check program owner (should be BPF Loader)
    const expectedOwners = [
      "BPFLoaderUpgradeab1e11111111111111111111111", // Upgradeable BPF Loader
      "BPFLoader2111111111111111111111111111111111", // BPF Loader v2
      "BPFLoader1111111111111111111111111111111111", // BPF Loader v1
    ]

    const isValidOwner = expectedOwners.some((owner) => programAccount.owner.toString() === owner)

    if (!isValidOwner) {
      console.error("❌ INVALID PROGRAM OWNER!")
      console.log("Expected one of:", expectedOwners)
      console.log("Got:", programAccount.owner.toString())
      return
    }

    console.log("✅ Program is properly deployed and executable")
  } catch (error) {
    console.error("❌ Error checking program:", error)
  }
}

// Test PDA generation
export async function debugPDAGeneration(userPublicKey: string): Promise<void> {
  console.log("🔍 DEBUGGING PDA GENERATION...")

  try {
    const userPubkey = new PublicKey(userPublicKey)

    // Generate PDA
    const [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from("user-stake"), userPubkey.toBuffer()], PROGRAM_ID)

    console.log("📍 PDA Details:")
    console.log("- User:", userPubkey.toString())
    console.log("- PDA:", pda.toString())
    console.log("- Bump:", bump)
    console.log("- Program ID:", PROGRAM_ID.toString())

    // Check if PDA account exists
    const pdaAccount = await connection.getAccountInfo(pda)

    if (pdaAccount) {
      console.log("✅ PDA account exists")
      console.log("- Owner:", pdaAccount.owner.toString())
      console.log("- Data length:", pdaAccount.data.length)
      console.log("- Lamports:", pdaAccount.lamports)

      if (pdaAccount.data.length > 8) {
        console.log("📊 Account has data - parsing...")
        // Try to decode
        const accountData = pdaAccount.data.slice(8) // Skip discriminator
        if (accountData.length >= 57) {
          const user = new PublicKey(accountData.slice(0, 32))
          console.log("- Stored user:", user.toString())
          console.log("- User match:", user.equals(userPubkey))
        }
      }
    } else {
      console.log("ℹ️ PDA account does not exist yet (will be created on first stake)")
    }
  } catch (error) {
    console.error("❌ Error with PDA:", error)
  }
}

// Test wallet connection
export async function debugWalletConnection(): Promise<void> {
  console.log("🔍 DEBUGGING WALLET CONNECTION...")

  try {
    // Check available providers
    const providers = []

    if ((window as any).phantom?.solana) {
      providers.push("Phantom")
      const phantom = (window as any).phantom.solana
      console.log("👻 Phantom detected:")
      console.log("- Connected:", phantom.isConnected)
      console.log("- Public key:", phantom.publicKey?.toString())
    }

    if ((window as any).solflare) {
      providers.push("Solflare")
      const solflare = (window as any).solflare
      console.log("🔥 Solflare detected:")
      console.log("- Connected:", solflare.isConnected)
      console.log("- Public key:", solflare.publicKey?.toString())
    }

    if ((window as any).solana) {
      providers.push("Generic Solana")
      const solana = (window as any).solana
      console.log("⚡ Generic Solana provider:")
      console.log("- Is Phantom:", solana.isPhantom)
      console.log("- Is Solflare:", solana.isSolflare)
      console.log("- Connected:", solana.isConnected)
      console.log("- Public key:", solana.publicKey?.toString())
    }

    console.log("📊 Available providers:", providers)

    if (providers.length === 0) {
      console.error("❌ NO WALLET PROVIDERS FOUND!")
      console.log("💡 Please install Phantom or Solflare wallet")
    }
  } catch (error) {
    console.error("❌ Error checking wallets:", error)
  }
}
