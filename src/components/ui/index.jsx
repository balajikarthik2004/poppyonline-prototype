import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------- Card ---- */

/**
 * `min-w-0` matters: a card is almost always a grid or flex child, and those
 * default to `min-width: auto`, so a wide table or chart inside would push the
 * whole grid past the viewport and raise a page-level horizontal scrollbar.
 * Wide content carries its own scroller instead.
 *
 * No `overflow-hidden` here on purpose - it would clip chart tooltips and
 * popovers that legitimately extend past the card edge.
 */
export function Card({ className, interactive, ...props }) {
  return (
    <div
      className={cn('paper-card min-w-0', interactive && 'hover-lift cursor-pointer', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-0.5 px-4 pb-2 pt-3.5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-semibold text-foreground', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-xs text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-4 pb-4', className)} {...props} />
}

/* -------------------------------------------------------------- Button ---- */

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-brand-600 shadow-xs',
  outline: 'border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground',
  ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
  subtle: 'bg-secondary text-secondary-foreground hover:bg-accent',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-xs',
}

const buttonSizes = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8.5 px-3.5 text-[13px]',
  lg: 'h-10 px-5 text-sm',
  icon: 'h-8.5 w-8.5',
}

export function Button({ className, variant = 'default', size = 'md', ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-45',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Badge ---- */

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-muted-foreground',
  success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-100',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-100',
  danger: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100',
  info: 'bg-info-50 text-info-700 ring-1 ring-inset ring-info-100',
  poppy: 'bg-poppy-50 text-poppy-700 ring-1 ring-inset ring-poppy-100',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
}

export function Badge({ className, variant = 'secondary', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Input ---- */

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-8.5 w-full rounded-lg border border-input bg-card px-3 text-[13px] text-foreground',
        'placeholder:text-muted-foreground/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------ Skeleton ---- */

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-secondary', className)} />
}

/* ------------------------------------------------------------ Progress ---- */

export function Progress({ value = 0, className, indicatorClassName }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-500', indicatorClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* -------------------------------------------------------------- Avatar ---- */

export function Avatar({ initials, className }) {
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 ring-1 ring-border',
        className,
      )}
    >
      {initials}
    </span>
  )
}

/* ----------------------------------------------------------- Separator ---- */

export function Separator({ className }) {
  return <div className={cn('h-px w-full bg-border', className)} />
}

/* ------------------------------------------------------- useClickOutside -- */

function useDismiss(ref, onDismiss, active) {
  useEffect(() => {
    if (!active) return undefined
    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onDismiss()
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, onDismiss, active])
}

/* -------------------------------------------------------------- Select ---- */

/**
 * A small controlled select. Native <select> cannot carry the styling the rest
 * of the shell uses, so this is a button plus a positioned listbox.
 */
export function Select({ value, onValueChange, options, className, align = 'start', placeholder = 'Select' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const labelId = useId()
  useDismiss(ref, () => setOpen(false), open)

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        id={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-8.5 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-[13px] font-medium text-foreground transition-colors cursor-pointer',
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            'animate-fade-rise absolute top-full z-50 mt-1.5 max-h-72 min-w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors cursor-pointer',
                option.value === value ? 'bg-accent font-semibold text-accent-foreground' : 'hover:bg-accent',
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- Popover ---- */

export function Popover({ trigger, children, align = 'end', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, () => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'animate-fade-rise absolute top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-xl',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- Sheet ---- */

/** Left-hand drawer used to carry the sidebar on small screens. */
export function Sheet({ open, onClose, children }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-rise absolute inset-y-0 left-0 w-64 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute -right-9 top-3 z-10 rounded-lg p-1.5 text-white/80 hover:bg-white/10"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        {children}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Tabs ---- */

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-xl bg-secondary p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            value === tab.value
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- Modal ----- */

export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'animate-fade-rise relative z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border bg-slate-50/70 px-4 py-3">
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-slate-200/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Tooltip --- */

export function Tooltip({ label, children, className }) {
  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  )
}
