"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"
import { debugProgramDeployment, debugPDAGeneration, debugWalletConnection } from "@/services/program-debug-service"
import { stakeWithAnchorClient } from "@/services/anchor-client-service"
import { AlertTriangle, Bug, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function DebugPanel() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { toast } = useToast()
  const [debugResults, setDebugResults] = useState<string[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const addDebugResult = (message: string) => {
    setDebugResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runFullDiagnostic = async () => {
    setIsDebugging(true)
    setDebugResults([])

    addDebugResult("🔍 Starting full diagnostic...")

    try {
      // Check program deployment
      addDebugResult("Checking program deployment...")
      await debugProgramDeployment()

      // Check wallet connection
      addDebugResult("Checking wallet connection...")
      await debugWalletConnection()

      if (publicKey) {
        // Check PDA generation
        addDebugResult("Checking PDA generation...")
        await debugPDAGeneration(publicKey)
      }

      addDebugResult("✅ Diagnostic complete - check console for details")
    } catch (error: any) {
      addDebugResult(`❌ Diagnostic failed: ${error.message}`)
    } finally {
      setIsDebugging(false)
    }
  }

  const testAnchorClient = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    addDebugResult("🧪 Testing Anchor client approach...")

    try {
      const result = await stakeWithAnchorClient(publicKey, 1, signTransaction)

      if (result.success) {
        addDebugResult(`✅ Anchor client SUCCESS: ${result.transactionId}`)
        toast({
          title: "Success! 🎉",
          description: "Anchor client method worked!",
        })
      } else {
        addDebugResult(`❌ Anchor client failed: ${result.error}`)
        toast({
          title: "Anchor client failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addDebugResult(`❌ Anchor client error: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="bg-black/50 border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <Bug className="h-5 w-5" />
          Debug Panel - Signature Issue Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm">Wallet Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">Signature Issue</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runFullDiagnostic}
            disabled={isDebugging}
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent"
          >
            {isDebugging ? "Running..." : "Run Diagnostic"}
          </Button>

          <Button
            onClick={testAnchorClient}
            disabled={isTesting || !connected}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-900/20 bg-transparent"
          >
            {isTesting ? "Testing..." : "Test Anchor Client"}
          </Button>
        </div>

        {/* Debug Results */}
        {debugResults.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="text-xs font-mono space-y-1">
              {debugResults.map((result, index) => (
                <div key={index} className="text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Possible Solutions */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="font-medium text-yellow-300 mb-2">Possible Solutions:</h4>
          <ul className="text-sm text-yellow-200/80 space-y-1">
            <li>• Disconnect and reconnect your wallet</li>
            <li>• Try switching to a different wallet (Phantom ↔ Solflare)</li>
            <li>• Clear browser cache and refresh</li>
            <li>• Check if program is properly deployed on Devnet</li>
            <li>• Verify wallet is on Devnet network</li>
          </ul>
        </div>

        {/* Technical Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs space-y-1">
            <div>
              <strong>Program ID:</strong> 21Lin11EzStXChNQVqg3U9NTfLMse1YDeBuXz4q85qBw
            </div>
            <div>
              <strong>Network:</strong> Devnet
            </div>
            <div>
              <strong>Error:</strong> AccountNotSigner (Anchor Error 3010)
            </div>
            {publicKey && (
              <div>
                <strong>Your Wallet:</strong> {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
