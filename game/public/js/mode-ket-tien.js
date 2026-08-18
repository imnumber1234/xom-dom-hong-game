// MODE "KẸT TIỀN" (plan-v0.3-beggar.md, phương án A).
// KHÔNG có engine hội thoại mới ở đây: verdict enum, cửa 4 nấc, bong bóng 💭, STT, tiệm
// đều dùng lại y nguyên của mode ma sói. File này chỉ cầm ĐIỀU KIỆN THẮNG của chế độ 2:
// mục tiêu bữa ăn · ví tiền · kết quả một lượt xin · trí nhớ xuyên nhà · giờ · bảng tổng kết.
XDH.KetTien = (function () {
  const $ = (id) => document.getElementById(id);
  const t = (vi, en) => (XDH.lang === 'en' ? en : vi);

  // ---------- ngày mới: bốc món ăn hôm nay (Q2: ngẫu nhiên 15k-60k) ----------
  function startDay(dayNo) {
    const r = XDH.run;
    r.night = dayNo;                       // "đêm" của engine = "ngày" của mode này
    r.meal = XDH.MEALS[Math.floor(Math.random() * XDH.MEALS.length)];
    // Ngày mới lại trắng tay — đúng tiền đề "kẹt tiền". Nếu để dành tiền hôm trước thì
    // ngày sau chỉ việc ra quán ăn, khỏi gõ cửa nhà nào (đồ nghề đã mua thì vẫn giữ).
    r.money = XDH.TEST ? XDH.TEST_MONEY : 0;   // v1.2: ?test=1 thì ngày nào cũng có tiền để thử đồ
    r.food = 0;                            // đồ ăn xin được, quy ra k
    r.knocked = 0;                         // B5: số nhà đã gõ hôm nay
    r.gave = [];                           // ai cho gì — cho bảng tổng kết B7
    r.dayLines = [];                       // mọi câu người chơi nói hôm nay (B7 "lời nói dối buồn cười nhất")
    r.dayWon = null;                       // thắng ngày kiểu gì: 'an' (ăn ở quán) · 'moi_com'
    r.enteredTonight = 0;
    r.dawnHandled = false;
    r.nightStart = Date.now();
    // v0.4 T5: ngày mới — hội thoại quên, SỔ thì nhớ (đồng bộ cùng cách với newNight của ma sói)
    if (dayNo > 1 && XDH.Convo && XDH.Convo.compressNightMemory) XDH.Convo.compressNightMemory();
    r.houses.forEach(h => { h.won = false; h.done = false; h.failedOutfits = []; h.saved = null; });  // ngày mới, xóm quên hội thoại
  }

  const mealLabel = () => {
    const m = XDH.run.meal;
    return m.emoji + ' ' + t(m.label, m.label_en);
  };
  const needLeft = () => Math.max(0, XDH.run.meal.price - XDH.run.food - XDH.run.money);
  const priceLeft = () => Math.max(0, XDH.run.meal.price - XDH.run.food);   // số tiền phải trả ở xe bánh mì
  const canEat = () => XDH.run.money >= priceLeft();

  // ---------- B6: giờ trong ngày (10h sáng → 18h30 chiều) đưa vào prompt ----------
  function dayProgress() {
    const r = XDH.run;
    return Math.min(1, (Date.now() - r.nightStart) / (XDH.RULES.DAY_MINUTES * 60000));
  }
  function hourNow() {
    const h = 10 + dayProgress() * 8.5;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10;
    return { hh, mm, text: hh + ' giờ ' + (mm ? mm : '') };
  }
  function timeHint() {
    const { hh } = hourNow();
    if (hh < 12) return t('buổi sáng, xóm còn đông người qua lại', 'late morning, the street is still busy');
    if (hh < 14) return t('giữa trưa, nắng gắt, nhiều nhà đang ngủ trưa', 'high noon, hot, most people are napping');
    if (hh < 16) return t('đầu giờ chiều', 'early afternoon');
    if (hh < 17.5) return t('xế chiều, sắp tới giờ cơm', 'late afternoon, close to dinner time');
    return t('trời sắp tối, hàng xóm cảnh giác hơn hẳn', 'almost dark — neighbours are noticeably warier');
  }

  // ---------- B5 + B8: nghi ngờ KHỞI ĐIỂM (xóm nhớ mặt) ----------
  function startSuspicion() {
    const r = XDH.run;
    const base = XDH.RULES.START.suspicion;
    const fromHouses = r.knocked * XDH.KT.SUSP_PER_HOUSE;
    const fromDays = Math.max(0, r.night - 3) * XDH.KT.SUSP_PER_DAY_AFTER_3;
    return Math.min(XDH.KT.MAX_START_SUSP, base + fromHouses + fromDays);
  }

  // ---------- Q-B4: 3 câu mở gợi ý — chỉ ngày 1, 2 nhà đầu ----------
  const showOpeners = () => XDH.run.night === 1 && XDH.run.knocked < 2;

  // ---------- B3: CODE cầm bảng tiền, AI chỉ chọn LOẠI kết quả ----------
  // amount = mức thấp + phần thưởng theo lòng tin lúc chốt (tin càng cao cho càng đậm).
  function amountFor(range, trust, threshold) {
    const t01 = Math.max(0, Math.min(1, (trust - threshold) / (100 - threshold)));
    const raw = range.min + (range.max - range.min) * (0.35 + 0.65 * t01) * (0.85 + Math.random() * 0.3);
    return Math.max(range.min, Math.min(range.max, 5 * Math.round(raw / 5)));
  }

  // Trả về { title, body, moneyK, foodK, win, lock, endConvo }
  function resolve(outcome, npc, state) {
    const r = XDH.run;
    // Phải dùng ĐÚNG ngưỡng đã hạ của mode này (giống convo.js diffOf), nếu lấy ngưỡng gốc
    // của ma sói thì "tin càng cao cho càng đậm" không bao giờ chạy — luôn ra mức sàn.
    const base = XDH.DIFFICULTY[npc.id];
    const diff = { ...base, threshold: Math.max(40, base.threshold - XDH.KT.THRESHOLD_DROP) };
    const range = XDH.GIVE[npc.id] || XDH.GIVE.sinh_vien;
    const food = XDH.FOOD_GIFTS[Math.floor(Math.random() * XDH.FOOD_GIFTS.length)];
    const foodName = t(food.label, food.label_en);
    let moneyK = 0, foodK = 0, win = false, lock = true;
    let title = '', body = '';

    if (outcome === 'moi_com') {
      win = true;
      title = t('🍚 ĐƯỢC MỜI VÀO ĂN CƠM!', '🍚 INVITED IN FOR DINNER!');
      body = t(`${npc.name.split(' (')[0]} kéo ghế ra: "Vô đây ăn một bữa cho ấm bụng, bày đặt khách sáo!"<br>Không một đồng nào đổi chủ — mà bụng no căng. <b>Thắng ngày hôm nay.</b>`,
        `${npc.name.split(' (')[0]} pulls out a chair: "Come in and eat with us, no need to be shy!"<br>Not a single đồng changed hands — and you are full. <b>You win the day.</b>`);
    } else if (outcome === 'viec_vat') {
      moneyK = amountFor(XDH.CHORE, state.trust, diff.threshold);
      title = t('🧹 LÀM VIỆC VẶT LẤY TIỀN', '🧹 ODD JOB FOR CASH');
      // v0.6 (plan §4): mỗi nhà một việc vặt RIÊNG đúng tính cách, hết cảnh dùng chung một câu.
      const ch = XDH.CHORE_LINES[npc.id] || XDH.CHORE_LINES.sinh_vien;
      body = t(`${ch.vi}<br>Bạn phụ xong, được đưa <b>${moneyK}k</b> — nhưng mất <b>${XDH.CHORE.seconds} giây</b> trong ngày.`,
        `${ch.en}<br>You help out, get <b>${moneyK}k</b> — but it costs you <b>${XDH.CHORE.seconds} seconds</b> of daylight.`);
      r.nightStart -= XDH.CHORE.seconds * 1000;   // đồng hồ trời nhảy tới
    } else if (outcome === 'ca_hai') {
      moneyK = amountFor(range, state.trust, diff.threshold);
      foodK = food.value;
      title = t('💵🍙 CHO CẢ TIỀN LẪN ĐỒ ĂN', '💵🍙 MONEY *AND* FOOD');
      body = t(`"Cầm đỡ đi con, rồi mang theo cái này ăn dọc đường."<br><b>${moneyK}k</b> + ${food.emoji} <b>${foodName}</b> (≈${foodK}k).`,
        `"Take this, and bring this along for the road."<br><b>${moneyK}k</b> + ${food.emoji} <b>${foodName}</b> (≈${foodK}k).`);
    } else if (outcome === 'do_an') {
      foodK = food.value;
      title = t('🍙 CHO ĐỒ ĂN', '🍙 GAVE YOU FOOD');
      body = t(`"Tiền thì nhà không dư, mà đồ ăn thì có."<br>Bạn nhận ${food.emoji} <b>${foodName}</b> (≈${foodK}k tính vào bữa hôm nay).`,
        `"We don't have spare cash, but food we have."<br>You get ${food.emoji} <b>${foodName}</b> (≈${foodK}k toward today's meal).`);
    } else if (outcome === 'tien') {
      moneyK = amountFor(range, state.trust, diff.threshold);
      title = t('💵 CHO TIỀN', '💵 GAVE YOU MONEY');
      body = t(`"Có nhiêu đây thôi, cầm đi rồi về sớm nghen."<br>Bạn nhận <b>${moneyK}k</b>.`,
        `"This is all I've got — take it and get home safe."<br>You receive <b>${moneyK}k</b>.`);
    } else if (outcome === 'quay_lai_sau') {
      lock = false;   // KHÔNG khoá nhà: được quay lại gõ lần nữa
      title = t('⏳ BẢO QUAY LẠI SAU', '⏳ COME BACK LATER');
      body = t('"Giờ nhà đang bận, lát nữa ghé lại coi sao."<br>Chưa được gì, nhưng cửa chưa đóng hẳn — <b>gõ lại được</b>.',
        '"We\'re busy right now — swing by later."<br>Nothing yet, but the door is not shut — <b>you may knock again</b>.');
    } else {   // tu_choi
      title = t('🚪 TỪ CHỐI', '🚪 TURNED YOU DOWN');
      body = t('"Thông cảm nghen, nhà cũng khó."<br>Không được gì. Nhà này hôm nay coi như xong.',
        '"Sorry — things are tight here too."<br>Nothing. This house is done for today.');
    }

    r.money += moneyK;
    r.food += foodK;
    if (moneyK || foodK || win) {
      r.gave.push({ npc: npc.name.split(' (')[0], moneyK, foodK, outcome });
      // v0.6 F3.1 — mode này không có loot của ma sói, nên nhà nào chịu giúp thì MỞ 1 món đồ.
      // Không có cửa này thì người chơi Kẹt Tiền mắc kẹt với đúng bộ đồ thường cả ván.
      const piece = XDH.unlockRandomPiece();
      if (piece) body += t(`<br><span style="color:var(--ok)">🎽 Trên đường đi bạn lượm được <b>${piece.opt.label}</b> — mở khoá trong tủ đồ!</span>`,
        `<br><span style="color:var(--ok)">🎽 On the way you picked up <b>${piece.opt.label}</b> — unlocked in your wardrobe!</span>`);
    }
    if (win) r.dayWon = 'moi_com';
    return { title, body, moneyK, foodK, win, lock };
  }

  // Bảng "bạn xin được gì" sau mỗi nhà
  function showGive(res, then) {
    $('give-title').textContent = res.title;
    $('give-body').innerHTML = res.body +
      `<p style="margin-top:10px">${res.win
        ? t('🎉 Hôm nay khỏi lo bữa ăn nữa — bảng tổng kết đang chờ.', '🎉 Today’s meal is sorted — the day board is waiting.')
        : progressLine()}</p>`;
    $('ov-give').classList.add('show');
    $('btn-give-done').textContent = res.win
      ? t('Xem bảng tổng kết 📋', 'See the day board 📋')
      : t('Đi tiếp 🚶', 'Move on 🚶');
    $('btn-give-done').onclick = () => {
      $('ov-give').classList.remove('show');
      then && then();
    };
  }

  function progressLine() {
    const r = XDH.run;
    const left = needLeft();
    if (left <= 0) {
      return t(`✅ Đủ cho ${mealLabel()} rồi — ra <b>xe bánh mì</b> ăn thôi!`,
        `✅ Enough for ${mealLabel()} — head to the <b>bánh mì cart</b> and eat!`);
    }
    return t(`🎯 ${mealLabel()} ${r.meal.price}k · đang có ${r.money}k tiền + ${r.food}k đồ ăn · <b>còn thiếu ${left}k</b>`,
      `🎯 ${mealLabel()} ${r.meal.price}k · you have ${r.money}k cash + ${r.food}k food · <b>${left}k short</b>`);
  }

  // ---------- ăn ở xe bánh mì = THẮNG NGÀY ----------
  function eat() {
    const r = XDH.run;
    const pay = priceLeft();
    if (r.money < pay) return false;
    r.money -= pay;
    r.dayWon = 'an';
    return true;
  }

  // ---------- B7: bảng tổng kết ngày, chụp màn hình khoe được ----------
  async function showBoard(won) {
    const r = XDH.run;
    const best = r.gave.slice().sort((a, b) => (b.moneyK + b.foodK) - (a.moneyK + a.foodK))[0];
    const total = r.gave.reduce((s, g) => s + g.moneyK + g.foodK, 0);

    $('board-title').textContent = won
      ? (r.dayWon === 'moi_com'
        ? t(`🍚 NGÀY ${r.night}: ĐƯỢC MỜI CƠM!`, `🍚 DAY ${r.night}: INVITED TO DINNER!`)
        : t(`🍜 NGÀY ${r.night}: NO BỤNG!`, `🍜 DAY ${r.night}: YOU ATE!`))
      : t(`🌇 NGÀY ${r.night}: TRỜI TỐI, BỤNG ĐÓI`, `🌇 DAY ${r.night}: SUNDOWN, STILL HUNGRY`);
    $('board-title').className = 'big-result ' + (won ? 'win' : 'lose');

    const rows = [
      [t('🎯 Bữa hôm nay', '🎯 Today\'s meal'), `${mealLabel()} — ${r.meal.price}k`],
      [t('💰 Xin được', '💰 Collected'), `<b>${total}k</b> (${r.money}k ${t('tiền', 'cash')} + ${r.food}k ${t('đồ ăn', 'food')})`],
      [t('🚪 Số nhà đã gõ', '🚪 Doors knocked'), `<b>${r.knocked}</b>`],
      [t('❤️ Cho nhiều nhất', '❤️ Most generous'), best ? `<b>${best.npc}</b> (${best.outcome === 'moi_com' ? t('mời vào ăn cơm', 'invited you to dinner') : (best.moneyK + best.foodK) + 'k'})` : '—'],
      [t('⏰ Kết thúc lúc', '⏰ Ended at'), hourNow().hh + t(' giờ', ':00')]
    ];
    $('board-body').innerHTML = '<table>' +
      rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('') +
      '</table>' +
      `<div id="board-lie" style="margin-top:10px;padding:10px 12px;border:1px dashed var(--accent);border-radius:8px;font-size:14px">
         <b style="color:var(--accent)">🤥 ${t('Lời nói dối buồn cười nhất', 'Funniest lie of the day')}</b><br>
         <span id="board-lie-body" style="color:var(--dim)">${t('đang chấm…', 'judging…')}</span>
       </div>`;
    $('ov-board').classList.add('show');

    // nút "ngày sau" hoặc "chơi lại" + nhắc nghỉ sau 3 ngày (Q-B3)
    const nextBtn = $('btn-board-next');
    if (r.night >= XDH.RULES.SOFT_DAY_LIMIT) {
      nextBtn.textContent = t(`Chơi tiếp ngày ${r.night + 1} (xóm khó hơn) ☀️`, `Keep going — day ${r.night + 1} (harder) ☀️`);
      $('board-note').textContent = t(
        `Bạn chơi ${r.night} ngày rồi — nghỉ tay được rồi đó. Ngày ${r.night + 1} trở đi xóm nhớ mặt bạn, nghi ngờ khởi điểm cao hơn.`,
        `You've played ${r.night} days — a good place to stop. From day ${r.night + 1} the neighbourhood remembers your face: higher starting suspicion.`);
      $('board-note').style.display = 'block';
    } else {
      nextBtn.textContent = t(`Ngày ${r.night + 1} ☀️`, `Day ${r.night + 1} ☀️`);
      $('board-note').style.display = 'none';
    }
    nextBtn.onclick = () => {
      $('ov-board').classList.remove('show');
      startDay(r.night + 1);
      XDH.UI.refreshHud();
      XDH.UI.toast(t(`☀️ Ngày ${r.night}: hôm nay cần ${mealLabel()} — ${r.meal.price}k`,
        `☀️ Day ${r.night}: today you need ${mealLabel()} — ${r.meal.price}k`), 5200);
    };

    const lie = await funniestLie().catch(() => null);
    const el = $('board-lie-body');
    if (el) {
      el.innerHTML = lie
        ? `“${lie.quote}”<br><i style="color:var(--ink)">— ${lie.comment}</i>`
        : t('Hôm nay bạn nói thật hơi nhiều 😅', 'You told the truth a bit too much today 😅');
    }
    drawCard(won, total, best, lie);
  }

  // AI chỉ CHỌN một câu người chơi đã nói + bình một dòng (không bịa câu mới).
  async function funniestLie() {
    const lines = (XDH.run.dayLines || []).filter(s => s && s.length > 6).slice(-24);
    if (!lines.length) return null;
    const r = await fetch('/api/converse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryAsk: true, lang: XDH.lang, lines, pass: XDH.run.pass || '' })
    });
    const res = await r.json();
    if (!res.ok || !res.funny || !res.funny.quote) return null;
    return res.funny;
  }

  // Ảnh khoe bạn bè: vẽ thẳng lên canvas → tải về / chia sẻ được (không cần thư viện ngoài).
  function drawCard(won, total, best, lie) {
    const c = $('board-card');
    const g = c.getContext('2d');
    const W = c.width, H = c.height;
    const r = XDH.run;
    g.fillStyle = '#141024'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1a1626'; g.fillRect(24, 24, W - 48, H - 48);
    g.strokeStyle = '#4a3f6b'; g.lineWidth = 4; g.strokeRect(24, 24, W - 48, H - 48);
    const line = (txt, y, size, color, bold) => {
      g.fillStyle = color; g.font = (bold ? '700 ' : '') + size + 'px "Segoe UI", sans-serif';
      g.fillText(txt, 56, y);
    };
    line('XÓM ĐÓM HÒNG · ' + t('Kẹt Tiền', 'Stranded'), 84, 26, '#9b8fc0');
    line(won ? t(`NGÀY ${r.night}: NO BỤNG!`, `DAY ${r.night}: I ATE!`)
      : t(`NGÀY ${r.night}: ĐÓI`, `DAY ${r.night}: STILL HUNGRY`), 136, 44, won ? '#5dffa4' : '#ff5d73', true);
    const rows = [
      [t('Bữa cần', 'Meal needed'), `${t(r.meal.label, r.meal.label_en)} — ${r.meal.price}k`],
      [t('Xin được', 'Collected'), `${total}k`],
      [t('Nhà đã gõ', 'Doors knocked'), String(r.knocked)],
      [t('Cho nhiều nhất', 'Most generous'), best ? `${best.npc} (${best.outcome === 'moi_com' ? t('mời cơm', 'dinner') : (best.moneyK + best.foodK) + 'k'})` : '—']
    ];
    let y = 200;
    rows.forEach(([a, b]) => {
      line(a, y, 22, '#9b8fc0');
      g.fillStyle = '#f2ecff'; g.font = '700 24px "Segoe UI", sans-serif';
      g.textAlign = 'right'; g.fillText(b, W - 56, y); g.textAlign = 'left';
      g.strokeStyle = '#2b2440'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(56, y + 14); g.lineTo(W - 56, y + 14); g.stroke();
      y += 52;
    });
    line('🤥 ' + t('LỜI NÓI DỐI BUỒN CƯỜI NHẤT', 'FUNNIEST LIE OF THE DAY'), y + 34, 22, '#ffb547', true);
    const quote = lie ? '“' + lie.quote + '”' : t('(hôm nay nói thật hơi nhiều)', '(told the truth too much today)');
    g.font = 'italic 24px "Segoe UI", sans-serif'; g.fillStyle = '#f2ecff';
    const quoteLines = wrap(g, quote, 56, y + 76, W - 112, 32);
    if (lie && lie.comment) {
      g.font = '20px "Segoe UI", sans-serif'; g.fillStyle = '#9b8fc0';
      wrap(g, '— ' + lie.comment, 56, y + 92 + 32 * quoteLines.length, W - 112, 28);
    }
    g.font = '20px "Segoe UI", sans-serif'; g.fillStyle = '#9b8fc0';
    g.fillText('xom-dom-hong.pages.dev', 56, H - 56);
  }

  // xuống dòng thủ công cho canvas
  function wrap(g, text, x, y, maxW, lh, measureOnly) {
    const words = String(text).split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    if (!measureOnly) lines.forEach((l, i) => g.fillText(l, x, y + i * lh));
    return lines;
  }

  function saveCard() {
    const c = $('board-card');
    c.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `xom-dom-hong-ngay-${XDH.run.night}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      XDH.UI.toast(t('📸 Đã lưu ảnh — gửi cho bạn bè đi!', '📸 Image saved — go share it!'));
    }, 'image/png');
  }

  return {
    startDay, startSuspicion, showOpeners, hourNow, timeHint, dayProgress,
    resolve, showGive, progressLine, mealLabel, needLeft, priceLeft, canEat, eat,
    showBoard, saveCard
  };
})();
