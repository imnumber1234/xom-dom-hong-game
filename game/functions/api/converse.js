// converse.js — VỎ BỌC HỘP ĐEN. CHỈ CÓ TRONG BẢN BÓNG.
// Logic game nằm nguyên vẹn ở _converse_goc.js (chép nguyên văn, không sửa một chữ).
// Vỏ này chỉ làm 4 việc, tất cả đều SAU khi phản hồi đã đi hoặc không ảnh hưởng phản hồi:
//   1. bọc fetch để chộp nguyên văn gói tin gửi cho model (system + tin nhắn cuối)
//   2. tự nhét debug:true vào thân yêu cầu, GỠ khối debug trước khi trả về client
//   3. dựng bản ghi rồi ghi D1 trong waitUntil
//   4. hỏng ở bất kỳ đâu → vẫn trả đúng phản hồi như thường
import { onRequestPost as goc } from './_converse_goc.js';
import { kho, bocFetch, tachKhoi, doNeoGiong, loc, ghiD1 } from './_hopden.js';

bocFetch();

export async function onRequestPost(ctx) {
  const { request, env, waitUntil } = ctx;
  let body = {};
  try { body = await request.json(); } catch { return goc(ctx); }

  const runId = request.headers.get('x-hopden-run') || 'khong-ro';
  const turnId = request.headers.get('x-hopden-turn') ||
    (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

  // KHÔNG dùng { ...request } — thuộc tính của Request nằm ở prototype nên trải ra là RỖNG.
  // _converse_goc.js chỉ gọi request.json(), nhưng dựng tường minh cho khỏi vỡ ngầm nếu sau này nó dùng thêm.
  const gia = (t) => ({ json: async () => ({ ...body, ...(t ? { debug: true } : {}) }),
    headers: request.headers, method: request.method, url: request.url, cf: request.cf });

  const hop = { calls: [] };
  const t0 = Date.now();
  let res;
  try {
    res = await kho.run(hop, () => goc({ ...ctx, request: gia(true) }));
  } catch (e) {
    // vỏ bọc hỏng thì lượt chơi VẪN phải chạy — gọi lại đường gốc, không nhét debug
    try { return await goc({ ...ctx, request: gia(false) }); }
    catch (e2) { return new Response(JSON.stringify({ ok: false, error: 'lỗi máy chủ' }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
  }
  const ms = Date.now() - t0;

  let traVe;
  try { traVe = await res.clone().json(); } catch { return res; }

  try {
    const dau = hop.calls.find(c => c.gui) || null;
    const cuoi = hop.calls.slice().reverse().find(c => c.ok && c.nhan) || null;
    const msgs = dau ? (dau.gui.messages || []) : [];
    const lastUser = msgs.length ? String(msgs[msgs.length - 1].content || '') : '';
    const dbg = traVe.debug || {}, npc = traVe.npc || {};
    waitUntil(ghiD1(env, {
      turn_id: turnId, run_id: runId, ts: Date.now(),
      npc_id: body.npcId, turn_no: Math.max(1, Math.ceil(((body.history || []).length) / 2)),
      kind: body.greet ? 'greet' : body.outcomeAsk ? 'outcome' : body.hintAsk ? 'hint'
          : body.tutorAsk ? 'tutor' : body.summaryAsk ? 'summary' : body.finalTestAsk ? 'final_test' : 'reply',
      player_text: loc(body.playerText || ''),
      body_goc: { ...body, playerText: loc(body.playerText || ''),
                  history: (body.history || []).map(h => ({ role: h.role, text: loc(h.text || '') })) },
      system: dau ? loc(dau.gui.system) : '', last_user: loc(lastUser),
      blocks: tachKhoi(lastUser), neo_giong: dau ? doNeoGiong(dau.gui.system) : null,
      brain: traVe.brain || (traVe.scripted ? 'scripted' : null),
      calls: hop.calls.map(c => ({ nao: c.nao, ms: c.ms, status: c.status, ok: !!c.ok, loi: c.loi || null,
                                   temp: c.gui && c.gui.temp, presence: c.gui && c.gui.presence })),
      retried: !!dbg.retried, ms, tok: traVe.usage || (cuoi && cuoi.nhan.tok) || null,
      err: traVe.ok === false ? (traVe.error || null) : (dbg.scripted_vi || null),
      raw: (cuoi && cuoi.nhan.input) || null,
      verdict: npc.verdict || null, thought: npc.thought || null, dialogue: npc.dialogue || null,
      emotion: npc.emotion || null, convo_state: npc.convo_state || null, player_claim: npc.player_claim || null,
      flags: { final_test: !!npc.final_test, invite_intent: !!npc.invite_intent,
               contradiction: !!npc.contradiction, corroboration: !!npc.corroboration, shutdown: !!npc.shutdown },
      signal_raw: dbg.signal_raw != null ? dbg.signal_raw : null,
      signal_final: dbg.signal_final != null ? dbg.signal_final : null,
      gate_reason: dbg.gate_reason != null ? dbg.gate_reason : null,
      scripted: !!traVe.scripted,
      ua: String(request.headers.get('user-agent') || '').slice(0, 120),
      country: (request.cf && request.cf.country) || null
    }));
  } catch (e) { /* im lặng */ }

  const sach = { ...traVe }; delete sach.debug;      // GỠ hộp kính — client không được thấy
  return new Response(JSON.stringify(sach), {
    status: res.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'x-hopden-turn': turnId }
  });
}
