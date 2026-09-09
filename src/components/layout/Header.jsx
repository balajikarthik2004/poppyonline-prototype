import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'

import { useAppStore, userRoleTitles } from '@/store/appStore'
import { useAsync } from '@/hooks/useAsync'
import { getAlerts } from '@/services'
import { flatNavEntries } from '@/lib/navigation'
import { currentUser, unitOptions } from '@/mock'
import { formatRelativeShort } from '@/lib/format'
import { dateRangeLabels, dateRangePresets } from '@/lib/dateRange'
import { cn } from '@/lib/utils'
import { Avatar, Badge, Button, Input, Popover, Select } from '@/components/ui'

const severityDot = {
  critical: 'bg-danger-500',
  high: 'bg-warning-500',
  medium: 'bg-info-500',
  low: 'bg-info-500',
  info: 'bg-muted-foreground/50',
}

export function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const { unitId, setUnitId, dateRangePreset, setDateRangePreset, userRole, setUserRole } = useAppStore()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const { data: alerts } = useAsync(getAlerts, [])
  const unackCount = alerts?.filter((a) => !a.acknowledged).length ?? 0

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return flatNavEntries.filter((e) => e.label.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 140)}
          placeholder="Search orders, styles, buyers, machines..."
          className="rounded-full bg-muted/70 pl-9 shadow-none focus-visible:bg-card"
        />
        {searchOpen && matches.length > 0 && (
          <div className="animate-fade-rise absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
            {matches.map((m) => (
              <button
                key={m.path}
                type="button"
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                onMouseDown={() => {
                  navigate(m.path)
                  setQuery('')
                  setSearchOpen(false)
                }}
              >
                <span className="font-medium text-foreground">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.sectionLabel}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Select
          className="hidden w-44 sm:block"
          value={unitId}
          onValueChange={setUnitId}
          options={unitOptions.map((u) => ({ value: u.id, label: u.name }))}
        />

        <Select
          className="hidden w-36 md:block"
          value={dateRangePreset}
          onValueChange={setDateRangePreset}
          options={dateRangePresets.map((p) => ({ value: p, label: dateRangeLabels[p] }))}
        />

        <Popover
          className="w-96 max-w-[calc(100vw-1.5rem)]"
          trigger={
            <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
              {unackCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white ring-2 ring-card">
                  {unackCount}
                </span>
              )}
            </Button>
          }
        >
          {({ close }) => (
            <>
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                <span className="font-display text-sm font-semibold">Notifications</span>
                <Badge variant="danger">{unackCount} new</Badge>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {(alerts ?? []).slice(0, 7).map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => {
                      navigate(alert.linkTo)
                      close()
                    }}
                    className="flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-accent"
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', severityDot[alert.severity])} />
                      <span className="flex-1 truncate text-xs font-medium text-foreground">{alert.title}</span>
                    </div>
                    <span className="pl-3.5 text-[11px] text-muted-foreground">
                      {alert.category} - {formatRelativeShort(alert.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/ai/insights')
                    close()
                  }}
                >
                  View all insights
                </Button>
              </div>
            </>
          )}
        </Popover>

        <Popover
          className="w-56"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-accent"
            >
              <Avatar initials={currentUser.initials} />
              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold text-foreground">{currentUser.name}</div>
                <div className="text-[11px] text-muted-foreground">{userRoleTitles[userRole]}</div>
              </div>
            </button>
          }
        >
          {({ close }) => (
            <div className="p-1">
              <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed in as
              </div>
              <div className="px-2.5 pb-2 text-xs text-muted-foreground">{currentUser.email}</div>
              <div className="my-1 h-px bg-border" />
              <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                View as
              </div>
              {Object.entries(userRoleTitles).map(([role, title]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setUserRole(role)
                    close()
                  }}
                  className={cn(
                    'w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-accent',
                    userRole === role && 'bg-accent font-semibold text-accent-foreground',
                  )}
                >
                  {title}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  navigate('/admin')
                  close()
                }}
                className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-accent"
              >
                Administration
              </button>
            </div>
          )}
        </Popover>
      </div>
    </header>
  )
}
