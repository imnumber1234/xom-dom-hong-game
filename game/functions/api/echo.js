// echo.js — nhận điểm đã áp + delta_notes + nhãn 👎 từ script tiêm.
// Vá vào dòng đã ghi. Hỏng thì im lặng — không bao giờ làm hỏng lượt chơi.
export async function onRequestPost({ request, env }) {
  const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s,
    headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  if (!env.HOPDEN) return J({ ok: true });
  try {
    const d = await request.json();
    if (!d.turn_id) return J({ ok: true });
    if (d.fb !== undefined) {
      await env.HOPDEN.prepare('UPDATE turns SET fb=?, fb_at=? WHERE turn_id=?')
        .bind(d.fb, d.fb_at || Date.now(), d.turn_id).run();
    } else {
      const a = d.applied || {};
      await env.HOPDEN.prepare('UPDATE turns SET dT=?,dS=?,dI=?,dP=?,state_out=?,delta_notes=? WHERE turn_id=?')
        .bind(a.dT, a.dS, a.dI, a.dP, JSON.stringify(d.state_out || null),
              JSON.stringify(d.delta_notes || []), d.turn_id).run();
    }
  } catch (e) { /* im lặng */ }
  return J({ ok: true });
}
