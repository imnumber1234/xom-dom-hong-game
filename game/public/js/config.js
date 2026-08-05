// Xóm Đóm Hòng — client config. GAME CODE owns all win/fail rules (never the AI).
window.XDH = {};

XDH.RULES = {
  TRUST_TO_OPEN: 75,        // door opens iff trust >= 75
  SUSPICION_BLOCKS: 60,     // ...AND suspicion < 60
  SUSPICION_FAIL: 100,      // instant fail
  CONVO_SECONDS: 180,       // 3-minute timer per door
  DELTA_CLAMP: 20,          // AI deltas clamped to ±20 by code
  CONTRADICTION_SUSP: 10,   // outfit-vs-story contradiction: code adds suspicion
  CONTRADICTION_TRUST: -5,  // ...and removes trust
  HOUSES_TO_WIN: 3,
  START: { trust: 30, suspicion: 20, interest: 50, patience: 100 }
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
