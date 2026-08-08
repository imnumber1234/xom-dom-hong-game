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
      verdict: {
        type: 'string',
        enum: ['lo_lieu', 'kha_nghi', 'thuong', 'hop_ly', 'danh_trung'],
        description: 'Chấm LỜI NGƯỜI LẠ VỪA NÓI theo rubric trong system prompt. Game tự tính điểm từ verdict này.'
      },
      thought: {
        type: 'string',
        description: 'Suy nghĩ THẦM của nhân vật về người lạ, MỘT câu ngắn đúng giọng nhân vật (hiện thành bong bóng 💭). KHÔNG BAO GIỜ chứa con số/điểm, không trùng nguyên văn với dialogue.'
      },
      convo_state: {
        type: 'string',
        enum: ['listening', 'thinking', 'doubting', 'trusting', 'rejecting'],
        description: 'Trạng thái TỔNG của cuộc nói chuyện — chỉ đổi ở khoảnh khắc quan trọng, không nhảy mỗi câu.'
      },
      final_test: { type: 'boolean', description: 'true CHỈ KHI lời thoại này là CÂU HỎI CHỐT kiểm tra cuối trước khi mời vào.' },
      invite_intent: { type: 'boolean', description: 'true CHỈ KHI nhân vật thật sự muốn mời người lạ vào nhà.' },
      contradiction: { type: 'boolean', description: 'CHỈ true khi lời kể mâu thuẫn với BỘ ĐỒ ĐANG MẶC (outfit). Mâu thuẫn kiểu khác (giá cả, tên người, chi tiết chuyện) KHÔNG tính — thể hiện qua verdict kha_nghi/lo_lieu.' },
      shutdown: { type: 'boolean', description: 'true nếu nhân vật chấm dứt hẳn cuộc nói chuyện.' }
    },
    required: ['dialogue', 'emotion', 'verdict', 'thought', 'convo_state', 'final_test',
      'invite_intent', 'contradiction', 'shutdown']
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

  // §2 shop item "Gợi ý": the strategist whispers ONE line the player should say next.
  if (body.hintAsk) {
    const hint = await tryHint(env, persona, club, body).catch(() => null);
    return json({ ok: true, hint: hint || 'Để ý coi họ đang mê chuyện gì, rồi kể một câu chuyện khớp với bộ đồ bạn đang mặc.' });
  }

  const lang = body.lang === 'en' ? 'en' : 'vi';

  // Scripted greeting — free, instant, sets the scene.
  if (body.greet) {
    const pool = (lang === 'en' && persona.greetings_en) ? persona.greetings_en : persona.greetings;
    const g = pool[seed % pool.length].replaceAll('{CLUB}', club);
    return json({
      ok: true, scripted: true,
      npc: { dialogue: g, emotion: 'suspicious', verdict: null, thought: '', convo_state: 'doubting', final_test: false, invite_intent: false, contradiction: false, shutdown: false }
    });
  }

  const playerText = String(body.playerText || '').slice(0, 600);
  if (!playerText.trim() && !body.finalTestAsk) return json({ ok: false, error: 'nói gì đi chứ' }, 400);
  const state = body.state || { trust: 30, suspicion: 20, interest: 50, patience: 100 };

  if (env.FORCE_SCRIPTED === '1') {
    return json({ ok: true, scripted: true, npc: scriptedReply(body.npcId, playerText, state, club) });
  }

  // Build the shared prompt
  let system = SYSTEM_TEMPLATE
    .replace('{PERSONA_CARD}', persona.card.replaceAll('{CLUB}', club))
    .replace('{OUTFIT}', String(body.outfit || 'không rõ').slice(0, 400));
  if (lang === 'en') {
    system += '\n\nQUAN TRỌNG — NGÔN NGỮ: Người lạ nói TIẾNG ANH. Viết dialogue và thought bằng TIẾNG ANH tự nhiên, giữ nguyên cá tính nhân vật (được phép chêm vài từ cảm thán tiếng Việt như "trời ơi", "nha" cho có màu).';
  }

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
  // §3 final-test beat: the engine (not the AI) decided the door stays shut until the NPC
  // asks one make-or-break verification question. Injected as a user-side stage direction.
  if (body.finalTestAsk) {
    messages.push({
      role: 'user',
      content: '[Đạo diễn: nhân vật ĐANG ĐỊNH mời người lạ vào nhưng còn lấn cấn một chút — ĐỪNG mời vội lượt này. Hãy đặt đúng MỘT "câu hỏi chốt" kiểm tra lại chi tiết người lạ từng kể (kiểu "Ủa mà nãy em nói em tên gì?", "Mã đơn hàng số mấy?"). Đặt final_test=true, invite_intent=false.]'
    });
  }

  // Hidden state hint on the last user turn (helps calibrate tone + invite pacing)
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
    // Via Cloudflare AI Gateway (created by Lucas 2026-08-06): routes around the
    // Anthropic 403 that direct calls hit from CF Asia colos. Same headers/body.
    const r = await fetch('https://gateway.ai.cloudflare.com/v1/56e3175ef4d0c606c465a116c3939d5d/xom-dom-hong/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      signal: AbortSignal.timeout(6000),   // §4: fail fast to DeepSeek instead of stalling the turn
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

// The strategist knows the persona card (that's what the powerup buys you).
async function tryHint(env, persona, club, body) {
  if (!env.ANTHROPIC_API_KEY) return null;
  const history = (Array.isArray(body.history) ? body.history.slice(-10) : [])
    .map(h => (h.role === 'npc' ? 'Hàng xóm: ' : 'Người chơi: ') + String(h.text || '').slice(0, 300))
    .join('\n');
  const r = await fetch('https://gateway.ai.cloudflare.com/v1/56e3175ef4d0c606c465a116c3939d5d/xom-dom-hong/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      system: 'Bạn là quân sư của người chơi trong game thuyết phục hàng xóm mời mình vào nhà. Dựa vào hồ sơ nhân vật và cuộc nói chuyện, đề xuất đúng MỘT câu ' + (body.lang === 'en' ? 'TIẾNG ANH' : 'tiếng Việt (đầy đủ dấu)') + ' ngắn, tự nhiên mà người chơi NÊN NÓI tiếp theo để tăng lòng tin. CHỈ trả về câu đó, không giải thích, không ngoặc kép.',
      messages: [{
        role: 'user',
        content: `HỒ SƠ HÀNG XÓM:\n${persona.card.replaceAll('{CLUB}', club)}\n\nNGƯỜI CHƠI ĐANG MẶC: ${String(body.outfit || 'không rõ').slice(0, 400)}\n\nCUỘC NÓI CHUYỆN:\n${history}\n\nCâu nên nói tiếp theo:`
      }]
    })
  });
  if (!r.ok) return null;
  const data = await r.json();
  const t = (data.content || []).find(c => c.type === 'text');
  return t ? t.text.trim().slice(0, 300) : null;
}

