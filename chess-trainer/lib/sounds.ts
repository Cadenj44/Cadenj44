// Web Audio API sounds — works in browser, silently no-ops in non-browser environments

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      _ctx = new (
        (window as any).AudioContext || (window as any).webkitAudioContext
      )();
    }
    // Resume context if suspended (browser autoplay policy)
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.25,
  startDelay = 0,
  freqEnd?: number,
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startDelay);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + startDelay + duration);
  }
  gain.gain.setValueAtTime(vol, c.currentTime + startDelay);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startDelay + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + startDelay);
  osc.stop(c.currentTime + startDelay + duration + 0.01);
}

export function playTap() {
  tone(660, 0.07, 'sine', 0.12, 0, 880);
}

export function playCorrect() {
  tone(523, 0.12, 'sine', 0.18, 0.00);
  tone(659, 0.12, 'sine', 0.18, 0.09);
  tone(784, 0.22, 'sine', 0.18, 0.18);
}

export function playUnlock() {
  tone(300, 0.08, 'sine', 0.2, 0.00, 600);
  tone(600, 0.08, 'sine', 0.2, 0.10, 900);
  tone(900, 0.08, 'sine', 0.2, 0.20, 1200);
  tone(1200, 0.28, 'sine', 0.15, 0.30);
}

export function playError() {
  tone(320, 0.09, 'sawtooth', 0.18, 0.00, 200);
  tone(200, 0.14, 'sawtooth', 0.12, 0.11, 150);
}

export function playNodePress() {
  tone(500, 0.05, 'sine', 0.14, 0, 700);
  tone(700, 0.08, 'sine', 0.10, 0.05);
}
