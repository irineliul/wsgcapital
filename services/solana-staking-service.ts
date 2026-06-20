"use client"

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  type AccountMeta,
} from "@solana/web3.js"

// Solana connection - using Devnet for testing
const connection = new Connection("https://api.devnet.solana.com", "confirmed")

// SOL Staking Program ID - Your deployed program
const STAKING_PROGRAM_ID = new PublicKey("21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw")

// WSGold Token Mint Address
const WSGOLD_MINT = new PublicKey("HqgWWXhqfSAuhds7XfAiFDycK3kuSFeYdyfKTdDBwh9j")

// Staking Pool Address
const STAKING_POOL = new PublicKey("2KFSPxB6TKaBtE4gWZ7XpLhyiBWwMpzWR8WqcP7MDQCg")

// Anchor instruction discriminators (from the program IDL)
const INSTRUCTION_DISCRIMINATORS = {
  stake: Buffer.from([206, 176, 202, 18, 200, 209, 179, 108]),
  claim: Buffer.from([4, 144, 132, 71, 116, 23, 151, 80]), // claim_rewards
  unstake: Buffer.from([156, 45, 210, 12, 158, 98, 247, 93]), // emergency_unstake
}

// PDA seed used by the program for the user stake account
const USER_STAKE_SEED = Buffer.from("user-stake")

export interface StakeInfo {
  amount: number
  startTime: number
  endTime: number
  isActive: boolean
  rewards: number
  multiplier: number
}

export interface StakingStats {
  totalStaked: number
  totalRewards: number
  activeStakers: number
  apy: number
}

export class SolanaStakingService {
  private connection: Connection
  private toast: any

  constructor() {
    this.connection = connection
  }

  // Initialize with toast
  init(toast: any) {
    this.toast = toast
  }

  // Get staking stats from the program
  async getStakingStats(): Promise<StakingStats> {
    try {
      console.log("📊 Fetching staking stats...")

      // Simulate fetching stats from the program
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock stats for demo - in real implementation would fetch from program accounts
      const stats: StakingStats = {
        totalStaked: 125000 + Math.random() * 50000, // 125k-175k SOL
        totalRewards: 12500000 + Math.random() * 5000000, // 12.5M-17.5M WSGold
        activeStakers: 1250 + Math.floor(Math.random() * 500), // 1250-1750 stakers
        apy: 10000, // 100x multiplier = 10,000% APY
      }

      console.log("✅ Staking stats fetched:", stats)
      return stats
    } catch (error) {
      console.error("❌ Failed to fetch staking stats:", error)
      throw new Error("Failed to fetch staking statistics")
    }
  }

  // Get user's stake information
  async getUserStakeInfo(userPublicKey: string): Promise<StakeInfo | null> {
    try {
      console.log("👤 Fetching user stake info for:", userPublicKey)

      const publicKey = new PublicKey(userPublicKey)

      // Derive the user's stake account PDA (seed: "user-stake" + user pubkey)
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, publicKey.toBuffer()],
        STAKING_PROGRAM_ID,
      )

      console.log("📍 Stake account PDA:", stakeAccount.toString())

      // Try to fetch the stake account
      const accountInfo = await this.connection.getAccountInfo(stakeAccount)

      if (!accountInfo) {
        console.log("❌ No stake account found for user")
        return null
      }

      // Parse the account data (simplified for demo)
      // In real implementation, would use proper borsh deserialization
      const data = accountInfo.data

      if (data.length < 64) {
        console.log("❌ Invalid stake account data")
        return null
      }

      // Mock parsing - in real implementation would deserialize properly
      const amount = Math.random() * 10 + 1 // 1-11 SOL
      const startTime = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Random time in last week
      const endTime = startTime + 14 * 24 * 60 * 60 * 1000 // 14 days later
      const isActive = Date.now() < endTime
      const rewards = amount * 100 // 100x multiplier
      const multiplier = 100

      const stakeInfo: StakeInfo = {
        amount,
        startTime,
        endTime,
        isActive,
        rewards,
        multiplier,
      }

