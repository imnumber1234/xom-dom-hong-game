// v0.7 T4 — MÁY CHẤM GIỌNG.
// Đo đúng hai thứ plan-v0.7 §6 chốt trước khi test:
//   1) dấu hiệu giọng riêng ở LƯỢT 1 vs LƯỢT 6 (mục tiêu: lượt 6 >= 3 mỗi nhân vật)
//   2) trôi xưng hô sau 6 lượt (mục tiêu: 0/3 nhân vật)
//   3) giám khảo MÙ đoán ai nói (mục tiêu: >= 8/9)
// Gọi API THẬT của bản đã deploy — không giả lập.
//
// Chạy:  node game/tools/voice-score.mjs [BASE_URL]
// Mặc định BASE_URL = https://giong-that.xom-dom-hong.pages.dev

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');

export const BASE = process.argv[2] || process.env.XDH_BASE || 'https://giong-that.xom-dom-hong.pages.dev';

function devVars() {
  try {
    return Object.fromEntries(
      fs.readFileSync(path.join(GAME, '.dev.vars'), 'utf8')
        .split(/\r?\n/).filter(Boolean)
        .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    );
  } catch { return {}; }
}
const VARS = devVars();

// ── Dấu hiệu giọng: DỰNG TỰ ĐỘNG từ chính sổ giọng, không ai chọn tay ─────────
// Cách làm: lấy toàn bộ chữ trong 6 câu mẫu của nhân vật đó, bỏ chữ chung chung
// (là, và, có, không…), cộng thêm các cụm nằm trong ngoặc kép của dòng tic + emoji.
// Chấm một câu = đếm xem còn bao nhiêu chữ trong bộ đó. Không so với nhân vật khác —
// việc phân biệt nhân vật là phần của giám khảo mù.
const STOP = {
  vi: new Set(['là', 'và', 'có', 'không', 'cũng', 'này', 'đó', 'ở', 'của', 'cho', 'với', 'một', 'hai', 'ba', 'người', 'nhà', 'đi', 'rồi', 'được', 'gì', 'ai', 'sao', 'nữa', 'mà', 'thì', 'các', 'những', 'để', 'khi', 'nếu', 'vì', 'ra', 'vào', 'lên', 'nói', 'nghe', 'thấy', 'lắm', 'quá', 'thôi', 'đang', 'còn', 'chưa', 'tới', 'hồi', 'nãy', 'sau', 'trước', 'nó', 'con', 'cái', 'trên', 'trong', 'luôn', 'chỉ', 'đâu', 'đây', 'giờ', 'ngày', 'đêm', 'mấy', 'nào', 'hay']),
  en: new Set(['the', 'a', 'an', 'i', 'you', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'it', 'that', 'this', 'my', 'your', 'me', 'do', 'does', 'did', 'what', 'who', 'so', 'if', 'for', 'with', 'have', 'has', 'had', 'be', 'been', 'am', 'not', 'no', 'yes', 'all', 'up', 'out', 'go', 'going', 'get', 'got', 'know', 'like', 'time', 'here', 'there', 'about', 'from', 'they', 'them', 'he', 'she', 'we', 'us', 'his', 'her', 'their', 'one', 'two', 'three', 'over', 'now', 'then', 'too', 'very', 'can', 'could', 'would', 'should', 'will', 'just', 'even'])
};
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const words = s => (s || '').toLowerCase().replace(/[.,!?…"“”—–\-()?:;]/g, ' ').split(/\s+/).filter(Boolean);

function buildMarkers(persona, lang) {
  const lines = lang === 'en' ? persona.voice_en : persona.voice;
  const tic = (lang === 'en' ? persona.tic_en : persona.tic) || '';
  const uni = new Set();
  for (const l of lines) for (const w of words(l)) if (w.length >= 2 && !STOP[lang].has(w)) uni.add(w);
  const phrases = [...tic.matchAll(/"([^"]+)"/g)].flatMap(m => m[1].split(' / ')).map(s => s.trim().toLowerCase()).filter(Boolean);
  const emo = [...new Set([...lines.join(' ').matchAll(EMOJI)].map(m => m[0]))];
  return { uni, phrases, emo };
}
export let MARKERS = null;   // dựng một lần khi biết PERSONAS (xem initMarkers)
export function initMarkers(PERSONAS) {
  MARKERS = {};
  for (const id of Object.keys(PERSONAS)) {
    MARKERS[id] = { vi: buildMarkers(PERSONAS[id], 'vi'), en: buildMarkers(PERSONAS[id], 'en') };
  }
  return MARKERS;
}

// Xưng hô khoá cứng theo sổ giọng. Trôi = lượt 6 không còn xưng đúng, hoặc nhảy sang xưng lạ.
// LƯU Ý: \b của JS chỉ hiểu chữ không dấu → phải tự viết ranh giới bằng \p{L} (đã sập một lần 08-10).
const SELF = { me_bim_sua: /(^|[^\p{L}])cô([^\p{L}]|$)/iu, sinh_vien: /(^|[^\p{L}])em([^\p{L}]|$)/iu, gen_z: /(^|[^\p{L}])em([^\p{L}]|$)/iu };
// "một mình" KHÔNG phải xưng hô — bẫy này làm phép đo báo nhầm hôm 08-10.
const FOREIGN_SELF = /(^|[^\p{L}])(tui|tôi|tớ)([^\p{L}]|$)|(?<!một\s)(^|[^\p{L}])mình([^\p{L}]|$)/iu;

export const NPCS = [
  { id: 'me_bim_sua', name: 'Cô Sáu' },
  { id: 'sinh_vien', name: 'Tí' },
  { id: 'gen_z', name: 'Ly' }
];
export const MODES = ['ma_soi', 'ket_tien'];
export const LANGS = ['vi', 'en'];

const PLAYER_TURNS = {
  vi: [
    'Chào chị, em là sinh viên ở trọ cuối hẻm, em mới dọn tới hồi tháng trước.',
    'Em vừa đi làm thêm về, điện thoại hết pin mà em lại để quên chìa khoá phòng ở trong.',
    'Em ở dãy trọ số 12 đó, bà chủ tên cô Hạnh, chắc chị cũng biết.',
    'Em đứng đây nãy giờ cũng ngại lắm, mà em không biết hỏi ai nữa.',
    'Em hứa em không làm phiền lâu đâu, một chút xíu thôi à.',
    'Vậy chị giúp em được không?'
  ],
  en: [
    "Hi, I'm a student renting at the end of the alley, I only moved in last month.",
    "I just got back from my part-time shift, my phone died and I left my key inside the room.",
    "I'm in the rental block at number 12, the landlady is Mrs Hạnh, you probably know her.",
    "I've been standing out here a while and I feel bad, but I don't know who else to ask.",
    "I promise I won't take much of your time, just a moment.",
    "So… could you help me out?"
  ]
};

const OUTFIT = {
  vi: 'áo thun trắng, quần jeans, đeo ba lô sinh viên, tay không cầm gì',
  en: 'white t-shirt, jeans, a student backpack, empty hands'
};

async function post(payload) {
  const r = await fetch(BASE.replace(/\/$/, '') + '/api/converse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error('API ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
  return j;
}

// Một cuộc nói chuyện 6 lượt, đúng payload client thật gửi.
export async function runConversation({ npcId, mode, lang, seed }) {
  const base = {
    npcId, seed, lang, mode,
    outfit: OUTFIT[lang],
    ...(mode === 'ket_tien' ? { hour: 16, hourText: '4 giờ chiều', timeHint: 'chiều muộn', knocked: 0, day: 1 } : {})
  };
  const greet = await post({ ...base, greet: true });
  const history = [{ role: 'npc', text: greet.npc.dialogue }];
  const lines = [], brains = [], usage = [];
  const state = { trust: 30, suspicion: 20, interest: 50, patience: 100 };

  for (const text of PLAYER_TURNS[lang]) {
    history.push({ role: 'player', text });
    const res = await post({ ...base, playerText: text, history: history.slice(-16), state });
    const d = res.npc.dialogue;
    history.push({ role: 'npc', text: d });
    lines.push(d);
    brains.push(res.scripted ? 'scripted' : res.brain);
    usage.push(res.usage || null);
    // nhích trạng thái cho giống ván thật (không ảnh hưởng phép đo giọng)
    if (res.npc.verdict === 'danh_trung') state.trust += 16;
    else if (res.npc.verdict === 'hop_ly') state.trust += 10;
    else if (res.npc.verdict === 'kha_nghi') state.suspicion += 10;
    state.patience -= 8;
  }
  return { npcId, mode, lang, seed, greet: greet.npc.dialogue, lines, brains, usage };
}

export function markerCount(npcId, lang, s) {
  if (!MARKERS) throw new Error('gọi initMarkers(PERSONAS) trước');
  const M = MARKERS[npcId][lang];
  const t = (s || '').toLowerCase();
  const toks = new Set(words(s));
  let n = 0;
  for (const w of M.uni) if (toks.has(w)) n++;
  for (const p of M.phrases) if (t.includes(p)) n++;
  for (const e of M.emo) if (t.includes(e)) n++;
  return n;
}

// Sổ giọng của Lucas ghi rõ: "AI KHÔNG chép nguyên văn — nó bắt chước NHỊP câu."
// Đo bằng chuỗi chữ DÀI NHẤT mà lời thoại bê y nguyên từ 6 câu mẫu.
export function maxCopyRun(personaVoiceLines, dialogue) {
  const norm = s => s.toLowerCase().replace(/[.,!?…"“”—–-]/g, ' ').split(/\s+/).filter(Boolean);
  const d = norm(dialogue);
  let best = 0;
  for (const sample of personaVoiceLines) {
    const v = norm(sample);
    for (let a = 0; a < d.length; a++) for (let b = 0; b < v.length; b++) {
      let k = 0;
      while (a + k < d.length && b + k < v.length && d[a + k] === v[b + k]) k++;
      if (k > best) best = k;
    }
  }
  return best;
}

export function pronounDrift(npcId, lines) {
  // chỉ đo tiếng Việt — tiếng Anh không có hệ xưng hô để trôi
  // "một mình" / "tự mình" là trạng từ, KHÔNG phải xưng hô — bỏ ra trước khi dò
  const clean = s => (s || '').toLowerCase().replace(/(một|tự|chính|riêng)\s+mình/g, ' ');
  const t1 = clean(lines[0]);
  const t6 = clean(lines[5]);
  const keptStart = SELF[npcId].test(t1);
  const keptEnd = SELF[npcId].test(t6);
  const foreign = FOREIGN_SELF.test(t6);
  return { keptStart, keptEnd, foreign, drift: (keptStart && !keptEnd) || foreign };
}

// Giám khảo MÙ: bắt buộc trả lời bằng tool → chỉ ra được đúng MỘT tên, không lan man.
// Thẻ mô tả cố tình MỎNG (một dòng), y như thí nghiệm phiên A: nếu giọng nhạt thì đoán trượt.
const JUDGE_TOOL = {
  name: 'chon_nguoi_noi',
  description: 'Chọn ai đã nói câu thoại này.',
  input_schema: { type: 'object', properties: { ten: { type: 'string', enum: ['Cô Sáu', 'Tí', 'Ly'] } }, required: ['ten'] }
};
const JUDGE_CARDS = [
  'Cô Sáu: mẹ bỉm sữa 32 tuổi, con nhỏ hay quấy, thích tám chuyện xóm.',
  'Tí: sinh viên 20 tuổi ở trọ một mình, mê bóng đá, sợ chủ trọ.',
  'Ly: 19 tuổi, làm content TikTok, mê drama, chán rất nhanh.'
].join('\n');

export let JUDGE_USED = '-';

// Giám khảo 1: Haiku (giống thí nghiệm phiên A). Hết tiền/lỗi khoá → tự chuyển sang DeepSeek.
// KHÔNG tự mua thêm tiền API — đó là việc của Lucas.
async function judgeAnthropic(line) {
  const key = VARS.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5', max_tokens: 100,
      tools: [JUDGE_TOOL], tool_choice: { type: 'tool', name: 'chon_nguoi_noi' },
      messages: [{ role: 'user', content: `Ba người hàng xóm:\n${JUDGE_CARDS}\n\nCâu thoại: "${line}"\n\nAi nói câu này?` }]
    })
  });
  if (!r.ok) return null;
  const j = await r.json();
  return (j.content || []).find(c => c.type === 'tool_use')?.input?.ten ?? null;
}

async function judgeDeepSeek(line) {
  const key = VARS.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat', max_tokens: 40, temperature: 0, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Bạn là giám khảo. Chỉ trả về JSON dạng {"ten":"Cô Sáu"} hoặc {"ten":"Tí"} hoặc {"ten":"Ly"}. Không giải thích.' },
        { role: 'user', content: `Ba người hàng xóm:\n${JUDGE_CARDS}\n\nCâu thoại: "${line}"\n\nAi nói câu này?` }
      ]
    })
  });
  if (!r.ok) return null;
  const j = await r.json();
  try { return JSON.parse(j.choices[0].message.content).ten; } catch { return null; }
}

