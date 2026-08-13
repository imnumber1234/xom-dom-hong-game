// v1.0 — KIỂM MÁY HỆ NHIỆM VỤ (phần server, chạy offline trong Node).
// Soát: mission_signal có mặt đủ 4 chỗ schema trong converse.js · cổng gateMission giữ cửa đúng ·
// câu chào kịch bản giữ hợp đồng JSON · khối nhiệm vụ trong _personas.js đủ dấu, đủ giai đoạn.
// Chạy:  node game/tools/mission-check.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadApi } from './load-api.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = (f) => fs.readFileSync(path.resolve(HERE, '../functions/api', f), 'utf8');
const converseSrc = SRC('converse.js');

const { onRequestPost } = await loadApi();
const tmp = path.join(HERE, '.tmp');
const converseMod = await import('file://' + path.join(tmp, 'converse.mjs').replace(/\\/g, '/'));
const personasMod = await import('file://' + path.join(tmp, '_personas.mjs').replace(/\\/g, '/'));
const { gateMission, gateMissionEx, isRepeatLine } = converseMod;
const { MISSION_BLOCKS, scriptedReply } = personasMod;

const checks = [];
const add = (id, what, pass, evidence = '') =>
  checks.push({ id, what, pass: !!pass, evidence: String(evidence).slice(0, 160) });

// helper — gọi thẳng onRequestPost như Cloudflare gọi
async function call(body, env = {}) {
  const req = { json: async () => body };
  const res = await onRequestPost({ request: req, env });
  return JSON.parse(await res.text());
}

// ── 1-4: mission_signal đủ 4 chỗ schema trong converse.js (rủi ro mục 7 của plan) ──
add(1, 'Chỗ 1/4 — NPC_TOOL.properties có mission_signal (enum đủ 5 tín hiệu + rỗng)',
  /mission_signal:\s*{\s*\n?\s*type: 'string',\s*\n?\s*enum: \['', 'manh_moi_1', 'manh_moi_2', 'ro_chuyen', 'dong_y_cho_muon', 'nhan_viec_vat'\]/.test(converseSrc));
add(2, 'Chỗ 2/4 — NPC_TOOL.required có mission_signal',
  /required: \['dialogue'[^\]]*'player_claim', 'mission_signal'\]/.test(converseSrc));
add(3, 'Chỗ 3/4 — REPLY_SCHEMA_NOTE (ghi chú cho não chỉ-biết-JSON) có mission_signal',
  converseSrc.match(/REPLY_SCHEMA_NOTE[\s\S]{0,2000}?mission_signal/) !== null);
add(4, 'Chỗ 4/4 — shapeReply kẹp mission_signal về danh sách hợp lệ (nhãn lạ → rỗng)',
  converseSrc.includes("mission_signal: MISSION_SIGNALS.includes(i.mission_signal) ? i.mission_signal : ''"));

// ── 5-11: cổng gateMission (chốt chặn lớp server — bài học "đồng ý mồm" 08-09) ──
const M = { id: 'ly_selfie', stage: 'chua_biet', clues: 0 };
const B = (npcId, stage, mode = 'ma_soi', clues = 0) => ({ npcId, mode, mission: { ...M, stage, clues } });
add(5, 'Ly quan tâm < 60 → ro_chuyen bị CHẶN (AI khai sớm cũng vô ích)',
  gateMission('ro_chuyen', B('gen_z', 'da_goi'), { interest: 40 }) === '');
add(6, 'Ly quan tâm >= 60 → manh mối đi qua ĐÚNG NHỊP + não lặp lại bị NẮN về manh mối kế tiếp',
  gateMission('manh_moi_1', B('gen_z', 'chua_biet'), { interest: 70 }) === 'manh_moi_1' &&
  gateMission('manh_moi_1', B('gen_z', 'da_goi', 'ma_soi', 1), { interest: 70 }) === 'manh_moi_2' &&
  gateMission('manh_moi_1', B('gen_z', 'da_goi', 'ma_soi', 2), { interest: 70 }) === 'ro_chuyen' &&
  gateMission('ro_chuyen', B('gen_z', 'da_goi', 'ma_soi', 2), { interest: 65 }) === 'ro_chuyen');
add(7, 'Manh mối từ nhà KHÔNG PHẢI Ly → chặn (Tí/Cô Sáu không được kể chuyện của Ly)',
  gateMission('manh_moi_1', B('sinh_vien', 'chua_biet'), { interest: 90 }) === '' &&
  gateMission('ro_chuyen', B('me_bim_sua', 'da_goi'), { interest: 90 }) === '');
