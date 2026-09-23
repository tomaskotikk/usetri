'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Maximize2, Monitor, Pause, Play, RotateCcw, Smartphone, Volume2, VolumeX } from 'lucide-react'
import { AdScene, CANVAS, type AdFormat } from './AdScene'
import { beatAt, totalMs } from './beats'
import { AdAudio } from './audio'

/** Pushing state at 60fps would re-render the whole scene every frame for nothing. */
const TICK_MS = 50

const subscribeViewport = (onChange: () => void) => {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}
const readViewport = () => `${window.innerWidth}x${window.innerHeight}`
/** Prerender has no window; the real size arrives on hydration. */
const readViewportOnServer = () => '1600x900'

function useViewport() {
  const raw = useSyncExternalStore(subscribeViewport, readViewport, readViewportOnServer)
  const [w, h] = raw.split('x').map(Number)
  return { w, h }
}

export function AdStage({
  clean = false,
  native = false,
  sound = false,
  initialFormat = '16:9',
}: {
  clean?: boolean
  native?: boolean
  sound?: boolean
  initialFormat?: AdFormat
}) {
  const [format, setFormat] = useState<AdFormat>(initialFormat)
  const [playing, setPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [chrome, setChrome] = useState(!clean)
  const [nativeScale, setNativeScale] = useState(native)
  const [soundOn, setSoundOn] = useState(false)

  const accumulated = useRef(0)
  const lastFrame = useRef<number | null>(null)
  const lastPush = useRef(0)
  const audio = useRef<AdAudio | null>(null)
  const lastCued = useRef(-1)

  const viewport = useViewport()
  const canvas = CANVAS[format]
  const scale = nativeScale ? 1 : Math.min(viewport.w / canvas.w, viewport.h / canvas.h)
  const { index, progress } = beatAt(elapsed)

  useEffect(() => {
    if (!playing) {
      lastFrame.current = null
      return
    }
    let raf = 0
    const tick = (t: number) => {
      if (lastFrame.current === null) lastFrame.current = t
      accumulated.current += t - lastFrame.current
      lastFrame.current = t
      if (t - lastPush.current >= TICK_MS) {
        lastPush.current = t
        setElapsed(accumulated.current)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lastFrame.current = null
    }
  }, [playing])

  const restart = useCallback(() => {
    accumulated.current = 0
    lastFrame.current = null
    lastCued.current = -1
    audio.current?.resetMusic()
    setElapsed(0)
  }, [])

  /** Audio can only start from a user gesture, so this always runs from a click or key. */
  const toggleSound = useCallback(async () => {
    if (soundOn) {
      audio.current?.stopMusic()
      setSoundOn(false)
      return
    }
    if (!audio.current) audio.current = new AdAudio()
    await audio.current.resume()
    audio.current.resetMusic()
    audio.current.startMusic()
    lastCued.current = -1
    setSoundOn(true)
  }, [soundOn])

  useEffect(() => () => audio.current?.close(), [])

  // One cue per beat, fired the moment the beat changes.
  useEffect(() => {
    if (!soundOn || !playing) return
    if (lastCued.current === index) return
    lastCued.current = index
    audio.current?.cue(index)
  }, [index, soundOn, playing])

  useEffect(() => {
    if (!soundOn) return
    if (playing) audio.current?.startMusic()
    else audio.current?.stopMusic()
  }, [playing, soundOn])

  const pickFormat = useCallback(
    (next: AdFormat) => {
      setFormat(next)
      restart()
    },
    [restart],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
      if (e.key === 'r') restart()
      if (e.key === 'c') setChrome((c) => !c)
      if (e.key === 'm') void toggleSound()
      if (e.key === 'f') pickFormat(format === '16:9' ? '9:16' : '16:9')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restart, pickFormat, toggleSound, format])

  const tab = (value: AdFormat, Icon: typeof Monitor, label: string, title: string) => (
    <button
      onClick={() => pickFormat(value)}
      title={title}
      className={`h-9 px-3 rounded-xl text-[12px] font-semibold transition ${
        format === value ? 'bg-[#00d99a] text-[#00251a]' : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
    </button>
  )

  return (
    <div className="h-full w-full grid place-items-center overflow-auto">
      <div style={{ width: canvas.w * scale, height: canvas.h * scale }} className="relative shrink-0">
        <div
          style={{
            width: canvas.w,
            height: canvas.h,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="absolute top-0 left-0"
        >
          <AdScene index={index} progress={progress} format={format} />
        </div>
      </div>

      {chrome && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-2xl bg-[#11151d]/95 backdrop-blur border border-white/10 px-2.5 py-2 text-white shadow-2xl">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            title="Přehrát / pauza (mezerník)"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={restart}
            className="h-9 w-9 grid place-items-center rounded-xl bg-white/10 hover:bg-white/20 transition"
            title="Od začátku (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <span className="mx-1 h-6 w-px bg-white/15" />

          {tab('16:9', Monitor, '16:9', 'YouTube, web, X')}
          {tab('9:16', Smartphone, '9:16', 'Reels, TikTok, Stories')}

          <span className="mx-1 h-6 w-px bg-white/15" />

          <button
            onClick={() => void toggleSound()}
            className={`h-9 w-9 grid place-items-center rounded-xl transition ${
              soundOn ? 'bg-[#00d99a] text-[#00251a]' : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Zvuk a hudba (M)"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setNativeScale((n) => !n)}
            className={`h-9 w-9 grid place-items-center rounded-xl transition ${
              nativeScale ? 'bg-[#00d99a] text-[#00251a]' : 'bg-white/10 hover:bg-white/20'
            }`}
            title={`1:1 — ${canvas.w}x${canvas.h} px`}
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <span className="px-2.5 font-mono text-[11px] text-white/55 tabular-nums">
            {((elapsed % totalMs) / 1000).toFixed(1)}s / {(totalMs / 1000).toFixed(1)}s · {Math.round(scale * 100)} %
          </span>
          <span className="pr-1.5 text-[11px] text-white/35">C skryje lištu</span>
        </div>
      )}

      {sound && !soundOn && (
        <button
          onClick={() => {
            void toggleSound().then(restart)
          }}
          className="fixed inset-0 z-[60] grid place-items-center bg-[#0b0d12]/85 backdrop-blur-sm text-white"
        >
          <span className="flex flex-col items-center gap-4">
            <span className="h-20 w-20 rounded-full bg-[#00d99a] grid place-items-center">
              <Volume2 className="h-8 w-8 text-[#00251a]" />
            </span>
            <span className="text-[17px] font-semibold">Spustit se zvukem</span>
            <span className="text-[13px] text-white/45">Prohlížeč vyžaduje jedno kliknutí</span>
          </span>
        </button>
      )}
    </div>
  )
}
