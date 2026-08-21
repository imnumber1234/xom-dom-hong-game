// GET /dash — BẢNG ĐÈN (plan-v2.0 §4 mức M2). Trang riêng, chỉ Lucas xem.
//
// Vì sao là một Function chứ không phải tệp tĩnh trong public/: tệp tĩnh thì ai gõ đúng
// địa chỉ cũng đọc được, mà trang này in NGUYÊN VĂN lời người chơi. Nằm trong Function thì
// đi qua được cửa khoá (_dashauth.js) — và khi Lucas gắn Cloudflare Access thì tự nhận luôn.
//
// Bên trong trả lời đúng 6 câu hỏi của kế hoạch:
//   1. Phễu người mới — vào → gõ cửa → nói câu đầu → vào được nhà
//   2. Tỉ lệ chấm (verdict)
//   3. Não nào đang chết + tỉ lệ dùng từng não
//   4. Độ trễ (giữa / chậm nhất)
//   5. Chỗ người chơi bỏ cuộc + câu nói ngay trước khi bị đóng cửa
//   6. Xem lại NGUYÊN cuộc hội thoại
// Cộng thêm (đáp án 13): bảng TUÂN LỆNH NGÔN NGỮ — chọn tiếng nào, AI trả lời tiếng nào.

import { dashGate, withCookie } from './api/_dashauth.js';

export async function onRequestGet(ctx) {
  const gate = dashGate(ctx);
  if (!gate.ok) return gate.res;
  return withCookie(new Response(PAGE, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  }), gate);
}

