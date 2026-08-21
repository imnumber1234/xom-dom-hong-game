// listen-check.mjs — v2.3. ĐO ĐÚNG MỘT CHUYỆN: nhân vật có THẬT SỰ NGHE câu người chơi vừa nói,
// hay chỉ lải nhải tiếp chuyện của mình?
//
// Lucas bắt lỗi 21/08: nói "I can buy you coffee" với Cô Sáu, cô đáp lại bằng gần y nguyên câu
// cũ về bé Bin khóc từ 3 giờ chiều — không hề nhắc tới cà phê, không hề đáp lại lời đề nghị.
//
// Ba thước đo, mỗi lượt:
//   1. CÓ NHẮC LẠI KHÔNG — câu trả lời có chứa từ khoá của câu người chơi vừa nói không.
//   2. CÓ LẶP MỞ ĐẦU KHÔNG — mấy chữ đầu có trùng với lượt trước không (bệnh "Oh my goodness —").
//   3. CÓ ĐỔI CHỦ ĐỀ KHÔNG — hay lượt nào cũng quay về đúng một chuyện.
//
//   node tools/listen-check.mjs [BASE_URL]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.argv[2] || 'https://hop-kinh.xom-dom-hong.pages.dev').replace(/\/$/, '');
const RUN = 'listen_' + Date.now().toString(36);

const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const words = (s) => norm(s).split(' ').filter(Boolean);
const opening = (s, n = 6) => words(s).slice(0, n).join(' ');

// từ "nội dung" của câu người chơi — bỏ mấy từ chức năng, giữ thứ đáng được đáp lại
const STOP = new Set(['i', 'you', 'can', 'a', 'the', 'to', 'me', 'my', 'is', 'am', 'are', 'it',
  'and', 'for', 'of', 'do', 'if', 'want', 'will', 'would', 'let', 'em', 'anh', 'chị', 'cô', 'là',
  'có', 'không', 'được', 'cho', 'với', 'nhé', 'ạ', 'dạ', 'này', 'thì', 'mà', 'ở', 'con', 'tôi']);
const contentWords = (s) => words(s).filter(w => w.length > 2 && !STOP.has(w));

async function say(body, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + '/api/converse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ debug: true, runId: RUN }, body))
      });
      const j = await r.json();
      if (j && j.ok) return j;
    } catch { /* thử lại */ }
    await new Promise(res => setTimeout(res, 900 * (i + 1)));
  }
  return null;
}

// Kịch bản mô phỏng ĐÚNG cảnh Lucas gặp: nói mấy câu chẳng liên quan gì tới chuyện của cô,
// xem cô có chịu đáp lại không hay cứ kéo về bé Bin.
const SCRIPTS = {
  me_bim_sua: {
    greet: 'Oh?? Who is that at this hour? Speak up, my hearing is not what it was.',
    lines: [
      'Good evening. I am a delivery driver, I have a package for house number 12.',
      'I can buy you a coffee if you want, there is a place still open down the road.',
      'By the way, do you know if the bus station is still running at this hour?',
      'My phone died at noon so I have been walking. Do you have a charger I could borrow?',
      'Honestly the weather tonight is really nice, cool and quiet.',
      'What do you do for work, if you do not mind me asking?'
    ]
  },
  gen_z: {
    greet: 'Ugh, who knocks at midnight?',
    lines: [
      'Hi, sorry — I am a delivery driver, wrong address maybe.',
      'I can buy you a bubble tea if you want, the place near the bridge is open.',
      'Do you know if the bus station still runs this late?',
      'My phone died at noon, could I borrow a charger?',
      'The weather is actually really nice tonight.',
      'What do you do for work, if I may ask?'
    ]
  }
};

const rows = [];
for (const npc of Object.keys(SCRIPTS)) {
  const sc = SCRIPTS[npc];
  const history = [{ role: 'npc', text: sc.greet }];
  const state = { trust: 30, suspicion: 20, interest: 50, patience: 100 };
  let prevReply = '';
  for (let i = 0; i < sc.lines.length; i++) {
    const line = sc.lines[i];
    // Bắt chước ĐÚNG máy khách thật (convo.js): đẩy câu người chơi vào lịch sử TRƯỚC khi gọi.
    // Không làm vậy thì đo nhầm một đường code khác — bài học 21/08.
    history.push({ role: 'player', text: line });
    const j = await say({
      npcId: npc, lang: 'en', mode: 'ma_soi', night: 1, turn: i + 1,
      session: 'listen_' + npc, seed: 4242,
      playerText: line, history: history.slice(-16), state,
      outfit: 'ordinary clothes, a bit rumpled'
    });
    if (!j || !j.npc) { rows.push({ npc, 'lượt': i + 1, 'lỗi': 'KHÔNG GỌI ĐƯỢC' }); continue; }
    const reply = j.npc.dialogue;
    history.push({ role: 'npc', text: reply });
    const v = { danh_trung: 16, hop_ly: 10, thuong: 0, kha_nghi: 0, lo_lieu: -8 }[j.npc.verdict] || 0;
    state.trust = Math.max(0, Math.min(100, state.trust + v));
    state.interest = Math.max(0, Math.min(100, state.interest + (v > 0 ? 6 : -4)));

    const cw = contentWords(line);
    const rn = ' ' + norm(reply) + ' ';
    const echoed = cw.filter(w => rn.includes(' ' + w + ' '));
    const sameOpen = prevReply && opening(reply) === opening(prevReply);
    rows.push({
      npc, 'lượt': i + 1,
      'bạn nói': line.slice(0, 44) + '…',
      'nó có nhắc lại chữ nào': echoed.length ? echoed.slice(0, 3).join(',') : '❌ KHÔNG',
      'lặp mở đầu': sameOpen ? '❌ CÓ' : 'không',
      'não': j.brain || 'kịch bản',
      'thoại': reply.slice(0, 70)
    });
    prevReply = reply;
    process.stdout.write(echoed.length ? '.' : 'X');
  }
}
console.log('\n');
console.table(rows);
const real = rows.filter(r => r['nó có nhắc lại chữ nào']);
const deaf = real.filter(r => r['nó có nhắc lại chữ nào'] === '❌ KHÔNG').length;
const repeat = real.filter(r => r['lặp mở đầu'] === '❌ CÓ').length;
console.log(`\n>>> ${real.length - deaf}/${real.length} lượt CÓ đáp lại đúng thứ người chơi vừa nói` +
  `  ·  ${repeat} lượt lặp lại kiểu mở đầu cũ`);
fs.writeFileSync(path.join(HERE, 'listen-check-out.json'),
  JSON.stringify({ base: BASE, runId: RUN, deaf, repeat, total: real.length, rows }, null, 1));
