import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Maximize2, X } from 'lucide-react'

import { AiChat } from './AiChat'

/** The floating copilot: a docked panel on every page except /ai itself. */
export function CopilotLauncher() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!open) {
    return (
      <div className="group fixed bottom-6 right-6 z-40 flex flex-col items-center">
        {/* On-hover speech bubble tooltip */}
        <div className="pointer-events-none mb-3 flex items-center gap-1.5 rounded-xl border border-brand-500/40 bg-ink-950/95 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-sm opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 select-none whitespace-nowrap">
          <Bot className="h-3.5 w-3.5 text-poppy-400" />
          <span>Ask Poppys</span>
          {/* Tooltip downward arrow/beak pointing to the center of the button */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b border-r border-brand-500/40 bg-ink-950" />
        </div>

        {/* Circular Floating AI Button with Wave Ripple Animations */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Ask Poppys AI Assistant"
        >
          {/* Wave ripple rings */}
          <span className="ai-wave-ring-1 pointer-events-none absolute inset-0 rounded-full bg-brand-500/35" />
          <span className="ai-wave-ring-2 pointer-events-none absolute inset-0 rounded-full bg-brand-400/25" />
          <span className="ai-wave-ring-3 pointer-events-none absolute inset-0 rounded-full bg-brand-300/15" />

          {/* Button core */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-ink-900 via-brand-800 to-brand-700 text-white shadow-xl ring-2 ring-brand-400/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-brand-400/60">
            <Bot className="h-6 w-6 text-poppy-300 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
          </div>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="animate-fade-rise fixed bottom-5 right-5 z-40 flex h-128 w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-linear-to-r from-ink-900 to-brand-800 px-3.5 py-2.5 text-white">
        <Bot className="h-4 w-4 text-poppy-300" />
        <span className="flex-1 font-display text-[13px] font-semibold">Poppys AI Agent</span>

        <Link
          to="/ai"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Open full copilot"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close copilot"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <AiChat compact />
    </div>
  )
}
