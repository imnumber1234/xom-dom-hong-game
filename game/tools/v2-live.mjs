// v2-live.mjs — ĐO THẬT trên bản đã đẩy lên mạng. Hai con số đậu của kế hoạch:
//   Số 4 — lượt NÓI ĐẦU TIÊN trúng tim thì KHÔNG còn bị chấm "nhạt".
//   Số 7 — chọn English thì >= 95% câu trả lời bằng tiếng Anh.
// Cộng thêm: não nào đang trả lời thật (số 2) và sổ đen có ghi được không (số 1).
//
//   node tools/v2-live.mjs [BASE_URL]
//   mặc định: https://hop-kinh.xom-dom-hong.pages.dev
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.argv[2] || 'https://hop-kinh.xom-dom-hong.pages.dev').replace(/\/$/, '');

// dùng LẠI đúng hàm đoán ngôn ngữ của máy chủ — đo bằng cùng một cái thước
const tmp = path.join(HERE, '.tmp');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, '_ledger.mjs'),
  fs.readFileSync(path.resolve(HERE, '../functions/api/_ledger.js'), 'utf8'));
const { guessLang } = await import(pathToFileURL(path.join(tmp, '_ledger.mjs')).href);

const RUN = 'live_' + Date.now().toString(36);
const START = { trust: 30, suspicion: 20, interest: 50, patience: 100 };

async function say(body, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + '/api/converse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ seed: 1 + Math.floor(Math.random() * 9999), debug: true, runId: RUN }, body))
      });
      const j = await r.json();
      if (j && j.ok) return j;
    } catch { /* thử lại */ }
    await new Promise(res => setTimeout(res, 900 * (i + 1)));
  }
  return null;
}

const GREET = { gen_z: 'Ủa alo?? Ai bấm chuông giờ này dạ…',
                sinh_vien: 'Dạ ai đó ạ? Em đang coi hiệp hai…',
                me_bim_sua: 'Ai đó?? Khuya khoắt rồi mà bấm chuông nhà người ta…' };

// ══ SỐ ĐẬU 4 — LƯỢT ĐẦU TIÊN ═════════════════════════════════════════════════
// Bảng từ khoá lấy ĐÚNG từ XDH.REGRET trong config.js — không chép tay, không đoán.
const cfg = fs.readFileSync(path.resolve(HERE, '../public/js/config.js'), 'utf8');
function regretKeys(npcId) {
  const m = cfg.match(new RegExp('\\n  ' + npcId + ': \\[([\\s\\S]*?)\\n  \\]'));
  if (!m) return [];
  return [...m[1].matchAll(/keys: \[([\s\S]*?)\]/g)]
    .map(x => x[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean));
}
// Lớp CODE của thanh thiện cảm (bản sao của convo.js): câu >= 10 ký tự + trúng từ khoá
// → mức chấm được NÂNG lên danh_trung. Đây là mức người chơi THẬT SỰ nhận được.
function effectiveVerdict(npcId, text, aiVerdict, contradiction) {
  const t = String(text || '').toLowerCase();
  if (t.trim().length < 10 || contradiction) return aiVerdict;
  const hit = regretKeys(npcId).some(group => group.some(k => t.includes(k)));
  if (hit && (aiVerdict === 'thuong' || aiVerdict === 'kha_nghi')) return 'danh_trung';
  return aiVerdict;
}

const OPENERS = {
  gen_z: [
    'Ê Ly ơi, cái clip trend hôm qua của em quay góc đẹp dữ, anh coi đi coi lại ba lần luôn.',
    'Ly ơi anh có một ý tưởng kịch bản video này chắc chắn viral, nghe thử không?',
    'Ly ơi trong xóm mình đang có drama gì hay không, kể anh nghe với.',
    'Khuya rồi mà em vẫn quay content à, chăm quá vậy trời.',
    'Chào em, cho anh hỏi thăm đường ra bến xe với ạ.',
    'Dạ em chào chị, trời hôm nay mát ha.'
  ],
  sinh_vien: [
    'Ê Tí ơi, trận tối nay tỉ số sao rồi em, anh lỡ mất hiệp một.',
    'Nhìn cái phòng trọ này là biết đời sinh viên rồi, mì gói với deadline hả em.',
    'Anh mang theo miếng đồ ăn nè, coi trận chung với em cho vui không?',
    'Em ơi đội em ruột là MU hay Arsenal vậy, anh cãi nhau với bạn nãy giờ.',
    'Chào em, cho anh hỏi thăm đường ra bến xe với ạ.',
    'Dạ em chào anh, trời hôm nay mát ha.'
  ],
  me_bim_sua: [
    'Cô ơi bé Bin nhà mình dễ thương quá trời, mấy tháng rồi cô.',
    'Dạ con nói nhỏ thôi cô, sợ bé Bin đang ngủ giật mình.',
    'Cô ơi dạo này rau ngoài chợ lên giá dữ ha cô, thịt cũng đắt nữa.',
    'Cô kể con nghe chuyện xóm mình đi cô, con mới tới nên chưa biết ai với ai.',
    'Chào cô, cho con hỏi thăm đường ra bến xe với ạ.',
    'Dạ con chào cô, trời hôm nay mát ha.'
  ]
};
const ON_TOPIC = 4;   // 4 câu đầu mỗi nhà là câu TRÚNG TIM, 2 câu cuối cố ý nhạt

