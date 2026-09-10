import { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Leaf } from 'lucide-react'

import { AI_SECTION_LABEL, navTree } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/** A knit-loop mark drawn inline, so the shell carries no image dependency. */
function BrandMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="url(#poppy-grad)" />
      <path
        d="M11 26c0-5 3-9 9-9s9 4 9 9M11 22c0-5 3-9 9-9s9 4 9 9"
        fill="none"
        stroke="white"
        strokeOpacity="0.92"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="20" cy="13.5" r="2.6" fill="#ffd9d0" />
      <defs>
        <linearGradient id="poppy-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#d84a30" />
          <stop offset="100%" stopColor="#3f52ab" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function isSectionActive(childPaths, pathname) {
  return childPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function Sidebar({ onNavigate }) {
  const location = useLocation()

  const activeSectionLabel = useMemo(() => {
    for (const section of navTree) {
      if (section.children && isSectionActive(section.children.map((c) => c.path), location.pathname)) {
        return section.label
      }
    }
    return null
  }, [location.pathname])

  const [openSections, setOpenSections] = useState(
    () => new Set(activeSectionLabel ? [activeSectionLabel] : []),
  )

  function toggleSection(label) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <aside className="relative z-20 flex h-full w-64 shrink-0 flex-col bg-linear-to-b from-ink-950 via-ink-900 to-ink-950 text-ink-100">
      {/* Brand */}
      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-5">
        <div className="knit pointer-events-none absolute inset-0 opacity-60" />
        <BrandMark className="relative h-9 w-9 shrink-0" />
        <div className="relative min-w-0 leading-tight">
          <div className="font-display text-[13px] font-bold tracking-wide text-white">POPPYS KNITWEAR</div>
          <div className="truncate text-[10px] font-medium text-poppy-300">Tirupur - since 1973</div>
        </div>
      </div>

      <nav className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navTree.map((section) => {
          const Icon = section.icon

          if (!section.children) {
            return (
              <NavLink
                key={section.label}
                to={section.path}
                end={section.path === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-200 transition-colors',
                    'hover:bg-white/6 hover:text-white',
                    isActive && 'bg-white/10 font-semibold text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-poppy-400" />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-poppy-300' : 'text-ink-300 group-hover:text-ink-100',
                      )}
                    />
                    <span className="truncate">{section.label}</span>
                  </>
                )}
              </NavLink>
            )
          }

          const isOpen = openSections.has(section.label)
          const sectionIsActive = isSectionActive(section.children.map((c) => c.path), location.pathname)
          // The AI module is the flagship surface, so it is lifted out of the
          // flat nav treatment with its own indigo panel and badge.
          const isAi = section.label === AI_SECTION_LABEL

          return (
            <div
              key={section.label}
              className={cn(
                'flex shrink-0 flex-col',
                isAi &&
                  'ai-glow ai-sheen relative my-1.5 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-brand-500/25 via-brand-600/12 to-transparent p-1',
              )}
            >
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                aria-expanded={isOpen}
                className={cn(
                  'group flex shrink-0 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-ink-200 transition-colors',
                  'hover:bg-white/6 hover:text-white',
                  sectionIsActive && 'text-white',
                  isAi && 'font-semibold text-white',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    sectionIsActive ? 'text-poppy-300' : 'text-ink-300 group-hover:text-ink-100',
                    isAi && !sectionIsActive && 'text-brand-300',
                  )}
                />
                <span className="flex-1 truncate">{section.label}</span>
                {isAi && (
                  <span className="shrink-0 rounded-full bg-poppy-400/90 px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wider text-ink-950">
                    AI
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform duration-300',
                    isOpen && 'rotate-180 text-ink-200',
                  )}
                />
              </button>

              {isOpen && (
                <div className="mb-1 ml-[1.65rem] mt-0.5 flex shrink-0 flex-col gap-0.5 border-l border-white/10 pl-3">
                  {section.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'relative shrink-0 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-ink-300 transition-colors',
                          'hover:bg-white/6 hover:text-white',
                          isActive && 'bg-brand-500/25 font-semibold text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-poppy-400" />
                          )}
                          {child.label}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/8 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/8 text-poppy-300">
            <Leaf className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold text-white">Knit with conscience</div>
            <div className="text-[11px] text-ink-300">Shipped with confidence</div>
          </div>
        </div>
        <div className="mt-3 text-[10.5px] text-ink-400">
          (c) {new Date().getFullYear()} Poppys Knitwear (P) Ltd.
        </div>
      </div>
    </aside>
  )
}
