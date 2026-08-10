// v0.8 — ẢNH 8-BIT THẬT (PixelLab) + NHÉP MIỆNG. Vẽ tay bằng code vẫn giữ làm phương án dự phòng:
// nếu một tấm ảnh nào đó tải hỏng thì mặt cũ hiện lên, KHÔNG bao giờ để trống.
// API không đổi: draw(canvas, npc, emotion). Thêm: mouth(canvas, ch, npc, emotion), rest(...).
XDH.Portraits = (function () {

  const ART = 'assets/art/';
  const MOODS = ['normal', 'suspect', 'trust'];
  const VISEMES = ['rest', 'closed', 'round', 'teeth', 'small_open', 'medium_open', 'wide_open'];

  // Cảm xúc (9 cái của v0.6) gom về 3 sắc mặt có ảnh.
  const MOOD_OF = {
    suspicious: 'suspect', angry: 'suspect', buc_minh: 'suspect', chan: 'suspect',
    interested: 'trust', amused: 'trust', phan_khich: 'trust', cam_dong: 'trust', nguong: 'trust'
  };
  const moodOf = e => MOOD_OF[e] || 'normal';

  // Chữ cái → hình miệng. Bỏ dấu trước khi tra (á → a).
  const VIS_OF = {
    a: 'wide_open', e: 'medium_open', i: 'teeth', o: 'round', u: 'round', y: 'small_open',
    m: 'closed', b: 'closed', p: 'closed', f: 'teeth', v: 'teeth', s: 'teeth', x: 'teeth',
    c: 'teeth', z: 'teeth', t: 'small_open', n: 'small_open', d: 'small_open', h: 'small_open',
    j: 'small_open', l: 'medium_open', g: 'medium_open', k: 'medium_open',
    r: 'round', q: 'round', w: 'round'
  };

  // ---- kho ảnh: nạp một lần, hỏng thì đánh dấu và quên luôn -------------------
  const cache = {};
  function img(path) {
    if (cache[path] !== undefined) return cache[path];
    const im = new Image();
    im.onerror = () => { cache[path] = null; };
    im.src = ART + path;
    cache[path] = im;
    return im;
  }
  function ready(im) { return im && im.complete && im.naturalWidth > 0; }

  function preload(npcs) {
    (npcs || []).forEach(n => {
      MOODS.forEach(m => img('face/' + n.id + '_' + m + '.png'));
      VISEMES.forEach(v => img('mouth/' + n.id + '_' + v + '.png'));
    });
  }

  function paint(canvas, im) {
    if (canvas.width !== 96) { canvas.width = 96; canvas.height = 96; }
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, 96, 96);
    g.drawImage(im, 0, 0, 96, 96);
    return true;
  }

  // ---- mặt chính -------------------------------------------------------------
  function draw(canvas, npc, emotion) {
    if (!npc) return;
    canvas.dataset.mood = moodOf(emotion);
    const im = img('face/' + npc.id + '_' + canvas.dataset.mood + '.png');
    if (ready(im)) return paint(canvas, im);
    if (im) { im.onload = () => { if (canvas.dataset.mood === moodOf(emotion)) paint(canvas, im); }; }
    drawFallback(canvas, npc, emotion);          // ảnh chưa về → vẽ tay, không để trống
  }

  // ---- nhép miệng ------------------------------------------------------------
  // Kiểu Ace Attorney: ĐANG NÓI thì mặt nhép miệng, NÓI XONG mới đổi sang sắc mặt cảm xúc.
  // (Bộ miệng chỉ dựng từ khuôn mặt bình thường, nên không trộn được giữa chừng —
  //  tách hẳn hai lúc như vậy vừa chạy được vừa nhìn có chủ đích.)
  function hasMouths(npc) { return npc && ready(img('mouth/' + npc.id + '_rest.png')); }

  function talkStart(canvas, npc, emotion) {
    if (!canvas || !npc) return;
    if (!hasMouths(npc)) { draw(canvas, npc, emotion); return; }   // Cô Sáu: chưa có miệng → mặt tĩnh
    canvas.dataset.talking = '1';
    paint(canvas, img('mouth/' + npc.id + '_rest.png'));
  }

  function mouth(canvas, ch, npc) {
    if (!npc || !canvas || canvas.dataset.talking !== '1') return;
    const c = (ch || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const v = ' .,!?…\n'.includes(c) ? 'closed' : VIS_OF[c];
    if (!v) return;
    const im = img('mouth/' + npc.id + '_' + v + '.png');
    if (ready(im)) paint(canvas, im);
  }

  // Nói xong: khép miệng rồi hiện SẮC MẶT thật — cảm xúc thành phản ứng cuối câu.
  function talkEnd(canvas, npc, emotion) {
    if (!canvas || !npc) return;
    canvas.dataset.talking = '';
    draw(canvas, npc, emotion);
  }

  function rest(canvas, npc) {
    if (!npc || !canvas) return;
    canvas.dataset.talking = '';
    const im = img('mouth/' + npc.id + '_rest.png');
    if (ready(im)) paint(canvas, im);
  }

  // ---- phương án dự phòng: bộ mặt vẽ tay 32×32 của v0.1–v0.6 ------------------
  function px(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(x, y, w, h); }

  function drawFallback(canvas, npc, emotion) {
    if (canvas.width !== 32) { canvas.width = 32; canvas.height = 32; }
    const g = canvas.getContext('2d');
    const P = npc.palette;
    g.imageSmoothingEnabled = false;
    px(g, 0, 0, 32, 32, '#241e35');
    px(g, 6, 25, 20, 7, P.top);
    px(g, 13, 23, 6, 3, P.skin);
    px(g, 8, 6, 16, 17, P.skin);
    if (npc.id === 'me_bim_sua') {
      px(g, 7, 4, 18, 5, P.hair); px(g, 6, 6, 3, 9, P.hair); px(g, 23, 6, 3, 7, P.hair);
      px(g, 12, 1, 8, 4, P.hair);
    } else if (npc.id === 'sinh_vien') {
      px(g, 7, 4, 18, 4, P.hair); px(g, 7, 6, 2, 5, P.hair); px(g, 23, 6, 2, 5, P.hair);
    } else {
      px(g, 6, 3, 20, 5, P.hair); px(g, 5, 6, 4, 18, P.hair); px(g, 23, 6, 4, 18, P.hair);
    }
    const ink = '#221a12', white = '#fff';
    const eyeY = 13;
    function eyes(open) {
      if (open) {
        px(g, 11, eyeY, 3, 3, white); px(g, 18, eyeY, 3, 3, white);
        px(g, 12, eyeY + 1, 1, 2, ink); px(g, 19, eyeY + 1, 1, 2, ink);
      } else {
        px(g, 11, eyeY + 1, 3, 1, ink); px(g, 18, eyeY + 1, 3, 1, ink);
      }
    }
    switch (emotion) {
      case 'interested':
        eyes(true);
        px(g, 11, eyeY - 3, 3, 1, ink); px(g, 18, eyeY - 3, 3, 1, ink);
        px(g, 13, 19, 6, 2, ink); px(g, 14, 20, 4, 1, '#a33');
        break;
      case 'amused':
        eyes(false);
        px(g, 12, 19, 8, 2, ink); px(g, 13, 20, 6, 2, '#a33');
        px(g, 9, 17, 2, 2, '#e88'); px(g, 21, 17, 2, 2, '#e88');
        break;
      case 'suspicious':
        px(g, 11, eyeY, 3, 2, white); px(g, 18, eyeY, 3, 2, white);
        px(g, 12, eyeY, 1, 2, ink); px(g, 19, eyeY, 1, 2, ink);
        px(g, 10, eyeY - 2, 4, 1, ink); px(g, 18, eyeY - 2, 4, 1, ink);
        px(g, 13, 19, 5, 1, ink);
        break;
      case 'angry':
        px(g, 11, eyeY, 3, 2, white); px(g, 18, eyeY, 3, 2, white);
        px(g, 12, eyeY, 1, 2, '#c22'); px(g, 19, eyeY, 1, 2, '#c22');
        px(g, 10, eyeY - 2, 4, 2, ink); px(g, 18, eyeY - 2, 4, 2, ink);
        px(g, 11, eyeY - 3, 3, 1, ink); px(g, 18, eyeY - 3, 3, 1, ink);
        px(g, 12, 19, 8, 1, ink); px(g, 12, 20, 2, 1, ink); px(g, 18, 20, 2, 1, ink);
        break;
      case 'chan':
        px(g, 11, eyeY + 1, 3, 2, white); px(g, 18, eyeY + 1, 3, 2, white);
        px(g, 11, eyeY, 3, 1, ink); px(g, 18, eyeY, 3, 1, ink);
        px(g, 12, eyeY + 2, 1, 1, ink); px(g, 19, eyeY + 2, 1, 1, ink);
        px(g, 10, eyeY - 1, 4, 1, ink); px(g, 18, eyeY - 1, 4, 1, ink);
        px(g, 14, 20, 4, 1, ink);
        px(g, 25, 8, 1, 1, ink); px(g, 27, 6, 1, 1, ink); px(g, 26, 4, 1, 1, ink);
        break;
      case 'nguong':
        px(g, 11, eyeY, 3, 1, ink); px(g, 12, eyeY + 1, 1, 1, ink);
        px(g, 18, eyeY, 3, 1, ink); px(g, 20, eyeY + 1, 1, 1, ink);
        px(g, 8, 16, 4, 3, '#f28'); px(g, 20, 16, 4, 3, '#f28');
        px(g, 8, 17, 1, 1, '#fff'); px(g, 23, 17, 1, 1, '#fff');
        px(g, 13, 19, 2, 1, ink); px(g, 15, 20, 2, 1, ink); px(g, 17, 19, 2, 1, ink);
        break;
      case 'cam_dong':
        px(g, 10, eyeY - 1, 5, 5, white); px(g, 17, eyeY - 1, 5, 5, white);
        px(g, 11, eyeY, 3, 3, ink); px(g, 18, eyeY, 3, 3, ink);
        px(g, 11, eyeY, 1, 1, white); px(g, 18, eyeY, 1, 1, white);
        px(g, 13, eyeY + 2, 1, 1, white); px(g, 20, eyeY + 2, 1, 1, white);
        px(g, 10, eyeY - 3, 4, 1, ink); px(g, 18, eyeY - 3, 4, 1, ink);
        px(g, 21, eyeY + 4, 2, 3, '#6cf');
        px(g, 13, 19, 6, 1, ink); px(g, 12, 18, 1, 1, ink); px(g, 19, 18, 1, 1, ink);
        break;
      case 'phan_khich':
        px(g, 10, eyeY - 1, 5, 5, white); px(g, 17, eyeY - 1, 5, 5, white);
        px(g, 12, eyeY, 1, 3, ink); px(g, 11, eyeY + 1, 3, 1, ink);
        px(g, 19, eyeY, 1, 3, ink); px(g, 18, eyeY + 1, 3, 1, ink);
        px(g, 10, eyeY - 4, 4, 1, ink); px(g, 18, eyeY - 4, 4, 1, ink);
        px(g, 12, 18, 8, 4, ink); px(g, 13, 19, 6, 2, '#a33');
        px(g, 9, 16, 2, 2, '#e88'); px(g, 21, 16, 2, 2, '#e88');
        px(g, 26, 5, 1, 1, '#ffd34d'); px(g, 25, 7, 1, 1, '#ffd34d'); px(g, 28, 8, 1, 1, '#ffd34d');
        break;
      case 'buc_minh':
        px(g, 11, eyeY, 3, 3, white); px(g, 12, eyeY + 1, 1, 2, ink);
        px(g, 18, eyeY + 1, 3, 1, ink);
        px(g, 10, eyeY - 3, 4, 1, ink); px(g, 18, eyeY - 2, 4, 2, ink);
        px(g, 13, 19, 5, 1, ink); px(g, 17, 20, 2, 1, ink);
        px(g, 22, 6, 1, 3, '#c22'); px(g, 21, 7, 3, 1, '#c22');
        px(g, 24, 8, 1, 2, '#c22'); px(g, 23, 9, 3, 1, '#c22');
        break;
      default:
        eyes(true);
        px(g, 11, eyeY - 2, 3, 1, ink); px(g, 18, eyeY - 2, 3, 1, ink);
        px(g, 13, 19, 6, 1, ink);
    }
  }

  // Nạp sẵn ngay khi trang mở — 29 tấm, tổng ~276KB, để lúc gõ cửa không bị khựng.
  if (typeof XDH !== 'undefined' && XDH.NPCS) preload(XDH.NPCS);

  return { draw, mouth, rest, talkStart, talkEnd, hasMouths, preload };
})();
