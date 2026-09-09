import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronRight, Home, Menu } from 'lucide-react'

import { flatNavEntries } from '@/lib/navigation'
import { Button, Sheet } from '@/components/ui'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CopilotLauncher } from '@/components/ai/CopilotLauncher'

function Breadcrumbs() {
  const location = useLocation()
  if (location.pathname === '/') return null

  // Exact match wins. Sections that have both an overview leaf and children
  // beneath it would otherwise resolve every child to the overview, because the
  // overview path is a prefix of all of them.
  const entry =
    flatNavEntries.find((e) => e.path === location.pathname) ??
    flatNavEntries.find((e) => location.pathname.startsWith(`${e.path}/`))

  return (
    <div className="flex items-center gap-1.5 px-4 pt-4 text-xs text-muted-foreground lg:px-6">
      <Link
        to="/"
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        Dashboard
      </Link>
      {entry && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span>{entry.sectionLabel}</span>
          {entry.sectionLabel !== entry.label && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{entry.label}</span>
            </>
          )}
        </>
      )}
    </div>
  )
}

export function Shell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  /**
   * The copilot runs full-bleed: no header bar, no breadcrumbs, no page chrome.
   * The conversation is the page. Every other route keeps the standard shell.
   */
  const isCopilot = location.pathname === '/ai'

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <Sheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Sidebar onNavigate={() => setMobileNavOpen(false)} />
      </Sheet>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {isCopilot ? (
          // Small screens still need a way into the navigation.
          <div className="flex h-12 shrink-0 items-center border-b border-border bg-card px-2 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Header onMenuClick={() => setMobileNavOpen(true)} />
        )}

        <main className="scrollbar-thin relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div key={location.pathname} className="animate-fade-rise flex min-h-0 flex-1 flex-col">
            {!isCopilot && <Breadcrumbs />}
            <Outlet />
          </div>
        </main>
      </div>

      {!isCopilot && <CopilotLauncher />}
    </div>
  )
}
