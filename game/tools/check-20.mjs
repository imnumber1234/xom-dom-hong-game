// v0.7 T5 — BÀI KIỂM 20 MỤC trên bản đã deploy.
// 3 nhân vật × 2 chế độ × VN/EN = 12 cuộc nói chuyện thật + 8 mục luật.
// Chốt trước khi chạy (plan-v0.7 §6): lượt 6 >= 3 dấu hiệu · trôi xưng hô 0/3 · giám khảo mù >= 8/9.
//
// Chạy:  node game/tools/check-20.mjs [BASE_URL]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadApi } from './load-api.mjs';
import { runAll, markerCount, pronounDrift, blindId, initMarkers, maxCopyRun, NPCS, BASE } from './voice-score.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { PERSONAS, pickVoiceLines } = await loadApi();
initMarkers(PERSONAS);
const SHEET = fs.readFileSync(path.resolve(HERE, '../../voice-sheet-lucas.md'), 'utf8');

const checks = [];
const add = (id, what, pass, evidence) => checks.push({ id, what, pass: !!pass, evidence: String(evidence).slice(0, 220) });

console.log(`BÀI KIỂM 20 MỤC — ${BASE}\n`);
const runs = await runAll();
const R = (npcId, mode, lang) => runs.find(r => r.npcId === npcId && r.mode === mode && r.lang === lang);

// ── 1-12: mỗi cuộc nói chuyện, lượt 6 phải còn >= 3 dấu hiệu giọng riêng ──────
let i = 1;
for (const n of NPCS) for (const mode of ['ma_soi', 'ket_tien']) for (const lang of ['vi', 'en']) {
  const r = R(n.id, mode, lang);
  const ok = r && !r.error && r.lines.length === 6;
  const m6 = ok ? markerCount(n.id, lang, r.lines[5]) : 0;
  const m1 = ok ? markerCount(n.id, lang, r.lines[0]) : 0;
  add(i++, `${n.name} · ${mode} · ${lang}: lượt 6 còn >= 3 dấu hiệu giọng`, ok && m6 >= 3,
    ok ? `lượt1=${m1} lượt6=${m6} · não=${r.brains[5]} · "${r.lines[5].replace(/\n/g, ' ').slice(0, 90)}"` : (r?.error || 'không chạy được'));
}

// ── 13-15: trôi xưng hô = 0 cho từng nhân vật (tiếng Việt, cả 2 chế độ) ───────
for (const n of NPCS) {
  const rs = ['ma_soi', 'ket_tien'].map(m => R(n.id, m, 'vi')).filter(r => r && r.lines.length === 6);
  const ds = rs.map(r => pronounDrift(n.id, r.lines));
  add(i++, `${n.name}: không trôi xưng hô sau 6 lượt (VN, 2 chế độ)`,
    rs.length === 2 && ds.every(d => !d.drift),
    ds.map((d, k) => `${rs[k].mode}: lượt1=${d.keptStart ? 'đúng' : 'không'} lượt6=${d.keptEnd ? 'đúng' : 'không'} xưnglạ=${d.foreign}`).join(' · '));
}

// ── 16: giám khảo mù >= 8/9 ──────────────────────────────────────────────────
const bid = await blindId(runs);
add(i++, 'Giám khảo mù đoán đúng người nói >= 8/9', bid.correct >= 8 && bid.total === 9,
  `${bid.correct}/${bid.total}` + (bid.misses.length ? ' · trượt: ' + bid.misses.map(m => m.who + '→' + m.guess).join(', ') : ''));

// ── 17: chọn câu mẫu là HASH, không random — chơi lại giống hệt ───────────────
{
  const p = PERSONAS.gen_z;
  const a1 = pickVoiceLines(p, 'vi', 3, 777), a2 = pickVoiceLines(p, 'vi', 3, 777);
  const b = pickVoiceLines(p, 'vi', 4, 777);
  const same = JSON.stringify(a1) === JSON.stringify(a2);
  const rotates = JSON.stringify(a1) !== JSON.stringify(b);
  // đúng 2 câu, không trùng nhau, ở mọi lượt 1..12 và mọi nhân vật
  let shape = true;
  for (const id of Object.keys(PERSONAS)) for (const lang of ['vi', 'en']) for (let t = 1; t <= 12; t++) {
    const L = pickVoiceLines(PERSONAS[id], lang, t, 12345);
    if (L.length !== 2 || L[0] === L[1]) shape = false;
  }
  add(i++, 'Câu mẫu chọn theo hash (lượt+seed): lặp lại giống hệt, đổi theo lượt, luôn đúng 2 câu khác nhau',
    same && rotates && shape, `giống-khi-lặp=${same} đổi-theo-lượt=${rotates} đúng-2-câu-khác-nhau=${shape}`);
}

