// Xóm Đóm Hòng — client config. GAME CODE owns all win/fail rules (never the AI).
window.XDH = {};

// ?debug=1 → tuning overlay: real numbers + per-turn verdict/deltas + brain badge (§1b)
XDH.DEBUG = /[?&]debug=1/.test(location.search);

// §0 #10 — EN/VN toggle: NPC dialogue + thought + STT follow this. Persisted.
XDH.lang = localStorage.getItem('xdh_lang') || 'vi';
XDH.setLang = function (l) {
  XDH.lang = l === 'en' ? 'en' : 'vi';
  localStorage.setItem('xdh_lang', XDH.lang);
  if (XDH.applyLang) XDH.applyLang();   // ui.js swaps visible strings
};

// ====== v0.6 F1 — POPUP SỐ BAY (plan-v0.6-feel.md §1) ======
// Q2 = A: KHÔNG dựng thanh đo thường trực. Chỉ hiện MỨC THAY ĐỔI rồi tan trong ~1,2 giây.
// Q1 = A: hiện cả TÊN mức chấm lẫn CON SỐ — tên dạy luật chơi nhanh gấp đôi số trần.
// ?nonum=1 → tắt sạch popup để friend test so được hai kiểu.
XDH.NONUM = /[?&]nonum=1/.test(location.search);
XDH.POP = { LIFE_MS: 1200, STAGGER_MS: 150, MAX_STACK: 4 };
XDH.POP_VERDICT = {
  danh_trung: { vi: 'ĐÁNH TRÚNG!', en: 'DIRECT HIT!',  cls: 'hit'  },
  hop_ly:     { vi: 'Hợp lý',      en: 'Fair enough',  cls: 'good' },
  thuong:     { vi: 'Nhạt…',       en: 'Meh…',         cls: 'meh'  },
  kha_nghi:   { vi: 'Nghe sai sai',en: 'Sounds off',   cls: 'warn' },
  lo_lieu:    { vi: 'LỘ RỒI!',     en: 'BUSTED!',      cls: 'bad'  }
};
XDH.POP_STAT = {
  trust:      { vi: 'tin',        en: 'trust' },
  suspicion:  { vi: 'nghi',       en: 'suspicion' },
  interest:   { vi: 'hứng thú',   en: 'interest' },
  patience:   { vi: 'kiên nhẫn',  en: 'patience' }
};
// Các cú CODE cộng NGOÀI verdict — mỗi cú một dòng riêng, xếp chồng rồi tan.
XDH.POP_EVENT = {
  contradiction: { vi: '⚡ Đồ chọi lời khai',      en: '⚡ Outfit contradicts story', cls: 'bad'  },
  corroboration: { vi: '🧾 Đồ chống lưng lời khai!',en: '🧾 Outfit backs your story!', cls: 'hit'  },
  gift:          { vi: '🧋 Trà sữa',                en: '🧋 Bubble tea',              cls: 'good' },
  gossip:        { vi: '🗣️ Tai tiếng đồn tới đây',  en: '🗣️ Rumours reached this door', cls: 'warn' },
  memory_good:   { vi: '🌙 Nhà này nhớ chuyện tốt', en: '🌙 They remember you kindly', cls: 'good' },
  memory_bad:    { vi: '🌙 Nhà này nhớ tội cũ',     en: '🌙 They remember your mess',  cls: 'warn' },
  house_seen:    { vi: '👀 Xóm đã thấy mặt bạn',    en: '👀 The block has seen you',   cls: 'warn' },
  final_fail:    { vi: '❓ Trả lời hụt câu hỏi chốt', en: '❓ Fumbled the final question', cls: 'bad' },
  invite_nudge:  { vi: '🚪 Họ đang muốn mời',       en: '🚪 They want to invite you',  cls: 'good' }
};

