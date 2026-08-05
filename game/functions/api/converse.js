// POST /api/converse — the only backend endpoint.
// Client sends transcript + hidden meters; we return the NPC's move as strict JSON.
// Brain: Claude Haiku 4.5 with FORCED tool call (schema-guaranteed JSON) + prompt caching.
// No key / API error → scripted fallback keeps the game playable.
// The AI never decides win/fail — game code on the client owns the rules.

import { PERSONAS, SYSTEM_TEMPLATE, CLUBS, scriptedReply } from './_personas.js';

const NPC_TOOL = {
  name: 'npc_reply',
  description: 'Phản ứng của nhân vật cho lượt này. Luôn dùng tool này.',
  input_schema: {
    type: 'object',
    properties: {
      dialogue: { type: 'string', description: 'Lời thoại 1–3 câu, tiếng Việt đủ dấu, đúng giọng nhân vật.' },
      emotion: { type: 'string', enum: ['neutral', 'interested', 'amused', 'suspicious', 'angry'] },
      trust_delta: { type: 'integer', minimum: -20, maximum: 20 },
      suspicion_delta: { type: 'integer', minimum: -20, maximum: 20 },
      interest_delta: { type: 'integer', minimum: -20, maximum: 20 },
      patience_delta: { type: 'integer', minimum: -20, maximum: 20 },
      invite_intent: { type: 'boolean', description: 'true CHỈ KHI nhân vật thật sự muốn mời người lạ vào nhà.' },
      contradiction: { type: 'boolean', description: 'true nếu lời kể mâu thuẫn với bộ đồ đang mặc.' },
      shutdown: { type: 'boolean', description: 'true nếu nhân vật chấm dứt hẳn cuộc nói chuyện.' }
    },
    required: ['dialogue', 'emotion', 'trust_delta', 'suspicion_delta', 'interest_delta',
      'patience_delta', 'invite_intent', 'contradiction', 'shutdown']
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad json' }, 400); }

  // Optional shared password (open by default — Lucas prefers open previews)
  if (env.GAME_PASS && body.pass !== env.GAME_PASS) {
    return json({ ok: false, error: 'Sai mật khẩu xóm rồi 😅' }, 401);
  }

  const persona = PERSONAS[body.npcId];
  if (!persona) return json({ ok: false, error: 'npc không tồn tại' }, 400);

  const seed = Number(body.seed) || 0;
  const club = CLUBS[seed % CLUBS.length];

  // Scripted greeting — free, instant, sets the scene.
  if (body.greet) {
    const g = persona.greetings[seed % persona.greetings.length].replaceAll('{CLUB}', club);
    return json({
      ok: true, scripted: true,
      npc: { dialogue: g, emotion: 'suspicious', deltas: {}, invite_intent: false, contradiction: false, shutdown: false }
    });
  }

  const playerText = String(body.playerText || '').slice(0, 600);
  if (!playerText.trim()) return json({ ok: false, error: 'nói gì đi chứ' }, 400);
  const state = body.state || { trust: 30, suspicion: 20, interest: 50, patience: 100 };

  if (env.FORCE_SCRIPTED === '1') {
    return json({ ok: true, scripted: true, npc: scriptedReply(body.npcId, playerText, state, club) });
  }

  // Build the shared prompt
  const system = SYSTEM_TEMPLATE
    .replace('{PERSONA_CARD}', persona.card.replaceAll('{CLUB}', club))
    .replace('{OUTFIT}', String(body.outfit || 'không rõ').slice(0, 400));

  const history = Array.isArray(body.history) ? body.history.slice(-16) : [];
  const messages = [{ role: 'user', content: '(Cốc cốc cốc — có người gõ cửa lúc nửa đêm.)' }];
  for (const h of history) {
    const role = h.role === 'npc' ? 'assistant' : 'user';
    const text = String(h.text || '').slice(0, 600);
    if (!text) continue;
    // Anthropic requires alternating roles — merge same-role runs.
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += '\n' + text;
    else messages.push({ role, content: text });
  }
  // Hidden state hint on the last user turn (helps calibrate deltas + invite pacing)
  const last = messages[messages.length - 1];
  if (last.role === 'user') {
    last.content += `\n\n[Trạng thái ngầm của nhân vật — KHÔNG nhắc tới trong thoại: tin=${state.trust}/100, nghi=${state.suspicion}/100, hứng thú=${state.interest}/100, kiên nhẫn=${state.patience}/100. Lượt nói chuyện thứ ${Math.ceil(history.length / 2)}.]`;
  }

  // Provider chain: Haiku (best VN comedy) → DeepSeek (works from CF Asia colos where
  // Anthropic 403s) → scripted. Model quality IS the product — order matters.
  const haiku = await tryHaiku(env, system, messages).catch(() => null);
  if (haiku) return json(haiku);
  const ds = await tryDeepSeek(env, system, messages).catch(() => null);
  if (ds) return json(ds);
  return json({ ok: true, scripted: true, npc: scriptedReply(body.npcId, playerText, state, club) });
}

async function tryHaiku(env, system, messages) {
  if (!env.ANTHROPIC_API_KEY) return null;
  {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        tools: [NPC_TOOL],
        tool_choice: { type: 'tool', name: 'npc_reply' },
        messages
      })
    });
    if (!r.ok) {
      console.log('anthropic error', r.status, (await r.text()).slice(0, 300));
      return null;
    }
    const data = await r.json();
    const toolUse = (data.content || []).find(c => c.type === 'tool_use');
    if (!toolUse) return null;
    return shapeReply(toolUse.input, 'haiku', data.usage);
  }
}

async function tryDeepSeek(env, system, messages) {
  if (!env.DEEPSEEK_API_KEY) return null;
  const schemaNote = `\n\nTRẢ LỜI: CHỈ một JSON object, không markdown, đúng dạng:
{"dialogue":"lời thoại 1-3 câu tiếng Việt đủ dấu","emotion":"neutral|interested|amused|suspicious|angry","trust_delta":-20..20,"suspicion_delta":-20..20,"interest_delta":-20..20,"patience_delta":-20..20,"invite_intent":true/false,"contradiction":true/false,"shutdown":true/false}`;
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system + schemaNote },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      ]
    })
  });
  if (!r.ok) {
    console.log('deepseek error', r.status, (await r.text()).slice(0, 300));
    return null;
  }
  const data = await r.json();
  const raw = data.choices && data.choices[0] && data.choices[0].message.content;
  if (!raw) return null;
  let i;
  try { i = JSON.parse(raw); } catch { return null; }
  if (!i.dialogue) return null;
  return shapeReply(i, 'deepseek', data.usage);
}

function shapeReply(i, brain, usage) {
  return {
    ok: true, scripted: false, brain,
    usage: usage ? { in: usage.input_tokens || usage.prompt_tokens, out: usage.output_tokens || usage.completion_tokens } : undefined,
    npc: {
      dialogue: String(i.dialogue || '…'),
      emotion: i.emotion,
      deltas: {
        trust: i.trust_delta, suspicion: i.suspicion_delta,
        interest: i.interest_delta, patience: i.patience_delta
      },
      invite_intent: !!i.invite_intent,
      contradiction: !!i.contradiction,
      shutdown: !!i.shutdown
    }
  };
}