async function turnOneTest() {
  const rows = [];
  for (const npc of ['gen_z', 'sinh_vien', 'me_bim_sua']) {
    for (let i = 0; i < OPENERS[npc].length; i++) {
      const text = OPENERS[npc][i];
      const j = await say({
        npcId: npc, lang: 'vi', mode: 'ma_soi', night: 1, turn: 1, friend: 0,
        session: 'v2live_turn1_' + npc + '_' + i,
        // v2.3: máy khách THẬT đẩy câu người chơi vào lịch sử TRƯỚC khi gọi. Bộ đo cũ không làm vậy
        // nên nó đo nhầm một đường code khác — số cũ (AI chấm "nhạt" 12/12) là do AI KHÔNG HỀ
        // ĐƯỢC ĐỌC câu đó, chứ không phải nó chấm keo. Sửa xong đo lại cho ra số thật.
        playerText: text, history: [{ role: 'npc', text: GREET[npc] }, { role: 'player', text }],
        state: { ...START }, outfit: 'quần áo bình thường, hơi nhàu'
      });
      const ai = j && j.npc ? j.npc.verdict : null;
      rows.push({
        npc, 'trúng tim': i < ON_TOPIC ? 'CÓ' : 'không', 'câu mở': text.slice(0, 42) + '…',
        'AI chấm': ai || 'LỖI',
        'người chơi nhận': ai ? effectiveVerdict(npc, text, ai, j.npc.contradiction) : 'LỖI',
        'não': j ? (j.brain || 'kịch bản') : '—'
      });
      process.stdout.write('.');
    }
  }
  return rows;
}

// ══ SỐ ĐẬU 7 — TUÂN LỆNH NGÔN NGỮ ════════════════════════════════════════════
const EN_LINES = [
  "Hi, sorry to knock so late — I'm a student and my phone died at noon.",
  "I've been walking since this afternoon and I genuinely have no idea where I am.",
  "That video you posted yesterday was shot really well, the angle was great.",
  "Do you know if the bus station is still open at this hour?",
  "I promise I'm not a weirdo, I just need directions and maybe some water.",
  "My friend lives around here somewhere but he isn't picking up his phone.",
  "Honestly the match tonight was unbelievable, did you catch the second half?",
  "It smells like someone is cooking, that is genuinely torture right now.",
  "I can pay you back tomorrow if that helps, I just need a place to sit.",
  "Alright, fair enough — what would convince you that I'm telling the truth?"
];
const VI_LINES = [
  'Dạ em chào chị, em là sinh viên đi lạc, điện thoại hết pin từ trưa rồi ạ.',
  'Em đi bộ từ chiều tới giờ, chân mỏi muốn rụng luôn chị ơi.',
  'Cái clip chị đăng hôm qua quay góc đẹp thật đó, em coi hoài.',
  'Chị cho em hỏi bến xe giờ này còn mở không ạ?',
  'Em hứa em không phải người xấu đâu, em chỉ cần hỏi đường thôi.',
  'Bạn em ở đâu quanh đây mà gọi hoài không bắt máy.',
  'Trận tối nay hay dữ luôn, chị có coi hiệp hai không?',
  'Nhà ai nấu gì thơm quá trời, em đói muốn xỉu.',
  'Mai em gửi lại chị được không ạ, giờ em chỉ xin ngồi nhờ chút thôi.',
  'Dạ vậy em phải nói sao chị mới tin em ạ?'
];

