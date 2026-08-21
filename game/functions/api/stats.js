// GET /api/stats — số liệu cho BẢNG ĐÈN. Đọc thẳng sổ đen D1, KHÔNG bịa một con số nào.
// Khoá bằng cùng cửa với /dash (_dashauth.js) vì trả về nguyên văn lời người chơi.
//
//   ?view=overview&range=24h|7d|all   → phễu · tỉ lệ chấm · sức khoẻ não · độ trễ · ngôn ngữ · chỗ bỏ cuộc
//   ?view=sessions&range=…            → danh sách phiên chơi
//   ?view=replay&session=…            → xem lại NGUYÊN cuộc (mọi lượt + mọi cột mốc)
//
// Bách phân vị độ trễ tính bằng JavaScript chứ không bằng SQL: SQLite không có sẵn hàm đó,
// và ở quy mô chơi thử thì kéo về tính tay vừa đúng vừa đọc được, khỏi viết truy vấn hack.

import { dashGate, withCookie } from './_dashauth.js';
import { keepDays } from './_ledger.js';

const json = (d, gate) => withCookie(new Response(JSON.stringify(d), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
}), gate);

function since(range) {
  const now = Date.now();
  if (range === '24h') return now - 24 * 3600e3;
  if (range === '7d') return now - 7 * 24 * 3600e3;
  return 0;
}

const pct = (arr, p) => {
  if (!arr.length) return null;
  const i = Math.min(arr.length - 1, Math.max(0, Math.round((arr.length - 1) * p)));
  return arr[i];
};

