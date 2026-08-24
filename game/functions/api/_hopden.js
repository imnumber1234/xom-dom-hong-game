// _hopden.js — HỘP ĐEN phía máy chủ. CHỈ CÓ TRONG BẢN BÓNG, không có trong kho chính.
//
// Luật số một (chép của XNK kg.py:735 "Never crash the main flow due to logging"):
// ghi trace KHÔNG BAO GIỜ được làm chậm hoặc làm hỏng một lượt chơi. Mọi thứ nằm sau
// waitUntil (chạy SAU khi phản hồi đã đi), bọc try/catch, không có binding thì im lặng bỏ qua.
import { AsyncLocalStorage } from 'node:async_hooks';

export const kho = new AsyncLocalStorage();
const fetchThat = globalThis.fetch;
let daBoc = false;

function nhanDienNao(u) {
  if (u.includes('/google-ai-studio/')) return 'gemini';
  if (u.includes('/deepseek/')) return 'deepseek';
  if (u.includes('/anthropic/')) return 'haiku';
  if (u.includes('dashscope') || u.includes('/chat/completions')) return 'qwen';
  return 'la';
}

export function docGoiTin(nao, g) {
  if (!g) return null;
  if (nao === 'gemini') return {
    system: (((g.systemInstruction || {}).parts || [])[0] || {}).text || '',
    messages: (g.contents || []).map(c => ({ role: c.role === 'model' ? 'assistant' : 'user',
      content: (c.parts || []).map(p => p.text).join('') })),
    temp: (g.generationConfig || {}).temperature };
  if (nao === 'haiku') return {
    system: Array.isArray(g.system) ? g.system.map(s => s.text).join('') : String(g.system || ''),
    messages: g.messages || [], temp: g.temperature };
  const ms = g.messages || [];
  return { system: ms[0] && ms[0].role === 'system' ? ms[0].content : '',
           messages: ms.filter(m => m.role !== 'system'), temp: g.temperature, presence: g.presence_penalty };
}

export function docTraLoi(nao, text) {
  let d; try { d = JSON.parse(text); } catch { return null; }
  if (nao === 'gemini') {
    const p = ((((d.candidates || [])[0] || {}).content || {}).parts) || [];
    const fc = p.find(x => x.functionCall);
    return { input: fc ? fc.functionCall.args : null,
             tok: d.usageMetadata ? { in: d.usageMetadata.promptTokenCount, out: d.usageMetadata.candidatesTokenCount } : null };
  }
  if (nao === 'haiku') {
    const c = (d.content || []).find(x => x.type === 'tool_use');
    return { input: c ? c.input : null,
             tok: d.usage ? { in: d.usage.input_tokens, out: d.usage.output_tokens } : null };
  }
  const raw = ((((d.choices || [])[0] || {}).message) || {}).content;
  let input = null;
  if (raw) { try { input = JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); } catch {} }
  return { input, tok: d.usage ? { in: d.usage.prompt_tokens, out: d.usage.completion_tokens } : null };
}

export function bocFetch() {
  if (daBoc) return; daBoc = true;
  globalThis.fetch = async (url, init) => {
    init = init || {};
    const hop = kho.getStore();
    if (!hop || !init.body) return fetchThat(url, init);
    const u = String(url && url.url ? url.url : url);
    const nao = nhanDienNao(u);
    const t0 = Date.now();
    let gui = null; try { gui = JSON.parse(init.body); } catch {}
    const goi = { nao, ms: 0, gui: docGoiTin(nao, gui) };
    hop.calls.push(goi);
    try {
      const r = await fetchThat(url, init);
      goi.ms = Date.now() - t0; goi.status = r.status; goi.ok = r.ok;
      const than = await r.clone().text().catch(() => '');
      goi.nhan = r.ok ? docTraLoi(nao, than) : null;
      if (!r.ok) goi.loi = 'HTTP ' + r.status + ' ' + than.slice(0, 160);
      return r;
    } catch (e) { goi.ms = Date.now() - t0; goi.loi = String((e && e.message) || e); throw e; }
  };
}

// ── tách khối tin nhắn cuối (dữ liệu cho H3) ─────────────────────────────────
const NHAN = [['[Trạng thái ngầm','trang_thai'],['[Hidden state','trang_thai'],['[Bối cảnh xóm','boi_canh_xom'],
  ['[Chuyện xóm nghe kể','so_tai_tieng'],['[Đêm trước','dem_truoc'],['[Nhại giọng','nhai_giong'],
  ['[Voice reference','nhai_giong'],['[Nhắc giọng','nhac_giong'],['[Voice re-anchor','nhac_giong'],
  ['[CÂU BẠN ĐÃ NÓI','chong_lap'],['[Đạo diễn','dao_dien'],['[Trời sắp sáng','giuc_gio'],
  ['[CHUYỆN NGẦM','nhiem_vu'],['[CHUYỆN CỦA','nhiem_vu'],['[NHIỆM VỤ','nhiem_vu'],
  ['[ĐỒ CỦA','nhiem_vu'],['[VIỆC VẶT','nhiem_vu']];

