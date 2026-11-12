import { Settings2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NicheExplorer } from '@/features/niches/niche-explorer'
import { PricingAssumptionsPanel } from '@/features/pricing/pricing-assumptions'
import { ProductExplorer } from '@/features/products/product-explorer'
import { DashboardHeader } from './dashboard-header'
import { MarketOverview } from './market-overview'

export function DashboardPage() {
  return (
    <div className="space-y-7">
      <DashboardHeader />
      <MarketOverview />
      <NicheExplorer />
      <ProductExplorer />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="size-4 text-muted-foreground" />
            Pricing assumptions
          </CardTitle>
          <CardDescription>
            Modeled costs used for every recommended price, profit and opportunity score.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-2xl">
          <PricingAssumptionsPanel />
        </CardContent>
      </Card>
    </div>
  )
}
