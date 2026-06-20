import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Coins, BarChart3, TrendingUp } from "lucide-react"

export function Stats() {
  return (
    <section id="stats" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">WSG Staking Statistics</h2>
          <p className="text-white/80 text-lg">
            Join a growing community of WSG stakers and be part of the Solana ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="h-8 w-8 text-purple-400" />}
            value="12,500+"
            label="Active Stakers"
            trend="+15% this month"
          />
          <StatCard
            icon={<Coins className="h-8 w-8 text-blue-400" />}
            value="4.2M"
            label="Total WSG Staked"
            trend="42% of circulating supply"
          />
          <StatCard
            icon={<BarChart3 className="h-8 w-8 text-green-400" />}
            value="$1.2M"
            label="Rewards Distributed"
            trend="Since launch"
          />
          <StatCard
            icon={<TrendingUp className="h-8 w-8 text-yellow-400" />}
            value="11.8%"
            label="Average APY"
            trend="Last 30 days"
          />
        </div>
      </div>
    </section>
  )
}

function StatCard({
  icon,
  value,
  label,
  trend,
}: { icon: React.ReactNode; value: string; label: string; trend: string }) {
  return (
    <Card className="bg-gradient-to-b from-purple-900/40 to-black/40 border-purple-500/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>{icon}</div>
          <div className="text-xs px-2 py-1 bg-white/10 rounded-full">{trend}</div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-white/70">{label}</div>
      </CardContent>
    </Card>
  )
}