add(8, 'Tí "đồng ý mồm" khi tin < 55 → CHẶN; tin >= 55 + đã nhận nhiệm vụ → cho qua',
  gateMission('dong_y_cho_muon', B('sinh_vien', 'da_nhan'), { trust: 40 }) === '' &&
  gateMission('dong_y_cho_muon', B('sinh_vien', 'da_nhan'), { trust: 70 }) === 'dong_y_cho_muon');
add(9, 'Tí cho mượn khi CHƯA nhận nhiệm vụ (hoặc đã có đồ) → chặn',
  gateMission('dong_y_cho_muon', B('sinh_vien', 'chua_biet'), { trust: 90 }) === '' &&
  gateMission('dong_y_cho_muon', B('sinh_vien', 'co_do'), { trust: 90 }) === '');
add(10, 'Việc vặt chỉ mở SAU khi nhận nhiệm vụ (da_nhan/co_do)',
  gateMission('nhan_viec_vat', B('me_bim_sua', 'chua_biet'), {}) === '' &&
  gateMission('nhan_viec_vat', B('me_bim_sua', 'da_nhan'), {}) === 'nhan_viec_vat' &&
  gateMission('nhan_viec_vat', B('me_bim_sua', 'xong'), {}) === '');
add(11, 'Mode Kẹt Tiền / không gửi mission → mọi tín hiệu bị chặn (Kẹt Tiền không đổi 1 dòng)',
  gateMission('ro_chuyen', B('gen_z', 'da_goi', 'ket_tien'), { interest: 90 }) === '' &&
  gateMission('nhan_viec_vat', { npcId: 'gen_z', mode: 'ma_soi', mission: null }, {}) === '');

// ── 12-14: hợp đồng JSON giữ nguyên ở mọi đường ra ──
{
  const g = await call({ npcId: 'gen_z', greet: true, seed: 7, lang: 'vi', mode: 'ma_soi' });
  add(12, 'Câu chào kịch bản (mọi nhà) trả mission_signal="" — hợp đồng JSON đồng nhất',
    g.ok && g.scripted && g.npc.mission_signal === '', JSON.stringify(g.npc).slice(0, 120));
}
{
  const g = await call({
    npcId: 'gen_z', greet: true, seed: 3, lang: 'vi', mode: 'ma_soi',
    mission: { id: 'ly_selfie', stage: 'da_nhan', clues: 3 }
  });
  add(13, 'Ly đổi dáng chờ: đã nhận nhiệm vụ mà quay lại → câu chào THAN THỞ về gậy selfie',
    g.ok && g.scripted && /gậy selfie/i.test(g.npc.dialogue) && g.npc.emotion === 'chan',
    (g.npc && g.npc.dialogue || '').slice(0, 100));
  const g2 = await call({
    npcId: 'gen_z', greet: true, seed: 3, lang: 'vi', mode: 'ket_tien',
    mission: { id: 'ly_selfie', stage: 'da_nhan', clues: 3 }
  });
  add(14, 'Kẹt Tiền KHÔNG dính câu chào nhiệm vụ (dù client có lỡ gửi mission)',
    g2.ok && !/gậy selfie/i.test(g2.npc.dialogue), (g2.npc && g2.npc.dialogue || '').slice(0, 100));
}
{
  const r = await call({
    npcId: 'gen_z', playerText: 'chào em, em đang làm gì đó?', seed: 1, lang: 'vi', mode: 'ma_soi',
    state: { trust: 30, suspicion: 20, interest: 50, patience: 100 }, history: []
  }, { FORCE_SCRIPTED: '1' });
  add(15, 'Não kịch bản (FORCE_SCRIPTED) trả mission_signal="" — không vỡ hợp đồng khi não chết',
    r.ok && r.scripted && r.npc.mission_signal === '', JSON.stringify(r.npc).slice(0, 120));
}

