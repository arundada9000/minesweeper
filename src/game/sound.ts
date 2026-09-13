/**
 * Generative sound engine (Web Audio, zero assets). Everything is synthesized
 * at low gain with short envelopes so it stays subtle and purposefully quiet.
 * The AudioContext starts lazily on the first explicit user gesture.
 */

import { useSettings } from "./useSettingsStore";

type SoundKind =
  | "reveal"
  | "cascade"
  | "flag"
  | "question"
  | "chord"
  | "win"
  | "lose"
  | "pause"
  | "resume"
  | "newgame"
  | "click"
  | "confirm"
  | "cancel";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  out: GainNode,
  opts: { freq: number; endFreq?: number; at?: number; dur?: number; type?: OscillatorType; vol?: number }
): void {
  const { freq, endFreq = freq, at = 0, dur = 0.08, type = "sine", vol = 0.5 } = opts;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), ac.currentTime + at + dur);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(gain);
  gain.connect(out);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.05);
}

/** Unlock the audio context inside a user gesture; returns readiness. */
export function primeAudio(): boolean {
  if (!useSettings.getState().sound) return false;
  return ensureContext() !== null;
}

export function playSound(kind: SoundKind): void {
  if (!useSettings.getState().sound) return;
  const ac = ensureContext();
  if (!ac || !master) return;

  switch (kind) {
    case "reveal":
      tone(ac, master, { freq: 520, endFreq: 900, dur: 0.05, type: "triangle", vol: 0.16 });
      break;
    case "cascade":
      tone(ac, master, { freq: 300, endFreq: 720, dur: 0.1, type: "sine", vol: 0.12 });
      break;
    case "flag":
      tone(ac, master, { freq: 980, endFreq: 720, dur: 0.05, type: "triangle", vol: 0.22 });
      break;
    case "question":
      tone(ac, master, { freq: 620, endFreq: 980, dur: 0.07, type: "triangle", vol: 0.18 });
      break;
    case "chord":
      tone(ac, master, { freq: 760, endFreq: 1040, dur: 0.07, type: "triangle", vol: 0.2 });
      break;
    case "win":
      tone(ac, master, { freq: 523, dur: 0.18, type: "triangle", vol: 0.2 });
      tone(ac, master, { freq: 659, at: 0.1, dur: 0.2, type: "triangle", vol: 0.2 });
      tone(ac, master, { freq: 784, at: 0.2, dur: 0.28, type: "triangle", vol: 0.2 });
      break;
    case "lose":
      tone(ac, master, { freq: 380, endFreq: 120, dur: 0.34, type: "sawtooth", vol: 0.12 });
      tone(ac, master, { freq: 190, endFreq: 70, at: 0.16, dur: 0.4, type: "sine", vol: 0.16 });
      break;
    case "pause":
      tone(ac, master, { freq: 520, endFreq: 340, dur: 0.09, type: "sine", vol: 0.16 });
      break;
    case "resume":
      tone(ac, master, { freq: 340, endFreq: 560, dur: 0.09, type: "sine", vol: 0.16 });
      break;
    case "newgame":
      tone(ac, master, { freq: 440, endFreq: 660, dur: 0.08, type: "triangle", vol: 0.16 });
      break;
    case "click":
      tone(ac, master, { freq: 720, endFreq: 540, dur: 0.04, type: "triangle", vol: 0.14 });
      break;
    case "confirm":
      tone(ac, master, { freq: 720, at: 0, dur: 0.08, type: "triangle", vol: 0.18 });
      tone(ac, master, { freq: 1080, at: 0.07, dur: 0.12, type: "triangle", vol: 0.18 });
      break;
    case "cancel":
      tone(ac, master, { freq: 400, endFreq: 280, dur: 0.08, type: "sine", vol: 0.14 });
      break;
  }
}

/** Tap-driven haptics. Every pattern is silent if the user disabled it. */
export function haptic(pattern: "tap" | "flag" | "chord" | "win" | "lose" | "press"): void {
  if (!useSettings.getState().haptics) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  const map: Record<string, number | number[]> = {
    tap: 8,
    press: 12,
    flag: 20,
    chord: [12, 30, 25],
    win: [20, 40, 28, 40, 60],
    lose: [60, 50, 120],
  };
  navigator.vibrate(map[pattern]);
}