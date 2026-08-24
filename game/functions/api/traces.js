// traces.js — đường đọc trace. FAIL CLOSED: không đặt HOPDEN_PASS thì 403.
// Khác GAME_PASS (mở mặc định) — vì trace chứa lời người chơi.
export async function onRequestGet({ request, env }) {
  const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  if (!env.HOPDEN_PASS) return J({ ok: false, error: 'chưa đặt HOPDEN_PASS' }, 403);
  if (request.headers.get('x-hopden-pass') !== env.HOPDEN_PASS) return J({ ok: false, error: 'sai mật khẩu' }, 403);
  if (!env.HOPDEN) return J({ ok: false, error: 'chưa cắm binding D1' }, 500);
  const u = new URL(request.url);
  try {
    if (u.searchParams.get('export') === 'jsonl') {
      const { results } = await env.HOPDEN.prepare(
        'SELECT t.*, p.body AS system FROM turns t LEFT JOIN prompt_blobs p ON p.hash=t.system_hash ORDER BY t.ts').all();
      return new Response(results.map(r => JSON.stringify(r)).join('\n'),
        { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' } });
    }
    const gh = Number(u.searchParams.get('gioi_han') || 500);
    const { results } = await env.HOPDEN.prepare(
      'SELECT t.*, p.body AS system FROM turns t LEFT JOIN prompt_blobs p ON p.hash=t.system_hash ORDER BY t.ts DESC LIMIT ?')
      .bind(gh).all();
    return J({ ok: true, so: results.length, luot: results });
  } catch (e) { return J({ ok: false, error: String(e.message).slice(0, 200) }, 500); }
}