async function judgeWho(line) {
  if (JUDGE_USED !== 'deepseek') {
    const a = await judgeAnthropic(line);
    if (a) { JUDGE_USED = 'haiku'; return a; }
    JUDGE_USED = 'deepseek';
  }
  return (await judgeDeepSeek(line)) ?? 'ERR';
}

// 3 nhân vật × 3 lượt (2/4/6) = 9 câu, lấy từ ván tiếng Việt chế độ ma sói.
export async function blindId(runs) {
  let correct = 0, total = 0;
  const misses = [];
  for (const n of NPCS) {
    const run = runs.find(r => r.npcId === n.id && r.mode === 'ma_soi' && r.lang === 'vi');
    if (!run || run.lines.length < 6) continue;
    for (const idx of [1, 3, 5]) {
      const line = run.lines[idx];
      const g = await judgeWho(line);
      total++;
      if (g === n.name) correct++; else misses.push({ who: n.name, guess: g, line });
    }
  }
  return { correct, total, misses };
}

export async function runAll(seedBase = 4242) {
  const jobs = [];
  let s = seedBase;
  for (const n of NPCS) for (const mode of MODES) for (const lang of LANGS) {
    jobs.push({ npcId: n.id, mode, lang, seed: s++ });
  }
  const out = [];
  const CONC = Number(process.env.XDH_CONC) || 2;   // chạy ít song song để không tự làm nghẽn nhà cung cấp (08-10)
  for (let i = 0; i < jobs.length; i += CONC) {
    const batch = await Promise.all(jobs.slice(i, i + CONC).map(j =>
      runConversation(j).catch(e => ({ ...j, error: String(e).slice(0, 200), lines: [], brains: [] }))));
    out.push(...batch);
    process.stderr.write(`  … ${out.length}/${jobs.length} cuộc nói chuyện\n`);
  }
  return out;
}

