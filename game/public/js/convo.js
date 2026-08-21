// Conversation engine. THE GAME CODE (this file) owns every win/fail rule —
// the AI only suggests dialogue + emotion + bounded deltas; we clamp and decide.
XDH.Convo = (function () {
  const R = XDH.RULES;

  let active = null;   // { npc, houseId, state, history, timerId, secondsLeft, startedAt, turns }
  let busy = false;

  function outfitKey() {
    const o = XDH.run.outfit;
    return `${o.shirt}|${o.hat}|${o.item}`;
  }

  // v0.6 F1 — MỘT cửa duy nhất để đổi chỉ số. Trả về mức THẬT ĐÃ ĐỔI sau khi kẹp 0-100,
  // nên popup luôn hiện đúng con số game vừa cộng (không phải số trong bảng gốc).
  function applyDeltas(st, d) {
    const out = { trust: 0, suspicion: 0, interest: 0, patience: 0 };
    ['trust', 'suspicion', 'interest', 'patience'].forEach(k => {
      const want = d[k] || 0;
      if (!want) return;
      const before = st[k];
      st[k] = Math.max(0, Math.min(100, before + want));
      out[k] = st[k] - before;
    });
    return out;
  }

  // ══ v2.0 việc 4 — THANH THIỆN CẢM HAI LỚP (Lucas chốt cách D) ══════════════
  // LỚP CODE: đếm số CHỦ ĐỀ trong XDH.REGRET[nhân vật] mà người chơi đã chạm.
  //   Bảng từ khoá đó có từ v0.6 nhưng trước giờ chỉ dùng cho câu tiếc nuối lúc thua —
  //   nối nó vào thanh điểm chính là thứ Lucas xin, không phải làm mới từ đầu.
  // LỚP AI:   lòng tin đã đi được bao nhiêu phần đường tới ngưỡng mở cửa của nhà đó.
  // THANH HIỆN = lấy lớp CAO HƠN. Nhờ vậy không bao giờ còn cảnh "nói đúng mà không có điểm".
  const VERDICT_ORDER = ['lo_lieu', 'kha_nghi', 'thuong', 'hop_ly', 'danh_trung'];

  function topicsOf(npcId) { return XDH.REGRET[npcId] || []; }

  // Chủ đề người chơi ĐÃ chạm trong cuộc này. Câu ngắn hơn XDH.FRIEND.MIN_CHARS không tính —
  // đó là chốt chặn chống "gõ đại một từ khoá" (cách B trong kế hoạch, gộp vào cách D).
  function touchedTopics() {
    if (!active) return [];
    const said = active.history
      .filter(h => h.role === 'player' && String(h.text || '').trim().length >= XDH.FRIEND.MIN_CHARS)
      .map(h => String(h.text || '').toLowerCase()).join(' ');
    if (!said) return [];
    return topicsOf(active.npc.id).filter(w => w.keys.some(k => said.includes(k))).map(w => w.id);
  }
  function friendCode() {
    if (!active) return 0;
    const list = topicsOf(active.npc.id);
    if (!list.length) return 0;
    return Math.round(100 * active.topicsHit.length / list.length);
  }
  function friendAi(st, diff) {
    const start = XDH.RULES.START.trust;
    const span = Math.max(1, diff.threshold - start);
    let p = 100 * (st.trust - start) / span;
    // Nghi ngờ sát trần thì thanh phải TỤT — người chơi cần thấy mình đang mất chỗ đứng.
    if (st.suspicion >= XDH.RULES.SUSPICION_BLOCKS - 15) p -= XDH.FRIEND.SUSP_DRAG;
    return Math.max(0, Math.min(100, Math.round(p)));
  }
  function friendPct(st, diff) {
    return Math.max(friendCode(), friendAi(st, diff));
  }

  // v0.6 F4 — cảm xúc HIỆN RA: AI đề xuất, CODE có quyền phủ quyết bằng mặt "chán".
  // Thẻ Ly ghi "chán RẤT nhanh — ai nói chuyện nhạt là mắt đờ ra"; trước v0.6 game không có
  // mặt chán nào nên người chơi làm cô chán mà không hề thấy.
  function shownEmotion(ai, act) {
    const e = XDH.EMOTIONS.includes(ai.emotion) ? ai.emotion : 'neutral';
    if (!act) return e;
    const need = XDH.FEEL.BORED_STREAK[act.npc.id] || 4;
    if (act.blandStreak >= need && e !== 'angry' && e !== 'buc_minh') return 'chan';
    return e;
  }

  // v0.6 F5.1 — bong bóng 💭 RÒ RỈ Ý ĐỊNH trước khi bị đuổi. Q7 = A: chỉ 2 khoảnh khắc
  // (sắp hết kiên nhẫn · nghi ngờ sát trần), MỘT lần mỗi cuộc, và chỉ rò rỉ CẢNH BÁO —
  // không rò rỉ đáp án. Người chơi có đúng một lượt để cứu.
  function leakZone() {
    if (!active) return false;
    const st = active.state, L = XDH.FEEL.LEAK;
    return st.patience <= L.PATIENCE || st.suspicion >= L.SUSPICION;
  }
  function leakThought() {
    if (!active || active.leaked || !leakZone()) return null;
    active.leaked = true;
    const pack = XDH.LEAK_LINES[active.npc.id] || XDH.LEAK_LINES.gen_z;
    const pool = pack[XDH.lang === 'en' ? 'en' : 'vi'] || pack.vi;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // v0.6 F5.2 — dòng tiếc nuối sau khi thua: chọn một điểm yếu CÓ SẴN trong thẻ nhân vật mà
  // người chơi CHƯA hề chạm tới. Bảng ở XDH.REGRET, khớp đúng "CÁCH THẮNG" trong _personas.js.
  // AI không tham gia — cấm bịa ra một con đường không tồn tại.
  function regretLine() {
    if (!active) return '';
    const list = XDH.REGRET[active.npc.id] || [];
    if (!list.length) return '';
    const said = active.history.filter(h => h.role === 'player')
      .map(h => String(h.text || '').toLowerCase()).join(' ');
    const untouched = list.filter(w => !w.keys.some(k => said.includes(k)));
    const pool = untouched.length ? untouched : list;
    const w = pool[Math.floor(Math.random() * pool.length)];
    return XDH.lang === 'en' ? w.en : w.vi;
  }

  // v1.2 🧠 MÁY ĐỌC SUY NGHĨ — "họ đang thèm nghe chuyện gì". Dùng LẠI bảng XDH.REGRET
  // (điểm yếu CÓ THẬT trong thẻ nhân vật, khớp _personas.js) nhưng nói ở thì hiện tại,
  // và chỉ nhả chủ đề người chơi CHƯA chạm — AI không tham gia, cấm bịa đường không có.
  function craveLine() {
    if (!active) return '';
    const list = XDH.REGRET[active.npc.id] || [];
    if (!list.length) return '';
    const said = active.history.filter(h => h.role === 'player')
      .map(h => String(h.text || '').toLowerCase()).join(' ');
    const untouched = list.filter(w => !w.keys.some(k => said.includes(k)));
    const pool = untouched.length ? untouched : list;
    const w = pool[Math.floor(Math.random() * pool.length)];
    return XDH.lang === 'en' ? w.en : w.vi;
  }

  // ===== v1.1 — ĐỒNG HỒ IM LẶNG: hàng xóm HỎI DỒN (plan-v1.1-hoi-doi.md) =====
  // Trước v1.1 người chơi im là game đứng hình. Nay: chờ hết giờ nấc 1 → thúc nhẹ,
  // nấc 2 → sốt ruột, nấc 3 → tối hậu thư, im tiếp → ĐÓNG CỬA. Trả lời = về nấc 1.
  // Câu do CODE cầm (khuôn LEAK_LINES) nên 0 đồng và chạy được cả khi não AI chết.
  function pressCancel() {
    if (active && active.pressTimer) { clearTimeout(active.pressTimer); active.pressTimer = null; }
  }
  function pressBlocked() {
    return !active || busy || !XDH.PRESS.ON ||
           (XDH.Tut && XDH.Tut.isActive && XDH.Tut.isActive()) ||
           (XDH.Speech && XDH.Speech.isListening && XDH.Speech.isListening());
  }
  function pressArm() {
    pressCancel();
    if (pressBlocked()) return;
    const T = XDH.PRESS.TIERS;
    const ms = active.pressTier >= T.length
      ? XDH.PRESS.GIVEUP_MS
      : T[active.pressTier].min + Math.random() * (T[active.pressTier].max - T[active.pressTier].min);
    active.pressTimer = setTimeout(pressFire, ms);
  }
  function pressLine() {
    const pack = XDH.PRESS_LINES[active.npc.id] || XDH.PRESS_LINES.gen_z;
    const tiers = pack[XDH.lang === 'en' ? 'en' : 'vi'] || pack.vi;
    const pool = tiers[Math.min(active.pressTier, tiers.length - 1)] || tiers[0];
    const fresh = pool.filter(l => !active.pressUsed.includes(l));
    const line = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))];
    active.pressUsed.push(line);
    return line;
  }
  async function pressFire() {
    if (!active) return;
    if (busy) { pressArm(); return; }               // đang gõ chữ / đang chờ AI → hẹn lại, không chen
    // Hết 3 nấc mà vẫn im → hàng xóm bỏ cuộc, cửa đóng (không phải tội nói dối nên KHÔNG có công an)
    if (active.pressTier >= XDH.PRESS.TIERS.length) {
      pressCancel();
      finish(false, XDH.lang === 'en'
        ? 'You just stood there in silence — the door shut. 🤐'
        : 'Đứng im như trời trồng — cửa đóng cái rầm. 🤐', 'silence');
      return;
    }
    const line = pressLine();
    active.pressTier++;
    busy = true; XDH.UI.setBusy(true);
    XDH.UI.floatNums([popEvent('press', applyDeltas(active.state, { patience: XDH.PRESS.PATIENCE }))]);
    XDH.UI.setMeters(active.state);
    XDH.UI.setDoorStage(doorStage(active.state, diffOf(active.npc)));
    active.history.push({ role: 'npc', text: line, brain: 'kịch bản', verdict: null });
    await XDH.UI.typeNpcLine(line, active.pressTier >= 3 ? 'buc_minh' : 'chan', active.npc);
    if (!active) return;
    // Kiên nhẫn về 0 vì im lặng cũng là thua — dùng chung cửa thua sẵn có
    if (active.state.patience <= 0) {
      pressCancel();
      finish(false, XDH.lang === 'en' ? 'They ran out of patience and shut the door. 😤'
                                      : 'Hàng xóm hết kiên nhẫn, đóng sầm cửa. 😤');
      return;
    }
    busy = false; XDH.UI.setBusy(false);
    pressArm();
  }
  // ui.js gọi khi người chơi GÕ PHÍM / bấm mic: đồng hồ im lặng đếm lại từ đầu (giữ nguyên nấc).
  function pressPoke() { if (active) pressArm(); }

  // Một dòng popup cho cú code cộng NGOÀI verdict (mâu thuẫn đồ · quà · tin đồn · nhớ đêm trước…).
  function popEvent(id, applied) {
    const e = XDH.POP_EVENT[id];
    if (!e) return null;
    const label = XDH.lang === 'en' ? e.en : e.vi;
    const num = applied ? XDH.UI.popDeltas(applied) : '';
    return { text: label + (num ? ' ' + num : ''), cls: e.cls };
  }

  // v0.4 T2 — "Sổ tai tiếng xóm": CODE ghi, AI sau này chỉ đọc và diễn (không tự chấm điểm).
  // Sống trên XDH.run nên giữ qua đêm trong cùng một run; đóng browser là mất (Q6=A).
  function ledgerLog(terminalEvent) {
    if (!active) return;
    if (!XDH.run.ledger) XDH.run.ledger = [];
    XDH.run.ledger.push({
      night: XDH.run.night,
      houseId: active.houseId,
      npcId: active.npc.id,
      claim: active.claim || '',
      events: active.events.concat(terminalEvent ? [terminalEvent] : [])
    });
  }

  // v0.4 T3 — gossip chảy NGANG (Q1=A): chỉ chuyện XẤU bị bắt quả tang ở NHÀ KHÁC mới lan.
  // Vào nhà êm đẹp / rút lui / hết giờ thì không ai đồn.
  const BAD_EVENTS = ['contradiction', 'lo_lieu', 'kicked', 'police'];
  function gossipStories(houseId) {
    return (XDH.run.ledger || [])
      .filter(e => e.houseId !== houseId)
      .map(e => ({ npcId: e.npcId, night: e.night, claim: e.claim,
                   events: [...new Set(e.events.filter(ev => BAD_EVENTS.includes(ev)))] }))
      .filter(e => e.events.length);
  }

  // v0.4 T5 — qua đêm KHÔNG xoá sạch: nén sổ thành 2-3 dòng trí nhớ CODE-BUILT cho mỗi nhà
  // đã ghé (không gọi AI). ui.js newNight + mode-ket-tien startDay gọi hàm này lúc sang đêm/ngày mới.
  const MEM_TERMINAL = {
    invited: 'cuối cùng mình đã mời họ vào nhà',
    kicked: 'mình đã đuổi họ đi',
    police: 'mình đã gọi công an tới rượt họ',
    timeout: 'nói tới sáng mà chuyện chẳng đâu vào đâu',
    left: 'họ chào rồi rút lui giữa chừng',
    helped: 'mình đã giúp họ ít tiền/đồ ăn',
    meal_win: 'mình quý tới mức mời họ vào ăn cơm',
    refused: 'mình đã từ chối không giúp',
    come_back_later: 'mình hẹn họ lát quay lại',
    silence: 'họ đứng im không nói gì nên mình đóng cửa'
  };
  const MEM_BAD = {
    lo_lieu: 'họ từng bị mình bắt nói dối lộ liễu',
    contradiction: 'họ từng kể chuyện mâu thuẫn với bộ đồ đang mặc'
  };
  function compressNightMemory() {
    const r = XDH.run;
    if (!r.ledger || !r.ledger.length) return;   // đêm đầu chưa ghé nhà nào → không có gì thay đổi
    r.houses.forEach((h, idx) => {
      const ents = r.ledger.filter(e => e.houseId === idx);
      if (!ents.length) return;
      const lines = [];
      const lastClaim = [...ents].reverse().find(e => e.claim);
      if (lastClaim) lines.push(`Đêm ${lastClaim.night} người lạ xưng là "${lastClaim.claim}".`);
      ents.slice(-2).forEach(e => {
        const bad = [...new Set(e.events.filter(ev => MEM_BAD[ev]))].map(ev => MEM_BAD[ev]).join('; ');
        const term = e.events.map(ev => MEM_TERMINAL[ev]).filter(Boolean).pop();
        const bits = [bad, term].filter(Boolean).join(', và ');
        if (bits) lines.push(`Đêm ${e.night}: ${bits}.`);
      });
      h.memory = lines.slice(0, 3);
    });
  }

  // v0.3 — bối cảnh phụ gửi kèm mỗi lượt. Mode ma sói chỉ gửi đúng tên chế độ,
  // nên prompt của ma sói không đổi một chữ nào.
  function modeContext() {
    if (!XDH.isKetTien()) return { mode: 'ma_soi' };
    const r = XDH.run;
    const h = XDH.KetTien.hourNow();
    return {
      mode: 'ket_tien',
      hour: h.hh, hourText: h.text, timeHint: XDH.KetTien.timeHint(),   // B6
      knocked: r.knocked, day: r.night,                                  // B5 + B8
      meal: `${r.meal.label} ${r.meal.price}k`
    };
  }

  // v0.3: ngưỡng "muốn giúp" của mode Kẹt Tiền thấp hơn ngưỡng "mời vào nhà" của ma sói.
  function diffOf(npc) {
    const d = XDH.DIFFICULTY[npc.id];
    if (!XDH.isKetTien()) return d;
    return { ...d, threshold: Math.max(40, d.threshold - XDH.KT.THRESHOLD_DROP) };
  }

  // §1: cánh cửa CHÍNH LÀ thanh thiện cảm. 0 đóng → 3 gần mở (4 = thắng, mở toang).
  // v2.0: trước đây cửa chạy theo lòng tin, thanh mới chạy theo thiện cảm → hai thứ lệch nhau.
  // Nay CẢ HAI đọc chung một con số, không bao giờ còn cảnh "thanh đầy mà cửa vẫn khép".
  function doorStage(st, diff) {
    return Math.max(0, Math.min(3, Math.floor(friendPct(st, diff) / 25)));
  }

  function canKnock(houseId) {
    const h = XDH.run.houses[houseId];
    if (h.done) return { ok: false, why: 'Nhà này hôm nay coi như xong rồi — mai ghé lại 🌇' };
    if (h.won) return { ok: false, why: 'Nhà này mời bạn vào rồi mà 🌕' };
    if (h.failedOutfits.includes(outfitKey())) {
      return { ok: false, why: 'Bộ đồ này bị nhà này nghi rồi — đổi đồ ở tủ đồ rồi quay lại!' };
    }
    return { ok: true };
  }

  async function start(houseId) {
    const gate = canKnock(houseId);
    if (!gate.ok) { XDH.UI.toast(gate.why); return; }
    const npc = XDH.NPCS[XDH.run.houses[houseId].npcIdx];
    // v0.3 B5 + B8 — mode Kẹt Tiền: xóm nhớ mặt. Càng gõ nhiều nhà / càng nhiều ngày
    // thì NGHI NGỜ KHỞI ĐIỂM càng cao (mode ma sói giữ nguyên START gốc).
    const startState = { ...R.START };
    // v0.6 F1: mọi cú cộng KHỞI ĐIỂM cũng phải hiện số — người chơi đang bị trừ mà không biết vì sao.
    const startPops = [];
    if (XDH.isKetTien()) {
      const seen = XDH.KetTien.startSuspicion();
      if (seen > startState.suspicion)
        startPops.push(popEvent('house_seen', { suspicion: seen - startState.suspicion }));
      startState.suspicion = seen;
    }
    // v0.4 T3 (Q2=A): tai tiếng từ nhà khác cộng nghi khởi điểm — CODE cầm số, AI chỉ được nhắc miệng.
    const gossip = gossipStories(houseId);
    if (gossip.length) {
      startPops.push(popEvent('gossip', applyDeltas(startState, {
        suspicion: Math.min(XDH.GOSSIP.SUSP_CAP, XDH.GOSSIP.SUSP_PER_STORY * gossip.length)
      })));
    }
    // v0.4 T6 (Q3/Q4): nhà CŨ nhớ chuyện của CHÍNH họ qua đêm — chỉnh khởi điểm theo sổ,
    // số ở XDH.MEMORY (config). Thanh minh gỡ được: AI chấm tốt là điểm lên như thường.
    const mem = XDH.run.houses[houseId].memory;
    const pastEnts = (XDH.run.ledger || []).filter(e => e.houseId === houseId && e.night < XDH.run.night);
    let pastClaim = '';
    if (mem && mem.length && pastEnts.length) {
      const GOOD = ['invited', 'helped', 'meal_win'];
      if (pastEnts.some(e => e.events.some(ev => GOOD.includes(ev))))
        startPops.push(popEvent('memory_good', applyDeltas(startState, { trust: XDH.MEMORY.TRUST_GOOD })));
      if (pastEnts.some(e => e.events.some(ev => BAD_EVENTS.includes(ev))))
        startPops.push(popEvent('memory_bad', applyDeltas(startState, { suspicion: XDH.MEMORY.SUSP_BAD })));
      const lastC = [...pastEnts].reverse().find(e => e.claim);
      pastClaim = lastC ? lastC.claim : '';
    }
    active = {
      npc, houseId,
      seed: Math.floor(Math.random() * 100000),
      state: startState,
      history: [],
      secondsLeft: R.CONVO_SECONDS,
      startedAt: Date.now(),
      turns: 0,
      topicsHit: [],    // v2.0: chủ đề đã chạm — LỚP CODE của thanh thiện cảm
      playerTurns: 0,    // v2.0: đếm riêng LƯỢT NGƯỜI CHƠI NÓI (turns tính cả câu chào)
      inviteSpoken: false,  // v2.0: đã bắt AI nói câu mời chưa (một lần / cuộc)
      contraFired: [],  // outfit keys already penalized — contradiction hits ONCE per outfit (§1b)
      corroFired: [],   // v0.6 F3.2: đồ chống lưng lời khai thưởng ONCE per outfit / cuộc
      blandStreak: 0,   // v0.6 F4: đếm lượt nhạt liên tiếp → CODE bật mặt "chán"
      memeTurn: -99,    // v0.6 F2: lượt gần nhất có meme (trần 1 meme / 3 lượt)
      memeUsed: [],     // v0.6 F2: không lặp lại meme trong cùng cuộc
      leaked: false,    // v0.6 F5.1: đã rò rỉ ý định "sắp đuổi" chưa (một lần / cuộc)
      pressTier: 0,     // v1.1: nấc hỏi dồn hiện tại (0-3) — trả lời một câu là về 0
      pressTimer: null, // v1.1: đồng hồ im lặng đang chạy
      pressUsed: [],    // v1.1: câu thúc đã dùng — không lặp trong cùng cuộc
      glow: false,      // v1.2 ✨ nâng tầm đẹp trai: còn hiệu lực tới hết cuộc này
      mind: false,      // v1.2 🧠 máy đọc suy nghĩ: còn hiệu lực tới hết cuộc này
      topics: [],       // v0.6 F5.2: chủ đề người chơi ĐÃ chạm — dòng tiếc nuối bám vào đây
      finalTestPhase: null,   // §3 câu hỏi chốt: null → 'answering' (hard house only)
      finalTestPassed: false,
      claim: '',        // v0.4 T2: lời tự xưng khác-rỗng gần nhất (AI trả player_claim mỗi lượt)
      events: [],       // v0.4 T2: chuyện xảy ra trong cuộc này (contradiction / lo_lieu / …)
      gossip,           // v0.4 T3: chuyện xấu nghe từ nhà khác — gửi kèm mỗi lượt (rỗng thì không gửi)
      nightMemory: (mem && mem.length && pastEnts.length) ? mem : null,   // v0.4 T6
      pastClaim         // v0.4 T6: lời xưng cũ cho câu chào callback
    };
    // Hàng xóm NHỚ bạn trong cùng đêm (Lucas 08-09): rút lui rồi quay lại → nói tiếp chuyện cũ.
    const saved = XDH.run.houses[houseId].saved;
    if (saved) {
      active.state = { ...saved.state };
      active.history = saved.history.slice();
      active.contraFired = saved.contraFired.slice();
      active.corroFired = (saved.corroFired || []).slice();   // v0.6 F3.2: quay lại không được thưởng lại
      active.finalTestPassed = saved.finalTestPassed;
      active.claim = saved.claim || '';   // v0.4 T2: lời xưng theo người chơi khi quay lại (events KHÔNG mang theo — entry cũ đã ghi rồi)
      active.topicsHit = (saved.topicsHit || []).slice();   // v2.0: chủ đề đã chạm không mất khi quay lại
      active.playerTurns = saved.playerTurns || 0;
      active.resumed = true;
    }
    XDH.UI.openConvo(npc, active.state);
    XDH.UI.setFriend(friendPct(active.state, diffOf(npc)));   // v2.0: thanh thiện cảm hiện ngay
    // v2.0 — có đúng món đồ nhà này đang cần → nút ĐƯA ĐỒ hiện ra, nhãn đổi theo món
    const giveBtn = document.getElementById('btn-give-stick');
    const canGive = XDH.Mission && XDH.Mission.canGive(npc.id);
    giveBtn.style.display = canGive ? 'block' : 'none';
    if (canGive) giveBtn.textContent = XDH.Mission.giveLabel(npc.id);
    // v2.0 việc 2 — mốc GÕ CỬA (một lần mỗi ván, nếu không phễu phồng lên)
    if (XDH.Track) XDH.Track.once('knock', { npc: npc.id, detail: { night: XDH.run.night, houseId } });
    if (!saved) XDH.UI.floatNums(startPops);   // v0.6 F1: quay lại giữa đêm thì không cộng lại → không hiện lại
    tickTimer();
    active.timerId = setInterval(tickTimer, 1000);
    // NPC speaks first (scripted server-side greeting — free, sets the scene)
    await exchange('', true);
  }

  function tickTimer() {
    if (!active) return;
    active.secondsLeft--;
    XDH.UI.setTimer(active.secondsLeft);
    if (active.secondsLeft <= 0) {
      finish(false, 'Hết giờ — trời gần sáng, cửa đóng sầm. 🌅', 'timeout');
    }
  }

  async function playerSays(text) {
    if (!active || busy) return;
    text = (text || '').trim();
    if (!text) return;
    pressCancel();
    active.pressTier = 0;   // v1.1: chịu mở miệng là hàng xóm nguôi — về nấc 1
    // v2.0 việc 2 — mốc NÓI CÂU ĐẦU TIÊN: khúc rơi nhiều nhất của người mới
    if (XDH.Track) XDH.Track.once('first_line', { npc: active.npc.id, detail: { len: text.length } });
    await exchange(text, false);
  }

  async function exchange(playerText, isGreeting, finalAsk, inviteAsk) {
    if (!active) return;
    busy = true;
    XDH.UI.setBusy(true);
    pressCancel();               // v1.1: đang có lượt nói thì đồng hồ im lặng nghỉ
    const scoring = !isGreeting && !finalAsk && !inviteAsk;   // v2.0: lượt CÓ chấm điểm
    if (scoring) {
      XDH.UI.echoPlayer(playerText);
      XDH.markPlayed();          // đã nói được câu đầu tiên → hết là người mới, thôi dẫn dắt
      active.history.push({ role: 'player', text: playerText });
      XDH.UI.hideOpeners();
      if (XDH.isKetTien()) XDH.run.dayLines.push(playerText);   // B7: nguồn "lời nói dối buồn cười nhất"
      active.playerTurns++;
    }
    // v2.0 LỚP CODE của thanh thiện cảm — chạy TRƯỚC khi hỏi AI, vì nó không cần AI.
    // Nói trúng chủ đề là CHẮC CHẮN có điểm, dù não nào đang chạy hay đang chết.
    let freshTopics = [];
    if (scoring) {
      const before = active.topicsHit.slice();
      active.topicsHit = touchedTopics();
      freshTopics = active.topicsHit.filter(id => before.indexOf(id) < 0);
    }
    if (!isGreeting) XDH.UI.showThinking(active.npc);   // §6b: kill the 3-4s dead air
    let res;
    try {
      const r = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: active.npc.id,
          seed: active.seed,
          lang: XDH.lang,
          greet: !!isGreeting,
          // "NPC tự dẫn dắt": chỉ bật ở cuộc đầu tiên của người chưa từng chơi (?tut=0 để tắt)
          ...(isGreeting && XDH.isFirstEver() ? { firstEver: true } : {}),
          returning: !!active.resumed,
          secondsLeft: active.secondsLeft,
          doorThreshold: diffOf(active.npc).threshold,
          finalTestAsk: !!finalAsk,
          inviteAsk: !!inviteAsk,
          // v2.0 sổ đen: mã phiên + mã ván + đêm + lượt + thanh thiện cảm, để bảng đèn ghép lại được
          ...(XDH.Track ? { session: XDH.Track.session(), runId: XDH.Track.runId() } : {}),
          night: XDH.run.night,
          turn: active.playerTurns,
          friend: friendPct(active.state, diffOf(active.npc)),
          playerText,
          history: active.history.slice(-16),
          outfit: XDH.outfitDescription(XDH.run.outfit),
          state: active.state,
          pass: XDH.run.pass || '',
          // v0.6 F5.1: báo server biết nhân vật sắp bỏ cuộc → lời thoại khớp với bong bóng 💭
          ...(leakZone() ? { leakWarn: true } : {}),
          // v0.4 T3d: chưa có chuyện xấu → KHÔNG gửi trường này (không tốn token oan)
          ...(active.gossip.length ? { gossip: active.gossip.slice(0, 8) } : {}),
          // v0.4 T6: nhà cũ — trí nhớ đêm trước đi kèm mọi lượt (kể cả greet)
          ...(active.nightMemory ? { nightMemory: active.nightMemory, pastClaim: active.pastClaim } : {}),
          ...modeContext(),         // v0.3: mode + giờ (B6) + số nhà đã gõ (B5) + ngày (B8)
          // v1.0 hệ nhiệm vụ: chỉ mode ma sói mới gửi (missions.js tự gác cửa)
          ...(XDH.Mission ? XDH.Mission.convoContext(active.npc.id) : {}),
          // v1.0.1 hộp kính: ?debug=1 → server trả thêm vì-sao-chặn tín hiệu + có-viết-lại-vì-lặp
          ...(XDH.DEBUG ? { debug: true } : {})
        })
      });
      res = await r.json();
      if (!r.ok || !res.ok) throw new Error(res.error || ('HTTP ' + r.status));
    } catch (err) {
      XDH.UI.hideThinking();
      busy = false; XDH.UI.setBusy(false);
      XDH.UI.toast('Mất sóng với hàng xóm 😵 thử lại nhé (' + err.message + ')');
      pressArm();
      return;
    }
    XDH.UI.hideThinking();

    const ai = res.npc;
    const brain = res.brain || (res.scripted ? 'scripted' : '?');
    active.history.push({ role: 'npc', text: ai.dialogue, brain, verdict: ai.verdict || null });
    active.turns++;
    // v0.4 T2: AI tóm "người chơi đang xưng là gì" — giữ bản khác-rỗng gần nhất (T1: lượt lẻ có thể trả rỗng)
    if (ai.player_claim) active.claim = String(ai.player_claim).slice(0, 120);

    // ==== RULES LAYER — game code decides everything below ====
    // §1b: the AI only JUDGES (verdict enum); this table owns the numbers, identically
    // for all 3 brains, scaled by the house's difficulty tier (§2b).
    const st = active.state;
    const diff = diffOf(active.npc);
    if (scoring) {
      // ── v2.0 việc 6 — SỬA LỖI B: lượt 1 lúc nào cũng bị chấm "nhạt" (đo 6/6 lần sáng 21/08) ──
      // Hai lớp vá, cả hai do CODE cầm nên đổi não cũng không đổi luật:
      //  (a) Nói TRÚNG một chủ đề nhà đó mê → NÂNG mức chấm lên "đánh trúng", bất kể AI chấm gì.
      //      Chỉ nâng từ "nhạt"/"nghe sai sai" — bắt được nói dối lộ liễu thì vẫn phạt như thường.
      //  (b) Lượt NÓI ĐẦU TIÊN bị chấm "nhạt" → không trừ hứng thú/kiên nhẫn nữa (miễn phạt).
      let vName = ai.verdict;
      if (freshTopics.length && !ai.contradiction &&
          (vName === 'thuong' || vName === 'kha_nghi' || !XDH.VERDICTS[vName])) {
        vName = XDH.FIRST_TURN.FLOOR_ON_TOPIC;
      }
      const v = XDH.VERDICTS[vName] || XDH.VERDICTS.thuong;
      let dT = v.trust, dS = v.suspicion, dI = v.interest, dP = v.patience;
      let graced = false;
      if (XDH.FIRST_TURN.GRACE && active.playerTurns === 1 && vName === 'thuong') {
        dI = Math.max(0, dI); dP = Math.max(0, dP); graced = true;
      }
      if (dT > 0) dT = Math.round(dT * diff.gainMult);
      // v0.6 F1: cộng verdict TRƯỚC, đo mức THẬT ĐÃ CỘNG (sau khi kẹp 0-100) rồi mới cộng
      // các cú ngoài verdict. Popup và bảng ?debug=1 dùng CHUNG con số này — không tính lại lần hai.
      const appliedV = applyDeltas(st, { trust: dT, suspicion: dS, interest: dI, patience: dP });
      // LỚP CODE cộng thẳng cho mỗi chủ đề MỚI chạm được — số nằm ở XDH.FRIEND, một chỗ duy nhất.
      // CHỐNG CỘNG HAI LẦN (đo thật 21/08 bằng trình duyệt): một câu trúng chủ đề vừa được
      // NÂNG mức chấm lên "đánh trúng" (+21 tin ở nhà Ly) LẠI vừa được cộng thêm tin —
      // thành ra nói đúng MỘT câu là cửa mở ngay, hết game. Nay: đã nâng mức chấm rồi thì
      // phần thưởng CHÍNH LÀ mức chấm đó, chỉ cộng thêm HỨNG THÚ (thứ nuôi mạch nhiệm vụ).
      // Câu nào AI đã tự chấm tốt sẵn thì cú chạm chủ đề mới được cộng thêm chút lòng tin.
      const floored = vName !== ai.verdict;
      let appliedF = null;
      if (freshTopics.length) {
        appliedF = applyDeltas(st, {
          // Một CÂU chỉ được tính công MỘT chủ đề. Câu dài nhét ba từ khoá cùng lúc thì thanh
          // vẫn nhảy đủ ba nấc (đó là sự thật: họ ĐÃ chạm ba chuyện), nhưng điểm cộng ngay
          // lượt đó chỉ tính một — nếu không, một câu nhồi từ khoá là mở toang cửa nhà dễ.
          trust: floored ? 0 : XDH.FRIEND.TOPIC_TRUST,
          interest: XDH.FRIEND.TOPIC_INTEREST
        });
      }
      let contraApplied = false, appliedC = null;
      if (ai.contradiction && !active.contraFired.includes(outfitKey())) {
        active.contraFired.push(outfitKey());   // once per outfit-story pair
        appliedC = applyDeltas(st, { trust: diff.contra.trust, suspicion: diff.contra.susp });
        contraApplied = true;
      }
      // v0.6 F3.2 — cờ NGƯỢC LẠI của contradiction: đồ CHỐNG LƯNG lời khai → CODE thưởng.
      // AI chỉ bật cờ; số nằm ở XDH.DIFFICULTY[...].corro. Một lần / bộ đồ / cuộc.
      let corroApplied = false, appliedR = null;
      if (ai.corroboration && !ai.contradiction && diff.corro &&
          !active.corroFired.includes(outfitKey())) {
        active.corroFired.push(outfitKey());
        appliedR = applyDeltas(st, { trust: diff.corro.trust, suspicion: diff.corro.susp });
        corroApplied = true;
      }
      // v1.2 ✨ NÂNG TẦM ĐẸP TRAI — còn hiệu lực tới hết cuộc: câu nào được chấm TỐT thì
      // cộng thêm một ít tin. Vẫn là CODE cầm số (AI không biết món này tồn tại).
      let appliedG = null;
      if (active.glow && (ai.verdict === 'hop_ly' || ai.verdict === 'danh_trung')) {
        appliedG = applyDeltas(st, { trust: XDH.GLOW.BONUS_TRUST });
      }
      // v0.4 T2: sổ ghi "bị bắt quả tang" — mâu thuẫn đồ-vs-chuyện hoặc nói dối lộ rõ
      if (contraApplied) active.events.push('contradiction');
      if (ai.verdict === 'lo_lieu') active.events.push('lo_lieu');
      // score bookkeeping: most suspicious single moment
      const totalS = appliedV.suspicion + (appliedC ? appliedC.suspicion : 0);
      if (totalS > XDH.run.score.maxSuspDelta) {
        XDH.run.score.maxSuspDelta = totalS;
        XDH.run.score.maxSuspQuote = playerText;
        XDH.run.score.maxSuspNpc = active.npc.name;
      }
      // v0.6 F1 — popup: một dòng cho verdict, một dòng cho MỖI cú code cộng ngoài verdict.
      const en = XDH.lang === 'en';
      const vLab = XDH.POP_VERDICT[ai.verdict] || XDH.POP_VERDICT.thuong;
      const vNum = XDH.UI.popDeltas(appliedV);
      XDH.UI.floatNums([
        { text: (en ? vLab.en : vLab.vi) + (vNum ? ' ' + vNum : ''), cls: vLab.cls },
        appliedF ? popEvent('friend_topic', appliedF) : null,
        graced ? popEvent('first_grace', null) : null,
        appliedC ? popEvent('contradiction', appliedC) : null,
        appliedR ? popEvent('corroboration', appliedR) : null,
        appliedG ? popEvent('glow_bonus', appliedG) : null
      ]);
      XDH.UI.debugTurn({
        verdict: vName + (vName !== ai.verdict ? ' (AI chấm ' + ai.verdict + ', code nâng lên)' : ''),
        friend: friendPct(st, diff) + '% (code ' + friendCode() + ' · ai ' + friendAi(st, diff) + ')',
        dT: appliedV.trust, dS: appliedV.suspicion, dI: appliedV.interest, dP: appliedV.patience,
        contradiction: contraApplied, corroboration: corroApplied,
        extra: [appliedC ? `mâu-thuẫn tin ${appliedC.trust} nghi ${appliedC.suspicion}` : '',
                appliedR ? `chống-lưng tin ${appliedR.trust} nghi ${appliedR.suspicion}` : '',
                // v1.0.1 hộp kính nhiệm vụ: tín hiệu thô → sau cổng (kèm lý do) + cờ viết-lại-vì-lặp
                res.debug ? `nv ${res.debug.mission ? res.debug.mission.stage + '·manh mối ' + res.debug.mission.clues : '—'}`
                  + ` tín hiệu ${res.debug.signal_raw || '·'}→${res.debug.signal_final || '·'}`
                  + (res.debug.gate_reason && res.debug.gate_reason !== 'qua' ? ` [${res.debug.gate_reason}]` : '')
                  + (res.debug.retried ? ' · ĐÃ BẮT VIẾT LẠI VÌ LẶP' : '')
                  + (res.debug.scripted_vi ? ' · KỊCH BẢN (' + res.debug.scripted_vi + ')' : '')
                  + (res.debug.bench && Object.keys(res.debug.bench).length
                      ? ' · não nghỉ: ' + Object.entries(res.debug.bench).map(([n, s]) => n + ' ' + s + 's').join(', ') : '') : ''].filter(Boolean).join(' | '),
        brain: res.brain || (res.scripted ? 'kịch bản' : '?'),
        state: st
      });
      // v0.6 F4 — mặt CHÁN do CODE bật, không nhờ AI: nói nhạt liên tiếp là thấy ngay.
      active.blandStreak = (vName === 'thuong' || vName === 'kha_nghi')
        ? active.blandStreak + 1 : 0;
      // v0.6 F2 — CODE chọn meme (AI không được chọn). Sự kiện ưu tiên hơn verdict;
      // cổng tần suất nằm trong XDH.Memes (trần 1 meme / 3 lượt, không lặp trong cuộc).
      active.pendingMeme =
        (contraApplied ? XDH.Memes.forEvent('contradiction', active) : null) ||
        (corroApplied  ? XDH.Memes.forEvent('corroboration', active) : null) ||
        XDH.Memes.forVerdict(vName, active);
    }
    // §3 final-test grading: the player's answer to the "câu hỏi chốt" decides pass/spike.
    if (scoring && active.finalTestPhase === 'answering') {
      if (ai.verdict === 'hop_ly' || ai.verdict === 'danh_trung') {
        active.finalTestPassed = true;
      } else {
        // fumbled the make-or-break question — v0.6 F1: hiện số, đừng để người chơi đoán
        XDH.UI.floatNums([popEvent('final_fail', applyDeltas(st, { suspicion: 10 }))]);
      }
      active.finalTestPhase = null;
    }

    XDH.UI.setMeters(st);
    XDH.UI.setFriend(friendPct(st, diff));      // v2.0: thanh thiện cảm cập nhật cùng lúc với cửa
    XDH.UI.setDoorStage(doorStage(st, diff));

    // Type out the NPC line with blips, then judge.
    await XDH.UI.typeNpcLine(ai.dialogue, shownEmotion(ai, active), active.npc);
    if (!active) return;                       // rút lui / hết giờ ngay trong lúc gõ chữ
    if (active.pendingMeme) { XDH.UI.showMeme(active.pendingMeme); active.pendingMeme = null; }
    XDH.UI.setConvoState(ai.convo_state);
    // v1.0 — tín hiệu nhiệm vụ từ AI: CODE trong missions.js xét ngưỡng quan tâm + nhịp manh mối
    // rồi mới cho máy trạng thái nhích (AI không cầm game). Đặt SAU khi gõ xong chữ → popup 📱
    // hiện đúng lúc người chơi vừa đọc xong câu "rõ chuyện".
    if (!isGreeting && ai.mission_signal && XDH.Mission) {
      XDH.Mission.onSignal(ai.mission_signal, active.npc.id, st, { turns: active.turns, houseId: active.houseId });
    }
    // v1.0.1 "ấm dần": AI muốn khai mà kẹt cổng quan tâm → CODE nhích +hứng thú (số ở config)
    if (!isGreeting && ai.mission_probe && XDH.Mission) XDH.Mission.onProbe(st, active.npc.id);
    // v0.6 F5.1 — bong bóng 💭 RÒ RỈ Ý ĐỊNH trước 1 lượt. CODE quyết, không nhờ AI.
    const leak = leakThought();
    if (leak) XDH.UI.setThought(leak);
    // v1.2 🧠 máy đọc suy nghĩ: bật rồi thì lượt NÀO cũng thấy — và thấy luôn chỗ họ đang thèm nghe
    else if (active.mind) XDH.UI.setThought((ai.thought ? ai.thought + ' ' : '') + '💭 ' + craveLine());
    else if (ai.thought) XDH.UI.setThought(ai.thought);
    // §4: desktop auto-focus so the player can answer immediately (mobile: no keyboard pop-up)
    if (window.matchMedia('(pointer: fine)').matches) {
      setTimeout(() => { const t = document.getElementById('text-in'); if (!t.disabled) t.focus(); }, 60);
    }

    if (isGreeting) { busy = false; XDH.UI.setBusy(false); pressArm(); return; }

    // ══ v2.0 việc 5 (đáp án 6) — SỬA LỖI A: đủ điểm mà cửa vẫn không mở ══════════
    // Đo thật 21/08: tin 62 >= ngưỡng 55, nghi 12, mà `invite_intent` của AI false 4/4 lượt
    // → cửa đóng. Có đường tự lành cho chiều ngược lại, KHÔNG có cho chiều này.
    // Luật mới: THANH THIỆN CẢM chạm 100% là CODE MỞ CỬA. AI không còn quyền phủ quyết,
    // chỉ còn quyền DIỄN — nếu nó chưa nói câu mời thì mình bắt nó nói (khối inviteAsk dưới).
    let doorOpens = friendPct(st, diff) >= 100 && st.suspicion < R.SUSPICION_BLOCKS;
    // Đường tự lành CŨ giữ nguyên: AI thật lòng muốn mời mà thanh chưa đầy → nhích +4 mỗi lượt.
    if (!doorOpens && ai.invite_intent && st.suspicion < R.SUSPICION_BLOCKS) {
      XDH.UI.floatNums([popEvent('invite_nudge', applyDeltas(st, { trust: 4 }))]);
      XDH.UI.setMeters(st);
      XDH.UI.setFriend(friendPct(st, diff));
      XDH.UI.setDoorStage(doorStage(st, diff));
      doorOpens = friendPct(st, diff) >= 100;
    }
    // §3/§2b: hard house never opens on the first invite — one "câu hỏi chốt" first.
    if (doorOpens && diff.finalTest && !active.finalTestPassed) {
      doorOpens = false;
      if (active.finalTestPhase !== 'answering') {
        active.finalTestPhase = 'answering';
        await exchange('', false, true);   // NPC asks the make-or-break question
        return;
      }
    }
    const failed = st.suspicion >= R.SUSPICION_FAIL || st.patience <= 0 || !!ai.shutdown;
    // 🚓 Chuyện quá vô lý (nghi kịch trần, hoặc bị đuổi vì nói dối lộ liễu) → NPC gọi công an
    if (failed) {
      active.policeTrigger = st.suspicion >= R.SUSPICION_FAIL ||
        (!!ai.shutdown && ai.verdict === 'lo_lieu');
    }

    if (doorOpens) {
      // Thanh đầy mà lời thoại vừa rồi chưa hề mời → nhét MỘT lượt "đạo diễn" để AI nói câu mời
      // cho khớp với việc cửa đang mở. Đúng khuôn finalTestAsk. Một lần / cuộc, không lặp vô tận.
      if (!ai.invite_intent && !active.inviteSpoken && !inviteAsk) {
        active.inviteSpoken = true;
        XDH.UI.floatNums([popEvent('door_forced', null)]);
        await exchange('', false, false, true);
        return;
      }
      XDH.UI.setDoorStage(4);
      if (XDH.Track) XDH.Track.ev('door_open', { npc: active.npc.id,
        detail: { turns: active.playerTurns, friend: friendPct(st, diff), night: XDH.run.night } });
      // v0.3 B2 — mode Kẹt Tiền: cửa mở KHÔNG phải để cắn, mà chuyển sang "màn xin".
      if (XDH.isKetTien()) { await askOutcome(); return; }
      // §0 #4: the door is open — the KILL button takes it from here (no auto-finish).
      busy = true;
      XDH.UI.setBusy(true);
      document.getElementById('btn-kill').style.display = 'block';
    } else if (failed) {
      const why = st.suspicion >= R.SUSPICION_FAIL ? 'Bị nghi tới bến — cửa khoá, đèn tắt. 🔒'
        : st.patience <= 0 ? 'Hàng xóm hết kiên nhẫn, đóng sầm cửa. 😤'
        : 'Hàng xóm đuổi thẳng. Về thay đồ đi. 🚪💨';
      finish(false, why);
    } else {
      busy = false; XDH.UI.setBusy(false);
      pressArm();                 // v1.1: tới lượt người chơi → đồng hồ im lặng chạy lại
    }
  }

  function finish(won, message, cause) {
    if (!active) return;
    clearInterval(active.timerId);
    pressCancel();               // v1.1: cuộc đóng thì đồng hồ im lặng tắt theo
    // v0.4 T2: chốt sổ — thắng = được mời vào; thua = công an rượt / hết giờ / bị đuổi
    ledgerLog(won ? 'invited' : (active.policeTrigger ? 'police' : (cause || 'kicked')));
    const h = XDH.run.houses[active.houseId];
    const elapsed = Math.round((Date.now() - active.startedAt) / 1000);
    if (won) {
      h.won = true;
      XDH.UI.setDoorStage(4);   // fully open
      XDH.run.score.entered++;
      if (elapsed < XDH.run.score.fastest) {
        XDH.run.score.fastest = elapsed;
        XDH.run.score.bestOutfit = XDH.outfitLabel(XDH.run.outfit);
      }
      XDH.Blips.jingle('win');
    } else {
      if (!h.failedOutfits.includes(outfitKey())) h.failedOutfits.push(outfitKey());
      XDH.Blips.jingle('lose');
    }
    if (XDH.isKetTien()) XDH.run.knocked++;   // B5: xóm đếm số lần bạn gõ cửa hôm nay
    XDH.run.transcripts.push({
      npc: active.npc.name, won, elapsed,
      outfit: XDH.outfitLabel(XDH.run.outfit),
      lines: active.history.slice()
    });
    const houseId = active.houseId;
    // Khoá ô nhập suốt 2,6 giây màn kết đang chạy — trước đây người chơi gõ thêm được
    // một câu vào lúc này và engine văng lỗi vì cuộc nói chuyện đã đóng.
    busy = true;
    XDH.UI.setBusy(true);
    const police = !won && !!active.policeTrigger;
    // v2.0 việc 2 — ba mốc kết cục, kèm CÂU CUỐI CÙNG người chơi nói (bảng đèn đọc chỗ này
    // để trả lời "người mới vấp ở đâu"). Gửi rồi đi, không chờ.
    if (XDH.Track) {
      const lastSaid = (active.history.filter(h => h.role === 'player').pop() || {}).text || '';
      const det = {
        cause: won ? 'được mời vào' : (police ? 'bị công an' : (cause || 'bị đuổi')),
        turns: active.playerTurns, night: XDH.run.night,
        friend: friendPct(active.state, diffOf(active.npc)),
        trust: active.state.trust, susp: active.state.suspicion,
        last: String(lastSaid).slice(0, 200)
      };
      XDH.Track.ev(won ? 'win' : 'lose', { npc: active.npc.id, detail: det });
      if (police) XDH.Track.ev('police', { npc: active.npc.id, detail: det });
    }
    // v0.6 F2 + F5.2: thua thì có meme phản ứng, và một dòng tiếc nuối bám đúng thẻ nhân vật.
    if (!won) XDH.UI.showMeme(XDH.Memes.forEvent(police ? 'police' : 'kicked', active));
    const regret = won ? '' : regretLine();
    XDH.UI.endConvo(message, won, () => {
      active = null;
      busy = false;
      XDH.UI.setBusy(false);
      XDH.UI.refreshHud();
      if (won) XDH.UI.afterHouseWon();   // §2: loot → night-quota check → next night / win
      // 🚓 v0.9 (Lucas 2026-08-12): ma sói THUA NHÀ NÀO là công an tới nhà đó — cửa vừa đóng
      // là xe ò í e vào, rượt 20 giây. (Kẹt Tiền không bị: xin không được đâu phải tội.)
      else if (!XDH.isKetTien() && XDH.startPoliceChase) XDH.startPoliceChase(houseId);
      else if (XDH.curtainPeek) XDH.curtainPeek(houseId);   // §2 fail visual: eyes behind the curtain
      if (regret) XDH.UI.showRegret(regret);                // v0.6 F5.2: hiện cùng lúc "mắt sau rèm"
    });
  }

  // ===== v0.3 B2 + B3 — "màn xin" của mode Kẹt Tiền =====
  // Hàng xóm đã tin đủ để MUỐN GIÚP. AI chỉ chọn LOẠI kết quả (tiền / đồ ăn / cả hai /
  // mời vào ăn cơm / nhờ việc vặt / từ chối / quay lại sau); CODE cầm bảng tiền (như §1b).
  async function askOutcome() {
    const npc = active.npc, st = active.state;
    busy = true; XDH.UI.setBusy(true);
    XDH.UI.showThinking(npc);
    let ai = null;
    try {
      const r = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: npc.id, outcomeAsk: true, seed: active.seed, lang: XDH.lang,
          history: active.history.slice(-16),
          outfit: XDH.outfitDescription(XDH.run.outfit),
          state: st, pass: XDH.run.pass || '',
          ...modeContext()
        })
      });
      const res = await r.json();
      if (res.ok && res.npc) ai = res.npc;
    } catch { /* rơi xuống mặc định bên dưới */ }
    XDH.UI.hideThinking();

    // Không có mạng/AI → vẫn phải có kết quả: cho tiền (mức thấp) để không kẹt người chơi.
    const outcome = (ai && XDH.OUTCOMES.includes(ai.outcome)) ? ai.outcome : 'tien';
    if (ai && ai.dialogue) {
      active.history.push({ role: 'npc', text: ai.dialogue, verdict: 'outcome:' + outcome });
      await XDH.UI.typeNpcLine(ai.dialogue, ai.emotion || 'amused', npc);
      if (ai.thought) XDH.UI.setThought(ai.thought);
    }
    const result = XDH.KetTien.resolve(outcome, npc, st);
    finishKetTien(result, outcome);
  }

  function finishKetTien(result, outcome) {
    if (!active) return;
    clearInterval(active.timerId);
    pressCancel();               // v1.1
    // v0.4 T2: chốt sổ Kẹt Tiền — mời cơm = thắng, được cho = helped, còn lại theo loại
    ledgerLog(result.win ? 'meal_win'
      : outcome === 'tu_choi' ? 'refused'
      : outcome === 'quay_lai_sau' ? 'come_back_later'
      : (result.moneyK || result.foodK) ? 'helped' : 'refused');
    const h = XDH.run.houses[active.houseId];
    const houseId = active.houseId;
    const got = !!(result.moneyK || result.foodK || result.win);
    if (result.lock) h.done = true;              // nhà này hôm nay xong (cho rồi hoặc từ chối hẳn)
    XDH.run.knocked++;
    XDH.run.transcripts.push({
      npc: active.npc.name, won: got, elapsed: Math.round((Date.now() - active.startedAt) / 1000),
      outfit: XDH.outfitLabel(XDH.run.outfit), lines: active.history.slice()
    });
    XDH.Blips.jingle(got ? 'win' : 'lose');
    // v2.0 việc 2 — Kẹt Tiền cũng phải vào phễu, nếu không nửa số người chơi vô hình
    if (XDH.Track) {
      const lastSaid = (active.history.filter(h => h.role === 'player').pop() || {}).text || '';
      XDH.Track.ev(got ? 'win' : 'lose', { npc: active.npc.id, detail: {
        cause: 'kết quả xin: ' + outcome, turns: active.playerTurns, night: XDH.run.night,
        last: String(lastSaid).slice(0, 200)
      } });
    }
    busy = true; XDH.UI.setBusy(true);          // xem chú thích ở finish(): khoá ô nhập lúc màn kết chạy
    // v0.6 F5.2 — không xin được gì cũng là "hụt", cũng đáng được biết mình hụt ở đâu.
    const regret = got ? '' : regretLine();
    XDH.UI.endConvo(result.title, got, () => {
      active = null;
      busy = false; XDH.UI.setBusy(false);
      XDH.UI.refreshHud();
      XDH.KetTien.showGive(result, () => {
        if (result.win) XDH.KetTien.showBoard(true);            // được mời cơm = thắng ngày luôn
        else if (!got && XDH.curtainPeek) XDH.curtainPeek(houseId);
        if (regret) XDH.UI.showRegret(regret);
      });
    });
  }

  // §0 #4 — KILL button pressed on a real house: silhouette scene, then the win flow.
  async function kill() {
    if (!active) return;
    document.getElementById('btn-kill').style.display = 'none';
    await XDH.UI.playKillScene();
    finish(true, XDH.lang === 'en'
      ? '🚪✨ "COME IN!" — you wiped your feet politely first. A werewolf with manners.'
      : '🚪✨ "MỜI VÀO!" — bạn lịch sự lau chân rồi bước vào. Một con ma sói có giáo dục.');
  }

  // ===== v1.0 C4 — nút 🤳 ĐƯA GẬY SELFIE: kịch bản thuần code (0đ, chạy được cả khi não chết) =====
  // Trả đồ → cảnh vui mừng (khuôn cảm xúc phan_khich sẵn có) → CODE trả +50k + tin (đáp án 7).
  async function giveStick() {
    if (!active || busy || !XDH.Mission || !XDH.Mission.canGive(active.npc.id)) return;
    busy = true; XDH.UI.setBusy(true);
    document.getElementById('btn-give-stick').style.display = 'none';
    const echo = XDH.Mission.giveEcho(active.npc.id);
    XDH.UI.echoPlayer(echo[0]);
    active.history.push({ role: 'player', text: echo[1] });
    const line = XDH.Mission.thankLine(active.npc.id);
    active.history.push({ role: 'npc', text: line, brain: 'kịch bản', verdict: null });
    await XDH.UI.typeNpcLine(line, 'phan_khich', active.npc);
    if (!active) return;
    XDH.Mission.reward(active.state, active.npc.id);   // máy trạng thái → xong; số thưởng ở config
    XDH.Blips.jingle('win');
    XDH.UI.setMeters(active.state);
    XDH.UI.setFriend(friendPct(active.state, diffOf(active.npc)));
    XDH.UI.setDoorStage(doorStage(active.state, diffOf(active.npc)));
    // 😇 Sói Hiền: 0 cú cắn cả ván + nhiệm vụ xong → màn kết riêng, hiện ngay (khỏi chờ bình minh;
    // bình minh vẫn là lưới đỡ trong ui.js dawnFail nếu sau này muốn đổi nhịp)
    if (XDH.Mission.hienEligible()) {
      XDH.UI.setBusy(true);                    // giữ khoá ô nhập trong lúc chờ màn kết
      setTimeout(() => {
        if (!active) return;
        clearInterval(active.timerId);
        XDH.run.transcripts.push({
          npc: active.npc.name, won: true, elapsed: Math.round((Date.now() - active.startedAt) / 1000),
          outfit: XDH.outfitLabel(XDH.run.outfit), lines: active.history.slice()
        });
        active = null; busy = false;
        XDH.UI.setBusy(false);
        XDH.UI.closeConvo();
        XDH.Mission.showHien();
      }, 2200);
      return;
    }
    busy = false; XDH.UI.setBusy(false);
  }

  // §2 powerups — bought at the cart, used mid-conversation. All effects code-owned.
  async function useItem(id) {
    if (!active || busy) return;
    const inv = XDH.run.inv;
    if (!inv[id]) return;
    if (id === 'gift') {
      inv.gift--;
      const st = active.state;
      XDH.UI.floatNums([popEvent('gift', applyDeltas(st, { trust: XDH.GIFT_TRUST }))]);
      XDH.UI.echoPlayer('(lấy ly trà sữa nóng ra tặng) 🧋');
      active.history.push({ role: 'player', text: '(Người lạ tặng bạn một ly trà sữa nóng còn nguyên tem quán.)' });
      XDH.UI.setThought('Ai mà chê trà sữa khuya bao giờ… dễ thương ghê.');
      XDH.UI.setMeters(st);
      XDH.UI.setFriend(friendPct(st, diffOf(active.npc)));
      XDH.UI.setDoorStage(doorStage(st, diffOf(active.npc)));
    } else if (id === 'glow') {
      // v1.2 ✨ NÂNG TẦM ĐẸP TRAI: +10 tin ngay + cờ "nói gì cũng dễ tin" tới hết cuộc này.
      inv.glow--;
      const st = active.state;
      active.glow = true;
      XDH.UI.floatNums([popEvent('glow', applyDeltas(st, { trust: XDH.GLOW.TRUST_NOW }))]);
      XDH.UI.echoPlayer(XDH.lang === 'en'
        ? '(fixes their hair and collar — suddenly glowing) ✨'
        : '(vuốt lại tóc, chỉnh cổ áo — bỗng sáng bừng cả góc hẻm) ✨');
      active.history.push({ role: 'player', text: '(Người lạ bỗng chỉnh trang lại, trông sáng sủa dễ nhìn hẳn ra.)' });
      XDH.UI.setThought(XDH.lang === 'en'
        ? 'Wait… looking closer, they’re actually not bad at all.'
        : 'Ủa… nhìn kỹ lại thấy cũng dễ nhìn ghê ta.');
      XDH.UI.setMeters(st);
      XDH.UI.setFriend(friendPct(st, diffOf(active.npc)));
      XDH.UI.setDoorStage(doorStage(st, diffOf(active.npc)));
    } else if (id === 'mind') {
      // v1.2 🧠 MÁY ĐỌC SUY NGHĨ: tới hết cuộc này, lượt nào cũng lộ suy nghĩ + chỗ họ thèm nghe.
      inv.mind--;
      active.mind = true;
      XDH.UI.floatNums([popEvent('mind', null)]);
      XDH.UI.setThought('💭 ' + craveLine());
      XDH.UI.toast(XDH.lang === 'en'
        ? '🧠 Mind reader ON — you now see what they are craving every turn.'
        : '🧠 Máy đọc suy nghĩ BẬT — từ giờ lượt nào cũng thấy họ đang thèm nghe gì.');
    } else if (id === 'hourglass') {
      inv.hourglass--;
      active.secondsLeft += 45;
      XDH.UI.setTimer(active.secondsLeft);
      XDH.UI.toast('⏳ Trời chậm sáng thêm 45 giây!');
    } else if (id === 'hint') {
      inv.hint--;
      XDH.UI.toast('💡 Quân sư đang nghĩ…');
      try {
        const r = await fetch('/api/converse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            npcId: active.npc.id, hintAsk: true, seed: active.seed, lang: XDH.lang,
            history: active.history.slice(-16),
            outfit: XDH.outfitDescription(XDH.run.outfit),
            state: active.state, pass: XDH.run.pass || ''
          })
        });
        const res = await r.json();
        if (!res.ok || !res.hint) throw new Error('no hint');
        XDH.UI.showHint(res.hint);
      } catch {
        inv.hint++;   // refund
        XDH.UI.toast('Quân sư ngủ gật — thử lại nhé.');
      }
    } else if (id === 'wardrobe') {
      inv.wardrobe--;
      XDH.UI.openWardrobe();   // change outfit right at the door
    }
    XDH.UI.renderConvoItems();
    XDH.UI.refreshHud();
  }

  function leave() {
    if (!active) return;
    clearInterval(active.timerId);
    pressCancel();               // v1.1
    ledgerLog('left');   // v0.4 T2: rút lui cũng vào sổ
    if (XDH.Track) XDH.Track.ev('quit', { npc: active.npc.id,
      detail: { cause: 'rút lui giữa chừng', turns: active.playerTurns, night: XDH.run.night,
                friend: friendPct(active.state, diffOf(active.npc)) } });
    // Lưu trí nhớ hàng xóm cho lần quay lại trong đêm (reset khi qua đêm mới)
    XDH.run.houses[active.houseId].saved = {
      state: { ...active.state },
      history: active.history.slice(),
      contraFired: active.contraFired.slice(),
      corroFired: active.corroFired.slice(),   // v0.6 F3.2
      finalTestPassed: active.finalTestPassed,
      claim: active.claim,
      topicsHit: active.topicsHit.slice(),     // v2.0
      playerTurns: active.playerTurns
    };
    XDH.run.transcripts.push({
      npc: active.npc.name, won: false, elapsed: Math.round((Date.now() - active.startedAt) / 1000),
      outfit: XDH.outfitLabel(XDH.run.outfit), lines: active.history.slice(), left: true
    });
    if (XDH.isKetTien()) XDH.run.knocked++;
    active = null; busy = false;
    XDH.UI.closeConvo();
    XDH.UI.refreshHud();
  }

  // ---- ?press=test — tay nắm cho máy kiểm (Playwright). Không ảnh hưởng game thường ----
  if (/[?&]press=test/.test(location.search)) {
    XDH.PressTest = {
      st: () => (active ? { tier: active.pressTier, armed: !!active.pressTimer,
                            patience: active.state.patience, used: active.pressUsed.slice(),
                            glow: active.glow, mind: active.mind } : null),
      fire: () => pressFire(),
      arm: pressArm,
      cancel: pressCancel,
      poke: pressPoke,
      setTier: (n) => { if (active) active.pressTier = n; },
      lastLine: () => (active ? (active.history.filter(h => h.role === 'npc').pop() || {}).text || '' : '')
    };
  }

  // ---- ?friend=test — tay nắm cho máy kiểm thanh thiện cảm (không ảnh hưởng game thường) ----
  if (/[?&]friend=test/.test(location.search)) {
    XDH.FriendTest = {
      st: () => (active ? {
        code: friendCode(), ai: friendAi(active.state, diffOf(active.npc)),
        shown: friendPct(active.state, diffOf(active.npc)),
        topics: active.topicsHit.slice(), all: topicsOf(active.npc.id).map(w => w.id),
        door: doorStage(active.state, diffOf(active.npc)),
        state: { ...active.state }, playerTurns: active.playerTurns,
        inviteSpoken: active.inviteSpoken
      } : null),
      say: (text) => playerSays(text),
      setState: (o) => { if (active) Object.assign(active.state, o); },
      npc: () => (active ? active.npc.id : null)
    };
  }

  return { start, playerSays, leave, canKnock, useItem, kill, isActive: () => !!active,
           giveStick,               // v1.0 hệ nhiệm vụ
           pressPoke, pressCancel,  // v1.1 đồng hồ im lặng (ui.js gọi khi gõ phím / bấm mic)
           compressNightMemory };   // v0.4 T5
})();
