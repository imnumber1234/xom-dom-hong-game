// POST /api/converse — the only backend endpoint.
// Client sends transcript + hidden meters; we return the NPC's move as strict JSON.
// Brain: v0.8 "não xoay vòng" — MỌI lời gọi AI trong file này đi qua MỘT CỬA duy nhất
// (askBrain → _brain.js): Gemini → Qwen → DeepSeek → Haiku → kịch bản, có ghế nghỉ 10 phút.
// KHÔNG hàm nào ở đây được fetch thẳng tới một nhà cung cấp nữa — đó là lỗi đã giết
// quân sư 💡 và câu-hài-nhất hôm 2026-08-10 khi khoá Anthropic hết tiền.
// No key / API error → scripted fallback keeps the game playable.
// The AI never decides win/fail — game code on the client owns the rules.

import { PERSONAS, BA_NAM, SYSTEM_TEMPLATE, SCENES, CLUBS, MISSION_BLOCKS, scriptedReply, scriptedOutcome } from './_personas.js';
import { callBrain } from './_brain.js';

// v0.6 F4 — 10 nhãn cảm xúc (5 nhãn mới: chan · nguong · cam_dong · phan_khich · buc_minh).
// Client vẽ đủ 10 chân dung bằng code (portraits.js); nhãn lạ rơi về neutral ở shapeReply.
const EMOTIONS = ['neutral', 'interested', 'amused', 'suspicious', 'angry',
  'chan', 'nguong', 'cam_dong', 'phan_khich', 'buc_minh'];

// v0.3 B3 — "màn xin" của mode Kẹt Tiền. AI CHỈ chọn LOẠI kết quả; số tiền do code cầm.
const OUTCOME_TOOL = {
  name: 'npc_outcome',
  description: 'Nhân vật đã quyết định giúp (hoặc không giúp) người lạ. Luôn dùng tool này.',
  input_schema: {
    type: 'object',
    properties: {
      dialogue: {
        type: 'string',
        description: 'Lời thoại 1–3 câu lúc TRAO (hoặc từ chối), tiếng Việt đủ dấu, đúng giọng nhân vật, xưng hô đúng vai. PHẢI khớp với outcome đã chọn: tien = đưa tiền · do_an = đưa đồ ăn (KHÔNG mời vào nhà) · ca_hai = đưa cả hai · moi_com = kéo ghế mời vào ăn cơm · viec_vat = nhờ phụ một tay trước · tu_choi = từ chối tử tế · quay_lai_sau = bảo lát ghé lại. KHÔNG nói ra con số tiền cụ thể.'
      },
      emotion: { type: 'string', enum: EMOTIONS },
      outcome: {
        type: 'string',
        enum: ['tien', 'do_an', 'ca_hai', 'moi_com', 'viec_vat', 'tu_choi', 'quay_lai_sau'],
        description: 'LOẠI kết quả, chọn theo tính cách + hoàn cảnh nhân vật: tien (cho tiền) · do_an (cho đồ ăn) · ca_hai (cho cả hai) · moi_com (mời vào ăn cơm luôn — chỉ khi thật sự quý mến) · viec_vat (nhờ làm việc vặt rồi mới trả tiền) · tu_choi (không giúp) · quay_lai_sau (bảo lát ghé lại).'
      },
      thought: { type: 'string', description: 'Suy nghĩ thầm MỘT câu ngắn, không chứa con số.' }
    },
    required: ['dialogue', 'emotion', 'outcome', 'thought']
  }
};
const OUTCOME_SCHEMA_NOTE = `\n\nTRẢ LỜI: CHỈ một JSON object, không markdown, đúng dạng:
{"dialogue":"lời thoại 1-3 câu tiếng Việt đủ dấu, KHÔNG nói con số tiền","emotion":"neutral|interested|amused|suspicious|angry","outcome":"tien|do_an|ca_hai|moi_com|viec_vat|tu_choi|quay_lai_sau","thought":"suy nghĩ thầm 1 câu ngắn"}`;

const NPC_TOOL = {
  name: 'npc_reply',
  description: 'Phản ứng của nhân vật cho lượt này. Luôn dùng tool này.',
  input_schema: {
    type: 'object',
    properties: {
      dialogue: { type: 'string', description: 'Lời thoại 1–3 câu, tiếng Việt đủ dấu, đúng giọng nhân vật.' },
      emotion: { type: 'string', enum: EMOTIONS },
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
      corroboration: { type: 'boolean', description: 'Đối xứng với contradiction. CHỈ true khi món đồ NGƯỜI LẠ ĐANG CẦM/MẶC CHỐNG LƯNG cụ thể cho vai họ vừa xưng (áo Grab + túi trà sữa cho shipper · áo đồng phục + thẻ sinh viên cho sinh viên · nón lá + bó rau cho người đi chợ · tờ in ảnh tin nhắn cho người có hẹn trước). Nói suông mà trên người không có món đồ đó → false. KHÔNG BAO GIỜ true cùng lúc với contradiction.' },
      shutdown: { type: 'boolean', description: 'true nếu nhân vật chấm dứt hẳn cuộc nói chuyện.' },
      player_claim: {
        type: 'string',
        description: 'Người lạ hiện đang XƯNG là ai / vai gì — tóm TỐI ĐA 10 từ dựa trên toàn bộ lời họ đã kể (vd "shipper giao trà sữa", "sinh viên lỡ xe buýt", "cháu bà Tư ở xa về"). Họ CHƯA xưng vai gì → để chuỗi rỗng "". Chỉ ghi lại lời họ TỰ XƯNG, không suy diễn.'
      },
      // v1.0 hệ nhiệm vụ — AI chỉ PHÁT TÍN HIỆU; game code cầm trạng thái, tiền, đồ, thưởng.
      mission_signal: {
        type: 'string',
        enum: ['', 'manh_moi_1', 'manh_moi_2', 'ro_chuyen', 'dong_y_cho_muon', 'nhan_viec_vat'],
        description: 'Tín hiệu nhiệm vụ của lượt này — CHỈ dùng khi khối [NHIỆM VỤ]/[ĐỒ CỦA TÍ]/[VIỆC VẶT] trong tin nhắn cho phép, ngoài ra LUÔN để "". manh_moi_1/manh_moi_2/ro_chuyen = Ly hé từng manh mối chuyện gậy selfie (đúng thứ tự, mỗi lượt tối đa một). dong_y_cho_muon = Tí thật sự đồng ý cho mượn gậy. nhan_viec_vat = nhân vật nhận cho người lạ làm một việc vặt lấy tiền công.'
      }
    },
    required: ['dialogue', 'emotion', 'verdict', 'thought', 'convo_state', 'final_test',
      'invite_intent', 'contradiction', 'corroboration', 'shutdown', 'player_claim', 'mission_signal']
  }
};

