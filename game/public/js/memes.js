// v0.6 F2 — MEME PHẢN ỨNG. Bộ meme RIÊNG của Xóm Đóm Hòng (game/public/memes/).
// Khuôn lấy theo memePack.ts của Werewolf AI Arena, nhưng ảnh đã được DUYỆT TAY lại từng tấm
// cho hợp cảnh xóm Việt + hợp gửi bạn bè (bỏ 3 tấm: 1 chibi anime lạc quẻ, 1 caption tiếng Anh
// không ăn nhập, 1 tấm .avif không mở ra duyệt được → không dùng thứ chưa nhìn tận mắt).
//
// LUẬT BẤT DI BẤT DỊCH: **CODE chọn meme**, AI không bao giờ chọn.
//   verdict (AI chấm) → CODE tra bảng mood → CODE bốc 1 meme trong pack → hiện cạnh thoại.
// Không gọi API GIF ngoài (Klipy/Tenor). Pack tĩnh, 0 đồng, 0 khoá.

XDH.MEME_CFG = {
  DIR: 'memes/',
  EVERY_TURNS: 3,                          // trần: tối đa 1 meme / 3 lượt (Q3 = A, thưa mới vui)
  STRONG: ['danh_trung', 'lo_lieu'],       // chỉ nổ ở nấc MẠNH — chỉnh đúng dòng này là xong
  MAX_W: 132                               // bề ngang tối đa trên màn hình (px)
};

// verdict → danh sách mood được phép bốc (bảng §1 F2 của plan)
XDH.MEME_VERDICT_MOOD = {
  danh_trung: ['laugh', 'smug'],
  hop_ly:     ['smug'],
  thuong:     null,                        // cố ý KHÔNG có meme — giữ meme hiếm mới vui
  kha_nghi:   ['doubt'],
  lo_lieu:    ['accuse']
};
// sự kiện code tự bắn (không qua verdict)
XDH.MEME_EVENT_MOOD = {
  contradiction: ['accuse'],
  kicked:        ['betrayed'],
  police:        ['panic'],
  corroboration: ['smug']
};

