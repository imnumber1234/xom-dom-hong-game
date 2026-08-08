// DOM UI layer: intro, wardrobe, conversation card, mic wiring, score screen.
XDH.UI = (function () {
  const $ = (id) => document.getElementById(id);

  // ---- run state ----
  function newRun() {
    // §2b: fixed difficulty ladder left→right — Ly ⭐ Dễ · Tí ⭐⭐ Vừa · Cô Sáu ⭐⭐⭐ Khó.
    const idx = [2, 1, 0];
    XDH.run = {
      pass: XDH.run && XDH.run.pass || '',
      outfit: { shirt: 'none', hat: 'none', item: 'none' },
      houses: idx.map(i => ({ npcIdx: i, won: false, failedOutfits: [] })),
      night: 1, enteredTonight: 0, dawnHandled: false,          // §0 #2: 3-night run
      money: 0, inv: { gift: 0, hourglass: 0, hint: 0, wardrobe: 0 },
      score: { entered: 0, fastest: Infinity, bestOutfit: '—', maxSuspDelta: -1, maxSuspQuote: '—', maxSuspNpc: '' },
      transcripts: [],
      nightStart: Date.now(),
      runStart: Date.now()
    };
    refreshHud();
  }

  // Next night: same houses, memories wiped, bigger quota (night N = N houses).
  function newNight(n) {
    const r = XDH.run;
    r.night = n; r.enteredTonight = 0; r.dawnHandled = false;
    r.houses.forEach(h => { h.won = false; h.failedOutfits = []; });
    r.nightStart = Date.now();
    refreshHud();
  }

  function refreshHud() {
    const r = XDH.run;
    $('hud-night').textContent = `🌙 Đêm ${r.night}/${XDH.RULES.NIGHTS} · vào ${r.enteredTonight}/${r.night} nhà`;
    $('hud-money').textContent = `💰 ${r.money}k`;
    $('hud-outfit').textContent = '👕 ' + XDH.outfitLabel(XDH.run.outfit);
  }

  function toast(msg, ms = 3200) {
    const t = $('toast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(() => t.style.display = 'none', ms);
  }

  // ---- avatar mirror (Q-J): live preview + tabs Mặt/Tóc/Da/Đồ + dice ----
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
          drawWolfPreview();
          if (XDH.applyAvatar) XDH.applyAvatar();
        };
        if (XDH.run.outfit[slot] === opt.id) b.classList.add('sel');
        box.appendChild(b);
      });
    });
  }

  let avTab = 'do';
  function buildAvatarMenu() {
    document.querySelectorAll('#av-tabs button').forEach(b => b.classList.toggle('sel', b.dataset.t === avTab));
    const box = $('av-opts');
    box.innerHTML = '';
    if (avTab === 'do') {
      $('av-do-groups').style.display = 'block';
      buildWardrobe();
    } else {
      $('av-do-groups').style.display = 'none';
      XDH.AVATAR[avTab].forEach(o => {
        const b = document.createElement('button');
        b.className = 'ward-opt'; b.textContent = o.label;
        if (XDH.avatar[avTab] === o.id) b.classList.add('sel');
        b.onclick = () => { XDH.avatar[avTab] = o.id; XDH.saveAvatar(); buildAvatarMenu(); };
        box.appendChild(b);
      });
    }
    drawWolfPreview();
  }

  // 16×16 pixel wolf, drawn big — mirrors the in-game sprite (cosmetics + outfit).
  function drawWolfPreview() {
    const c = $('av-preview'); if (!c) return;
    const g = c.getContext('2d');
    const S = 8;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#241e35'; g.fillRect(0, 0, c.width, c.height);
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x * S, y * S, w * S, h * S); };
    const skinOpt = XDH.AVATAR.skin.find(o => o.id === XDH.avatar.skin) || XDH.AVATAR.skin[0];
    const fur = '#' + skinOpt.color.toString(16).padStart(6, '0');
    P(4, 3, 2, 2, fur); P(10, 3, 2, 2, fur);         // ears
    P(4, 5, 8, 8, fur);                              // head
    const hairCol = '#3a3150';
    if (XDH.avatar.hair === 'xu') { P(4, 4, 1, 1, hairCol); P(6, 3, 1, 2, hairCol); P(8, 4, 1, 1, hairCol); P(10, 4, 1, 1, hairCol); }
    else if (XDH.avatar.hair === 'muot') { P(4, 4, 8, 1, hairCol); }
    else { P(7, 1, 2, 4, '#ff5dd2'); }               // mohawk
    if (XDH.avatar.face === 'ngau') { P(4, 7, 8, 2, '#151520'); P(5, 7, 2, 1, '#3fd4d4'); P(9, 7, 2, 1, '#3fd4d4'); }
    else if (XDH.avatar.face === 'lem') { P(5, 7, 2, 2, '#f9e076'); P(9, 8, 2, 1, '#f9e076'); }
    else { P(5, 7, 2, 2, '#f9e076'); P(9, 7, 2, 2, '#f9e076'); }
    P(7, 10, 2, 2, '#5d6275');                       // snout
    const o = XDH.run.outfit;
    P(4, 13, 8, 3, o.shirt === 'grab' ? '#2fae5a' : o.shirt === 'sinhvien' ? '#3f6fe0' : '#e2718f');
    if (o.hat === 'baohiem') { P(3, 4, 10, 2, '#2fae5a'); P(4, 3, 8, 1, '#2fae5a'); }
    else if (o.hat === 'nonla') { P(3, 5, 10, 1, '#d9c07a'); P(5, 4, 6, 1, '#d9c07a'); P(7, 3, 2, 1, '#d9c07a'); }
    if (o.item === 'trasua') { P(13, 12, 2, 3, '#c98f5f'); P(13, 11, 2, 1, '#ffffff'); }
    else if (o.item === 'bo_rau') { P(13, 12, 2, 3, '#2fae5a'); }
  }

  function openWardrobe() { buildAvatarMenu(); $('ov-wardrobe').classList.add('show'); }

  // ---- §2 economy: shop at the bánh mì cart · kill loot · night flow ----
  function openShop() {
    const r = XDH.run;
    $('shop-money').textContent = `💰 Bạn có ${r.money}k`;
    const box = $('shop-items');
    box.innerHTML = '';
    XDH.SHOP.forEach(item => {
      const owned = r.inv[item.id] || 0;
      const b = document.createElement('button');
      b.className = 'shop-item';
      b.innerHTML = `<b>${item.label}</b> <span class="price">${item.price}k</span>` +
        `<span class="desc">${item.desc}${owned ? ` (đang có ×${owned})` : ''}</span>`;
      b.disabled = r.money < item.price;
      b.onclick = () => {
        if (r.money < item.price) return;
        r.money -= item.price;
        r.inv[item.id]++;
        XDH.Blips.jingle('win');
        refreshHud();
        openShop();   // re-render with new balance
      };
      box.appendChild(b);
    });
    $('ov-shop').classList.add('show');
  }

  // Kill loot: flavor VND (rounded 5k) + one random clothing piece. Then night-quota check.
  function afterHouseWon() {
    const r = XDH.run;
    const L = XDH.LOOT;
    const moneyK = 5 * Math.round((L.MIN_K + Math.random() * (L.MAX_K - L.MIN_K)) / 5);
    const slots = ['shirt', 'hat', 'item'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const opts = XDH.WARDROBE[slot].filter(o => o.id !== 'none');
    const piece = opts[Math.floor(Math.random() * opts.length)];
    r.money += moneyK;
    r.enteredTonight++;
    refreshHud();
    $('loot-body').innerHTML =
      `<p style="font-size:15px">Trong nhà bạn "mượn" được:</p>` +
      `<p style="font-size:22px;margin:10px 0">💵 <b>${moneyK}k</b> &nbsp;+&nbsp; 🎽 <b>${piece.label}</b></p>` +
      `<p style="color:var(--dim);font-size:13px">Ghé quầy bánh mì đêm để sắm đồ nghề nha.</p>`;
    $('ov-loot').classList.add('show');
    $('btn-loot-done').onclick = () => {
      $('ov-loot').classList.remove('show');
      if (r.enteredTonight >= r.night) {
        if (r.night >= XDH.RULES.NIGHTS) showScore(true);
        else showNightDone();
      }
    };
  }

  function showNightDone() {
    const r = XDH.run;
    $('night-title').textContent = `🌅 Đêm ${r.night} trọn vẹn!`;
    $('night-body').innerHTML =
      `<p>Đủ ${r.night}/${r.night} nhà trước bình minh. Về hang ngủ một giấc…</p>` +
      `<p><b>Đêm ${r.night + 1}</b> cần vào <b>${r.night + 1} nhà</b> — hàng xóm không nhớ gì đâu, nhưng trời chỉ chờ ${XDH.RULES.NIGHT_MINUTES} phút thôi đó.</p>`;
    $('ov-night').classList.add('show');
    $('btn-night-next').onclick = () => {
      $('ov-night').classList.remove('show');
      newNight(r.night + 1);
    };
  }

  function dawnFail() {
    XDH.Blips.jingle('lose');
    showScore(false);
  }

  // ---- conversation card ----
  let typingAbort = false;

  function openConvo(npc, state) {
    const diff = XDH.DIFFICULTY[npc.id];
    $('npc-name').textContent = (diff ? diff.stars + ' ' : '') + npc.name;
    if (XDH.DEBUG) $('debug-log').innerHTML = '';
    $('meters').style.display = XDH.DEBUG ? 'flex' : 'none';   // §1: numbers hidden — door + bubbles instead
    XDH.Portraits.draw($('npc-portrait'), npc, 'neutral');
    $('dialogue').innerHTML = '';
    $('transcript-live').textContent = '';
    $('text-in').value = '';
    setMeters(state);
    setDoorStage(0);
    setConvoState('listening');
    $('thought-bubble').classList.remove('show');
    setTimer(XDH.RULES.CONVO_SECONDS);
    renderConvoItems();
    $('tut-hint').style.display = 'none';
    $('btn-tut-skip').style.display = 'none';
    $('btn-kill').style.display = 'none';
    $('convo').classList.add('show');
    $('stt-hint').textContent = XDH.Speech.supported
      ? 'Giữ nút 🎙️ để nói (tiếng Việt), thả ra để gửi.'
      : 'Trình duyệt này không có mic-to-text — gõ chữ nhé.';
    // Desktop: put the cursor straight into the chat box (mobile: no keyboard pop-up).
    if (window.matchMedia('(pointer: fine)').matches) setTimeout(() => $('text-in').focus(), 80);
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

  // ---- Undertale-style pacing (§1): emotion speed + punctuation "breathing" ----
  const EMO_SPEED = { angry: 18, interested: 26, amused: 26, neutral: 30, suspicious: 36 };
  const NPC_SPEED = { gen_z: 0.85, sinh_vien: 1.0, me_bim_sua: 1.1 };   // Ly fast, Cô Sáu rambling
  const PUNCT_PAUSE = { ',': 250, ';': 300, '.': 450, '!': 450, '?': 450, '…': 700 };
  XDH.PACING_PRESETS = { nhanh: 0.7, chuan: 1.0, cham: 1.4 };
  let pacingMult = XDH.PACING_PRESETS[localStorage.getItem('xdh_pacing')] || 1.0;
  function setPacing(preset) {
    pacingMult = XDH.PACING_PRESETS[preset] || 1.0;
    localStorage.setItem('xdh_pacing', preset);
  }

  // Emotion → portrait effect (Q-G answer B): shake / lean-in zoom / sweat drop.
  function portraitFx(emotion) {
    const wrap = $('portrait-wrap');
    wrap.className = '';
    $('fx-sweat').style.display = 'none';
    if (emotion === 'angry') wrap.className = 'fx-shake';
    else if (emotion === 'interested' || emotion === 'amused') wrap.className = 'fx-zoom';
    else if (emotion === 'suspicious') $('fx-sweat').style.display = 'block';
  }

  // Core typer — writes into any element so the ?pacing=1 demo reuses it.
  function typeInto(el, text, emotion, npc) {
    return new Promise(resolve => {
      const base = (EMO_SPEED[emotion] || 30) * (NPC_SPEED[npc && npc.id] || 1) * pacingMult;
      let i = 0; typingAbort = false;
      const step = () => {
        if (typingAbort || i >= text.length) {
          el.textContent = text;
          if (el.parentElement) el.parentElement.scrollTop = 1e9;
          resolve(); return;
        }
        el.textContent = text.slice(0, ++i);
        const ch = text[i - 1];
        if (i % 2 === 0 && ch && !' .,!?…'.includes(ch) && npc) XDH.Blips.blip(npc.blipHz, emotion);
        if (el.parentElement) el.parentElement.scrollTop = 1e9;
        const pause = PUNCT_PAUSE[ch] || 0;
        setTimeout(step, base + pause * pacingMult);
      };
      step();
      el.onclick = () => { typingAbort = true; };   // tap to skip
    });
  }

  function typeNpcLine(text, emotion, npc) {
    XDH.Portraits.draw($('npc-portrait'), npc, XDH.EMOTIONS.includes(emotion) ? emotion : 'neutral');
    portraitFx(emotion);
    const line = document.createElement('div');
    line.className = 'npc-line';
    $('dialogue').appendChild(line);
    return typeInto(line, text, emotion, npc);
  }

  // ---- §1 feedback layer: door stages · 💭 bubble · convo-state icon · thinking dots ----
  function setDoorStage(stage) {
    $('door-viz').dataset.stage = stage;
  }

  const STATE_ICONS = {
    listening: ['👂', 'đang nghe'], thinking: ['🤔', 'đang nghĩ'], doubting: ['🤨', 'nghi ngờ'],
    trusting: ['😊', 'đang tin'], rejecting: ['🚪', 'sắp đuổi']
  };
  function setConvoState(state) {
    const s = STATE_ICONS[state] || STATE_ICONS.listening;
    const el = $('convo-state-icon');
    el.textContent = s[0]; el.title = s[1];
  }

  let thoughtTimer;
  function setThought(text) {
    const b = $('thought-bubble');
    b.textContent = '💭 ' + text;
    b.classList.add('show');
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(() => b.classList.remove('show'), 4000);
  }

  // Powerup buttons inside the convo (only items you own show up)
  const ITEM_EMOJI = { gift: '🧋', hourglass: '⏳', hint: '💡', wardrobe: '🎽' };
  function renderConvoItems() {
    const box = $('convo-items');
    box.innerHTML = '';
    const inv = XDH.run.inv || {};
    Object.keys(ITEM_EMOJI).forEach(id => {
      if (!inv[id]) return;
      const b = document.createElement('button');
      b.className = 'btn ghost item-btn';
      b.textContent = `${ITEM_EMOJI[id]}×${inv[id]}`;
      b.title = (XDH.SHOP.find(s => s.id === id) || {}).desc || '';
      b.onclick = () => XDH.Convo.useItem(id);
      box.appendChild(b);
    });
  }

  function showHint(text) {
    $('transcript-live').textContent = '💡 Quân sư: ' + text;
  }

  // §0 #4 — comedic silhouette kill scene: chase passes + comic bursts + a yarn drop.
  function playKillScene() {
    return new Promise(async resolve => {
      const ov = $('ov-kill'), npcEl = $('k-npc'), wolfEl = $('k-wolf'), fx = $('k-fx'), drop = $('k-drop');
      ov.classList.add('show');
      drop.style.top = '-80px';
      const move = (el, fromPct, toPct, ms, flip) => new Promise(r => {
        el.style.transition = 'none';
        el.style.left = fromPct + '%';
        el.style.transform = 'scaleX(' + flip + ')';
        void el.offsetWidth;                       // reflow → restart transition
        el.style.transition = `left ${ms}ms linear`;
        el.style.left = toPct + '%';
        setTimeout(r, ms + 30);
      });
      const burst = (t) => {
        fx.textContent = t;
        fx.classList.remove('pop'); void fx.offsetWidth; fx.classList.add('pop');
        XDH.Blips.blip(180 + Math.random() * 300, 'angry');
      };
      // pass 1: NPC flees left→right, wolf chases
      npcEl.style.display = wolfEl.style.display = 'block';
      burst('SOẠT!');
      await Promise.all([move(npcEl, -15, 105, 950, 1), move(wolfEl, -32, 88, 950, 1)]);
      // pass 2: both dash back right→left, wolf closer
      burst('HẤP!');
      await Promise.all([move(npcEl, 105, -15, 850, -1), move(wolfEl, 118, -4, 850, -1)]);
      // pass 3: the catch — meet in the middle
      burst('BỤP!!');
      await Promise.all([move(npcEl, -15, 46, 500, 1), move(wolfEl, -32, 40, 500, 1)]);
      npcEl.style.display = 'none';
      XDH.Blips.jingle('win');
      // something soft and warm drops where the neighbor stood
      drop.style.top = '68%';
      await new Promise(r => setTimeout(r, 1100));
      ov.classList.remove('show');
      resolve();
    });
  }

  let thinkingEl = null;
  function showThinking(npc) {
    hideThinking();
    XDH.Portraits.draw($('npc-portrait'), npc, 'neutral');
    $('portrait-wrap').className = 'fx-think';
    thinkingEl = document.createElement('div');
    thinkingEl.className = 'npc-line thinking';
    thinkingEl.textContent = '…';
    $('dialogue').appendChild(thinkingEl);
    $('dialogue').scrollTop = 1e9;
    XDH.Blips.blip(220, 'neutral');   // soft "hmm" blip
  }
  function hideThinking() {
    if (thinkingEl) { thinkingEl.remove(); thinkingEl = null; }
    $('portrait-wrap').className = '';
  }

  // §1b tuning overlay — only exists behind ?debug=1
  function debugTurn(info) {
    if (!XDH.DEBUG) return;
    const el = $('debug-log');
    el.style.display = 'block';
    const sign = (n) => (n >= 0 ? '+' : '') + n;
    const s = info.state;
    const row = document.createElement('div');
    row.textContent = `[${info.brain}] ${info.verdict || '—'}${info.contradiction ? ' ⚡mâu-thuẫn' : ''}` +
      ` → tin ${sign(info.dT)} nghi ${sign(info.dS)} hứng ${sign(info.dI)} kiên ${sign(info.dP)}` +
      ` | tin=${s.trust} nghi=${s.suspicion} hứng=${s.interest} kiên=${s.patience}`;
    el.appendChild(row);
    el.scrollTop = 1e9;
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
    const r = XDH.run;
    const s = r.score;
    $('score-title').textContent = won
      ? '🌕 THẮNG CẢ 3 ĐÊM! Ma sói lịch sự nhất xóm!'
      : `🌅 Trời sáng — đêm ${r.night} cần ${r.night} nhà, mới vào được ${r.enteredTonight}…`;
    $('score-title').className = 'big-result ' + (won ? 'win' : 'lose');
    const mins = Math.round((Date.now() - r.runStart) / 60000);
    $('score-body').innerHTML =
      '<table>' +
      `<tr><td>🌙 Đi tới</td><td><b>Đêm ${r.night}/${XDH.RULES.NIGHTS}</b></td></tr>` +
      `<tr><td>🏠 Nhà vào được (cả run)</td><td><b>${s.entered}</b></td></tr>` +
      `<tr><td>💰 Tiền "mượn" được</td><td><b>${r.money}k</b></td></tr>` +
      `<tr><td>⚡ Vào nhanh nhất</td><td><b>${s.fastest === Infinity ? '—' : s.fastest + ' giây'}</b></td></tr>` +
      `<tr><td>🎽 Bộ đồ đỉnh nhất</td><td><b>${s.bestOutfit}</b></td></tr>` +
      `<tr><td>😅 Câu bị nghi nhất</td><td><b>"${s.maxSuspQuote}"</b>${s.maxSuspNpc ? ' <span style="color:var(--dim)">(' + s.maxSuspNpc + ' nghe xong muốn báo công an)</span>' : ''}</td></tr>` +
      `<tr><td>⏰ Tổng thời gian</td><td><b>${mins} phút</b></td></tr>` +
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
      if (!localStorage.getItem('xdh_tut_done')) {
        toast('👵 Mới vô nghề? Ghé nhà Bà Năm ngay giữa xóm học nghề trước nha (miễn phí, bỏ qua được)!', 6500);
      }
    };

    // §0 #10 — language toggle: NPC + thought + STT follow; core UI strings swap too.
    XDH.applyLang = () => {
      const en = XDH.lang === 'en';
      $('lang-vi').classList.toggle('sel', !en);
      $('lang-en').classList.toggle('sel', en);
      $('intro-p1').innerHTML = en
        ? "<b>You are a very polite werewolf.</b> The moon is full, but this neighborhood has ONE rule: <b>you can only enter a house if you're INVITED in</b>. Dress up, knock, and <b>TALK</b> your way through the door. Night 1 = 1 house, night 2 = 2, night 3 = 3 — all before sunrise."
        : "<b>Bạn là một con ma sói lịch sự.</b> Trăng tròn rồi, nhưng khổ nỗi… luật xóm này là <b>phải được MỜI thì mới vào nhà được</b>. Hoá trang, gõ cửa, và <b>NÓI</b> để dụ hàng xóm mời bạn vào. Đêm 1 vào 1 nhà, đêm 2 vào 2, đêm 3 vào 3 — trước khi trời sáng.";
      $('intro-p2').textContent = en
        ? '🎙️ Allow the microphone when the browser asks. Hold the mic button, speak, release to send. No mic? Typing works too.'
        : '🎙️ Cho phép micro khi trình duyệt hỏi. Nói xong thả nút mic — chữ hiện lên rồi gửi cho hàng xóm. Không có mic? Gõ chữ cũng được.';
      $('btn-start').textContent = en ? 'Start the full-moon night 🌕' : 'Bắt đầu đêm trăng tròn 🌕';
      $('text-in').placeholder = en ? '…or type your lie and press Enter' : '…hoặc gõ lời nói dối của bạn rồi Enter';
      $('btn-leave').textContent = en ? '🚪 Walk away' : '🚪 Rút lui';
    };
    $('lang-vi').onclick = () => XDH.setLang('vi');
    $('lang-en').onclick = () => XDH.setLang('en');
    XDH.applyLang();

    // Avatar tabs + dice
    document.querySelectorAll('#av-tabs button').forEach(b => {
      b.onclick = () => { avTab = b.dataset.t; buildAvatarMenu(); };
    });
    $('btn-av-dice').onclick = () => {
      const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
      XDH.avatar.face = rnd(XDH.AVATAR.face);
      XDH.avatar.hair = rnd(XDH.AVATAR.hair);
      XDH.avatar.skin = rnd(XDH.AVATAR.skin);
      XDH.run.outfit.shirt = rnd(XDH.WARDROBE.shirt);
      XDH.run.outfit.hat = rnd(XDH.WARDROBE.hat);
      XDH.run.outfit.item = rnd(XDH.WARDROBE.item);
      XDH.saveAvatar();
      refreshHud();
      buildAvatarMenu();
    };
    $('btn-wardrobe').onclick = () => { if (!XDH.Convo.isActive()) openWardrobe(); };
    $('btn-ward-done').onclick = () => $('ov-wardrobe').classList.remove('show');
    $('btn-shop-done').onclick = () => $('ov-shop').classList.remove('show');
    $('btn-again').onclick = () => { $('ov-score').classList.remove('show'); newRun(); };
    $('btn-leave').onclick = () => (XDH.Tut && XDH.Tut.isActive()) ? XDH.Tut.end() : XDH.Convo.leave();
    $('btn-tut-skip').onclick = () => XDH.Tut.end();
    $('btn-kill').onclick = () => XDH.Tut.isActive() ? XDH.Tut.kill() : XDH.Convo.kill();

    const route = (v) => (XDH.Tut && XDH.Tut.isActive()) ? XDH.Tut.playerSays(v) : XDH.Convo.playerSays(v);
    const send = () => {
      const v = $('text-in').value.trim();
      if (v) { $('text-in').value = ''; route(v); }
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
          if (t) route(t);
          else toast('Không nghe rõ — thử lại hoặc gõ chữ nhé.');
        },
        onError: err => {
          mic.classList.remove('listening');
          $('transcript-live').textContent = '';
          toast(err === 'not-allowed'
            ? 'Micro bị chặn — bấm 🔒 cạnh thanh địa chỉ để cho phép mic.'
            : err === 'fallback'
              ? 'Trình duyệt này không có mic Google — đã chuyển sang mic dự phòng. Giữ nút 🎙️ nói lại nhé!'
              : 'Mic lỗi (' + err + ') — gõ chữ cũng chơi được.');
        }
      });
    };
    const stopMic = () => { if (XDH.Speech.isListening()) XDH.Speech.stop(); };
    mic.addEventListener('pointerdown', startMic);
    mic.addEventListener('pointerup', stopMic);
    mic.addEventListener('pointerleave', stopMic);

    // ?pacing=1 — Lucas feel-tests 3 presets (Q-F), pick is saved for every future session.
    if (/[?&]pacing=1/.test(location.search)) {
      const SAMPLE = 'Trời đất ơi… chú em nói vậy nghe cũng hợp lý à nha, mà khoan, để cô nghĩ xíu đã. Thiệt hông đó? Cô hỏi thiệt á!';
      $('ov-intro').classList.remove('show');
      $('ov-pacing').classList.add('show');
      let chosen = localStorage.getItem('xdh_pacing') || 'chuan';
      document.querySelectorAll('#pacing-opts button').forEach(b => {
        if (b.dataset.p === chosen) b.classList.add('sel');
        b.onclick = async () => {
          chosen = b.dataset.p;
          setPacing(chosen);
          document.querySelectorAll('#pacing-opts button').forEach(c => c.classList.toggle('sel', c === b));
          XDH.Blips.unlock();
          typingAbort = true;
          await new Promise(r => setTimeout(r, 80));
          const demo = $('pacing-demo');
          demo.textContent = '';
          typeInto(demo, SAMPLE, 'neutral', { id: 'me_bim_sua', blipHz: 520 });
        };
      });
      $('btn-pacing-done').onclick = () => {
        setPacing(chosen);
        typingAbort = true;
        $('ov-pacing').classList.remove('show');
        $('ov-intro').classList.add('show');
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => { newRun(); wire(); });

  return {
    newRun, newNight, refreshHud, toast, openWardrobe, openShop,
    afterHouseWon, showNightDone, dawnFail, renderConvoItems, showHint, playKillScene,
    openConvo, closeConvo, setMeters, setTimer, echoPlayer,
    typeNpcLine, setBusy, endConvo, showScore, debugTurn,
    setDoorStage, setConvoState, setThought, showThinking, hideThinking
  };
})();
