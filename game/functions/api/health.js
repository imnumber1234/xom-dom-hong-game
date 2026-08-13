// GET /api/health — deploy sanity: is the brain wired? Never leaks the key.
// v0.8: liệt kê ĐÚNG THỨ TỰ chuỗi não + ai đang ngồi ghế nghỉ 10 phút.
import { CHAIN, benchState } from './_brain.js';

export async function onRequestGet({ env }) {
  const benched = benchState();
  return new Response(JSON.stringify({
    ok: true,
    // thứ tự thật đang chạy, kèm đã cắm khoá hay chưa và còn nghỉ bao nhiêu giây
    chain: CHAIN.map(p => ({ ten: p.name, co_khoa: p.hasKey(env), nghi_giay: benched[p.name] || 0 })),
    order: env.BRAIN_ORDER || null,
    force_scripted: env.FORCE_SCRIPTED === '1',
    // giữ 2 khoá cũ cho công cụ/kiểm thử đời trước khỏi vỡ
    haiku: !!env.ANTHROPIC_API_KEY,
    deepseek: !!env.DEEPSEEK_API_KEY
  }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
