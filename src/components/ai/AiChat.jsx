import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Send, Sparkles } from 'lucide-react'

import { askCopilot } from '@/services'
import { suggestedQuestions } from '@/mock'
import { cn } from '@/lib/utils'
import { Button, Input } from '@/components/ui'

const GREETING = {
  role: 'assistant',
  answer: {
    headline: 'Ask me about the order book, the floor, quality or the stores.',
    body: 'I read the same data the modules do, so every answer links back to the page that owns it. Nothing here leaves the building.',
  },
}

/** A thinking indicator that reads as work, not as a spinner. */
function Thinking() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  )
}

function AnswerCard({ answer }) {
  return (
    <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-border bg-card p-3.5 shadow-xs">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-poppy-500" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-foreground">{answer.headline}</p>
          {answer.body && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{answer.body}</p>
          )}

          {answer.table && (
            <div className="scrollbar-thin mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/60">
                    {answer.table.columns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {answer.table.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/70 last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-2.5 py-1.5 tabular-nums text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {answer.linkTo && (
            <Link
              to={answer.linkTo}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {answer.linkLabel ?? 'Open module'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function AiChat({ compact = false }) {
  const [messages, setMessages] = useState([GREETING])
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('scrollbar-thin flex-1 space-y-3 overflow-y-auto', compact ? 'p-3' : 'p-4 lg:p-6')}>
        {messages.map((message, i) =>
          message.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-lg rounded-2xl rounded-tr-sm bg-brand-500 px-3.5 py-2 text-[13px] font-medium text-white">
                {message.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <AnswerCard answer={message.answer} />
            </div>
          ),
        )}
        {busy && (
          <div className="flex justify-start">
            <Thinking />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className={cn('flex flex-wrap gap-1.5', compact ? 'px-3 pb-2' : 'px-4 pb-2 lg:px-6')}>
          {suggestedQuestions.slice(0, compact ? 3 : 6).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className={cn(
          'flex shrink-0 items-center gap-2 border-t border-border bg-card/70 backdrop-blur',
          compact ? 'p-3' : 'p-4 lg:px-6',
        )}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about orders, lines, quality, stock or energy..."
          className="h-9 rounded-full"
        />
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full" disabled={busy || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  )
}
