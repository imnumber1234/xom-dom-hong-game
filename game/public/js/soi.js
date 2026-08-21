// soi.js — v2.2 "Ô SOI": HỘP KÍNH THỜI GIAN THẬT, nằm NGAY BÊN CẠNH lúc đang chơi.
//
// Vì sao có tệp này (Lucas 21/08): bảng đèn /dash là trang riêng, xem SAU khi chơi xong và
// xem theo kiểu tổng hợp. Cái Lucas cần là thấy NGAY: "con AI mình đang nói chuyện lúc này
// nó nghĩ gì, nó chấm mình bao nhiêu, vì sao cửa chưa mở".
//
// Ba luật của ô soi:
//   1. CHỈ ĐỌC, KHÔNG SỬA. Không một dòng nào ở đây được đổi trạng thái game. Soi mà làm lệch
//      thứ mình đang soi thì vô nghĩa.
//   2. KHÔNG BAO GIỜ LÀM VỠ GAME. Mọi thứ bọc try/catch; tắt ô soi là game chạy y như cũ.
//   3. Số nào cũng phải là SỐ THẬT vừa xảy ra — không tính lại, không làm tròn cho đẹp.
//      convo.js đưa sang con số nào thì vẽ đúng con số đó (bài học popup số bay v0.6).
XDH.Soi = (function () {
  const $ = (id) => document.getElementById(id);
  const t = (vi, en) => (XDH.lang === 'en' ? en : vi);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let on = false;
  let turns = [];          // lịch sử lượt trong cuộc đang mở
  let pending = null;      // lúc đang chờ AI trả lời

  const VERDICT_VI = { danh_trung: 'ĐÁNH TRÚNG', hop_ly: 'Hợp lý', thuong: 'Nhạt',
                       kha_nghi: 'Nghe sai sai', lo_lieu: 'LỘ RỒI' };
  const VERDICT_EN = { danh_trung: 'DIRECT HIT', hop_ly: 'Fair', thuong: 'Meh',
                       kha_nghi: 'Sounds off', lo_lieu: 'BUSTED' };
  const VCLS = { danh_trung: 'ok', hop_ly: 'ok', thuong: '', kha_nghi: 'warn', lo_lieu: 'bad' };
  const OFF_VI = { kho_chiu: 'hỗn / vô duyên', xuc_pham: 'CHỬI BỚI', de_doa: 'DOẠ NẠT' };
  const OFF_EN = { kho_chiu: 'rude', xuc_pham: 'INSULT', de_doa: 'THREAT' };
  const KIND_VI = { warn: 'cảnh cáo', end: 'đóng cửa', police: '🚓 GỌI CÔNG AN', apology: 'xin lỗi — nguôi bớt' };
  const KIND_EN = { warn: 'warning', end: 'door closed', police: '🚓 POLICE CALLED', apology: 'apology accepted' };

  function isOn() { return on; }

  function setOn(v) {
    on = !!v;
    document.body.classList.toggle('soi-on', on);
    const p = $('soi');
    if (p) p.style.display = on ? 'flex' : 'none';
    const b = $('btn-soi');
    if (b) b.classList.toggle('sel', on);
    try { localStorage.setItem('xdh_soi', on ? '1' : '0'); } catch (e) { /* riêng tư chặn thì thôi */ }
    if (on) render();
  }

  // ---- một dòng "nhãn bên trái, số bên phải" (kiểu màn quản trị, dày theo chiều ngang) ----
  const row = (label, value, cls) =>
    `<div class="soi-row"><span>${label}</span><b class="${cls || ''}">${value}</b></div>`;

  function bar(label, v, max, cls) {
    const w = Math.max(0, Math.min(100, Math.round(v * 100 / (max || 100))));
    return `<div class="soi-bar"><span>${label}</span>` +
      `<i class="${cls || ''}"><u style="width:${w}%"></u></i><b>${v}</b></div>`;
  }

  // ---- ô soi vẽ lại toàn bộ mỗi lượt: rẻ, và không bao giờ lệch với trạng thái thật ----
  function render() {
    const box = $('soi-body');
    if (!box || !on) return;
    const en = XDH.lang === 'en';
    const V = en ? VERDICT_EN : VERDICT_VI;
    const O = en ? OFF_EN : OFF_VI;
    const K = en ? KIND_EN : KIND_VI;
    const last = turns[turns.length - 1];

    if (!last && !pending) {
      box.innerHTML = `<div class="soi-empty">${t(
        'Chưa có lượt nào. Gõ cửa một nhà rồi nói một câu — mọi thứ AI làm sẽ hiện ở đây theo thời gian thật.',
        'No turns yet. Knock on a door and say something — everything the AI does will show up here live.')}</div>`;
      return;
    }

    let h = '';

    // ── đang chờ AI ──────────────────────────────────────────────────────────
    if (pending) {
      h += `<section class="soi-card wait"><h3>⏳ ${t('Đang hỏi AI…', 'Asking the AI…')}</h3>` +
        row(t('Bạn vừa nói', 'You just said'), esc(pending.playerText).slice(0, 90) || '—') +
        row(t('Chờ được', 'Waiting'), `<span id="soi-wait">0.0</span>s`) + '</section>';
    }

    if (last) {
      const d = last;
      // ── 1. AI NÀO TRẢ LỜI ────────────────────────────────────────────────
      h += `<section class="soi-card"><h3>🧠 ${t('Ai vừa trả lời', 'Which brain answered')}</h3>`;
      h += row(t('Não', 'Brain'), d.scripted
        ? `<span class="tag bad">${t('kịch bản (não chết)', 'scripted (brains down)')}</span>`
        : `<span class="tag ok">${esc(d.brain)}</span>`);
      if (d.tried && d.tried.length > 1) {
        // Máy chủ ghi nguyên văn lỗi (dài cả trăm chữ) — ô soi chỉ cần "não nào, đạt hay hỏng".
        // Muốn đọc nguyên văn thì mở bảng đèn /dash, chỗ đó mới là chỗ để đọc kỹ.
        const short = d.tried.map(x => {
          const name = String(x).split(':')[0];
          const ok = /:ok$/.test(x);
          return `<span class="tag ${ok ? 'ok' : 'bad'}">${esc(name)}${ok ? '' : ' ✕'}</span>`;
        }).join(' → ');
        h += row(t('Đã thử qua', 'Tried'), short, 'small');
      }
      h += row(t('Máy chủ nghĩ mất', 'Server thinking'), d.serverMs != null ? d.serverMs + ' ms' : '—');
      h += row(t('Tổng bạn phải chờ', 'Total you waited'), d.roundMs + ' ms');
      if (d.tokIn != null) h += row(t('Chữ gửi đi / nhận về', 'Tokens in / out'), d.tokIn + ' / ' + d.tokOut);
      const fixes = [];
      if (d.retried) fixes.push(t('viết lại vì lặp câu', 'rewritten: repeated line'));
      if (d.langFixed) fixes.push(t('viết lại vì SAI THỨ TIẾNG', 'rewritten: wrong language'));
      if (d.leakFixed) fixes.push(t('viết lại vì LỘ BÍ MẬT sớm', 'rewritten: leaked the secret'));
      if (fixes.length) h += row(t('Game đã nắn lại', 'Game corrected it'), '<span class="tag warn">' + fixes.join(' · ') + '</span>');
      if (d.bench && Object.keys(d.bench).length) {
        h += row(t('Não đang nằm nghỉ', 'Brains benched'),
          '<span class="tag bad">' + Object.entries(d.bench).map(([k, v]) => k + ' ' + v + 's').join(', ') + '</span>');
      }
      h += '</section>';

      // ── 2. NÓ CHẤM CÂU CỦA BẠN THẾ NÀO ───────────────────────────────────
      h += `<section class="soi-card"><h3>⚖️ ${t('Nó chấm câu vừa rồi', 'How it scored your line')}</h3>`;
      h += row(t('AI tự chấm', 'AI scored'), `<span class="tag ${VCLS[d.aiVerdict] || ''}">${esc(V[d.aiVerdict] || d.aiVerdict || '—')}</span>`);
      if (d.verdict !== d.aiVerdict) {
        h += row(t('Mã nguồn NÂNG lên', 'Code raised it to'),
          `<span class="tag ok">${esc(V[d.verdict] || d.verdict)}</span>`, 'ok');
        h += `<div class="soi-note">${t(
          'Bạn nói trúng chuyện nhà này mê → mã nguồn ép mức chấm lên, không để AI chấm keo.',
          'You hit a topic this house loves → the code raised the score; the AI does not get to be stingy.')}</div>`;
      }
      const dl = (n, k) => (n ? `<span class="${n > 0 ? 'ok' : 'bad'}">${n > 0 ? '+' : '−'}${Math.abs(n)} ${k}</span> ` : '');
      h += row(t('Cộng trừ lượt này', 'This turn'),
        (dl(d.dT, t('tin', 'trust')) + dl(d.dS, t('nghi', 'susp')) + dl(d.dI, t('hứng', 'int')) + dl(d.dP, t('kiên nhẫn', 'pat'))) || '—');
      if (d.contradiction) h += row(t('Cờ đặc biệt', 'Flag'), '⚡ ' + t('đồ chọi lời khai', 'outfit contradicts story'), 'bad');
      if (d.corroboration) h += row(t('Cờ đặc biệt', 'Flag'), '🧾 ' + t('đồ chống lưng lời khai', 'outfit backs the story'), 'ok');
      if (d.thought) h += `<div class="soi-quote">💭 ${esc(d.thought)}</div>`;
      if (d.claim) h += row(t('Nó nghĩ bạn đang xưng là', 'It thinks you claim to be'), esc(d.claim));
      h += '</section>';

      // ── 3. BỐN CHỈ SỐ + THANH THIỆN CẢM ──────────────────────────────────
      h += `<section class="soi-card"><h3>📊 ${t('Trong đầu nhân vật lúc này', 'Inside their head right now')}</h3>`;
      h += bar(t('Tin', 'Trust'), d.state.trust, 100, 'ok');
      h += bar(t('Nghi', 'Suspicion'), d.state.suspicion, 100, 'bad');
      h += bar(t('Hứng thú', 'Interest'), d.state.interest, 100, '');
      h += bar(t('Kiên nhẫn', 'Patience'), d.state.patience, 100, 'warn');
      h += `<div class="soi-split"></div>`;
      h += bar(t('THIỆN CẢM', 'WARMTH'), d.friendShown, 100, d.friendShown >= 100 ? 'ok' : 'gold');
      h += row(t('· lớp mã nguồn (từ khoá)', '· code layer (keywords)'), d.friendCode + '%', 'dim');
      h += row(t('· lớp AI (lòng tin)', '· AI layer (trust)'), d.friendAi + '%', 'dim');
      if (d.topics && d.topics.length) {
        h += row(t('Chủ đề đã chạm', 'Topics touched'), esc(d.topics.join(' · ')), 'ok small');
      }
      if (d.topicsLeft && d.topicsLeft.length) {
        h += row(t('Còn chưa chạm', 'Not touched yet'), esc(d.topicsLeft.join(' · ')), 'dim small');
      }
      h += '</section>';

      // ── 4. CÁI CỬA ───────────────────────────────────────────────────────
      h += `<section class="soi-card"><h3>🚪 ${t('Cánh cửa', 'The door')}</h3>`;
      h += row(t('Ngưỡng nhà này', 'This house needs'), d.threshold + ' ' + t('điểm tin', 'trust'));
      h += row(t('Cửa đang mở mấy nấc', 'Door stage'), d.doorStage + '/4');
      h += row(t('Vì sao chưa mở', 'Why not open'), esc(d.doorWhy), d.doorOpen ? 'ok' : 'warn');
      h += row(t('AI có MUỐN mời không', 'Does the AI want to invite'),
        d.inviteIntent ? t('có', 'yes') : t('chưa', 'not yet'), 'dim');
      h += `<div class="soi-note">${t(
        'Từ v2.0: AI KHÔNG còn quyền phủ quyết. Thiện cảm đủ 100% là mã nguồn mở cửa, rồi bắt AI nói câu mời cho khớp.',
        'Since v2.0 the AI has no veto. At 100% warmth the code opens the door, then makes the AI say the invitation.')}</div>`;
      h += '</section>';

      // ── 5. LỜI LẼ ────────────────────────────────────────────────────────
      if (d.offense || d.offenses) {
        h += `<section class="soi-card"><h3>😠 ${t('Lời lẽ', 'How you spoke')}</h3>`;
        if (d.offense) {
          h += row(t('Lượt này bị chấm', 'This turn rated'),
            `<span class="tag bad">${esc(O[d.offense.level] || d.offense.level || '—')}</span>`);
          h += row(t('Hậu quả', 'Consequence'),
            `<span class="tag ${d.offense.kind === 'police' ? 'bad' : (d.offense.kind === 'apology' ? 'ok' : 'warn')}">${esc(K[d.offense.kind] || d.offense.kind)}</span>`);
          if (d.offense.risk != null) {
            h += row(t('Rủi ro gọi công an', 'Police risk'), Math.round(d.offense.risk * 100) + '%', 'dim');
          }
        }
        h += row(t('Đã hỗn mấy lần', 'Strikes so far'), d.offenses + '/2');
        h += `<div class="soi-note">${t(
          'Lần 1 chỉ cảnh cáo. LẦN 2 là công an tới — nhà nào cũng vậy. Xin lỗi tử tế thì lùi một nấc.',
          'First time is a warning. SECOND time the police come — every house. A real apology rolls it back one step.')}</div>`;
        h += '</section>';
      }

      // ── 6. NHIỆM VỤ GIẤU ─────────────────────────────────────────────────
      if (d.mission) {
        h += `<section class="soi-card"><h3>🎯 ${t('Chuyện giấu của nhà này', "This house's hidden story")}</h3>`;
        h += row(t('Giai đoạn', 'Stage'), esc(d.mission.stage));
        h += row(t('Đã hé mấy manh mối', 'Clues revealed'), (d.mission.clues || 0) + '/3');
        if (d.signalRaw || d.signalFinal) {
          h += row(t('AI phát tín hiệu', 'AI signalled'), esc(d.signalRaw || '—'), 'dim');
          h += row(t('Cổng gác cho qua', 'Gate allowed'), esc(d.signalFinal || '—'),
            d.signalFinal ? 'ok' : 'warn');
        }
        if (d.gateReason) h += row(t('Lý do', 'Reason'), esc(d.gateReason), 'dim small');
        h += '</section>';
      }

      // ── 7. NGÔN NGỮ ──────────────────────────────────────────────────────
      h += `<section class="soi-card"><h3>🗣️ ${t('Ngôn ngữ', 'Language')}</h3>`;
      h += row(t('Bạn chọn', 'You chose'), d.lang === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt');
      h += row(t('Nó trả lời bằng', 'It replied in'),
        d.replyLang ? (d.replyLang === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt') : t('không đoán được', 'unclear'),
        d.replyLang && d.replyLang !== d.lang ? 'bad' : 'ok');
      h += '</section>';
    }

    // ── 8. LỊCH SỬ LƯỢT ───────────────────────────────────────────────────
    if (turns.length > 1) {
      h += `<section class="soi-card"><h3>🧾 ${t('Các lượt trước', 'Earlier turns')}</h3><div class="soi-hist">`;
      turns.slice(0, -1).slice(-12).reverse().forEach((x, i) => {
        h += `<div class="soi-hrow"><span>#${turns.indexOf(x) + 1}</span>` +
          `<b class="tag ${VCLS[x.verdict] || ''}">${esc((en ? VERDICT_EN : VERDICT_VI)[x.verdict] || x.verdict || '—')}</b>` +
          `<span class="dim">${esc(x.brain || 'kịch bản')}</span>` +
          `<span class="dim">${x.roundMs} ms</span>` +
          `<span class="gold">${x.friendShown}%</span></div>`;
      });
      h += '</div></section>';
    }

    box.innerHTML = h;
    box.scrollTop = 0;
  }

  // ---- convo.js gọi vào ba chỗ: bắt đầu cuộc · bắt đầu chờ · có kết quả ----
  function openConvo(npc) {
    turns = []; pending = null;
    const ttl = $('soi-title');
    if (ttl) ttl.textContent = '🔬 ' + (npc ? npc.name : t('Ô soi', 'Inspector'));
    render();
  }
  function closeConvo() { pending = null; render(); }

  let waitTimer = null;
  function waiting(playerText) {
    pending = { playerText, t0: Date.now() };
    render();
    clearInterval(waitTimer);
    waitTimer = setInterval(() => {
      const el = $('soi-wait');
      if (!el || !pending) { clearInterval(waitTimer); return; }
      el.textContent = ((Date.now() - pending.t0) / 1000).toFixed(1);
    }, 100);
  }

  function turn(info) {
    try {
      clearInterval(waitTimer);
      pending = null;
      turns.push(info);
      render();
    } catch (e) { /* soi hỏng thì kệ, game quan trọng hơn */ }
  }

  // ---- nối nút ----
  document.addEventListener('DOMContentLoaded', () => {
    const b = $('btn-soi');
    if (b) b.onclick = () => setOn(!on);
    const x = $('soi-close');
    if (x) x.onclick = () => setOn(false);
    // Mặc định: BẢN THỬ thì bật sẵn (Lucas muốn thấy ngay lúc chơi), LINK CHÍNH thì tắt.
    // ?soi=1 / ?soi=0 ép; ngoài ra nhớ lựa chọn lần trước.
    let want;
    if (/[?&]soi=1/.test(location.search)) want = true;
    else if (/[?&]soi=0/.test(location.search)) want = false;
    else {
      let saved = null;
      try { saved = localStorage.getItem('xdh_soi'); } catch (e) { /* thôi */ }
      want = saved === null ? !!(XDH.PLAYTEST || XDH.DEBUG) : saved === '1';
    }
    setOn(want);
  });

  return { isOn, setOn, openConvo, closeConvo, waiting, turn, render };
})();
