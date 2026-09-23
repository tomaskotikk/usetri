import { Resend } from 'resend'
import { esc, render, renderText, SITE, type Mail } from './layout'

const FROM = 'Ušetři <noreply@usetri.app>'

/**
 * Sending must never break the thing that triggered it. A failed welcome e-mail
 * is worth a log line, not a broken sign-up — so everything here resolves.
 */
async function send(to: string, subject: string, mail: Mail) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY chybí, e-mail se neodeslal:', subject)
    return
  }

  try {
    const { error } = await new Resend(key).emails.send({
      from: FROM,
      to,
      subject,
      html: render(mail),
      text: renderText(mail),
    })
    if (error) console.error('[email] Resend odmítl zprávu:', error)
  } catch (cause) {
    console.error('[email] Odeslání selhalo:', cause)
  }
}

/**
 * Goes out once, the first time an account actually reaches a session — whether
 * that was a confirmed e-mail sign-up or a Google sign-in.
 */
export function sendWelcome(to: string, name?: string | null) {
  const first = name?.trim().split(/\s+/)[0]
  const greeting = first ? `Vítej, ${esc(first)}` : 'Vítej v Ušetři'

  return send(to, 'Účet je aktivní — vítej v Ušetři', {
    heading: greeting,
    intro: 'Účet máš hotový a aktivní. Od téhle chvíle platíš za předplatná jen svůj podíl.',
    points: [
      '<strong>Projdi nabídky</strong> a najdi skupinu s volným místem.',
      '<strong>Nebo založ vlastní</strong>, pokud už nějaký rodinný tarif platíš.',
      '<strong>Plať jen za sebe</strong> — každý má vlastní účet i heslo.',
    ],
    button: { label: 'Přejít do aplikace', href: `${SITE}/dashboard` },
    reason: 'Tenhle e-mail ti přišel, protože sis právě založil účet na usetri.app.',
  })
}