XDH.RULES = {
  SUSPICION_BLOCKS: 60,     // door never opens while suspicion >= 60
  SUSPICION_FAIL: 100,      // instant fail
  CONVO_SECONDS: 300,       // 5-minute timer per door (Lucas 08-09: 3 phút quá ngắn)
  NIGHTS: 3,                // §0 #2: night N needs N houses before dawn → night 3 wins the run
  NIGHT_MINUTES: 8,         // Q-D: dawn after ~8 real minutes
  DAY_MINUTES: 12,          // v0.3 Q1/Q6: a "Kẹt Tiền" day ≈ 10-15 phút
  SOFT_DAY_LIMIT: 3,        // v0.3 Q-B3: 3 ngày/phiên rồi nhắc nghỉ (tiền API)
  START: { trust: 30, suspicion: 20, interest: 50, patience: 100 }
};

// ============ v0.3 — MODE "KẸT TIỀN" (plan-v0.3-beggar.md) ============
// Phương án A: chế độ thứ 2 dùng CHUNG engine hội thoại. Chỉ ĐIỀU KIỆN THẮNG đổi.
// Mọi thứ dưới đây chỉ chạy khi XDH.run.mode === 'ket_tien' — mode ma sói giữ nguyên 100%.
XDH.MODES = {
  ma_soi:   { id: 'ma_soi',   emoji: '🐺', name: 'Ma Sói',   name_en: 'Werewolf' },
  ket_tien: { id: 'ket_tien', emoji: '🙇', name: 'Kẹt Tiền', name_en: 'Stranded' }
};
XDH.isKetTien = () => !!(XDH.run && XDH.run.mode === 'ket_tien');

// Q2 — mục tiêu bữa ăn: ngẫu nhiên mỗi ngày, 15k-60k, hiện ngay đầu ngày.
XDH.MEALS = [
  { emoji: '🥖', label: 'Bánh mì thịt',   label_en: 'Bánh mì',        price: 15 },
  { emoji: '🍙', label: 'Xôi gà',          label_en: 'Chicken sticky rice', price: 20 },
  { emoji: '🍜', label: 'Mì Quảng',        label_en: 'Mì Quảng noodles',    price: 25 },
  { emoji: '🍚', label: 'Cơm tấm sườn',    label_en: 'Broken rice + pork',  price: 30 },
  { emoji: '🍲', label: 'Bún bò',          label_en: 'Bún bò',         price: 35 },
  { emoji: '🍜', label: 'Phở tái',         label_en: 'Phở',            price: 40 },
  { emoji: '🥘', label: 'Cơm gà Hội An',   label_en: 'Hội An chicken rice', price: 50 },
  { emoji: '🍤', label: 'Bánh xèo tôm',    label_en: 'Shrimp bánh xèo',     price: 60 }
];

// Q5 — kết quả một lượt xin. AI CHỈ chọn loại; CODE cầm bảng tiền (giống §1b).
XDH.GIVE = {
  gen_z:      { min: 20, max: 50 },   // Ly: rộng rãi khi thấy vui, thích drama
  sinh_vien:  { min: 10, max: 25 },   // Tí: sinh viên nghèo, cho ít mà thật lòng
  me_bim_sua: { min: 15, max: 40 }    // Cô Sáu: kỹ tính nhưng thương người
};
XDH.CHORE = { min: 30, max: 60, seconds: 90 };   // việc vặt: trả cao hơn, đổi bằng 90 giây trong ngày
// v0.6 (plan §4, việc rẻ) — trước đây CẢ BA NHÀ dùng chung y hệt một đoạn chữ việc vặt.
// Nay mỗi nhà một việc đúng tính cách. Vẫn CHƯA phải trò chơi nhỏ — hệ nhiệm vụ thật để v0.7.
XDH.CHORE_LINES = {
  me_bim_sua: {
    vi: '"Rảnh không con? Ru giùm cô bé Bin một chút, cô đi phơi cái đồ cái đã."',
    en: '"Got a minute? Rock baby Bin for me while I hang the laundry."'
  },
  sinh_vien: {
    vi: '"Anh biết chép bài không? Phụ em chép nốt cái bài này đi rồi tính, em coi nốt hiệp hai."',
    en: '"Can you copy notes? Finish this page for me and we\'ll talk — I need to watch the second half."'
  },
  gen_z: {
    vi: '"Cầm giùm em cái đèn xíu đi, quay nốt cái clip này rồi em tính cho."',
    en: '"Hold this light for me a sec, let me finish this clip and then we\'ll talk."'
  }
};
XDH.FOOD_GIFTS = [
  { emoji: '🥖', label: 'ổ bánh mì còn nóng',  label_en: 'a warm bánh mì',      value: 15 },
  { emoji: '🍙', label: 'hộp xôi ăn dở',       label_en: 'a box of sticky rice', value: 15 },
  { emoji: '🍜', label: 'gói mì tôm',          label_en: 'a pack of instant noodles', value: 10 },
  { emoji: '🍌', label: 'nải chuối',           label_en: 'a bunch of bananas',  value: 10 },
  { emoji: '🍚', label: 'hộp cơm nguội',       label_en: 'a box of cold rice',  value: 20 }
];
XDH.OUTCOMES = ['tien', 'do_an', 'ca_hai', 'moi_com', 'viec_vat', 'tu_choi', 'quay_lai_sau'];

