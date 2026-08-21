// _ledger.js — v2.0 SỔ ĐEN. Mỗi lượt gọi /api/converse ghi ĐÚNG MỘT dòng vào D1.
//
// Vì sao có tệp này (plan-v2.0 §4 + §1b lỗi D):
//   Trước v2.0 game không lưu một chữ nào — 0 dòng console.log, không D1/KV/R2. Sáng 21/08 đo ra
//   Gemini đang chết ở bản thật suốt cả buổi và KHÔNG AI BIẾT, vì không có chỗ nào ghi lại.
//   Sổ đen sửa đúng chỗ đó: mỗi lượt ghi lại NÃO NÀO trả lời, mất bao lâu, tốn bao nhiêu chữ,
//   bốn chỉ số lúc đó, chấm điểm gì, cổng nhiệm vụ chặn vì lý do gì.
//
// LUẬT VÀNG: ghi kiểu "GỬI RỒI ĐI" (waitUntil). Người chơi KHÔNG bao giờ phải chờ sổ đen.
//   Sổ hỏng / D1 rớt → nuốt lỗi, game chạy tiếp như không có gì. Không bao giờ ném ngược ra ngoài.
//
// Sổ đen này cũng chính là BỘ DỮ LIỆU để sau này tự luyện não (plan §8) — đừng cắt cột cho gọn.

const S = (v, max = 2000) => (v == null ? null : String(v).slice(0, max));
const N = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Math.round(Number(v)));
const B = (v) => (v ? 1 : 0);

const TURN_COLS = [
  'ts', 'session', 'run_id', 'deploy', 'mode', 'lang', 'npc', 'night', 'turn', 'kind',
  'player_text', 'npc_text', 'brain', 'tried', 'scripted', 'latency_ms', 'tok_in', 'tok_out',
  'verdict', 'emotion', 'trust', 'suspicion', 'interest', 'patience', 'friend',
  'invite_intent', 'final_test', 'contradiction', 'corroboration', 'shutdown',
  'signal_raw', 'signal_final', 'gate_reason', 'retried', 'reply_lang', 'err'
];

const EVENT_COLS = ['ts', 'session', 'run_id', 'deploy', 'name', 'mode', 'lang', 'npc', 'night', 'detail'];

