/**
 * The dot globe's data and renderer, kept apart from any component so the landing
 * page can spin it on an animation frame while the banner export draws a single
 * still of the same sphere onto its own canvas.
 */

/**
 * Coarse coastline rings in [lon, lat]. Not survey-grade — traced at a few
 * degrees of resolution, which is all the dot grid below can resolve anyway,
 * but accurate enough that the continents are immediately recognisable.
 */
const LANDMASSES: [number, number][][] = [
  // North America
  [
    [-168, 66], [-162, 63], [-165, 60], [-158, 57], [-153, 58], [-146, 60], [-140, 60],
    [-135, 57], [-130, 53], [-125, 49], [-124, 42], [-121, 36], [-117, 32], [-114, 28],
    [-110, 23], [-106, 22], [-98, 18], [-95, 16], [-92, 15], [-88, 16], [-87, 21],
    [-90, 21], [-91, 26], [-84, 30], [-82, 26], [-80, 27], [-81, 32], [-76, 35],
    [-74, 40], [-70, 43], [-66, 45], [-60, 47], [-56, 52], [-64, 56], [-68, 61],
    [-78, 63], [-80, 70], [-90, 72], [-100, 70], [-110, 69], [-120, 70], [-130, 70],
    [-141, 70], [-150, 71], [-158, 71], [-166, 68],
  ],
  // Greenland
  [
    [-45, 60], [-52, 64], [-55, 70], [-60, 76], [-56, 82], [-40, 83], [-25, 80],
    [-20, 75], [-26, 70], [-36, 65],
  ],
  // South America
  [
    [-81, 8], [-77, 8], [-75, 11], [-70, 12], [-62, 10], [-55, 6], [-50, 2], [-45, -2],
    [-38, -5], [-35, -8], [-38, -13], [-39, -18], [-45, -23], [-48, -25], [-53, -34],
    [-57, -38], [-62, -40], [-65, -45], [-68, -52], [-72, -54], [-74, -50], [-73, -44],
    [-75, -38], [-72, -30], [-71, -25], [-70, -18], [-74, -14], [-78, -8], [-80, -4],
    [-80, 0], [-78, 4],
  ],
  // Africa
  [
    [-17, 15], [-17, 21], [-13, 28], [-10, 31], [-6, 35], [0, 36], [9, 37], [11, 34],
    [15, 32], [20, 31], [25, 32], [31, 31], [34, 28], [37, 22], [39, 15], [43, 12],
    [45, 11], [51, 12], [51, 4], [48, 2], [43, -1], [40, -7], [40, -12], [36, -18],
    [34, -24], [31, -29], [27, -33], [20, -35], [17, -30], [14, -23], [12, -17],
    [13, -11], [9, -1], [9, 4], [3, 6], [-4, 5], [-8, 4], [-13, 8], [-16, 12],
  ],
  // Eurasia
  [
    [-9, 36], [-2, 36], [3, 43], [9, 44], [13, 45], [16, 41], [19, 40], [24, 38],
    [27, 36], [30, 37], [36, 36], [36, 33], [35, 31], [34, 28], [38, 24], [42, 16],
    [45, 13], [48, 14], [52, 17], [56, 24], [58, 23], [62, 25], [66, 25], [68, 23],
    [72, 20], [75, 16], [77, 8], [80, 13], [85, 19], [89, 22], [92, 20], [95, 16],
    [98, 10], [101, 3], [104, 10], [108, 16], [110, 21], [115, 23], [119, 25],
    [121, 30], [122, 37], [126, 40], [129, 43], [131, 46], [135, 48], [141, 52],
    [143, 59], [150, 59], [158, 61], [163, 60], [170, 62], [179, 65], [179, 70],
    [170, 70], [160, 71], [150, 72], [140, 73], [130, 73], [120, 74], [110, 76],
    [100, 77], [90, 76], [80, 74], [70, 72], [60, 71], [50, 69], [42, 67], [35, 69],
    [30, 70], [25, 66], [22, 60], [19, 56], [13, 54], [8, 54], [4, 52], [0, 49],
    [-2, 46], [-2, 43], [-9, 43],
  ],
  // Australia
  [
    [113, -22], [114, -26], [115, -32], [118, -35], [125, -33], [131, -32], [135, -35],
    [138, -35], [141, -38], [146, -39], [150, -37], [153, -31], [153, -28], [148, -20],
    [143, -14], [136, -12], [130, -12], [125, -14], [120, -18],
  ],
  // New Guinea
  [[131, -1], [141, -2], [147, -6], [150, -9], [143, -9], [137, -8], [132, -5]],
  // Japan
  [[130, 32], [132, 34], [136, 35], [140, 36], [141, 41], [143, 43], [145, 44], [142, 45], [140, 40], [137, 37], [133, 34], [131, 31]],
  // British Isles
  [[-10, 52], [-6, 55], [-8, 58], [-3, 58], [-1, 54], [1, 52], [-2, 50], [-5, 50]],
  // Madagascar
  [[43, -12], [50, -15], [50, -22], [47, -25], [44, -22], [43, -16]],
  // New Zealand
  [[166, -46], [168, -44], [172, -43], [174, -41], [177, -39], [178, -37], [175, -36], [172, -40], [168, -44]],
  // Indonesia (Sumatra / Java / Borneo, lumped)
  [[95, 5], [100, 2], [105, -2], [110, -7], [115, -8], [119, -9], [117, -3], [114, 1], [110, 3], [105, 1], [100, 5]],
  // Philippines
  [[120, 6], [126, 7], [126, 13], [122, 18], [120, 16], [119, 11]],
  // Iceland
  [[-24, 64], [-22, 66], [-15, 66], [-14, 64], [-19, 63]],
  // Cuba / Hispaniola
  [[-84, 22], [-80, 23], [-75, 20], [-78, 20], [-82, 21]],
  // Antarctica (solid polar cap so the south pole isn't a bare ring)
  [[-180, -64], [180, -64], [180, -90], [-180, -90]],
]

