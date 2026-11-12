import { useEffect } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { Toaster } from 'sonner'
import { searchingAnimation } from '@/assets/lottie/animations'
import { AppShell } from '@/components/layout/app-shell'
import { Lottie } from '@/components/lottie'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/misc'
import { DashboardHeader } from '@/features/dashboard/dashboard-header'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ProductDetail } from '@/features/products/product-detail'
import { useHashRoute } from '@/hooks/use-hash-route'
import { useResearchStore } from '@/stores/research-store'
import { useUiStore } from '@/stores/ui-store'

/** Shown while the server runs its very first research pass. */
function FirstSync() {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <Lottie animationData={searchingAnimation} className="size-40" label="Researching the US market" />
      <h2 className="mt-2 text-base font-semibold">Researching the US market…</h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
        Collecting search trends, competition signals and supplier prices. This first pass can take a minute with live
        providers.
      </p>
    </Card>
  )
}

function LoadError({ message }: { message: string }) {
  const load = useResearchStore((s) => s.load)
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertCircle className="size-5" />
      </span>
      <h2 className="mt-3 text-base font-semibold">Couldn&apos;t load research data</h2>
      <p className="mt-1 max-w-md text-[13px] text-muted-foreground">{message}</p>
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => {
          useResearchStore.setState({ loading: true, error: null })
          void load()
        }}
      >
        <RotateCw /> Try again
      </Button>
    </Card>
  )
}

export default function App() {
  const load = useResearchStore((s) => s.load)
  const pollStatus = useResearchStore((s) => s.pollStatus)
  const loading = useResearchStore((s) => s.loading)
  const error = useResearchStore((s) => s.error)
  const snapshot = useResearchStore((s) => s.snapshot)
  const status = useResearchStore((s) => s.status)
  const selected = useUiStore((s) => s.selectedProductId)
  useHashRoute()

  useEffect(() => {
    void load()
    // Pick up scheduled background syncs without a page reload.
    const t = setInterval(() => void pollStatus(), 5 * 60_000)
    return () => clearInterval(t)
  }, [load, pollStatus])

  const firstSync = loading && !snapshot && status?.state === 'syncing'

  let content
  if (error && !snapshot) {
    content = (
      <div className="space-y-6">
        <DashboardHeader />
        <LoadError message={error} />
      </div>
    )
  } else if (firstSync) {
    content = (
      <div className="space-y-6">
        <DashboardHeader />
        <FirstSync />
      </div>
    )
  } else if (selected && snapshot) {
    content = <ProductDetail productId={selected} />
  } else {
    content = <DashboardPage />
  }

  return (
    <TooltipProvider delayDuration={250}>
      <AppShell>{content}</AppShell>
      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  )
}
