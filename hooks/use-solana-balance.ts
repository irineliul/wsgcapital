"use client"

import { useState, useEffect, useCallback } from "react"

export function useSolanaBalance(walletAddress?: string | null) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock balance for demo
      const mockBalance = Math.random() * 1000 + 100
      setBalance(mockBalance)
    } catch (err: any) {
      setError(err.message || "Failed to fetch balance")
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const refreshBalance = useCallback(() => {
    return fetchBalance()
  }, [fetchBalance])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    loading,
    error,
    refreshBalance,
  }
}
