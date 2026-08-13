// v0.8 B5 — BÀI KIỂM "GIẾT TỪNG NÃO".
// Chạy nguyên một ván NGAY TRONG NODE (gọi thẳng onRequestPost, không cần deploy), mỗi vòng
// rút bớt một khoá, xem game có còn chơi được hết ván không.
//
// Chốt trước (plan-v0.8 §7):
//   · Rút BẤT KỲ 1 khoá nào → vẫn chơi hết ván.  4/4
//   · Rút 3, chỉ chừa 1 → vẫn chơi hết ván.       4/4
//   · Rút HẾT → rơi về kịch bản, KHÔNG vỡ.
//   · Quân sư 💡 + câu-hài-nhất sống khi KHÔNG có Anthropic.
//   · Thêm độ trễ do rơi tầng ≤ 1 giây ở lượt bình thường (nhờ ghế nghỉ).
//
// Chạy:  node game/tools/brain-killtest.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadApi } from './load-api.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');

// ── khoá: .dev.vars của game trước, thiếu thì mượn kho khoá chung của Werewolf ──
function readEnvFile(p) {
  try {
    return Object.fromEntries(fs.readFileSync(p, 'utf8').split(/\r?\n/)
      .filter(l => l.trim() && !l.trim().startsWith('#'))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  } catch { return {}; }
}
const LOCAL = readEnvFile(path.join(GAME, '.dev.vars'));
const SHARED = readEnvFile(path.resolve(GAME, '../../Werewolf AI Arena/.env.local'));
const FULL_ENV = {
  GEMINI_API_KEY: LOCAL.GEMINI_API_KEY || SHARED.GEMINI_API_KEY || SHARED.GOOGLE_GENERATIVE_AI_API_KEY,
  QWEN_API_KEY: LOCAL.QWEN_API_KEY || SHARED.QWEN_API_KEY,
  QWEN_BASE_URL: LOCAL.QWEN_BASE_URL || SHARED.QWEN_BASE_URL,
  DEEPSEEK_API_KEY: LOCAL.DEEPSEEK_API_KEY || SHARED.DEEPSEEK_API_KEY,
  ANTHROPIC_API_KEY: LOCAL.ANTHROPIC_API_KEY || SHARED.ANTHROPIC_API_KEY
};

const { onRequestPost, CHAIN, clearBench } = await loadApi();
const NAMES = CHAIN.map(p => p.name);
const KEY_OF = { gemini: 'GEMINI_API_KEY', qwen: 'QWEN_API_KEY', deepseek: 'DEEPSEEK_API_KEY', haiku: 'ANTHROPIC_API_KEY' };

const post = (env, body) => onRequestPost({
  request: new Request('https://x/api/converse', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  }), env
}).then(r => r.json());

const TURNS = [
  'Chào chị, em là sinh viên ở trọ cuối hẻm, em mới dọn tới hồi tháng trước.',
  'Em vừa đi làm thêm về, điện thoại hết pin mà em lại để quên chìa khoá phòng ở trong.',
  'Em ở dãy trọ số 12 đó, bà chủ tên cô Hạnh, chắc chị cũng biết.',
  'Em đứng đây nãy giờ cũng ngại lắm, mà em không biết hỏi ai nữa.',
  'Em hứa em không làm phiền lâu đâu, một chút xíu thôi à.',
  'Vậy chị giúp em được không?'
];
const OUTFIT = 'áo thun trắng, quần jeans, đeo ba lô sinh viên, tay không cầm gì';
const VI_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

// Một ván đầy đủ: chào → 6 lượt → xin gợi ý 💡 → câu-hài-nhất.
async function playRound(env, label) {
  const base = { npcId: 'me_bim_sua', seed: 4242, lang: 'vi', mode: 'ma_soi', outfit: OUTFIT };
  const t0 = Date.now();
  const greet = await post(env, { ...base, greet: true });
  const history = [{ role: 'npc', text: greet.npc.dialogue }];
  const state = { trust: 30, suspicion: 20, interest: 50, patience: 100 };
  const lines = [], brains = [], lat = [];

  for (const text of TURNS) {
    history.push({ role: 'player', text });
    const a = Date.now();
    const res = await post(env, { ...base, playerText: text, history: history.slice(-16), state });
    lat.push(Date.now() - a);
    if (!res.ok) throw new Error('API trả lỗi: ' + JSON.stringify(res).slice(0, 150));
    const d = res.npc.dialogue;
    history.push({ role: 'npc', text: d });
    lines.push(d); brains.push(res.scripted ? 'scripted' : res.brain);
    state.trust += 8; state.patience -= 8;
  }
  const hint = await post(env, { ...base, hintAsk: true, history: history.slice(-10) });
  const funny = await post(env, { ...base, summaryAsk: true, lines: TURNS });

  return {
    label,
    finished: lines.length === 6 && lines.every(l => l && l.trim().length > 3),
    brains, lines,
    dauDu: lines.every(l => VI_DAU.test(l)),
    hintOk: !!(hint.ok && hint.hint && hint.hint.length > 5),
    hint: (hint.hint || '').slice(0, 70),
    funnyOk: !!(funny.ok && funny.funny && funny.funny.comment),
    funny: funny.funny ? String(funny.funny.comment).slice(0, 70) : '(không có)',
    latTB: Math.round(lat.reduce((a, b) => a + b, 0) / lat.length),
    latMax: Math.max(...lat),
    tong: Date.now() - t0
  };
}