      console.log("✅ User stake info:", stakeInfo)
      return stakeInfo
    } catch (error) {
      console.error("❌ Failed to fetch user stake info:", error)
      return null
    }
  }

  // Create stake transaction
  async createStakeTransaction(
    userPublicKey: string,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    try {
      console.log(`💰 Creating stake transaction: ${amount} SOL for ${userPublicKey}`)

      const publicKey = new PublicKey(userPublicKey)
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash("confirmed")

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      })

      // Derive the user's stake account PDA (seed: "user-stake" + user pubkey)
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, publicKey.toBuffer()],
        STAKING_PROGRAM_ID,
      )

      // Create stake instruction with Anchor discriminator
      // Account order must match IDL: user_stake, user, system_program
      const amountBuffer = Buffer.alloc(8)
      amountBuffer.writeBigUInt64LE(BigInt(lamports), 0)
      
      const stakeInstruction = new TransactionInstruction({
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: stakeAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ] as AccountMeta[],
        data: Buffer.concat([INSTRUCTION_DISCRIMINATORS.stake, amountBuffer]),
      })

      transaction.add(stakeInstruction)

      console.log("📝 Transaction created, requesting signature...")

      // Sign transaction with wallet
      const signedTransaction = await signTransaction(transaction)

      console.log("✅ Transaction signed, sending to network...")

      // Send transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      })

      console.log("🚀 Transaction sent:", signature)

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      console.log("✅ Stake transaction confirmed:", signature)

      this.toast?.({
        title: "Staking Successful! 🎉",
        description: `Successfully staked ${amount} SOL. Earning 100x multiplier rewards!`,
      })

      return signature
    } catch (error: any) {
      console.error("❌ Stake transaction failed:", error)

      this.toast?.({
        title: "Staking Failed",
        description: error.message || "Failed to stake SOL. Please try again.",
        variant: "destructive",
      })

      throw error
    }
  }

  // Create claim rewards transaction
  async createClaimTransaction(
    userPublicKey: string,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    try {
      console.log(`🎁 Creating claim transaction for ${userPublicKey}`)

      const publicKey = new PublicKey(userPublicKey)

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash("confirmed")

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      })

      // Derive the user's stake account PDA (seed: "user-stake" + user pubkey)
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, publicKey.toBuffer()],
        STAKING_PROGRAM_ID,
      )

      // Create claim instruction with Anchor discriminator
      // Account order must match IDL: user_stake, user, system_program
      const claimInstruction = new TransactionInstruction({
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: stakeAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ] as AccountMeta[],
        data: INSTRUCTION_DISCRIMINATORS.claim,
      })

      transaction.add(claimInstruction)

      console.log("📝 Claim transaction created, requesting signature...")

      // Sign transaction with wallet
      const signedTransaction = await signTransaction(transaction)

      console.log("✅ Transaction signed, sending to network...")

      // Send transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      })

      console.log("🚀 Claim transaction sent:", signature)

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      console.log("✅ Claim transaction confirmed:", signature)

      this.toast?.({
        title: "Rewards Claimed! 🎉",
        description: "Successfully claimed your WSGold rewards!",
      })

      return signature
    } catch (error: any) {
      console.error("❌ Claim transaction failed:", error)

      this.toast?.({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards. Please try again.",
        variant: "destructive",
      })

      throw error
    }
  }

  // Create unstake transaction
  async createUnstakeTransaction(
    userPublicKey: string,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    try {
      console.log(`🔓 Creating unstake transaction for ${userPublicKey}`)

      const publicKey = new PublicKey(userPublicKey)

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash("confirmed")

      // Create transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      })

      // Derive the user's stake account PDA (seed: "user-stake" + user pubkey)
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [USER_STAKE_SEED, publicKey.toBuffer()],
        STAKING_PROGRAM_ID,
      )

      // Create unstake instruction with Anchor discriminator
      // Account order must match IDL: user_stake, user, system_program
      const unstakeInstruction = new TransactionInstruction({
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: stakeAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ] as AccountMeta[],
        data: INSTRUCTION_DISCRIMINATORS.unstake,
      })

      transaction.add(unstakeInstruction)

      console.log("📝 Unstake transaction created, requesting signature...")

      // Sign transaction with wallet
      const signedTransaction = await signTransaction(transaction)

      console.log("✅ Transaction signed, sending to network...")

      // Send transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      })

      console.log("🚀 Unstake transaction sent:", signature)

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      console.log("✅ Unstake transaction confirmed:", signature)

      this.toast?.({
        title: "Unstaking Successful! 🎉",
        description: "Successfully unstaked your SOL and claimed rewards!",
      })

      return signature
    } catch (error: any) {
      console.error("❌ Unstake transaction failed:", error)

      this.toast?.({
        title: "Unstake Failed",
        description: error.message || "Failed to unstake SOL. Please try again.",
        variant: "destructive",
      })

      throw error
    }
  }

  // Get transaction status
  async getTransactionStatus(signature: string): Promise<"pending" | "confirmed" | "failed"> {
    try {
      const status = await this.connection.getSignatureStatus(signature)

      if (!status.value) {
        return "pending"
      }

      if (status.value.err) {
        return "failed"
      }

      if (status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized") {
        return "confirmed"
      }

      return "pending"
    } catch (error) {
      console.error("❌ Failed to get transaction status:", error)
      return "failed"
    }
  }

  // Estimate transaction fee
  async estimateTransactionFee(userPublicKey: string, instruction: "stake" | "claim" | "unstake"): Promise<number> {
    try {
      // Base fee for Solana transactions (approximately 0.000005 SOL)
      const baseFee = 0.000005

      // Additional fees based on instruction complexity
      const instructionFees = {
        stake: 0.00001, // Slightly higher for account creation
        claim: 0.000005, // Standard fee
        unstake: 0.000005, // Standard fee
      }

      const totalFee = baseFee + instructionFees[instruction]

      console.log(`💸 Estimated fee for ${instruction}: ${totalFee} SOL`)

      return totalFee
    } catch (error) {
      console.error("❌ Failed to estimate transaction fee:", error)
      return 0.00001 // Default fallback fee
    }
  }

  // Check if user has sufficient balance for staking
  async checkSufficientBalance(userPublicKey: string, amount: number): Promise<boolean> {
    try {
      const publicKey = new PublicKey(userPublicKey)
      const balance = await this.connection.getBalance(publicKey)
      const balanceInSol = balance / LAMPORTS_PER_SOL

      const requiredAmount = amount + 0.01 // Amount + buffer for fees
      const hasSufficientBalance = balanceInSol >= requiredAmount

      console.log(
        `💰 Balance check: ${balanceInSol} SOL, Required: ${requiredAmount} SOL, Sufficient: ${hasSufficientBalance}`,
      )

      return hasSufficientBalance
    } catch (error) {
      console.error("❌ Failed to check balance:", error)
      return false
    }
  }

  // Get staking pool info
  async getStakingPoolInfo(): Promise<{
    totalStaked: number
    totalRewards: number
    poolHealth: "healthy" | "warning" | "critical"
  }> {
    try {
      console.log("🏊 Fetching staking pool info...")

      // Simulate fetching pool info
      await new Promise((resolve) => setTimeout(resolve, 800))

      const poolInfo = {
        totalStaked: 125000 + Math.random() * 50000,
        totalRewards: 12500000 + Math.random() * 5000000,
        poolHealth: "healthy" as const,
      }

      console.log("✅ Pool info fetched:", poolInfo)
      return poolInfo
    } catch (error) {
      console.error("❌ Failed to fetch pool info:", error)
      throw new Error("Failed to fetch staking pool information")
    }
  }
}

// Helper function to get time until unlock
export function getTimeUntilUnlock(endTime: number): string {
  const now = Date.now()
  const diff = endTime - now

  if (diff <= 0) {
    return "Unlocked"
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

// Export singleton instance
export const stakingService = new SolanaStakingService()