// v0.4 T3/T4 — từ điển "tội" trong sổ tai tiếng (dùng cho cả câu chào nghe-đồn lẫn block prompt)
const GOSSIP_EVT = {
  vi: {
    contradiction: 'bị bắt quả tang kể chuyện mâu thuẫn với bộ đồ đang mặc',
    lo_lieu: 'bị bắt nói dối lộ liễu',
    kicked: 'bị đuổi thẳng',
    police: 'bị gọi công an tới rượt'
  },
  en: {
    contradiction: "got caught telling a story that didn't match their outfit",
    lo_lieu: 'got caught lying red-handed',
    kicked: 'got kicked out',
    police: 'had the cops called on them'
  }
};

// ── v0.7 T2/T3 — SỔ GIỌNG ─────────────────────────────────────────────────────
// Thí nghiệm 2026-08-10 (plan-v0.7 §3): thẻ nhân vật KHÔNG đủ để nghe ra một CON NGƯỜI cụ thể.
// 6 câu mẫu thật cho gấp 2-4 lần dấu hiệu giọng riêng VÀ chặn trôi xưng hô ở lượt 6.
// Chọn 2 câu bằng HASH (seed cuộc nói chuyện + số lượt) — KHÔNG random, để chơi lại giống hệt.
export function pickVoiceLines(persona, lang, turn, seed) {
  const pool = (lang === 'en' && Array.isArray(persona.voice_en) && persona.voice_en.length)
    ? persona.voice_en : persona.voice;
  if (!Array.isArray(pool) || pool.length < 2) return [];
  const n = pool.length;
  const h = (Math.abs(Number(seed) || 0) % 9973) * 31 + (Math.abs(Number(turn) || 0) % 97) * 7 + 13;
  const a = h % n;
  const b = (a + 1 + (h % (n - 1))) % n;   // luôn khác a → không bao giờ chèn 2 câu trùng nhau
  return [pool[a], pool[b]];
}

// Khối câu mẫu đi vào phần ĐỘNG (tin nhắn cuối), KHÔNG vào system — để system giữ nguyên
// suốt cuộc và vẫn được bộ nhớ đệm của Anthropic dùng lại → chi phí thêm mỗi lượt = 0đ (§6).
function voiceNote(persona, lang, turn, seed) {
  const lines = pickVoiceLines(persona, lang, turn, seed);
  if (!lines.length) return '';
  const bullets = lines.map(l => '· ' + l).join('\n');
  // Đo thật 2026-08-10: nếu chỉ dặn "đừng chép nguyên văn" thì Haiku vẫn bê nguyên cả câu.
  // Phải nói rõ hai điều: (a) đây là câu nói ở CHUYỆN KHÁC, (b) trùng quá 4 chữ liên tiếp là phải viết lại.
  return lang === 'en'
    ? `\n[Voice reference — two lines this character said in OTHER conversations, about other things. They are NOT answers to what the stranger just said. Match the rhythm, sentence length and word choice; then say something NEW that actually answers this turn. If your line repeats more than 4 words in a row from the samples, rewrite it:\n${bullets}]`
    : `\n[Nhại giọng — hai câu nhân vật này từng nói ở CHUYỆN KHÁC, không phải câu trả lời cho lượt này. Hãy bắt chước NHỊP câu, độ dài câu và cách chọn chữ, rồi nói một câu MỚI đáp đúng vào lượt này. Nếu câu bạn viết trùng quá 4 chữ liên tiếp với câu mẫu thì viết lại câu khác:\n${bullets}]`;
}

// T3 — chống trôi giọng: từ lượt 4 trở đi nhắc lại tic + xưng hô. Thí nghiệm cho thấy chỗ vỡ
// là lượt 5-6 (Bà Tư trôi giọng Bắc → Nam, Hằng nhảy "em" → "chị").
function voiceAnchor(persona, lang, turn) {
  if (turn < 4) return '';
  if (lang === 'en') {
    return `\n[Voice re-anchor (this conversation is getting long): keep the exact same habits — ${persona.tic_en || ''}. Stay in the same register: ${persona.pronoun_en || ''}. Do NOT drift into a neutral or generic voice.]`;
  }
  return `\n[Nhắc giọng (hội thoại đã dài): giữ ĐÚNG thói quen nói lúc đầu — ${persona.tic || ''}. Xưng hô GIỮ NGUYÊN: ${persona.pronoun || ''}. Không được đổi giọng hay đổi xưng hô giữa chừng, cũng không được nói giọng trung tính chung chung.]`;
}

