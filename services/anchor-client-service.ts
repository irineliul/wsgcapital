import { Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider, type Wallet, BN } from "@coral-xyz/anchor"

const connection = new Connection("https://api.devnet.solana.com", "confirmed")
const PROGRAM_ID = new PublicKey("21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw")

// IDL pentru program
const IDL = {
  address: "21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw",
  metadata: {
    name: "staking_program",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "stake",
      discriminator: [206, 176, 202, 18, 200, 209, 179, 108],
      accounts: [
        {
          name: "user_stake",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 45, 115, 116, 97, 107, 101],
              },
              {
                kind: "account",
                path: "user",
              },
            ],
          },
        },
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "claim_rewards",
      discriminator: [4, 144, 132, 71, 116, 23, 151, 80],
      accounts: [
        {
          name: "user_stake",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 45, 115, 116, 97, 107, 101],
              },
              {
                kind: "account",
                path: "user",
              },
            ],
          },
        },
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "UserStake",
      discriminator: [102, 53, 163, 107, 9, 138, 87, 153],
    },
  ],
  types: [
    {
      name: "UserStake",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "start_time",
            type: "i64",
          },
          {
            name: "end_time",
            type: "i64",
          },
          {
            name: "claimed",
            type: "bool",
          },
        ],
      },
    },
  ],
}

// Wallet wrapper pentru Anchor
class WalletWrapper implements Wallet {
  constructor(
    private _publicKey: PublicKey,
    private _signTransaction: any,
  ) {}

  get publicKey(): PublicKey {
    return this._publicKey
  }

  async signTransaction(tx: any): Promise<any> {
    return await this._signTransaction(tx)
  }

  async signAllTransactions(txs: any[]): Promise<any[]> {
    const signed = []
    for (const tx of txs) {
      signed.push(await this._signTransaction(tx))
    }
    return signed
  }
}

// Stake folosind Anchor client direct
export async function stakeWithAnchorClient(
  walletPublicKey: string,
  amount: number,
  signTransaction: (tx: any) => Promise<any>,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  console.log("🚀 TRYING ANCHOR CLIENT APPROACH...")

  try {
    const userPublicKey = new PublicKey(walletPublicKey)

    // Create wallet wrapper
    const wallet = new WalletWrapper(userPublicKey, signTransaction)

    // Create provider
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    })

    // Create program instance
    const program = new Program(IDL as any, PROGRAM_ID, provider)

    console.log("✅ Anchor program instance created")
    console.log("- Program ID:", program.programId.toString())
    console.log("- Provider wallet:", provider.wallet.publicKey.toString())

    // Calculate PDA
    const [userStakePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-stake"), userPublicKey.toBuffer()],
      program.programId,
    )

    console.log("📍 PDA calculated:", userStakePDA.toString())

    // Convert amount to lamports
    const amountLamports = new BN(amount * 1_000_000_000)

    console.log("💰 Staking amount:", amountLamports.toString(), "lamports")

    // Call stake method
    console.log("📞 Calling program.methods.stake()...")

    const tx = await program.methods
      .stake(amountLamports)
      .accounts({
        userStake: userStakePDA,
        user: userPublicKey,
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      })
      .rpc()

    console.log("✅ Anchor client successful:", tx)

    return {
      success: true,
      transactionId: tx,
    }
  } catch (error: any) {
    console.error("❌ Anchor client failed:", error)

    // Parse Anchor errors
    let errorMessage = "Unknown error"

    if (error.message?.includes("AccountNotSigner")) {
      errorMessage = "Signature verification failed - wallet connection issue"
    } else if (error.message?.includes("InvalidAmount")) {
      errorMessage = "Invalid stake amount - minimum 1 SOL required"
    } else if (error.message?.includes("AlreadyStaked")) {
      errorMessage = "You already have an active stake"
    } else if (error.logs) {
      const logs = Array.isArray(error.logs) ? error.logs.join(" ") : error.logs
      if (logs.includes("AccountNotSigner")) {
        errorMessage = "Critical: Program cannot verify your wallet signature"
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
