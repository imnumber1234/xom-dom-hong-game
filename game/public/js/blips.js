// Undertale-style text blips — WebAudio square wave, one blip per typed character.
// Per-NPC pitch = free characterization (Lucas locked: NO TTS voice).
XDH.Blips = (function () {
  let ctx = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One short blip. hz = NPC base pitch, slight random wobble so it sounds "spoken".
  function blip(hz, emotion) {
    const c = ensureCtx();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    let f = hz * (0.94 + Math.random() * 0.12);
    if (emotion === 'angry') f *= 0.8;         // growlier
    if (emotion === 'amused') f *= 1.12;       // chirpier
    if (emotion === 'suspicious') f *= 0.9;
    osc.type = 'square';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.055, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Little jingles for door open / fail — still chip-tune, no assets.
  function jingle(kind) {
    const c = ensureCtx();
    if (!c) return;
    const notes = kind === 'win' ? [523, 659, 784, 1047]
      : kind === 'lose' ? [392, 330, 262, 196]
      : [440, 554];
    notes.forEach((f, i) => {
      const t = c.currentTime + i * 0.12;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + 0.12);
    });
  }

  return { blip, jingle, unlock: ensureCtx };
})();
