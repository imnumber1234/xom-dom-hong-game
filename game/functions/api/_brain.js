// _brain.js — v0.8 "NÃO XOAY VÒNG": MỘT CỬA DUY NHẤT cho mọi lời gọi AI của game.
//
// Vì sao có file này (plan-v0.8-nao-xoay-vong §1):
//   2026-08-10 khoá Anthropic hết tiền → quân sư 💡 và câu-hài-nhất CHẾT NGAY, vì hai chỗ đó
//   gọi thẳng Anthropic. Phần nói chuyện sống sót chỉ vì nó ĐÃ có chuỗi dự phòng.
//   → Luật mới: KHÔNG chỗ nào trong game được gọi thẳng một nhà. Tất cả đi qua callBrain().
//
// Bốn cơ chế (§3):
//   1. Rơi tầng      — não 1 hỏng thì tự thử não 2 → 3 → 4, người chơi không thấy gì.
//   2. Cho nghỉ 10'  — não vừa lỗi bị ghi sổ, các lượt sau BỎ QUA luôn (không chờ lại 2 giây).
//   3. Tự sống lại   — hết 10 phút thì thử lại một lần. Lucas nạp tiền là tự quay về, khỏi deploy.
//   4. Ghi tên não   — mỗi lượt trả về `brain` để biết bản thật đang chạy bằng gì.
//
// Thứ tự (§2, đo thật ở research/brain-bakeoff-2026-08-10.md):
//   Gemini 2.5 Flash (4.3 điểm giọng, 1.1s) → Qwen Plus (3.5) → DeepSeek V3 (3.7) → Haiku 4.5 → kịch bản.

// Cổng AI của Cloudflare: đếm chi phí + xem log một chỗ, và đi vòng được lỗi 403 mà
// Anthropic trả về khi gọi thẳng từ máy chủ CF ở châu Á (reference_anthropic_403_cf_asia).
// Google AI Studio + DeepSeek + Anthropic đều đi được. Qwen thì KHÔNG (cổng không hỗ trợ) → gọi thẳng.
// Nguồn: developers.cloudflare.com/ai-gateway/usage/providers/
const GATEWAY = 'https://gateway.ai.cloudflare.com/v1/56e3175ef4d0c606c465a116c3939d5d/xom-dom-hong';

// ── Sổ "cho nghỉ" ────────────────────────────────────────────────────────────
// Map ở mức module: sống chung với isolate của Worker, tức là dùng lại cho các lượt kế tiếp
// trên cùng máy chủ. Không cần KV/D1 — mất sổ thì tệ nhất là thử lại một lần thừa.
const BENCH_MS = 10 * 60 * 1000;
const bench = new Map();   // tên não -> thời điểm hết hạn nghỉ (ms)

export function benchState(now = Date.now()) {
  const out = {};
  for (const [name, until] of bench) if (until > now) out[name] = Math.round((until - now) / 1000);
  return out;
}
function isBenched(name, now) {
  const until = bench.get(name);
  if (!until) return false;
  if (until <= now) { bench.delete(name); return false; }   // §3.3 tự sống lại
  return true;
}
function sitDown(name, why) {
  bench.set(name, Date.now() + BENCH_MS);
  console.log(`[brain] ${name} bị cho nghỉ 10 phút — ${String(why).slice(0, 200)}`);
}
export function clearBench() { bench.clear(); }   // dùng cho bài kiểm "giết từng não"

