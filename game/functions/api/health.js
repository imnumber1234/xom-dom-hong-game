// GET /api/health — deploy sanity: is the brain wired? Never leaks the key.
export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({
    ok: true,
    haiku: !!env.ANTHROPIC_API_KEY,
    deepseek: !!env.DEEPSEEK_API_KEY
  }), { headers: { 'Content-Type': 'application/json' } });
}
