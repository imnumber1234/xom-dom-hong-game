// DOM UI layer: intro, wardrobe, conversation card, mic wiring, score screen.
XDH.UI = (function () {
  const $ = (id) => document.getElementById(id);

  // ---- run state ----
  function newRun(mode) {
    // §2b: fixed difficulty ladder left→right — Ly ⭐ Dễ · Tí ⭐⭐ Vừa · Cô Sáu ⭐⭐⭐ Khó.
    const idx = [2, 1, 0];
    XDH.run = {
      mode: mode || (XDH.run && XDH.run.mode) || 'ma_soi',      // v0.3 B1: 🐺 ma sói · 🙇 kẹt tiền
      pass: XDH.run && XDH.run.pass || '',
      outfit: { shirt: 'none', hat: 'none', item: 'none' },
      // v0.6 F3.1: tủ đồ KHOÁ — chỉ có đồ thường lúc mở màn, còn lại mở dần từ loot.
      unlocked: { shirt: [], hat: [], item: [] },
      houses: idx.map(i => ({ npcIdx: i, won: false, failedOutfits: [] })),
      night: 1, enteredTonight: 0, dawnHandled: false, policeCaught: false,          // §0 #2: 3-night run
      money: 0, inv: { gift: 0, hourglass: 0, hint: 0, wardrobe: 0 },
      score: { entered: 0, fastest: Infinity, bestOutfit: '—', maxSuspDelta: -1, maxSuspQuote: '—', maxSuspNpc: '' },
      transcripts: [],
      nightStart: Date.now(),
      runStart: Date.now()
    };
    // v0.6 F3.1 Q4 = A: tặng sẵn 1 món ngẫu nhiên ngay đêm/ngày 1 — không ai bắt đầu tay trắng.
    for (let i = 0; i < XDH.WARDROBE_LOCK.NIGHT1_FREE; i++) XDH.unlockRandomPiece();
    if (XDH.isKetTien()) XDH.KetTien.startDay(1);               // bốc món ăn hôm nay + reset ngày
    refreshHud();
  }

  // Next night: same houses, conversations wiped but the ledger persists (v0.4), night N = N houses.
  function newNight(n) {
    const r = XDH.run;
    // v0.4 T5: TRƯỚC khi xoá, nén sổ tai tiếng thành trí nhớ từng nhà (hội thoại vẫn xoá tươi).
    if (XDH.Convo && XDH.Convo.compressNightMemory) XDH.Convo.compressNightMemory();
    r.night = n; r.enteredTonight = 0; r.dawnHandled = false;
    r.houses.forEach(h => { h.won = false; h.failedOutfits = []; h.saved = null; });   // đêm mới = hội thoại quên, SỔ thì nhớ
    r.nightStart = Date.now();
    refreshHud();
  }

  function refreshHud() {
    const r = XDH.run;
    const en = XDH.lang === 'en';
    if (XDH.isKetTien()) {
      // B4: mục tiêu bữa ăn + ví tiền thay cho hạn ngạch đêm
      $('hud-night').textContent = en
        ? `☀️ Day ${r.night} · ${r.knocked} doors knocked`
        : `☀️ Ngày ${r.night} · đã gõ ${r.knocked} nhà`;
      $('hud-money').textContent = `💰 ${r.money}k` + (r.food ? ` + 🍙 ${r.food}k` : '');
      const left = XDH.KetTien.needLeft();
      $('hud-meal').style.display = 'block';
      $('hud-meal').textContent = left > 0
        ? `🎯 ${XDH.KetTien.mealLabel()} ${r.meal.price}k · ${en ? 'short' : 'thiếu'} ${left}k`
        : `🎯 ${XDH.KetTien.mealLabel()} · ${en ? 'ENOUGH — go eat!' : 'ĐỦ RỒI — ra xe bánh mì ăn!'}`;
    } else {
      $('hud-night').textContent = `🌙 Đêm ${r.night}/${XDH.RULES.NIGHTS} · vào ${r.enteredTonight}/${r.night} nhà`;
      $('hud-money').textContent = `💰 ${r.money}k`;
      $('hud-meal').style.display = 'none';
    }
    $('hud-outfit').textContent = '👕 ' + XDH.outfitLabel(XDH.run.outfit);
  }

  function toast(msg, ms = 3200) {
    const t = $('toast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(() => t.style.display = 'none', ms);
  }

  // ---- v0.6.1 G1: cảnh báo trình duyệt nhúng (Zalo/Facebook…) ----
  function wvTxt() { return XDH.WEBVIEW_TXT[XDH.lang === 'en' ? 'en' : 'vi']; }
  function applyWebviewWarn() {
    if (!XDH.IN_APP) return;
    const t = wvTxt();
    $('wv-line1').innerHTML = t.warn(XDH.IN_APP);
    $('wv-line2').innerHTML = t.how;
    $('btn-copy-link').textContent = t.copy;
    $('webview-warn').classList.add('show');
    document.body.classList.add('has-webview-warn');
  }
  // Chép link để dán sang Chrome. Webview hay chặn clipboard API → có đường lùi cũ kỹ mà chắc ăn.
  function copyLink() {
    const url = location.href;
    const done = () => { $('btn-copy-link').textContent = wvTxt().copied; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(legacyCopy);
    } else legacyCopy();
    function legacyCopy() {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); }
      catch (_) { toast(url, 8000); }                 // cùng lắm thì hiện link ra cho chép tay
      ta.remove();
    }
  }
  // Câu nhắc mic ở khung nói chuyện — trong app thì nói thẳng là mic không chạy.
  function sttHintText() {
    if (XDH.IN_APP) return wvTxt().sttHint;
    if (!XDH.Speech.supported) return XDH.lang === 'en'
      ? 'This browser has no speech-to-text — just type.'
      : 'Trình duyệt này không có mic-to-text — gõ chữ nhé.';
    return XDH.lang === 'en'
      ? 'Hold 🎙️ to speak, release to send.'
      : 'Giữ nút 🎙️ để nói (tiếng Việt), thả ra để gửi.';
  }

  // ---- avatar mirror (Q-J): live preview + tabs Mặt/Tóc/Da/Đồ + dice ----
  function buildWardrobe() {
    ['shirt', 'hat', 'item'].forEach(slot => {
      const box = $('w-' + (slot === 'item' ? 'item' : slot));
      box.innerHTML = '';
      XDH.WARDROBE[slot].forEach(opt => {
        const b = document.createElement('button');
        const open = XDH.isUnlocked(slot, opt.id);          // v0.6 F3.1: chưa loot ra thì còn khoá
        b.className = 'ward-opt' + (open ? '' : ' locked');
        b.textContent = open ? opt.label : '🔒 ' + opt.label;
        b.dataset.id = opt.id;
        b.disabled = !open;
        if (!open) b.title = XDH.lang === 'en'
          ? 'Locked — loot it from a house first.'
          : 'Chưa mở — vào được một nhà thì mới lượm được món này.';
        b.onclick = () => {
          if (!open) return;
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
    // v0.6 F3.3 — ba món "giấy tờ": thẻ nhựa xanh · tờ đơn trắng · tờ in ảnh tin nhắn
    else if (o.item === 'thesv') { P(13, 12, 3, 2, '#3f6fe0'); P(14, 12, 1, 1, '#ffffff'); }
    else if (o.item === 'donhang') { P(13, 11, 3, 4, '#f2ecff'); P(14, 12, 1, 2, '#8a8fa8'); }
    else if (o.item === 'tinnhan') { P(13, 11, 3, 4, '#ffffff'); P(13, 12, 3, 1, '#5dffa4'); }
  }

  function openWardrobe() { buildAvatarMenu(); $('ov-wardrobe').classList.add('show'); }

  // ---- §2 economy: shop at the bánh mì cart · kill loot · night flow ----
  function openShop() {
    const r = XDH.run;
    const en = XDH.lang === 'en';
    $('shop-money').textContent = en ? `💰 You have ${r.money}k` : `💰 Bạn có ${r.money}k`;
    const box = $('shop-items');
    box.innerHTML = '';

    // v0.3 B4 — trong mode Kẹt Tiền, xe bánh mì CHÍNH LÀ quán ăn: mua bữa = thắng ngày.
    if (XDH.isKetTien()) {
      const pay = XDH.KetTien.priceLeft();
      const m = document.createElement('button');
      m.className = 'shop-item';
      m.style.borderColor = XDH.KetTien.canEat() ? 'var(--ok)' : 'var(--line)';
      m.innerHTML = `<b>${XDH.KetTien.mealLabel()}</b> <span class="price">${pay}k</span>` +
        `<span class="desc">${r.food ? (en ? `Food you begged covers ${r.food}k. ` : `Đồ ăn xin được đỡ ${r.food}k. `) : ''}` +
        (XDH.KetTien.canEat()
          ? (en ? 'Eat now → you win the day 🎉' : 'Ăn ngay → thắng ngày hôm nay 🎉')
          : (en ? `You are ${XDH.KetTien.needLeft()}k short — go knock on more doors.` : `Còn thiếu ${XDH.KetTien.needLeft()}k — đi gõ thêm cửa đi.`)) + '</span>';
      m.disabled = !XDH.KetTien.canEat();
      m.onclick = () => {
        if (!XDH.KetTien.eat()) return;
        XDH.Blips.jingle('win');
        $('ov-shop').classList.remove('show');
        refreshHud();
        XDH.KetTien.showBoard(true);
      };
      box.appendChild(m);
    }

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
    $('ov-shop').querySelector('h2').textContent = XDH.isKetTien()
      ? (en ? '🍞 Night bánh mì cart — food + gear' : '🍞 Xe bánh mì đêm — quán ăn + đồ nghề')
      : (en ? '🍞 Night bánh mì cart — werewolf gear' : '🍞 Bánh mì đêm — đồ nghề ma sói');
    $('ov-shop').classList.add('show');
  }

  // Kill loot: flavor VND (rounded 5k) + one random clothing piece. Then night-quota check.
  function afterHouseWon() {
    const r = XDH.run;
    const L = XDH.LOOT;
    let moneyK = 5 * Math.round((L.MIN_K + Math.random() * (L.MAX_K - L.MIN_K)) / 5);
    // v0.6 F3.1 — loot giờ MỞ THẬT một món chưa có (không còn là chữ suông).
    // Mở hết đồ rồi thì đền bằng tiền, không bao giờ tặng trùng món đã có.
    const got = XDH.unlockRandomPiece();
    if (!got) moneyK += XDH.WARDROBE_LOCK.LOOT_MONEY_IF_FULL_K;
    r.money += moneyK;
    r.enteredTonight++;
    refreshHud();
    const en = XDH.lang === 'en';
    $('loot-body').innerHTML =
      `<p style="font-size:15px">${en ? 'Inside the house you "borrowed":' : 'Trong nhà bạn "mượn" được:'}</p>` +
      `<p style="font-size:22px;margin:10px 0">💵 <b>${moneyK}k</b>` +
      (got ? ` &nbsp;+&nbsp; 🎽 <b>${got.opt.label}</b> <span style="color:var(--ok);font-size:14px">${en ? '— NEW, unlocked in your wardrobe!' : '— MỚI, mở khoá trong tủ đồ!'}</span>` : '') +
      `</p>` +
      (got ? `<p style="color:var(--dim);font-size:13px">${en ? 'Try it on: ' : 'Mặc thử coi: '}<i>${got.opt.desc}</i></p>` : '') +
      `<p style="color:var(--dim);font-size:13px">${en ? 'Hit the bánh mì cart for gear.' : 'Ghé quầy bánh mì đêm để sắm đồ nghề nha.'}</p>`;
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
    const en = XDH.lang === 'en';
    $('night-title').textContent = en ? `🌅 Night ${r.night} complete!` : `🌅 Đêm ${r.night} trọn vẹn!`;
    // v0.4 T7: xóm bây giờ NHỚ qua đêm — hết thời "quên sạch", đổi lời cho khớp luật mới
    $('night-body').innerHTML = en
      ? `<p>All ${r.night}/${r.night} houses before dawn. Back to the den for a nap…</p>` +
        `<p><b>Night ${r.night + 1}</b> needs <b>${r.night + 1} houses</b> — and careful: the neighbourhood REMEMBERS you now. Old houses recall your story, bad rumours carry over, and the sky only waits ${XDH.RULES.NIGHT_MINUTES} minutes.</p>`
      : `<p>Đủ ${r.night}/${r.night} nhà trước bình minh. Về hang ngủ một giấc…</p>` +
        `<p><b>Đêm ${r.night + 1}</b> cần vào <b>${r.night + 1} nhà</b> — mà coi chừng: xóm NHỚ đó nha. Nhà cũ nhớ chuyện bạn kể, chuyện xấu còn bị đồn tiếp, trời thì chỉ chờ ${XDH.RULES.NIGHT_MINUTES} phút thôi.</p>`;
    $('ov-night').classList.add('show');
    $('btn-night-next').onclick = () => {
      $('ov-night').classList.remove('show');
      newNight(r.night + 1);
    };
  }

  function dawnFail() {
    XDH.Blips.jingle('lose');
    if (XDH.isKetTien()) { XDH.KetTien.showBoard(false); return; }   // hoàng hôn = hết ngày, chưa được ăn
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
    clearNums();                                    // v0.6 F1: cuộc mới, popup cũ không được sót lại
    setTimer(XDH.RULES.CONVO_SECONDS);
    renderConvoItems();
    renderOpeners();
    $('tut-hint').style.display = 'none';
    $('btn-tut-skip').style.display = 'none';
    $('btn-kill').style.display = 'none';
    $('convo').classList.add('show');
    $('stt-hint').textContent = sttHintText();   // v0.6.1 G1: trong Zalo thì nói thẳng là mic không chạy
    $('convo-lang').textContent = XDH.lang === 'en' ? '🇬🇧 EN' : '🇻🇳 VN';
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
  const EMO_SPEED = { angry: 18, interested: 26, amused: 26, neutral: 30, suspicious: 36,
    // v0.6 F4 — nhịp gõ chữ theo cảm xúc mới: chán thì lê thê, phấn khích thì bắn liên thanh
    chan: 44, nguong: 34, cam_dong: 34, phan_khich: 17, buc_minh: 20 };
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
    if (emotion === 'angry' || emotion === 'buc_minh') wrap.className = 'fx-shake';
    else if (emotion === 'interested' || emotion === 'amused' || emotion === 'cam_dong') wrap.className = 'fx-zoom';
    else if (emotion === 'phan_khich') wrap.className = 'fx-bounce';      // v0.6 F4
    else if (emotion === 'chan') wrap.className = 'fx-droop';             // v0.6 F4 — người rũ xuống
    else if (emotion === 'nguong') wrap.className = 'fx-turn';            // v0.6 F4 — quay mặt đi
    else if (emotion === 'suspicious') $('fx-sweat').style.display = 'block';
    if (emotion === 'nguong') $('fx-sweat').style.display = 'block';
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

  // ---- v0.6 F1: popup số BAY (§1). CODE gọi hàm này với ĐÚNG con số vừa cộng thật ----
  // Không tính lại gì ở đây — chỉ vẽ. Sai một chữ số là mất lòng tin ngay (rủi ro §3).
  function floatNums(items) {
    if (XDH.NONUM) return;                      // ?nonum=1 → tắt sạch, game chạy y nguyên
    const box = $('numpop');
    if (!box || !items || !items.length) return;
    items.filter(Boolean).slice(0, XDH.POP.MAX_STACK).forEach((it, k) => {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'np ' + (it.cls || 'good');
        d.textContent = it.text;
        box.appendChild(d);
        setTimeout(() => d.remove(), XDH.POP.LIFE_MS + 500);
      }, k * XDH.POP.STAGGER_MS);
    });
  }
  function clearNums() { const b = $('numpop'); if (b) b.innerHTML = ''; }

  // v0.6 F2 — vẽ meme mà CODE đã chọn. Hàm này KHÔNG chọn gì cả, chỉ hiện.
  function showMeme(meme) {
    if (!meme) return;
    const img = document.createElement('img');
    img.className = 'meme';
    img.src = XDH.MEME_CFG.DIR + meme.file;
    img.alt = meme.meaning;
    img.title = meme.meaning;
    img.loading = 'lazy';
    $('dialogue').appendChild(img);
    $('dialogue').scrollTop = 1e9;
  }

  // "+16 tin · −4 nghi" — dựng chuỗi từ CON SỐ THẬT truyền vào, song ngữ.
  function popDeltas(d) {
    const en = XDH.lang === 'en';
    const S = XDH.POP_STAT;
    const bit = (v, key) => v ? ((v > 0 ? '+' : '−') + Math.abs(v) + ' ' + (en ? S[key].en : S[key].vi)) : '';
    // Theo bảng §1: tin/nghi là dòng chính; hai chỉ số phụ chỉ hiện khi cả tin lẫn nghi đều 0.
    let parts = [bit(d.trust, 'trust'), bit(d.suspicion, 'suspicion')].filter(Boolean);
    if (!parts.length) parts = [bit(d.interest, 'interest'), bit(d.patience, 'patience')].filter(Boolean);
    return parts.join(' · ');
  }

  let thoughtTimer;
  function setThought(text) {
    const b = $('thought-bubble');
    b.textContent = '💭 ' + text;
    b.classList.add('show');
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(() => b.classList.remove('show'), 4000);
  }

  // v0.6 F5.2 — dòng tiếc nuối sau khi thua. CODE đưa câu vào; câu này lấy từ điểm yếu
  // ĐÃ ĐỊNH SẴN trong thẻ nhân vật (XDH.REGRET) — không có chỗ nào cho AI bịa.
  let regretTimer;
  function showRegret(text) {
    if (!text) return;
    const r = $('regret');
    r.textContent = '💭 ' + text;
    r.classList.add('show');
    clearTimeout(regretTimer);
    regretTimer = setTimeout(() => r.classList.remove('show'), XDH.FEEL.REGRET_MS);
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

  // Q-B4 — 3 câu mở gợi ý: ô chữ trắng tinh là chỗ người mới bỏ cuộc nhiều nhất.
  // Chỉ mode Kẹt Tiền, chỉ ngày 1, chỉ 2 nhà đầu — sau đó tắt hẳn.
  function renderOpeners() {
    const box = $('openers');
    box.innerHTML = '';
    box.classList.remove('show');
    if (!XDH.isKetTien() || !XDH.KetTien.showOpeners()) return;
    const en = XDH.lang === 'en';
    const title = document.createElement('div');
    title.className = 'op-title';
    title.textContent = en ? 'Not sure what to say? Try one:' : 'Chưa biết nói gì? Bấm thử một câu:';
    box.appendChild(title);
    (XDH.OPENERS[en ? 'en' : 'vi']).forEach(line => {
      const b = document.createElement('button');
      b.className = 'op'; b.textContent = '“' + line + '”';
      b.onclick = () => { box.classList.remove('show'); XDH.Convo.playerSays(line); };
      box.appendChild(b);
    });
    box.classList.add('show');
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
      `${info.corroboration ? ' 🧾chống-lưng' : ''}` +
      ` → tin ${sign(info.dT)} nghi ${sign(info.dS)} hứng ${sign(info.dI)} kiên ${sign(info.dP)}` +
      (info.extra ? ` [${info.extra}]` : '') +
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
      : r.policeCaught
        ? '🚔 BỊ CÔNG AN TÓM giữa xóm — đêm nay coi như xong…'
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
  // v0.3 B1 — chế độ chọn ở màn hình đầu. Cùng bộ não hội thoại, khác điều kiện thắng.
  let pickedMode = localStorage.getItem('xdh_mode') || 'ma_soi';

  // v0.6.1 G3 — màn đầu: MỘT câu móc + BA gạch đầu dòng. Hết.
  // Bỏ khỏi đây: hết giờ lúc nào · đêm 1 vào mấy nhà · luật xóm. Thanh trạng thái đã hiện rồi.
  // Cấm nhắc: lòng tin · nghi ngờ · điểm · tính cách NPC · bí mật · chiến thuật quần áo.
  const INTRO_COPY = {
    ket_tien: {
      vi: { hook: 'Bạn đang hết tiền.',
            steps: ['Đi gõ cửa xin tiền.', 'Nói chuyện để thuyết phục họ.', 'Kiếm đủ tiền mua đồ ăn.'] },
      en: { hook: "You're out of money.",
            steps: ['Knock on doors and ask.', 'Talk them into helping you.', 'Get enough for a meal.'] }
    },
    ma_soi: {
      vi: { hook: 'Bạn là ma sói, và ma sói không tự vào nhà được.',
            steps: ['Hoá trang rồi đi gõ cửa.', 'Nói chuyện để họ MỜI bạn vào.', 'Vào đủ số nhà trước khi trời sáng.'] },
      en: { hook: 'You are a werewolf, and a werewolf cannot walk in uninvited.',
            steps: ['Dress up, then knock.', 'Talk until they INVITE you in.', 'Get inside enough houses before sunrise.'] }
    }
  };

  function applyModeIntro() {
    const en = XDH.lang === 'en';
    const kt = pickedMode === 'ket_tien';
    document.querySelectorAll('#mode-pick button').forEach(b => b.classList.toggle('sel', b.dataset.m === pickedMode));
    const c = INTRO_COPY[kt ? 'ket_tien' : 'ma_soi'][en ? 'en' : 'vi'];
    $('intro-p1').innerHTML =
      `<span style="display:block;font-size:17px;color:var(--ink);font-style:italic;margin-bottom:10px">${c.hook}</span>` +
      c.steps.map(s => `<span style="display:block;font-size:16px;color:var(--ink);margin:5px 0">· ${s}</span>`).join('');
    $('btn-start').textContent = en ? 'START ▶' : 'BẮT ĐẦU ▶';
  }

  function wire() {
    // v0.6.1 G1 — dải băng "đang mở trong Zalo" + nút chép link
    applyWebviewWarn();
    $('btn-copy-link').onclick = copyLink;

    // v0.6.1 G2 — chọn ngôn ngữ là BƯỚC ĐẦU TIÊN. Đã chọn rồi thì lần sau không hỏi lại.
    const pickLang = (l) => {
      XDH.setLang(l);
      localStorage.setItem('xdh_lang_picked', '1');
      $('ov-lang').classList.remove('show');
    };
    $('pick-vi').onclick = () => pickLang('vi');
    $('pick-en').onclick = () => pickLang('en');
    if (!localStorage.getItem('xdh_lang_picked')) $('ov-lang').classList.add('show');

    // Nút đổi ngôn ngữ trong lúc nói chuyện (cả 2 chế độ) — bấm là lật qua lại
    $('convo-lang').onclick = () => {
      XDH.setLang(XDH.lang === 'en' ? 'vi' : 'en');
      $('stt-hint').textContent = sttHintText();
      toast(XDH.lang === 'en' ? '🇬🇧 English — the neighbours will answer in English from now on.'
                              : '🇻🇳 Tiếng Việt — hàng xóm sẽ trả lời bằng tiếng Việt từ giờ.');
    };

    document.querySelectorAll('#mode-pick button').forEach(b => {
      b.onclick = () => {
        pickedMode = b.dataset.m;
        localStorage.setItem('xdh_mode', pickedMode);
        applyModeIntro();
      };
    });

    $('btn-start').onclick = () => {
      const pass = $('pass-in').value.trim();
      newRun(pickedMode);                       // chốt chế độ + bốc bữa ăn nếu là Kẹt Tiền
      XDH.run.pass = pass;
      XDH.Blips.unlock();                       // user gesture unlocks WebAudio
      if (XDH.restartScene) XDH.restartScene();  // dựng lại xóm theo chế độ vừa chọn
      $('ov-intro').classList.remove('show');
      if (XDH.isKetTien()) {
        toast(XDH.lang === 'en'
          ? `☀️ Day 1: you need ${XDH.KetTien.mealLabel()} — ${XDH.run.meal.price}k before sunset.`
          : `☀️ Ngày 1: hôm nay cần ${XDH.KetTien.mealLabel()} — ${XDH.run.meal.price}k, trước khi mặt trời lặn.`, 6500);
      } else if (!localStorage.getItem('xdh_tut_done')) {
        toast('👵 Mới vô nghề? Ghé nhà Bà Năm ngay giữa xóm học nghề trước nha (miễn phí, bỏ qua được)!', 6500);
      }
    };

    $('btn-board-save').onclick = () => XDH.KetTien.saveCard();
    $('btn-board-quit').onclick = () => {
      $('ov-board').classList.remove('show');
      newRun(pickedMode);
      $('ov-intro').classList.add('show');
    };

    // §0 #10 — language toggle: NPC + thought + STT follow; core UI strings swap too.
    XDH.applyLang = () => {
      const en = XDH.lang === 'en';
      $('lang-vi').classList.toggle('sel', !en);
      $('lang-en').classList.toggle('sel', en);
      // v0.6.1 G3: một dòng thôi — màn đầu không phải chỗ giảng bài
      $('intro-p2').textContent = en
        ? '🎙️ Hold the mic button to speak — or just type.'
        : '🎙️ Giữ nút mic để nói — hoặc gõ chữ cũng được.';
      $('convo-lang').textContent = en ? '🇬🇧 EN' : '🇻🇳 VN';   // G2: nút đổi ngôn ngữ trong hội thoại
      applyWebviewWarn();                                        // G1: dải băng đổi theo ngôn ngữ
      document.querySelectorAll('#mode-pick button').forEach(b => {
        const m = XDH.MODES[b.dataset.m];
        b.innerHTML = `${m.emoji} <b>${en ? m.name_en : m.name}</b>`;
      });
      $('text-in').placeholder = en ? '…or type your lie and press Enter' : '…hoặc gõ lời nói dối của bạn rồi Enter';
      $('btn-leave').textContent = en ? '🚪 Walk away' : '🚪 Rút lui';
      applyModeIntro();        // v0.3: đoạn giới thiệu + nút bắt đầu đổi theo chế độ đang chọn
      refreshHud();
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
      // v0.6 F3.1: xúc xắc chỉ được bốc trong những món ĐÃ MỞ
      XDH.SLOTS.forEach(slot => {
        XDH.run.outfit[slot] = rnd(XDH.WARDROBE[slot].filter(o => XDH.isUnlocked(slot, o.id)));
      });
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
      if (!XDH.Speech.supported) {
        $('stt-hint').textContent = sttHintText();
        toast(XDH.IN_APP ? wvTxt().sttHint
          : (XDH.lang === 'en' ? 'This browser has no speech-to-text — use Chrome, or type.'
                               : 'Trình duyệt này không hỗ trợ mic-to-text — dùng Chrome, hoặc gõ chữ.'), 6000);
        return;
      }
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
          const en = XDH.lang === 'en';
          if (err === 'not-allowed') {
            // v0.6.1 G1 pass #2: KHÔNG im lặng — câu hướng dẫn ở LẠI trong khung, không tan như toast
            $('stt-hint').textContent = wvTxt().denied;
            toast(wvTxt().denied, 7000);
          } else if (err === 'fallback') {
            toast(en ? 'No Google speech here — switched to the backup mic. Hold 🎙️ and try again!'
                     : 'Trình duyệt này không có mic Google — đã chuyển sang mic dự phòng. Giữ nút 🎙️ nói lại nhé!');
          } else {
            $('stt-hint').textContent = XDH.IN_APP ? wvTxt().sttHint : sttHintText();
            toast((en ? 'Mic error (' : 'Mic lỗi (') + err + (en ? ') — typing works too.' : ') — gõ chữ cũng chơi được.'));
          }
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
    floatNums, clearNums, popDeltas,                       // v0.6 F1
    showMeme,                                              // v0.6 F2
    showRegret,                                            // v0.6 F5.2
    setDoorStage, setConvoState, setThought, showThinking, hideThinking,
    renderOpeners, hideOpeners: () => $('openers').classList.remove('show')
  };
})();
