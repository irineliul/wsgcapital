"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingUp, Lock, Calendar } from "lucide-react"
import { getTimeUntilUnlock } from "@/services/solana-staking-service"

interface StakingStatsCardProps {
  stats: {
    amount: number
    rewards: number
    startTime: number
    endTime: number
    isUnlocked: boolean
    canClaim: boolean
    pdaAddress: string
  }
}

export function StakingStatsCard({ stats }: StakingStatsCardProps) {
  const now = Date.now()
  const totalLockTime = stats.endTime - stats.startTime
  const elapsedTime = now - stats.startTime
  const progressPercentage = Math.min((elapsedTime / totalLockTime) * 100, 100)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-gradient-to-b from-blue-900/40 to-purple-900/30 border-blue-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Staking Position Details
        </CardTitle>
        <CardDescription>Your current SOL staking position and progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Staking Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.amount.toFixed(4)}</div>
            <div className="text-sm text-white/70">SOL Staked</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.rewards.toLocaleString()}</div>
            <div className="text-sm text-white/70">SOL Rewards</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Lock Progress</span>
            <span className="text-white">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-white/60">
            <span>Started</span>
            <span>{stats.isUnlocked ? "Unlocked" : getTimeUntilUnlock(stats.endTime)}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-blue-400" />
            <div>
              <div className="text-sm font-medium">Staking Started</div>
              <div className="text-xs text-white/70">{formatDate(stats.startTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-sm font-medium">Unlock Date</div>
              <div className="text-xs text-white/70">{formatDate(stats.endTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-yellow-400" />
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-white/70">
                {stats.isUnlocked ? "Ready to claim" : `Locked for ${getTimeUntilUnlock(stats.endTime)}`}
              </div>
            </div>
          </div>
        </div>

        {/* PDA Address */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-sm text-white/70 mb-1">Program Derived Address (PDA)</div>
          <div className="text-xs font-mono text-white/90 break-all">{stats.pdaAddress}</div>
        </div>
      </CardContent>
    </Card>
  )
}
