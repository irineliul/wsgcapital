import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Target, BarChart3, Coins } from "lucide-react"

export function About() {
  return (
    <section id="about" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 right-20 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About SOL Staking Platform</h2>
          <p className="text-white/80 text-lg">
            Our SOL staking platform is powered by a team of experienced binary options traders with proven expertise in
            1-minute trading strategies. Lock your SOL tokens for 14 days and achieve extraordinary 100x multiplier
            returns through professional trading on real market conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="h-10 w-10 text-blue-400" />}
            title="Expert Trading Team"
            description="Professional binary options traders with proven track record of 80%+ profit rates on 1-minute trades in real market conditions."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-purple-400" />}
            title="Martingale Strategy"
            description="Advanced 5-level Martingale risk management system ensures consistent profits while protecting your SOL investment."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-green-400" />}
            title="Real Market Trading"
            description="All trades executed on live markets with real-time data, ensuring authentic and sustainable profit generation."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-red-400" />}
            title="Risk Management"
            description="Sophisticated risk control protocols and professional money management strategies protect your staked SOL tokens."
          />
          <FeatureCard
            icon={<Coins className="h-10 w-10 text-orange-400" />}
            title="14-Day Lock Period"
            description="Lock your SOL tokens for 14 days to maximize your returns."
          />
          <FeatureCard
            icon={<Coins className="h-10 w-10 text-orange-400" />}
            title="100x Multiplier Returns"
            description="Achieve extraordinary 100x multiplier returns through professional trading on real market conditions."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-gradient-to-b from-blue-900/40 to-black/40 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300">
      <CardContent className="p-6">
        {icon}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-white/70">{description}</p>
      </CardContent>
    </Card>
  )
}
