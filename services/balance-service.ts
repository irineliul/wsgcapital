import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { connection } from "@/lib/solana-connection"

export interface BalanceInfo {
  sol: number
  lamports: number
}

// Get SOL balance for a wallet
export async function getSolBalance(walletAddress: string): Promise<BalanceInfo> {
  try {
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)

    return {
      sol: balance / LAMPORTS_PER_SOL,
      lamports: balance,
    }
  } catch (error) {
    console.error("Error fetching SOL balance:", error)
    return {
      sol: 0,
      lamports: 0,
    }
  }
}

// Check if wallet has sufficient balance for staking
export async function checkSufficientBalance(
  walletAddress: string,
  stakeAmount: number,
  estimatedFees = 0.001, // 0.001 SOL for transaction fees
): Promise<{ sufficient: boolean; currentBalance: number; required: number }> {
  const balanceInfo = await getSolBalance(walletAddress)
  const required = stakeAmount + estimatedFees

  return {
    sufficient: balanceInfo.sol >= required,
    currentBalance: balanceInfo.sol,
    required: required,
  }
}

// Format SOL amount for display
export function formatSolAmount(amount: number, decimals = 4): string {
  return amount.toFixed(decimals)
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL)
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}