// B5 + B8 — xóm bắt đầu nhớ mặt: nghi ngờ KHỞI ĐIỂM tăng theo số nhà đã gõ + số ngày.
// THRESHOLD_DROP: xin 20k dễ gật hơn cho người lạ vào nhà lúc nửa đêm → ngưỡng "muốn giúp"
// thấp hơn ngưỡng "mời vào" 15 điểm (Ly 50 · Tí 60 · Cô Sáu 70). Cân bằng chỉnh Ở ĐÂY.
XDH.KT = { SUSP_PER_HOUSE: 6, SUSP_PER_DAY_AFTER_3: 5, MAX_START_SUSP: 55, THRESHOLD_DROP: 15 };

// v0.4 T3 — gossip "Sổ tai tiếng xóm" (Q2=A): mỗi chuyện xấu bị bắt quả tang ở nhà khác
// cộng nghi ngờ khởi điểm, có trần. Chỉnh Ở ĐÂY, một chỗ duy nhất.
XDH.GOSSIP = { SUSP_PER_STORY: 10, SUSP_CAP: 25 };

// v0.4 T6 — nhà cũ nhớ QUA ĐÊM (Q3/Q4): thắng đêm trước → tin khởi điểm +, tội cũ → nghi
// khởi điểm + (được thanh minh — AI chấm tốt là gỡ lại được). Chỉnh Ở ĐÂY.
XDH.MEMORY = { TRUST_GOOD: 10, SUSP_BAD: 10 };

// Q-B4 — 3 câu mở gợi ý cho người mới, TẮT sau 2 nhà đầu của ngày 1.
XDH.OPENERS = {
  vi: [
    'Dạ em chào chị, em là sinh viên đi lạc, điện thoại hết pin từ trưa rồi ạ…',
    'Dạ cho em hỏi thăm đường ra bến xe với ạ, em đi bộ từ chiều tới giờ.',
    'Dạ em xin lỗi làm phiền, em kẹt ở xóm này từ chiều, chưa ăn gì cả…'
  ],
  en: [
    "Hi, sorry to bother you — I'm a student, I got lost and my phone died at noon…",
    "Excuse me, could you point me to the bus station? I've been walking since this afternoon.",
    "Sorry to knock so late — I've been stranded in this neighborhood since noon and haven't eaten…"
  ]
};

