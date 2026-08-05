// DOM UI layer: intro, wardrobe, conversation card, mic wiring, score screen.
XDH.UI = (function () {
  const $ = (id) => document.getElementById(id);

  // ---- run state ----
  function newRun() {
    const idx = [0, 1, 2].sort(() => Math.random() - 0.5); // randomized resident per house
    XDH.run = {
      pass: XDH.run && XDH.run.pass || '',
      outfit: { shirt: 'none', hat: 'none', item: 'none' },
      houses: idx.map(i => ({ npcIdx: i, won: false, failedOutfits: [] })),
      score: { entered: 0, fastest: Infinity, bestOutfit: '—', maxSuspDelta: -1, maxSuspQuote: '—', maxSuspNpc: '' },
      transcripts: [],
      nightStart: Date.now()
    };
    refreshHud();
  }

  function refreshHud() {
    $('hud-houses').textContent = `${XDH.run.score.entered}/${XDH.RULES.HOUSES_TO_WIN}`;
    $('hud-outfit').textContent = '👕 ' + XDH.outfitLabel(XDH.run.outfit);
  }

  function toast(msg, ms = 3200) {
    const t = $('toast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(() => t.style.display = 'none', ms);
  }

  // ---- wardrobe ----
  function buildWardrobe() {
    ['shirt', 'hat', 'item'].forEach(slot => {
      const box = $('w-' + (slot === 'item' ? 'item' : slot));
      box.innerHTML = '';
      XDH.WARDROBE[slot].forEach(opt => {
        const b = document.createElement('button');
        b.className = 'ward-opt'; b.textContent = opt.label; b.dataset.id = opt.id;
        b.onclick = () => {
          XDH.run.outfit[slot] = opt.id;
          [...box.children].forEach(c => c.classList.toggle('sel', c === b));
          refreshHud();
        };
        if (XDH.run.outfit[slot] === opt.id) b.classList.add('sel');
        box.appendChild(b);
      });
    });
  }
  function openWardrobe() { buildWardrobe(); $('ov-wardrobe').classList.add('show'); }

  // ---- conversation card ----
  let typingAbort = false;

  function openConvo(npc, state) {
    $('npc-name').textContent = npc.name;
    XDH.Portraits.draw($('npc-portrait'), npc, 'neutral');
    $('dialogue').innerHTML = '';
    $('transcript-live').textContent = '';
    $('text-in').value = '';
    setMeters(state);
    setTimer(XDH.RULES.CONVO_SECONDS);
    $('convo').classList.add('show');
    $('stt-hint').textContent = XDH.Speech.supported
      ? 'Giữ nút 🎙️ để nói (tiếng Việt), thả ra để gửi.'
      : 'Trình duyệt này không có mic-to-text — gõ chữ nhé (Chrome thì có 🎙️).';
  }

  function closeConvo() { $('convo').classList.remove('show'); }

  function setMeters(st) {
    $('m-trust').querySelector('.fill').style.width = st.trust + '%';
    $('m-susp').querySelector('.fill').style.width = st.suspicion + '%';
    $('m-pat').querySelector('.fill').style.width = st.patience + '%';
  }

  function setTimer(s) {
    if (s < 0) s = 0;
    $('convo-timer').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    $('convo-timer').style.color = s <= 30 ? 'var(--danger)' : 'var(--dim)';
  }

  function echoPlayer(text) {
    const d = document.createElement('div');
    d.className = 'player-echo'; d.textContent = '🐺 Bạn: ' + text;
    $('dialogue').appendChild(d); $('dialogue').scrollTop = 1e9;
  }

  // Typewriter + Undertale blips. ~28ms/char, blip every 2nd visible char.
  function typeNpcLine(text, emotion, npc) {
    return new Promise(resolve => {
      XDH.Portraits.draw($('npc-portrait'), npc, XDH.EMOTIONS.includes(emotion) ? emotion : 'neutral');
      const line = document.createElement('div');
      line.className = 'npc-line';
      $('dialogue').appendChild(line);
      let i = 0; typingAbort = false;
      const iv = setInterval(() => {
        if (typingAbort || i >= text.length) {
          line.textContent = text; clearInterval(iv);
          $('dialogue').scrollTop = 1e9; resolve(); return;
        }
        line.textContent = text.slice(0, ++i);
        const ch = text[i - 1];
        if (i % 2 === 0 && ch && !' .,!?…'.includes(ch)) XDH.Blips.blip(npc.blipHz, emotion);
        $('dialogue').scrollTop = 1e9;
      }, 28);
      // tap dialogue to skip typing
      line.onclick = () => { typingAbort = true; };
    });
  }

  function setBusy(b) {
    $('btn-send').disabled = b;
    $('btn-mic').disabled = b;
    $('text-in').disabled = b;
  }

  function endConvo(message, won, then) {
    const d = document.createElement('div');
    d.className = 'npc-line';
    d.style.color = won ? 'var(--ok)' : 'var(--danger)';
    d.style.marginTop = '10px'; d.style.fontWeight = '700';
    d.textContent = message;
    $('dialogue').appendChild(d); $('dialogue').scrollTop = 1e9;
    setTimeout(() => { closeConvo(); then && then(); }, 2600);
  }

  // ---- score ----
  function showScore(won) {
    const s = XDH.run.score;
    $('score-title').textContent = won ? '🌕 THẮNG! Ma sói lịch sự nhất xóm!' : '🌅 Trời sáng — chưa đủ 3 nhà…';
    $('score-title').className = 'big-result ' + (won ? 'win' : 'lose');
    const mins = Math.round((Date.now() - XDH.run.nightStart) / 60000);
    $('score-body').innerHTML =
      '<table>' +
      `<tr><td>🏠 Nhà vào được</td><td><b>${s.entered}/${XDH.RULES.HOUSES_TO_WIN}</b></td></tr>` +
      `<tr><td>⚡ Vào nhanh nhất</td><td><b>${s.fastest === Infinity ? '—' : s.fastest + ' giây'}</b></td></tr>` +
      `<tr><td>🎽 Bộ đồ đỉnh nhất</td><td><b>${s.bestOutfit}</b></td></tr>` +
      `<tr><td>😅 Câu bị nghi nhất</td><td><b>"${s.maxSuspQuote}"</b>${s.maxSuspNpc ? ' <span style="color:var(--dim)">(' + s.maxSuspNpc + ' nghe xong muốn báo công an)</span>' : ''}</td></tr>` +
      `<tr><td>🌙 Cả đêm</td><td><b>${mins} phút</b></td></tr>` +
      '</table>' +
      '<p style="color:var(--dim);font-size:12px">Chụp màn hình khoe bạn bè đi 📸</p>';
    $('ov-score').classList.add('show');
  }

  // ---- wiring ----
  function wire() {
    $('btn-start').onclick = () => {
      XDH.run.pass = $('pass-in').value.trim();
      XDH.Blips.unlock();                       // user gesture unlocks WebAudio
      $('ov-intro').classList.remove('show');
    };
    $('btn-wardrobe').onclick = () => { if (!XDH.Convo.isActive()) openWardrobe(); };
    $('btn-ward-done').onclick = () => $('ov-wardrobe').classList.remove('show');
    $('btn-again').onclick = () => { $('ov-score').classList.remove('show'); newRun(); };
    $('btn-leave').onclick = () => XDH.Convo.leave();

    const send = () => {
      const v = $('text-in').value.trim();
      if (v) { $('text-in').value = ''; XDH.Convo.playerSays(v); }
    };
    $('btn-send').onclick = send;
    $('text-in').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

    // Hold-to-talk mic: transcript shows live, released → sent to the NPC.
    const mic = $('btn-mic');
    const startMic = (e) => {
      e.preventDefault();
      if (!XDH.Speech.supported) { toast('Trình duyệt này không hỗ trợ mic-to-text — dùng Chrome, hoặc gõ chữ.'); return; }
      if (XDH.Speech.isListening()) return;
      mic.classList.add('listening');
      $('transcript-live').textContent = '🎙️ đang nghe…';
      XDH.Speech.start({
        onPartial: t => { $('transcript-live').textContent = '🎙️ ' + t; },
        onDone: t => {
          mic.classList.remove('listening');
          $('transcript-live').textContent = '';
          if (t) XDH.Convo.playerSays(t);
          else toast('Không nghe rõ — thử lại hoặc gõ chữ nhé.');
        },
        onError: err => {
          mic.classList.remove('listening');
          $('transcript-live').textContent = '';
          toast(err === 'not-allowed'
            ? 'Micro bị chặn — bấm 🔒 cạnh thanh địa chỉ để cho phép mic.'
            : 'Mic lỗi (' + err + ') — gõ chữ cũng chơi được.');
        }
      });
    };
    const stopMic = () => { if (XDH.Speech.isListening()) XDH.Speech.stop(); };
    mic.addEventListener('pointerdown', startMic);
    mic.addEventListener('pointerup', stopMic);
    mic.addEventListener('pointerleave', stopMic);
  }

  document.addEventListener('DOMContentLoaded', () => { newRun(); wire(); });

  return {
    newRun, refreshHud, toast, openWardrobe,
    openConvo, closeConvo, setMeters, setTimer, echoPlayer,
    typeNpcLine, setBusy, endConvo, showScore
  };
})();
