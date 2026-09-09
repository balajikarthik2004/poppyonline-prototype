import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Maximize2, Sparkles, X } from 'lucide-react'

import { AiChat } from './AiChat'

/** The floating copilot: a docked panel on every page except /ai itself. */
export function CopilotLauncher() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ai-glow fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-linear-to-br from-ink-900 to-brand-700 px-4 py-3 text-[13px] font-semibold text-white shadow-xl transition-transform hover:scale-105"
      >
        <Sparkles className="h-4 w-4 text-poppy-300" />
        Ask Poppys
      </button>
    )
  }

  return (
    <div className="animate-fade-rise fixed bottom-5 right-5 z-40 flex h-[32rem] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-linear-to-r from-ink-900 to-brand-800 px-3.5 py-2.5 text-white">
        <Sparkles className="h-4 w-4 text-poppy-300" />
        <span className="flex-1 font-display text-[13px] font-semibold">Poppys Copilot</span>
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
