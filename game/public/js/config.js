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

XDH.RULES = {
  SUSPICION_BLOCKS: 60,     // door never opens while suspicion >= 60
  SUSPICION_FAIL: 100,      // instant fail
  CONVO_SECONDS: 180,       // 3-minute timer per door
  NIGHTS: 3,                // §0 #2: night N needs N houses before dawn → night 3 wins the run
  NIGHT_MINUTES: 8,         // Q-D: dawn after ~8 real minutes
  START: { trust: 30, suspicion: 20, interest: 50, patience: 100 }
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
XDH.DIFFICULTY = {
  gen_z:      { stars: '⭐',    level: 'Dễ',  threshold: 65, gainMult: 1.2, contra: { trust: -3, susp: 6 } },
  sinh_vien:  { stars: '⭐⭐',   level: 'Vừa', threshold: 75, gainMult: 1.0, contra: { trust: -5, susp: 10 } },
  me_bim_sua: { stars: '⭐⭐⭐',  level: 'Khó', threshold: 85, gainMult: 0.8, contra: { trust: -8, susp: 14 }, finalTest: true }
};

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
    { id: 'bo_rau',  label: 'Bó rau muống',      desc: 'bó rau muống như vừa đi chợ về' }
  ]
};

// Display-side NPC info (server holds the real persona cards + hidden logic)
XDH.NPCS = [
  { id: 'me_bim_sua', name: 'Cô Sáu (mẹ bỉm sữa)',   blipHz: 520, palette: { skin:'#f7c99b', hair:'#3a2a1e', top:'#e2718f' } },
  { id: 'sinh_vien',  name: 'Tí (sinh viên mê bóng đá)', blipHz: 340, palette: { skin:'#eab98a', hair:'#141414', top:'#3f6fe0' } },
  { id: 'gen_z',      name: 'Ly (Gen Z TikTok)',     blipHz: 640, palette: { skin:'#f3c4a6', hair:'#7d3fd4', top:'#2fd4b2' } }
];

XDH.EMOTIONS = ['neutral', 'interested', 'amused', 'suspicious', 'angry'];

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
