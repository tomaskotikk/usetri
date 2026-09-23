'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { field } from './field'

/**
 * Scores a password the way the eye reads it: length first, then variety.
 *
 * It is deliberately not a strength oracle — it exists to nudge, so the bands are
 * coarse and the wording never claims a password is safe.
 */
function score(value: string) {
  if (!value) return 0
  let points = 0
  if (value.length >= 8) points++
  if (value.length >= 12) points++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points++
  if (/\d/.test(value)) points++
  if (/[^\w\s]/.test(value)) points++
  return Math.min(points, 4)
}

const BANDS = [
  { label: '', color: '' },
  { label: 'Slabé', color: '#d63b2f' },
  { label: 'Ucházející', color: '#e0972f' },
  { label: 'Dobré', color: '#7cf3ce' },
  { label: 'Silné', color: '#00d99a' },
]

export function PasswordField({
  name,
  placeholder,
  autoComplete,
  minLength,
  label,
  /** Shows the strength bar. Only useful where a password is being chosen. */
  meter = false,
}: {
  name: string
  placeholder: string
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
  label: string
  meter?: boolean
}) {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState('')
  const level = meter ? score(value) : 0
  const band = BANDS[level]

  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${field} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Skrýt heslo' : 'Zobrazit heslo'}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-navy-deep"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {meter && value.length > 0 && (
        <div className="mt-2 flex items-center gap-2.5 px-1">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ background: step <= level ? band.color : 'var(--border)' }}
              />
            ))}
          </div>
          <span className="w-[74px] shrink-0 text-right text-[11px] font-medium" style={{ color: band.color }}>
            {band.label}
          </span>
        </div>
      )}
    </div>
  )
}
