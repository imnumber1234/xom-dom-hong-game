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

const passed = out.checks.filter(c => c.pass).length;
console.log('');
out.checks.forEach(c => console.log((c.pass ? '  ✅ ' : '  ❌ ') + c.what + ' | ' + c.ev));
console.log(`\n>>> ${passed}/${out.checks.length} ĐẠT`);
const fs = await import('node:fs');
fs.writeFileSync(new URL('./mission-live-out.json', import.meta.url), JSON.stringify({ ...out, log1, log2, passed }, null, 2));
process.exitCode = passed === out.checks.length ? 0 : 1;