async function langTest(lang, lines) {
  const rows = [];
  for (const npc of ['gen_z', 'sinh_vien']) {
    const history = [{ role: 'npc', text: GREET[npc] }];
    const state = { ...START };
    for (let i = 0; i < lines.length; i++) {
      history.push({ role: 'player', text: lines[i] });   // v2.3: giống hệt máy khách thật
      const j = await say({
        npcId: npc, lang, mode: 'ma_soi', night: 1, turn: i + 1,
        session: 'v2live_lang_' + lang + '_' + npc,
        playerText: lines[i], history: history.slice(-16), state,
        outfit: lang === 'en' ? 'ordinary clothes, a bit rumpled' : 'quần áo bình thường, hơi nhàu'
      });
      if (!j || !j.npc) { rows.push({ npc, lượt: i + 1, 'trả lời': 'LỖI', đúng: false }); continue; }
      history.push({ role: 'npc', text: j.npc.dialogue });
      // cho điểm nhích lên như trong game thật, để lượt sau không nói chuyện trong chân không
      const v = { danh_trung: 16, hop_ly: 10, thuong: 0, kha_nghi: 0, lo_lieu: -8 }[j.npc.verdict] || 0;
      state.trust = Math.max(0, Math.min(100, state.trust + v));
      const got = guessLang(j.npc.dialogue);
      rows.push({ npc, lượt: i + 1, 'não': j.brain || 'kịch bản',
        'trả lời': (got || '?'), 'đúng': got === lang,
        'thoại': j.npc.dialogue.slice(0, 60) });
      process.stdout.write(got === lang ? '.' : 'X');
    }
  }
  return rows;
}

// ══ chạy ═════════════════════════════════════════════════════════════════════
console.log('Đang đo trên ' + BASE + ' — mỗi dấu chấm là một lượt gọi thật.\n');

console.log('▶ SỐ ĐẬU 4 — lượt nói đầu tiên (18 lượt)');
const t1 = await turnOneTest();
console.log('\n');
console.table(t1);
const onTopic = t1.filter(r => r['trúng tim'] === 'CÓ');
const aiBland = onTopic.filter(r => r['AI chấm'] === 'thuong').length;
const realBland = onTopic.filter(r => r['người chơi nhận'] === 'thuong').length;
console.log(`   Câu TRÚNG TIM: ${onTopic.length} câu · AI tự chấm "nhạt" ${aiBland} · NGƯỜI CHƠI thật sự nhận "nhạt" ${realBland}`);
console.log(`   → SỐ ĐẬU 4 ${realBland === 0 ? '✅ ĐẠT' : '❌ TRƯỢT'} (mốc: 0 câu trúng tim bị chấm nhạt)\n`);

console.log('▶ SỐ ĐẬU 7 — tuân lệnh ngôn ngữ, 20 lượt tiếng Anh + 20 lượt tiếng Việt');
const en = await langTest('en', EN_LINES);
const vi = await langTest('vi', VI_LINES);
console.log('\n');
const rate = (rows) => {
  const done = rows.filter(r => r['trả lời'] !== 'LỖI' && r['trả lời'] !== '?');
  const ok = done.filter(r => r['đúng']).length;
  return { ok, total: done.length, pct: done.length ? Math.round(ok * 1000 / done.length) / 10 : 0 };
};
const rEn = rate(en), rVi = rate(vi);
console.table([
  { 'người chơi chọn': '🇬🇧 English', 'đúng tiếng': rEn.ok + '/' + rEn.total, 'tỉ lệ': rEn.pct + '%', 'mốc đạt': '95%', 'kết quả': rEn.pct >= 95 ? '✅' : '❌' },
  { 'người chơi chọn': '🇻🇳 Tiếng Việt', 'đúng tiếng': rVi.ok + '/' + rVi.total, 'tỉ lệ': rVi.pct + '%', 'mốc đạt': '95%', 'kết quả': rVi.pct >= 95 ? '✅' : '❌' }
]);
const sai = en.filter(r => !r['đúng'] && r['thoại']);
if (sai.length) {
  console.log('\n   Câu trả lời SAI tiếng (bản tiếng Anh):');
  sai.forEach(r => console.log(`   · [${r['não']}] ${r['thoại']}`));
}

const brains = {};
[...t1, ...en, ...vi].forEach(r => { const b = r['não']; if (b) brains[b] = (brains[b] || 0) + 1; });
console.log('\n▶ SỐ ĐẬU 2 — não nào thật sự trả lời:', JSON.stringify(brains));

const out = { base: BASE, runId: RUN, turnOne: t1, en, vi,
  passes: { so4: realBland === 0, so7_en: rEn.pct >= 95, so7_vi: rVi.pct >= 95 }, brains };
fs.writeFileSync(path.join(HERE, 'v2-live-out.json'), JSON.stringify(out, null, 1));
console.log('\nĐã lưu chi tiết vào tools/v2-live-out.json · mã lượt chạy: ' + RUN);
