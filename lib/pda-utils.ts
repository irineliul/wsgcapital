import { PublicKey } from "@solana/web3.js"
import { PROGRAM_ID } from "./solana-connection"

// PDA seed constants
export const USER_STAKE_SEED = "user-stake"

// Generate PDA for user stake account
export function getUserStakePDA(userPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(USER_STAKE_SEED), userPublicKey.toBuffer()], PROGRAM_ID)
}

// Generate PDA address as string
export function getUserStakePDAString(userPublicKey: PublicKey): string {
  const [pda] = getUserStakePDA(userPublicKey)
  return pda.toString()
}

// Validate PDA
export function validatePDA(userPublicKey: PublicKey, expectedPDA: PublicKey): boolean {
  const [calculatedPDA] = getUserStakePDA(userPublicKey)
  return calculatedPDA.equals(expectedPDA)
}
