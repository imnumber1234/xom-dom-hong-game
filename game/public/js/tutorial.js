// Nhà Bà Năm — HƯỚNG DẪN 4 BƯỚC (phương án A, Lucas chốt 2026-08-09).
// 100% kịch bản, MIỄN PHÍ (0 lần gọi AI), tất định, BỎ QUA ĐƯỢC, song ngữ.
// Bà Năm nghễnh ngãng — đó là cái máy gây cười.
//
// Bốn bước, mỗi bước là MỘT hành động thật của người chơi, dạy đúng 4 thứ của game thật:
//   1. nói chuyện (gõ hoặc mic)  2. kể chuyện KHỚP ĐỒ  3. chịu bị HỎI VẶN  4. chốt cửa
// Ma sói kết bằng nút CẮN; Kẹt Tiền kết bằng câu cảm ơn rồi nhận tiền (mode này không có CẮN).
XDH.Tut = (function () {
  const $ = (id) => document.getElementById(id);

  const NPC = {
    id: 'ba_nam', name: 'Bà Năm (hướng dẫn)', blipHz: 240,
    palette: { skin: '#e8c9a0', hair: '#d9d9d9', top: '#7d6b9e' }
  };

  const STEPS = 4;

  // ---------- kịch bản MA SÓI ----------
  const MS = {
    vi: {
      g1: 'HẢ? AI ĐÓ NGOÀI CỬA?? Nói TO TO lên nghen, bà nghe hơi kém!',
      s1: 'Chào bà, rồi xưng mình là SHIPPER giao hàng. Gõ chữ vào ô dưới, hoặc giữ nút 🎙️ nói rồi thả.',
      b1a: 'SHIPPER hả?? Bà tưởng cháu nói "HẤP DỪA" chớ! Trời, mắt bà kém chớ bà nhìn đồ cháu mặc là biết liền à nghen…',
      t1: 'Đồ mặc mà khớp câu chuyện là bà tin liền á.',
      b1b: 'Mà khuya lơ khuya lắc, shipper giao CÁI GÌ cho bà già này mới được?',
      s2: 'Kể một chuyện KHỚP với bộ đồ đang mặc: nói đây là QUÀ SINH NHẬT của bà — người yêu cũ gửi 😏',
      b2a: 'QUÀ SINH NHẬT?? TỪ ÔNG BA HẢ?!? Trời đất quỷ thần thiên địa ơi… NĂM MƯƠI NĂM rồi mà ổng còn nhớ sinh nhật bà…',
      t2: 'Ổng còn nhớ… hic. Người đâu mà dễ cưng.',
      b2c: 'Mà khoan… ông Ba gửi thiệt hả? Ổng ghi tên gì trong tấm thiệp? Nói bà nghe coi!',
      s3: 'Bà HỎI VẶN rồi đó — nhà thật cũng hay hỏi vặn kiểu này. Cứ trả lời một chi tiết CỤ THỂ (tên trong thiệp, chữ ổng viết). Càng cụ thể càng dễ tin.',
      b3a: 'Ừ… ừ đúng ổng rồi, đúng cái kiểu ổng viết luôn. Trời ơi ông Ba…',
      b3b: 'VÔ ĐI CON, VÔ NHÀ UỐNG MIẾNG NƯỚC! Cửa bà mở toang rồi nè, thấy hông?',
      t3: 'Nhìn cánh cửa nhỏ trên góc kìa — cửa mở tới đâu là bà tin tới đó.',
      s4: 'Cửa mở = thắng nhà này. Giờ tới phần của MA SÓI 🐺 — bấm nút CẮN!',
      k1: '(phựt… đèn tắt. Tiếng "soạt soạt soạt". Một cuộn len hồng lăn nhẹ ra tới cửa.)',
      k2: '👵➡️🧶 Bà Năm đã… hoá thành một giỏ len ấm áp. Bạn nhặt được 30k tiền lì xì trong hộp bánh quy.',
      done: 'Học nghề XONG! Ra gõ 3 nhà thật: NGHE người ta mê cái gì, kể chuyện KHỚP ĐỒ, và chịu trả lời khi bị hỏi vặn.'
    },
    en: {
      g1: "EHH? WHO'S OUT THERE?? Speak UP dear, grandma's ears are not what they used to be!",
      s1: 'Greet her, then say you are a DELIVERY DRIVER. Type in the box below, or hold 🎙️ to speak and release.',
      b1a: 'DELIVERY?? Grandma thought you said "CELERY"! My eyes are bad, but one look at your OUTFIT and I can tell everything, you know…',
      t1: 'If the outfit matches the story, grandma believes it right away.',
      b1b: "But it's the middle of the night — WHAT could a delivery driver possibly bring an old lady?",
      s2: "Tell a story that MATCHES your outfit: say it's her BIRTHDAY GIFT — sent by her old flame 😏",
      b2a: 'A BIRTHDAY GIFT?? FROM MISTER BA?!? Oh heavens above… FIFTY YEARS and that man still remembers my birthday…',
      t2: 'He still remembers… oh my. What a sweet man.',
      b2c: 'But hold on… Mister Ba really sent it? What name did he write on the card? Tell me!',
      s3: 'She is PROBING you — real neighbours do this too. Answer with one SPECIFIC detail (the name on the card, how he signed it). The more specific, the more believable.',
      b3a: "Yes… yes that's him alright, that's exactly how he writes. Oh, Mister Ba…",
      b3b: 'COME IN CHILD, COME HAVE SOME WATER! My door is wide open now, see?',
      t3: 'Look at the little door up in the corner — how far it opens is how much she trusts you.',
      s4: 'An open door = you win the house. Now for the WEREWOLF part 🐺 — press BITE!',
      k1: '(click… lights out. A soft "shff shff shff". A pink ball of yarn rolls gently to the door.)',
      k2: '👵➡️🧶 Bà Năm has… become a basket of warm yarn. You find 30k of lucky money in a cookie tin.',
      done: 'Training DONE! Now knock on the 3 real houses: LISTEN for what they love, match your STORY to your OUTFIT, and answer when they probe you.'
    }
  };

  // ---------- kịch bản KẸT TIỀN (không có CẮN — kết bằng câu cảm ơn) ----------
  const KT = {
    vi: {
      g1: 'HẢ? AI ĐÓ NGOÀI CỬA?? Nói TO TO lên nghen, bà nghe hơi kém!',
      s1: 'Chào bà, rồi nói bạn là SINH VIÊN bị kẹt lại xóm này. Gõ chữ vào ô dưới, hoặc giữ nút 🎙️ nói rồi thả.',
      b1a: 'SINH VIÊN hả?? Bà tưởng cháu nói "SIÊNG NĂNG" chớ! Rồi rồi, mà kẹt là kẹt làm sao?',
      t1: 'Nghe cái giọng thiệt thà cũng thương thương.',
      b1b: 'Nói bà nghe coi, chớ bà đứng đây nãy giờ mỏi chân rồi nè.',
      s2: 'Kể hoàn cảnh CỤ THỂ: hết tiền, điện thoại hết pin từ trưa, cả ngày chưa ăn gì.',
      b2a: 'Trời đất ơi… cả ngày chưa có hột cơm nào trong bụng hả con? Bà nghe mà xót ruột.',
      t2: 'Tội nghiệp… hồi xưa bà lên thành phố cũng y chang.',
      b2c: 'Mà con học trường nào, ở trọ khúc nào? Nói bà nghe coi cho chắc.',
      s3: 'Bà HỎI VẶN rồi đó — nhà thật cũng hay hỏi vặn kiểu này. Cứ trả lời một chi tiết CỤ THỂ (tên trường, tên đường). Càng cụ thể càng dễ tin.',
      b3a: 'Ừ ừ, bà biết chỗ đó, gần cái chợ nhỏ đúng hông. Rồi rồi, bà tin con.',
      b3b: 'Đứng đó chờ bà xíu, bà vô lấy cho ít tiền… Cửa bà mở rồi nè, thấy hông?',
      t3: 'Nhìn cánh cửa nhỏ trên góc kìa — cửa mở tới đâu là bà tin tới đó.',
      s4: 'Bà chịu giúp rồi. Nói một câu CẢM ƠN cho tử tế rồi nhận nha.',
      k1: 'Cầm đỡ nghen con, ba chục thôi hà, ra đầu hẻm mua ổ bánh mì cho ấm bụng.',
      k2: '💵 Bà Năm dúi vào tay bạn 30k. Bà còn dặn với theo: "Đi đường cẩn thận nghen con!"',
      done: 'Học nghề XONG! Ra gõ 3 nhà thật: NGHE người ta mê cái gì, kể hoàn cảnh CỤ THỂ, và chịu trả lời khi bị hỏi vặn.'
    },
    en: {
      g1: "EHH? WHO'S OUT THERE?? Speak UP dear, grandma's ears are not what they used to be!",
      s1: 'Greet her, then say you are a STUDENT stranded in this neighbourhood. Type below, or hold 🎙️ to speak.',
      b1a: 'A STUDENT?? Grandma thought you said "A PRUDENT"! Alright, alright — stranded how, exactly?',
      t1: 'That voice sounds honest enough.',
      b1b: "Go on and tell me, my legs are getting tired standing here.",
      s2: 'Give SPECIFICS: out of money, phone died at noon, nothing to eat all day.',
      b2a: 'Oh my goodness… not a grain of rice all day, child? That breaks my heart.',
      t2: 'Poor thing… I was just the same when I first came to the city.',
      b2c: 'But which school do you go to, and where do you rent? Tell me, just to be sure.',
      s3: 'She is PROBING you — real neighbours do this too. Answer with one SPECIFIC detail (school name, street name). The more specific, the more believable.',
      b3a: "Ah yes, I know that place, near the little market, right? Alright, I believe you.",
      b3b: 'Wait right there, let me go get you a little money… My door is open now, see?',
      t3: 'Look at the little door up in the corner — how far it opens is how much she trusts you.',
      s4: 'She has agreed to help. Say a proper THANK YOU and take it.',
      k1: "Here, take this, only thirty thousand — go buy yourself a bánh mì at the corner.",
      k2: '💵 Bà Năm presses 30k into your hand. She calls after you: "Get home safe, child!"',
      done: 'Training DONE! Now knock on the 3 real houses: LISTEN for what they love, give SPECIFICS, and answer when they probe you.'
    }
  };

  const S = () => {
    const pack = XDH.isKetTien() ? KT : MS;
    return pack[XDH.lang] || pack.vi;
  };

  let beat = -1;   // -1 nghỉ · 0 chờ bước 1 · 1 chờ bước 2 · 2 chờ bước 3 · 3 chờ bước 4

  // Thanh gợi ý luôn có SỐ BƯỚC — người chơi biết mình đang ở đâu và còn mấy bước.
  function step(n, text) {
    const el = $('tut-hint');
    const label = XDH.lang === 'en' ? `STEP ${n}/${STEPS}` : `BƯỚC ${n}/${STEPS}`;
    el.innerHTML = `<b style="color:var(--ok)">${label}</b> — 👉 ${text}`;
    el.style.display = 'block';
    $('btn-tut-skip').textContent = XDH.lang === 'en' ? '⏭️ Skip the tutorial' : '⏭️ Bỏ qua hướng dẫn';
  }

  async function start() {
    if (XDH.Convo.isActive() || beat !== -1) return;
    beat = 0;
    XDH.UI.openConvo(NPC, { ...XDH.RULES.START });
    XDH.UI.hideOpeners();                        // 3 câu mở gợi ý là cho nhà THẬT — giữ 4 bước sạch
    $('btn-tut-skip').style.display = 'inline-block';
    $('btn-kill').textContent = XDH.lang === 'en' ? '🐺 BITE' : '🐺 CẮN';
    XDH.UI.setBusy(false);
    await XDH.UI.typeNpcLine(S().g1, 'suspicious', NPC);
    step(1, S().s1);
  }

  async function playerSays(text) {
    text = (text || '').trim();
    if (!text || beat < 0) return;
    XDH.UI.echoPlayer(text);
    XDH.UI.setBusy(true);
    const L = S();

    if (beat === 0) {
      beat = -9;                                   // khoá ô nhập trong lúc bà nói
      await pause();
      await XDH.UI.typeNpcLine(L.b1a, 'amused', NPC);
      XDH.UI.setThought(L.t1);
      XDH.UI.setDoorStage(1);
      await XDH.UI.typeNpcLine(L.b1b, 'interested', NPC);
      step(2, L.s2);
      beat = 1;
      XDH.UI.setBusy(false);

    } else if (beat === 1) {
      beat = -9;
      await pause();
      await XDH.UI.typeNpcLine(L.b2a, 'cam_dong', NPC);
      XDH.UI.setConvoState('trusting');
      XDH.UI.setThought(L.t2);
      XDH.UI.setDoorStage(2);
      await XDH.UI.typeNpcLine(L.b2c, 'suspicious', NPC);   // BƯỚC 3: bà hỏi vặn
      step(3, L.s3);
      beat = 2;
      XDH.UI.setBusy(false);

    } else if (beat === 2) {
      beat = -9;
      await pause();
      await XDH.UI.typeNpcLine(L.b3a, 'interested', NPC);
      XDH.UI.setDoorStage(3);
      await XDH.UI.typeNpcLine(L.b3b, 'amused', NPC);
      XDH.UI.setDoorStage(4);
      XDH.UI.setThought(L.t3);                              // chỉ vào cánh cửa = thước đo lòng tin
      step(4, L.s4);
      beat = 3;
      if (XDH.isKetTien()) {
        XDH.UI.setBusy(false);        // Kẹt Tiền: bước 4 là GÕ một câu cảm ơn
      } else {
        $('btn-kill').style.display = 'block';   // ma sói: bước 4 là bấm CẮN
      }

    } else if (beat === 3 && XDH.isKetTien()) {
      beat = -9;
      await pause();
      await finishKetTien();
    }
  }

  function pause() {
    XDH.UI.showThinking(NPC);
    return new Promise(r => setTimeout(r, 700)).then(() => XDH.UI.hideThinking());
  }

  // Kết của Kẹt Tiền: bà cho tiền. KHÔNG có cảnh CẮN ở chế độ này.
  async function finishKetTien() {
    const L = S();
    await XDH.UI.typeNpcLine(L.k1, 'amused', NPC);
    await XDH.UI.typeNpcLine(L.k2, 'neutral', NPC);
    XDH.run.money += 30;
    XDH.UI.refreshHud();
    localStorage.setItem('xdh_tut_done', '1');
    step(STEPS, L.done);
    await new Promise(r => setTimeout(r, 2600));
    end();
  }

  async function kill() {
    if (beat !== 3 || XDH.isKetTien()) return;
    beat = -9;
    $('btn-kill').style.display = 'none';
    const L = S();
    const dlg = $('dialogue');
    dlg.style.transition = 'opacity .8s';
    dlg.style.opacity = '0.15';
    await new Promise(r => setTimeout(r, 900));
    dlg.style.opacity = '1';
    await XDH.UI.typeNpcLine(L.k1, 'neutral', NPC);
    await XDH.UI.typeNpcLine(L.k2, 'neutral', NPC);
    XDH.run.money += 30;
    XDH.UI.refreshHud();
    localStorage.setItem('xdh_tut_done', '1');
    step(STEPS, L.done);
    await new Promise(r => setTimeout(r, 2600));
    end();
  }

  function end() {
    beat = -1;
    $('btn-tut-skip').style.display = 'none';
    $('btn-kill').style.display = 'none';
    $('tut-hint').style.display = 'none';
    localStorage.setItem('xdh_tut_done', '1');
    XDH.UI.setBusy(false);
    XDH.UI.closeConvo();
    XDH.UI.toast(XDH.lang === 'en'
      ? '👉 Now go knock on a real house. Walk up to a door and press E.'
      : '👉 Giờ ra gõ nhà thật đi. Đi tới trước cửa rồi bấm E.', 5200);
  }

  return { start, playerSays, kill, end, isActive: () => beat !== -1 };
})();