// Đoán câu trả lời đang là thứ tiếng nào — dùng cho BÀI KIỂM TUÂN LỆNH ngôn ngữ (đáp án 13),
// cho chốt chặn ngôn ngữ ở converse.js, và cho bảng đèn.
//
// Bản đầu (21/08) chỉ hỏi "có dấu tiếng Việt không" → CHẤM OAN: câu tiếng Anh có TÊN RIÊNG
// Việt ("Hà Nội") bị tính là tiếng Việt, và câu chêm đúng một tiếng cảm thán được phép
// ("trời ơi", "ét ô ét") cũng bị tính sai. Đo bằng thước cong thì con số vô nghĩa.
//
// Bản này ĐẾM ĐIỂM cho cả hai bên rồi so:
//   · điểm Việt = từ chức năng tiếng Việt + từ có dấu VIẾT THƯỜNG (bỏ qua tên riêng viết hoa)
//   · điểm Anh  = từ chức năng tiếng Anh
//   · bên nào nhiều hơn thì là tiếng đó; hoà hoặc cả hai bằng 0 → trả null (không tính vào mẫu).
const VN_DAU = /[ăâêôơưđàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/;
const VN_WORDS = new Set(['không', 'được', 'của', 'người', 'nhà', 'em', 'anh', 'chị', 'cô', 'chú',
  'nghen', 'nha', 'dạ', 'ừa', 'rồi', 'gì', 'đây', 'đó', 'vậy', 'ơi', 'là', 'mà', 'với', 'thì',
  'cái', 'này', 'nói', 'đi', 'có', 'ở', 'cho', 'tui', 'tôi', 'mình', 'hả', 'nữa', 'luôn']);
const EN_WORDS = new Set(['the', 'you', 'and', 'what', 'that', 'this', 'are', 'with', 'have', 'just',
  'about', 'okay', 'right', 'door', 'please', 'is', 'it', 'my', 'your', 'not', 'was', 'for', 'like',
  'here', 'there', 'who', 'why', 'how', 'can', 'do', 'don', 'i', 'me', 'so', 'but', 'at', 'in', 'on']);
// Tiếng cảm thán Việt mà luật ngôn ngữ CHO PHÉP giữ trong câu tiếng Anh — không tính là lẫn tiếng.
const VN_OK_IN_EN = new Set(['ơi', 'nha', 'nhé', 'trời', 'ét', 'ô', 'ủa', 'á', 'à', 'ạ']);

export function guessLang(text) {
  const t = String(text || '').trim();
  if (t.length < 3) return null;
  const tokens = t.split(/[^\p{L}\p{N}']+/u).filter(Boolean);
  let vi = 0, en = 0;
  for (const raw of tokens) {
    const w = raw.toLowerCase();
    if (EN_WORDS.has(w)) { en++; continue; }
    if (VN_OK_IN_EN.has(w)) continue;                       // cảm thán được phép → không tính bên nào
    if (VN_WORDS.has(w)) { vi++; continue; }
    // Từ có dấu: chỉ tính khi VIẾT THƯỜNG. Viết hoa thì coi là tên riêng (Hà Nội, Tí, Ly…).
    if (VN_DAU.test(w) && raw[0] === raw[0].toLowerCase()) vi++;
  }
  if (vi === 0 && en === 0) return null;
  if (vi === en) return null;
  return vi > en ? 'vi' : 'en';
}

// ══ v2.4 — MÁY TỰ DỌN SỔ (Lucas 21/08: "make it automatic delete after period of time") ══
//
// Sổ đen lưu NGUYÊN VĂN lời người chơi thật. Giữ mãi vừa không cần vừa không nên. Nhưng nó cũng
// là bộ dữ liệu để sau này tự luyện não (kế hoạch mục 8), nên không thể xoá quá tay.
// → Giữ mặc định 30 NGÀY. Đổi bằng biến LEDGER_KEEP_DAYS của Cloudflare, KHÔNG cần đẩy bản mới.
//
// Vì sao dọn kiểu "ăn theo lượt ghi" chứ không dựng đồng hồ hẹn giờ riêng:
//   · Cloudflare Pages KHÔNG có đồng hồ hẹn giờ. Muốn có phải dựng thêm một dịch vụ nữa —
//     thêm chỗ để hỏng, thêm chỗ để quên.
//   · Sổ chỉ phình ra khi CÓ NGƯỜI CHƠI. Mà có người chơi thì có lượt ghi. Vậy cứ gắn việc dọn
//     vào lượt ghi là nó tự chạy đúng lúc cần, và không bao giờ chạy khi không cần.
//   · Chặn bằng đồng hồ trong máy chủ: tối đa MỘT lần dọn mỗi giờ, nên dù có nghìn lượt cũng
//     không có chuyện xoá đi xoá lại tốn công.
// Việc dọn chạy nền (waitUntil), hỏng thì nuốt — người chơi không bao giờ chờ vì chuyện dọn dẹp.
const SWEEP_EVERY_MS = 60 * 60 * 1000;   // nhiều nhất một lần mỗi giờ
let lastSweep = 0;

export function keepDays(env) {
  const n = Number(env && env.LEDGER_KEEP_DAYS);
  if (!isFinite(n) || n <= 0) return 30;
  return Math.max(1, Math.min(365, Math.round(n)));
}

function sweepOld(ctx) {
  const db = ctx && ctx.env && ctx.env.LOG;
  if (!db) return;
  const now = Date.now();
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;                                  // đặt TRƯỚC khi chạy: hỏng cũng không dọn dồn
  const cutoff = now - keepDays(ctx.env) * 24 * 60 * 60 * 1000;
  const p = db.batch([
    db.prepare('DELETE FROM turns WHERE ts < ?').bind(cutoff),
    db.prepare('DELETE FROM events WHERE ts < ?').bind(cutoff)
  ]).then(() => {
    console.log(`[sổ đen] đã dọn dòng cũ hơn ${keepDays(ctx.env)} ngày`);
  }).catch(e => {
    console.log('[sổ đen] dọn hỏng — nuốt lỗi: ' + String(e && e.message || e).slice(0, 200));
  });
  if (ctx.waitUntil) ctx.waitUntil(p);
}

function insert(db, table, cols, row) {
  const values = cols.map(c => (row[c] === undefined ? null : row[c]));
  const marks = cols.map(() => '?').join(',');
  return db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${marks})`).bind(...values).run();
}

/**
 * Ghi một dòng lượt nói chuyện. GỌI KIỂU FIRE-AND-FORGET:
 *   logTurn(ctx, {...})   ← ctx = { env, waitUntil, request }
 * Không await ở chỗ gọi; hàm này tự đẩy vào waitUntil.
 */
export function logTurn(ctx, r) {
  const db = ctx && ctx.env && ctx.env.LOG;
  if (!db) return;                                  // chưa gắn D1 (chạy máy mình) → im lặng bỏ qua
  const host = (() => { try { return new URL(ctx.request.url).hostname; } catch { return null; } })();
  const row = {
    ts: Date.now(),
    session: S(r.session, 64), run_id: S(r.runId, 64), deploy: S(host, 120),
    mode: S(r.mode, 16), lang: S(r.lang, 4), npc: S(r.npc, 24),
    night: N(r.night), turn: N(r.turn), kind: S(r.kind, 20),
    player_text: S(r.playerText, 1200), npc_text: S(r.npcText, 1200),
    brain: S(r.brain, 24), tried: S(r.tried, 300), scripted: B(r.scripted),
    latency_ms: N(r.latencyMs), tok_in: N(r.tokIn), tok_out: N(r.tokOut),
    verdict: S(r.verdict, 20), emotion: S(r.emotion, 20),
    trust: N(r.trust), suspicion: N(r.suspicion), interest: N(r.interest), patience: N(r.patience),
    friend: N(r.friend),
    invite_intent: B(r.inviteIntent), final_test: B(r.finalTest),
    contradiction: B(r.contradiction), corroboration: B(r.corroboration), shutdown: B(r.shutdown),
    signal_raw: S(r.signalRaw, 40), signal_final: S(r.signalFinal, 40), gate_reason: S(r.gateReason, 160),
    retried: B(r.retried), reply_lang: S(guessLang(r.npcText), 4), err: S(r.err, 400)
  };
  sweepOld(ctx);                                    // v2.4: tiện tay dọn luôn dòng quá hạn
  const p = insert(db, 'turns', TURN_COLS, row).catch(e => {
    console.log('[sổ đen] ghi lượt hỏng — nuốt lỗi, game chạy tiếp: ' + String(e && e.message || e).slice(0, 200));
  });
  if (ctx.waitUntil) ctx.waitUntil(p);
}

/** Ghi một cột mốc phía máy chơi (mở game · chọn chế độ · gõ cửa · …). Cũng gửi-rồi-đi. */
export function logEvent(ctx, e) {
  const db = ctx && ctx.env && ctx.env.LOG;
  if (!db) return;
  const host = (() => { try { return new URL(ctx.request.url).hostname; } catch { return null; } })();
  const row = {
    ts: Date.now(),
    session: S(e.session, 64), run_id: S(e.runId, 64), deploy: S(host, 120),
    name: S(e.name, 40), mode: S(e.mode, 16), lang: S(e.lang, 4), npc: S(e.npc, 24),
    night: N(e.night), detail: S(e.detail, 600)
  };
  sweepOld(ctx);                                    // v2.4
  const p = insert(db, 'events', EVENT_COLS, row).catch(err => {
    console.log('[sổ đen] ghi cột mốc hỏng: ' + String(err && err.message || err).slice(0, 200));
  });
  if (ctx.waitUntil) ctx.waitUntil(p);
}

export const LEDGER_EVENTS = [
  'game_start', 'mode_pick', 'knock', 'first_line', 'door_open', 'win', 'lose', 'police', 'quit'
];