// §2 economy — kill loot (flavor VND, rounded to 5k) + powerup shop at the bánh mì cart
XDH.LOOT = { MIN_K: 20, MAX_K: 100 };
XDH.SHOP = [
  { id: 'gift',      label: '🧋 Trà sữa tặng hàng xóm', price: 40, desc: 'Tặng lúc đang nói chuyện — hàng xóm quý liền (1 lần).' },
  { id: 'hourglass', label: '⏳ Đồng hồ cát',            price: 60, desc: 'Thêm 45 giây cho cuộc nói chuyện đang dở.' },
  { id: 'hint',      label: '💡 Gợi ý của quân sư',      price: 50, desc: 'Quân sư mách nhỏ MỘT câu nên nói tiếp theo.' },
  { id: 'wardrobe',  label: '🎽 Đổi đồ tại chỗ',         price: 30, desc: 'Mở tủ đồ ngay trước cửa, khỏi chạy về.' }
];
XDH.GIFT_TRUST = 8;         // code-owned one-time boost when the milk-tea gift is used

// §1b — AI judges (verdict), CODE scores. Same table for all 3 brains, so a mid-convo
// brain swap never changes the math. Tune THIS table for balance, never the prompt.
XDH.VERDICTS = {
  danh_trung: { trust: 16, suspicion: -4, interest: 8,  patience: 2 },  // hit their weakness
  hop_ly:     { trust: 10, suspicion: 0,  interest: 3,  patience: 0 },  // believable, in-character
  thuong:     { trust: 0,  suspicion: 0,  interest: -4, patience: -4 }, // meh / filler
  kha_nghi:   { trust: 0,  suspicion: 8,  interest: 0,  patience: -2 }, // fishy
  lo_lieu:    { trust: -8, suspicion: 14, interest: 2,  patience: -6 }  // busted
};

// §2b — fixed difficulty ladder. Knobs live HERE, not in prompts.
// Balance targets: easy ≈ 4 good turns (30 + 4×12 = 78 ≥ 65), hard ≈ 7 (30 + 7×8 = 86 ≥ 85).
// v0.6 F3.2 — cờ `corroboration` là ĐỐI XỨNG của `contradiction`: đồ CHỐNG LƯNG lời khai thì
// CODE thưởng, cùng cỡ với hình phạt. AI chỉ bật cờ; số nằm ở đây. 1 lần / bộ đồ / cuộc.
XDH.DIFFICULTY = {
  gen_z:      { stars: '⭐',    level: 'Dễ',  threshold: 55, gainMult: 1.3, contra: { trust: -3, susp: 6 },  corro: { trust: 3, susp: -6 } },   // Lucas 08-09: Ly khó quá → hạ ngưỡng 65→55, nói hay ăn điểm đậm hơn
  sinh_vien:  { stars: '⭐⭐',   level: 'Vừa', threshold: 75, gainMult: 1.0, contra: { trust: -5, susp: 10 }, corro: { trust: 5, susp: -10 } },
  me_bim_sua: { stars: '⭐⭐⭐',  level: 'Khó', threshold: 85, gainMult: 0.8, contra: { trust: -8, susp: 14 }, corro: { trust: 8, susp: -14 }, finalTest: true }
};

// v0.6 F3.1 — TỦ ĐỒ BỊ KHOÁ. Trước v0.6 tủ mở sẵn 100% nên "rơi 1 món đồ" chỉ là chữ suông.
// Nay bắt đầu chỉ có "đồ thường + đầu trần + tay không"; mọi món khác mở dần từ loot.
// Q4 = A: đêm 1 tặng sẵn 1 món ngẫu nhiên để không ai bắt đầu tay trắng.
// F3.3 — thêm 3 món "giấy tờ": mở ra lối nói dối mới, và là mồi ngon cho cờ corroboration.
XDH.WARDROBE = {
  shirt: [
    { id: 'none',    label: 'Đồ thường',        desc: 'quần áo bình thường, hơi nhàu' },
    { id: 'grab',    label: 'Áo khoác Grab',     desc: 'áo khoác xanh lá của tài xế xe ôm công nghệ' },
    { id: 'sinhvien',label: 'Áo đồng phục sinh viên', desc: 'áo đồng phục trường đại học' }
  ],
  hat: [
    { id: 'none',    label: 'Đầu trần',          desc: 'không đội gì, tóc hơi rối' },
    { id: 'baohiem', label: 'Nón bảo hiểm',      desc: 'nón bảo hiểm xanh kiểu tài xế công nghệ' },
    { id: 'nonla',   label: 'Nón lá',            desc: 'nón lá kiểu đi chợ' }
  ],
  item: [
    { id: 'none',    label: 'Tay không',         desc: 'không cầm gì' },
    { id: 'trasua',  label: 'Túi trà sữa',       desc: 'túi trà sữa trân châu như đang giao hàng' },
    { id: 'bo_rau',  label: 'Bó rau muống',      desc: 'bó rau muống như vừa đi chợ về' },
    { id: 'thesv',   label: 'Thẻ sinh viên',     desc: 'thẻ sinh viên nhựa còn mới, có ảnh và tên trường' },
    { id: 'donhang', label: 'Đơn hàng in sẵn',   desc: 'tờ đơn giao hàng in sẵn, có mã đơn và địa chỉ' },
    { id: 'tinnhan', label: 'Ảnh tin nhắn in ra',desc: 'tờ giấy in ảnh chụp màn hình một tin nhắn hẹn trước' }
  ]
};
XDH.WARDROBE_LOCK = { NIGHT1_FREE: 1, LOOT_MONEY_IF_FULL_K: 25 };
XDH.SLOTS = ['shirt', 'hat', 'item'];