export async function onRequestGet(ctx) {
  const gate = dashGate(ctx);
  if (!gate.ok) return gate.res;

  const db = ctx.env.LOG;
  if (!db) return json({ ok: false, error: 'chưa gắn D1 (binding LOG)' }, gate);

  const url = new URL(ctx.request.url);
  const view = url.searchParams.get('view') || 'overview';
  const from = since(url.searchParams.get('range') || '7d');
  const all = (r) => (r && r.results) || [];

  try {
    if (view === 'replay') {
      const s = url.searchParams.get('session') || '';
      const [turns, events] = await Promise.all([
        db.prepare('SELECT * FROM turns WHERE session = ? ORDER BY id').bind(s).all(),
        db.prepare('SELECT * FROM events WHERE session = ? ORDER BY id').bind(s).all()
      ]);
      return json({ ok: true, session: s, turns: all(turns), events: all(events) }, gate);
    }

    if (view === 'sessions') {
      const r = await db.prepare(`
        SELECT session,
               MIN(ts) first_ts, MAX(ts) last_ts,
               COUNT(*) turns,
               MAX(lang) lang, MAX(mode) mode, MAX(deploy) deploy,
               SUM(CASE WHEN scripted = 1 THEN 1 ELSE 0 END) scripted,
               GROUP_CONCAT(DISTINCT npc) npcs
        FROM turns WHERE ts > ? AND session IS NOT NULL
        GROUP BY session ORDER BY last_ts DESC LIMIT 80`).bind(from).all();
      return json({ ok: true, sessions: all(r) }, gate);
    }

    // ── overview ────────────────────────────────────────────────────────────
    const [funnel, verdicts, brains, lat, langs, quits, totals, lastEvent, worstLines] = await Promise.all([
      // 1. PHỄU NGƯỜI MỚI — đếm theo NGƯỜI (phiên), không theo lượt.
      db.prepare('SELECT name, COUNT(DISTINCT session) people, COUNT(*) times FROM events WHERE ts > ? GROUP BY name').bind(from).all(),
      // 2. TỈ LỆ CHẤM
      db.prepare(`SELECT verdict, COUNT(*) n FROM turns
                  WHERE ts > ? AND verdict IS NOT NULL AND kind IN ('reply','final_test','invite')
                  GROUP BY verdict ORDER BY n DESC`).bind(from).all(),
      // 3. NÃO NÀO ĐANG GÁNH — kèm tỉ lệ rơi về kịch bản (= "não đang chết")
      db.prepare(`SELECT COALESCE(brain, CASE WHEN scripted = 1 THEN 'kịch bản' ELSE '?' END) brain,
                         COUNT(*) n, SUM(COALESCE(tok_in,0)) tin, SUM(COALESCE(tok_out,0)) tout,
                         SUM(CASE WHEN err IS NOT NULL THEN 1 ELSE 0 END) errs
                  FROM turns WHERE ts > ? GROUP BY 1 ORDER BY n DESC`).bind(from).all(),
      // 4. ĐỘ TRỄ — kéo về tính bách phân vị bằng JS
      db.prepare(`SELECT COALESCE(brain,'kịch bản') brain, latency_ms FROM turns
                  WHERE ts > ? AND latency_ms IS NOT NULL ORDER BY brain LIMIT 8000`).bind(from).all(),
      // 5. TUÂN LỆNH NGÔN NGỮ (đáp án 13) — chọn tiếng gì, trả lời tiếng gì
      db.prepare(`SELECT lang, reply_lang, COUNT(*) n FROM turns
                  WHERE ts > ? AND reply_lang IS NOT NULL AND scripted = 0
                    AND kind IN ('reply','final_test','invite')
                  GROUP BY lang, reply_lang`).bind(from).all(),
      // 6. THUA VÌ GÌ + CHỖ BỎ CUỘC
      db.prepare(`SELECT name, detail, COUNT(*) n FROM events
                  WHERE ts > ? AND name IN ('lose','quit','police')
                  GROUP BY name, detail ORDER BY n DESC LIMIT 60`).bind(from).all(),
      db.prepare(`SELECT COUNT(*) turns, COUNT(DISTINCT session) sessions,
                         SUM(CASE WHEN scripted = 1 THEN 1 ELSE 0 END) scripted,
                         SUM(COALESCE(tok_in,0)) tin, SUM(COALESCE(tok_out,0)) tout
                  FROM turns WHERE ts > ?`).bind(from).all(),
      // 7. Mốc CUỐI CÙNG của mỗi phiên = người ta rơi ở khúc nào
      db.prepare(`SELECT name, COUNT(*) n FROM (
                    SELECT session, name, ROW_NUMBER() OVER (PARTITION BY session ORDER BY id DESC) rn
                    FROM events WHERE ts > ? AND session IS NOT NULL)
                  WHERE rn = 1 GROUP BY name ORDER BY n DESC`).bind(from).all(),
      // 8. Câu NGƯỜI CHƠI nói ngay trước khi bị đóng cửa
      db.prepare(`SELECT npc, player_text, npc_text, verdict, suspicion, patience, ts
                  FROM turns WHERE ts > ? AND shutdown = 1 AND player_text IS NOT NULL
                  ORDER BY ts DESC LIMIT 25`).bind(from).all()
    ]);

    // bách phân vị theo từng não
    const byBrain = {};
    for (const row of all(lat)) (byBrain[row.brain] = byBrain[row.brain] || []).push(row.latency_ms);
    const latency = Object.entries(byBrain).map(([brain, arr]) => {
      arr.sort((a, b) => a - b);
      return { brain, n: arr.length, p50: pct(arr, 0.5), p95: pct(arr, 0.95), max: arr[arr.length - 1] };
    }).sort((a, b) => b.n - a.n);

    // v2.4 — bảng đèn phải NÓI RÕ sổ giữ được bao lâu, để không ai tưởng số ở đây là từ đầu dự án
    const oldest = all(await db.prepare('SELECT MIN(ts) t FROM turns').all())[0] || {};
    return json({
      ok: true, from,
      keepDays: keepDays(ctx.env),
      oldestTs: oldest.t || null,
      totals: all(totals)[0] || {},
      funnel: all(funnel),
      verdicts: all(verdicts),
      brains: all(brains),
      latency,
      langs: all(langs),
      quits: all(quits),
      lastStep: all(lastEvent),
      worstLines: all(worstLines)
    }, gate);
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e).slice(0, 400) }, gate);
  }
}
