// v1.0 — HỆ NHIỆM VỤ (plan-v1.0-nhiem-vu.md). CHỈ chạy ở mode MA SÓI — Kẹt Tiền không đụng.
// Triết lý §1b giữ nguyên: AI chỉ PHÁT TÍN HIỆU (mission_signal trong phiếu JSON);
// FILE NÀY cầm toàn bộ luật — máy trạng thái, ngưỡng quan tâm, túi đồ, tiền, thưởng, loot rác.
// Núm chỉnh: XDH.MISSION_CFG + XDH.TRASH trong config.js (một chỗ duy nhất).
XDH.Mission = (function () {
  const $ = (id) => document.getElementById(id);
  const t = (vi, en) => (XDH.lang === 'en' ? en : vi);
  const C = () => XDH.MISSION_CFG;

  // ---- trạng thái sống trên XDH.run (mất khi refresh — đáp án 8: chấp nhận) ----
  function initRun() {
    const r = XDH.run;
    r.missions = { ly_selfie: { stage: 'chua_biet', clues: 0, lastClueTurn: -99, source: '' } };
    r.items = [];                    // túi đồ nhiệm vụ — khởi đầu trống, chỉ có thể có 'gay_selfie'
    r.trashLooted = [];              // thùng rác đã lục đêm nay
    r.chore = { perHouse: {}, nightTotal: 0 };   // trần việc vặt: 2 việc/nhà/đêm · tổng <= 120k/đêm
    r.hienWin = false;
  }
  function newNight() {
    const r = XDH.run;
    if (!r.trashLooted) return;      // run cũ chưa có hệ nhiệm vụ
    r.trashLooted = [];
    r.chore = { perHouse: {}, nightTotal: 0 };
  }

  const on = () => !!(XDH.run && XDH.run.missions && !XDH.isKetTien());
  const m = () => XDH.run.missions.ly_selfie;
  const hasStick = () => on() && XDH.run.items.includes('gay_selfie');
  const stageAt = (s) => XDH.MISSION_STAGES.indexOf(s);
  const stageGte = (s) => on() && stageAt(m().stage) >= stageAt(s);

  // ---- bối cảnh gửi kèm mỗi lượt /api/converse (mode ma sói mới gửi) ----
  function convoContext() {
    if (!on()) return {};
    return { mission: { id: 'ly_selfie', stage: m().stage, clues: m().clues } };
  }

  // ---- MỘT cửa nhận tín hiệu AI. CODE xét đủ điều kiện rồi mới cho máy trạng thái nhích ----
  // (chốt chặn lớp 2 — lớp 1 là prompt + lớp server trong converse.js; bài học "đồng ý mồm" 08-09)
  function onSignal(sig, npcId, st, act) {
    if (!on() || !sig) return;
    const M = m(), turns = (act && act.turns) || 0;
    if (npcId === 'gen_z' && ['manh_moi_1', 'manh_moi_2', 'ro_chuyen'].includes(sig)) {
      if ((st.interest || 0) < C().INTEREST_GATE) return;                    // chưa đủ quan tâm → CẤM khai
      if (M.clues > 0 && turns - M.lastClueTurn < C().CLUE_GAP_TURNS) return; // mỗi manh mối cách >= 2 lượt
      if (sig === 'manh_moi_1' && M.clues === 0) {
        M.clues = 1; M.lastClueTurn = turns;
        if (M.stage === 'chua_biet') M.stage = 'da_goi';
      } else if (sig === 'manh_moi_2' && M.clues === 1) {
        M.clues = 2; M.lastClueTurn = turns;
      } else if (sig === 'ro_chuyen' && M.clues >= 2 &&
                 (M.stage === 'da_goi' || M.stage === 'da_mo_popup')) {
        M.lastClueTurn = turns;
        openPopup();                 // từ chối rồi nhắc lại TikTok → popup hiện LẠI (số đậu #5)
      }
      return;
    }
    if (npcId === 'sinh_vien' && sig === 'dong_y_cho_muon') {
      // CODE xét tin, không tin lời AI suông: tin >= ngưỡng mới thật sự được mượn
      if (M.stage === 'da_nhan' && !hasStick() && (st.trust || 0) >= C().TI_LEND_TRUST) grantStick('ti');
      return;
    }
    if (sig === 'nhan_viec_vat') {
      if (stageGte('da_nhan') && M.stage !== 'xong') chorePay(act ? act.houseId : 0);
    }
  }

  // ---- 📱 popup kiểu thông báo điện thoại (đáp án 5) ----
  function openPopup() {
    const M = m();
    if (M.stage === 'da_nhan' || M.stage === 'co_do' || M.stage === 'xong') return;
    M.stage = 'da_mo_popup';
    $('mi-title').textContent = t('Chuyện của Ly 🎬', "Ly's problem 🎬");
    $('mi-body').innerHTML = t(
      'Gậy selfie <b>gãy</b>, hết tiền mua cái mới (<b>80k</b>). Không có nó, clip đêm nay của Ly coi như bỏ.',
      'Her selfie stick <b>snapped</b> and she is broke — a new one costs <b>80k</b>. Without it, tonight\'s clip is dead.');
    $('mi-ask').textContent = t('Nhận giúp Ly kiếm gậy selfie mới?', 'Help Ly get a new selfie stick?');
    $('mi-hint').innerHTML = t(
      '💰 mua ở xe bánh mì (80k) · 🤝 mượn Tí · 🗑️ lục thùng rác<br>Thưởng: <b>+50k</b> + Ly tin bạn hơn',
      '💰 buy at the bánh mì cart (80k) · 🤝 borrow from Tí · 🗑️ dig the trash bins<br>Reward: <b>+50k</b> + Ly trusts you more');
    $('btn-mi-yes').textContent = t('CÓ, GIÚP LIỀN 🤳', 'YES, I\'M ON IT 🤳');
    $('btn-mi-no').textContent = t('Thôi, để sau', 'Not now');
    $('ov-mission').classList.add('show');
  }
  function accept() {
    $('ov-mission').classList.remove('show');
    m().stage = 'da_nhan';
    // "nhận thì THẾ GIỚI ĐỔI" (luật thiết kế mục 1): thùng rác mọc ra, quầy có gậy, việc vặt mở
    XDH.UI.floatNums([{ text: t(XDH.POP_EVENT.mission_new.vi, XDH.POP_EVENT.mission_new.en), cls: 'hit' }]);
    XDH.UI.toast(t('📱 Nhiệm vụ nhận rồi! Ngoài xóm vừa có mấy THÙNG RÁC lục được — xe bánh mì cũng có bán gậy selfie đó.',
      '📱 Mission accepted! Trash bins around the block are now worth digging — the bánh mì cart sells selfie sticks too.'), 5200);
    XDH.UI.refreshHud();
    if (XDH.spawnTrashBins) XDH.spawnTrashBins();
  }
  function decline() {
    $('ov-mission').classList.remove('show');
    // Từ chối KHÔNG giết mạch (luật thiết kế): Ly buồn nhẹ, nhắc TikTok lần sau là popup quay lại
    XDH.UI.setThought(t('Ừa… thôi, có sao đâu. Chắc em tự xoay… chắc vậy á 🥲',
      "It's fine… whatever. I'll figure it out… probably 🥲"));
  }

  // ---- có đồ: mua 💰 · mượn Tí 🤝 · lục rác 🗑️ ----
  function grantStick(source) {
    if (hasStick()) return;
    XDH.run.items.push('gay_selfie');
    const M = m(); M.stage = 'co_do'; M.source = source;
    XDH.UI.floatNums([{ text: t(XDH.POP_EVENT.mission_item.vi, XDH.POP_EVENT.mission_item.en), cls: 'hit' }]);
    XDH.UI.toast(t('🤳 Có gậy selfie rồi — mang tới cho Ly thôi!', '🤳 Got the selfie stick — bring it to Ly!'), 4200);
    XDH.UI.refreshHud();
  }
  const canBuyStick = () => on() && m().stage === 'da_nhan' && !hasStick();
  function buyStick() {
    if (!canBuyStick() || XDH.run.money < C().STICK_PRICE) return false;
    XDH.run.money -= C().STICK_PRICE;
    grantStick('mua');
    return true;
  }

  // ---- 🗑️ lục rác: bảng loot ở XDH.TRASH, mỗi thùng 1 lần/đêm ----
  function rollLoot() {
    let roll = Math.random() * 100;
    for (const row of XDH.TRASH.LOOT) { roll -= row.p; if (roll < 0) return row; }
    return XDH.TRASH.LOOT[0];
  }
  function lootTrash(binId, forcedType) {
    if (!on() || !stageGte('da_nhan')) return;
    const r = XDH.run;
    if (r.trashLooted.includes(binId)) {
      XDH.UI.toast(t('🗑️ Thùng này lục nãy giờ rồi — mai mới có rác mới.', '🗑️ Already dug through this one — new trash tomorrow.'));
      return;
    }
    r.trashLooted.push(binId);
    let row = forcedType ? (XDH.TRASH.LOOT.find(l => l.type === forcedType) || rollLoot()) : rollLoot();
    // gậy chỉ rơi khi ĐANG cần (đã nhận nhiệm vụ, chưa có đồ) — ngoài ra đổi thành đồ vứt đi
    if (row.type === 'stick' && (hasStick() || m().stage !== 'da_nhan')) row = { type: 'junk' };
    if (row.type === 'coins') {
      const k = row.min + Math.floor(Math.random() * (row.max - row.min + 1));
      r.money += k;
      XDH.UI.floatNums([{ text: '🪙 +' + k + 'k', cls: 'good' }]);
      XDH.UI.toast(t(`🪙 Lượm được ${k}k tiền lẻ trong đống rác!`, `🪙 Found ${k}k in loose change in the trash!`));
    } else if (row.type === 'food') {
      const pool = XDH.lang === 'en' ? XDH.TRASH.FOOD.en : XDH.TRASH.FOOD.vi;
      XDH.UI.toast('🍙 ' + pool[Math.floor(Math.random() * pool.length)] + t(' — sói không thèm, nhưng kể ra cũng vui.', " — the wolf isn't hungry for THAT, but hey."));
    } else if (row.type === 'stick') {
      XDH.UI.toast(t('🤳 KHÔNG THỂ TIN NỔI — một cây gậy selfie CÒN TỐT trong thùng rác!!', '🤳 UNBELIEVABLE — a perfectly good selfie stick in the trash!!'), 4600);
      grantStick('rac');
    } else {
      const pool = XDH.lang === 'en' ? XDH.TRASH.JUNK.en : XDH.TRASH.JUNK.vi;
      XDH.UI.toast('🗑️ ' + t('Lục ra ', 'You dig out ') + pool[Math.floor(Math.random() * pool.length)] + t('… vô dụng mà mắc cười.', '… useless but funny.'));
    }
    XDH.UI.refreshHud();
  }

  // ---- 💰 việc vặt mode ma sói (mượn khuôn Kẹt Tiền, KHÔNG đụng file Kẹt Tiền) ----
  function chorePay(houseId) {
    const r = XDH.run, K = C().CHORE;
    const done = r.chore.perHouse[houseId] || 0;
    if (done >= K.PER_HOUSE || r.chore.nightTotal >= K.NIGHT_CAP_K) return false;   // trần chống phá cân bằng
    let k = 5 * Math.round((K.MIN_K + Math.random() * (K.MAX_K - K.MIN_K)) / 5);
    k = Math.min(k, K.NIGHT_CAP_K - r.chore.nightTotal);
    r.chore.perHouse[houseId] = done + 1;
    r.chore.nightTotal += k;
    r.money += k;
    XDH.UI.floatNums([{ text: t(XDH.POP_EVENT.chore_pay.vi, XDH.POP_EVENT.chore_pay.en) + ' +' + k + 'k', cls: 'good' }]);
    XDH.UI.refreshHud();
    return true;
  }

  // ---- 🤳 trả đồ + thưởng (convo.js gọi khi bấm nút ĐƯA GẬY) ----
  const canGive = (npcId) => on() && npcId === 'gen_z' && m().stage === 'co_do' && hasStick();
  function reward(state) {
    const r = XDH.run;
    r.items = r.items.filter(i => i !== 'gay_selfie');   // đồ đã trao tay
    m().stage = 'xong';
    r.money += C().REWARD_K;
    const before = state.trust;
    state.trust = Math.min(100, state.trust + C().REWARD_TRUST);
    XDH.UI.floatNums([
      { text: t(XDH.POP_EVENT.mission_done.vi, XDH.POP_EVENT.mission_done.en), cls: 'hit' },
      { text: '💵 +' + C().REWARD_K + 'k · +' + (state.trust - before) + ' ' + t('tin', 'trust'), cls: 'hit' }
    ]);
    XDH.UI.refreshHud();
    return state.trust - before;
  }
  const thankLine = () => t(
    'TRỜI ƠI GẬY SELFIE MỚI?? Anh/chị đỉnh thiệt sự luôn á!! Khoan— đứng yên, em quay cái story cảm ơn liền. Nè, cầm đỡ 50k tiền trà sữa, đừng có từ chối nha — em tin anh/chị nhất xóm luôn 😭🤳',
    "OH MY GOD A NEW SELFIE STICK?? You are actually the GOAT!! Wait— hold still, I'm filming a thank-you story right now. Here, take 50k bubble-tea money, no refusing — you're officially my most trusted neighbor 😭🤳");

  const isDone = () => on() && m().stage === 'xong';
  // Sói Hiền = 0 cú cắn cả ván + nhiệm vụ xong (mọi lần "vào nhà" của ma sói đều là cắn)
  const hienEligible = () => isDone() && XDH.run.score.entered === 0;

  // ---- ô HUD 🎯 (đáp án 6 — nhân bản hud-meal) ----
  function hudText() {
    if (!on()) return null;
    const M = m();
    if (M.stage === 'da_nhan') return t('🎯 Gậy selfie cho Ly — 💰 mua 80k · 🤝 mượn Tí · 🗑️ lục rác',
      '🎯 Selfie stick for Ly — 💰 buy 80k · 🤝 borrow from Tí · 🗑️ dig trash');
    if (M.stage === 'co_do') return t('🎯 Mang gậy selfie tới cho Ly 🤳', '🎯 Bring the selfie stick to Ly 🤳');
    if (M.stage === 'xong') return XDH.run.score.entered === 0
      ? t('✅ Nhiệm vụ xong — Sói Hiền!', '✅ Mission done — Gentle Wolf!')
      : t('✅ Nhiệm vụ Ly xong', '✅ Ly\'s mission done');
    return null;   // chưa nhận thì chưa hiện — người chơi phải tự moi ra chuyện
  }

  // ---- 😇 màn kết SÓI HIỀN (khuôn màn đồn công an — vẽ 8-bit bằng code, 0 đồng) ----
  function drawHien() {
    const c = $('hien-scene'); if (!c) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    P(0, 0, 240, 108, '#0e1a2e');                                    // trời đêm
    P(0, 108, 240, 42, '#14331f');                                   // cỏ
    P(196, 18, 26, 26, '#fff3c4'); P(190, 14, 8, 8, '#0e1a2e');      // trăng vuông 8-bit
    for (const [sx, sy] of [[24, 14], [70, 30], [130, 10], [170, 40]]) P(sx, sy, 2, 2, '#f2ecff');
    for (const [fx, fy] of [[40, 70], [100, 52], [150, 66], [210, 58]]) P(fx, fy, 3, 3, '#ffe98a'); // đom đóm
    // sói ngồi giữa, cầm gậy selfie
    P(104, 66, 26, 24, '#8a8fa8');                                   // đầu sói
    P(104, 60, 7, 8, '#8a8fa8'); P(123, 60, 7, 8, '#8a8fa8');        // tai VỂNH (vui)
    P(110, 74, 4, 4, '#221a12'); P(120, 74, 4, 4, '#221a12');        // mắt cười
    P(112, 84, 10, 4, '#5d6275');                                    // mõm
    P(102, 90, 30, 22, '#e2718f');                                   // áo
    P(134, 62, 3, 42, '#3fd4d4'); P(130, 58, 11, 7, '#241e35');      // gậy selfie + điện thoại
    // 3 hàng xóm vây quanh: Cô Sáu (hồng) · Tí (xanh dương) · Ly (xanh ngọc)
    const NB = [[60, 78, '#e2718f', '#f7c99b'], [80, 84, '#3f6fe0', '#eab98a'], [160, 80, '#2fd4b2', '#f3c4a6']];
    NB.forEach(([x, y, top, skin]) => {
      P(x, y, 14, 12, skin); P(x + 3, y + 4, 2, 2, '#221a12'); P(x + 9, y + 4, 2, 2, '#221a12');
      P(x - 1, y + 12, 16, 14, top);
    });
    // tim bay
    for (const [hx, hy] of [[92, 48], [146, 42], [118, 34]]) {
      P(hx, hy + 2, 2, 3, '#ff5d73'); P(hx + 3, hy + 2, 2, 3, '#ff5d73'); P(hx + 1, hy + 4, 3, 3, '#ff5d73');
      P(hx, hy, 2, 2, '#ff5d73'); P(hx + 3, hy, 2, 2, '#ff5d73');
    }
    g.fillStyle = '#5dffa4'; g.font = 'bold 11px monospace'; g.textAlign = 'center';
    g.fillText(t('XÓM NHẬN NUÔI MỘT CON SÓI', 'THE BLOCK ADOPTED A WOLF'), 120, 132);
  }
  function showHien() {
    XDH.run.hienWin = true;
    drawHien();
    $('hien-title').textContent = t('😇 SÓI HIỀN — XÓM NHẬN NUÔI!', '😇 GENTLE WOLF — ADOPTED BY THE BLOCK!');
    $('hien-line').textContent = t(
      'Không cắn một ai, còn giúp Ly có gậy selfie mới. Cả xóm quyết định: con sói này… nuôi!',
      'Bit nobody, and got Ly a new selfie stick. The whole block agrees: this wolf is a keeper.');
    $('btn-hien-next').textContent = t('Xem bảng tổng kết 📋', 'See the score board 📋');
    XDH.Blips.jingle('win');
    $('ov-hien').classList.add('show');
  }

  // ---- nối nút ----
  document.addEventListener('DOMContentLoaded', () => {
    $('btn-mi-yes').onclick = accept;
    $('btn-mi-no').onclick = decline;
    $('btn-hien-next').onclick = () => { $('ov-hien').classList.remove('show'); XDH.UI.showScore(true); };
    $('btn-give-stick').onclick = () => XDH.Convo.giveStick();
  });

  // ---- ?mission=test — tay nắm cho máy kiểm (Playwright), không ảnh hưởng game thường ----
  if (/[?&]mission=test/.test(location.search)) {
    XDH.MissionTest = {
      st: () => ({ ...m(), items: XDH.run.items.slice(), money: XDH.run.money, chore: JSON.parse(JSON.stringify(XDH.run.chore)) }),
      signal: (sig, npcId, st, turns) => onSignal(sig, npcId, st, { turns: turns == null ? 99 : turns, houseId: 0 }),
      accept, decline,
      grant: (src) => grantStick(src || 'test'),
      buy: buyStick,
      loot: lootTrash,
      chore: chorePay,
      reward: (state) => reward(state),
      setStage: (s) => { m().stage = s; XDH.UI.refreshHud(); },
      setClues: (n) => { m().clues = n; m().lastClueTurn = -99; },
      setMoney: (k) => { XDH.run.money = k; XDH.UI.refreshHud(); },
      hien: showHien,
      popupShown: () => $('ov-mission').classList.contains('show')
    };
  }

  return { initRun, newNight, convoContext, onSignal, hudText, canBuyStick, buyStick,
           lootTrash, canGive, reward, thankLine, isDone, hienEligible, showHien,
           hasStick, on, stage: () => (on() ? m().stage : null) };
})();