// ── Dịch cái "phiếu" (tool schema) sang từng nhà ─────────────────────────────
// Game không chỉ xin lời thoại; nó bắt AI ĐIỀN MỘT PHIẾU (lời thoại + suy nghĩ + chấm điểm +
// cờ mâu thuẫn). Mỗi nhà một kiểu điền (§4):
//   Anthropic → tools/input_schema · DeepSeek+Qwen → kiểu OpenAI json_object + ghi chú lược đồ
//   Gemini    → functionDeclarations, lược đồ kiểu OpenAPI (chữ HOA cho kiểu dữ liệu)
function toGeminiSchema(node) {
  if (!node || typeof node !== 'object') return node;
  const out = {};
  if (node.type) out.type = String(node.type).toUpperCase();
  if (node.description) out.description = node.description;
  if (Array.isArray(node.enum)) {
    // 🔴 LỖI D — GỐC RỄ THẬT, sổ đen bắt được 2026-08-21:
    // Gemini TỪ CHỐI chuỗi rỗng nằm trong enum và trả HTTP 400
    //   "properties[mission_signal].enum[0]: cannot be empty".
    // Ô mission_signal (thêm ở v1.0, 13/08) có '' ở đầu enum → nghĩa là Gemini đã CHẾT 100%
    // ở MỌI lượt nói chuyện suốt 8 ngày, và không ai biết vì game không lưu một dòng nào.
    // Cách chữa: ô nào cho phép "để rỗng" thì BỎ HẲN enum cho riêng Gemini, giữ nguyên kiểu dữ liệu
    // và phần mô tả (mô tả đã liệt kê đủ các giá trị hợp lệ). Ba nhà kia không đổi một chữ.
    const vals = node.enum.map(String).filter(v => v !== '');
    if (vals.length === node.enum.length) out.enum = vals;
  }
  if (node.items) out.items = toGeminiSchema(node.items);
  if (node.properties) {
    out.properties = {};
    for (const [k, v] of Object.entries(node.properties)) out.properties[k] = toGeminiSchema(v);
  }
  if (Array.isArray(node.required)) out.required = node.required;
  return out;
}
function geminiDeclaration(tool) {
  return { name: tool.name, description: tool.description, parameters: toGeminiSchema(tool.input_schema) };
}

// ── Các bộ nối ───────────────────────────────────────────────────────────────
// Mỗi bộ nối trả về { input } (khi có phiếu) hoặc { text } (khi chỉ xin chữ), kèm { usage }.
// Hỏng thì NÉM LỖI — callBrain bắt, ghi sổ nghỉ, rồi thử não kế tiếp.

