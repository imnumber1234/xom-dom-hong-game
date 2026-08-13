// Nạp ĐÚNG file nguồn đang chạy thật (functions/api/*.js) vào Node để kiểm tra.
// Lý do phải chép ra .tmp: file nguồn đuôi .js nhưng viết theo chuẩn module của Cloudflare;
// Node chỉ chịu đọc kiểu đó khi đuôi là .mjs. Chép nguyên văn, chỉ đổi đuôi — không sửa code.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function loadApi() {
  const src = path.resolve(HERE, '../functions/api');
  const tmp = path.join(HERE, '.tmp');
  fs.mkdirSync(tmp, { recursive: true });
  for (const f of ['_personas.js', '_brain.js', 'converse.js']) {
    const code = fs.readFileSync(path.join(src, f), 'utf8')
      .replaceAll("'./_personas.js'", "'./_personas.mjs'")
      .replaceAll("'./_brain.js'", "'./_brain.mjs'");
    fs.writeFileSync(path.join(tmp, f.replace(/\.js$/, '.mjs')), code);
  }
  const personas = await import(pathToFileURL(path.join(tmp, '_personas.mjs')).href);
  const brain = await import(pathToFileURL(path.join(tmp, '_brain.mjs')).href);
  const converse = await import(pathToFileURL(path.join(tmp, 'converse.mjs')).href);
  // v0.8: trả thêm chính hàm onRequestPost + chuỗi não, để chạy được cả ván NGAY TRONG NODE
  // (không cần deploy) — đó là cách duy nhất chạy bài kiểm "giết từng não" mà không đụng khoá thật.
  return {
    PERSONAS: personas.PERSONAS,
    pickVoiceLines: converse.pickVoiceLines,
    onRequestPost: converse.onRequestPost,
    CHAIN: brain.CHAIN, clearBench: brain.clearBench, benchState: brain.benchState
  };
}