XDH.isUnlocked = function (slot, id) {
  if (id === 'none') return true;
  const u = XDH.run && XDH.run.unlocked;
  return !!(u && u[slot] && u[slot].includes(id));
};
XDH.lockedPieces = function () {
  const out = [];
  XDH.SLOTS.forEach(slot => XDH.WARDROBE[slot].forEach(o => {
    if (o.id !== 'none' && !XDH.isUnlocked(slot, o.id)) out.push({ slot, opt: o });
  }));
  return out;
};
// Mở đúng MỘT món CHƯA CÓ. Hết đồ để mở → trả null (bên gọi đền bằng tiền).
XDH.unlockRandomPiece = function () {
  const pool = XDH.lockedPieces();
  if (!pool.length) return null;
  const p = pool[Math.floor(Math.random() * pool.length)];
  XDH.run.unlocked[p.slot].push(p.opt.id);
  return p;
};

// Display-side NPC info (server holds the real persona cards + hidden logic)
XDH.NPCS = [
  { id: 'me_bim_sua', name: 'Cô Sáu (mẹ bỉm sữa)',   blipHz: 520, palette: { skin:'#f7c99b', hair:'#3a2a1e', top:'#e2718f' } },
  { id: 'sinh_vien',  name: 'Tí (sinh viên mê bóng đá)', blipHz: 340, palette: { skin:'#eab98a', hair:'#141414', top:'#3f6fe0' } },
  { id: 'gen_z',      name: 'Ly (Gen Z TikTok)',     blipHz: 640, palette: { skin:'#f3c4a6', hair:'#7d3fd4', top:'#2fd4b2' } }
];

// v0.6 F4 — 5 → 10 cảm xúc (Q6 = A: vẽ bằng code trong portraits.js, 0 đồng).
// Nhãn lạ từ AI → rơi về neutral, không vỡ game (shapeReply phía server cũng chặn sẵn).
XDH.EMOTIONS = ['neutral', 'interested', 'amused', 'suspicious', 'angry',
                'chan', 'nguong', 'cam_dong', 'phan_khich', 'buc_minh'];

// v0.6 F4 + F5 — mọi con số của "gói cảm giác" nằm ở ĐÂY, chỉnh một chỗ.
XDH.FEEL = {
  // CODE bật mặt "chán" khi người chơi nói nhạt liên tiếp — thẻ Ly ghi "chán RẤT nhanh"
  // mà game cũ không có mặt chán nào. Ly nhạy nhất, Cô Sáu chịu đựng giỏi nhất.
  BORED_STREAK: { gen_z: 3, sinh_vien: 4, me_bim_sua: 5 },
  // F5.1 — bong bóng 💭 rò rỉ Ý ĐỊNH trước khi bị đuổi (Q7 = A: chỉ 2 khoảnh khắc,
  // rò rỉ CẢNH BÁO chứ không rò rỉ đáp án). Một lần / cuộc.
  LEAK: { PATIENCE: 30, SUSPICION: 80 },
  REGRET_MS: 5200
};

