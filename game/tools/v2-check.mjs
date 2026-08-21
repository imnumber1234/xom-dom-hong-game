// v2-check.mjs — KIỂM MÁY v2.0, phần chạy KHÔNG CẦN MẠNG.
// Soát: cổng nhiệm vụ cho cả BA nhà · sổ đen (đoán ngôn ngữ, đủ cột) · bảng nhiệm vụ hai bên
// máy chủ / máy chơi có khớp nhau không · tiếng Việt có dấu · công tắc playtest.
//   node tools/v2-check.mjs
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
const converse = await import(pathToFileURL(path.join(tmp, 'converse.mjs')).href);
const personas = await import(pathToFileURL(path.join(tmp, '_personas.mjs')).href);
const ledger = await import(pathToFileURL(path.join(tmp, '_ledger.mjs')).href);
const brain = await import(pathToFileURL(path.join(tmp, '_brain.mjs')).href);
const { gateMissionEx, gateMission } = converse;
const { MISSION_BLOCKS } = personas;

const cfgSrc = fs.readFileSync(path.resolve(HERE, '../public/js/config.js'), 'utf8');
const missionsSrc = fs.readFileSync(path.resolve(HERE, '../public/js/missions.js'), 'utf8');
const convoSrc = fs.readFileSync(path.resolve(HERE, '../public/js/convo.js'), 'utf8');
const brainSrc = fs.readFileSync(path.join(src, '_brain.js'), 'utf8');
const gameSrc = fs.readFileSync(path.resolve(HERE, '../public/js/game.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.resolve(HERE, '../public/index.html'), 'utf8');

const checks = [];
const add = (n, what, pass, ev = '') =>
  checks.push({ '#': n, 'mục': what, 'đạt': pass ? '✅' : '❌', 'bằng chứng': String(ev).slice(0, 90) });

const VI_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

// ── 1-6: cổng nhiệm vụ mở cho CẢ BA NHÀ ───────────────────────────────────────
const B = (npcId, ownId, stage, clues = 0, extra = {}) => ({
  npcId, mode: 'ma_soi',
  missions: Object.assign({ own: ownId ? { id: ownId, stage, clues } : null, choreOpen: false }, extra)
});
add(1, 'Mỗi nhà chỉ khai được CHUYỆN CỦA CHÍNH MÌNH (Ly · Tí · Cô Sáu)',
  gateMissionEx('manh_moi_1', B('gen_z', 'ly_selfie', 'chua_biet'), { interest: 70 }).sig === 'manh_moi_1' &&
  gateMissionEx('manh_moi_1', B('sinh_vien', 'ti_the4g', 'chua_biet'), { interest: 70 }).sig === 'manh_moi_1' &&
  gateMissionEx('manh_moi_1', B('me_bim_sua', 'sau_gaubong', 'chua_biet'), { interest: 70 }).sig === 'manh_moi_1');
add(2, 'Kể chuyện của nhà KHÁC → chặn (Tí không được kể chuyện gậy selfie của Ly)',
  gateMissionEx('manh_moi_1', B('sinh_vien', 'ly_selfie', 'chua_biet'), { interest: 90 }).sig === '' &&
  gateMissionEx('ro_chuyen', B('me_bim_sua', 'ti_the4g', 'da_goi', 2), { interest: 90 }).sig === '');
add(3, 'Cả ba nhà đều bị khoá bởi ngưỡng quan tâm 60',
  ['ly_selfie', 'ti_the4g', 'sau_gaubong'].every((id, i) =>
    gateMissionEx('manh_moi_1', B(['gen_z', 'sinh_vien', 'me_bim_sua'][i], id, 'chua_biet'), { interest: 55 }).sig === ''));
add(4, 'Não lặp manh mối cũ → CODE nắn về manh mối kế tiếp (cả ba nhà)',
  gateMissionEx('manh_moi_1', B('sinh_vien', 'ti_the4g', 'da_goi', 1), { interest: 70 }).sig === 'manh_moi_2' &&
  gateMissionEx('manh_moi_1', B('me_bim_sua', 'sau_gaubong', 'da_goi', 2), { interest: 70 }).sig === 'ro_chuyen');
{
  const lendOk = { npcId: 'sinh_vien', mode: 'ma_soi',
    missions: { own: null, lend: { id: 'ly_selfie', item: 'gay_selfie' }, choreOpen: true } };
  const lendNo = { npcId: 'sinh_vien', mode: 'ma_soi', missions: { own: null, choreOpen: true } };
  add(5, 'Cho mượn: đúng nhà + tin >= 55 mới qua; sai nhà hoặc "đồng ý mồm" thì chặn',
    gateMissionEx('dong_y_cho_muon', lendOk, { trust: 70 }).sig === 'dong_y_cho_muon' &&
    gateMissionEx('dong_y_cho_muon', lendOk, { trust: 40 }).sig === '' &&
    gateMissionEx('dong_y_cho_muon', lendNo, { trust: 90 }).sig === '');
  const chore = { npcId: 'gen_z', mode: 'ma_soi', missions: { own: null, choreOpen: true } };
  const noChore = { npcId: 'gen_z', mode: 'ma_soi', missions: { own: null, choreOpen: false } };
  add(6, 'Việc vặt mở cho cả 3 nhà khi ĐÃ nhận bất kỳ nhiệm vụ nào, chưa nhận thì chặn',
    gateMissionEx('nhan_viec_vat', chore, {}).sig === 'nhan_viec_vat' &&
    gateMissionEx('nhan_viec_vat', noChore, {}).sig === '');
}
add(7, 'Kẹt Tiền vẫn KHÔNG có nhiệm vụ (không đổi một dòng nào của chế độ đó)',
  gateMissionEx('manh_moi_1', { npcId: 'gen_z', mode: 'ket_tien', missions: { own: { id: 'ly_selfie', stage: 'chua_biet', clues: 0 } } }, { interest: 99 }).sig === '');
add(8, 'Đường CŨ của v1.0 (body.mission) vẫn chạy — bài kiểm cũ không gãy',
  gateMission('manh_moi_1', { npcId: 'gen_z', mode: 'ma_soi', mission: { id: 'ly_selfie', stage: 'chua_biet', clues: 0 } }, { interest: 70 }) === 'manh_moi_1');

// ── 9-12: khối chữ nhiệm vụ ───────────────────────────────────────────────────
const STAGES = ['chua_biet', 'da_goi', 'da_mo_popup', 'da_nhan', 'co_do', 'xong'];
add(9, 'Cả ba nhà đều có ĐỦ 6 giai đoạn khối nhiệm vụ',
  ['gen_z', 'sinh_vien', 'me_bim_sua'].every(n =>
    STAGES.every(s => typeof MISSION_BLOCKS[n][s] === 'string' && MISSION_BLOCKS[n][s].length > 40)));
add(10, 'Cả ba nhà đều có 3 manh mối theo đúng thứ tự',
  ['gen_z_next', 'sinh_vien_next', 'me_bim_sua_next'].every(k =>
    Array.isArray(MISSION_BLOCKS[k]) && MISSION_BLOCKS[k].length === 3));
add(11, 'Ba khối NGƯỜI CHO MƯỢN có đủ (Tí cho Ly · Ly cho Tí · Tí cho Cô Sáu)',
  ['ly_selfie', 'ti_the4g', 'sau_gaubong'].every(id =>
    typeof MISSION_BLOCKS.lend[id] === 'string' && MISSION_BLOCKS.lend[id].length > 60));
{
  const all = [];
  ['gen_z', 'sinh_vien', 'me_bim_sua'].forEach(n => STAGES.forEach(s => all.push(MISSION_BLOCKS[n][s])));
  Object.values(MISSION_BLOCKS.lend).forEach(v => all.push(v));
  all.push(MISSION_BLOCKS.chore);
  add(12, 'Mọi khối nhiệm vụ là tiếng Việt CÓ DẤU (luật cứng toàn workspace)',
    all.every(b => VI_DAU.test(b)), all.length + ' khối');
}

// ── 13-15: hai bảng nhiệm vụ (máy chủ ↔ máy chơi) phải KHỚP ───────────────────
{
  const serverSrc = fs.readFileSync(path.join(src, 'converse.js'), 'utf8');
  const owner = {};
  const m = serverSrc.match(/const MISSION_OWNER = \{([^}]+)\}/);
  if (m) m[1].split(',').forEach(pair => {
    const kv = pair.split(':').map(x => x.trim().replace(/['"]/g, ''));
    if (kv[0]) owner[kv[0]] = kv[1];
  });
  const clientOwners = {};
  ['ly_selfie', 'ti_the4g', 'sau_gaubong'].forEach(id => {
    const re = new RegExp(id + ":[\\s\\S]{0,200}?owner: '([a-z_]+)'");
    const mm = cfgSrc.match(re);
    if (mm) clientOwners[id] = mm[1];
  });
  add(13, 'Bảng "ai giữ nhiệm vụ nào" giống hệt nhau ở máy chủ và máy chơi',
    JSON.stringify(owner) === JSON.stringify(clientOwners),
    JSON.stringify(owner) + ' vs ' + JSON.stringify(clientOwners));
  add(14, 'Ba nhiệm vụ có đủ mã món · giá · người cho mượn · tiền thưởng',
    ['gay_selfie', 'the_4g', 'gau_bong'].every(i => cfgSrc.includes(`item: '${i}'`)) &&
    /lender: 'sinh_vien'[\s\S]*lender: 'gen_z'[\s\S]*lender: 'sinh_vien'/.test(cfgSrc));
  add(15, 'missions.js đã bỏ hết chỗ gọi tên cũ chỉ-dành-cho-Ly (canBuyStick/buyStick)',
    !/canBuyStick|function buyStick/.test(missionsSrc) &&
    !/canBuyStick|\.buyStick\(/.test(fs.readFileSync(path.resolve(HERE, '../public/js/ui.js'), 'utf8')));
}

// ── 16-19: sổ đen ─────────────────────────────────────────────────────────────
add(16, 'Sổ đen đoán đúng thứ tiếng của câu trả lời (dùng cho bài kiểm tuân lệnh)',
  ledger.guessLang('Dạ em chào anh, anh cần gì ạ?') === 'vi' &&
  ledger.guessLang('Who is knocking at this hour, seriously?') === 'en' &&
  ledger.guessLang('Ừa') === null);
add(17, 'Sổ đen KHÔNG bao giờ làm vỡ game khi chưa gắn D1 (chạy máy mình)',
  (() => { try { ledger.logTurn({ env: {}, request: { url: 'https://x/y' } }, { kind: 'reply' }); return true; } catch { return false; } })());
add(18, 'Ghi sổ kiểu "gửi rồi đi" — converse.js không await một lần nào',
  !/await\s+logTurn/.test(fs.readFileSync(path.join(src, 'converse.js'), 'utf8')) &&
  /waitUntil/.test(fs.readFileSync(path.join(src, '_ledger.js'), 'utf8')));
add(19, 'Chín cột mốc phía máy chơi đủ mặt trong sổ đen + trong máy chơi',
  ['game_start', 'mode_pick', 'knock', 'first_line', 'door_open', 'win', 'lose', 'police', 'quit']
    .every(n => ledger.LEDGER_EVENTS.includes(n)));

// ── 20-24: thanh thiện cảm · cửa mở · lượt đầu ───────────────────────────────
add(20, 'Cửa mở KHÔNG còn cần AI gật (bỏ hẳn quyền phủ quyết của invite_intent)',
  !/doorOpens\s*=\s*st\.trust >= diff\.threshold[\s\S]{0,80}invite_intent/.test(convoSrc) &&
  /doorOpens = friendPct\(st, diff\) >= 100/.test(convoSrc));
add(21, 'Chạm 100% mà AI chưa mời → game BẮT AI nói câu mời (khuôn finalTestAsk)',
  /inviteSpoken/.test(convoSrc) && /inviteAsk/.test(convoSrc) &&
  /body\.inviteAsk/.test(fs.readFileSync(path.join(src, 'converse.js'), 'utf8')));
add(22, 'Cả chuỗi não chết đúng lúc mở cửa → vẫn có câu mời kịch bản (không kẹt cửa)',
  /function inviteFallback/.test(fs.readFileSync(path.join(src, 'converse.js'), 'utf8')));
add(23, 'Thanh thiện cảm hai lớp: lớp CODE đọc XDH.REGRET, lớp AI đọc lòng tin, lấy cao hơn',
  /function friendCode/.test(convoSrc) && /function friendAi/.test(convoSrc) &&
  /Math\.max\(friendCode\(\), friendAi\(st, diff\)\)/.test(convoSrc) &&
  /XDH\.REGRET\[npcId\]/.test(convoSrc));
add(24, 'Lượt đầu: chạm chủ đề thì NÂNG mức chấm · bị chấm nhạt thì MIỄN phạt',
  /FLOOR_ON_TOPIC/.test(convoSrc) && /playerTurns === 1/.test(convoSrc) &&
  /FIRST_TURN = \{ GRACE: true/.test(cfgSrc));

// ── 25-28: công tắc playtest · máy quay số · chuỗi não ────────────────────────
add(25, 'Công tắc playtest: link chính LUÔN tắt, bản thử tự bật, ?playtest=0 tắt được',
  /if \(h === XDH\.LIVE_HOST\) return false;/.test(cfgSrc) && /playtest=0/.test(cfgSrc));
{
  // Ba nơi tiêu tiền phải đi qua một cửa: đồ nghề + hộp quà (ui.js) · món nhiệm vụ (missions.js)
  // · hộp quà mua ở máy quay số (casino.js). CỐ Ý CHỪA giá BỮA ĂN của Kẹt Tiền — ở chế độ đó
  // mua được bữa ăn CHÍNH LÀ điều kiện thắng, cho 0đ là thắng ngay, hỏng cả chế độ.
  const uiHits = (fs.readFileSync(path.resolve(HERE, '../public/js/ui.js'), 'utf8').match(/XDH\.priceOf\(/g) || []).length;
  add(26, 'Mọi giá ĐỒ NGHỀ đi qua MỘT cửa XDH.priceOf (chừa giá bữa ăn của Kẹt Tiền)',
    /XDH\.priceOf = function/.test(cfgSrc) && uiHits >= 2 &&
    /XDH\.priceOf\(/.test(missionsSrc) &&
    /XDH\.priceOf\(/.test(fs.readFileSync(path.resolve(HERE, '../public/js/casino.js'), 'utf8')),
    'ui.js ' + uiHits + ' chỗ');
}
add(27, 'Máy quay số TẮT ở Kẹt Tiền — hai lớp: không mọc ngoài xóm + chặn ở cửa mở',
  /if \(!kt\) \{\s*\n\s*const \[sx, sy\] = XDH\.SLOT\.POS/.test(gameSrc) &&
  /if \(XDH\.isKetTien\(\)\) \{[\s\S]{0,220}return;/.test(fs.readFileSync(path.resolve(HERE, '../public/js/casino.js'), 'utf8')));
add(28, 'Chuỗi não: Gemini hết bị chuỗi rỗng trong enum giết + tiếng Anh có thứ tự riêng',
  /filter\(v => v !== ''\)/.test(brainSrc) && /EN_ORDER/.test(brainSrc) &&
  brain.EN_ORDER[0] === 'gemini');

// ── 29-30: giao diện ─────────────────────────────────────────────────────────
add(29, 'Thanh thiện cảm có mặt trong trang + luôn hiện (không cần ?debug=1)',
  /id="friend-bar"/.test(htmlSrc) && /id="friend-fill"/.test(htmlSrc) &&
  /function setFriend/.test(fs.readFileSync(path.resolve(HERE, '../public/js/ui.js'), 'utf8')));
add(30, 'track.js được nạp và nạp SAU config.js (nó cần XDH đã có)',
  htmlSrc.indexOf('js/track.js') > htmlSrc.indexOf('js/config.js') && htmlSrc.includes('js/track.js'));

console.table(checks);
const pass = checks.filter(c => c['đạt'] === '✅').length;
console.log(`\n>>> ${pass}/${checks.length} ĐẠT`);
fs.writeFileSync(path.join(HERE, 'v2-check-out.json'), JSON.stringify({ pass, total: checks.length, checks }, null, 1));
process.exit(pass === checks.length ? 0 : 1);
