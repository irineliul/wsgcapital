"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { getExplorerUrl } from "@/lib/solana-connection"

interface TransactionStatusProps {
  transactionId: string | null
  status: "pending" | "confirmed" | "failed" | null
  onClose?: () => void
}

export function TransactionStatus({ transactionId, status, onClose }: TransactionStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (status === "pending") {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [status])

  if (!transactionId || !status) {
    return null
  }

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
      case "confirmed":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "failed":
        return <AlertCircle className="h-6 w-6 text-red-400" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return `Transaction pending... (${timeElapsed}s)`
      case "confirmed":
        return "Transaction confirmed!"
      case "failed":
        return "Transaction failed"
      default:
        return "Unknown status"
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "border-yellow-500/30 bg-yellow-900/20"
      case "confirmed":
        return "border-green-500/30 bg-green-900/20"
      case "failed":
        return "border-red-500/30 bg-red-900/20"
      default:
        return "border-gray-500/30 bg-gray-900/20"
    }
  }

  return (
    <Card className={`${getStatusColor()} backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Transaction Status
        </CardTitle>
        <CardDescription>{getStatusText()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-sm text-white/70 mb-1">Transaction ID</div>
            <div className="text-xs font-mono text-white break-all">{transactionId}</div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getExplorerUrl(transactionId), "_blank")}
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
