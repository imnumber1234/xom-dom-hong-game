// Procedural 32×32 pixel portraits, 5 emotions per NPC. v0.1 art baseline
// (nano-banana upgrade queued in pending.md — same API: draw(canvas, npc, emotion)).
XDH.Portraits = (function () {

  function px(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(x, y, w, h); }

  function draw(canvas, npc, emotion) {
    const g = canvas.getContext('2d');
    const P = npc.palette;
    g.imageSmoothingEnabled = false;
    // bg
    px(g, 0, 0, 32, 32, '#241e35');
    // shoulders / top
    px(g, 6, 25, 20, 7, P.top);
    px(g, 13, 23, 6, 3, P.skin); // neck
    // head
    px(g, 8, 6, 16, 17, P.skin);
    // hair per NPC
    if (npc.id === 'me_bim_sua') {          // bun + side part
      px(g, 7, 4, 18, 5, P.hair); px(g, 6, 6, 3, 9, P.hair); px(g, 23, 6, 3, 7, P.hair);
      px(g, 12, 1, 8, 4, P.hair);
    } else if (npc.id === 'sinh_vien') {    // short crop
      px(g, 7, 4, 18, 4, P.hair); px(g, 7, 6, 2, 5, P.hair); px(g, 23, 6, 2, 5, P.hair);
    } else {                                // gen z — long dyed hair
      px(g, 6, 3, 20, 5, P.hair); px(g, 5, 6, 4, 18, P.hair); px(g, 23, 6, 4, 18, P.hair);
    }
    // eyes + brows + mouth per emotion
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
        px(g, 11, eyeY - 3, 3, 1, ink); px(g, 18, eyeY - 3, 3, 1, ink); // raised brows
        px(g, 13, 19, 6, 2, ink); px(g, 14, 20, 4, 1, '#a33');          // open smile
        break;
      case 'amused':
        eyes(false);                                                     // happy closed eyes
        px(g, 12, 19, 8, 2, ink); px(g, 13, 20, 6, 2, '#a33');           // big laugh
        px(g, 9, 17, 2, 2, '#e88'); px(g, 21, 17, 2, 2, '#e88');         // blush
        break;
      case 'suspicious':
        px(g, 11, eyeY, 3, 2, white); px(g, 18, eyeY, 3, 2, white);      // narrowed
        px(g, 12, eyeY, 1, 2, ink); px(g, 19, eyeY, 1, 2, ink);
        px(g, 10, eyeY - 2, 4, 1, ink); px(g, 18, eyeY - 2, 4, 1, ink);  // flat brows
        px(g, 13, 19, 5, 1, ink);                                        // flat mouth
        break;
      case 'angry':
        px(g, 11, eyeY, 3, 2, white); px(g, 18, eyeY, 3, 2, white);
        px(g, 12, eyeY, 1, 2, '#c22'); px(g, 19, eyeY, 1, 2, '#c22');
        px(g, 10, eyeY - 2, 4, 2, ink); px(g, 18, eyeY - 2, 4, 2, ink);  // slanted brows
        px(g, 11, eyeY - 3, 3, 1, ink); px(g, 18, eyeY - 3, 3, 1, ink);
        px(g, 12, 19, 8, 1, ink); px(g, 12, 20, 2, 1, ink); px(g, 18, 20, 2, 1, ink); // frown
        break;
      // ===== v0.6 F4 — 5 cảm xúc VẼ THÊM bằng code (Q6 = A). Mỗi cái phải NHÌN KHÁC thật,
      // không phải chỉ đổi cái nhãn (bài học anh Khiêm: nhãn không phải là phần nhìn).
      case 'chan':        // CHÁN — quan trọng nhất: thẻ Ly ghi "chán rất nhanh, mắt đờ ra"
        px(g, 11, eyeY + 1, 3, 2, white); px(g, 18, eyeY + 1, 3, 2, white);   // mắt sụp một nửa
        px(g, 11, eyeY, 3, 1, ink); px(g, 18, eyeY, 3, 1, ink);               // mí trên nặng trịch
        px(g, 12, eyeY + 2, 1, 1, ink); px(g, 19, eyeY + 2, 1, 1, ink);       // con ngươi trôi xuống
        px(g, 10, eyeY - 1, 4, 1, ink); px(g, 18, eyeY - 1, 4, 1, ink);       // chân mày rũ, sát mắt
        px(g, 14, 20, 4, 1, ink);                                             // miệng bẹt, lệch xuống
        px(g, 25, 8, 1, 1, ink); px(g, 27, 6, 1, 1, ink); px(g, 26, 4, 1, 1, ink);  // "…" bay lên
        break;
      case 'nguong':      // NGƯỢNG — nhắm tịt mắt, má đỏ rực, miệng méo
        px(g, 11, eyeY, 3, 1, ink); px(g, 12, eyeY + 1, 1, 1, ink);
        px(g, 18, eyeY, 3, 1, ink); px(g, 20, eyeY + 1, 1, 1, ink);           // mắt nhắm cong
        px(g, 8, 16, 4, 3, '#f28'); px(g, 20, 16, 4, 3, '#f28');              // má đỏ to
        px(g, 8, 17, 1, 1, '#fff'); px(g, 23, 17, 1, 1, '#fff');
        px(g, 13, 19, 2, 1, ink); px(g, 15, 20, 2, 1, ink); px(g, 17, 19, 2, 1, ink);  // miệng lượn sóng
        break;
      case 'cam_dong':    // CẢM ĐỘNG — mắt to long lanh + giọt nước mắt + cười nhẹ
        px(g, 10, eyeY - 1, 5, 5, white); px(g, 17, eyeY - 1, 5, 5, white);
        px(g, 11, eyeY, 3, 3, ink); px(g, 18, eyeY, 3, 3, ink);
        px(g, 11, eyeY, 1, 1, white); px(g, 18, eyeY, 1, 1, white);           // đốm sáng
        px(g, 13, eyeY + 2, 1, 1, white); px(g, 20, eyeY + 2, 1, 1, white);
        px(g, 10, eyeY - 3, 4, 1, ink); px(g, 18, eyeY - 3, 4, 1, ink);       // chân mày nhướn cong
        px(g, 21, eyeY + 4, 2, 3, '#6cf');                                    // giọt nước mắt
        px(g, 13, 19, 6, 1, ink); px(g, 12, 18, 1, 1, ink); px(g, 19, 18, 1, 1, ink); // cười nhẹ
        break;
      case 'phan_khich':  // PHẤN KHÍCH — mắt lấp lánh, mồm há to, má hồng
        px(g, 10, eyeY - 1, 5, 5, white); px(g, 17, eyeY - 1, 5, 5, white);
        px(g, 12, eyeY, 1, 3, ink); px(g, 11, eyeY + 1, 3, 1, ink);           // ngôi sao mắt trái
        px(g, 19, eyeY, 1, 3, ink); px(g, 18, eyeY + 1, 3, 1, ink);           // ngôi sao mắt phải
        px(g, 10, eyeY - 4, 4, 1, ink); px(g, 18, eyeY - 4, 4, 1, ink);       // chân mày nhảy lên cao
        px(g, 12, 18, 8, 4, ink); px(g, 13, 19, 6, 2, '#a33');                // mồm há to
        px(g, 9, 16, 2, 2, '#e88'); px(g, 21, 16, 2, 2, '#e88');
        px(g, 26, 5, 1, 1, '#ffd34d'); px(g, 25, 7, 1, 1, '#ffd34d'); px(g, 28, 8, 1, 1, '#ffd34d');
        break;
      case 'buc_minh':    // BỰC MÌNH — một mắt nheo, miệng lệch, gân xanh nổi
        px(g, 11, eyeY, 3, 3, white); px(g, 12, eyeY + 1, 1, 2, ink);         // mắt trái mở
        px(g, 18, eyeY + 1, 3, 1, ink);                                       // mắt phải nheo tịt
        px(g, 10, eyeY - 3, 4, 1, ink); px(g, 18, eyeY - 2, 4, 2, ink);       // hai chân mày lệch nhau
        px(g, 13, 19, 5, 1, ink); px(g, 17, 20, 2, 1, ink);                   // miệng bẹt, kéo lệch
        px(g, 22, 6, 1, 3, '#c22'); px(g, 21, 7, 3, 1, '#c22');               // dấu gân nổi (✚)
        px(g, 24, 8, 1, 2, '#c22'); px(g, 23, 9, 3, 1, '#c22');
        break;
      default: // neutral
        eyes(true);
        px(g, 11, eyeY - 2, 3, 1, ink); px(g, 18, eyeY - 2, 3, 1, ink);
        px(g, 13, 19, 6, 1, ink);
    }
  }

  return { draw };
})();