// mood: laugh | smug | doubt | accuse | panic | betrayed
XDH.MEME_PACK = [
  // — laugh: cười khoái, đánh trúng tim đen —
  { file: 'cat12.jpg', mood: 'laugh', meaning: 'chú Việt Nam bắn tim, chữ "10 ĐIỂM"', when: 'khen một câu quá đúng bài' },
  { file: '44c79cd9384a0db5f5eb0b878f013dfd.jpg', mood: 'laugh', meaning: 'cục xanh nhe răng cười đè lên cục đang mếu', when: 'khoái chí khi người kia đuối' },
  { file: 'f25066da123807a5701287b7f9eefa9b.jpg', mood: 'laugh', meaning: 'mèo trắng vẽ lông mày, giơ ngón cái, lấp lánh', when: 'duyệt một câu quá duyên' },

  // — smug: gật gù, chấp nhận, tự tin —
  { file: 'image6-1.webp', mood: 'smug', meaning: 'anh râu gật đầu, chữ "Yes."', when: 'đồng ý chắc nịch' },
  { file: 'e255a1e433105bcbf891060bde64e958.jpg', mood: 'smug', meaning: 'mèo lông mày giơ ngón cái', when: 'ừ được đó, nghe lọt tai' },
  { file: 'cat7.jpg', mood: 'smug', meaning: 'mèo trắng cười mím, mãn nguyện', when: 'hài lòng ngầm' },

  // — doubt: nghe sai sai, không mua —
  { file: 'cat1.jpg', mood: 'doubt', meaning: 'chó bông giơ ngón tay "no no no"', when: 'phủ nhận thẳng thừng' },
  { file: 'cat8.jpg', mood: 'doubt', meaning: 'mèo trắng liếc xéo', when: 'không tin lắm, đang soi' },
  { file: 'cat9.jpg', mood: 'doubt', meaning: 'cô gái nghi ngờ rồi nhăn mặt (2 khung)', when: 'nghe xong thấy sai sai hẳn' },
  { file: 'anh-meme-bua-5.jpg', mood: 'doubt', meaning: 'cục xanh mắt lờ đờ, ra dấu suỵt', when: 'thôi đừng bịa nữa' },
  { file: 'd7b68ed24b41e4b9a6ceecd1f96b51e7.jpg', mood: 'doubt', meaning: 'mèo nhún vai, xoè hai tay', when: 'biết chết liền / sao cũng được' },
  { file: 'well-yes-but-actually-no-meme.gif', mood: 'doubt', meaning: 'ông cướp biển "well yes… but actually no"', when: 'ừ thì đúng, mà không' },
  { file: 'cat4.jpg', mood: 'doubt', meaning: 'mèo đứng hai chân trông kỳ cục', when: 'thấy người này kỳ kỳ' },
  { file: 'cat5.jpg', mood: 'doubt', meaning: 'mèo lè lưỡi kiểu chê', when: 'nghe nhạt quá chịu không nổi' },

  // — accuse: bắt bài, đuổi, "thôi đủ rồi" —
  { file: 'cat10.jpg', mood: 'accuse', meaning: 'em bé Việt giơ tay, chữ "Thôi đủ rồi"', when: 'bắt quả tang nói dối, kêu dừng' },
  { file: 'cat11.jpg', mood: 'accuse', meaning: 'em bé Việt giơ ngón tay, chữ "Nínnnnn"', when: 'thôi im giùm, nghe hết nổi' },
  { file: 'b5b86196fa7262627b030b52599e0b72.jpg', mood: 'accuse', meaning: 'cục xanh nhe răng hăm doạ cục kia', when: 'nổi khùng, sắp đuổi' },

  // — panic: hoảng, sốc —
  { file: 'cat6.jpg', mood: 'panic', meaning: 'mèo há mồm hét', when: 'hoảng hồn, la lên' },
  { file: '930e70d55b3f1d15aa31b496010ab174.jpg', mood: 'panic', meaning: 'mèo trắng mắt trợn tròn sốc', when: 'sốc vì chuyện vừa lộ' },
  { file: 'cat3.jpg', mood: 'panic', meaning: 'cục hồng, bong bóng "oh no"', when: 'thôi xong rồi' },
  { file: 'defb701ce0c87e08f22adf7e986fcca5.jpg', mood: 'panic', meaning: 'mèo con giọt mồ hôi', when: 'lo lắng, bị dồn' },

  // — betrayed: buồn, thất vọng —
  { file: 'FRZfUUeVgAAW9Oo.jpg', mood: 'betrayed', meaning: 'mèo trắng khóc rưng rưng', when: 'bị phụ lòng' },
  { file: 'cat0.jpg', mood: 'betrayed', meaning: 'Megamind mặt buồn năn nỉ', when: 'tủi thân sau khi bị lừa' }
];

XDH.Memes = (function () {
  // CODE bốc meme: đúng mood, chưa dùng trong cuộc này. Hết bài thì trả null (thà không có
  // còn hơn lặp lại — meme lặp là hết buồn cười).
  function pick(moods, used) {
    if (!moods || !moods.length) return null;
    const pool = XDH.MEME_PACK.filter(m => moods.includes(m.mood) && !(used || []).includes(m.file));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Cổng tần suất — CODE giữ, không phải prompt. Trả về meme hoặc null.
  // active: { turns, memeTurn, memeUsed }
  function forVerdict(verdict, active) {
    if (!XDH.MEME_CFG.STRONG.includes(verdict)) return null;
    return gate(XDH.MEME_VERDICT_MOOD[verdict], active);
  }
  function forEvent(evt, active) {
    return gate(XDH.MEME_EVENT_MOOD[evt], active);
  }
  function gate(moods, active) {
    if (!active || !moods) return null;
    if (active.turns - active.memeTurn < XDH.MEME_CFG.EVERY_TURNS) return null;
    const m = pick(moods, active.memeUsed);
    if (!m) return null;
    active.memeTurn = active.turns;
    active.memeUsed.push(m.file);
    return m;
  }

  return { pick, forVerdict, forEvent };
})();
