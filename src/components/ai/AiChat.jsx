import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Gauge,
  Layers,
  PenSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'
import { PoppysAiIcon } from '@/components/icons'

import { askCopilot } from '@/services'
import { suggestedQuestions } from '@/mock'
import { cn } from '@/lib/utils'
import { Badge, Button } from '@/components/ui'

/** A thinking indicator that reads as work, not as a spinner. */
function Thinking() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/80 bg-card px-4 py-3 shadow-xs">
      <span className="text-xs font-medium text-muted-foreground mr-1">Analyzing plant data...</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  )
}

/** Comprehensive, structured diagnostic card matching Image 2 */
function AnswerCard({ answer }) {
  return (
    <div className="w-full max-w-4xl space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      {/* 1. Header with Badge & Overview */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e3b30] text-emerald-300 shadow-2xs">
          <PoppysAiIcon className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              {answer.headline}
            </h3>
            {answer.confidence && (
              <span className="self-start sm:self-auto rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 shadow-2xs">
                {answer.confidence}
              </span>
            )}
          </div>
          {answer.body && (
            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-muted-foreground">
              {answer.body}
            </p>
          )}
        </div>
      </div>

      {/* 2. Fleet Position / KPI Cards Grid */}
      {answer.fleetPosition && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Gauge className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{answer.fleetPosition.title || 'Fleet position'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {answer.fleetPosition.kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-[#fafafa] dark:bg-secondary/25 p-2.5 shadow-2xs"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-base sm:text-lg font-bold',
                    kpi.tone === 'danger'
                      ? 'text-danger-600 dark:text-danger-400'
                      : kpi.tone === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : kpi.tone === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground',
                  )}
                >
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Open Breakdowns / Data Table */}
      {answer.table && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{answer.table.title || 'Open breakdowns'}</span>
          </div>

          <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border/80 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {answer.table.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {answer.table.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          'whitespace-nowrap px-3 py-2 text-xs text-foreground',
                          j === 0 && answer.table.highlightFirstCol && 'font-mono font-bold text-red-600 dark:text-red-400',
                          j === row.length - 1 && cell === 'Open' && 'text-amber-600 font-semibold',
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Probable Causes, Ranked */}
      {answer.probableCauses && (
        <div className="space-y-2.5 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{answer.probableCauses.title || 'Probable causes, ranked'}</span>
            </div>
            {answer.probableCauses.subtitle && (
              <span className="text-[11px] text-muted-foreground">
                {answer.probableCauses.subtitle}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {answer.probableCauses.items.map((cause) => (
              <div
                key={cause.rank}
                className="rounded-xl border border-border/80 bg-[#fafafa] dark:bg-secondary/20 p-3 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-xs font-bold text-red-700 dark:text-red-300">
                      {cause.rank}
                    </span>
                    <span className="font-semibold text-xs sm:text-[13px] text-foreground">
                      {cause.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {cause.likelihood}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      cause.tone === 'danger' ? 'bg-red-500' : 'bg-amber-500',
                    )}
                    style={{ width: `${cause.likelihood}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-0.5">
                  <span>{cause.subtext}</span>
                  {cause.tag && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
                      ⊙ {cause.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Deep Link Action */}
      {answer.linkTo && (
        <div className="border-t border-border/60 pt-2 flex justify-end">
          <Link
            to={answer.linkTo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {answer.linkLabel ?? 'Open module'}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export function AiChat({ compact = false }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  async function send(question) {
    const text = question.trim()
    if (!text || busy) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setBusy(true)
    const answer = await askCopilot(text)
    setMessages((prev) => [...prev, { role: 'assistant', answer }])
    setBusy(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f8f9f6] dark:bg-background">
      {/* ======================= Chat Scroll Area (Warm/Soft Background) ======================= */}
      <div className={cn('scrollbar-thin flex-1 space-y-4 overflow-y-auto', compact ? 'p-3' : 'p-4 lg:p-6')}>
        {/* Centered Hero Greeting when conversation is empty */}
        {messages.length === 0 && (
          <div className="my-auto flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f3d32] text-emerald-300 shadow-md mb-4">
              <PoppysAiIcon className="h-7 w-7 text-emerald-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              How can I help at the mill today?
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
              Describe a problem, or name a machine, an order or a lot. I will give you the probable cause, how it was resolved before, who resolved it, and a plan with a realistic time to fix.
            </p>
          </div>
        )}

        {/* Message stream */}
        {messages.map((message, i) =>
          message.role === 'user' ? (
            <div key={i} className="flex items-center justify-end gap-2 max-w-4xl mx-auto w-full">
              <div className="rounded-full bg-[#0c1f1d] px-5 py-2.5 text-xs sm:text-[13px] font-medium text-white shadow-2xs">
                {message.text}
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <User className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-center w-full">
              <AnswerCard answer={message.answer} />
            </div>
          ),
        )}

        {busy && (
          <div className="flex justify-center w-full">
            <Thinking />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ======================= Bottom Input Area (Distinct Crisp White Background) ======================= */}
      <div className={cn('shrink-0 bg-white dark:bg-card border-t border-border/80 shadow-xs pt-3', compact ? 'px-3 pb-3' : 'px-4 pb-4 lg:px-8')}>
        {/* Suggested Questions in 2 Centered Rows when no messages or only starting */}
        {messages.length <= 1 && (
          <div className="mx-auto max-w-4xl mb-3 space-y-2">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => send('Which machine is down and how long will it take to fix?')}
                className="rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-xs font-normal text-muted-foreground shadow-2xs transition-all hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground cursor-pointer"
              >
                Which machine is down and how long will it take to fix?
              </button>
              <button
                type="button"
                onClick={() => send('Which sales orders are at risk and what do we do about them?')}
                className="rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-xs font-normal text-muted-foreground shadow-2xs transition-all hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground cursor-pointer"
              >
                Which sales orders are at risk and what do we do about them?
              </button>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => send('Why did production fall short this week and how do we recover it?')}
                className="rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-xs font-normal text-muted-foreground shadow-2xs transition-all hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground cursor-pointer"
              >
                Why did production fall short this week and how do we recover it?
              </button>
              <button
                type="button"
                onClick={() => send('What is driving the quality deviations in the lab results?')}
                className="rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-xs font-normal text-muted-foreground shadow-2xs transition-all hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground cursor-pointer"
              >
                What is driving the quality deviations in the lab results?
              </button>
            </div>
          </div>
        )}

        {/* Pill Input Form with Pencil Icon on Left & Upward Arrow Button on Right */}
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="group relative flex items-center rounded-full border border-border/90 bg-background shadow-xs transition-all focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-brand-500/20 hover:border-foreground/30 px-4 sm:px-5 py-2 sm:py-2.5"
          >
            <PenSquare className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a problem, name a machine (RF-014) or an order (SO-291)..."
              className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-0 pr-2"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className={cn(
                'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer',
                input.trim()
                  ? 'bg-foreground text-background shadow-xs hover:opacity-90'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>

          {/* Grounding Disclaimer */}
          <p className="mt-2 text-center text-[11px] text-muted-foreground/75 font-normal tracking-tight">
            Grounded in live plant records and the resolution knowledge base. Verify before acting on a customer commitment.
          </p>
        </div>
      </div>
    </div>
  )
}
