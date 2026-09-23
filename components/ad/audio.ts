/**
 * Every sound in the ad is synthesised at runtime with the Web Audio API, so the
 * repo ships no audio files and the cues stay locked to the beat timeline.
 *
 * The music bed is deliberately plain — a pad, a pluck arpeggio, a soft kick and
 * hats. It is there so a rough cut has something under it; for a paid campaign,
 * mute it here and drop a licensed track in the video editor instead.
 */

const BPM = 112
const STEP = 60 / BPM / 4 // one sixteenth note, in seconds

/** Fmaj9 - Cadd9 - Am7 - G6, one bar each. Frequencies in Hz. */
const PROGRESSION: number[][] = [
  [174.61, 261.63, 329.63, 440.0],
  [130.81, 261.63, 329.63, 392.0],
  [220.0, 261.63, 329.63, 392.0],
  [196.0, 246.94, 293.66, 392.0],
]

/** Sixteenths that carry a pluck. Sparse, so it breathes. */
const ARP_STEPS = [0, 3, 6, 8, 11, 14]

export class AdAudio {
  private ctx: AudioContext
  private master: GainNode
  private music: GainNode
  private sfx: GainNode
  private noise: AudioBuffer | null = null

  private scheduler: number | null = null
  private nextStepTime = 0
  private step = 0

  constructor() {
    this.ctx = new AudioContext()

    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 4
    comp.attack.value = 0.004
    comp.release.value = 0.18

    this.master = this.ctx.createGain()
    this.master.gain.value = 0.9

    this.music = this.ctx.createGain()
    this.music.gain.value = 0.17

    this.sfx = this.ctx.createGain()
    this.sfx.gain.value = 0.85

    this.music.connect(this.master)
    this.sfx.connect(this.master)
    this.master.connect(comp)
    comp.connect(this.ctx.destination)
  }

  /** Browsers only let audio start from a user gesture. */
  async resume() {
    if (this.ctx.state !== 'running') await this.ctx.resume()
  }

  close() {
    this.stopMusic()
    void this.ctx.close()
  }

  private get now() {
    return this.ctx.currentTime
  }

  private noiseBuffer() {
    if (this.noise) return this.noise
    const length = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    this.noise = buffer
    return buffer
  }

  /* ---------------- one-shot effects ---------------- */

  /** Filtered noise sweep — the transition whoosh between beats. */
  private swoosh(at: number, dur = 0.52, from = 380, to = 3600, gain = 0.3) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer()