// F5.1 — lời nghĩ thầm cảnh báo, đúng giọng từng nhân vật. CODE chọn, AI không đụng vào.
XDH.LEAK_LINES = {
  me_bim_sua: {
    vi: ['Thôi nghe hết nổi rồi… kiếm cớ đóng cửa thôi, bé Bin sắp dậy tới nơi.',
         'Cô mà nghe thêm một câu vòng vo nữa là cô đóng cửa thiệt đó nghen…'],
    en: ["I can't take much more of this… I'll find an excuse and shut the door, Bin's about to wake up.",
         "One more roundabout answer and I really am closing this door…"]
  },
  sinh_vien: {
    vi: ['Thôi… em kiếm cớ vô coi nốt trận đi, đứng đây hoài kỳ lắm.',
         'Nghe hơi ghê ghê… hay là em nói em bận rồi đóng cửa ta?'],
    en: ["Okay… I'll make up an excuse and go finish the match, this is getting weird.",
         "This is starting to creep me out… maybe I just say I'm busy and close up?"]
  },
  gen_z: {
    vi: ['Thôi chán rồi… kiếm cớ đóng cửa thôi, content này flop rồi.',
         'Ét ô ét, nhạt quá… em bơ luôn rồi đóng cửa nha.'],
    en: ["Okay I'm bored… time to make an excuse and shut the door, this content flopped.",
         "SOS, this is so dry… I'm ghosting and closing the door."]
  }
};

// F5.2 — DÒNG TIẾC NUỐI sau khi thua. BẮT BUỘC lấy từ điểm yếu ĐÃ CÓ trong thẻ nhân vật
// (_personas.js) — AI không được bịa ra một con đường không tồn tại.
// keys = từ khoá kiểm xem người chơi ĐÃ chạm chủ đề đó chưa (chạm rồi thì không tiếc nữa).
XDH.REGRET = {
  me_bim_sua: [
    { id: 'be_bin', keys: ['bin', 'bé', 'con', 'em bé', 'baby', 'cute', 'dễ thương'],
      vi: 'Nếu hồi nãy nó chịu hỏi một câu về bé Bin thì tao đã mở cửa rồi…',
      en: "If they had just asked one question about baby Bin, I'd have opened the door…" },
    { id: 'cho_bua', keys: ['chợ', 'rau', 'thịt', 'giá', 'nghìn', 'ngàn', 'market', 'price'],
      vi: 'Kể chuyện chợ búa, giá rau giá thịt cho tao nghe thì tao tin liền chớ bộ…',
      en: "Talk to me about the market, the price of veggies — I'd have believed you right away…" },
    { id: 'nho_tieng', keys: ['nhỏ', 'khẽ', 'ồn', 'quiet', 'sorry', 'xin lỗi'],
      vi: 'Nói nhỏ tiếng lại một chút thôi mà cũng không chịu… ai mà tin cho nổi.',
      en: "Would it have killed them to lower their voice… how am I supposed to trust that." },
    { id: 'nghe_tam', keys: ['xóm', 'hàng xóm', 'nghe', 'kể', 'chuyện', 'neighbour', 'neighbor'],
      vi: 'Chịu nghe tao tám một chút thôi là tao thương liền à…',
      en: "Just let me ramble a bit and I'd have warmed right up…" }
  ],
  sinh_vien: [
    { id: 'bong_da', keys: ['bóng', 'banh', 'đá', 'trận', 'cầu thủ', 'bàn thắng', 'mu', 'arsenal',
                            'city', 'barca', 'real', 'hagl', 'football', 'match', 'goal'],
      vi: 'Nói chuyện đá banh với em một câu thôi là em mở cửa liền à…',
      en: "One line about football and I'd have opened the door, seriously…" },
    { id: 'sinh_vien', keys: ['sinh viên', 'trọ', 'mì', 'deadline', 'nhớ nhà', 'học', 'trường',
                              'student', 'noodles', 'homesick'],
      vi: 'Ảnh mà kể chuyện sinh viên, mì gói với deadline thì em hiểu liền chớ…',
      en: "If they'd talked student life — instant noodles, deadlines — I'd have got it right away…" },
    { id: 'xem_chung', keys: ['coi chung', 'xem chung', 'xem cùng', 'ăn', 'đồ ăn', 'watch', 'together'],
      vi: 'Rủ em coi trận chung, mang theo miếng đồ ăn… là xong phim rồi.',
      en: "Ask to watch the match with me, bring a snack… that would have been game over." }
  ],
  gen_z: [
    { id: 'content', keys: ['content', 'clip', 'video', 'tiktok', 'follow', 'view', 'quay', 'kênh',
                            'gu', 'edit'],
      vi: 'Khen content của em một câu có gu thôi… là em cho vô liền á.',
      en: "One tasteful compliment about my content… and I'd have let them in." },
    { id: 'y_tuong', keys: ['ý tưởng', 'idea', 'trend', 'viral', 'kịch bản', 'concept'],
      vi: 'Pitch cho em một ý tưởng video độc đi… ai lại đi kể chuyện nhạt vậy trời.',
      en: "Pitch me one wild video idea… who tells a story that dry, honestly." },
    { id: 'drama', keys: ['drama', 'hóng', 'chuyện', 'xóm', 'bí mật', 'gossip', 'tin đồn'],
      vi: 'Có drama gì trong xóm kể em nghe đi chớ… em hóng muốn xỉu mà.',
      en: "Give me some neighbourhood drama… I was dying to hear something." },
    { id: 'tu_tin', keys: ['lầy', 'tự tin', 'slay', 'quẩy', 'vibe', 'flex', 'ngầu'],
      vi: 'Tự tin lên xíu coi… run run vậy ai mà vibe nổi.',
      en: "Bring some confidence… all that nervousness, no vibe at all." }
  ]
};