// ── 16-18: khối nhiệm vụ trong _personas.js ──
{
  const stages = ['chua_biet', 'da_goi', 'da_mo_popup', 'da_nhan', 'co_do', 'xong'];
  add(16, 'MISSION_BLOCKS: Ly đủ 6 giai đoạn + Tí có khối "đồ của tôi" + khối việc vặt',
    stages.every(s => typeof MISSION_BLOCKS.gen_z[s] === 'string' && MISSION_BLOCKS.gen_z[s].length > 40) &&
    typeof MISSION_BLOCKS.sinh_vien.da_nhan === 'string' && typeof MISSION_BLOCKS.chore === 'string');
  const VI_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  const all = [...stages.map(s => MISSION_BLOCKS.gen_z[s]), MISSION_BLOCKS.sinh_vien.da_nhan, MISSION_BLOCKS.chore];
  add(17, 'Mọi khối nhiệm vụ là tiếng Việt CÓ DẤU (luật cứng toàn workspace)',
    all.every(b => VI_DAU.test(b)));
  add(18, 'Khối Ly có chốt chặn chữ: ngưỡng quan tâm 60 + LUẬT CẤM (không nhắc gậy khi chưa đủ điều kiện)',
    />= 60/.test(MISSION_BLOCKS.gen_z.chua_biet) && /LUẬT CẤM/.test(MISSION_BLOCKS.gen_z.chua_biet) &&
    /KHÔNG nhắc "gậy selfie"/.test(MISSION_BLOCKS.gen_z.chua_biet) && /{NEXT}/.test(MISSION_BLOCKS.gen_z.chua_biet));
}

// ── 19-20: mối nối + kịch bản cũ ──
add(19, 'converse.js có chèn missionNote vào tin nhắn cuối (không đụng system — giữ bộ nhớ đệm)',
  converseSrc.includes('last.content += missionNote(body, mode)'));
add(20, 'scriptedReply (não kịch bản) khai mission_signal="" trong hợp đồng',
  JSON.stringify(scriptedReply('gen_z', 'xin chào', { trust: 30, suspicion: 20, patience: 100 }, 'MU')).includes('"mission_signal":""'));

// ── 21-24: v1.0.1 chống nhai lại câu + hộp kính (sau khi Lucas bắt lỗi 08-13) ──
add(21, 'Máy bắt lặp: trùng hệt / câu ngắn nằm trong câu dài → true; câu khác / quá ngắn → false',
  isRepeatLine('Thiếu… một món đồ để quay thôi á 😌', ['Thiếu... một món đồ để quay thôi á']) === true &&
  isRepeatLine('Thiếu một món đồ để quay thôi á, nói chung là vậy đó nha anh', ['Thiếu... một món đồ để quay thôi á 😌']) === true &&
  isRepeatLine('Ơ anh hỏi gì kỳ vậy, em đang bận mà', ['Thiếu... một món đồ để quay thôi á 😌']) === false &&
  isRepeatLine('Dạ', ['Dạ']) === false);
add(22, 'Hộp kính: cổng gác trả LÝ DO vì sao chặn (quan tâm thấp / đồng ý mồm)',
  /quan tâm 40 < 60/.test(gateMissionEx('ro_chuyen', B('gen_z', 'da_goi'), { interest: 40 }).why) &&
  /đồng ý mồm/.test(gateMissionEx('dong_y_cho_muon', B('sinh_vien', 'da_nhan'), { trust: 40 }).why));
add(23, 'Chống lặp 2 lớp trong prompt: bảng "CÂU BẠN ĐÃ NÓI" ở cuối + phát hiện người chơi hỏi lại',
  converseSrc.includes('CÂU BẠN ĐÃ NÓI') && converseSrc.includes('vừa HỎI LẠI gần y nguyên câu cũ') &&
  converseSrc.includes('isRepeatLine(playerText, prevPlayer)'));
add(24, 'Núm phạt-lặp bật cho não thoại (presence_penalty 1.0, viết lại 1.2) + Ly có luật chấm hỏi-han',
  converseSrc.includes('presencePenalty: 1.0') && converseSrc.includes('presencePenalty: 1.2') &&
  /HỎI HAN quan tâm/.test(MISSION_BLOCKS.gen_z.chua_biet));

add(25, 'Ấm dần + chống câu rỗng: server báo mission_probe khi kẹt cổng quan tâm · câu "…" bị bắt viết lại',
  converseSrc.includes('shaped.npc.mission_probe = true') && converseSrc.includes('tooBlank') &&
  fs.readFileSync(path.resolve(HERE, '../public/js/missions.js'), 'utf8').includes('function onProbe'));

// ── in bảng ──
console.table(checks.map(c => ({ '#': c.id, 'mục': c.what.slice(0, 70), 'đạt': c.pass ? '✅' : '❌' })));
const passed = checks.filter(c => c.pass).length;
console.log(`\n>>> ${passed}/${checks.length} ĐẠT`);
for (const c of checks.filter(c => !c.pass)) console.log(`  ❌ #${c.id} ${c.what}\n     ${c.evidence}`);
fs.writeFileSync(path.join(HERE, 'mission-check-out.json'),
  JSON.stringify({ at: new Date().toISOString(), checks, passed, total: checks.length }, null, 2));
process.exitCode = passed === checks.length ? 0 : 1;
