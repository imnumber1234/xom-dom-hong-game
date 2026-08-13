// v0.9 — nhạc nền + nhạc rượt (file Lucas đưa 2026-08-12). Bài nào cũng LẶP.
// Trình duyệt chỉ cho phát tiếng SAU cú bấm đầu tiên → play() luôn gọi từ onclick.
// Nút 🔊/🔇 trên HUD, nhớ lựa chọn bằng localStorage xdh_muted.
XDH.Music = (function () {
  const tracks = {
    nen:  { src: 'assets/audio/nen-xom.mp3',      vol: 0.32 },  // nền xóm (cả 2 chế độ)
    ruot: { src: 'assets/audio/ruot-cong-an.mp3', vol: 0.5  }   // bị công an dí
  };
  let cur = null;
  let muted = localStorage.getItem('xdh_muted') === '1';

  function el(name) {
    const t = tracks[name];
    if (!t) return null;
    if (!t.audio) {
      t.audio = new Audio(t.src);
      t.audio.loop = true;
      t.audio.volume = t.vol;
    }
    return t.audio;
  }
  function play(name) {
    if (cur === name) { if (!muted) { const a = el(name); a && a.play().catch(() => {}); } return; }
    stopAll();
    cur = name;
    if (muted) return;
    const a = el(name);
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }   // bị chặn autoplay thì im lặng, không vỡ game
  }
  function stopAll() {
    Object.values(tracks).forEach(t => { if (t.audio) t.audio.pause(); });
    cur = null;
  }
  function setMuted(m) {
    muted = m;
    localStorage.setItem('xdh_muted', m ? '1' : '0');
    if (m) Object.values(tracks).forEach(t => t.audio && t.audio.pause());
    else if (cur) { const a = el(cur); a && a.play().catch(() => {}); }
    const b = document.getElementById('btn-mute');
    if (b) b.textContent = m ? '🔇' : '🔊';
  }
  function toggle() { setMuted(!muted); }
  function isMuted() { return muted; }

  return { play, stopAll, toggle, isMuted, setMuted };
})();