    const band = this.ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 1.1
    band.frequency.setValueAtTime(from, at)
    band.frequency.exponentialRampToValueAtTime(to, at + dur)

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.exponentialRampToValueAtTime(gain, at + dur * 0.32)
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    src.connect(band)
    band.connect(env)
    env.connect(this.sfx)
    src.start(at)
    src.stop(at + dur + 0.05)
  }

  /** Short dry click. Used for keystrokes and counter ticks. */
  private tick(at: number, gain = 0.16, cutoff = 2600) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer()

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = cutoff

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(gain, at)
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.035)

    src.connect(hp)
    hp.connect(env)
    env.connect(this.sfx)
    src.start(at)
    src.stop(at + 0.06)
  }

  /** Pitched blip — UI pop, counter tick, notification. */
  private pop(at: number, freq = 880, gain = 0.16, dur = 0.14, drop = 0.6) {
    const osc = this.ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, at)
    osc.frequency.exponentialRampToValueAtTime(freq * drop, at + dur)

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.exponentialRampToValueAtTime(gain, at + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    osc.connect(env)
    env.connect(this.sfx)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }

  /** A small chord — success, cash, logo sting. */
  private chime(at: number, freqs: number[], gain = 0.12, dur = 1.1) {
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f

      const env = this.ctx.createGain()
      const start = at + i * 0.055
      env.gain.setValueAtTime(0.0001, start)
      env.gain.exponentialRampToValueAtTime(gain, start + 0.02)
      env.gain.exponentialRampToValueAtTime(0.0001, start + dur)

      osc.connect(env)
      env.connect(this.sfx)
      osc.start(start)
      osc.stop(start + dur + 0.05)
    })
  }

  /** Sub-bass hit under the heavier cuts. */
  private thud(at: number, gain = 0.5) {
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, at)
    osc.frequency.exponentialRampToValueAtTime(42, at + 0.32)

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(gain, at)
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.4)

    osc.connect(env)
    env.connect(this.sfx)
    osc.start(at)
    osc.stop(at + 0.45)
  }

  /** Rising noise tail that pulls into the next beat. */
  private riser(at: number, dur = 1.0, gain = 0.1) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer()

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(500, at)
    hp.frequency.exponentialRampToValueAtTime(6000, at + dur)

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.exponentialRampToValueAtTime(gain, at + dur * 0.85)
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    src.connect(hp)
    hp.connect(env)
    env.connect(this.sfx)
    src.start(at)
    src.stop(at + dur + 0.05)
  }

  /** Fires the sound design for one beat of the ad. */
  cue(index: number) {
    const t = this.now + 0.02

    switch (index) {
      case 0: // opening — subscriptions piling up
        this.swoosh(t, 0.6, 300, 3200, 0.3)
        this.thud(t + 0.06, 0.34)
        this.pop(t + 0.42, 660, 0.12)
        break

      case 1: // searching the catalogue — typing, then a tap
        this.swoosh(t, 0.42, 500, 4200, 0.24)
        for (let i = 0; i < 7; i++) this.tick(t + 0.3 + i * 0.085, 0.13)
        this.pop(t + 1.18, 980, 0.18, 0.12)
        this.tick(t + 1.2, 0.12, 3400)
        break

      case 2: // escrow — heavier, a lock closing
        this.swoosh(t, 0.6, 260, 1800, 0.28)
        this.thud(t + 0.1, 0.42)
        this.pop(t + 0.72, 420, 0.14, 0.2, 0.5)
        this.tick(t + 0.78, 0.2, 1800)
        this.riser(t + 1.1, 1.3, 0.08)
        break

      case 3: // payment cleared
        this.swoosh(t, 0.4, 600, 4600, 0.24)
        this.chime(t + 0.4, [523.25, 659.25, 783.99], 0.13, 0.9)
        this.pop(t + 1.0, 1320, 0.12, 0.1)
        break

      case 4: // savings counting up
        this.swoosh(t, 0.46, 420, 3800, 0.26)
        for (let i = 0; i < 11; i++) this.pop(t + 0.32 + i * 0.075, 520 + i * 48, 0.075, 0.07)
        this.chime(t + 1.24, [659.25, 987.77, 1318.51], 0.11, 1.2)
        break

      case 5: // logo sting
        this.swoosh(t, 0.78, 220, 5200, 0.34)
        this.thud(t + 0.16, 0.58)
        this.chime(t + 0.3, [261.63, 392.0, 523.25, 659.25], 0.14, 1.9)
        break
    }
  }

  /* ---------------- music bed ---------------- */

  startMusic() {
    if (this.scheduler !== null) return
    this.nextStepTime = this.now + 0.08
    this.scheduler = window.setInterval(() => this.pump(), 25)
  }

  stopMusic() {
    if (this.scheduler === null) return
    window.clearInterval(this.scheduler)
    this.scheduler = null
  }

  resetMusic() {
    this.step = 0
    this.nextStepTime = this.now + 0.08
  }

  /** Schedules every sixteenth that falls inside the next 120 ms. */
  private pump() {
    while (this.nextStepTime < this.now + 0.12) {
      this.playStep(this.step, this.nextStepTime)
      this.step = (this.step + 1) % 64
      this.nextStepTime += STEP
    }
  }

  private playStep(step: number, at: number) {
    const bar = Math.floor(step / 16)
    const inBar = step % 16
    const chord = PROGRESSION[bar]

    if (inBar === 0) this.pad(at, chord)
    if (inBar % 8 === 0) this.kick(at)
    if (inBar % 4 === 2) this.hat(at)
    if (ARP_STEPS.includes(inBar)) {
      const note = chord[(ARP_STEPS.indexOf(inBar) + bar) % chord.length] * 2
      this.pluck(at, note)
    }
  }

  private pad(at: number, chord: number[]) {
    const dur = STEP * 16
    chord.forEach((f, i) => {
      ;[-5, 5].forEach((detune) => {
        const osc = this.ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = f
        osc.detune.value = detune

        const lp = this.ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 900

        const env = this.ctx.createGain()
        env.gain.setValueAtTime(0.0001, at)
        env.gain.linearRampToValueAtTime(0.035 / (i + 1.4), at + 0.35)
        env.gain.linearRampToValueAtTime(0.0001, at + dur)

        osc.connect(lp)
        lp.connect(env)
        env.connect(this.music)
        osc.start(at)
        osc.stop(at + dur + 0.05)
      })
    })
  }

  private pluck(at: number, freq: number) {
    const osc = this.ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.exponentialRampToValueAtTime(0.09, at + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.34)

    osc.connect(env)
    env.connect(this.music)
    osc.start(at)
    osc.stop(at + 0.38)
  }

  private kick(at: number) {
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(130, at)
    osc.frequency.exponentialRampToValueAtTime(48, at + 0.14)

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.34, at)
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.24)

    osc.connect(env)
    env.connect(this.music)
    osc.start(at)
    osc.stop(at + 0.28)
  }

  private hat(at: number) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer()

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 8200

    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.05, at)
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.035)

    src.connect(hp)
    hp.connect(env)
    env.connect(this.music)
    src.start(at)
    src.stop(at + 0.06)
  }

  setMusicLevel(v: number) {
    this.music.gain.setTargetAtTime(v, this.now, 0.05)
  }
}