// v1.0 — khối nhiệm vụ theo nhân vật + giai đoạn (chữ nằm ở _personas.js MISSION_BLOCKS).
// Ly: luật khai manh mối có chốt chặn · Tí: khối "đồ của tôi" · cả 3 nhà: việc vặt sau khi nhận.
function missionNote(body, mode) {
  if (mode !== 'ma_soi' || !body.mission || body.mission.id !== 'ly_selfie') return '';
  const st = String(body.mission.stage || 'chua_biet');
  const blocks = MISSION_BLOCKS[body.npcId] || {};
  const clues = Math.max(0, Math.min(2, Number(body.mission.clues) || 0));
  let out = blocks[st]
    ? '\n' + blocks[st].replaceAll('{CLUES}', String(clues)).replaceAll('{NEXT}', MISSION_BLOCKS.gen_z_next[clues])
    : '';
  if (st === 'da_nhan' || st === 'co_do') out += '\n' + MISSION_BLOCKS.chore;
  return out;
}

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

  // v0.3 B7 — bảng tổng kết ngày: AI CHỌN một câu người chơi đã nói (không bịa câu mới)
  // làm "lời nói dối buồn cười nhất" + bình một dòng.
  if (body.summaryAsk) {
    const funny = await tryFunniest(env, body).catch(() => null);
    return json({ ok: true, funny });
  }

  // v0.8 — nhà HƯỚNG DẪN (Bà Năm). AI chỉ viết lời PHẢN ỨNG với câu người chơi vừa nói;
  // câu đẩy cốt truyện + việc chấm đạt/chưa đạt vẫn do code phía client cầm.
  // Không gọi được (hết tiền / não hỏng) → trả line rỗng, client dùng câu kịch bản như cũ.
  if (body.tutorAsk) {
    const t = await tryTutor(env, body).catch(() => null);
    return json({ ok: true, line: (t && t.line) || '', dat: t ? t.dat : null, brain: t ? t.brain : null });
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
  const mode = body.mode === 'ket_tien' ? 'ket_tien' : 'ma_soi';   // v0.3 B1: chế độ nào thì bối cảnh đó
  const scene = SCENES[mode];

  // Scripted greeting — free, instant, sets the scene.
  if (body.greet) {
    const kt = mode === 'ket_tien';
    let pool = kt
      ? ((lang === 'en' && persona.greetings_kt_en) ? persona.greetings_kt_en : persona.greetings_kt)
      : ((lang === 'en' && persona.greetings_en) ? persona.greetings_en : persona.greetings);
    // "NPC tự dẫn dắt": cuộc nói chuyện ĐẦU TIÊN của người chưa từng chơi → câu chào có lời
    // MỜI NÓI rõ ràng. Chỉ đổi lời chào, không đổi luật gì. Client tắt bằng ?tut=0.
    if (body.firstEver) {
      const lead = kt
        ? ((lang === 'en' && persona.lead_greets_kt_en) ? persona.lead_greets_kt_en : persona.lead_greets_kt)
        : ((lang === 'en' && persona.lead_greets_en) ? persona.lead_greets_en : persona.lead_greets);
      if (lead && lead.length) pool = lead;
    }
    // Quay lại trong cùng đêm → câu chào "nhớ mặt" thay vì chào như người lạ (Lucas 08-09)
    if (body.returning && persona.returns) {
      pool = (lang === 'en' && persona.returns_en) ? persona.returns_en : persona.returns;
    }
    let g;
    // v0.4 T6 — nhà CŨ nhớ đêm trước → câu chào callback scripted ("Ủa hôm trước xưng là X mà?").
    // Ưu tiên: quay-lại-cùng-đêm > nhớ-đêm-trước > nghe-đồn > chào thường.
    const greetMem = Array.isArray(body.nightMemory) ? body.nightMemory : [];
    const greetGossip = Array.isArray(body.gossip) ? body.gossip : [];
    // v1.0 — Ly đổi dáng chờ (plan C2): đã nhận nhiệm vụ mà quay lại chưa có gậy → câu than thở
    const mSt = body.mission && body.mission.stage;
    if (mode === 'ma_soi' && body.npcId === 'gen_z' && (mSt === 'da_nhan' || mSt === 'co_do') &&
        !body.returning && persona.mission_greets) {
      const mg = (lang === 'en' && persona.mission_greets_en) ? persona.mission_greets_en : persona.mission_greets;
      const g2 = mg[seed % mg.length].replaceAll('{CLUB}', club);
      return json({
        ok: true, scripted: true,
        npc: { dialogue: g2, emotion: 'chan', verdict: null, thought: '', convo_state: 'listening', final_test: false, invite_intent: false, contradiction: false, shutdown: false, mission_signal: '' }
      });
    }
    if (greetMem.length && !body.returning && persona.memory_greets) {
      const pastClaim = String(body.pastClaim || '').slice(0, 120);
      const past = lang === 'en'
        ? (pastClaim ? `last time you said you were "${pastClaim}"` : 'you came by the other day')
        : (pastClaim ? `hôm trước xưng là "${pastClaim}"` : 'hôm trước có ghé đây rồi');
      const mp = (lang === 'en' && persona.memory_greets_en) ? persona.memory_greets_en : persona.memory_greets;
      g = mp[seed % mp.length].replaceAll('{PAST}', past).replaceAll('{CLUB}', club);
    } else if (greetGossip.length && !body.returning && persona.gossip_greets) {
      const story = greetGossip[greetGossip.length - 1];   // chuyện mới nhất
      const evtMap = GOSSIP_EVT[lang === 'en' ? 'en' : 'vi'];
      const teller = (PERSONAS[story.npcId] || {}).name || (lang === 'en' ? 'a neighbor' : 'nhà bên kia');
      const crime = [...new Set(story.events || [])].filter(e => evtMap[e]).map(e => evtMap[e])
        .join(lang === 'en' ? ', and then ' : ', rồi còn ')
        || (lang === 'en' ? 'caused some trouble' : 'gây chuyện không hay');
      const gp = (lang === 'en' && persona.gossip_greets_en) ? persona.gossip_greets_en : persona.gossip_greets;
      g = gp[seed % gp.length].replaceAll('{WHO}', teller).replaceAll('{CRIME}', crime).replaceAll('{CLUB}', club);
    } else {
      g = pool[seed % pool.length].replaceAll('{CLUB}', club);
    }
    return json({
      ok: true, scripted: true,
      npc: { dialogue: g, emotion: 'suspicious', verdict: null, thought: '', convo_state: 'doubting', final_test: false, invite_intent: false, contradiction: false, shutdown: false, mission_signal: '' }
    });
  }

  const playerText = String(body.playerText || '').slice(0, 600);
  if (!playerText.trim() && !body.finalTestAsk && !body.outcomeAsk) return json({ ok: false, error: 'nói gì đi chứ' }, 400);
  const state = body.state || { trust: 30, suspicion: 20, interest: 50, patience: 100 };

  if (env.FORCE_SCRIPTED === '1') {
    return json(body.outcomeAsk
      ? { ok: true, scripted: true, npc: scriptedOutcome(body.npcId) }
      : { ok: true, scripted: true, npc: scriptedReply(body.npcId, playerText, state, club) });
  }

  // Build the shared prompt
  let system = SYSTEM_TEMPLATE
    .replace('{SCENE}', scene.scene)
    .replace('{RULE_INVITE}', scene.invite)
    .replace('{RULE_6}', scene.rule6)
    .replace('{RULE_TIME}', scene.time)
    .replace('{PERSONA_CARD}', persona.card.replaceAll('{CLUB}', club))
    .replace('{OUTFIT}', String(body.outfit || 'không rõ').slice(0, 400));
  if (lang === 'en') {
    system += '\n\nQUAN TRỌNG — NGÔN NGỮ: Người lạ nói TIẾNG ANH. Viết dialogue và thought bằng TIẾNG ANH tự nhiên, giữ nguyên cá tính nhân vật (được phép chêm vài từ cảm thán tiếng Việt như "trời ơi", "nha" cho có màu).';
  } else {
    // v0.6.1 G2 — Lucas vấp chính chỗ này: "AI trộn tiếng Việt lẫn tiếng Anh, khó chịu".
    // Chọn VI thì viết TIẾNG VIỆT. Chỉ Ly (Gen Z) được giữ vài tiếng lóng — đó là tính cách của cô.
    system += '\n\nQUAN TRỌNG — NGÔN NGỮ: Người chơi chọn TIẾNG VIỆT. Viết dialogue và thought bằng tiếng Việt tự nhiên, CÓ ĐẦY ĐỦ DẤU. KHÔNG chêm từ tiếng Anh.'
      + (body.npcId === 'gen_z'
        ? ' NGOẠI LỆ DUY NHẤT: Ly là Gen Z làm content nên được giữ vài tiếng lóng đã quen tai (slay, vibe, drama, content, trend, flex, cringe) — tối đa 2 từ mỗi lượt, không nói nguyên câu tiếng Anh.'
        : ' Nhân vật này TUYỆT ĐỐI không chêm tiếng Anh, kể cả một từ.');
  }
  // v0.7 T2 — dòng TIC đặt SÁT CUỐI phần system: chỗ cuối được mô hình nhớ tốt nhất.
  // Phần này ĐỨNG YÊN suốt cuộc nói chuyện → vẫn nằm trong khối được nhớ đệm, không tốn thêm tiền.
  if (persona.tic || persona.pronoun) {
    system += lang === 'en'
      ? `\n\nHOW THIS CHARACTER TALKS (most important — read last, obey first):
· Verbal tic, in almost every line: ${persona.tic_en || persona.tic || ''}
· Register, locked for the whole conversation: ${persona.pronoun_en || ''}
Never slide into a neutral, generic, "helpful assistant" voice. If a line could have been said by any of the three neighbours, rewrite it.`
      : `\n\nCÁCH NÓI CỦA NHÂN VẬT NÀY (quan trọng nhất — đọc sau cùng, làm theo trước tiên):
· Thói quen nói lặp, gần như câu nào cũng có: ${persona.tic || ''}
· Xưng hô KHOÁ CỨNG cả cuộc nói chuyện: ${persona.pronoun || ''}
Tuyệt đối không trôi về giọng trung tính chung chung. Nếu một câu mà ba người hàng xóm ai nói cũng được thì viết lại câu khác.`;
  }

  const history = Array.isArray(body.history) ? body.history.slice(-16) : [];
  // v0.7 — lượt thứ mấy (dùng cho hash chọn câu mẫu + mốc nhắc giọng lượt 4+)
  const turn = Math.max(1, Math.ceil(history.length / 2));
  const messages = [{
    role: 'user',
    content: mode === 'ket_tien'
      ? '(Cốc cốc cốc — có người gõ cửa giữa ban ngày.)'
      : '(Cốc cốc cốc — có người gõ cửa lúc nửa đêm.)'
  }];
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

  // v0.3 B3 — "màn xin": nhân vật đã muốn giúp, giờ chọn GIÚP KIỂU GÌ.
  if (body.outcomeAsk) {
    messages.push({
      role: 'user',
      content: `[Đạo diễn: nhân vật ĐÃ quyết định là muốn giúp người lạ này (hoặc vẫn thấy khó xử).
Hãy nói MỘT câu trao đi (hoặc từ chối) đúng giọng nhân vật, rồi chọn outcome hợp với TÍNH CÁCH
và HOÀN CẢNH của nhân vật: người mẹ bỉm sữa hay cho đồ ăn; sinh viên nghèo cho ít tiền mà thật lòng;
Gen Z thích drama thì cho đậm nếu thấy vui. Chỉ chọn moi_com khi thật sự quý mến.
Chọn viec_vat nếu nhân vật muốn người lạ phụ một tay trước. TUYỆT ĐỐI KHÔNG nói ra con số tiền —
game tự tính. Trạng thái ngầm: tin=${state.trust}/100, nghi=${state.suspicion}/100.]`
        + voiceNote(persona, lang, turn, seed) + voiceAnchor(persona, lang, turn)
    });
    const out = await askBrain(env, system, messages, OUTCOME_TOOL).catch(() => null);
    if (out) return json(shapeReply(out.input, out.brain, out.usage, 'outcome'));
    return json({ ok: true, scripted: true, npc: scriptedOutcome(body.npcId) });
  }

  // Hidden state hint on the last user turn (helps calibrate tone + invite pacing)
  const last = messages[messages.length - 1];
  if (last.role === 'user') {
    last.content += `\n\n[Trạng thái ngầm của nhân vật — KHÔNG nhắc tới trong thoại: tin=${state.trust}/100, nghi=${state.suspicion}/100, hứng thú=${state.interest}/100, kiên nhẫn=${state.patience}/100. Lượt nói chuyện thứ ${turn}.]`;
    // v0.3 B5 + B6 + B8 — chỉ mode Kẹt Tiền: giờ giấc + xóm đã thấy mặt bao nhiêu lần.
    if (mode === 'ket_tien') {
      const knocked = Number(body.knocked) || 0;
      last.content += `\n[Bối cảnh xóm — CHỈ để chỉnh giọng điệu, TUYỆT ĐỐI không dùng làm lý do chấm điểm thấp:`
        + ` bây giờ khoảng ${body.hourText || (body.hour + ' giờ')} (${body.timeHint || ''}).`
        + (knocked >= 2
          ? ` Nhân vật thoáng thấy người này gõ cửa vài nhà khác trong xóm — được phép nhắc TỐI ĐA MỘT LẦN cho vui ("ủa nãy thấy cậu bên nhà kia mà?"), rồi thôi.`
          : '')
        + (Number(body.day) > 3 ? ` Mấy ngày nay người này cứ lảng vảng trong xóm — cả xóm bắt đầu nhớ mặt.` : '')
        + ']';
    }
    // v0.4 T3 — "Sổ tai tiếng xóm": chuyện xấu bị bắt quả tang ở nhà khác, client gửi lên.
    // Chỉ chỉnh GIỌNG — code đã tự cộng nghi ngờ khởi điểm rồi, AI cấm chấm điểm vì chuyện này.
    const gossip = Array.isArray(body.gossip) ? body.gossip.slice(0, 8) : [];
    if (gossip.length) {
      const EVT = GOSSIP_EVT.vi;
      const lines = gossip.map(g => {
        const p = PERSONAS[g.npcId];
        const who = p ? p.name : 'một nhà trong xóm';
        const evs = [...new Set(g.events || [])].filter(e => EVT[e]).map(e => EVT[e]).join(', rồi còn ');
        const claim = g.claim ? ` (lúc đó họ xưng là "${String(g.claim).slice(0, 120)}")` : '';
        return `· Nghe ${who} kể lại: người lạ này từng ${evs || 'gây chuyện không hay'}${claim}.`;
      }).join('\n');
      last.content += `\n[Chuyện xóm nghe kể — 4 LUẬT BẮT BUỘC: (1) khi CHẤM verdict, chuyện nghe kể coi như KHÔNG TỒN TẠI — verdict CHỈ dựa trên LỜI NGƯỜI LẠ VỪA NÓI theo rubric (game đã tự cộng nghi ngờ khởi điểm thay bạn rồi; lời kể hợp lý thì vẫn PHẢI chấm hop_ly trở lên). (2) Đây là chuyện NGHE KỂ về một người lạ NÀO ĐÓ — không chắc là người trước cửa, không nói như thể chính họ đã nói/làm điều đó trong cuộc này. (3) Câu chào của bạn ĐÃ nhắc chuyện này rồi — CẤM nhắc lại, trừ khi người lạ tự khơi ra trước. (4) CẤM bịa thêm tội không có trong danh sách:\n${lines}]`;
    }
    // v0.4 T6 — trí nhớ đêm trước của CHÍNH nhân vật (Q4: người chơi được thanh minh).
    const nightMem = Array.isArray(body.nightMemory) ? body.nightMemory.slice(0, 4) : [];
    if (nightMem.length) {
      last.content += `\n[Đêm trước — trí nhớ của CHÍNH bạn về người lạ này:\n`
        + nightMem.map(l => '· ' + String(l).slice(0, 200)).join('\n')
        + `\nBạn đã nhắc chuyện này trong câu chào rồi — đừng lải nhải lại mãi. Được hỏi vặn chi tiết cũ (kiểu "hôm trước nói học VNUK mà?"). Người lạ THANH MINH nghe hợp lý, nhất quán thì chấm hop_ly/danh_trung như thường và bỏ qua chuyện cũ. TUYỆT ĐỐI KHÔNG lấy chuyện cũ làm lý do trừ điểm lời họ VỪA nói — verdict chỉ chấm lời vừa nói.]`;
    }
    // v0.6 F5.1 — client báo nhân vật SẮP bỏ cuộc (kiên nhẫn cạn / nghi sát trần). Bong bóng 💭
    // cảnh báo do CODE phía client viết; đoạn này chỉ để LỜI THOẠI không lệch với bong bóng đó.
    if (body.leakWarn) {
      last.content += '\n[Đạo diễn: nhân vật đang RẤT gần chỗ bỏ cuộc. Lời thoại lượt này phải ĐỂ LỘ rằng họ sắp kiếm cớ đóng cửa ("thôi tui còn việc…", "chắc tui vô đây…"). NHƯNG CHƯA đuổi hẳn lượt này: để shutdown=false, chừa cho người lạ đúng MỘT lượt nữa để cứu vãn.]';
    }
    // Lucas 08-09: sắp hết giờ → NPC dồn ép hoặc chốt sổ, không nói chuyện thong thả nữa
    const secs = Number(body.secondsLeft) || 0;
    if (secs > 0 && secs <= 45) {
      last.content += '\n[Trời sắp sáng, nhân vật SỐT RUỘT: hoặc dồn ép hỏi nhanh cho ra lẽ, hoặc nếu câu chuyện tới giờ vẫn vô lý thì nói kiểu "Vô lý quá, thôi đi giùm cái" rồi đặt shutdown=true.]';
    }
    // v1.0 — khối NHIỆM VỤ đặt ở tin nhắn cuối (như gossip/nightMemory), KHÔNG vào system:
    // stage đổi giữa cuộc mà system đổi theo là mất bộ nhớ đệm (§6). Chữ nằm ở _personas.js.
    last.content += missionNote(body, mode);
    // v0.7 T2/T3 — ĐẶT CUỐI CÙNG, ngay trước lúc mô hình viết: 2 câu mẫu xoay vòng theo lượt,
    // rồi (từ lượt 4) nhắc lại tic + xưng hô để chống trôi giọng.
    last.content += voiceNote(persona, lang, turn, seed) + voiceAnchor(persona, lang, turn);
  }

  // v0.8 B4 — chuỗi não nằm hết trong _brain.js. Ở đây chỉ còn: hỏi một cửa, hỏng thì kịch bản.
  const res = await askBrain(env, system, messages, NPC_TOOL).catch(() => null);
  if (res) {
    const shaped = shapeReply(res.input, res.brain, res.usage, 'reply');
    // v1.0 — tín hiệu nhiệm vụ phải qua cổng server trước khi về client
    shaped.npc.mission_signal = gateMission(shaped.npc.mission_signal, { npcId: body.npcId, mode, mission: body.mission }, state);
    return json(shaped);
  }
  return json({ ok: true, scripted: true, npc: scriptedReply(body.npcId, playerText, state, club) });
}

