// Nhà Bà Năm — tutorial house 0 (§0 #6-7, Q-E). 100% scripted, FREE (zero AI calls),
// deterministic, skippable, bilingual (§0 #10). Bà Năm is hard of hearing — the comedy engine.
XDH.Tut = (function () {
  const $ = (id) => document.getElementById(id);

  const NPC = {
    id: 'ba_nam', name: 'Bà Năm (hướng dẫn)', blipHz: 240,
    palette: { skin: '#e8c9a0', hair: '#d9d9d9', top: '#7d6b9e' }
  };

  const T = {
    vi: {
      g1: 'HẢ? AI ĐÓ NGOÀI CỬA?? Nói TO TO lên nghen, bà nghe hơi kém!',
      hint1: 'Chào bà + xưng là SHIPPER giao hàng (gõ chữ hoặc giữ 🎙️ nói rồi thả).',
      b1a: 'SHIPPER hả?? Bà tưởng cháu nói "HẤP DỪA" chớ! Trời, mắt bà kém chớ bà nhìn đồ cháu mặc là biết liền à nghen…',
      t1: 'Đồ mặc mà khớp câu chuyện là bà tin liền á.',
      b1b: 'Mà khuya lơ khuya lắc, shipper giao CÁI GÌ cho bà già này mới được?',
      hint2: 'Nói: đây là QUÀ SINH NHẬT của bà — NGƯỜI YÊU CŨ gửi tặng 😏',
      b2a: 'QUÀ SINH NHẬT?? TỪ ÔNG BA HẢ?!? Trời đất quỷ thần thiên địa ơi… NĂM MƯƠI NĂM rồi mà ổng còn nhớ sinh nhật bà…',
      t2: 'Ổng còn nhớ… hic. Người đâu mà dễ cưng.',
      b2b: 'VÔ ĐI CON, VÔ NHÀ UỐNG MIẾNG NƯỚC! Cửa mở rồi đó, khỏi khách sáo!',
      killHint: 'Cửa mở rồi… giờ tới phần của MA SÓI 🐺 — bấm nút CẮN!',
      k1: '(phựt… đèn tắt. Tiếng "soạt soạt soạt". Một cuộn len hồng lăn nhẹ ra tới cửa.)',
      k2: '👵➡️🧶 Bà Năm đã… hoá thành một giỏ len ấm áp. Bạn nhặt được 30k tiền lì xì trong hộp bánh quy.',
      done: 'Học nghề XONG! Ra gõ 3 nhà thật: NGHE điểm yếu của họ, kể chuyện KHỚP ĐỒ, đừng vội đòi vào.'
    },
    en: {
      g1: "EHH? WHO'S OUT THERE?? Speak UP dear, grandma's ears are not what they used to be!",
      hint1: 'Greet her + say you are a DELIVERY DRIVER (type, or hold 🎙️ to speak, release to send).',
      b1a: 'DELIVERY?? Grandma thought you said "CELERY"! My eyes are bad, but one look at your OUTFIT and I can tell everything, you know…',
      t1: 'If the outfit matches the story, grandma believes it right away.',
      b1b: "But it's the middle of the night — WHAT could a delivery driver possibly bring an old lady?",
      hint2: "Say: it's her BIRTHDAY GIFT — sent by her OLD FLAME 😏",
      b2a: 'A BIRTHDAY GIFT?? FROM MISTER BA?!? Oh heavens above… FIFTY YEARS and that man still remembers my birthday…',
      t2: 'He still remembers… oh my. What a sweet man.',
      b2b: 'COME IN CHILD, COME HAVE SOME WATER! The door is open, no need to be shy!',
      killHint: "The door is open… now for the WEREWOLF part 🐺 — press BITE!",
      k1: '(click… lights out. A soft "shff shff shff". A pink ball of yarn rolls gently to the door.)',
      k2: '👵➡️🧶 Bà Năm has… become a basket of warm yarn. You find 30k of lucky money in a cookie tin.',
      done: 'Training DONE! Now knock on the 3 real houses: LISTEN for their weakness, match your STORY to your OUTFIT, and never rush the door.'
    }
  };
  const L = () => T[XDH.lang] || T.vi;

  let beat = -1;   // -1 idle · 0 chờ câu chào · 1 chờ câu quà sinh nhật · 2 chờ CẮN

  function hint(text) {
    const el = $('tut-hint');
    el.textContent = '👉 ' + text;
    el.style.display = 'block';
  }

  async function start() {
    if (XDH.Convo.isActive()) return;
    beat = 0;
    XDH.UI.openConvo(NPC, { ...XDH.RULES.START });
    $('btn-tut-skip').style.display = 'inline-block';
    $('btn-kill').textContent = XDH.lang === 'en' ? '🐺 BITE' : '🐺 CẮN';
    XDH.UI.setBusy(false);
    await XDH.UI.typeNpcLine(L().g1, 'suspicious', NPC);
    hint(L().hint1);
  }

  async function playerSays(text) {
    text = (text || '').trim();
    if (!text || beat < 0) return;
    XDH.UI.echoPlayer(text);
    XDH.UI.setBusy(true);

    if (beat === 0) {
      beat = -9;   // lock while typing
      XDH.UI.showThinking(NPC);
      await new Promise(r => setTimeout(r, 700));
      XDH.UI.hideThinking();
      await XDH.UI.typeNpcLine(L().b1a, 'amused', NPC);
      XDH.UI.setThought(L().t1);
      XDH.UI.setDoorStage(1);
      await XDH.UI.typeNpcLine(L().b1b, 'interested', NPC);
      hint(L().hint2);
      beat = 1;
      XDH.UI.setBusy(false);
    } else if (beat === 1) {
      beat = -9;
      XDH.UI.showThinking(NPC);
      await new Promise(r => setTimeout(r, 700));
      XDH.UI.hideThinking();
      await XDH.UI.typeNpcLine(L().b2a, 'interested', NPC);
      XDH.UI.setConvoState('trusting');
      XDH.UI.setThought(L().t2);
      XDH.UI.setDoorStage(3);
      await XDH.UI.typeNpcLine(L().b2b, 'amused', NPC);
      XDH.UI.setDoorStage(4);
      $('btn-kill').style.display = 'block';
      hint(L().killHint);
      beat = 2;
      // input stays disabled — the only move left is the KILL button
    }
  }

  async function kill() {
    if (beat !== 2) return;
    beat = -9;
    $('btn-kill').style.display = 'none';
    const dlg = $('dialogue');
    dlg.style.transition = 'opacity .8s';
    dlg.style.opacity = '0.15';
    await new Promise(r => setTimeout(r, 900));
    dlg.style.opacity = '1';
    await XDH.UI.typeNpcLine(L().k1, 'neutral', NPC);
    await XDH.UI.typeNpcLine(L().k2, 'neutral', NPC);
    XDH.run.money += 30;
    XDH.UI.refreshHud();
    localStorage.setItem('xdh_tut_done', '1');
    hint(L().done);
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
  }

  return { start, playerSays, kill, end, isActive: () => beat !== -1 };
})();
