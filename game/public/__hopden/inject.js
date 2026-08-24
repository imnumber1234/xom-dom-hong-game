/* inject.js — chèn TRONG BỘ NHỚ lúc phục vụ index.html. Tệp trên đĩa không đổi một byte.
 *
 * Ba việc, tất cả bằng cách BỌC NGOÀI, không sửa file nào của game:
 *   1. đóng dấu runId/turnId lên mỗi lượt gọi /api/converse
 *   2. bọc XDH.UI.debugTurn — nó ĐÃ nhận sẵn điểm THẬT đã áp (sau khi kẹp 0-100), mỗi lượt, vô điều kiện
 *   3. dựng delta_notes (vì sao điểm bị nuốt) + nút 👎
 *
 * Vì sao (2) là điểm móc hoàn hảo: convo.js:482 gọi debugTurn với đúng bộ số cần —
 * verdict, dT/dS/dI/dP đã kẹp, contradiction/corroboration ĐÃ ÁP (khác với cờ AI bật),
 * brain, state sau. Không cần chạm vào convo.js.
 */
(function () {
  'use strict';
  if (window.__hopden) return; window.__hopden = true;

  var RUN = 'r-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
  var luotHienTai = null;      // { turnId, req, res }
  var choGanNut = null;        // turnId đang chờ vẽ xong để gắn nút 👎

  function beacon(d) {
    d.run_id = RUN;
    try {
      var s = JSON.stringify(d);
      if (navigator.sendBeacon) navigator.sendBeacon('/api/echo', new Blob([s], { type: 'application/json' }));
      else fetch('/api/echo', { method: 'POST', body: s, keepalive: true });
    } catch (e) { /* ghi trace hỏng KHÔNG BAO GIỜ được làm hỏng lượt chơi */ }
  }

  // ── 1. đóng dấu lên mỗi lượt gọi ─────────────────────────────────────────
  var fetchGoc = window.fetch;
  window.fetch = function (url, init) {
    var u = String((url && url.url) || url || '');
    if (u.indexOf('/api/converse') === -1) return fetchGoc.apply(this, arguments);

    var turnId = 't-' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
    init = init || {};
    init.headers = Object.assign({}, init.headers, { 'x-hopden-run': RUN, 'x-hopden-turn': turnId });
    var req = null; try { req = JSON.parse(init.body); } catch (e) {}

    return fetchGoc.call(this, url, init).then(function (r) {
      r.clone().json().then(function (res) {
        // chỉ lượt NÓI mới có chấm điểm; greet/hint/tutor bỏ qua
        if (req && !req.greet && !req.hintAsk && !req.tutorAsk && !req.summaryAsk)
          luotHienTai = { turnId: turnId, req: req, res: res };
      }).catch(function () {});
      return r;
    });
  };

  // ── 2+3. bọc debugTurn: dựng delta_notes rồi bắn về ──────────────────────
  function dungDeltaNotes(info, L) {
    var ghiChu = [];
    var note = function (ma, chiTiet) { ghiChu.push(Object.assign({ ma: ma }, chiTiet || {})); };
    try {
      var npcId = L.req.npcId;
      var diff = (XDH.DIFFICULTY || {})[npcId] || { gainMult: 1 };
      var bang = (XDH.VERDICTS || {})[info.verdict];
      var ai = L.res.npc || {};

      if (bang) {
        // đúng phép tính của convo.js:437 — chỉ nhân gainMult khi trust DƯƠNG
        var muonT = bang.trust > 0 ? Math.round(bang.trust * diff.gainMult) : bang.trust;
        if (diff.gainMult !== 1 && bang.trust > 0)
          note('gain_mult', { bang: bang.trust, sau_nhan: muonT, mult: diff.gainMult, nha: npcId });
        // ĐIỂM BỊ NUỐT vì kẹp 0-100 — đây là chỗ tách H2 khỏi H5
        if (muonT !== info.dT) note('kep_tran_tin', { muon: muonT, duoc: info.dT, tran: 100 });
        if (bang.suspicion !== info.dS) note('kep_tran_nghi', { muon: bang.suspicion, duoc: info.dS });
        if (bang.interest !== info.dI) note('kep_tran_hung', { muon: bang.interest, duoc: info.dI });
        if (bang.patience !== info.dP) note('kep_tran_kien', { muon: bang.patience, duoc: info.dP });
      }
      // AI BẬT CỜ mà CODE KHÔNG ÁP → cờ đã nổ rồi ở bộ đồ này (một lần / bộ đồ / cuộc).
      // debugTurn nhận contraApplied (code có áp không); res.npc.contradiction là AI có bật không.
      if (ai.contradiction && !info.contradiction) note('mau_thuan_da_no_roi');
      if (ai.corroboration && !info.corroboration) note('chong_lung_da_no_roi');
      if (ai.contradiction && ai.corroboration) note('hai_co_cung_bat');
      if (L.res.scripted) note('roi_kich_ban');
    } catch (e) {}
    return ghiChu;
  }

  function boc() {
    if (!window.XDH || !XDH.UI || !XDH.UI.debugTurn || XDH.UI.__hopden) return false;
    XDH.UI.__hopden = true;

    var debugGoc = XDH.UI.debugTurn;
    XDH.UI.debugTurn = function (info) {
      try {
        var L = luotHienTai;
        if (L) {
          beacon({
            turn_id: L.turnId,
            applied: { dT: info.dT, dS: info.dS, dI: info.dI, dP: info.dP,
                       contradiction: !!info.contradiction, corroboration: !!info.corroboration },
            state_out: info.state ? { trust: info.state.trust, suspicion: info.state.suspicion,
                                      interest: info.state.interest, patience: info.state.patience } : null,
            delta_notes: dungDeltaNotes(info, L)
          });
          choGanNut = L.turnId;
        }
      } catch (e) {}
      return debugGoc.apply(this, arguments);
    };

    // debugTurn chạy TRƯỚC khi thoại được vẽ → bọc thêm typeNpcLine để gắn nút đúng bong bóng
    var typeGoc = XDH.UI.typeNpcLine;
    if (typeGoc) XDH.UI.typeNpcLine = function () {
      var kq = typeGoc.apply(this, arguments);
      try {
        if (choGanNut) { ganNut(choGanNut); choGanNut = null; }
      } catch (e) {}
      return kq;
    };
    return true;
  }

  // ── nút 👎 ───────────────────────────────────────────────────────────────
  var CSS = '.hd-fb{opacity:.28;font-size:12px;cursor:pointer;user-select:none;margin-left:6px;transition:opacity .15s}'
    + '.hd-fb:hover{opacity:.9}.hd-fb.chon{opacity:1}'
    + '.hd-menu{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 2px}'
    + '.hd-menu button{font:inherit;font-size:11px;padding:3px 7px;border-radius:11px;cursor:pointer;'
    + 'border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.35);color:inherit;opacity:.85}'
    + '.hd-menu button:hover{opacity:1;border-color:#e8a}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var LUA_CHON = [
    ['lac_de',       'Lạc đề, không liên quan'],
    ['dang_le_tang', 'Đáng lẽ phải tăng điểm'],
    ['lap_lai',      'Nói lặp lại câu cũ']
  ];

  function ganNut(turnId) {
    var ds = document.querySelectorAll('#dialogue .npc-line');
    var el = ds[ds.length - 1];
    if (!el || el.dataset.hd) return;
    el.dataset.hd = turnId;

    var nut = document.createElement('span');
    nut.className = 'hd-fb'; nut.textContent = '👎'; nut.title = 'Câu này chưa ổn?';
    el.appendChild(nut);

    nut.onclick = function (e) {
      e.stopPropagation();                              // đừng kích "tap to skip" của typeInto
      if (el.querySelector('.hd-menu')) { el.querySelector('.hd-menu').remove(); return; }
      var menu = document.createElement('div'); menu.className = 'hd-menu';
      LUA_CHON.forEach(function (lc) {
        var b = document.createElement('button'); b.textContent = lc[1];
        b.onclick = function (ev) {
          ev.stopPropagation();
          var huy = nut.dataset.fb === lc[0];           // bấm lại lần hai là huỷ
          nut.dataset.fb = huy ? '' : lc[0];
          nut.classList.toggle('chon', !huy);
          nut.textContent = huy ? '👎' : '👎 ' + lc[1];
          beacon({ turn_id: turnId, fb: huy ? null : lc[0], fb_at: Date.now() });
          menu.remove();
        };
        menu.appendChild(b);
      });
      el.appendChild(menu);
    };
  }

  // XDH.UI dựng xong lúc nào không chắc → thử tới khi được, tối đa 10 giây
  var n = 0;
  var hen = setInterval(function () { if (boc() || ++n > 100) clearInterval(hen); }, 100);
  boc();
  console.log('%c[hộp đen] đang ghi · ván ' + RUN.slice(0, 10), 'color:#e8a');
})();
