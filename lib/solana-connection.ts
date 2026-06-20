import { Connection, PublicKey } from "@solana/web3.js"

// Solana connection configuration
export const SOLANA_NETWORK = "devnet"
export const RPC_ENDPOINT = "https://api.devnet.solana.com"

// Create connection instance
export const connection = new Connection(RPC_ENDPOINT, "confirmed")

// Program ID from IDL
export const PROGRAM_ID = new PublicKey("21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw")

// Helper function to get connection
export function getConnection(): Connection {
  return connection
}

// Helper function to get program ID
export function getProgramId(): PublicKey {
  return PROGRAM_ID
}

// Check if we're on the correct network
export function validateNetwork(): boolean {
  return SOLANA_NETWORK === "devnet"
}

// Get explorer URL for transaction
export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}`
}

// Get explorer URL for account
export function getAccountExplorerUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_NETWORK}`
}
