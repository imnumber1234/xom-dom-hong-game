// v1.0 — KIỂM SỐNG số đậu #1 (plan mục 6): người chơi mới nhắc TikTok → moi ra chuyện gậy
// trong <= 8 lượt, VÀ AI không khai khi quan tâm < 60 (cổng server chặn tín hiệu).
// Nói chuyện THẬT với não thật trên bản deploy. Chạy: node game/tools/mission-live.mjs [BASE_URL]

const BASE = (process.argv[2] || 'https://nhiem-vu.xom-dom-hong.pages.dev').replace(/\/$/, '');

const OUTFIT = 'Áo: quần áo bình thường, hơi nhàu. Đầu: không đội gì, tóc hơi rối. Tay: không cầm gì.';

async function turn(body) {
  const r = await fetch(BASE + '/api/converse', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

async function convo(lines, interestPlan, mission) {
  const state = { trust: 30, suspicion: 20, interest: 50, patience: 100 };
  const history = [];
  const seed = 4242;
  // câu chào kịch bản trước, như client thật
  const g = await turn({ npcId: 'gen_z', greet: true, seed, lang: 'vi', mode: 'ma_soi', mission });
  history.push({ role: 'npc', text: g.npc.dialogue });
  const log = [];
  for (let i = 0; i < lines.length; i++) {
    state.interest = interestPlan[i];
    history.push({ role: 'player', text: lines[i] });
    const res = await turn({
      npcId: 'gen_z', seed, lang: 'vi', mode: 'ma_soi',
      playerText: lines[i], history: history.slice(-16), outfit: OUTFIT,
      state, secondsLeft: 240, doorThreshold: 55, mission
    });
    if (!res.ok) { log.push({ turn: i + 1, error: res.error || 'lỗi' }); continue; }
    history.push({ role: 'npc', text: res.npc.dialogue });
    const sig = res.npc.mission_signal || '';
    log.push({ turn: i + 1, interest: state.interest, brain: res.brain || 'kịch bản', sig,
               line: String(res.npc.dialogue).replace(/\n/g, ' ').slice(0, 90) });
    // máy trạng thái phía client: nhích clues như missions.js sẽ nhích
    if (sig === 'manh_moi_1' && mission.clues === 0) mission.clues = 1;
    if (sig === 'manh_moi_2' && mission.clues === 1) mission.clues = 2;
    if (sig === 'ro_chuyen' && mission.clues >= 2) { mission.done = true; break; }
  }
  return log;
}

// ── Bài 1: người chơi tử tế lần theo mạch TikTok — kỳ vọng ro_chuyen trong <= 8 lượt ──
const GOOD_LINES = [
  'Chào em, khuya rồi mà nhà em còn sáng đèn dữ ha?',
  'Ủa em làm TikTok hả? Anh thấy đèn quay với điện thoại dựng nè, kênh em làm content gì vậy?',
  'Nghe hay á chớ! Mà sao giọng em xìu xìu vậy, bộ quay clip đêm nay không ổn hả?',
  'Thiếu đồ gì em nói anh nghe thử coi, biết đâu anh giúp được thì sao?',
  'Trời, gãy hồi nào vậy? Rồi giờ em tính quay tiếp kiểu gì?',
  'Sao em không mua cái mới luôn cho rồi?',
  'Em cứ kể hết đi, anh hỏi thiệt lòng chứ không có gì đâu.',
  'Anh thấy chuyện này giải quyết được mà, nói anh nghe nốt đi.'
];
const GOOD_INTEREST = [50, 58, 66, 72, 78, 80, 82, 84];   // 2 lượt đầu CHƯA đủ 60

// ── Bài 2: quan tâm kẹt ở 40 — hỏi thẳng cũng KHÔNG được có tín hiệu (cổng 2 lớp) ──
const COLD_LINES = [
  'Nghe nói gậy selfie của em bị gãy hả?',
  'Em đang thiếu đồ quay clip đúng không, khai thiệt đi?'
];
const COLD_INTEREST = [40, 40];

// ── Bài 3: KỊCH BẢN LUCAS (08-13) — mô phỏng ĐÚNG máy chấm client: hứng thú chạy theo
// verdict thật (không bơm tay), luật manh mối y hệt missions.js (ngưỡng 60 · nhịp 2 lượt · thứ tự).
const VERDICTS = {
  danh_trung: { i: 8 }, hop_ly: { i: 3 }, thuong: { i: -4 }, kha_nghi: { i: 0 }, lo_lieu: { i: 2 }
};
const LUCAS_LINES = [
  'Chị là fan TikTok hả, em thích TikTok lắm',
  'thiếu gì vậy chị',
  'thiếu gì',
  'kể em nghe đi, biết đâu em giúp được',
  'rồi sao nữa chị',
  'sao chị không mua cái mới luôn',
  'em muốn giúp thiệt mà, kể hết đi',
  'chị kể nốt đi em nghe nè'
];
function normLine(s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
function nearDup(a, b) {
  const x = normLine(a), y = normLine(b);
  if (x.length < 12 || y.length < 12) return false;
  if (x === y) return true;
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  return s.length >= 20 && l.includes(s.slice(0, Math.ceil(s.length * 0.8)));
}
async function convoLucas() {
  const state = { trust: 30, suspicion: 20, interest: 50, patience: 100 };
  const mission = { id: 'ly_selfie', stage: 'chua_biet', clues: 0 };
  let lastClueTurn = -99, popupTurn = null;
  const history = [], log = [];
  const seed = 777;
  const g = await turn({ npcId: 'gen_z', greet: true, seed, lang: 'vi', mode: 'ma_soi', mission });
  history.push({ role: 'npc', text: g.npc.dialogue });
  for (let i = 0; i < LUCAS_LINES.length; i++) {
    await new Promise(r => setTimeout(r, 1200));   // nhịp người thật — đỡ dí não tới mức bị khoá lượt
    history.push({ role: 'player', text: LUCAS_LINES[i] });
    const res = await turn({
      npcId: 'gen_z', seed, lang: 'vi', mode: 'ma_soi',
      playerText: LUCAS_LINES[i], history: history.slice(-16), outfit: OUTFIT,
      state, secondsLeft: 240, doorThreshold: 55, mission, debug: true
    });
    if (!res.ok) { log.push({ turn: i + 1, error: res.error || 'lỗi' }); continue; }
    history.push({ role: 'npc', text: res.npc.dialogue });
    const sig = res.npc.mission_signal || '';
    const tn = i + 1;
    // máy chấm client: verdict → hứng thú, cộng thêm "ấm dần" khi server báo probe
    const v = VERDICTS[res.npc.verdict] || VERDICTS.thuong;
    state.interest = Math.max(0, Math.min(100, state.interest + v.i));
    if (res.npc.mission_probe) state.interest = Math.min(100, state.interest + 4);
    // luật nhận tín hiệu y hệt missions.js (rõ chuyện chỉ cần qua 1 lượt sau manh mối 2)
    let took = '';
    const needGap = sig === 'ro_chuyen' ? 1 : 2;
    if (sig && state.interest >= 60 && !(mission.clues > 0 && tn - lastClueTurn < needGap)) {
      if (sig === 'manh_moi_1' && mission.clues === 0) { mission.clues = 1; mission.stage = 'da_goi'; lastClueTurn = tn; took = 'manh mối 1'; }
      else if (sig === 'manh_moi_2' && mission.clues === 1) { mission.clues = 2; lastClueTurn = tn; took = 'manh mối 2'; }
      else if (sig === 'ro_chuyen' && mission.clues >= 2) { popupTurn = tn; took = 'POPUP 📱'; }
    }
    log.push({ turn: tn, verdict: res.npc.verdict, interest: state.interest, brain: res.brain,
               sig, took, probe: !!res.npc.mission_probe, retried: !!(res.debug && res.debug.retried),
               line: String(res.npc.dialogue).replace(/\n/g, ' ').slice(0, 88) });
    if (popupTurn) break;
  }
  return { log, popupTurn };
}

const out = { base: BASE, at: new Date().toISOString(), checks: [] };
const add = (what, pass, ev) => { out.checks.push({ what, pass: !!pass, ev }); };

console.log('KIỂM SỐNG HỆ NHIỆM VỤ —', BASE, '\n');

const m1 = { id: 'ly_selfie', stage: 'chua_biet', clues: 0 };
const log1 = await convo(GOOD_LINES, GOOD_INTEREST, m1);
console.log('— Bài 1: lần theo mạch TikTok —');
log1.forEach(l => console.log(`  lượt ${l.turn} [quan tâm ${l.interest}] não=${l.brain} tín hiệu=${l.sig || '(không)'} · "${l.line || l.error}"`));
const early = log1.filter(l => l.sig && l.interest < 60);
const doneTurn = (log1.find(l => l.sig === 'ro_chuyen') || {}).turn || null;
const order = log1.filter(l => l.sig).map(l => l.sig).join(' → ');
add('Không tín hiệu nào lọt khi quan tâm < 60', early.length === 0, order);
add('Manh mối ra đúng thứ tự 1 → 2 → rõ chuyện', /^manh_moi_1( → manh_moi_2)+( → ro_chuyen)$/.test(order) || order === 'manh_moi_1 → manh_moi_2 → ro_chuyen', order);
add('Moi ra chuyện gậy (ro_chuyen) trong <= 8 lượt', doneTurn !== null && doneTurn <= 8, 'ro_chuyen ở lượt ' + doneTurn);

const m2 = { id: 'ly_selfie', stage: 'chua_biet', clues: 0 };
const log2 = await convo(COLD_LINES, COLD_INTEREST, m2);
console.log('\n— Bài 2: hỏi thẳng khi quan tâm 40 —');
log2.forEach(l => console.log(`  lượt ${l.turn} [quan tâm ${l.interest}] não=${l.brain} tín hiệu=${l.sig || '(không)'} · "${l.line || l.error}"`));
add('Quan tâm 40 + hỏi thẳng → tín hiệu vẫn bị chặn cả 2 lượt', log2.every(l => !l.sig), log2.map(l => l.sig || '·').join(' '));

// Bài 3 — kịch bản Lucas: hứng thú chạy theo verdict thật, kiểm kẹt vòng lặp + tiến độ
const b3 = await convoLucas();
console.log('\n— Bài 3: kịch bản Lucas (máy chấm client thật) —');
b3.log.forEach(l => console.log(`  lượt ${l.turn} não=${l.brain || 'kịch bản'} chấm=${l.verdict || '?'} quan tâm=${l.interest}${l.probe ? ' (+ấm dần)' : ''} tín hiệu=${l.sig || '·'}${l.took ? ' → ' + l.took : ''}${l.retried ? ' (bắt viết lại)' : ''} · "${l.line || l.error}"`));
{
  const lines = b3.log.map(l => l.line || '');
  let dups = 0;
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length; j++)
      if (nearDup(lines[i], lines[j])) dups++;
  add('Kịch bản Lucas — KHÔNG còn câu nhai lại (0 cặp trùng)', dups === 0, dups + ' cặp trùng');
  add('Kịch bản Lucas — hỏi han là hứng thú TĂNG, popup 📱 mở trong <= 8 lượt',
    b3.popupTurn !== null && b3.popupTurn <= 8, 'popup ở lượt ' + b3.popupTurn);
  const VI_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  const noDau = lines.filter(Boolean).filter(l => !VI_DAU.test(l));
  add('Phạt-lặp 1.0 KHÔNG làm mất dấu tiếng Việt (mọi câu đều có dấu)',
    noDau.length === 0, noDau.length ? 'câu không dấu: ' + noDau[0].slice(0, 60) : 'sạch');
}

const passed = out.checks.filter(c => c.pass).length;
console.log('');
out.checks.forEach(c => console.log((c.pass ? '  ✅ ' : '  ❌ ') + c.what + ' | ' + c.ev));
console.log(`\n>>> ${passed}/${out.checks.length} ĐẠT`);
const fs = await import('node:fs');
fs.writeFileSync(new URL('./mission-live-out.json', import.meta.url), JSON.stringify({ ...out, log1, log2, log3: b3.log, passed }, null, 2));
process.exitCode = passed === out.checks.length ? 0 : 1;
