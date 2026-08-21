// POST /api/event — v2.0 việc 2: CỘT MỐC PHÍA MÁY CHƠI.
//
// Sổ đen ở converse.js chỉ thấy được những lượt CÓ NÓI CHUYỆN. Phễu người mới cần thấy
// cả những khúc KHÔNG gọi AI: mở game · chọn chế độ · gõ cửa · nói câu đầu · cửa mở ·
// thắng · thua · bị công an · bỏ giữa chừng. Đó là chín mốc dưới đây.
//
// Máy chơi gửi bằng `navigator.sendBeacon` (gửi rồi đi, không chờ trả lời, sống được cả
// lúc người chơi đang đóng tab) → thân tin nhắn tới đây là text/plain. Vì vậy KHÔNG đọc
// theo Content-Type mà đọc thẳng chữ rồi tự phân tích.
//
// Trả 204 (không nội dung) thật nhanh. Ghi vào D1 chạy nền, hỏng thì nuốt.

import { logEvent, LEDGER_EVENTS } from './_ledger.js';

const OK = new Set(LEDGER_EVENTS);

export async function onRequestPost(ctx) {
  let raw = '';
  try { raw = await ctx.request.text(); } catch { /* thân rỗng → thôi */ }
  let data;
  try { data = JSON.parse(raw || '{}'); } catch { return new Response(null, { status: 204 }); }

  // Cho gửi một cột mốc hoặc cả xâu (lúc đóng tab máy chơi dồn một lần cho đỡ mất).
  const list = Array.isArray(data) ? data.slice(0, 20) : [data];
  for (const e of list) {
    if (!e || !OK.has(String(e.name))) continue;   // nhãn lạ → bỏ, không ghi rác vào sổ
    logEvent(ctx, {
      name: String(e.name),
      session: e.session, runId: e.runId, mode: e.mode, lang: e.lang,
      npc: e.npc, night: e.night,
      detail: typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail || null)
    });
  }
  return new Response(null, { status: 204 });
}

// GET để soi nhanh: máy chơi có gửi được không, D1 có gắn không.
export async function onRequestGet(ctx) {
  return new Response(JSON.stringify({
    ok: true,
    d1: !!(ctx.env && ctx.env.LOG),
    events: LEDGER_EVENTS
  }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
