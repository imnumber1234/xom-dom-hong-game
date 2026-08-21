// v1.2 — 🎰 THÙNG RÁC QUAY SỐ + 🎁 HỘP QUÀ MAY MẮN (plan-v1.2-do-nghe-casino.md).
// Luật vàng của game giữ nguyên: CODE cầm hết số. Ở đây CODE bốc KẾT QUẢ TRƯỚC rồi mới
// vẽ 3 ô cho khớp — nên tỉ lệ luôn đúng bảng XDH.SLOT và máy kiểm đếm được.
//   3 hình giống nhau = trúng lớn (ăn x2 + thêm 1 món đồ nghề)
//   2 hình giống nhau = thắng thường (ăn x2)
//   3 hình khác nhau  = thua, mất tiền cược
XDH.Casino = (function () {
  const $ = (id) => document.getElementById(id);
  const t = (vi, en) => (XDH.lang === 'en' ? en : vi);
  const S = () => XDH.SLOT;
  let spinning = false;
  let stats = { spins: 0, jackpot: 0, win: 0, lose: 0 };   // cho máy kiểm đếm tỉ lệ

  // ---------- 🎰 máy quay số ----------
  function openSlot() {
    if (!XDH.run) return;
    render();
    // v2.0 việc 9 (đáp án 11) — chốt chặn thứ hai: dù có ai gọi thẳng hàm này thì ở chế độ
    // Kẹt Tiền máy quay số vẫn KHÔNG mở (ở đó tiền chính là điều kiện thắng).
    if (XDH.isKetTien()) {
      XDH.UI.toast(XDH.lang === 'en'
        ? '🎰 No gambling in Broke mode — that money is your dinner.'
        : '🎰 Chế độ Kẹt Tiền không có máy quay số — tiền đó là bữa ăn của bạn đó.');
      return;
    }
    $('ov-slot').classList.add('show');
  }
  function close() { if (!spinning) $('ov-slot').classList.remove('show'); }

  function render(msg, cls) {
    const r = XDH.run;
    $('slot-title').textContent = t('🎰 Thùng rác quay số', '🎰 The trash-can slot machine');
    $('slot-money').textContent = t(`💰 Bạn có ${r.money}k`, `💰 You have ${r.money}k`);
    $('slot-rule').innerHTML = t(
      `3 hình giống nhau = <b>trúng lớn</b> (ăn gấp đôi + 1 món đồ nghề) · 2 hình giống = <b>thắng</b> (ăn gấp đôi) · khác hết = <b>mất tiền cược</b>`,
      `3 matching = <b>jackpot</b> (double + a free gear item) · 2 matching = <b>win</b> (double) · all different = <b>you lose the bet</b>`);
    $('btn-slot-bet').textContent = t(`Cược ${S().BET}k`, `Bet ${S().BET}k`);
    $('btn-slot-all').textContent = t(`TẤT TAY ${r.money}k`, `ALL IN ${r.money}k`);
    $('btn-slot-close').textContent = t('Thôi, đi tiếp', 'Enough, move on');
    $('btn-slot-bet').disabled = spinning || r.money < S().BET;
    $('btn-slot-all').disabled = spinning || r.money <= 0;
    if (msg != null) {
      $('slot-result').textContent = msg;
      $('slot-result').className = cls || '';
    }
  }

  function reels(a, b, c) {
    $('slot-r0').textContent = a; $('slot-r1').textContent = b; $('slot-r2').textContent = c;
  }
  const pick = () => S().SYMBOLS[Math.floor(Math.random() * S().SYMBOLS.length)];

  // Vẽ 3 ô cho khớp kết quả đã bốc (không bốc lại — tỉ lệ nằm ở outcome()).
  function faceFor(kind) {
    // xáo bộ hình rồi lấy ra → chắc chắn khác nhau, không bao giờ vẽ nhầm thành "trúng"
    const bag = S().SYMBOLS.slice().sort(() => Math.random() - 0.5);
    const [a, b, c] = bag;
    if (kind === 'jackpot') return [a, a, a];
    if (kind === 'win') return [[a, a, b], [a, b, a], [b, a, a]][Math.floor(Math.random() * 3)];
    return [a, b, c];
  }

  function outcome(forced) {
    if (forced) return forced;
    const roll = Math.random() * 100;
    if (roll < S().JACKPOT_P) return 'jackpot';
    if (roll < S().JACKPOT_P + S().WIN_P) return 'win';
    return 'lose';
  }

  // Một món đồ nghề ngẫu nhiên (dùng chung cho trúng lớn + hộp quà)
  function grantRandomItem() {
    const item = XDH.SHOP[Math.floor(Math.random() * XDH.SHOP.length)];
    XDH.run.inv[item.id] = (XDH.run.inv[item.id] || 0) + 1;
    return item;
  }

  async function spin(allIn, forced) {
    if (spinning || !XDH.run) return null;
    const r = XDH.run;
    const bet = allIn ? r.money : S().BET;
    if (bet <= 0 || r.money < bet) {
      XDH.UI.toast(t('Không đủ tiền cược — đi gõ cửa kiếm thêm đã.', 'Not enough to bet — go knock on some doors first.'));
      return null;
    }
    spinning = true;
    r.money -= bet;                                  // tiền vào máy TRƯỚC, thắng mới trả lại
    render(t('Đang quay…', 'Spinning…'), '');
    XDH.UI.refreshHud();
    const kind = outcome(forced);
    const face = faceFor(kind);
    // quay: nhấp nháy hình cho tới khi hết giờ rồi mới đứng lại
    const until = Date.now() + S().SPIN_MS;
    while (Date.now() < until) {
      reels(pick(), pick(), pick());
      XDH.Blips.blip(300 + Math.random() * 320);      // tiếng lạch cạch của ô quay
      await new Promise(res => setTimeout(res, 90));
    }
    reels(face[0], face[1], face[2]);
    stats.spins++; stats[kind]++;
    let msg, cls;
    if (kind === 'lose') {
      msg = t(`💸 Mất trắng ${bet}k. Thùng rác nuốt gọn.`, `💸 Lost ${bet}k. The trash can ate it.`);
      cls = 'lose';
      XDH.Blips.jingle('lose');
    } else {
      r.money += bet * 2;
      if (kind === 'jackpot') {
        const item = grantRandomItem();
        msg = t(`🎉 BA HÌNH GIỐNG NHAU! Ăn ${bet * 2}k + tặng luôn ${item.label}!`,
                `🎉 THREE OF A KIND! You take ${bet * 2}k + a free ${item.label}!`);
      } else {
        msg = t(`✨ Trúng rồi! Ăn ${bet * 2}k (vốn ${bet}k + lời ${bet}k).`,
                `✨ Winner! You take ${bet * 2}k (${bet}k stake + ${bet}k profit).`);
      }
      cls = 'win';
      XDH.Blips.jingle('win');
    }
    spinning = false;
    render(msg, cls);
    XDH.UI.refreshHud();
    return kind;
  }

  // ---------- 🎁 hộp quà may mắn (bán ở xe bánh mì) ----------
  function rollPrize(forced) {
    const L = XDH.LUCKY;
    if (forced) return L.PRIZES.find(p => p.type === forced) || L.PRIZES[0];
    let roll = Math.random() * 100;
    for (const p of L.PRIZES) { roll -= p.p; if (roll < 0) return p; }
    return L.PRIZES[L.PRIZES.length - 1];
  }

  function buyLucky(forced) {
    const r = XDH.run, L = XDH.LUCKY;
    const lp = XDH.priceOf(L.PRICE);   // v2.0 việc 8: bật công tắc playtest thì hộp quà 0k
    if (r.money < lp) {
      XDH.UI.toast(t('Chưa đủ tiền mua hộp quà.', 'Not enough money for a lucky box.'));
      return null;
    }
    r.money -= lp;
    const prize = rollPrize(forced);
    let ico = '🎁', line = '';
    if (prize.type === 'coins') {
      const k = 5 * Math.round((prize.min + Math.random() * (prize.max - prize.min)) / 5);
      r.money += k;
      ico = '💵';
      line = t(`Trong hộp là <b>${k}k</b> tiền mặt.`, `Inside: <b>${k}k</b> in cash.`);
    } else if (prize.type === 'item') {
      const item = grantRandomItem();
      ico = '🎒';
      line = t(`Trong hộp là <b>${item.label}</b> — vào thẳng túi đồ.`,
               `Inside: <b>${item.label}</b> — straight into your bag.`);
    } else if (prize.type === 'wear') {
      const p = XDH.unlockRandomPiece();
      if (p) {
        ico = '👕';
        line = t(`Trong hộp là <b>${p.opt.label}</b> — mở khoá trong tủ đồ rồi đó.`,
                 `Inside: <b>${p.opt.label}</b> — now unlocked in your wardrobe.`);
      } else {
        const k = XDH.WARDROBE_LOCK.LOOT_MONEY_IF_FULL_K;
        r.money += k;
        ico = '💵';
        line = t(`Đồ mặc bạn có đủ hết rồi — hộp đền lại <b>${k}k</b>.`,
                 `You already own every outfit piece — the box pays you <b>${k}k</b> instead.`);
      }
    } else {
      const pool = XDH.lang === 'en' ? XDH.LUCKY.JUNK.en : XDH.LUCKY.JUNK.vi;
      ico = '🗑️';
      line = t(`Trong hộp là… <b>${pool[Math.floor(Math.random() * pool.length)]}</b>. Hên xui mà.`,
               `Inside… <b>${pool[Math.floor(Math.random() * pool.length)]}</b>. That's gambling.`);
    }
    XDH.Blips.jingle(prize.type === 'junk' ? 'lose' : 'win');
    $('lucky-ico').textContent = ico;
    $('lucky-title').textContent = t('🎁 Mở hộp quà may mắn', '🎁 Lucky box opened');
    $('lucky-line').innerHTML = line;
    $('btn-lucky-done').textContent = t('Ừ, đi tiếp', 'Nice, move on');
    $('ov-lucky').classList.add('show');
    XDH.UI.refreshHud();
    return prize.type;
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('btn-slot-bet').onclick = () => spin(false);
    $('btn-slot-all').onclick = () => spin(true);
    $('btn-slot-close').onclick = close;
    $('btn-lucky-done').onclick = () => {
      $('ov-lucky').classList.remove('show');
      if ($('ov-shop').classList.contains('show')) XDH.UI.openShop();   // vẽ lại quầy với số dư mới
    };
  });

  // ---- ?slot=test — tay nắm cho máy kiểm (Playwright) ----
  if (/[?&]slot=test/.test(location.search)) {
    XDH.CasinoTest = {
      spin, buyLucky, openSlot,
      stats: () => ({ ...stats }),
      reset: () => { stats = { spins: 0, jackpot: 0, win: 0, lose: 0 }; },
      money: () => XDH.run.money,
      setMoney: (k) => { XDH.run.money = k; XDH.UI.refreshHud(); },
      inv: () => ({ ...XDH.run.inv })
    };
  }

  return { openSlot, spin, buyLucky, close };
})();