const only = keys => Object.fromEntries(Object.entries(FULL_ENV).filter(([k]) => keys.includes(k)));

const scenarios = [
  { label: 'ĐỦ 4 não', env: FULL_ENV },
  ...NAMES.map(n => ({ label: `RÚT ${n}`, env: only(Object.values(KEY_OF).filter(k => k !== KEY_OF[n]).concat(['QWEN_BASE_URL'])) })),
  ...NAMES.map(n => ({ label: `CHỈ CÒN ${n}`, env: only([KEY_OF[n], 'QWEN_BASE_URL']) })),
  { label: 'RÚT SẠCH (phải rơi về kịch bản)', env: {} }
];

console.log('BÀI KIỂM GIẾT TỪNG NÃO — khoá có sẵn: '
  + NAMES.filter(n => FULL_ENV[KEY_OF[n]]).join(', ') + '\n');

const results = [];
for (const s of scenarios) {
  clearBench();   // mỗi vòng bắt đầu từ ghế nghỉ trống, nếu không vòng trước làm bẩn vòng sau
  try {
    const r = await playRound(s.env, s.label);
    results.push(r);
    console.log(`✅ ${s.label.padEnd(34)} não=${[...new Set(r.brains)].join('+')} · `
      + `chơi hết ván=${r.finished} · 💡=${r.hintOk} · câu-hài=${r.funnyOk} · ${r.latTB}ms/lượt`);
  } catch (e) {
    results.push({ label: s.label, finished: false, error: String(e.message).slice(0, 160) });
    console.log(`❌ ${s.label.padEnd(34)} ${String(e.message).slice(0, 120)}`);
  }
}

// ── chấm theo đúng pass-number §7 ────────────────────────────────────────────
const R = l => results.find(r => r.label === l);
const checks = [];
const add = (what, pass, ev) => checks.push({ what, pass: !!pass, ev: String(ev).slice(0, 110) });
// Nói thẳng: "chơi hết ván" có thể là nhờ KỊCH BẢN. Cột này để không ai đọc nhầm bảng trên.
const realBrain = r => r && r.brains && r.brains.some(b => b !== 'scripted');
console.log('\n=== NÃO NÀO THẬT SỰ TRẢ LỜI TỪNG VÒNG (kịch bản = không có não nào sống) ===');
console.table(results.map(r => ({
  'vòng': r.label,
  'não trả lời': r.brains ? [...new Set(r.brains)].join(' + ') : ('LỖI: ' + r.error),
  'có não thật': realBrain(r) ? '✅' : '— kịch bản'
})));

const pull = NAMES.map(n => R(`RÚT ${n}`));
add('Rút bất kỳ 1 khoá → vẫn chơi hết ván (4/4)',
  pull.every(r => r && r.finished), pull.map(r => `${r.label}:${r.finished ? 'ok' : 'HỎNG'}`).join(' · '));

const solo = NAMES.map(n => R(`CHỈ CÒN ${n}`));
add('Rút 3, chỉ chừa 1 → vẫn chơi hết ván (4/4)',
  solo.every(r => r && r.finished), solo.map(r => `${r.label}:${r.finished ? 'ok' : 'HỎNG'}`).join(' · '));

const noAnthropic = R('RÚT haiku');
add('Quân sư 💡 + câu-hài-nhất SỐNG khi không có Anthropic',
  noAnthropic && noAnthropic.hintOk && noAnthropic.funnyOk,
  noAnthropic ? `💡="${noAnthropic.hint}" · hài="${noAnthropic.funny}"` : 'không chạy được');

const dead = R('RÚT SẠCH (phải rơi về kịch bản)');
add('Rút sạch khoá → rơi về kịch bản, KHÔNG vỡ',
  dead && dead.finished && dead.brains.every(b => b === 'scripted'),
  dead ? `não=${[...new Set(dead.brains)].join('+')}` : 'không chạy được');

const full = R('ĐỦ 4 não');
add('Lượt bình thường không bị chậm thêm vì rơi tầng (≤ 1 giây thêm)',
  full && full.brains.every(b => b === full.brains[0]) && full.latMax - full.latTB <= 1000,
  full ? `não=${[...new Set(full.brains)].join('+')} · TB=${full.latTB}ms · chậm nhất=${full.latMax}ms` : '-');

add('Tiếng Việt có dấu 100% ở mọi vòng có não thật',
  results.filter(r => r.lines && r.brains && r.brains.some(b => b !== 'scripted')).every(r => r.dauDu),
  results.filter(r => r.lines).map(r => `${r.label}:${r.dauDu ? 'đủ dấu' : 'THIẾU DẤU'}`).join(' · '));

console.log('');
console.table(checks.map(c => ({ 'mục': c.what, 'đạt': c.pass ? '✅' : '❌', 'bằng chứng': c.ev })));
const passed = checks.filter(c => c.pass).length;
console.log(`\n>>> ${passed}/${checks.length} ĐẠT`);
for (const c of checks.filter(c => !c.pass)) console.log(`  ❌ ${c.what}\n     ${c.ev}`);

fs.writeFileSync(path.join(HERE, 'brain-killtest-out.json'),
  JSON.stringify({ at: new Date().toISOString(), results, checks }, null, 2));
process.exitCode = passed === checks.length ? 0 : 1;