async function tryDeepSeek(env, system, messages) {
  if (!env.DEEPSEEK_API_KEY) return null;
  const schemaNote = `\n\nTRẢ LỜI: CHỈ một JSON object, không markdown, đúng dạng:
{"dialogue":"lời thoại 1-3 câu tiếng Việt đủ dấu","emotion":"neutral|interested|amused|suspicious|angry","verdict":"lo_lieu|kha_nghi|thuong|hop_ly|danh_trung","thought":"suy nghĩ thầm 1 câu ngắn, không số điểm","convo_state":"listening|thinking|doubting|trusting|rejecting","final_test":true/false,"invite_intent":true/false,"contradiction":true/false,"shutdown":true/false}`;
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
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

const VERDICTS = ['lo_lieu', 'kha_nghi', 'thuong', 'hop_ly', 'danh_trung'];
const CONVO_STATES = ['listening', 'thinking', 'doubting', 'trusting', 'rejecting'];

function shapeReply(i, brain, usage) {
  return {
    ok: true, scripted: false, brain,
    usage: usage ? { in: usage.input_tokens || usage.prompt_tokens, out: usage.output_tokens || usage.completion_tokens } : undefined,
    npc: {
      dialogue: String(i.dialogue || '…'),
      emotion: i.emotion,
      verdict: VERDICTS.includes(i.verdict) ? i.verdict : 'thuong',
      thought: String(i.thought || '').slice(0, 200),
      convo_state: CONVO_STATES.includes(i.convo_state) ? i.convo_state : 'listening',
      final_test: !!i.final_test,
      invite_intent: !!i.invite_intent,
      contradiction: !!i.contradiction,
      shutdown: !!i.shutdown
    }
  };
}