// ── chạy trực tiếp ────────────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`MÁY CHẤM GIỌNG — ${BASE}\n`);
  const { PERSONAS } = await (await import('./load-api.mjs')).loadApi();
  initMarkers(PERSONAS);
  const runs = await runAll();
  const scriptedTurns = runs.flatMap(r => r.brains).filter(b => b === 'scripted').length;
  console.log(`Não dùng thật: ${runs.flatMap(r => r.brains).filter(b => b === 'haiku').length} lượt Haiku · `
    + `${runs.flatMap(r => r.brains).filter(b => b === 'deepseek').length} lượt DeepSeek · ${scriptedTurns} lượt rơi về kịch bản\n`);

  console.log('=== CHÉP NGUYÊN VĂN CÂU MẪU (chuỗi chữ dài nhất bê y nguyên; > 4 là bị) ===');
  const copyRows = runs.filter(r => r.lines.length).map(r => {
    const pool = r.lang === 'en' ? PERSONAS[r.npcId].voice_en : PERSONAS[r.npcId].voice;
    const runsMax = r.lines.map(l => maxCopyRun(pool, l));
    return {
      'nhân vật': NPCS.find(n => n.id === r.npcId).name, 'chế độ': r.mode, 'ngôn ngữ': r.lang,
      'dài nhất': Math.max(...runsMax), 'số lượt chép > 4 chữ': runsMax.filter(x => x > 4).length + '/6'
    };
  });
  console.table(copyRows);

  const rows = runs.map(r => ({
    'nhân vật': NPCS.find(n => n.id === r.npcId).name,
    'chế độ': r.mode,
    'ngôn ngữ': r.lang,
    'não': [...new Set(r.brains)].join('+') || '-',
    'dấu hiệu lượt 1': r.lines.length ? markerCount(r.npcId, r.lang, r.lines[0]) : 0,
    'dấu hiệu lượt 6': r.lines.length ? markerCount(r.npcId, r.lang, r.lines[5]) : 0,
    'lỗi': r.error || ''
  }));
  console.table(rows);

  console.log('\n=== TRÔI XƯNG HÔ (chỉ tiếng Việt, gộp 2 chế độ) ===');
  const driftRows = [];
  for (const n of NPCS) {
    for (const mode of MODES) {
      const r = runs.find(x => x.npcId === n.id && x.mode === mode && x.lang === 'vi');
      if (!r || !r.lines.length) continue;
      const d = pronounDrift(n.id, r.lines);
      driftRows.push({ 'nhân vật': n.name, 'chế độ': mode, 'lượt 1 xưng đúng': d.keptStart, 'lượt 6 xưng đúng': d.keptEnd, 'xưng lạ (tui/tôi/mình)': d.foreign, 'TRÔI': d.drift });
    }
  }
  console.table(driftRows);

  const bid = await blindId(runs);
  console.log(`\n=== GIÁM KHẢO MÙ === ${bid.correct}/${bid.total} (${Math.round(100 * bid.correct / bid.total)}%)`);
  for (const m of bid.misses) console.log(`  ✗ ${m.who} bị đoán thành "${m.guess}" — "${m.line}"`);

  console.log('\n=== LỜI THOẠI LƯỢT 6 ===');
  for (const r of runs) {
    console.log(`[${NPCS.find(n => n.id === r.npcId).name} · ${r.mode} · ${r.lang}] ${(r.lines[5] || r.error || '').replace(/\n/g, ' ')}`);
  }

  const outPath = path.join(HERE, 'voice-score-out.json');
  fs.writeFileSync(outPath, JSON.stringify({ base: BASE, at: new Date().toISOString(), runs, rows, driftRows, blind: bid }, null, 2));
  console.log(`\nDữ liệu thô: ${outPath}`);
}
