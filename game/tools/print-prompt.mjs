// v0.7 T2/T3 — IN RA LỜI DẶN THẬT gửi cho AI (không gọi mạng, không tốn tiền).
// Chặn lệnh gọi ra ngoài, lấy đúng gói tin converse.js định gửi rồi in ra.
// Dùng để mắt thường thấy: đúng 2 câu mẫu, đổi theo lượt, dòng tic nằm SÁT CUỐI phần system,
// và từ lượt 4 có dòng nhắc giọng.
//
// Chạy:  node game/tools/print-prompt.mjs [npcId] [lang] [mode]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(HERE, '../functions/api');
const tmp = path.join(HERE, '.tmp');
fs.mkdirSync(tmp, { recursive: true });
for (const f of ['_personas.js', 'converse.js']) {
  fs.writeFileSync(path.join(tmp, f.replace(/\.js$/, '.mjs')),
    fs.readFileSync(path.join(src, f), 'utf8').replaceAll("'./_personas.js'", "'./_personas.mjs'"));
}
const { onRequestPost } = await import(pathToFileURL(path.join(tmp, 'converse.mjs')).href);

const npcId = process.argv[2] || 'me_bim_sua';
const lang = process.argv[3] || 'vi';
const mode = process.argv[4] || 'ma_soi';

let captured = null;
globalThis.fetch = async (_url, init) => {
  captured = JSON.parse(init.body);
  return { ok: false, status: 599, text: async () => 'chặn bởi print-prompt' };
};

function historyOfLength(turns) {
  // giống hệt client thật: lịch sử KẾT THÚC bằng câu người chơi vừa nói
  const h = [{ role: 'npc', text: '(lời chào)' }];
  for (let t = 1; t < turns; t++) { h.push({ role: 'player', text: `câu người chơi ${t}` }, { role: 'npc', text: `câu hàng xóm ${t}` }); }
  h.push({ role: 'player', text: 'em ở trọ cuối hẻm, em mới dọn tới tháng trước' });
  return h;
}

for (const turn of [1, 3, 4, 6]) {
  captured = null;
  await onRequestPost({
    env: { ANTHROPIC_API_KEY: 'fake-để-dựng-gói-tin' },
    request: {
      json: async () => ({
        npcId, lang, mode, seed: 777,
        playerText: 'em ở trọ cuối hẻm, em mới dọn tới tháng trước',
        outfit: 'áo thun trắng, ba lô sinh viên',
        state: { trust: 40, suspicion: 25, interest: 55, patience: 80 },
        history: historyOfLength(turn),
        ...(mode === 'ket_tien' ? { hour: 16, hourText: '4 giờ chiều', timeHint: 'chiều muộn' } : {})
      })
    }
  });
  const sys = captured.system[0].text;
  const lastUser = captured.messages[captured.messages.length - 1].content;
  console.log(`\n${'═'.repeat(78)}\nLƯỢT ${turn} — ${npcId} · ${lang} · ${mode}\n${'═'.repeat(78)}`);
  console.log('— ĐUÔI PHẦN SYSTEM (600 chữ cuối, dòng tic phải nằm ở đây) —');
  console.log(sys.slice(-600));
  console.log('\n— TIN NHẮN CUỐI (2 câu mẫu + nhắc giọng nằm ở cuối) —');
  console.log(lastUser.split('\n').filter(l => l.startsWith('[Nhại giọng') || l.startsWith('[Voice reference') || l.startsWith('·') || l.startsWith('[Nhắc giọng') || l.startsWith('[Voice re-anchor')).join('\n') || '(không có)');
}