export function tachKhoi(lastUser) {
  const s = String(lastUser || ''), khoi = {}, thu_tu = [];
  let dau = [], hienTai = null;
  for (const d of s.split('\n')) {
    if (d.startsWith('[')) {
      hienTai = 'khac';
      for (const n of NHAN) if (d.startsWith(n[0])) { hienTai = n[1]; break; }
      if (thu_tu.indexOf(hienTai) < 0) thu_tu.push(hienTai);
    }
    const n = d.length + 1;
    if (hienTai === null) dau.push(d); else khoi[hienTai] = (khoi[hienTai] || 0) + n;
  }
  const cau = dau.join('\n').trim();
  return { cau_nguoi_choi: cau, tong: s.length,
           playerRatio: s.length ? +(cau.length / s.length).toFixed(4) : 0, khoi, thu_tu };
}

// ── H6: neo giọng còn ở cuối system không ────────────────────────────────────
export function doNeoGiong(sys) {
  const s = String(sys || '');
  const i = Math.max(s.indexOf('CÁCH NÓI CỦA NHÂN VẬT NÀY'), s.indexOf('HOW THIS CHARACTER TALKS'));
  if (i < 0) return { co: false, bi_day: false };
  return { co: true, o_byte: i, system_B: s.length, con_lai: s.length - i, bi_day: (s.length - i) > 600 };
}

// ── che bí mật TRƯỚC khi ghi ────────────────────────────────────────────────
const BI_MAT = [[/sk-[A-Za-z0-9_-]{16,}/g,'«khoá-sk»'],[/AIza[A-Za-z0-9_-]{20,}/g,'«khoá-google»'],
  [/gh[pousr]_[A-Za-z0-9]{20,}/g,'«khoá-github»'],[/AKIA[A-Z0-9]{12,}/g,'«khoá-aws»'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/g,'«khoá-slack»'],[/-----BEGIN [A-Z ]*PRIVATE KEY-----/g,'«khoá-riêng»'],
  [/\b0\d{9,10}\b/g,'«điện-thoại»'],[/[\w.+-]+@[\w-]+\.[\w.-]+/g,'«email»']];
export function loc(s) { let t = String(s == null ? '' : s); for (const b of BI_MAT) t = t.replace(b[0], b[1]); return t; }

// ── ghi D1 ───────────────────────────────────────────────────────────────────
export async function ghiD1(env, r) {
  if (!env.HOPDEN) return;                       // không có binding → im lặng bỏ qua
  try {
    const bam = await bamNgan(r.system || '');
    await env.HOPDEN.batch([
      env.HOPDEN.prepare('INSERT OR IGNORE INTO prompt_blobs(hash,body,first_seen) VALUES(?,?,?)')
        .bind(bam, r.system || '', Date.now()),
      env.HOPDEN.prepare(`INSERT OR REPLACE INTO turns(turn_id,run_id,ts,npc_id,turn_no,kind,player_text,
        system_hash,last_user,blocks,neo_giong,body_goc,brain,calls,retried,ms,tok_in,tok_out,err,
        raw_json,verdict,thought,dialogue,emotion,convo_state,flags,player_claim,
        signal_raw,signal_final,gate_reason,scripted,ua,country)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(r.turn_id, r.run_id, r.ts, r.npc_id, r.turn_no, r.kind, r.player_text,
          bam, r.last_user, JSON.stringify(r.blocks), JSON.stringify(r.neo_giong), JSON.stringify(r.body_goc),
          r.brain, JSON.stringify(r.calls), r.retried ? 1 : 0, r.ms,
          (r.tok && r.tok.in) || null, (r.tok && r.tok.out) || null, r.err,
          r.raw ? JSON.stringify(r.raw) : null, r.verdict, r.thought, r.dialogue, r.emotion, r.convo_state,
          JSON.stringify(r.flags), r.player_claim, r.signal_raw, r.signal_final, r.gate_reason,
          r.scripted ? 1 : 0, r.ua, r.country)
    ]);
    if (Math.random() < 0.01)                    // dọn cơ hội: Pages Functions không có cron
      await env.HOPDEN.prepare('DELETE FROM turns WHERE ts < ?').bind(Date.now() - 30 * 864e5).run();
  } catch (e) { /* im lặng — ghi trace không bao giờ làm hỏng lượt chơi */ }
}

async function bamNgan(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 8).map(x => x.toString(16).padStart(2, '0')).join('');
}