async function callGemini(env, req) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error('thiếu khoá');
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const body = {
    systemInstruction: { parts: [{ text: req.system }] },
    contents: req.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      // ⚠️ Gemini 2.5: temperature DƯỚI 1.0 tự nó gây kẹt vòng lặp ("doom loop", diễn đàn Google AI
      // 94446) và họ KHÔNG cho dùng núm phạt-lặp trên 2.5 → kẹp 1.0, chống lặp để lớp ứng dụng lo.
      temperature: Math.max(1, req.temperature),
      maxOutputTokens: req.maxTokens,
      // ⚠️ BẪY CHẾT NGƯỜI (§2): Gemini 2.5 mặc định "suy nghĩ" trước khi nói, và phần suy nghĩ
      // ĂN VÀO hạn mức chữ trả lời → câu bị cắt cụt giữa chừng. Đã dính đúng lỗi này lúc so găng
      // (research §"Ba cái bẫy"). Phải tắt hẳn. Nguồn: firebase.google.com/docs/ai-logic/thinking
      thinkingConfig: { thinkingBudget: 0 }
    },
    // Game hài có cảnh "cắn" của ma sói + chuyện xin tiền → bộ lọc mặc định thỉnh thoảng chặn
    // nhầm, mà bị chặn thì coi như não hỏng và rơi tầng vô ích. Chỉ chặn mức nặng.
    safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH',
      'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']
      .map(category => ({ category, threshold: 'BLOCK_ONLY_HIGH' }))
  };
  if (req.tool) {
    body.tools = [{ functionDeclarations: [geminiDeclaration(req.tool)] }];
    // ANY + allowedFunctionNames = ép phải điền phiếu, không được trả lời chữ tự do.
    body.toolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: [req.tool.name] } };
  }

  const r = await fetch(`${GATEWAY}/google-ai-studio/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(req.timeoutMs),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const usage = data.usageMetadata
    ? { in: data.usageMetadata.promptTokenCount, out: data.usageMetadata.candidatesTokenCount }
    : undefined;
  if (req.tool) {
    const fc = parts.find(p => p.functionCall)?.functionCall;
    if (!fc?.args) throw new Error('không điền phiếu: ' + JSON.stringify(data).slice(0, 200));
    return { input: fc.args, usage };
  }
  const text = parts.map(p => p.text).filter(Boolean).join('').trim();
  if (!text) throw new Error('trả rỗng: ' + JSON.stringify(data).slice(0, 200));
  return { text, usage };
}

// DeepSeek và Qwen cùng nói "kiểu OpenAI" → một bộ nối dùng chung, chỉ khác địa chỉ + tên model.
async function callOpenAiStyle({ url, key, model, req, extraHeaders }) {
  if (!key) throw new Error('thiếu khoá');
  const body = {
    model,
    max_tokens: req.maxTokens,
    temperature: req.temperature,
    messages: [
      { role: 'system', content: req.system + (req.tool ? req.schemaNote : '') },
      ...req.messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ]
  };
  // v1.0.1 chống NHAI LẠI CÂU (Lucas bắt 08-13: Qwen lặp nguyên văn 3 lượt liền):
  // Qwen có bệnh lặp CÓ GIẤY TỜ — thẻ model Qwen3 khuyên presence_penalty tới 1.5, nhưng
  // mức cao dễ sinh LẪN NGÔN NGỮ (nguy hiểm cho game tiếng Việt) → mình chạy 1.0-1.2.
  // DeepSeek: tài liệu ghi tham số này ĐÃ CHẾT ("will not take effect") — gửi kèm vô hại.
  // Nguồn: alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions ·
  //        huggingface.co/Qwen/Qwen3-8B (Best Practices) · api-docs.deepseek.com
  if (typeof req.presencePenalty === 'number') body.presence_penalty = req.presencePenalty;
  if (req.tool) body.response_format = { type: 'json_object' };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json', ...(extraHeaders || {}) },
    signal: AbortSignal.timeout(req.timeoutMs),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const raw = data.choices?.[0]?.message?.content;
  const usage = data.usage ? { in: data.usage.prompt_tokens, out: data.usage.completion_tokens } : undefined;
  if (!raw || !String(raw).trim()) throw new Error('trả rỗng');
  if (!req.tool) return { text: String(raw).trim(), usage };
  let input;
  // Thỉnh thoảng model bọc JSON trong ```json … ``` dù đã dặn — gỡ rào rồi mới đọc.
  const cleaned = String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  try { input = JSON.parse(cleaned); } catch { throw new Error('JSON hỏng: ' + cleaned.slice(0, 150)); }
  return { input, usage };
}

async function callQwen(env, req) {
  // Cổng AI của Cloudflare KHÔNG hỗ trợ Qwen (§5) → đây là chỗ duy nhất gọi thẳng.
  const base = env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  return callOpenAiStyle({
    url: base.replace(/\/$/, '') + '/chat/completions',
    key: env.QWEN_API_KEY, model: env.QWEN_MODEL || 'qwen-plus', req
  });
}

async function callDeepSeek(env, req) {
  return callOpenAiStyle({
    url: `${GATEWAY}/deepseek/chat/completions`,
    key: env.DEEPSEEK_API_KEY, model: 'deepseek-chat', req
  });
}

async function callHaiku(env, req) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('thiếu khoá');
  const body = {
    model: env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
    max_tokens: req.maxTokens,
    temperature: req.temperature,
    // Bộ nhớ đệm: khối system đứng yên cả cuộc nói chuyện → lượt sau không tính tiền lại (v0.7 §6).
    system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
    messages: req.messages
  };
  if (req.tool) {
    body.tools = [req.tool];
    body.tool_choice = { type: 'tool', name: req.tool.name };
  }
  const r = await fetch(`${GATEWAY}/anthropic/v1/messages`, {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    signal: AbortSignal.timeout(req.timeoutMs),
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const usage = data.usage ? { in: data.usage.input_tokens, out: data.usage.output_tokens } : undefined;
  if (req.tool) {
    const use = (data.content || []).find(c => c.type === 'tool_use');
    if (!use) throw new Error('không điền phiếu');
    return { input: use.input, usage };
  }
  const t = (data.content || []).find(c => c.type === 'text');
  if (!t?.text?.trim()) throw new Error('trả rỗng');
  return { text: t.text.trim(), usage };
}

// ── Chuỗi não ────────────────────────────────────────────────────────────────
// `hasKey` để một nhà chưa cắm khoá thì bị bỏ qua NGAY, không tốn một lượt thử nào —
// đó là điều làm cho bài kiểm "rút khoá" không hề chậm đi.
// v2.0 — THỨ TỰ SỬA LẠI THEO ĐO THẬT 21/08 (sổ đen + tools/brain-probe.mjs):
//   gemini   4.3 điểm giọng · 1.7s trên máy mình — NHƯNG máy chủ Cloudflare ở châu Á bị Google
//            chặn theo vị trí ("User location is not supported"). Giữ đứng đầu để chỗ nào chạy
//            được thì tự dùng lại; chỗ bị chặn thì hỏng trong ~0,6s rồi ngồi ghế nghỉ 10 phút.
//   deepseek 3.7 điểm · 1,6s · CHẠY ĐƯỢC ở máy chủ → kéo lên hàng hai (trước Qwen 3.5 / 3,2s).
//   qwen     3.5 điểm · chậm gấp đôi, tiếng Anh yếu → hàng ba.
//   haiku    khoá Anthropic HẾT TIỀN từ 10/08 → xuống cuối, chờ Lucas nạp là tự sống lại.
export const CHAIN = [
  { name: 'gemini', timeoutMs: 9000, hasKey: e => !!(e.GEMINI_API_KEY || e.GOOGLE_GENERATIVE_AI_API_KEY), call: callGemini },
  { name: 'deepseek', timeoutMs: 15000, hasKey: e => !!e.DEEPSEEK_API_KEY, call: callDeepSeek },
  { name: 'qwen', timeoutMs: 9000, hasKey: e => !!e.QWEN_API_KEY, call: callQwen },
  { name: 'haiku', timeoutMs: 9000, hasKey: e => !!e.ANTHROPIC_API_KEY, call: callHaiku }
];

/**
 * MỘT CỬA DUY NHẤT. Trả về { input | text, brain, usage, tried } — hoặc null khi cả chuỗi chết
 * (lúc đó chỗ gọi tự rơi về kịch bản có sẵn, người chơi không bao giờ thấy màn hình chết).
 *
 * env.BRAIN_ORDER = "qwen,deepseek" → ép thứ tự/danh sách, dùng cho bài kiểm "giết từng não"
 *                                     mà không phải xoá khoá thật.
 */
// v2.0 (đáp án 13) — THỨ TỰ NÃO RIÊNG CHO BẢN TIẾNG ANH.
// Đo thật 08-10 (v0.7 T5: 15/20): cả 5 mục trượt đều nằm ở bản tiếng Anh, vì Qwen viết
// tiếng Anh yếu và hay TỤT VỀ TIẾNG VIỆT giữa chừng. Gemini/Haiku viết tiếng Anh tốt hơn hẳn
// → cho lên trước, Qwen xuống cuối. Bản tiếng Việt KHÔNG đổi một dòng nào.
export const EN_ORDER = ['gemini', 'deepseek', 'haiku', 'qwen'];

export async function callBrain(env, {
  system, messages, tool = null, schemaNote = '', maxTokens = 500, temperature = 0.7,
  presencePenalty,  // v1.0.1: chỉ Qwen/DeepSeek dùng (Gemini/Anthropic bỏ qua — tham số lạ là bị nhà đó chê)
  lang              // v2.0: 'en' → dùng EN_ORDER ở trên
}) {
  const now = Date.now();
  const order = String(env.BRAIN_ORDER || '').trim();
  let chain = CHAIN;
  if (order) {
    const want = order.split(',').map(s => s.trim()).filter(Boolean);
    chain = want.map(n => CHAIN.find(p => p.name === n)).filter(Boolean);
  }

  // BRAIN_ORDER (biến môi trường, dùng cho bài kiểm "giết từng não") vẫn thắng — nó là lệnh tay.
  if (lang === 'en' && !order) {
    chain = EN_ORDER.map(n => CHAIN.find(p => p.name === n)).filter(Boolean)
      .concat(CHAIN.filter(p => !EN_ORDER.includes(p.name)));
  }

  const usable = chain.filter(p => p.hasKey(env));
  let ready = usable.filter(p => !isBenched(p.name, now));
  // Cả chuỗi đang ngồi ghế nghỉ → vẫn thử ĐÚNG MỘT cái (cái sắp hết hạn nghỉ sớm nhất).
  // Không có bước này thì một cơn hỏng đồng loạt sẽ khoá game vào kịch bản trọn 10 phút.
  if (!ready.length && usable.length) {
    ready = [usable.slice().sort((a, b) => (bench.get(a.name) || 0) - (bench.get(b.name) || 0))[0]];
  }

  const tried = [];
  for (const p of ready) {
    try {
      const res = await p.call(env, {
        system, messages, tool, schemaNote, maxTokens, temperature, presencePenalty, timeoutMs: p.timeoutMs
      });
      bench.delete(p.name);                       // chạy được thì xoá án nghỉ
      tried.push(p.name + ':ok');
      console.log(`[brain] ${p.name} trả lời (đã thử: ${tried.join(' → ')})`);
      return { ...res, brain: p.name, tried };
    } catch (e) {
      tried.push(p.name + ':' + String(e.message || e).slice(0, 80));
      sitDown(p.name, e.message || e);
    }
  }
  console.log(`[brain] CẢ CHUỖI CHẾT → rơi về kịch bản. Đã thử: ${tried.join(' | ') || 'không có não nào có khoá'}`);
  return null;
}