// §0 #8-9 avatar menu — face/hair/skin are COSMETIC ONLY (never sent to the AI);
// costume slots (Đồ tab = wardrobe) keep affecting the AI.
XDH.AVATAR = {
  face: [
    { id: 'hien', label: '😊 Hiền' },
    { id: 'lem',  label: '😏 Lém'  },
    { id: 'ngau', label: '😎 Ngầu' }
  ],
  hair: [
    { id: 'xu',   label: 'Xù'     },
    { id: 'muot', label: 'Mượt'   },
    { id: 'mo',   label: 'Mohawk' }
  ],
  skin: [
    { id: 'xam', label: 'Xám khói',  color: 0x8a8fa8 },
    { id: 'nau', label: 'Nâu cafe',  color: 0xa8845f },
    { id: 'den', label: 'Đen tuyền', color: 0x565666 }
  ]
};
XDH.avatar = JSON.parse(localStorage.getItem('xdh_avatar') || '{"face":"hien","hair":"xu","skin":"xam"}');
XDH.saveAvatar = function () {
  localStorage.setItem('xdh_avatar', JSON.stringify(XDH.avatar));
  if (XDH.applyAvatar) XDH.applyAvatar();   // game redraws the wolf sprite
};

XDH.outfitDescription = function (outfit) {
  const w = XDH.WARDROBE;
  const pick = (slot) => w[slot].find(o => o.id === outfit[slot]) || w[slot][0];
  return `Áo: ${pick('shirt').desc}. Đầu: ${pick('hat').desc}. Tay: ${pick('item').desc}.`;
};

XDH.outfitLabel = function (outfit) {
  const w = XDH.WARDROBE;
  const parts = ['shirt', 'hat', 'item']
    .map(s => (w[s].find(o => o.id === outfit[s]) || w[s][0]))
    .filter(o => o.id !== 'none').map(o => o.label);
  return parts.length ? parts.join(' + ') : 'Đồ thường';
};
