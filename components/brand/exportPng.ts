/**
 * Canvas-based PNG export for brand assets.
 *
 * Artwork is drawn as SVG and rasterised; text is drawn straight onto the canvas
 * with `fillText`. That split matters: a serialised SVG loses the page's web font
 * and would fall back to a system face, whereas canvas text uses the font the
 * browser has already loaded — so exported wordmarks match what is on screen.
 */

/** Turns a live SVG element into an image at the size we want to draw it. */
export async function rasterize(svg: SVGSVGElement, width: number, height: number) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  // `currentColor` resolves against inherited colour, which a detached clone lacks.
  clone.style.color = window.getComputedStyle(svg).color

  const source = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('SVG se nepodařilo vykreslit'))
      image.src = url
    })
    return image
  } finally {
    // The image keeps its decoded bitmap, so the blob URL can go immediately.
    URL.revokeObjectURL(url)
  }
}

/**
 * The real family name of the display font. next/font mangles it, so asking the
 * DOM is the only way to get a string `ctx.font` will actually match.
 */
export async function displayFont(weight = 800, sizePx = 100) {
  const probe = document.createElement('span')
  probe.className = 'font-display'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  document.body.appendChild(probe)
  const family = window.getComputedStyle(probe).fontFamily
  probe.remove()

  const spec = `${weight} ${sizePx}px ${family}`
  try {
    await document.fonts.load(spec, 'Ušetři')
    await document.fonts.ready
  } catch {
    // An unavailable font is not worth failing an export over.
  }
  return family
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG se nepodařilo vytvořit'))
        return
      }
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = filename
      link.click()
      URL.revokeObjectURL(href)
      resolve()
    }, 'image/png')
  })
}

/** The brand's dark field, as a canvas gradient rather than a CSS one. */
export function darkField(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width * 0.55, height)
  gradient.addColorStop(0, '#050b1a')
  gradient.addColorStop(0.52, '#0d1b36')
  gradient.addColorStop(1, '#0b3a34')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draws "Ušetři." centred on `centreX`, with the full stop in brand green — the
 * one detail that makes the wordmark the wordmark.
 */
export function drawWordmark(
  ctx: CanvasRenderingContext2D,
  opts: { centreX: number; baseline: number; size: number; family: string; color?: string },
) {
  const { centreX, baseline, size, family, color = '#ffffff' } = opts
  ctx.font = `800 ${size}px ${family}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  const name = 'Ušetři'
  const dot = '.'
  const nameWidth = ctx.measureText(name).width
  const dotWidth = ctx.measureText(dot).width
  const left = centreX - (nameWidth + dotWidth) / 2

  ctx.fillStyle = color
  ctx.fillText(name, left, baseline)
  ctx.fillStyle = '#00d99a'
  ctx.fillText(dot, left + nameWidth, baseline)
}

export function drawCentred(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: { centreX: number; baseline: number; font: string; color: string },
) {
  ctx.font = opts.font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = opts.color
  ctx.fillText(text, opts.centreX, opts.baseline)
  ctx.textAlign = 'left'
}
