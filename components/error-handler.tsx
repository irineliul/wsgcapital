"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface ErrorHandlerProps {
  error: string
  onRetry?: () => void
  showExplorer?: boolean
  transactionId?: string
}

export function ErrorHandler({ error, onRetry, showExplorer, transactionId }: ErrorHandlerProps) {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes("Invalid stake amount")) {
      return { type: "validation", color: "yellow" }
    }
    if (errorMessage.includes("Already claimed")) {
      return { type: "already_claimed", color: "blue" }
    }
    if (errorMessage.includes("Not yet unlocked")) {
      return { type: "locked", color: "orange" }
    }
    if (errorMessage.includes("insufficient funds")) {
      return { type: "balance", color: "red" }
    }
    if (errorMessage.includes("rejected")) {
      return { type: "rejected", color: "gray" }
    }
    return { type: "unknown", color: "red" }
  }

  const errorInfo = getErrorType(error)

  const getColorClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return "border-yellow-500/30 bg-yellow-900/20 text-yellow-300"
      case "blue":
        return "border-blue-500/30 bg-blue-900/20 text-blue-300"
      case "orange":
        return "border-orange-500/30 bg-orange-900/20 text-orange-300"
      case "red":
        return "border-red-500/30 bg-red-900/20 text-red-300"
      case "gray":
        return "border-gray-500/30 bg-gray-900/20 text-gray-300"
      default:
        return "border-red-500/30 bg-red-900/20 text-red-300"
    }
  }

  const getSuggestion = (type: string) => {
    switch (type) {
      case "validation":
        return "Please check the minimum stake amount (1 SOL) and try again."
      case "already_claimed":
        return "Your rewards have already been claimed. Check your wallet balance."
      case "locked":
        return "Please wait until the staking period ends before claiming rewards."
      case "balance":
        return "Please ensure you have enough SOL for staking and transaction fees."
      case "rejected":
        return "Please approve the transaction in your wallet to continue."
      default:
        return "Please try again or contact support if the issue persists."
    }
  }

  return (
    <Card className={`${getColorClasses(errorInfo.color)} backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Transaction Error
        </CardTitle>
        <CardDescription className="text-white/70">{getSuggestion(errorInfo.type)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-sm font-medium mb-1">Error Details:</div>
            <div className="text-xs text-white/80">{error}</div>
          </div>

          <div className="flex gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex-1 border-white/20 hover:bg-white/10 bg-transparent"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {showExplorer && transactionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`, "_blank")}
                className="flex-1 border-white/20 hover:bg-white/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Transaction
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
