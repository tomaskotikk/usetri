// components/dashboard/AccountInput.tsx
'use client'
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { formatIban, parseCzechAccount, toIban } from '@/lib/czech-account'

/** Bank account field that checks the number as you type and shows the IBAN it becomes. */
export function AccountInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue)
  const [touched, setTouched] = useState(false)
  const parsed = useMemo(() => parseCzechAccount(value), [value])
  const showError = touched && value.trim() !== '' && !parsed

  return (
    <div>
      <input
        name="account"
        required
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="např. 2000145399/0800"
        aria-invalid={showError}
        className="h-12 w-full rounded-xl border border-border bg-white px-4 font-mono text-[15px] text-navy-deep outline-none transition placeholder:font-sans placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-invalid:border-destructive"
      />
      {parsed && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-fg-muted">
          <Check className="h-3.5 w-3.5 text-brand" /> {formatIban(toIban(parsed))}
        </p>
      )}
      {showError && (
        <p className="mt-1.5 text-[12px] text-destructive">
          Tohle číslo účtu nevypadá správně. Zkontroluj předčíslí, číslo i kód banky.
        </p>
      )}
    </div>
  )
}
