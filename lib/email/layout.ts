/**
 * The frame every e-mail from Ušetři is built in.
 *
 * Mail clients are not browsers. What they enforce, and why this looks the way
 * it does:
 *   - tables, not flexbox or grid — Outlook renders through Word
 *   - styles inline, no <style> block — Gmail strips it in forwarded mail
 *   - a sans-serif fallback stack — web fonts never load
 *   - 560px wide, so it survives Outlook's reading pane
 *   - the link repeated as plain text, for when the button does not render
 */

const SANS = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const INK = '#050b1a'
const MUTED = '#5b6478'
const FAINT = '#8a93a6'
const BRAND = '#00d99a'
const BORDER = '#e3e8f2'

/**
 * Where the links in an e-mail should point.
 *
 * Callers pass the origin of the request that triggered the mail, so a sign-up on
 * localhost gets a button back to localhost. Only when there is no request to ask
 * — a cron job, a webhook — does this fall back to the deployed address.
 */
export function siteUrl(origin?: string | null) {
  return origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://usetri.app'
}

/** Escapes anything that came from a user before it lands in the markup. */
export function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface Mail {
  /** Base address for every link in the message. */
  site: string
  heading: string
  intro: string
  button?: { label: string; href: string }
  /** Short lines under the button — the "what happens next" list. */
  points?: string[]
  /** Why this person is getting the mail. Required by good practice and by us. */
  reason: string
}

function points(items: string[]) {
  return items
    .map(
      (item) => `
            <tr>
              <td width="26" valign="top" style="padding:0 0 12px 0;">
                <div style="width:8px;height:8px;border-radius:4px;background:${BRAND};margin-top:7px;"></div>
              </td>
              <td valign="top" style="padding:0 0 12px 0;font-family:${SANS};font-size:15px;line-height:1.55;color:${INK};">${item}</td>
            </tr>`,
    )
    .join('')
}

export function render(mail: Mail) {
  const button = mail.button
    ? `
        <tr>
          <td style="padding:28px 36px 0 36px;">
            <a href="${mail.button.href}" style="display:inline-block;background:${BRAND};color:#00251a;font-family:${SANS};font-size:16px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;">${mail.button.label}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px 0 36px;font-family:${SANS};">
            <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">Nefunguje tlačítko? Zkopíruj si tuhle adresu do prohlížeče:</p>
            <p style="margin:6px 0 0 0;font-size:13px;line-height:1.6;color:#00b885;word-break:break-all;">${mail.button.href}</p>
          </td>
        </tr>`
    : ''

  const list = mail.points?.length
    ? `
        <tr>
          <td style="padding:26px 36px 0 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${points(mail.points)}</table>
          </td>
        </tr>`
    : ''

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;margin:0;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:20px;">
        <tr>
          <td style="padding:32px 36px 0 36px;">
            <span style="font-family:${SANS};font-size:24px;font-weight:800;letter-spacing:-0.04em;color:${INK};">Ušetři<span style="color:${BRAND};">.</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px 0 36px;font-family:${SANS};">
            <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-0.03em;color:${INK};">${mail.heading}</h1>
            <p style="margin:14px 0 0 0;font-size:16px;line-height:1.6;color:${MUTED};">${mail.intro}</p>
          </td>
        </tr>${list}${button}
        <tr>
          <td style="padding:32px 36px 32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="border-top:1px solid ${BORDER};padding:0;"></td></tr>
            </table>
            <p style="margin:20px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${FAINT};">
              Ušetři — plať jen svůj podíl · <a href="${mail.site}" style="color:${FAINT};">usetri.app</a><br />
              ${mail.reason}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

/** Plain-text twin. Spam filters score mail without one worse. */
export function renderText(mail: Mail) {
  const lines = [
    'UŠETŘI',
    '',
    mail.heading,
    '',
    mail.intro,
    ...(mail.points?.length ? ['', ...mail.points.map((p) => `- ${p.replace(/<[^>]+>/g, '')}`)] : []),
    ...(mail.button ? ['', `${mail.button.label}: ${mail.button.href}`] : []),
    '',
    '—',
    `Ušetři — plať jen svůj podíl · ${mail.site}`,
    mail.reason,
  ]
  return lines.join('\n')
}