/** Cities that get a glowing marker — the "people are already here" signal. */
const CITIES: { lon: number; lat: number; primary?: boolean }[] = [
  { lon: 14.42, lat: 50.08, primary: true }, // Praha
  { lon: -0.13, lat: 51.51 }, // Londýn
  { lon: -74.0, lat: 40.71 }, // New York
  { lon: 139.69, lat: 35.69 }, // Tokio
  { lon: -46.63, lat: -23.55 }, // São Paulo
  { lon: 151.21, lat: -33.87 }, // Sydney
  { lon: 13.4, lat: 52.52 }, // Berlín
]

/** Great-circle links drawn between city pairs. */
const LINKS: [number, number][] = [
  [0, 1],
  [0, 3],
  [1, 2],
  [0, 5],
  [2, 4],
]

function pointInRing(lon: number, lat: number, ring: [number, number][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function isLand(lon: number, lat: number) {
  for (const ring of LANDMASSES) {
    if (pointInRing(lon, lat, ring)) return true
  }
  return false
}

function toVector(lon: number, lat: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180
  const theta = (lon * Math.PI) / 180
  return [Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)]
}

const TILT = (-16 * Math.PI) / 180

export interface GlobePoints {
  land: Float32Array
  ocean: Float32Array
  cityVectors: { lon: number; lat: number; primary?: boolean; v: [number, number, number] }[]
}

/** Samples the sphere once; the result is static and worth memoising. */
export function buildGlobe(): GlobePoints {
  const landPts: number[] = []
  const oceanPts: number[] = []
  for (let lat = -84; lat <= 84; lat += 2.1) {
    const ring = Math.cos((lat * Math.PI) / 180)
    const count = Math.max(8, Math.round(186 * ring))
    for (let i = 0; i < count; i++) {
      const lon = -180 + (360 * i) / count
      const [x, y, z] = toVector(lon, lat)
      if (isLand(lon, lat)) {
        landPts.push(x, y, z)
      } else if (i % 3 === 0) {
        oceanPts.push(x, y, z)
      }
    }
  }
  return {
    land: new Float32Array(landPts),
    ocean: new Float32Array(oceanPts),
    cityVectors: CITIES.map((c) => ({ ...c, v: toVector(c.lon, c.lat) })),
  }
}

function project(
  v: [number, number, number],
  cos: number,
  sin: number,
  cosT: number,
  sinT: number,
  cx: number,
  cy: number,
  r: number,
) {
  const x1 = v[0] * cos + v[2] * sin
  const z1 = -v[0] * sin + v[2] * cos
  const y2 = v[1] * cosT - z1 * sinT
  const z2 = v[1] * sinT + z1 * cosT
  return { x: cx + x1 * r, y: cy - y2 * r, z: z2 }
}

export interface GlobeView {
  cx: number
  cy: number
  r: number
  rotation: number
  /** 0..1, drives the size of the city halos. */
  pulse: number
  /** Scales every stroke and dot, for drawing the globe far larger than the screen. */
  detail?: number
  /**
   * 'dark' is the landing page: a lit sphere on a night field. 'light' drops the
   * ocean body entirely and leaves a dotted wireframe, which is the only way the
   * globe can sit under near-black type on a white banner.
   */
  theme?: 'dark' | 'light'
}

/** Paints one frame of the globe at the given centre and radius. */
export function drawGlobe(ctx: CanvasRenderingContext2D, points: GlobePoints, view: GlobeView) {
  const { cx, cy, r, rotation, pulse } = view
  const k = view.detail ?? 1
  const light = view.theme === 'light'
  const { land, ocean, cityVectors } = points

  const atmo = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.35)
  if (light) {
    atmo.addColorStop(0, 'rgba(0, 217, 154, 0.13)')
    atmo.addColorStop(1, 'rgba(0, 217, 154, 0)')
  } else {
    atmo.addColorStop(0, 'rgba(0, 217, 154, 0.20)')
    atmo.addColorStop(0.5, 'rgba(78, 200, 255, 0.10)')
    atmo.addColorStop(1, 'rgba(78, 200, 255, 0)')
  }
  ctx.fillStyle = atmo
  ctx.beginPath()
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2)
  ctx.fill()

  if (!light) {
    const body = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r)
    body.addColorStop(0, '#1d4b80')
    body.addColorStop(0.55, '#0e2750')
    body.addColorStop(1, '#040c1c')
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const cosT = Math.cos(TILT)
  const sinT = Math.sin(TILT)

  ctx.fillStyle = light ? '#0d1b36' : '#3f6ba8'
  for (let i = 0; i < ocean.length; i += 3) {
    const p = project([ocean[i], ocean[i + 1], ocean[i + 2]], cos, sin, cosT, sinT, cx, cy, r)
    if (p.z <= 0.02) continue
    ctx.globalAlpha = light ? 0.03 + p.z * 0.07 : 0.05 + p.z * 0.13
    ctx.fillRect(p.x, p.y, 1.2 * k, 1.2 * k)
  }

  ctx.fillStyle = light ? '#00b885' : '#b9ffe8'
  for (let i = 0; i < land.length; i += 3) {
    const p = project([land[i], land[i + 1], land[i + 2]], cos, sin, cosT, sinT, cx, cy, r)
    if (p.z <= 0.02) continue
    ctx.globalAlpha = light ? 0.22 + p.z * 0.4 : 0.45 + p.z * 0.55
    const s = (1.9 + p.z * 1.3) * k
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
  }
  ctx.globalAlpha = 1

  ctx.lineWidth = 1.1 * k
  for (const [a, b] of LINKS) {
    const va = cityVectors[a].v
    const vb = cityVectors[b].v
    const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]))
    const omega = Math.acos(dot)
    if (omega < 0.001) continue
    const steps = 48
    let started = false
    ctx.beginPath()
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const k1 = Math.sin((1 - t) * omega) / Math.sin(omega)
      const k2 = Math.sin(t * omega) / Math.sin(omega)
      const lift = 1 + Math.sin(Math.PI * t) * 0.14
      const v: [number, number, number] = [
        (va[0] * k1 + vb[0] * k2) * lift,
        (va[1] * k1 + vb[1] * k2) * lift,
        (va[2] * k1 + vb[2] * k2) * lift,
      ]
      const p = project(v, cos, sin, cosT, sinT, cx, cy, r)
      if (p.z <= 0) {
        started = false
        continue
      }
      if (!started) {
        ctx.moveTo(p.x, p.y)
        started = true
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }
    ctx.strokeStyle = light ? 'rgba(0, 184, 133, 0.5)' : 'rgba(0, 217, 154, 0.42)'
    ctx.stroke()
  }

  for (const city of cityVectors) {
    const p = project(city.v, cos, sin, cosT, sinT, cx, cy, r)
    if (p.z <= 0.05) continue
    const base = (city.primary ? 3.6 : 2.4) * k
    ctx.globalAlpha = 0.25 + p.z * 0.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, base + pulse * (city.primary ? 9 : 5) * k, 0, Math.PI * 2)
    ctx.strokeStyle = city.primary
      ? 'rgba(0, 184, 133, 0.6)'
      : light
        ? 'rgba(0, 184, 133, 0.35)'
        : 'rgba(124, 243, 206, 0.35)'
    ctx.lineWidth = 1 * k
    ctx.stroke()

    ctx.globalAlpha = 0.5 + p.z * 0.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, base, 0, Math.PI * 2)
    ctx.fillStyle = city.primary ? '#00d99a' : light ? '#00b885' : '#7cf3ce'
    ctx.shadowBlur = (light ? 8 : 14) * k
    ctx.shadowColor = '#00d99a'
    ctx.fill()
    ctx.shadowBlur = 0
  }
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = light ? 'rgba(5, 11, 26, 0.13)' : 'rgba(124, 243, 206, 0.28)'
  ctx.lineWidth = 1.2 * k
  ctx.stroke()
}