// ── 18: câu mẫu trong code y NGUYÊN VĂN sổ giọng của Lucas ────────────────────
{
  const missing = [];
  for (const id of Object.keys(PERSONAS)) {
    for (const l of PERSONAS[id].voice) if (!SHEET.includes(l)) missing.push(`VN/${id}: ${l.slice(0, 40)}`);
    for (const l of PERSONAS[id].voice_en) if (!SHEET.includes(l)) missing.push(`EN/${id}: ${l.slice(0, 40)}`);
    if (!SHEET.includes(PERSONAS[id].tic)) missing.push(`TIC/${id}`);
  }
  add(i++, 'Cả 36 câu mẫu + 3 dòng tic khớp NGUYÊN VĂN voice-sheet-lucas.md (không tự sửa lời Lucas)',
    missing.length === 0, missing.length ? missing.join(' | ') : '36/36 câu + 3 tic khớp nguyên văn');
}

// ── 19: câu EN là câu viết bằng tiếng Anh trong sổ, KHÔNG phải dịch máy câu VN ─
{
  // Lấy đúng khối bảng "Câu mẫu EN" trong sổ giọng và so từng dòng theo đúng thứ tự.
  const enBlocks = [...SHEET.matchAll(/\|\s*#\s*\|\s*Câu mẫu EN\s*\|\r?\n\|[^\n]*\|\r?\n((?:\|[^\n]*\|\r?\n)+)/g)]
    .map(m => m[1].trim().split(/\r?\n/).map(row => row.split('|')[2].trim()));
  const order = ['me_bim_sua', 'sinh_vien', 'gen_z'];
  let ok = enBlocks.length === 3;
  const diff = [];
  if (ok) order.forEach((id, k) => {
    const want = enBlocks[k], got = PERSONAS[id].voice_en;
    if (want.length !== 6 || want.some((w, j) => w !== got[j])) { ok = false; diff.push(id); }
  });
  add(i++, 'voice_en = đúng 6 câu EN Lucas viết trong sổ, đúng thứ tự (không phải bản dịch máy của câu VN)',
    ok, ok ? '3 nhân vật × 6 câu EN khớp đúng thứ tự' : ('lệch: ' + (diff.join(', ') || 'không đọc được bảng EN')));
}

// ── 20: chế độ VN không lẫn tiếng Anh (Cô Sáu + Tí) · chế độ EN trả lời tiếng Anh ─
{
  const EN_WORD = /\b(hello|okay|sorry|please|thanks|really|actually|honestly|deadline|content|drama|vibe|trend|slay|cringe|flex|wait|stop|yes|no problem)\b/i;
  const VI_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  const bad = [];
  for (const id of ['me_bim_sua', 'sinh_vien']) for (const mode of ['ma_soi', 'ket_tien']) {
    const r = R(id, mode, 'vi'); if (!r || !r.lines.length) continue;
    r.lines.forEach((l, k) => { if (EN_WORD.test(l)) bad.push(`${id}/${mode} lượt${k + 1} lẫn EN`); if (!VI_DAU.test(l)) bad.push(`${id}/${mode} lượt${k + 1} thiếu dấu`); });
  }
  for (const id of Object.keys(PERSONAS)) for (const mode of ['ma_soi', 'ket_tien']) {
    const r = R(id, mode, 'en'); if (!r || !r.lines.length) continue;
    // bản EN mà cả câu toàn dấu tiếng Việt = trả lời nhầm ngôn ngữ
    r.lines.forEach((l, k) => { if ((l.match(VI_DAU) || []).length && /[àáảãạêôơư]{1}/i.test(l) && l.split(' ').filter(w => VI_DAU.test(w)).length > 3) bad.push(`${id}/${mode} EN lượt${k + 1} trả lời tiếng Việt`); });
  }
  add(i++, 'VN: Cô Sáu + Tí không lẫn tiếng Anh và đủ dấu · EN: không trả lời nhầm tiếng Việt',
    bad.length === 0, bad.length ? bad.slice(0, 6).join(' | ') : '48 lượt VN + 36 lượt EN sạch');
}

// ── in bảng ──────────────────────────────────────────────────────────────────
console.table(checks.map(c => ({ '#': c.id, 'mục': c.what, 'đạt': c.pass ? '✅' : '❌', 'bằng chứng': c.evidence.slice(0, 80) })));
const passed = checks.filter(c => c.pass).length;
console.log(`\n>>> ${passed}/${checks.length} ĐẠT` + (passed === checks.length ? ' — đủ điều kiện đẩy lên link chính' : ' — DỪNG Ở PREVIEW'));
for (const c of checks.filter(c => !c.pass)) console.log(`  ❌ #${c.id} ${c.what}\n     ${c.evidence}`);

// chi phí thêm mỗi lượt: system phải còn nằm trong bộ nhớ đệm → token vào mỗi lượt phải nhỏ
const ins = runs.flatMap(r => (r.usage || []).filter(Boolean).map(u => u.in)).filter(n => typeof n === 'number');
if (ins.length) console.log(`\nToken VÀO mỗi lượt (phần chưa nằm trong bộ nhớ đệm): nhỏ nhất ${Math.min(...ins)} · lớn nhất ${Math.max(...ins)} · trung bình ${Math.round(ins.reduce((a, b) => a + b, 0) / ins.length)}`);

fs.writeFileSync(path.join(HERE, 'check-20-out.json'), JSON.stringify({ base: BASE, at: new Date().toISOString(), checks, passed, total: checks.length, runs }, null, 2));
process.exitCode = passed === checks.length ? 0 : 1;
