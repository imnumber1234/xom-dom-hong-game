// track.js — v2.0 việc 2: CỘT MỐC PHÍA MÁY CHƠI.
//
// Sổ đen máy chủ chỉ thấy những lượt CÓ gọi AI. Phễu người mới cần thấy cả khúc không gọi AI:
// mở game · chọn chế độ · gõ cửa · nói câu đầu · cửa mở · thắng · thua · bị công an · bỏ giữa chừng.
//
// Ba luật của tệp này:
//   1. GỬI RỒI ĐI. Dùng navigator.sendBeacon — trình duyệt gửi giúp ở nền, không chờ trả lời,
//      và vẫn gửi được cả khi người chơi đang đóng tab. Không có sendBeacon thì fetch keepalive.
//   2. KHÔNG BAO GIỜ LÀM VỠ GAME. Mọi thứ bọc trong try/catch, hỏng thì im lặng.
//   3. KHÔNG GỬI GÌ RIÊNG TƯ NGOÀI THỨ CẦN ĐO. Không cookie, không vân tay máy, không địa chỉ IP
//      (Cloudflare có sẵn, mình không lưu). Mã phiên là số ngẫu nhiên, sống trong một tab.
XDH.Track = (function () {
  var SESSION = 'xdh_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-5);
  var runId = null;
  var sent = {};          // mốc chỉ-một-lần-mỗi-ván (mở game · nói câu đầu…)
  var on = true;

  function post(payload) {
    if (!on) return;
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/event', new Blob([body], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch('/api/event', { method: 'POST', body: body, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* sổ hỏng thì thôi, game quan trọng hơn */ }
  }

  function base() {
    var r = XDH.run || {};
    return {
      session: SESSION, runId: runId,
      mode: r.mode || null, lang: XDH.lang || 'vi', night: r.night || null
    };
  }

  // e = tên mốc · extra = { npc, detail }
  function ev(name, extra) {
    var p = base();
    p.name = name;
    if (extra) { if (extra.npc) p.npc = extra.npc; if (extra.detail !== undefined) p.detail = extra.detail; }
    post(p);
  }

  // Mốc chỉ được đếm MỘT LẦN mỗi ván (nếu không phễu sẽ phồng lên vì người chơi gõ cửa 10 lần).
  function once(name, extra) {
    if (sent[name]) return;
    sent[name] = 1;
    ev(name, extra);
  }

  function newRun() {
    runId = 'run_' + Math.random().toString(36).slice(2, 9);
    sent = {};
    return runId;
  }

  return {
    session: function () { return SESSION; },
    runId: function () { return runId; },
    newRun: newRun,
    ev: ev,
    once: once,
    off: function () { on = false; }
  };
})();

// Mốc 1 — MỞ GAME. Bắn ngay khi tệp này chạy: đây là mẫu số của cả cái phễu.
try { XDH.Track.ev('game_start', { detail: { ref: document.referrer || '', w: innerWidth, h: innerHeight } }); }
catch (e) { /* thôi */ }
