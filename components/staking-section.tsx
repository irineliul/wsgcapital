"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/providers/wallet-provider"
import { useToast } from "@/components/ui/use-toast"
import { stakingService, type StakeInfo, type StakingStats } from "@/services/solana-staking-service"
import {
  Coins,
  TrendingUp,
  Clock,
  Zap,
  Loader2,
  Gift,
  Lock,
  Unlock,
  Calculator,
  Info,
  ExternalLink,
} from "lucide-react"
import { WalletConnectionGuide } from "@/components/wallet-connection-guide"

export function StakingSection() {
  const {
    connected,
    publicKey,
    solBalance,
    signTransaction,
    isPhantomInstalled,
    isSolflareInstalled,
    refreshBalances,
  } = useWallet()
  const { toast } = useToast()

  // State management
  const [stakeAmount, setStakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingStakeInfo, setIsLoadingStakeInfo] = useState(false)
  const [stakingStats, setStakingStats] = useState<StakingStats | null>(null)
  const [userStakeInfo, setUserStakeInfo] = useState<StakeInfo | null>(null)
  const [estimatedRewards, setEstimatedRewards] = useState(0)
  const [transactionFee, setTransactionFee] = useState(0)

  // Initialize staking service
  useEffect(() => {
    stakingService.init(toast)
  }, [toast])

  // Load staking stats on component mount
  useEffect(() => {
    loadStakingStats()
  }, [])

  // Load user stake info when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadUserStakeInfo()
    } else {
      setUserStakeInfo(null)
    }
  }, [connected, publicKey])

  // Calculate estimated rewards when stake amount changes
  useEffect(() => {
    if (stakeAmount && !isNaN(Number(stakeAmount))) {
      const amount = Number(stakeAmount)
      const rewards = amount * 100 // 100x multiplier
      setEstimatedRewards(rewards)

      // Estimate transaction fee
      if (connected && publicKey) {
        stakingService.estimateTransactionFee(publicKey, "stake").then(setTransactionFee)
      }
    } else {
      setEstimatedRewards(0)
      setTransactionFee(0)
    }
  }, [stakeAmount, connected, publicKey])

  // Load staking statistics
  const loadStakingStats = async () => {
    try {
      setIsLoadingStats(true)
      const stats = await stakingService.getStakingStats()
      setStakingStats(stats)
    } catch (error) {
      console.error("Failed to load staking stats:", error)
      toast({
        title: "Failed to load stats",
        description: "Unable to fetch staking statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load user stake information
  const loadUserStakeInfo = async () => {
    if (!publicKey) return

    try {
      setIsLoadingStakeInfo(true)
      const stakeInfo = await stakingService.getUserStakeInfo(publicKey)
      setUserStakeInfo(stakeInfo)
    } catch (error) {
      console.error("Failed to load user stake info:", error)
    } finally {
      setIsLoadingStakeInfo(false)
    }
  }

  // Handle staking
  const handleStake = async () => {
    if (!connected || !publicKey || !stakeAmount) {
      toast({
        title: "Invalid input",
        description: "Please connect wallet and enter stake amount",
        variant: "destructive",
      })
      return
    }

    const amount = Number(stakeAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      })
      return
    }

    if (amount > (solBalance || 0)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough SOL to stake this amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsStaking(true)

      // Check sufficient balance including fees
      const hasSufficientBalance = await stakingService.checkSufficientBalance(publicKey, amount)
      if (!hasSufficientBalance) {
        throw new Error("Insufficient balance for staking including transaction fees")
      }

      toast({
        title: "Creating stake transaction...",
        description: "Please approve the transaction in your wallet",
      })

      // Create and send stake transaction
      const signature = await stakingService.createStakeTransaction(publicKey, amount, signTransaction)

      console.log("✅ Stake transaction successful:", signature)

      // Reset form
      setStakeAmount("")

      // Refresh data
      await Promise.all([loadUserStakeInfo(), loadStakingStats(), refreshBalances()])

      toast({
        title: "Staking Successful! 🎉",
        description: (
          <div className="space-y-2">
            <p>Successfully staked {amount} SOL!</p>
            <p>Earning 100x multiplier rewards for 14 days.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank")}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Transaction
            </Button>
          </div>
        ),
      })
    } catch (error: any) {
      console.error("Staking failed:", error)
      
      // Check if user rejected the transaction
      const errorMessage = error.message?.toLowerCase() || ""
      if (errorMessage.includes("user rejected") || errorMessage.includes("rejected the request") || errorMessage.includes("cancelled")) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction in your wallet. No SOL was staked.",
        })
      } else {
        toast({
          title: "Staking Failed",
          description: error.message || "Failed to stake SOL. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsStaking(false)
    }
  }

  // Handle claiming rewards
  const handleClaim = async () => {
    if (!connected || !publicKey || !userStakeInfo) {
      toast({
        title: "No rewards to claim",
        description: "You don't have any active stakes to claim rewards from",
        variant: "destructive",
      })
      return
    }

    try {
      setIsClaiming(true)

      toast({
        title: "Creating claim transaction...",
        description: "Please approve the transaction in your wallet",
      })

      // Create and send claim transaction
      const signature = await stakingService.createClaimTransaction(publicKey, signTransaction)

      console.log("✅ Claim transaction successful:", signature)

      // Refresh data
      await Promise.all([loadUserStakeInfo(), loadStakingStats(), refreshBalances()])

      toast({
        title: "Rewards Claimed! 🎉",
        description: (
          <div className="space-y-2">
            <p>Successfully claimed your SOL rewards!</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank")}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Transaction
            </Button>
          </div>
        ),
      })
    } catch (error: any) {
      console.error("Claim failed:", error)
      
      // Check if user rejected the transaction
      const errorMessage = error.message?.toLowerCase() || ""
      if (errorMessage.includes("user rejected") || errorMessage.includes("rejected the request") || errorMessage.includes("cancelled")) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction in your wallet. No changes were made.",
        })
      } else {
        toast({
          title: "Claim Failed",
          description: error.message || "Failed to claim rewards. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsClaiming(false)
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    if (!connected || !publicKey || !userStakeInfo) {
      toast({
        title: "No stake to unstake",
        description: "You don't have any active stakes to unstake",
        variant: "destructive",
      })
      return
    }

    if (userStakeInfo.isActive && Date.now() < userStakeInfo.endTime) {
      toast({
        title: "Stake period not complete",
        description: "You can only unstake after the 14-day staking period is complete",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUnstaking(true)

      toast({
        title: "Creating unstake transaction...",
        description: "Please approve the transaction in your wallet",
      })

      // Create and send unstake transaction
      const signature = await stakingService.createUnstakeTransaction(publicKey, signTransaction)

      console.log("✅ Unstake transaction successful:", signature)

      // Refresh data
      await Promise.all([loadUserStakeInfo(), loadStakingStats(), refreshBalances()])

      toast({
        title: "Unstaking Successful! 🎉",
        description: (
          <div className="space-y-2">
            <p>Successfully unstaked your SOL and claimed all rewards!</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank")}
              className="mt-2"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Transaction
            </Button>
          </div>
        ),
      })
    } catch (error: any) {
      console.error("Unstake failed:", error)
      
      // Check if user rejected the transaction
      const errorMessage = error.message?.toLowerCase() || ""
      if (errorMessage.includes("user rejected") || errorMessage.includes("rejected the request") || errorMessage.includes("cancelled")) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction in your wallet. Your stake remains active.",
        })
      } else {
        toast({
          title: "Unstake Failed",
          description: error.message || "Failed to unstake SOL. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsUnstaking(false)
    }
  }

  // Format time remaining
  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const remaining = endTime - now

    if (remaining <= 0) return "Completed"

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Calculate progress percentage
  const calculateProgress = (startTime: number, endTime: number) => {
    const now = Date.now()
    const total = endTime - startTime
    const elapsed = now - startTime
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  // Show wallet connection guide if no wallet connected
  if (!connected) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Connect Your Wallet to Start Staking</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Connect your Solana wallet to start earning 100x multiplier rewards by staking SOL tokens for 14 days.
          </p>
        </div>
        <WalletConnectionGuide isPhantomInstalled={isPhantomInstalled} isSolflareInstalled={isSolflareInstalled} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">SOL Staking Platform</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
            Stake your SOL tokens for 14 days and earn massive 100x multiplier rewards in SOL.
        </p>
      </div>

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-b from-blue-900/40 to-purple-900/30 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Coins className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Staked</p>
                <p className="text-xl font-bold text-white">
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `${stakingStats?.totalStaked.toLocaleString() || 0} SOL`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-green-900/40 to-emerald-900/30 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Gift className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Rewards</p>
                <p className="text-xl font-bold text-white">
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `${stakingStats?.totalRewards.toLocaleString() || 0} WSG`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-purple-900/40 to-pink-900/30 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Active Stakers</p>
                <p className="text-xl font-bold text-white">
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    stakingStats?.activeStakers.toLocaleString() || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-orange-900/40 to-red-900/30 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">APY</p>
                <p className="text-xl font-bold text-white">
                  {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : "10,000%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staking Interface */}
        <Card className="bg-gradient-to-b from-blue-900/40 to-purple-900/30 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-blue-400" />
              Stake SOL Tokens
            </CardTitle>
            <CardDescription className="text-white/70">
              Stake your SOL for 14 days and earn 100x multiplier rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Display */}
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Available Balance:</span>
                <span className="text-white font-semibold">
                  {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "Loading..."}
                </span>
              </div>
            </div>

            {/* Stake Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="stakeAmount" className="text-white">
                Stake Amount (SOL)
              </Label>
              <div className="relative">
                <Input
                  id="stakeAmount"
                  type="number"
                  placeholder="Enter amount to stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  min="0"
                  step="0.1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStakeAmount(((solBalance || 0) * 0.9).toFixed(4))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 h-6 px-2"
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Estimated Rewards */}
            {estimatedRewards > 0 && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 font-medium">Estimated Rewards</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Stake Amount:</span>
                    <span className="text-white">{stakeAmount} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Multiplier:</span>
                    <span className="text-green-400">100x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white">14 days</span>
                  </div>
                  <Separator className="my-2 bg-white/10" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total Rewards:</span>
                    <span className="text-green-400">{estimatedRewards.toFixed(2)} SOL</span>
                  </div>
                  {transactionFee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Transaction Fee:</span>
                      <span className="text-white/40">~{transactionFee.toFixed(6)} SOL</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={
                isStaking ||
                !stakeAmount ||
                isNaN(Number(stakeAmount)) ||
                Number(stakeAmount) <= 0 ||
                Number(stakeAmount) > (solBalance || 0)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isStaking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Stake SOL
                </>
              )}
            </Button>

            {/* Info Notice */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-200/80">
                  <p className="font-medium mb-1">Staking Terms:</p>
                  <ul className="space-y-1">
                    <li>• 14-day lock period</li>
                    <li>• 100x multiplier rewards in SOL</li>
                    <li>• Rewards claimable during staking</li>
                    <li>• Principal + rewards unlocked after 14 days</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stake Info */}
        <Card className="bg-gradient-to-b from-green-900/40 to-emerald-900/30 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Your Staking Position
            </CardTitle>
            <CardDescription className="text-white/70">Monitor your active stakes and claim rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingStakeInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : userStakeInfo ? (
              <>
                {/* Stake Overview */}
                <div className="bg-black/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Staked Amount:</span>
                    <span className="text-white font-semibold">{userStakeInfo.amount.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Current Rewards:</span>
                    <span className="text-green-400 font-semibold">{userStakeInfo.rewards.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Status:</span>
                    <Badge variant={userStakeInfo.isActive ? "default" : "secondary"}>
                      {userStakeInfo.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                {userStakeInfo.isActive && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Staking Progress</span>
                      <span className="text-white">{formatTimeRemaining(userStakeInfo.endTime)} remaining</span>
                    </div>
                    <Progress
                      value={calculateProgress(userStakeInfo.startTime, userStakeInfo.endTime)}
                      className="h-2 bg-black/30"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming || userStakeInfo.rewards <= 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift className="mr-2 h-4 w-4" />
                        Claim Rewards ({userStakeInfo.rewards.toFixed(2)} SOL)
                      </>
                    )}
                  </Button>

                  {!userStakeInfo.isActive || Date.now() >= userStakeInfo.endTime ? (
                    <Button
                      onClick={handleUnstake}
                      disabled={isUnstaking}
                      variant="outline"
                      className="w-full border-orange-500/50 hover:bg-orange-900/30 bg-transparent"
                    >
                      {isUnstaking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unstaking...
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unstake & Claim All
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-orange-300 text-sm">
                          Unstaking available in {formatTimeRemaining(userStakeInfo.endTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stake Details */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-xs text-blue-200/80 space-y-1">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span>{new Date(userStakeInfo.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{new Date(userStakeInfo.endTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplier:</span>
                      <span className="text-green-400">{userStakeInfo.multiplier}x</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <Coins className="h-8 w-8 text-white/40" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">No Active Stakes</h3>
                  <p className="text-white/60 text-sm">
                    Start staking SOL to earn 100x multiplier rewards and see your position here.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Secure Staking</h3>
              <p className="text-sm text-white/60">
                Your SOL is securely locked in our audited smart contract for the staking period.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">100x Multiplier</h3>
              <p className="text-sm text-white/60">
                Earn massive 100x multiplier rewards in SOL for your staked SOL.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">14-Day Period</h3>
              <p className="text-sm text-white/60">
                Stake for exactly 14 days to maximize your rewards and unlock your principal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
