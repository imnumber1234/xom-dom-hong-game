// v2.0 — HỆ NHIỆM VỤ CHO CẢ BA NHÀ (đáp án 7). CHỈ chạy ở mode MA SÓI — Kẹt Tiền không đụng.
//
// v1.0 chỉ có Ly. Khuôn giữ NGUYÊN, chỉ nhân lên ba: hỏi sâu → hé manh mối 1 → 2 → rõ chuyện
// → nhận việc → kiếm đồ (mua · mượn nhà khác · lục rác) → trả đồ → thưởng.
//
//   ly_selfie   Ly     🤳 gậy selfie  80k · mượn Tí   · thưởng 50k
//   ti_the4g    Tí     📶 thẻ nạp 4G  60k · xin Ly    · thưởng 40k
//   sau_gaubong Cô Sáu 🧸 gấu bông    70k · xin Tí    · thưởng 60k
//
// Triết lý §1b giữ nguyên: AI chỉ PHÁT TÍN HIỆU (mission_signal trong phiếu JSON);
// FILE NÀY cầm toàn bộ luật — máy trạng thái, ngưỡng quan tâm, túi đồ, tiền, thưởng, loot rác.
// Núm chỉnh: XDH.MISSIONS + XDH.MISSION_CFG + XDH.TRASH trong config.js (một chỗ duy nhất).
XDH.Mission = (function () {
  const $ = (id) => document.getElementById(id);
  const t = (vi, en) => (XDH.lang === 'en' ? en : vi);
  const C = () => XDH.MISSION_CFG;
  const DEF = (id) => XDH.MISSIONS[id];
  const IDS = () => XDH.MISSION_IDS;

  // v1.0.1 — HỘP KÍNH: mọi quyết định của máy nhiệm vụ đều kể ra được vì sao.
  // ?debug=1 → một dòng [nv] trong bảng debug + console; bình thường → im lặng.
  function dbg(msg) {
    if (!XDH.DEBUG) return;
    console.log('[nhiệm vụ]', msg);
    const el = $('debug-log');
    if (!el) return;
    el.style.display = 'block';
    const row = document.createElement('div');
    row.style.color = '#8fd4ff';
    row.textContent = '[nv] ' + msg;
    el.appendChild(row);
    el.scrollTop = 1e9;
  }

  let pendingPopup = null;   // nhiệm vụ nào đang mở popup 📱

  // ---- trạng thái sống trên XDH.run (mất khi refresh — đáp án 8: chấp nhận) ----
  function initRun() {
    const r = XDH.run;
    r.missions = {};
    IDS().forEach(id => { r.missions[id] = { stage: 'chua_biet', clues: 0, lastClueTurn: -99, source: '' }; });
    r.items = [];                    // túi đồ nhiệm vụ — chứa mã món của XDH.MISSIONS[*].item
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
  const M = (id) => XDH.run.missions[id];
  const ownedBy = (npcId) => (on() ? XDH.missionOfOwner(npcId) : null);
  const hasItem = (id) => on() && XDH.run.items.includes(DEF(id).item);
  const hasAnyItem = () => on() && XDH.run.items.length > 0;
  const stageAt = (s) => XDH.MISSION_STAGES.indexOf(s);
  const stageGte = (id, s) => on() && stageAt(M(id).stage) >= stageAt(s);
  const accepted = (id) => stageGte(id, 'da_nhan') && M(id).stage !== 'xong';
  const anyAccepted = () => on() && IDS().some(id => stageGte(id, 'da_nhan'));

  // Nhà nào đang là NGƯỜI CHO MƯỢN của một nhiệm vụ đang chạy mà người lạ CHƯA có đồ?
  function lendableAt(npcId) {
    if (!on()) return null;
    for (const id of IDS()) {
      if (DEF(id).lender === npcId && M(id).stage === 'da_nhan' && !hasItem(id)) return id;
    }
    return null;
  }

  // ---- bối cảnh gửi kèm mỗi lượt /api/converse (mode ma sói mới gửi) ----
  // Lọc SẴN cho đúng nhân vật đang đứng trước mặt — máy chủ không phải đoán.
  function convoContext(npcId) {
    if (!on()) return {};
    const ownId = ownedBy(npcId);
    const lendId = lendableAt(npcId);
    const out = { missions: { choreOpen: anyAccepted() } };
    if (ownId) out.missions.own = { id: ownId, stage: M(ownId).stage, clues: M(ownId).clues };
    if (lendId) out.missions.lend = { id: lendId, item: DEF(lendId).item };
    return out;
  }

  // ---- MỘT cửa nhận tín hiệu AI. CODE xét đủ điều kiện rồi mới cho máy trạng thái nhích ----
  // (chốt chặn lớp 2 — lớp 1 là prompt + lớp server trong converse.js; bài học "đồng ý mồm" 08-09)
  function onSignal(sig, npcId, st, act) {
    if (!on() || !sig) return;
    const turns = (act && act.turns) || 0;

    if (['manh_moi_1', 'manh_moi_2', 'ro_chuyen'].includes(sig)) {
      const id = ownedBy(npcId);
      if (!id) { dbg(`chặn ${sig}: nhà ${npcId} không giữ nhiệm vụ nào`); return; }
      const m = M(id);
      if ((st.interest || 0) < C().INTEREST_GATE) {                          // chưa đủ quan tâm → CẤM khai
        dbg(`chặn ${sig}: quan tâm ${st.interest} < ${C().INTEREST_GATE}`); return;
      }
      // Nhịp: giữa 2 MANH MỐI cách >= 2 lượt; riêng cú chốt "rõ chuyện" chỉ cần qua 1 lượt —
      // người chơi đã moi đủ mà bắt chờ thêm là tái bệnh "hỏi lại không có gì mới" (Lucas 08-13).
      const needGap = sig === 'ro_chuyen' ? 1 : C().CLUE_GAP_TURNS;
      if (m.clues > 0 && turns - m.lastClueTurn < needGap) {
        dbg(`chặn ${sig}: mới khai lượt ${m.lastClueTurn}, chưa đủ nhịp ${needGap} lượt`); return;
      }
      if (sig === 'manh_moi_1' && m.clues === 0) {
        m.clues = 1; m.lastClueTurn = turns;
        if (m.stage === 'chua_biet') m.stage = 'da_goi';
        dbg(`${id}: nhận manh mối 1/3 (lượt ${turns}, quan tâm ${st.interest})`);
      } else if (sig === 'manh_moi_2' && m.clues === 1) {
        m.clues = 2; m.lastClueTurn = turns;
        dbg(`${id}: nhận manh mối 2/3 (lượt ${turns})`);
      } else if (sig === 'ro_chuyen' && m.clues >= 2 &&
                 (m.stage === 'da_goi' || m.stage === 'da_mo_popup')) {
        m.lastClueTurn = turns;
        dbg(`${id}: RÕ CHUYỆN → mở popup 📱 (lượt ${turns})`);
        openPopup(id);               // từ chối rồi nhắc lại → popup hiện LẠI (số đậu #5 của v1.0)
      } else {
        dbg(`bỏ qua ${sig}: sai thứ tự (đang có ${m.clues} manh mối, giai đoạn ${m.stage})`);
      }
      return;
    }

    if (sig === 'dong_y_cho_muon') {
      const id = lendableAt(npcId);
      if (!id) { dbg(`chặn cho mượn: ${npcId} không phải người cho mượn (hoặc đã có đồ)`); return; }
      // CODE xét tin, không tin lời AI suông: tin >= ngưỡng mới thật sự được mượn
      if ((st.trust || 0) >= C().TI_LEND_TRUST) {
        dbg(`${npcId} cho mượn THẬT (tin ${st.trust} >= ${C().TI_LEND_TRUST}) → ${id}`);
        grantItem(id, 'muon');
      } else dbg(`chặn cho mượn: tin ${st.trust} < ${C().TI_LEND_TRUST} — mới là đồng ý mồm`);
      return;
    }

    if (sig === 'nhan_viec_vat') {
      if (anyAccepted()) {
        const ok = chorePay(act ? act.houseId : 0);
        dbg(ok ? 'việc vặt: trả công' : 'việc vặt: ĐỤNG TRẦN (2 lần/nhà hoặc 120k/đêm) — không trả');
      } else dbg('chặn việc vặt: chưa nhận nhiệm vụ nào');
    }
  }

  // ---- v1.0.1 "ấm dần" — hỏi trúng chuyện nhà đó giấu mà CHƯA đủ quan tâm: server báo probe,
  // CODE nhích +hứng thú (khuôn invite_nudge 08-09) → người kiên trì đào sẽ mở được cửa khai.
  function onProbe(st, npcId) {
    if (!on()) return;
    const id = ownedBy(npcId);
    if (!id) return;
    const s = M(id).stage;
    if (s !== 'chua_biet' && s !== 'da_goi' && s !== 'da_mo_popup') return;
    const before = st.interest || 0;
    st.interest = Math.min(100, before + C().PROBE_INTEREST);
    if (st.interest !== before) {
      XDH.UI.floatNums([{ text: t('🎬 Hỏi trúng chỗ ngứa +' + (st.interest - before) + ' hứng thú',
        '🎬 Poking the right spot +' + (st.interest - before) + ' interest'), cls: 'good' }]);
      dbg(`probe: đào đúng chỗ → hứng thú ${before} → ${st.interest}`);
    }
  }

  // ---- 📱 popup kiểu thông báo điện thoại (đáp án 5 của v1.0) ----
  function openPopup(id) {
    const m = M(id), d = DEF(id);
    if (m.stage === 'da_nhan' || m.stage === 'co_do' || m.stage === 'xong') return;
    m.stage = 'da_mo_popup';
    pendingPopup = id;
    $('mi-title').textContent = t(d.titleVi, d.titleEn);
    $('mi-body').innerHTML = t(d.bodyVi, d.bodyEn);
    $('mi-ask').textContent = t(d.askVi, d.askEn);
    $('mi-hint').innerHTML = t(d.hintVi, d.hintEn) +
      t(`<br>Thưởng: <b>+${d.rewardK}k</b> + họ tin bạn hơn`, `<br>Reward: <b>+${d.rewardK}k</b> + they trust you more`);
    $('btn-mi-yes').textContent = t('CÓ, GIÚP LIỀN ' + d.emoji, "YES, I'M ON IT " + d.emoji);
    $('btn-mi-no').textContent = t('Thôi, để sau', 'Not now');
    $('ov-mission').classList.add('show');
  }
  function accept() {
    $('ov-mission').classList.remove('show');
    const id = pendingPopup; pendingPopup = null;
    if (!id) return;
    const d = DEF(id);
    M(id).stage = 'da_nhan';
    // "nhận thì THẾ GIỚI ĐỔI" (luật thiết kế mục 1): thùng rác mọc ra, quầy có đồ, việc vặt mở
    XDH.UI.floatNums([{ text: t(XDH.POP_EVENT.mission_new.vi, XDH.POP_EVENT.mission_new.en), cls: 'hit' }]);
    XDH.UI.toast(t(`📱 Nhiệm vụ nhận rồi! Ngoài xóm vừa có mấy THÙNG RÁC lục được — xe bánh mì cũng bán ${d.itemVi} đó.`,
      `📱 Mission accepted! Trash bins around the block are now worth digging — the bánh mì cart sells a ${d.itemEn} too.`), 5200);
    XDH.UI.refreshHud();
    if (XDH.spawnTrashBins) XDH.spawnTrashBins();
  }
  function decline() {
    $('ov-mission').classList.remove('show');
    pendingPopup = null;
    // Từ chối KHÔNG giết mạch (luật thiết kế): họ buồn nhẹ, nhắc lại chuyện đó là popup quay lại
    XDH.UI.setThought(t('Ừa… thôi, có sao đâu. Chắc tự xoay vậy… chắc vậy á 🥲',
      "It's fine… whatever. I'll figure it out… probably 🥲"));
  }

  // ---- có đồ: mua 💰 · mượn nhà khác 🤝 · lục rác 🗑️ ----
  function grantItem(id, source) {
    if (hasItem(id)) return;
    const d = DEF(id);
    XDH.run.items.push(d.item);
    const m = M(id); m.stage = 'co_do'; m.source = source;
    XDH.UI.floatNums([{ text: t(XDH.POP_EVENT.mission_item.vi, XDH.POP_EVENT.mission_item.en), cls: 'hit' }]);
    XDH.UI.toast(t(`${d.emoji} Có ${d.itemVi} rồi — mang tới cho họ thôi!`,
      `${d.emoji} Got the ${d.itemEn} — go deliver it!`), 4200);
    XDH.UI.refreshHud();
  }

  // Danh sách món ĐANG bán ở xe bánh mì (nhiệm vụ đã nhận, chưa có đồ).
  function shopItems() {
    if (!on()) return [];
    return IDS().filter(id => M(id).stage === 'da_nhan' && !hasItem(id)).map(id => {
      const d = DEF(id);
      return { id, emoji: d.emoji, price: XDH.priceOf(d.price), raw: d.price,
               labelVi: d.itemVi, labelEn: d.itemEn };
    });
  }
  function buyItem(id) {
    if (!on() || M(id).stage !== 'da_nhan' || hasItem(id)) return false;
    const price = XDH.priceOf(DEF(id).price);
    if (XDH.run.money < price) return false;
    XDH.run.money -= price;
    grantItem(id, 'mua');
    return true;
  }

  // ---- 🗑️ lục rác: bảng loot ở XDH.TRASH, mỗi thùng 1 lần/đêm ----
  function rollLoot() {
    let roll = Math.random() * 100;
    for (const row of XDH.TRASH.LOOT) { roll -= row.p; if (roll < 0) return row; }
    return XDH.TRASH.LOOT[0];
  }
  // Món đồ nhiệm vụ CHỈ rơi khi đang thật sự cần một món nào đó.
  function neededNow() {
    return IDS().filter(id => M(id).stage === 'da_nhan' && !hasItem(id));
  }
  function lootTrash(binId, forcedType) {
    if (!on() || !anyAccepted()) return;
    const r = XDH.run;
    if (r.trashLooted.includes(binId)) {
      XDH.UI.toast(t('🗑️ Thùng này lục nãy giờ rồi — mai mới có rác mới.', '🗑️ Already dug through this one — new trash tomorrow.'));
      return;
    }
    r.trashLooted.push(binId);
    let row = forcedType ? (XDH.TRASH.LOOT.find(l => l.type === forcedType) || rollLoot()) : rollLoot();
    const need = neededNow();
    // 'stick' là tên cũ của v1.0 — v2.0 hiểu nó là "một món đồ nhiệm vụ đang cần"
    if ((row.type === 'stick' || row.type === 'item') && !need.length) row = { type: 'junk' };
    if (row.type === 'coins') {
      const k = row.min + Math.floor(Math.random() * (row.max - row.min + 1));
      r.money += k;
      XDH.UI.floatNums([{ text: '🪙 +' + k + 'k', cls: 'good' }]);
      XDH.UI.toast(t(`🪙 Lượm được ${k}k tiền lẻ trong đống rác!`, `🪙 Found ${k}k in loose change in the trash!`));
    } else if (row.type === 'food') {
      const pool = XDH.lang === 'en' ? XDH.TRASH.FOOD.en : XDH.TRASH.FOOD.vi;
      XDH.UI.toast('🍙 ' + pool[Math.floor(Math.random() * pool.length)] + t(' — sói không thèm, nhưng kể ra cũng vui.', " — the wolf isn't hungry for THAT, but hey."));
    } else if (row.type === 'stick' || row.type === 'item') {
      const id = need[Math.floor(Math.random() * need.length)];
      const d = DEF(id);
      XDH.UI.toast(t(`${d.emoji} KHÔNG THỂ TIN NỔI — một ${d.itemVi} CÒN TỐT trong thùng rác!!`,
        `${d.emoji} UNBELIEVABLE — a perfectly good ${d.itemEn} in the trash!!`), 4600);
      grantItem(id, 'rac');
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

  // ---- 🤳 trả đồ + thưởng (convo.js gọi khi bấm nút ĐƯA ĐỒ) ----
  // Trả về mã nhiệm vụ trao được ở nhà này, hoặc null.
  function canGive(npcId) {
    if (!on()) return null;
    const id = ownedBy(npcId);
    if (!id) return null;
    return (M(id).stage === 'co_do' && hasItem(id)) ? id : null;
  }
  function giveLabel(npcId) {
    const id = canGive(npcId);
    if (!id) return '';
    const d = DEF(id);
    return t(`${d.emoji} ĐƯA ${d.itemVi.toUpperCase()}`, `${d.emoji} HAND OVER THE ${d.itemEn.toUpperCase()}`);
  }
  function giveEcho(npcId) {
    const id = canGive(npcId); if (!id) return ['', ''];
    const d = DEF(id);
    return [
      t(`(lấy ${d.itemVi} mới tinh ra đưa) ${d.emoji}`, `(hands over a brand-new ${d.itemEn}) ${d.emoji}`),
      `(Người lạ đưa cho họ một ${d.itemVi} mới tinh.)`
    ];
  }
  const thankLine = (npcId) => {
    const id = canGive(npcId) || ownedBy(npcId) || IDS()[0];
    const d = DEF(id);
    return t(d.thankVi, d.thankEn);
  };
  function reward(state, npcId) {
    const id = canGive(npcId) || ownedBy(npcId);
    if (!id) return 0;
    const d = DEF(id), r = XDH.run;
    r.items = r.items.filter(i => i !== d.item);   // đồ đã trao tay
    M(id).stage = 'xong';
    r.money += d.rewardK;
    const before = state.trust;
    state.trust = Math.min(100, state.trust + d.rewardTrust);
    XDH.UI.floatNums([
      { text: t(XDH.POP_EVENT.mission_done.vi, XDH.POP_EVENT.mission_done.en), cls: 'hit' },
      { text: '💵 +' + d.rewardK + 'k · +' + (state.trust - before) + ' ' + t('tin', 'trust'), cls: 'hit' }
    ]);
    XDH.UI.refreshHud();
    return state.trust - before;
  }

  const doneCount = () => (on() ? IDS().filter(id => M(id).stage === 'xong').length : 0);
  const isDone = () => doneCount() > 0;
  // Sói Hiền = 0 cú cắn cả ván + xong ít nhất một nhiệm vụ (mọi lần "vào nhà" của ma sói đều là cắn)
  const hienEligible = () => isDone() && XDH.run.score.entered === 0;

  // ---- ô HUD 🎯 ----
  function hudText() {
    if (!on()) return null;
    const bits = [];
    IDS().forEach(id => {
      const m = M(id), d = DEF(id);
      if (m.stage === 'da_nhan') bits.push(t(`${d.emoji} ${d.itemVi} (${XDH.priceOf(d.price)}k · mượn · lục rác)`,
        `${d.emoji} ${d.itemEn} (${XDH.priceOf(d.price)}k · borrow · trash)`));
      else if (m.stage === 'co_do') bits.push(t(`${d.emoji} mang ${d.itemVi} tới cho họ`, `${d.emoji} deliver the ${d.itemEn}`));
    });
    if (bits.length) return '🎯 ' + bits.join('  ·  ');
    const done = doneCount();
    if (done) {
      return XDH.run.score.entered === 0
        ? t(`✅ Xong ${done}/3 nhiệm vụ — Sói Hiền!`, `✅ ${done}/3 missions done — Gentle Wolf!`)
        : t(`✅ Xong ${done}/3 nhiệm vụ`, `✅ ${done}/3 missions done`);
    }
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
    const done = doneCount();
    $('hien-title').textContent = t('😇 SÓI HIỀN — XÓM NHẬN NUÔI!', '😇 GENTLE WOLF — ADOPTED BY THE BLOCK!');
    $('hien-line').textContent = done >= 3
      ? t('Không cắn một ai, mà giúp được CẢ BA nhà. Xóm này coi như có thêm một người thân.',
          'Bit nobody, and helped ALL THREE houses. This block just gained a family member.')
      : t(`Không cắn một ai, còn giúp được ${done}/3 nhà. Cả xóm quyết định: con sói này… nuôi!`,
          `Bit nobody, and helped ${done}/3 houses. The whole block agrees: this wolf is a keeper.`);
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
      st: (id) => ({ ...M(id || 'ly_selfie'), items: XDH.run.items.slice(), money: XDH.run.money,
                     chore: JSON.parse(JSON.stringify(XDH.run.chore)) }),
      all: () => JSON.parse(JSON.stringify(XDH.run.missions)),
      signal: (sig, npcId, st, turns) => onSignal(sig, npcId, st, { turns: turns == null ? 99 : turns, houseId: 0 }),
      probe: (st, npcId) => { onProbe(st, npcId || 'gen_z'); return st.interest; },
      ctx: (npcId) => convoContext(npcId),
      accept, decline,
      grant: (id, src) => grantItem(id || 'ly_selfie', src || 'test'),
      buy: buyItem,
      shop: shopItems,
      loot: lootTrash,
      chore: chorePay,
      reward: (state, npcId) => reward(state, npcId || 'gen_z'),
      canGive,
      setStage: (id, s) => { M(id).stage = s; XDH.UI.refreshHud(); },
      setClues: (id, n) => { M(id).clues = n; M(id).lastClueTurn = -99; },
      setMoney: (k) => { XDH.run.money = k; XDH.UI.refreshHud(); },
      hien: showHien,
      popupShown: () => $('ov-mission').classList.contains('show')
    };
  }

  return {
    initRun, newNight, convoContext, onSignal, onProbe, hudText,
    shopItems, buyItem, lootTrash,
    canGive, giveLabel, giveEcho, reward, thankLine,
    isDone, doneCount, hienEligible, showHien, anyAccepted, on,
    // ---- tên cũ của v1.0, giữ để mọi chỗ gọi cũ không gãy ----
    hasStick: hasAnyItem,
    bagItems: () => (on() ? XDH.run.items.slice() : []),
    stage: () => {
      if (!on()) return null;
      // giai đoạn "xa nhất" trong ba nhiệm vụ — game.js dùng nó để biết có mọc thùng rác chưa
      let best = 'chua_biet';
      IDS().forEach(id => { if (stageAt(M(id).stage) > stageAt(best)) best = M(id).stage; });
      return best;
    }
  };
})();
