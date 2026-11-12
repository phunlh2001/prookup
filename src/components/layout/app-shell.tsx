import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useUiStore } from '@/stores/ui-store'
import { SidebarContent } from './sidebar'

/** Fixed left sidebar on desktop; slide-in sheet on tablet/mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const open = useUiStore((s) => s.mobileSidebarOpen)
  const setOpen = useUiStore((s) => s.setMobileSidebarOpen)

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[300px] border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent title="Navigation">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu />
        </Button>
        <Logo />
      </header>

      <main className="lg:pl-[300px]">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</div>
      </main>
    </div>
  )
}