// ── v0.8 B1 — MỘT CỬA DUY NHẤT ───────────────────────────────────────────────
// Mỗi cái "phiếu" (tool) có một bản ghi chú lược đồ riêng, dành cho những nhà chỉ biết
// trả JSON chứ không biết điền phiếu (DeepSeek · Qwen). Dò bằng TÊN phiếu, không bằng biến,
// để hai phiên làm việc song song trên file này không giẫm chân nhau.
function schemaNoteFor(tool) {
  if (!tool) return '';
  switch (tool.name) {
    case 'npc_outcome': return OUTCOME_SCHEMA_NOTE;
    case 'pick_funniest': return FUNNY_SCHEMA_NOTE;
    case 'ba_nam_noi': return TUTOR_SCHEMA_NOTE;
    default: return REPLY_SCHEMA_NOTE;
  }
}

// tool = null → chỉ xin CHỮ (quân sư 💡). tool có → bắt điền phiếu.
// Trả { input | text, brain, usage } hoặc null khi cả chuỗi chết.
async function askBrain(env, system, messages, tool = NPC_TOOL, opts = {}) {
  return callBrain(env, {
    system, messages, tool,
    schemaNote: schemaNoteFor(tool),
    maxTokens: opts.maxTokens ?? 500,
    // Chấm điểm cần ổn định hơn cần bay bổng (QA 08-08: cùng một câu chuyện lúc hop_ly lúc lo_lieu).
    temperature: opts.temperature ?? 0.7
  });
}