const PAGE = `<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bảng đèn — Xóm Đóm Hòng</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
/* Bricolage Grotesque + JetBrains Mono — cả hai ĐÃ kiểm có bộ chữ Việt (check_vn_font.py 21/08). */
:root{
  --bg:#0b1526; --panel:#13233d; --panel2:#0f1d33; --line:#24406b;
  --ink:#e8eefc; --dim:#8fa3c8; --faint:#5a7099;
  --accent:#ffb547;            /* MỘT màu nhấn duy nhất — vàng ánh trăng của game */
  --ok:#5dffa4; --bad:#ff5d73; --warn:#ffd36b; --cool:#8fd4ff;
  --r:12px;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html,body{margin:0;padding:0}
body{
  background:
    radial-gradient(1100px 520px at 15% -8%, #1b3358, transparent),
    radial-gradient(900px 480px at 92% 0%, #21365c 0%, transparent 60%),
    repeating-linear-gradient(0deg, rgba(255,255,255,.014) 0 1px, transparent 1px 3px),
    var(--bg);
  color:var(--ink);
  font-family:"Bricolage Grotesque","Be Vietnam Pro","Segoe UI",system-ui,sans-serif;
  font-size:15px; line-height:1.55; min-height:100vh;
}
.mono,td.num,.kpi b,.pillv{font-family:"JetBrains Mono",ui-monospace,monospace;font-variant-numeric:lining-nums tabular-nums}
.wrap{max-width:1240px;margin:0 auto;padding:18px 16px 64px}

/* ── đầu trang: dải ảnh pixel THẬT của chính game (assets/art/bg/sky.png) ── */
header.top{
  position:relative;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;
  background:var(--panel);margin-bottom:18px
}
.skyband{height:96px;background-image:url('/assets/art/bg/sky.png');background-size:auto 100%;
  background-repeat:repeat-x;image-rendering:pixelated;opacity:.55}
.tophead{position:absolute;inset:0;display:flex;align-items:center;gap:14px;padding:0 18px;
  background:linear-gradient(90deg, rgba(11,21,38,.94) 30%, rgba(11,21,38,.55))}
.tophead h1{margin:0;font-size:26px;font-weight:800;letter-spacing:-.4px}
.tophead h1 small{display:block;font-size:12px;font-weight:300;color:var(--dim);letter-spacing:.4px}
.moon{font-size:30px;filter:drop-shadow(0 0 14px rgba(255,181,71,.55))}
.spacer{flex:1}

.btn{font:inherit;font-size:14px;background:var(--panel2);color:var(--ink);border:1px solid var(--line);
  border-radius:9px;padding:9px 13px;cursor:pointer;min-height:40px}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn.on{background:var(--accent);color:#20160a;border-color:var(--accent);font-weight:700}

/* minmax(0,1fr) chu khong phai 1fr: o luoi mac dinh khong chiu co nho hon noi dung ben trong,
   nen mot cai bang rong la day pho ra ngoai man hinh dien thoai. */
.grid{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
@media(min-width:900px){.g2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.g3{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)}}

section.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:16px 16px 14px;margin-bottom:14px;min-width:0}
section.card h2{margin:0 0 4px;font-size:15px;font-weight:800;letter-spacing:.2px;color:var(--accent)}
section.card p.hint{margin:0 0 12px;font-size:12.5px;color:var(--faint)}

/* KPI: nhãn và số NẰM CÙNG MỘT HÀNG (luật màn quản trị — dày theo chiều ngang) */
.kpis{display:flex;flex-wrap:wrap;gap:10px}
.kpi{flex:1 1 190px;display:flex;align-items:baseline;justify-content:space-between;gap:10px;
  background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px 13px}
.kpi span{font-size:12.5px;color:var(--dim)}
.kpi b{font-size:21px;font-weight:700;color:var(--ink)}

table{width:100%;border-collapse:collapse;font-size:13.5px}
th,td{text-align:left;padding:7px 9px;border-bottom:1px solid rgba(36,64,107,.5);vertical-align:middle}
th{color:var(--dim);font-weight:400;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
td.num{text-align:right;white-space:nowrap}
tbody tr:hover{background:rgba(255,181,71,.06)}
tr.click{cursor:pointer}

.bar{position:relative;height:20px;background:var(--panel2);border-radius:5px;overflow:hidden;min-width:90px}
.bar i{position:absolute;inset:0 auto 0 0;background:var(--accent);opacity:.75;border-radius:5px}
.bar.ok i{background:var(--ok)} .bar.bad i{background:var(--bad)} .bar.cool i{background:var(--cool)}

.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11.5px;border:1px solid var(--line);color:var(--dim)}
.pill.ok{color:var(--ok);border-color:rgba(93,255,164,.4)}
.pill.bad{color:var(--bad);border-color:rgba(255,93,115,.4)}
.pill.warn{color:var(--warn);border-color:rgba(255,211,107,.4)}

.face{width:26px;height:26px;image-rendering:pixelated;vertical-align:middle;border-radius:5px;background:var(--panel2)}

.empty{color:var(--faint);font-size:13px;padding:14px 2px}
.quote{color:var(--ink);font-size:13px}
.quote em{color:var(--dim);font-style:normal}

/* ── xem lại nguyên cuộc ── */
#modal{position:fixed;inset:0;z-index:100000;background:rgba(4,9,18,.82);display:flex;align-items:flex-start;
  justify-content:center;padding:24px 14px;overflow:auto}
#modal .inner{width:min(880px,100%);background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.turn{border-left:3px solid var(--line);padding:8px 0 8px 12px;margin:0 0 10px}
.turn .who{font-size:12px;color:var(--dim);display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.turn .said{margin-top:3px}
.turn.player{border-left-color:var(--cool)}
.turn.npc{border-left-color:var(--accent)}
.evline{font-size:12px;color:var(--faint);padding:4px 0 4px 12px;border-left:3px solid transparent}

/* Lỗi hay lặp #6 trong sổ lỗi: TRANG KHÔNG BAO GIỜ ĐƯỢC TRÀN NGANG.
   Bảng số thì rộng — cho NÓ tự cuộn trong khung của nó, thân trang đứng yên. */
section.card > div{overflow-x:auto; -webkit-overflow-scrolling:touch; min-width:0}
section.card table{min-width:460px}
@media(max-width:620px){
  .wrap{padding:12px 10px 48px}
  header.top{overflow:visible}
  .skyband{display:none}
  .tophead{position:static;flex-wrap:wrap;gap:8px;padding:14px;background:none}
  .tophead h1{font-size:20px;flex:1 1 100%}
  .kpi{flex:1 1 140px}
  #modal{padding:10px 6px}
}

#toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:100001;
  background:var(--panel);border:1px solid var(--accent);color:var(--ink);
  border-radius:10px;padding:10px 15px;font-size:13.5px;display:none;max-width:90vw}
</style></head>
<body>
<div class="wrap">

<header class="top">
  <div class="skyband"></div>
  <div class="tophead">
    <div class="moon">🌕</div>
    <h1>Bảng đèn — Xóm Đóm Hòng<small>Sổ đen D1 · mọi con số dưới đây đọc thẳng từ dữ liệu thật, không con nào bịa</small></h1>
    <div class="spacer"></div>
    <button class="btn" data-range="24h">24 giờ</button>
    <button class="btn on" data-range="7d">7 ngày</button>
    <button class="btn" data-range="all">Tất cả</button>
    <button class="btn" id="reload">↻</button>
  </div>
</header>

<section class="card">
  <h2>Tổng quan</h2>
  <p class="hint">Một "lượt" là một lần game hỏi AI. "Rơi kịch bản" nghĩa là cả chuỗi não chết nên game phải dùng câu viết sẵn — số này cao là có não đang hỏng.</p>
  <div class="kpis" id="kpis"></div>
</section>

<div class="grid g2">
  <section class="card">
    <h2>Phễu người mới</h2>
    <p class="hint">Đếm theo NGƯỜI, không theo lượt. Tụt mạnh ở bước nào thì bước đó đang chặn người mới.</p>
    <div id="funnel"></div>
  </section>

  <section class="card">
    <h2>Người chơi rơi ở khúc nào</h2>
    <p class="hint">Mốc CUỐI CÙNG mỗi phiên chạm tới, cộng lý do thua.</p>
    <div id="quits"></div>
  </section>
</div>

<div class="grid g2">
  <section class="card">
    <h2>Não nào đang gánh · não nào đang chết</h2>
    <p class="hint">Đây chính là lỗi D hôm 21/08: Gemini chết cả buổi mà không ai biết. Giờ nhìn là thấy.</p>
    <div id="brains"></div>
  </section>

  <section class="card">
    <h2>Độ trễ mỗi lượt</h2>
    <p class="hint">"Giữa" = một nửa số lượt nhanh hơn mức này. "Chậm 95%" = cứ 20 lượt thì có 1 lượt chậm hơn mức này.</p>
    <div id="latency"></div>
  </section>
</div>

<div class="grid g2">
  <section class="card">
    <h2>Tỉ lệ chấm</h2>
    <p class="hint">AI chấm lời người chơi; điểm số thì do mã nguồn cộng. Toàn "nhạt" nghĩa là cách chấm đang keo.</p>
    <div id="verdicts"></div>
  </section>

  <section class="card">
    <h2>Tuân lệnh ngôn ngữ</h2>
    <p class="hint">Người chơi chọn tiếng nào, AI có trả lời đúng tiếng đó không. Mốc đạt: từ 95% trở lên.</p>
    <div id="langs"></div>
  </section>
</div>

<section class="card">
  <h2>Câu nói ngay trước khi bị đóng cửa</h2>
  <p class="hint">Nguyên văn — đây là chỗ đọc ra người mới đang vấp cái gì.</p>
  <div id="worst"></div>
</section>

<section class="card">
  <h2>Xem lại nguyên cuộc</h2>
  <p class="hint">Bấm một dòng để mở lại toàn bộ cuộc nói chuyện của phiên đó.</p>
  <div id="sessions"></div>
</section>

</div>

<div id="modal" hidden><div class="inner">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <strong id="mtitle" style="font-size:15px"></strong><span class="spacer" style="flex:1"></span>
    <button class="btn" id="mclose">Đóng ✕</button>
  </div>
  <div id="mbody"></div>
</div></div>

<div id="toast"></div>

<script>
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); };
  var num = function(n){ return (n==null||n==='') ? '—' : Number(n).toLocaleString('vi-VN'); };
  var pctS = function(a,b){ return b ? Math.round(a*1000/b)/10 + '%' : '—'; };

  // Lỗi hay lặp #1 của Lucas: lời nhắc hiện lại vì hẹn giờ cũ chưa xoá. Một cái hẹn giờ duy nhất.
  var toastTimer = null;
  function toast(msg){
    var t = $('toast'); t.textContent = msg; t.style.display = 'block';
    clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.style.display='none'; }, 3200);
  }

  var range = '7d';
  var KEY = new URLSearchParams(location.search).get('key');
  function api(qs){
    return fetch('/api/stats?' + qs + (KEY ? '&key=' + encodeURIComponent(KEY) : ''), { credentials:'same-origin' })
      .then(function(r){ return r.json(); });
  }

  function barRow(label, value, max, cls, right){
    var w = max ? Math.max(2, Math.round(value*100/max)) : 0;
    return '<tr><td>' + label + '</td>' +
      '<td style="width:52%"><div class="bar ' + (cls||'') + '"><i style="width:' + w + '%"></i></div></td>' +
      '<td class="num">' + (right != null ? right : num(value)) + '</td></tr>';
  }
  function tbl(rows, head){
    if (!rows) return '<div class="empty">Chưa có dữ liệu trong khoảng này.</div>';
    return '<table>' + (head ? '<thead><tr>' + head + '</tr></thead>' : '') + '<tbody>' + rows + '</tbody></table>';
  }

  var STEP = [
    ['game_start','1 · Mở game'],
    ['mode_pick','2 · Chọn chế độ'],
    ['knock','3 · Gõ cửa'],
    ['first_line','4 · Nói câu đầu'],
    ['door_open','5 · Được mời vào'],
    ['win','6 · Thắng ván']
  ];
  var VERDICT_VI = { danh_trung:'Đánh trúng', hop_ly:'Hợp lý', thuong:'Nhạt', kha_nghi:'Nghe sai sai', lo_lieu:'Lộ rồi' };
  var VCLS = { danh_trung:'ok', hop_ly:'ok', thuong:'', kha_nghi:'cool', lo_lieu:'bad' };
  var NPC_VI = { gen_z:'Ly (Gen Z)', sinh_vien:'Tí (sinh viên)', me_bim_sua:'Cô Sáu (mẹ bỉm)', ba_nam:'Bà Năm (nhà tập)' };
  var EV_VI = { game_start:'mở game', mode_pick:'chọn chế độ', knock:'gõ cửa', first_line:'nói câu đầu',
                door_open:'cửa mở', win:'thắng', lose:'thua', police:'bị công an', quit:'bỏ giữa chừng' };
  function faceOf(npc){
    if (!npc || !NPC_VI[npc] || npc === 'ba_nam') return '';
    return '<img class="face" alt="" src="/assets/art/face/' + npc + '_normal.png"> ';
  }

  function render(d){
    if (!d.ok){ toast('Không đọc được sổ đen: ' + (d.error||'?')); return; }
    var t = d.totals || {};
    var scriptedPct = t.turns ? Math.round((t.scripted||0)*1000/t.turns)/10 : 0;
    $('kpis').innerHTML =
      kpi('Phiên chơi', num(t.sessions)) +
      kpi('Lượt hỏi AI', num(t.turns)) +
      kpi('Rơi kịch bản', (t.turns? scriptedPct + '%' : '—')) +
      kpi('Chữ đã gửi đi', num(t.tin)) +
      kpi('Chữ AI viết ra', num(t.tout));
    // v2.4: nói thẳng sổ tự dọn sau bao lâu + dòng cũ nhất đang là bao lâu trước
    if (d.keepDays){
      var age = d.oldestTs ? Math.max(0, Math.round((Date.now() - d.oldestTs)/86400000)) : null;
      $('kpis').innerHTML += kpi('Sổ tự xoá sau', d.keepDays + ' ngày') +
        kpi('Dòng cũ nhất', age === null ? '—' : (age + ' ngày trước'));
    }

    // phễu
    var byName = {}; (d.funnel||[]).forEach(function(r){ byName[r.name] = r; });
    var top = (byName.game_start && byName.game_start.people) || 0;
    var rows = STEP.map(function(s){
      var p = (byName[s[0]] && byName[s[0]].people) || 0;
      return barRow(esc(s[1]), p, top, p ? 'ok' : '', num(p) + '  <span class="pill">' + pctS(p, top) + '</span>');
    }).join('');
    $('funnel').innerHTML = top ? tbl(rows) : '<div class="empty">Chưa có ai mở game trong khoảng này.</div>';

    // rơi ở khúc nào + lý do thua
    var last = d.lastStep || [];
    var lmax = last.reduce(function(m,r){ return Math.max(m, r.n); }, 0);
    var r1 = last.map(function(r){ return barRow('Dừng ở: ' + esc(EV_VI[r.name]||r.name), r.n, lmax, 'bad'); }).join('');
    var r2 = (d.quits||[]).slice(0,10).map(function(r){
      var det = ''; try { det = JSON.parse(r.detail||'null'); } catch(e){}
      var why = det && (det.cause || det.why) ? esc(det.cause || det.why) : '—';
      return '<tr><td>' + esc(EV_VI[r.name]||r.name) + '</td><td>' + why + '</td><td class="num">' + num(r.n) + '</td></tr>';
    }).join('');
    $('quits').innerHTML = (last.length ? tbl(r1) : '<div class="empty">Chưa có phiên nào.</div>') +
      (r2 ? '<div style="height:10px"></div>' + tbl(r2, '<th>Kết cục</th><th>Vì sao</th><th class="num">Lần</th>') : '');

    // não
    var bs = d.brains || [];
    var bmax = bs.reduce(function(m,r){ return Math.max(m, r.n); }, 0);
    var tot = bs.reduce(function(m,r){ return m + r.n; }, 0);
    var br = bs.map(function(r){
      var dead = r.brain === 'kịch bản';
      return '<tr><td>' + (dead ? '<span class="pill bad">kịch bản</span>' : '<b>' + esc(r.brain) + '</b>') + '</td>' +
        '<td style="width:38%"><div class="bar ' + (dead?'bad':'ok') + '"><i style="width:' +
          Math.max(2, Math.round(r.n*100/(bmax||1))) + '%"></i></div></td>' +
        '<td class="num">' + num(r.n) + '</td>' +
        '<td class="num">' + pctS(r.n, tot) + '</td>' +
        '<td class="num">' + num(r.tin) + '</td><td class="num">' + num(r.tout) + '</td></tr>';
    }).join('');
    $('brains').innerHTML = bs.length
      ? tbl(br, '<th>Não</th><th>Gánh bao nhiêu</th><th class="num">Lượt</th><th class="num">Tỉ lệ</th><th class="num">Chữ vào</th><th class="num">Chữ ra</th>')
      : '<div class="empty">Chưa có lượt nào.</div>';

    // độ trễ
    var lr = (d.latency||[]).map(function(r){
      return '<tr><td>' + esc(r.brain) + '</td><td class="num">' + num(r.n) + '</td>' +
        '<td class="num">' + num(r.p50) + ' ms</td><td class="num">' + num(r.p95) + ' ms</td>' +
        '<td class="num">' + num(r.max) + ' ms</td></tr>';
    }).join('');
    $('latency').innerHTML = lr
      ? tbl(lr, '<th>Não</th><th class="num">Lượt</th><th class="num">Giữa</th><th class="num">Chậm 95%</th><th class="num">Chậm nhất</th>')
      : '<div class="empty">Chưa đo được lượt nào.</div>';

    // verdict
    var vs = d.verdicts || [];
    var vtot = vs.reduce(function(m,r){ return m + r.n; }, 0);
    var vr = vs.map(function(r){
      return barRow(esc(VERDICT_VI[r.verdict]||r.verdict), r.n, vtot, VCLS[r.verdict]||'',
        num(r.n) + '  <span class="pill">' + pctS(r.n, vtot) + '</span>');
    }).join('');
    $('verdicts').innerHTML = vs.length ? tbl(vr) : '<div class="empty">Chưa có lượt nào được chấm.</div>';

    // ngôn ngữ
    var agg = {};
    (d.langs||[]).forEach(function(r){
      var k = r.lang || '?';
      agg[k] = agg[k] || { total:0, right:0 };
      agg[k].total += r.n;
      if (r.reply_lang === r.lang) agg[k].right += r.n;
    });
    var LN = { vi:'🇻🇳 Tiếng Việt', en:'🇬🇧 English' };
    var gr = Object.keys(agg).map(function(k){
      var a = agg[k], p = a.total ? a.right*100/a.total : 0;
      var cls = p >= 95 ? 'ok' : (p >= 80 ? 'warn' : 'bad');
      return '<tr><td>' + (LN[k]||k) + '</td>' +
        '<td style="width:44%"><div class="bar ' + (p>=95?'ok':'bad') + '"><i style="width:' + Math.max(2,Math.round(p)) + '%"></i></div></td>' +
        '<td class="num"><span class="pill ' + cls + '">' + (Math.round(p*10)/10) + '%</span></td>' +
        '<td class="num">' + num(a.right) + '/' + num(a.total) + '</td></tr>';
    }).join('');
    $('langs').innerHTML = gr
      ? tbl(gr, '<th>Người chơi chọn</th><th>Trả lời đúng tiếng</th><th class="num">Tỉ lệ</th><th class="num">Đúng/Tổng</th>')
      : '<div class="empty">Chưa có lượt nào đo được ngôn ngữ.</div>';

    // câu trước khi đóng cửa
    var wr = (d.worstLines||[]).map(function(r){
      return '<tr><td style="white-space:nowrap">' + faceOf(r.npc) + esc(NPC_VI[r.npc]||r.npc||'') + '</td>' +
        '<td class="quote">🐺 ' + esc(r.player_text) + '<br><em>🚪 ' + esc(r.npc_text) + '</em></td>' +
        '<td class="num"><span class="pill ' + (VCLS[r.verdict]==='bad'?'bad':'') + '">' + esc(VERDICT_VI[r.verdict]||r.verdict||'—') + '</span></td>' +
        '<td class="num">nghi ' + num(r.suspicion) + '</td></tr>';
    }).join('');
    $('worst').innerHTML = wr
      ? tbl(wr, '<th>Nhà</th><th>Câu cuối cùng</th><th class="num">Chấm</th><th class="num">Lúc đó</th>')
      : '<div class="empty">Chưa có ai bị đóng cửa trong khoảng này.</div>';
  }

  function kpi(label, value){
    return '<div class="kpi"><span>' + label + '</span><b>' + value + '</b></div>';
  }

  function renderSessions(d){
    if (!d.ok || !(d.sessions||[]).length){
      $('sessions').innerHTML = '<div class="empty">Chưa có phiên nào.</div>'; return;
    }
    var rows = d.sessions.map(function(s){
      var dt = new Date(s.last_ts);
      var mins = Math.max(1, Math.round((s.last_ts - s.first_ts)/60000));
      return '<tr class="click" data-s="' + esc(s.session) + '">' +
        '<td class="mono">' + dt.toLocaleString('vi-VN') + '</td>' +
        '<td>' + esc(s.mode==='ket_tien'?'🙇 Kẹt Tiền':'🐺 Ma Sói') + ' · ' + esc(s.lang==='en'?'EN':'VN') + '</td>' +
        '<td>' + (s.npcs||'').split(',').map(function(n){ return faceOf(n.trim()); }).join('') + '</td>' +
        '<td class="num">' + num(s.turns) + ' lượt</td>' +
        '<td class="num">' + mins + ' phút</td>' +
        '<td class="num">' + (s.scripted ? '<span class="pill bad">' + s.scripted + ' kịch bản</span>' : '') + '</td>' +
        '<td class="num">Xem lại →</td></tr>';
    }).join('');
    $('sessions').innerHTML = tbl(rows, '<th>Lúc</th><th>Chế độ</th><th>Nhà</th><th class="num">Dài</th><th class="num">Kéo</th><th class="num"></th><th class="num"></th>');
    Array.prototype.forEach.call($('sessions').querySelectorAll('tr.click'), function(tr){
      tr.onclick = function(){ openReplay(tr.dataset.s); };
    });
  }

  function openReplay(session){
    $('mtitle').textContent = 'Xem lại phiên ' + session.slice(0, 12);
    $('mbody').innerHTML = '<div class="empty">Đang mở…</div>';
    $('modal').hidden = false;
    api('view=replay&session=' + encodeURIComponent(session)).then(function(d){
      if (!d.ok){ $('mbody').innerHTML = '<div class="empty">' + esc(d.error||'lỗi') + '</div>'; return; }
      var items = [];
      (d.events||[]).forEach(function(e){ items.push({ ts:e.ts, kind:'ev', row:e }); });
      (d.turns||[]).forEach(function(t){ items.push({ ts:t.ts, kind:'turn', row:t }); });
      items.sort(function(a,b){ return a.ts - b.ts; });
      if (!items.length){ $('mbody').innerHTML = '<div class="empty">Phiên này chưa ghi được gì.</div>'; return; }
      $('mbody').innerHTML = items.map(function(it){
        if (it.kind === 'ev'){
          var e = it.row;
          return '<div class="evline">— ' + esc(EV_VI[e.name]||e.name) +
            (e.detail && e.detail !== 'null' ? ' · ' + esc(e.detail).slice(0,180) : '') + '</div>';
        }
        var t = it.row, out = '';
        if (t.player_text){
          out += '<div class="turn player"><div class="who">🐺 Người chơi · ' +
            new Date(t.ts).toLocaleTimeString('vi-VN') + '</div><div class="said">' + esc(t.player_text) + '</div></div>';
        }
        if (t.npc_text){
          var tags = [];
          if (t.verdict) tags.push('<span class="pill ' + (VCLS[t.verdict]||'') + '">' + esc(VERDICT_VI[t.verdict]||t.verdict) + '</span>');
          tags.push('<span class="pill ' + (t.scripted ? 'bad' : 'ok') + '">' + esc(t.brain || 'kịch bản') + '</span>');
          if (t.latency_ms != null) tags.push('<span class="pill">' + num(t.latency_ms) + ' ms</span>');
          if (t.trust != null) tags.push('<span class="pill">tin ' + num(t.trust) + ' · nghi ' + num(t.suspicion) +
            ' · hứng ' + num(t.interest) + ' · kiên nhẫn ' + num(t.patience) + '</span>');
          if (t.friend != null) tags.push('<span class="pill warn">thiện cảm ' + num(t.friend) + '%</span>');
          if (t.invite_intent) tags.push('<span class="pill ok">MỜI VÀO</span>');
          if (t.signal_raw || t.gate_reason) tags.push('<span class="pill">nv ' + esc(t.signal_raw||'·') + '→' +
            esc(t.signal_final||'·') + (t.gate_reason && t.gate_reason !== 'qua' ? ' [' + esc(t.gate_reason) + ']' : '') + '</span>');
          if (t.err) tags.push('<span class="pill bad">' + esc(t.err) + '</span>');
          out += '<div class="turn npc"><div class="who">' + faceOf(t.npc) + esc(NPC_VI[t.npc]||t.npc||'?') +
            ' · ' + esc(t.kind||'') + ' ' + tags.join(' ') + '</div><div class="said">' + esc(t.npc_text) + '</div></div>';
        }
        return out;
      }).join('');
    });
  }

  function loadAll(){
    api('view=overview&range=' + range).then(render).catch(function(e){ toast('Lỗi mạng: ' + e.message); });
    api('view=sessions&range=' + range).then(renderSessions).catch(function(){});
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-range]'), function(b){
    b.onclick = function(){
      range = b.dataset.range;
      Array.prototype.forEach.call(document.querySelectorAll('[data-range]'), function(x){ x.classList.toggle('on', x===b); });
      loadAll();
    };
  });
  $('reload').onclick = function(){ loadAll(); toast('Đã tải lại'); };
  $('mclose').onclick = function(){ $('modal').hidden = true; };
  $('modal').onclick = function(e){ if (e.target === $('modal')) $('modal').hidden = true; };
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') $('modal').hidden = true; });

  loadAll();
})();
</script>
</body></html>`;
