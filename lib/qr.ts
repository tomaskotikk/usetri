import QRCode from 'qrcode'

/** Server-side: renders the QR as inline SVG, so the page ships no QR library. */
export function qrSvg(text: string) {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1730', light: '#ffffff' },
  })
}