// The strategist knows the persona card (that's what the powerup buys you).
// v0.8 B4 — TRƯỚC ĐÂY gọi thẳng Anthropic → hết tiền là quân sư chết ngay. Giờ đi chung một cửa.
async function tryHint(env, persona, club, body) {
  const history = (Array.isArray(body.history) ? body.history.slice(-10) : [])
    .map(h => (h.role === 'npc' ? 'Hàng xóm: ' : 'Người chơi: ') + String(h.text || '').slice(0, 300))
    .join('\n');
  const system = 'Bạn là quân sư của người chơi trong game thuyết phục hàng xóm mời mình vào nhà. Dựa vào hồ sơ nhân vật và cuộc nói chuyện, đề xuất đúng MỘT câu '
    + (body.lang === 'en' ? 'TIẾNG ANH' : 'tiếng Việt (đầy đủ dấu)')
    + ' ngắn, tự nhiên mà người chơi NÊN NÓI tiếp theo để tăng lòng tin. CHỈ trả về câu đó, không giải thích, không ngoặc kép.';
  const messages = [{
    role: 'user',
    content: `HỒ SƠ HÀNG XÓM:\n${persona.card.replaceAll('{CLUB}', club)}\n\nNGƯỜI CHƠI ĐANG MẶC: ${String(body.outfit || 'không rõ').slice(0, 400)}\n\nCUỘC NÓI CHUYỆN:\n${history}\n\nCâu nên nói tiếp theo:`
  }];
  const res = await askBrain(env, system, messages, null, { maxTokens: 200, temperature: 0.8 });
  return res && res.text ? res.text.replace(/^["“”']|["“”']$/g, '').trim().slice(0, 300) : null;
}

// ── v0.8 nhà hướng dẫn: một câu thoại của Bà Năm, phản ứng ĐÚNG câu người chơi vừa nói ──
const TUTOR_TOOL = {
  name: 'ba_nam_noi',
  description: 'Chấm xem người chơi đã làm đúng việc của bước này chưa, rồi nói một câu. Luôn dùng tool này.',
  input_schema: {
    type: 'object',
    properties: {
      dat: {
        type: 'boolean',
        description: 'true nếu câu người chơi vừa nói ĐÃ LÀM ĐƯỢC việc được yêu cầu ở bước này — xét theo Ý, không xét đúng từng chữ. Nói cụt lủn một chữ mà đúng ý thì vẫn true. Nói lạc đề, nói bậy, hỏi ngược lại, hoặc xưng một vai KHÁC vai được yêu cầu thì false.'
      },
      dialogue: { type: 'string', description: 'Thoại 1–2 câu, đúng giọng bà già nghễnh ngãng.' }
    },
    required: ['dat', 'dialogue']
  }
};

async function tryTutor(env, body) {
  const lang = body.lang === 'en' ? 'en' : 'vi';
  const step = Math.max(1, Math.min(4, Number(body.step) || 1));
  const said = String(body.playerText || '').slice(0, 400);
  const goal = String(body.goal || '').slice(0, 300);
  const v = lang === 'en' ? BA_NAM.voice_en : BA_NAM.voice;
  const pick = [v[(step * 2) % v.length], v[(step * 2 + 1) % v.length]];

  const system = lang === 'en'
    ? `You are playing Bà Năm in a Vietnamese comedy game. Reply in ENGLISH only.
${BA_NAM.card}

This is the TRAINING house — step ${step} of 4. The player was asked to: ${goal}

YOUR JOB, in this order:
1. Decide "dat" — did what they JUST said actually do that task? Judge the MEANING, not the wording.
   · One word is fine if it is the right one ("delivery" alone → dat=true).
   · Typos, mic mistakes, slang, half sentences → still true if the meaning is there.
   · A DIFFERENT role than the one asked for (police, neighbour…), a question back, an insult,
     an empty greeting, or gibberish → dat=false.
   · DENYING the very thing asked for ("I'm not a delivery driver") → dat=false.
   · Her mishearing is a JOKE for the dialogue only — never use it as a reason for dat=false.
     If they got the meaning right, dat=true even while she pretends to hear another word.
2. Write "dialogue":
   · dat=true → react warmly to THEIR EXACT WORDS, repeat back a detail they said. Do NOT ask a new
     question, do NOT invite them inside; the game says the next line itself.
   · dat=false → grandma mishears or is confused. Nudge them toward the task — WITHOUT saying the
     sentence for them. Funny and kind, never angry, never insulting.
Two lines she has really said (copy the rhythm, never word-for-word):
· ${pick[0]}
· ${pick[1]}

HOW SHE TALKS (read last, obey first): ${BA_NAM.tic_en}. Register: ${BA_NAM.pronoun_en}.
One or two sentences. No profanity.`
    : `Bạn đang đóng vai Bà Năm trong game hài Việt Nam. Viết TIẾNG VIỆT CÓ ĐẦY ĐỦ DẤU, không chêm tiếng Anh.
${BA_NAM.card}

Đây là NHÀ TẬP — bước ${step}/4. Người chơi được yêu cầu: ${goal}

VIỆC CỦA BẠN, theo đúng thứ tự:
1. Chấm "dat" — câu họ VỪA NÓI có làm được việc đó không? Xét theo Ý, không xét đúng từng chữ.
   · Nói đúng MỘT chữ mà trúng ý thì vẫn true (chỉ nói "shipper" → dat=true).
   · Sai chính tả, mic nghe nhầm, tiếng lóng, nói cụt lủn → vẫn true nếu đúng ý.
   · Xưng một VAI KHÁC với vai được yêu cầu (công an, hàng xóm…), hỏi ngược lại, nói bậy,
     chào suông không có nội dung, hoặc gõ linh tinh → dat=false.
   · PHỦ ĐỊNH đúng thứ được yêu cầu ("con không phải shipper đâu") → dat=false.
   · Chuyện bà NGHE NHẦM chỉ để gây cười trong lời thoại — TUYỆT ĐỐI không lấy nó làm lý do
     chấm dat=false. Họ nói đúng ý là dat=true, dù bà có giả bộ nghe ra chữ khác.
2. Viết "dialogue":
   · dat=true → phản ứng ấm áp và NHẮC LẠI một chi tiết trong đúng câu họ vừa nói. KHÔNG hỏi câu mới,
     KHÔNG mời vào nhà — câu tiếp theo đã có game lo.
   · dat=false → bà nghe nhầm hoặc chưa hiểu, hối họ làm đúng việc đó NHƯNG KHÔNG nói hộ câu trả lời.
     Vẫn hài, vẫn hiền, tuyệt đối không cáu, không xúc phạm.
Hai câu bà từng nói thật (bắt chước NHỊP câu, cấm chép nguyên văn):
· ${pick[0]}
· ${pick[1]}

CÁCH BÀ NÓI (đọc sau cùng, làm theo trước tiên): ${BA_NAM.tic}. Xưng hô: ${BA_NAM.pronoun}.
Chỉ một tới hai câu. Cấm chửi thề.`;

  const messages = [{ role: 'user', content: `Người lạ vừa nói: "${said}"` }];
  // v0.8 B1 — cùng một cửa với ba nhà kia: hết tiền một nhà thì bà Năm vẫn nói được.
  const res = await askBrain(env, system, messages, TUTOR_TOOL, { maxTokens: 260, temperature: 0.9 })
    .catch(() => null);
  if (!res || !res.input || !res.input.dialogue) return null;
  // Thiếu ô "dat" (não trả phiếu thiếu) → KHÔNG được coi là "chưa đạt": như vậy chặn oan mọi
  // câu đúng (đo được 0/14 hôm 2026-08-10). Trả null để máy khách rơi về luật từ khoá.
  const dat = typeof res.input.dat === "boolean" ? res.input.dat : null;
  return { dat, line: String(res.input.dialogue), brain: res.brain };
}
const TUTOR_SCHEMA_NOTE = '\n\nTRẢ LỜI: CHỈ một JSON object, không markdown: {"dat":true hoặc false,"dialogue":"thoại 1-2 câu tiếng Việt đủ dấu"}';

const REPLY_SCHEMA_NOTE = `\n\nTRẢ LỜI: CHỈ một JSON object, không markdown, đúng dạng:
{"dialogue":"lời thoại 1-3 câu tiếng Việt đủ dấu","emotion":"neutral|interested|amused|suspicious|angry|chan|nguong|cam_dong|phan_khich|buc_minh","verdict":"lo_lieu|kha_nghi|thuong|hop_ly|danh_trung","thought":"suy nghĩ thầm 1 câu ngắn, không số điểm","convo_state":"listening|thinking|doubting|trusting|rejecting","final_test":true/false,"invite_intent":true/false,"contradiction":true/false,"corroboration":true/false (đồ đang mặc CHỐNG LƯNG lời khai; không bao giờ true cùng contradiction),"shutdown":true/false,"player_claim":"người lạ hiện TỰ XƯNG là ai/vai gì, tối đa 10 từ; họ chưa tự xưng vai nào thì để \\"\\" — KHÔNG mô tả ngoại hình/quần áo thay cho lời tự xưng","mission_signal":"tín hiệu nhiệm vụ: chỉ dùng khi khối [NHIỆM VỤ]/[ĐỒ CỦA TÍ]/[VIỆC VẶT] cho phép, một trong manh_moi_1|manh_moi_2|ro_chuyen|dong_y_cho_muon|nhan_viec_vat, ngoài ra LUÔN để \\"\\""}`;

// (v0.8: tryHaiku + tryDeepSeek đã bị xoá — cả hai nhà giờ nằm trong chuỗi ở _brain.js.)

// v0.3 B7 — "lời nói dối buồn cười nhất": AI chỉ được CHỌN trong danh sách câu người chơi
// đã nói (đánh số), không được bịa câu mới.
const FUNNY_TOOL = {
  name: 'pick_funniest',
  description: 'Chọn câu buồn cười nhất trong danh sách và bình một dòng.',
  input_schema: {
    type: 'object',
    properties: {
      index: { type: 'integer', description: 'Số thứ tự của câu được chọn trong danh sách.' },
      comment: { type: 'string', description: 'Một dòng bình luận hài, ngắn, kiểu người dẫn chuyện xóm.' }
    },
    required: ['index', 'comment']
  }
};
const FUNNY_SCHEMA_NOTE = '\n\nTRẢ LỜI: CHỈ một JSON object, không markdown: {"index":số thứ tự câu được chọn,"comment":"một dòng bình luận hài ngắn"}';

// v0.8 B4 — TRƯỚC ĐÂY gọi thẳng Anthropic → hết tiền là bảng tổng kết mất mục này. Giờ đi chung một cửa.
async function tryFunniest(env, body) {
  const lines = (Array.isArray(body.lines) ? body.lines : [])
    .map(s => String(s || '').slice(0, 200)).filter(Boolean).slice(-24);
  if (!lines.length) return null;
  const en = body.lang === 'en';
  const listed = lines.map((l, i) => `${i}. ${l}`).join('\n');
  const system = en
    ? 'You are the narrator of a Vietnamese neighbourhood comedy game. From the list of lines the player said today while trying to beg for a meal, pick the funniest / most outrageous one and add ONE short witty line about it in ENGLISH. Never invent a new line.'
    : 'Bạn là người dẫn chuyện của một game hài xóm Việt. Trong danh sách câu người chơi đã nói hôm nay lúc đi xin ăn, hãy chọn CÂU BUỒN CƯỜI / LÁO NHẤT và bình đúng MỘT dòng ngắn, hài, tiếng Việt đủ dấu. Tuyệt đối không bịa câu mới.';
  const res = await askBrain(env, system, [{ role: 'user', content: listed }], FUNNY_TOOL,
    { maxTokens: 200, temperature: 0.9 });
  if (!res || !res.input) return null;
  const idx = Math.max(0, Math.min(lines.length - 1, Number(res.input.index) || 0));
  return { quote: lines[idx], comment: String(res.input.comment || '').slice(0, 200), brain: res.brain };
}

const VERDICTS = ['lo_lieu', 'kha_nghi', 'thuong', 'hop_ly', 'danh_trung'];
const CONVO_STATES = ['listening', 'thinking', 'doubting', 'trusting', 'rejecting'];

const OUTCOMES = ['tien', 'do_an', 'ca_hai', 'moi_com', 'viec_vat', 'tu_choi', 'quay_lai_sau'];

function shapeReply(i, brain, usage, kind = 'reply') {
  // v0.8: _brain.js đã quy đổi cách đếm chữ của từng nhà về cùng một dạng { in, out }.
  const meta = { ok: true, scripted: false, brain, usage: usage || undefined };
  // v0.3 "màn xin": chỉ cần thoại + LOẠI kết quả; số tiền do code phía client cầm.
  if (kind === 'outcome') {
    return {
      ...meta,
      npc: {
        dialogue: String(i.dialogue || '…'),
        emotion: EMOTIONS.includes(i.emotion) ? i.emotion : 'neutral',
        outcome: OUTCOMES.includes(i.outcome) ? i.outcome : 'tien',
        thought: String(i.thought || '').slice(0, 200)
      }
    };
  }
  return {
    ...meta,
    npc: {
      dialogue: String(i.dialogue || '…'),
      // v0.6 F4: nhãn lạ → neutral, không vỡ game.
      emotion: EMOTIONS.includes(i.emotion) ? i.emotion : 'neutral',
      verdict: VERDICTS.includes(i.verdict) ? i.verdict : 'thuong',
      thought: String(i.thought || '').slice(0, 200),
      convo_state: CONVO_STATES.includes(i.convo_state) ? i.convo_state : 'listening',
      final_test: !!i.final_test,
      invite_intent: !!i.invite_intent,
      contradiction: !!i.contradiction,
      // v0.6 F3.2 — chốt chặn cuối: hai cờ không bao giờ được cùng bật. Mâu thuẫn thắng.
      corroboration: !!i.corroboration && !i.contradiction,
      shutdown: !!i.shutdown,
      player_claim: String(i.player_claim || '').slice(0, 120),
      // v1.0 — nhãn lạ → '' (không vỡ game), giá trị hợp lệ còn phải qua gateMission phía sau
      mission_signal: MISSION_SIGNALS.includes(i.mission_signal) ? i.mission_signal : ''
    }
  };
}

const MISSION_SIGNALS = ['manh_moi_1', 'manh_moi_2', 'ro_chuyen', 'dong_y_cho_muon', 'nhan_viec_vat'];

// v1.0 — CHỐT CHẶN LỚP SERVER (bài học "đồng ý mồm" 08-09: prompt không đủ, code phải giữ cửa).
// Client (missions.js) còn một lớp nữa với núm chỉnh trong config.js; hai con số 60/55 ở đây
// là bản sao cứng của XDH.MISSION_CFG.INTEREST_GATE / TI_LEND_TRUST — đổi thì đổi CẢ HAI chỗ.
export function gateMission(sig, body, state) {
  if (!sig) return '';
  const m = body.mission;
  if (!m || body.mode === 'ket_tien') return '';
  if (['manh_moi_1', 'manh_moi_2', 'ro_chuyen'].includes(sig)) {
    if (body.npcId !== 'gen_z') return '';
    if ((Number(state.interest) || 0) < 60) return '';   // chưa đủ quan tâm → Ly CẤM khai
    // Não yếu hay LẶP LẠI manh mối cũ (đo thật 08-13: Qwen bắn manh_moi_1 sáu lượt liền).
    // CODE cầm nhịp: tín hiệu manh mối nào cũng được nắn về manh mối KẾ TIẾP theo sổ client.
    const clues = Number(m.clues) || 0;
    return clues === 0 ? 'manh_moi_1' : clues === 1 ? 'manh_moi_2' : 'ro_chuyen';
  }
  if (sig === 'dong_y_cho_muon') {
    if (body.npcId !== 'sinh_vien' || m.stage !== 'da_nhan') return '';
    if ((Number(state.trust) || 0) < 55) return '';      // Tí nói "cho mượn" mà chưa đủ tin → coi như chưa
    return sig;
  }
  if (sig === 'nhan_viec_vat') {
    return (m.stage === 'da_nhan' || m.stage === 'co_do') ? sig : '';
  }
  return '';
}
