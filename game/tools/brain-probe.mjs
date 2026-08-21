// brain-probe.mjs — v2.0. Gọi TỪNG não một, in NGUYÊN VĂN lỗi.
//
// Vì sao cần: sổ đen chỉ giữ 80 chữ đầu của mỗi lỗi (đủ để thấy "có hỏng", không đủ để biết
// "hỏng vì cái gì"). Tệp này chạy trên máy mình, dùng khoá thật trong .dev.vars, và in đủ.
//
//   node tools/brain-probe.mjs            → thử cả 4 não
//   node tools/brain-probe.mjs gemini     → chỉ một não
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(HERE, '../functions/api');
const tmp = path.join(HERE, '.tmp');
fs.mkdirSync(tmp, { recursive: true });
for (const f of ['_personas.js', '_brain.js', '_ledger.js', 'converse.js']) {
  fs.writeFileSync(path.join(tmp, f.replace(/\.js$/, '.mjs')),
    fs.readFileSync(path.join(src, f), 'utf8')
      .replaceAll("'./_personas.js'", "'./_personas.mjs'")
      .replaceAll("'./_ledger.js'", "'./_ledger.mjs'")
      .replaceAll("'./_brain.js'", "'./_brain.mjs'"));
}
const brain = await import(pathToFileURL(path.join(tmp, '_brain.mjs')).href);

// khoá thật nằm ở game/.dev.vars — không bao giờ vào kho
const env = {};
for (const line of fs.readFileSync(path.resolve(HERE, '../.dev.vars'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const TOOL = {
  name: 'npc_reply',
  description: 'Phản ứng của nhân vật cho lượt này. Luôn dùng tool này.',
  input_schema: {
    type: 'object',
    properties: {
      dialogue: { type: 'string', description: 'Lời thoại 1–3 câu, tiếng Việt đủ dấu.' },
      verdict: { type: 'string', enum: ['lo_lieu', 'kha_nghi', 'thuong', 'hop_ly', 'danh_trung'], description: 'Chấm lời người lạ.' },
      mission_signal: {
        type: 'string',
        enum: ['', 'manh_moi_1', 'manh_moi_2', 'ro_chuyen', 'dong_y_cho_muon', 'nhan_viec_vat'],
        description: 'Tín hiệu nhiệm vụ, mặc định rỗng.'
      }
    },
    required: ['dialogue', 'verdict', 'mission_signal']
  }
};

const only = process.argv[2];
const names = only ? [only] : brain.CHAIN.map(p => p.name);
for (const name of names) {
  const p = brain.CHAIN.find(x => x.name === name);
  if (!p) { console.log(`?? không có não tên "${name}"`); continue; }
  if (!p.hasKey(env)) { console.log(`— ${name}: CHƯA CẮM KHOÁ`); continue; }
  const t0 = Date.now();
  try {
    const res = await p.call(env, {
      system: 'Bạn đóng vai Ly, cô gái Gen Z làm TikTok ở một xóm nhỏ Việt Nam. Viết tiếng Việt có dấu.',
      messages: [{ role: 'user', content: 'Ê Ly, clip trend hôm qua của em quay góc đẹp dữ.' }],
      tool: TOOL,
      schemaNote: '\n\nTRẢ LỜI: chỉ một JSON {"dialogue":"…","verdict":"…","mission_signal":""}',
      maxTokens: 300, temperature: 0.7, timeoutMs: 20000
    });
    console.log(`✅ ${name} — ${Date.now() - t0} ms · ${JSON.stringify(res.input || res.text).slice(0, 200)}`);
  } catch (e) {
    console.log(`❌ ${name} — ${Date.now() - t0} ms`);
    console.log('   ' + String(e && e.message || e).replace(/\n/g, '\n   ').slice(0, 1600));
  }
}
