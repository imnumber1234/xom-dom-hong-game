// Phaser 3 neighborhood: WASD/touch walk, 3 houses, wardrobe shed, decorative food cart.
(function () {
  // W = khung nhìn (đúng bằng màn hình). WW = XÓM THẬT, rộng gấp rưỡi — người chơi đi tới đâu
  // máy quay chạy theo tới đó, nên xóm có cảm giác ĐI ĐƯỢC chứ không phải một tấm ảnh đứng yên.
  const W = 960, H = 640, WW = 1440;
  // 2026-08-14: máy cảm ứng không có phím E — bảng nhắc phải ghi "chạm", vì chính bảng đó
  // chạm được (this.prompt bắt pointerdown). Máy tính giữ nguyên chữ E.
  const KEY = (window.matchMedia && matchMedia('(pointer:coarse)').matches) ? 'chạm' : 'E';
  const HX = [230, 700, 1180];              // 3 nhà, trải đều theo chiều rộng mới
  const POS = { shed: [170, 500], cart: [1250, 500], hut: [700, 505] };

  class Xom extends Phaser.Scene {
    constructor() { super('xom'); }

    // v0.8: nạp hình 8-bit thật. Hỏng tấm nào thì makeTextures() vẽ lại tấm đó bằng code,
    // bản đồ không bao giờ trống.
    preload() {
      // v0.9 PixelLab (token mới 08-12): nhân vật THẬT 4 hướng — sói (ma sói) + người (Kẹt Tiền)
      const S = 'assets/art/sprites/';
      ['wolf', 'human'].forEach(b => ['south', 'east', 'north', 'west'].forEach(d => {
        this.load.image('pc_' + b + '_' + d, S + b + '_' + d + '.png');
        for (let i = 0; i < 4; i++)                     // 4 nhịp bước mỗi hướng (PixelLab animate)
          this.load.image('pc_' + b + '_' + d + '_w' + i, S + b + '_' + d + '_w' + i + '.png');
      }));
      // v0.9 ĐỒ THẬT vẽ lên người (inpaint + tách lớp). Hết 40 lượt miễn phí giữa chừng nên
      // mới có ÁO của sói; món nào chưa có lớp thật thì code tự rơi về hình vẽ tay. CHỈ nạp
      // những file có thật — thêm file mới thì thêm dòng ở đây.
      const L = 'assets/art/sprites/layers/';
      // Bảng lớp ĐANG CÓ THẬT trên đĩa (08-12 tối: SÓI đủ 100%; NGƯỜI thiếu nón lá 3 hướng
      // + 5 món cầm tay — hết lượt PixelLab #3, thiếu thì tự rơi về hình vẽ tay).
      const D4 = ['south', 'east', 'north', 'west'], D3 = ['south', 'east', 'west'];
      const LAYER_FILES = {
        wolf:  { shirt: { grab: D4, sinhvien: D4 }, hat: { baohiem: D4, nonla: D4 },
                 item: { trasua: D3, bo_rau: D3, thesv: D3, donhang: D3, tinnhan: D3 } },
        human: { shirt: { grab: D4, sinhvien: D4 }, hat: { baohiem: D4, nonla: ['south'] }, item: {} }
      };
      Object.entries(LAYER_FILES).forEach(([ch, slots]) =>
        Object.entries(slots).forEach(([slot, ids]) =>
          Object.entries(ids).forEach(([id, dirs]) =>
            dirs.forEach(d => this.load.image('layer_' + ch + '_' + slot + '_' + id + '_' + d,
              L + ch + '_' + slot + '_' + id + '_' + d + '.png')))));
      const A = 'assets/art/bg/';
      this.load.image('h0', A + 'house0.png');
      this.load.image('h1', A + 'house1.png');
      this.load.image('h2', A + 'house2.png');
      this.load.image('sky', A + 'sky.png');
      this.load.image('cartimg', A + 'cart.png');
      this.load.image('grassimg', A + 'grass.png');
      this.load.image('grassimg2', A + 'grass2.png');
      this.load.image('hutimg', A + 'hut.png');
      this.load.image('shedimg', A + 'shed.png');
    }

    create() {
      this.player = null;      // scene.restart(): quên con sói của lượt dựng trước, nếu không
      this.gearSpr = null;     // v0.9: lớp đồ + cờ art cũng phải quên — sprite cũ đã bị huỷ
      this.layerSprs = null;
      this.useArt = false;
      XDH.renderMirror = null; // gương tủ đồ nối lại sau khi dựng xong (tránh soi scene đã huỷ)
      this.police = null;      // v0.9: dựng lại giữa cuộc rượt thì dẹp công an + tắt còi
      this.policeCar = null;
      XDH.Blips.siren(false);
      this.makeTextures();     // drawWolfTex sẽ gọi setTexture lên một sprite đã bị huỷ

      // ground — v0.8: cỏ pixel cắt từ chính tấm xóm-ban-đêm, cho khớp với mấy căn nhà
      const gA = this.textures.exists('grassimg') ? 'grassimg' : 'grass';
      const gB = this.textures.exists('grassimg2') ? 'grassimg2' : 'grass2';
      for (let x = 0; x < WW; x += 32)
        for (let y = 0; y < H; y += 32)
          this.add.image(x + 16, y + 16, (x / 32 + y / 32) % 2 ? gA : gB).setDepth(-10);
      // road strip
      for (let x = 0; x < WW; x += 32) this.add.image(x + 16, H / 2 + 16, 'road').setDepth(-9);

      // v0.8: dải trời + núi 8-bit chạy suốt phía sau xóm (cắt ra từ chính tấm xóm-ban-đêm)
      // 2026-08-12: hạ ĐƯỜNG CHÂN TRỜI 300 → 240 để nhà đứng TRÊN CỎ chứ không nổi giữa lưng núi.
      const HORIZON = 240;
      if (this.textures.exists('sky')) {
        const sky = this.add.image(WW / 2, HORIZON / 2, 'sky').setDepth(-8);
        sky.setDisplaySize(WW, HORIZON);
      }

      // §2 sky clock: the moon IS the night timer — it arcs across, sky brightens, dawn ends the night.
      // v0.3: mode Kẹt Tiền dùng ĐÚNG đồng hồ đó, chỉ đổi mặt trăng → MẶT TRỜI, bình minh → hoàng hôn.
      const kt = XDH.isKetTien();
      this.moon = this.add.container(80, 100, [
        this.add.circle(0, 0, kt ? 56 : 34, kt ? 0xffd24a : 0xfff3c4).setAlpha(kt ? 0.14 : 0.95),
        this.add.circle(0, 0, 34, kt ? 0xffd24a : 0xfff3c4).setAlpha(0.95),
        this.add.circle(-12, -8, 30, 0x0d0a14).setAlpha(kt ? 0 : 0.25)
      ]).setDepth(51).setScrollFactor(0);        // v0.8: trăng thuộc về BẦU TRỜI, không trôi theo bước chân
      // ma sói: bóng tối đậm nhất giữa đêm · kẹt tiền: nắng sáng nhất giữa trưa
      this.nightShade = this.add.rectangle(W / 2, H / 2, W, H, kt ? 0xffe9a8 : 0x060312).setAlpha(0).setDepth(50).setScrollFactor(0);
      this.dawnGlow = this.add.rectangle(W / 2, H / 2, W, H, 0xff9a3d).setAlpha(0).setDepth(50).setScrollFactor(0);
      // v0.9 (Lucas 08-12): thiên thể THỨ HAI mọc lên ở cuối buổi —
      // ma sói: MẶT TRỜI rạng đông · Kẹt Tiền: mặt trăng lúc chập tối
      this.body2 = this.add.container(-200, 400, kt
        ? [this.add.circle(0, 0, 30, 0xfff3c4).setAlpha(0.95), this.add.circle(-10, -7, 26, 0x0d0a14).setAlpha(0.25)]
        : [this.add.circle(0, 0, 46, 0xffd24a).setAlpha(0.22), this.add.circle(0, 0, 32, 0xffdf6a), this.add.circle(0, 0, 24, 0xfff3b0).setAlpha(0.9)]
      ).setDepth(51).setScrollFactor(0).setVisible(false);

      // §6b map dressing: lamp posts along the road + fireflies (the game is NAMED after them!)
      [300, 760, 1220].forEach(x => {
        this.add.image(x, H / 2 - 14, 'lamp');
        this.add.circle(x + 9, H / 2 - 44, 26, 0xffe9a8).setAlpha(0.13);
      });
      for (let i = 0; i < 22; i++) {                       // xóm rộng hơn → thả thêm đom đóm
        const fx = 40 + Math.random() * (WW - 80), fy = 60 + Math.random() * (H - 120);
        const f = this.add.circle(fx, fy, 2, 0xffe98a).setAlpha(0.85).setDepth(52);
        this.tweens.add({
          targets: f, alpha: 0.1, duration: 600 + Math.random() * 900,
          yoyo: true, repeat: -1, delay: Math.random() * 1000
        });
        this.tweens.add({
          targets: f,
          x: fx + (Math.random() * 120 - 60), y: fy + (Math.random() * 80 - 40),
          duration: 3000 + Math.random() * 4000, yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut', delay: Math.random() * 1500
        });
      }

      // houses (top row) — door zones
      // 2026-08-12: neo ĐÁY nhà xuống mặt cỏ (origin 0.5,1) — hết cảnh nhà lơ lửng giữa núi.
      const GROUND_Y = HORIZON + 14;                 // đáy nhà cắm nhẹ vào cỏ, còn cách đường 66px
      this.houseSprites = [];
      const hx = HX;
      hx.forEach((x, i) => {
        const s = this.add.image(x, GROUND_Y, this.textures.exists('h' + i) ? 'h' + i : 'house' + i).setOrigin(0.5, 1);
        const npc = XDH.NPCS[XDH.run.houses[i].npcIdx];
        const diff = XDH.DIFFICULTY[npc.id];
        const label = (diff ? diff.stars + ' ' : '') + 'Nhà ' + npc.name.split(' (')[0] + (diff ? ' · ' + diff.level : '');
        this.add.text(x, GROUND_Y + 12, label, { fontSize: '14px', color: '#f2ecff', fontFamily: 'Segoe UI' }).setOrigin(0.5);
        // Done marker (Lucas 08-09): finished house = lights OUT + ✅ tag, readable from anywhere.
        // v0.8: nhà giờ là ẢNH nên không dán ô vuông lên cửa sổ nữa — làm TỐI CẢ CĂN NHÀ (update()).
        const tag = this.add.text(x, GROUND_Y - s.displayHeight - 12, '✅ XONG', {
          fontSize: '13px', color: '#5dffa4', fontFamily: 'Segoe UI', fontStyle: 'bold',
          backgroundColor: 'rgba(10,6,18,0.75)', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false).setDepth(52);
        this.houseSprites.push({ x, y: GROUND_Y - 30, id: i, sprite: s, doneFx: [tag] });
      });
      // §6b: identical houses → per-resident dressing (Ly neon · Tí bóng đá · Cô Sáu phơi đồ)
      this.add.rectangle(hx[0] - 62, GROUND_Y - 66, 10, 34, 0xff5dd2).setAlpha(0.9); // Ly: neon strip
      this.add.circle(hx[0] - 62, GROUND_Y - 66, 13, 0xff5dd2).setAlpha(0.18);
      this.add.circle(hx[1] + 60, GROUND_Y + 4, 7, 0xffffff);                        // Tí: quả bóng
      this.add.rectangle(hx[1] + 60, GROUND_Y + 1, 8, 2, 0x222222);
      this.add.rectangle(hx[2] - 40, GROUND_Y - 96, 60, 2, 0xcccccc);                // Cô Sáu: dây phơi
      this.add.rectangle(hx[2] - 58, GROUND_Y - 89, 12, 12, 0xffe9a8);
      this.add.rectangle(hx[2] - 36, GROUND_Y - 88, 10, 14, 0x8fd4ff);

      // wardrobe shed (bottom-left) + bánh mì cart = the powerup shop (§2)
      const shedImg = this.add.image(POS.shed[0], POS.shed[1], this.textures.exists('shedimg') ? 'shedimg' : 'shed');
      if (this.textures.exists('shedimg')) shedImg.setDisplaySize(150, 112);
      this.add.text(POS.shed[0], POS.shed[1] + 52, '🎽 Tủ đồ', { fontSize: '14px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);
      const cartImg = this.add.image(POS.cart[0], POS.cart[1], this.textures.exists('cartimg') ? 'cartimg' : 'cart');
      if (this.textures.exists('cartimg')) cartImg.setDisplaySize(160, 120);
      this.add.text(POS.cart[0], POS.cart[1] + 56, kt ? '🍜 Quán bánh mì — ĂN Ở ĐÂY' : '🍞 Bánh mì đêm — MỞ CỬA',
        { fontSize: '12px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);

      // v1.2 — 🎰 THÙNG RÁC QUAY SỐ (Lucas 08-16): cái thùng rác của xóm nhưng có 3 ô quay
      // nhấp nháy. Đứng cạnh bấm E để cược. Luật + tỉ lệ nằm hết ở casino.js.
      {
        const [sx, sy] = XDH.SLOT.POS;
        const slotImg = this.add.image(sx, sy, this.textures.exists('trashbin') ? 'trashbin' : 'cart')
          .setDepth(8).setScale(this.textures.exists('trashbin') ? 2 : 1);
        slotImg.setTint(0xffd36b);
        this.add.text(sx, sy + 36, '🎰 Thùng rác quay số',
          { fontSize: '12px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5).setDepth(8);
        this.tweens.add({ targets: slotImg, alpha: 0.72, duration: 620, yoyo: true, repeat: -1 });
        this.slotSpot = { x: sx, y: sy };
      }

      // §0 #6: Bà Năm's tutorial hut — mid-bottom, free scripted practice house.
      // Lucas chốt phương án A (2026-08-09): hướng dẫn 4 bước có ở CẢ HAI chế độ.
      // Kẹt Tiền dùng kịch bản riêng, kết bằng bà cho tiền (không có nút CẮN).
      this.hasTut = true;
      if (this.hasTut) {
        const hutImg = this.add.image(POS.hut[0], POS.hut[1], this.textures.exists('hutimg') ? 'hutimg' : 'hut');
        if (this.textures.exists('hutimg')) hutImg.setDisplaySize(150, 112);
        this.add.text(POS.hut[0], POS.hut[1] + 55, '👵 Nhà Bà Năm — học nghề', { fontSize: '13px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);
        this.tutDoneTag = this.add.text(POS.hut[0], POS.hut[1] - 53, '✔ đã học nghề', {
          fontSize: '12px', color: '#5dffa4', fontFamily: 'Segoe UI',
          backgroundColor: 'rgba(10,6,18,0.75)', padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setDepth(52).setVisible(!!localStorage.getItem('xdh_tut_done'));
      }

      // player — v0.9: dùng nhân vật PixelLab 4 hướng nếu ảnh nạp được; hỏng thì về sprite 16px cũ
      const artChar = XDH.isKetTien() ? 'human' : 'wolf';   // Lucas 08-12: Kẹt Tiền = NGƯỜI
      this.useArt = this.textures.exists('pc_' + artChar + '_south');
      this.player = this.physics.add.sprite(WW / 2, H / 2 + 20, this.useArt ? 'pc_' + artChar + '_south' : 'wolf');
      if (this.useArt) {
        this.artChar = artChar;
        this.playerDir = 'south';
        this.player.setScale(0.85).setDepth(20);
        this.player.body.setSize(30, 26).setOffset(17, 34);   // chỉ va chạm phần chân
        // lớp ĐỒ MẶC vẽ đè lên người (kiểu Nova) — đổi theo hướng nhìn + tủ đồ
        this.gearSpr = this.add.image(this.player.x, this.player.y, '__WHITE').setDepth(21).setVisible(false);
        // 3 lớp ĐỒ THẬT (PixelLab vẽ lên người): áo dưới cùng, rồi nón, rồi đồ cầm tay
        this.layerSprs = {
          shirt: this.add.image(this.player.x, this.player.y, '__WHITE').setDepth(20.5).setVisible(false),
          hat:   this.add.image(this.player.x, this.player.y, '__WHITE').setDepth(20.6).setVisible(false),
          item:  this.add.image(this.player.x, this.player.y, '__WHITE').setDepth(20.7).setVisible(false)
        };
        this.makeGearTextures();
        // v0.9 tủ đồ thật: gương trong tủ vẽ ĐÚNG nhân vật + lớp đồ, hướng nào cũng soi được
        XDH.renderMirror = (canvas, dir) => {
          if (!this.useArt || !this.textures.exists('pc_' + this.artChar + '_' + dir)) return false;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = '#241e35'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(this.textures.get('pc_' + this.artChar + '_' + dir).getSourceImage(),
            0, 0, 64, 64, 0, 0, canvas.width, canvas.height);
          XDH.SLOTS.forEach(slot => {
            const lk = 'layer_' + this.artChar + '_' + slot + '_' + XDH.run.outfit[slot] + '_' + dir;
            if (XDH.run.outfit[slot] !== 'none' && this.textures.exists(lk))
              ctx.drawImage(this.textures.get(lk).getSourceImage(),
                0, 0, 64, 64, 0, 0, canvas.width, canvas.height);
          });
          if (this.gearAny && this.textures.exists('gear_' + dir))
            ctx.drawImage(this.textures.get('gear_' + dir).getSourceImage(),
              0, 0, 64, 64, 0, 0, canvas.width, canvas.height);
          return true;
        };
        // hoạt ảnh BƯỚC CHÂN 4 nhịp/hướng — dựng một lần, scene.restart không dựng lại
        ['south', 'east', 'north', 'west'].forEach(d => {
          const key = 'walk_' + artChar + '_' + d;
          if (!this.anims.exists(key) && this.textures.exists('pc_' + artChar + '_' + d + '_w0')) {
            this.anims.create({
              key,
              frames: [0, 1, 2, 3].map(i => ({ key: 'pc_' + artChar + '_' + d + '_w' + i })),
              frameRate: 9, repeat: -1
            });
          }
        });
      } else {
        this.player.setScale(2);
      }
      this.player.setCollideWorldBounds(true);
      this.physics.world.setBounds(0, 0, WW, H);
      // v0.8: MÁY QUAY ĐI THEO NGƯỜI CHƠI — xóm rộng hơn màn hình, đi tới đâu thấy tới đó.
      this.cameras.main.setBounds(0, 0, WW, H);
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
      XDH.applyAvatar = () => this.drawWolfTex();
      // v0.3 B1: chọn chế độ xong thì dựng lại bản đồ (mặt trời/mặt trăng, nhà Bà Năm, biển quán).
      XDH.restartScene = () => this.scene.restart();

      // §2 fail visual: after a failed door, the resident peeks at you through the curtain.
      XDH.curtainPeek = (houseId) => {
        const h = this.houseSprites[houseId];
        if (!h) return;
        const wx = h.x - 30, wy = 215;   // v0.8: sau tấm rèm cửa sổ của căn nhà 8-bit (nhà đã hạ xuống cỏ)
        const eyes = this.add.container(wx, wy + 14, [
          this.add.rectangle(0, 0, 22, 14, 0xf7c99b),
          this.add.rectangle(-5, -1, 3, 4, 0x221a12),
          this.add.rectangle(5, -1, 3, 4, 0x221a12)
        ]).setDepth(53).setAlpha(0);
        this.tweens.add({ targets: eyes, y: wy, alpha: 1, duration: 500, ease: 'Sine.easeOut' });
        this.tweens.add({
          targets: eyes, y: wy + 14, alpha: 0, duration: 450, delay: 3600,
          ease: 'Sine.easeIn', onComplete: () => eyes.destroy()
        });
      };

      // 🚓 v0.9 mini-game "bị công an dí" (Lucas 2026-08-12, spec trực tiếp):
      // thua nhà nào → cửa đóng → XE ò í e chạy vào đỗ trước nhà → công an bước xuống →
      // rượt 20 giây TỐC ĐỘ NGANG NHAU (sống nhờ bẻ cua) → thoát thì công an lên xe rời xóm,
      // bị tóm thì màn kết "về đồn". Núm chỉnh: XDH.CHASE trong config.js.
      XDH.startPoliceChase = (houseId) => {
        if (this.police || this.policeCar) return;
        const h = this.houseSprites[houseId];
        const hx2 = h ? h.x : W / 2;
        const fromLeft = hx2 > WW / 2;                 // xe vào từ mép xóm gần hơn
        const carY = H / 2 + 6;                        // chạy trên con đường
        this.policeCar = this.add.image(fromLeft ? -70 : WW + 70, carY, 'policecar')
          .setDepth(53).setScale(1.7).setFlipX(!fromLeft);
        this.carBlink = this.tweens.add({ targets: this.policeCar, alpha: 0.8, duration: 150, yoyo: true, repeat: -1 });
        XDH.Blips.siren(true);
        XDH.Music.play('ruot');                        // nhạc rượt (file Lucas đưa) đè nhạc nền
        XDH.UI.toast('🚨 Ò Í E — CÔNG AN TỚI!! CHẠY ĐI!!', 2600);
        this.tweens.add({
          // xe đỗ CÁCH nhà một quãng — công an phải chạy bộ tới, người chơi có cửa thoát đầu
          targets: this.policeCar, x: hx2 + (fromLeft ? -240 : 240), duration: 1400, ease: 'Sine.easeOut',
          onComplete: () => {
            if (!this.policeCar) return;               // scene bị dựng lại giữa chừng thì thôi
            this.police = this.physics.add.sprite(this.policeCar.x, carY - 8, 'police')
              .setScale(2).setDepth(54);
            this.chaseWarmup = Date.now() + 1200;      // 1,2s đầu công an BƯỚC TỪNG BƯỚC (chậm)
            this.chaseUntil = Date.now() + XDH.CHASE.MS;
            this.chaseText = this.add.text(W / 2, 40, '🚨 CHẠY!! ' + Math.round(XDH.CHASE.MS / 1000) + 's', {
              fontSize: '22px', color: '#ff5d73', fontFamily: 'Segoe UI', fontStyle: 'bold',
              backgroundColor: 'rgba(10,6,18,0.8)', padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setDepth(60).setScrollFactor(0);
          }
        });
      };

      // v1.0 hệ nhiệm vụ — 3 THÙNG RÁC (plan-v1.0 mục 3): chỉ mode ma sói, chỉ mọc ra SAU khi
      // nhận nhiệm vụ ("nhận thì THẾ GIỚI ĐỔI" — luật thiết kế mục 1). Vẽ code, khuôn "4 chỗ sửa".
      this.trashBins = null;
      XDH.spawnTrashBins = () => {
        if (this.trashBins || XDH.isKetTien() || !XDH.Mission || !XDH.Mission.on()) return;
        this.trashBins = XDH.TRASH.BINS.map(([x, y], i) => {
          const spr = this.add.image(x, y, 'trashbin').setDepth(8).setScale(2);
          this.add.text(x, y + 34, '🗑️', { fontSize: '13px' }).setOrigin(0.5).setDepth(8);
          // rác mới mọc thì phải THẤY được: nhún nhẹ một cái lúc xuất hiện
          spr.setAlpha(0);
          this.tweens.add({ targets: spr, alpha: 1, y: y - 4, yoyo: true, duration: 300, ease: 'Sine.easeOut' });
          return { x, y, id: i, spr };
        });
      };
      // scene.restart giữa run (đổi đồ, rượt xong…) mà nhiệm vụ đã nhận → dựng lại thùng ngay
      if (XDH.Mission && XDH.Mission.on() &&
          ['da_nhan', 'co_do', 'xong'].includes(XDH.Mission.stage())) XDH.spawnTrashBins();

      // enableCapture=false: Phaser must NOT preventDefault these keys globally,
      // or they can never be typed into the chat <input> (W/A/S/D/E/Space were eaten).
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,E,SPACE', false);
      this.touch = { up: 0, down: 0, left: 0, right: 0 };
      // 2026-08-14 SỬA LỖI ĐIỆN THOẠI: trước đây chỉ nghe pointerup/pointerleave. Điện thoại
      // huỷ cú chạm (pointercancel) khi hiểu nhầm là vuốt, hoặc nhả tay ngoài rìa nút → phím
      // KẸT ở trạng thái đang giữ, sói tự đi mãi. Giờ: bắt thêm pointercancel + một cú nhả tay
      // ở BẤT KỲ đâu trên màn hình cũng thả hết phím. Giữ nút cũng không bôi đen được nữa (CSS).
      const release = (dir) => { this.touch[dir] = 0; };
      document.querySelectorAll('#touchpad button').forEach(b => {
        const dir = b.dataset.dir;
        b.addEventListener('pointerdown', e => {
          e.preventDefault();
          this.touch[dir] = 1;
          try { b.setPointerCapture(e.pointerId); } catch (_) {}   // ngón trượt nhẹ vẫn giữ phím
        });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev =>
          b.addEventListener(ev, () => release(dir)));
        b.addEventListener('contextmenu', e => e.preventDefault());   // chặn menu giữ-lâu
      });
      // scene.restart() chạy lại create() → chỉ gắn tay nghe toàn màn hình ĐÚNG MỘT LẦN.
      XDH._touchRelease = () => { this.touch.up = this.touch.down = this.touch.left = this.touch.right = 0; };
      if (!window.__xdhTouchWired) {
        window.__xdhTouchWired = 1;
        const releaseAll = () => { XDH._touchRelease && XDH._touchRelease(); };
        ['pointerup', 'pointercancel'].forEach(ev => window.addEventListener(ev, releaseAll));
        document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
      }

      // Option B: lời nhắc xoay ngang — bấm ✕ là tắt hẳn cả phiên.
      const rx = document.getElementById('rotate-hint-x');
      if (rx && !rx.dataset.wired) {
        rx.dataset.wired = '1';
        rx.addEventListener('click', () => document.body.classList.add('hide-rotate-hint'));
      }

      // interaction prompt
      this.prompt = this.add.text(0, 0, '', {
        fontSize: '15px', color: '#22160a', backgroundColor: '#ffb547',
        padding: { x: 10, y: 6 }, fontFamily: 'Segoe UI', fontStyle: 'bold'
      }).setOrigin(0.5).setVisible(false).setDepth(60).setInteractive({ useHandCursor: true });
      this.prompt.on('pointerdown', () => this.activateNearby());

      this.nearTarget = null;
    }

    makeTextures() {
      const g = this.make.graphics({ add: false });
      // scene.restart() (đổi chế độ ở màn hình đầu) chạy lại hàm này → phải xoá key cũ trước.
      const tex = (key, w, h, fn) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        g.clear(); fn(g); g.generateTexture(key, w, h);
      };

      tex('grass', 32, 32, gg => { gg.fillStyle(0x14331f); gg.fillRect(0, 0, 32, 32); gg.fillStyle(0x1a4028); gg.fillRect(6, 8, 2, 2); gg.fillRect(22, 20, 2, 2); });
      tex('grass2', 32, 32, gg => { gg.fillStyle(0x123020); gg.fillRect(0, 0, 32, 32); gg.fillStyle(0x1a4028); gg.fillRect(14, 14, 2, 2); });
      tex('road', 32, 32, gg => { gg.fillStyle(0x2b2438); gg.fillRect(0, 0, 32, 32); gg.fillStyle(0x40365a); gg.fillRect(0, 14, 12, 4); gg.fillRect(20, 14, 12, 4); });

      const houseColors = [0xc95f7f, 0x4f79d9, 0x3fbfa0];
      houseColors.forEach((c, i) => {
        tex('house' + i, 180, 160, gg => {
          gg.fillStyle(0x3a3150); gg.fillRect(20, 60, 140, 90);   // wall
          gg.fillStyle(c); gg.fillTriangle(10, 62, 170, 62, 90, 8); // roof
          gg.fillStyle(0xffdf8a); gg.fillRect(40, 80, 28, 26);    // window (warm light)
          gg.fillRect(112, 80, 28, 26);
          gg.fillStyle(0x7a4a2b); gg.fillRect(76, 96, 30, 54);    // door
          gg.fillStyle(0xffb547); gg.fillRect(100, 120, 4, 4);    // knob
        });
      });

      tex('shed', 120, 100, gg => {
        gg.fillStyle(0x4a3f6b); gg.fillRect(10, 30, 100, 66);
        gg.fillStyle(0x6a5a96); gg.fillTriangle(4, 32, 116, 32, 60, 4);
        gg.fillStyle(0x241e35); gg.fillRect(48, 52, 26, 44);
      });
      tex('cart', 130, 90, gg => {
        gg.fillStyle(0x6b4a2b); gg.fillRect(15, 30, 100, 40);
        gg.fillStyle(0xd9a35f); gg.fillRect(15, 22, 100, 10);
        gg.fillStyle(0x241e35); gg.fillCircle(35, 78, 9); gg.fillCircle(95, 78, 9);
        gg.fillStyle(0xffdf8a); gg.fillRect(24, 38, 20, 8); gg.fillRect(56, 38, 20, 8); // bánh mì on display
      });
      tex('lamp', 18, 64, gg => {
        gg.fillStyle(0x3a3150); gg.fillRect(7, 12, 4, 52);
        gg.fillStyle(0xffdf8a); gg.fillRect(3, 2, 12, 12);
      });
      // 🚓 v0.9: xe công an ò í e — thân trắng sọc xanh, đèn nóc đỏ/xanh (nhấp nháy bằng tween)
      tex('policecar', 52, 22, gg => {
        gg.fillStyle(0xf2f2f2); gg.fillRect(2, 8, 48, 9);           // thân xe
        gg.fillStyle(0x2b4fd9); gg.fillRect(2, 13, 48, 4);          // sọc xanh
        gg.fillStyle(0xf2f2f2); gg.fillRect(10, 3, 32, 5);          // nóc
        gg.fillStyle(0x9ad4ff); gg.fillRect(13, 4, 10, 5); gg.fillRect(28, 4, 10, 5); // kính
        gg.fillStyle(0xff2247); gg.fillRect(19, 0, 5, 3);           // đèn đỏ
        gg.fillStyle(0x2b6bff); gg.fillRect(26, 0, 5, 3);           // đèn xanh
        gg.fillStyle(0x241e35); gg.fillCircle(12, 19, 3); gg.fillCircle(40, 19, 3); // bánh
      });
      tex('police', 16, 16, gg => {
        gg.fillStyle(0x1d3a8f); gg.fillRect(3, 2, 10, 3);          // mũ kê pi
        gg.fillStyle(0xeab98a); gg.fillRect(5, 5, 6, 5);           // mặt
        gg.fillStyle(0x221a12); gg.fillRect(6, 7, 1, 1); gg.fillRect(9, 7, 1, 1);
        gg.fillStyle(0x2b4fd9); gg.fillRect(4, 10, 8, 5);          // áo xanh
        gg.fillStyle(0xffdf3a); gg.fillRect(7, 11, 2, 2);          // phù hiệu
      });

      // v1.0 🗑️ thùng rác xóm — nắp hé, có con ruồi chấm đen cho có mùi… đời
      tex('trashbin', 26, 30, gg => {
        gg.fillStyle(0x3f9f4f); gg.fillRect(3, 8, 20, 20);          // thân xanh lá
        gg.fillStyle(0x2e7a3c); gg.fillRect(3, 8, 20, 3);           // bóng miệng thùng
        gg.fillStyle(0x57bf67); gg.fillRect(1, 4, 24, 5);           // nắp
        gg.fillStyle(0x2e7a3c); gg.fillRect(10, 1, 6, 4);           // tay cầm nắp
        gg.fillStyle(0xf2ecff); gg.fillRect(7, 14, 3, 8); gg.fillRect(16, 14, 3, 8);  // sọc
        gg.fillStyle(0x151520); gg.fillRect(21, 2, 2, 2);           // con ruồi
      });

      tex('hut', 110, 90, gg => {
        gg.fillStyle(0x5a4a3b); gg.fillRect(12, 28, 86, 58);
        gg.fillStyle(0x8a6a4b); gg.fillTriangle(4, 30, 106, 30, 55, 4);
        gg.fillStyle(0xffdf8a); gg.fillRect(24, 44, 20, 18);      // warm window
        gg.fillStyle(0x2e2517); gg.fillRect(60, 48, 22, 38);      // door
      });

      this.drawWolfTex();
    }

    // §0 #8-9: sprite = avatar (face/hair/skin cosmetic) + outfit shirt color.
    // v0.9 (Lucas 08-12): Kẹt Tiền là NGƯỜI THƯỜNG — không tai sói, không mõm.
    drawWolfTex() {
      if (this.textures.exists('wolf')) this.textures.remove('wolf');
      const g = this.make.graphics({ add: false });
      const human = XDH.isKetTien();
      const skinOpt = XDH.AVATAR.skin.find(o => o.id === XDH.avatar.skin) || XDH.AVATAR.skin[0];
      g.fillStyle(human ? 0xeab98a : skinOpt.color);
      g.fillRect(4, 5, 8, 8);                                     // head
      if (!human) { g.fillTriangle(4, 5, 6, 5, 4, 1); g.fillTriangle(10, 5, 12, 5, 12, 1); } // ears
      if (XDH.avatar.hair === 'mo') { g.fillStyle(0xff5dd2); g.fillRect(7, 1, 2, 4); }
      else if (XDH.avatar.hair === 'muot') { g.fillStyle(0x3a3150); g.fillRect(4, 5, 8, 1); }
      else { g.fillStyle(0x3a3150); g.fillRect(4, 5, 1, 1); g.fillRect(6, 4, 1, 2); g.fillRect(9, 5, 1, 1); }
      if (human) { g.fillStyle(0x3a3150); g.fillRect(4, 4, 8, 2); } // người: mái tóc dày hơn
      if (XDH.avatar.face === 'ngau') { g.fillStyle(0x151520); g.fillRect(5, 8, 6, 1); }
      else { g.fillStyle(human ? 0x221a12 : 0xf9e076); g.fillRect(6, 8, 1, 1); g.fillRect(9, 8, 1, 1); }
      if (human) { g.fillStyle(0x8a4a3b); g.fillRect(7, 11, 2, 1); }  // miệng người
      else { g.fillStyle(0x5d6275); g.fillRect(7, 11, 2, 2); }        // mõm sói
      const o = XDH.run.outfit;
      g.fillStyle(o.shirt === 'grab' ? 0x2fae5a : o.shirt === 'sinhvien' ? 0x3f6fe0 : 0xe2718f);
      g.fillRect(5, 13, 6, 3);
      // 2026-08-12 (Lucas): đồ phải THẤY được trên bản đồ — vẽ thêm nón + đồ cầm tay,
      // cùng bảng màu với gương hoá trang (ui.js drawWolfPreview) cho khớp nhau.
      if (o.hat === 'baohiem') { g.fillStyle(0x2fae5a); g.fillRect(3, 4, 10, 2); g.fillRect(4, 3, 8, 1); }
      else if (o.hat === 'nonla') { g.fillStyle(0xd9c07a); g.fillRect(3, 5, 10, 1); g.fillRect(5, 4, 6, 1); g.fillRect(7, 3, 2, 1); }
      if (o.item === 'trasua') { g.fillStyle(0xc98f5f); g.fillRect(13, 12, 2, 3); g.fillStyle(0xffffff); g.fillRect(13, 11, 2, 1); }
      else if (o.item === 'bo_rau') { g.fillStyle(0x2fae5a); g.fillRect(13, 12, 2, 3); }
      else if (o.item === 'thesv') { g.fillStyle(0x3f6fe0); g.fillRect(13, 12, 3, 2); g.fillStyle(0xffffff); g.fillRect(14, 12, 1, 1); }
      else if (o.item === 'donhang') { g.fillStyle(0xf2ecff); g.fillRect(13, 11, 3, 4); g.fillStyle(0x8a8fa8); g.fillRect(14, 12, 1, 2); }
      else if (o.item === 'tinnhan') { g.fillStyle(0xffffff); g.fillRect(13, 11, 3, 4); g.fillStyle(0x5dffa4); g.fillRect(13, 12, 3, 1); }
      g.generateTexture('wolf', 16, 16);
      g.destroy();
      // v0.9: đang dùng nhân vật PixelLab thì chỉ cần vẽ lại LỚP ĐỒ, không đổi texture người
      if (this.useArt) { this.makeGearTextures(); return; }
      if (this.player) this.player.setTexture('wolf');
    }

    // v0.9 — LỚP ĐỒ MẶC trên nhân vật PixelLab (kiểu Nova): mỗi hướng một tấm 64×64 vẽ bằng code,
    // đè lên sprite. Chọn đồ trong tủ là thấy NGAY trên người, cả 4 hướng.
    makeGearTextures() {
      if (!this.useArt) return;
      const o = XDH.run.outfit;
      this.gearAny = o.shirt !== 'none' || o.hat !== 'none' || o.item !== 'none';
      // PHẢI gỡ lớp đồ khỏi texture cũ trước khi xoá/vẽ lại — xoá texture đang dùng là Phaser gãy
      if (this.gearSpr) this.gearSpr.setTexture('__WHITE').setVisible(false);
      const g = this.make.graphics({ add: false });
      ['south', 'east', 'north', 'west'].forEach(dir => {
        const key = 'gear_' + dir;
        if (this.textures.exists(key)) this.textures.remove(key);
        g.clear();
        // Món nào có LỚP ĐỒ THẬT cho hướng này thì khỏi vẽ hình tay — đồ thật đẹp hơn
        const layered = (slot) => o[slot] !== 'none' &&
          this.textures.exists('layer_' + this.artChar + '_' + slot + '_' + o[slot] + '_' + dir);
        const shirtLayered = layered('shirt'), hatLayered = layered('hat'), itemLayered = layered('item');
        // ÁO KHOÁC đè lên thân (x20-44, y30-46 trên khung 64)
        if (shirtLayered) { /* áo do lớp thật lo */ }
        else if (o.shirt === 'grab') {
          g.fillStyle(0x2fae5a); g.fillRect(21, 30, 22, 15);
          g.fillStyle(0x1d7a3e); g.fillRect(31, 30, 2, 15);          // khoá kéo
          if (dir !== 'north') { g.fillStyle(0xffffff); g.fillRect(24, 31, 6, 2); } // chữ trên ngực
        } else if (o.shirt === 'sinhvien') {
          g.fillStyle(0x3f6fe0); g.fillRect(21, 30, 22, 15);
          if (dir !== 'north') { g.fillStyle(0xffffff); g.fillRect(28, 30, 8, 3); } // cổ áo
        }
        // NÓN đội lên đầu (đỉnh đầu ~y4-16)
        if (hatLayered) { /* nón do lớp thật lo */ }
        else if (o.hat === 'baohiem') {
          g.fillStyle(0x2fae5a); g.fillRect(19, 9, 26, 6); g.fillRect(23, 4, 18, 6);
          g.fillStyle(0x1d7a3e); g.fillRect(19, 13, 26, 2);
        } else if (o.hat === 'nonla') {
          g.fillStyle(0xd9c07a); g.fillRect(15, 13, 34, 4); g.fillRect(21, 8, 22, 5); g.fillRect(28, 3, 9, 5);
          g.fillStyle(0xb89b55); g.fillRect(15, 15, 34, 2);
        }
        // ĐỒ CẦM TAY — theo tay của hướng đang nhìn (quay lưng thì khuất, không vẽ)
        if (!itemLayered && dir !== 'north' && o.item !== 'none') {
          const ax = dir === 'west' ? 6 : dir === 'east' ? 46 : 44;
          if (o.item === 'trasua') { g.fillStyle(0xc98f5f); g.fillRect(ax + 2, 37, 8, 11); g.fillStyle(0xffffff); g.fillRect(ax + 2, 34, 8, 3); g.fillStyle(0x8a5a2b); g.fillRect(ax + 5, 30, 2, 4); }
          else if (o.item === 'bo_rau') { g.fillStyle(0x2fae5a); g.fillRect(ax + 2, 36, 8, 13); g.fillStyle(0x1d7a3e); g.fillRect(ax + 4, 36, 2, 13); }
          else if (o.item === 'thesv') { g.fillStyle(0x3f6fe0); g.fillRect(ax, 38, 12, 8); g.fillStyle(0xffffff); g.fillRect(ax + 2, 40, 4, 4); }
          else if (o.item === 'donhang') { g.fillStyle(0xf2ecff); g.fillRect(ax, 34, 12, 15); g.fillStyle(0x8a8fa8); g.fillRect(ax + 2, 37, 8, 2); g.fillRect(ax + 2, 41, 8, 2); }
          else if (o.item === 'tinnhan') { g.fillStyle(0xffffff); g.fillRect(ax, 34, 12, 15); g.fillStyle(0x5dffa4); g.fillRect(ax + 2, 38, 8, 3); }
        }
        g.generateTexture(key, 64, 64);
      });
      g.destroy();
      if (this.gearSpr) this.gearSpr.setTexture('gear_' + (this.playerDir || 'south')).setVisible(this.gearAny);
      this.refreshLayer();
    }

    // Lớp đồ THẬT theo hướng đang nhìn; món/hướng nào chưa có lớp thì ẩn (hình vẽ tay lo phần đó)
    refreshLayer() {
      if (!this.layerSprs) return;
      const dir = this.playerDir || 'south';
      XDH.SLOTS.forEach(slot => {
        const id = XDH.run.outfit[slot];
        const key = 'layer_' + this.artChar + '_' + slot + '_' + id + '_' + dir;
        const spr = this.layerSprs[slot];
        if (id !== 'none' && this.textures.exists(key)) spr.setTexture(key).setVisible(true);
        else spr.setVisible(false);
      });
    }

    // Hướng nhìn + nhún bước cho nhân vật PixelLab; lớp đồ bám theo người.
    updateArtFacing(vx, vy) {
      if (!this.useArt) return;
      let dir = this.playerDir;
      if (vx > 0) dir = 'east'; else if (vx < 0) dir = 'west';
      else if (vy < 0) dir = 'north'; else if (vy > 0) dir = 'south';
      const moving = vx !== 0 || vy !== 0;
      const walkKey = 'walk_' + this.artChar + '_' + dir;
      if (dir !== this.playerDir) {
        this.playerDir = dir;
        if (this.gearSpr) this.gearSpr.setTexture('gear_' + dir).setVisible(this.gearAny);
        this.refreshLayer();
      }
      // đi = phát hoạt ảnh bước chân · đứng = khung đứng yên của hướng đang nhìn
      if (moving && this.anims.exists(walkKey)) this.player.play(walkKey, true);
      else {
        this.player.stop();
        this.player.setTexture('pc_' + this.artChar + '_' + dir);
      }
      if (this.gearSpr) {
        this.gearSpr.setPosition(this.player.x, this.player.y).setScale(this.player.scaleX);
      }
      if (this.layerSprs) {
        XDH.SLOTS.forEach(slot => this.layerSprs[slot]
          .setPosition(this.player.x, this.player.y).setScale(this.player.scaleX));
      }
    }

    // Chase resolution (v0.9): thoát → công an ĐI BỘ VỀ XE, xe rời xóm ·
    // bị tóm → màn kết "về đồn" (nền đồn công an 8-bit) rồi mới tổng kết thua đêm.
    endChase(escaped) {
      if (!this.police) return;
      this.chaseText.destroy(); this.chaseText = null;
      XDH.Blips.siren(false);
      XDH.Music.play('nen');                           // hết rượt → về nhạc nền xóm
      if (escaped) {
        const cop = this.police; this.police = null;               // ngừng rượt ngay lập tức
        cop.setVelocity(0, 0);
        XDH.UI.toast('😮‍💨 Hết 20 giây — công an thở dốc, bỏ cuộc, lên xe đi về…');
        this.tweens.add({
          targets: cop, x: this.policeCar ? this.policeCar.x : cop.x,
          y: this.policeCar ? this.policeCar.y - 8 : cop.y, duration: 900,
          onComplete: () => {
            cop.destroy();
            const car = this.policeCar; this.policeCar = null;
            if (!car) return;
            if (this.carBlink) { this.carBlink.stop(); car.setAlpha(1); }
            this.tweens.add({
              targets: car, x: car.x > WW / 2 ? WW + 90 : -90, duration: 1200,
              ease: 'Sine.easeIn', onComplete: () => car.destroy()
            });
          }
        });
      } else {
        this.police.destroy(); this.police = null;
        if (this.carBlink) this.carBlink.stop();
        if (this.policeCar) { this.policeCar.destroy(); this.policeCar = null; }
        XDH.run.policeCaught = true;
        XDH.Blips.jingle('lose');
        XDH.UI.showStation();                                      // 🚔 màn "về đồn" rồi mới tổng kết
      }
    }

    activateNearby() {
      if (!this.nearTarget || XDH.Convo.isActive() || XDH.Tut.isActive() || this.police || this.policeCar) return;
      if (this.nearTarget === 'wardrobe') XDH.UI.openWardrobe();
      else if (this.nearTarget === 'shop') XDH.UI.openShop();
      else if (this.nearTarget === 'slot') XDH.Casino.openSlot();   // v1.2 🎰
      else if (this.nearTarget === 'tutorial') XDH.Tut.start();
      else if (this.nearTarget.type === 'trash') XDH.Mission.lootTrash(this.nearTarget.id);   // v1.0
      else XDH.Convo.start(this.nearTarget.id);
    }

    // v0.9 sky clock (Lucas 08-12, học theo Stardew/Terraria): thiên thể chạy trên NỬA VÒNG
    // TRÒN — mọc từ dưới chân trời bên trái, lên đỉnh, rồi LẶN CHÌM xuống chân trời bên phải.
    // Cuối buổi thiên thể thứ hai nhú lên + trời chuyển DẦN cam → vàng.
    updateSky() {
      const r = XDH.run;
      if (!r) return;
      const kt = XDH.isKetTien();
      const mins = kt ? XDH.RULES.DAY_MINUTES : XDH.RULES.NIGHT_MINUTES;
      const prog = Math.min(1, (Date.now() - r.nightStart) / (mins * 60000));
      const HOR = 240, cx = W / 2, cy = HOR + 46, R = 470, RY = 0.5;
      const arc = (p) => ({ x: cx + R * Math.cos(Math.PI * (1 - p)), y: cy - R * RY * Math.sin(Math.PI * (1 - p)) });
      const pos = arc(prog);
      this.moon.setPosition(pos.x, pos.y);
      // chìm quá chân trời thì mờ dần rồi biến mất hẳn
      this.moon.setAlpha(Phaser.Math.Clamp(1 - (pos.y - (HOR - 20)) / 46, 0, 1));
      if (this.body2) {
        if (prog > 0.8) {                                 // rạng đông/chập tối: thân thứ hai NHÚ LÊN
          const p2 = (prog - 0.8) / 0.2;
          const pos2 = arc(p2 * 0.12);                    // mới lên khỏi chân trời bên trái
          this.body2.setVisible(true).setPosition(pos2.x, pos2.y);
          this.body2.setAlpha(Math.min(1, p2 * 1.5));
        } else this.body2.setVisible(false);
      }
      this.nightShade.setAlpha((kt ? 0.16 : 0.22) * Math.sin(prog * Math.PI));
      // trời tối chuyển DẦN sang CAM rồi VÀNG (Lucas 08-12) — pha màu theo tiến độ
      if (prog > 0.72) {
        const t = (prog - 0.72) / 0.28;
        const gcol = Phaser.Display.Color.GetColor(255, Math.round(122 + 92 * t), Math.round(40 + 34 * t));
        this.dawnGlow.setFillStyle(gcol);
        this.dawnGlow.setAlpha(0.14 + t * 0.26);
      } else this.dawnGlow.setAlpha(0);
      // Dawn fail — but never mid-conversation or under a menu: finish your door first.
      if (prog >= 1 && !r.dawnHandled && !XDH.Convo.isActive() && !document.querySelector('.overlay.show')) {
        r.dawnHandled = true;
        XDH.UI.dawnFail();
      }
    }

    update() {
      this.updateSky();
      // Done markers reflect tonight's state (auto reset when a new night begins)
      for (const h of this.houseSprites) {
        const st = XDH.run.houses[h.id];
        const done = !!(st.won || st.done);                           // v0.3: mode Kẹt Tiền dùng cờ done
        h.doneFx.forEach(o => o.setVisible(done));
        if (h.wasDone !== done) {                                     // v0.8: xong = TẮT ĐÈN cả căn nhà
          done ? h.sprite.setTint(0x5a5a7a) : h.sprite.clearTint();
          h.wasDone = done;
        }
      }
      if (this.tutDoneTag) this.tutDoneTag.setVisible(!!localStorage.getItem('xdh_tut_done'));
      // v0.9 B3 — attract mode: đứng ở màn tựa game thì sói TỰ dạo qua lại trong xóm,
      // cho thấy thế giới đang sống. Bấm BẮT ĐẦU là trả quyền điều khiển lại ngay.
      if (document.getElementById('ov-intro').classList.contains('show')) {
        if (!this.attractDir) this.attractDir = 1;
        if (this.player.x > WW - 170) this.attractDir = -1;
        else if (this.player.x < 170) this.attractDir = 1;
        this.player.setVelocity(this.attractDir * 85, 0);
        if (this.useArt) this.updateArtFacing(this.attractDir * 85, 0);
        else this.player.setFlipX(this.attractDir < 0);
        this.prompt.setVisible(false);
        return;
      }
      if (XDH.Convo.isActive() || XDH.Tut.isActive() || document.querySelector('.overlay.show')) {
        this.player.setVelocity(0, 0);
        this.prompt.setVisible(false);
        return;
      }
      const k = this.keys, t = this.touch, sp = XDH.CHASE.PLAYER_SPEED;
      let vx = 0, vy = 0;
      if (k.A.isDown || k.LEFT.isDown || t.left) vx = -sp;
      else if (k.D.isDown || k.RIGHT.isDown || t.right) vx = sp;
      if (k.W.isDown || k.UP.isDown || t.up) vy = -sp;
      else if (k.S.isDown || k.DOWN.isDown || t.down) vy = sp;
      this.player.setVelocity(vx, vy);
      this.updateArtFacing(vx, vy);      // v0.9: quay mặt theo 4 hướng + nhún bước + đồ bám người

      // 🚓 chase tick (v0.9): công an chạy BẰNG tốc độ người chơi — sống là nhờ bẻ cua,
      // đứng yên hoặc kẹt góc là bị tóm. Núm chỉnh: XDH.CHASE trong config.js.
      if (this.police) {
        const msLeft = this.chaseUntil - Date.now();
        this.chaseText.setText('🚨 CHẠY!! ' + Math.max(0, Math.ceil(msLeft / 1000)) + 's');
        // 1,2 giây đầu: bước từng bước (chậm) cho người chơi kịp vắt chân — rồi mới hết tốc
        const copSp = Date.now() < this.chaseWarmup ? 85 : XDH.CHASE.COP_SPEED;
        this.physics.moveToObject(this.police, this.player, copSp);
        if (Phaser.Math.Distance.Between(this.police.x, this.police.y, this.player.x, this.player.y) < 26) {
          this.endChase(false);
          return;
        }
        if (msLeft <= 0) this.endChase(true);
        this.prompt.setVisible(false);
        return;   // no knocking / shopping while being chased
      }

      // proximity checks
      const px = this.player.x, py = this.player.y;
      this.nearTarget = null;
      let promptText = '', tx = 0, ty = 0;
      for (const h of this.houseSprites) {
        if (Phaser.Math.Distance.Between(px, py, h.x, h.y) < 90) {
          const st = XDH.run.houses[h.id];
          this.nearTarget = h;
          promptText = st.done ? '✅ Nhà này hôm nay xong rồi'
            : st.won ? '✅ Đã được mời vào'
              : '🚪 Gõ cửa (' + KEY + ')';
          tx = h.x; ty = h.y + 60;
          break;
        }
      }
      if (!this.nearTarget && Phaser.Math.Distance.Between(px, py, POS.shed[0], POS.shed[1]) < 80) {
        this.nearTarget = 'wardrobe';
        promptText = '🎽 Mở tủ đồ (' + KEY + ')';
        tx = POS.shed[0]; ty = POS.shed[1] - 60;
      }
      if (!this.nearTarget && Phaser.Math.Distance.Between(px, py, POS.cart[0], POS.cart[1]) < 80) {
        this.nearTarget = 'shop';
        promptText = XDH.isKetTien() ? '🍜 Quán bánh mì — ăn (' + KEY + ')' : '🍞 Quầy bánh mì (' + KEY + ')';
        tx = POS.cart[0]; ty = POS.cart[1] - 60;
      }
      // v1.2 🎰 thùng rác quay số — đứng cạnh là cược được (casino.js cầm luật)
      if (!this.nearTarget && this.slotSpot &&
          Phaser.Math.Distance.Between(px, py, this.slotSpot.x, this.slotSpot.y) < 70) {
        this.nearTarget = 'slot';
        promptText = '🎰 Thùng rác quay số (' + KEY + ')';
        tx = this.slotSpot.x; ty = this.slotSpot.y - 50;
      }
      // v1.0 🗑️ lục thùng rác — mỗi thùng 1 lần/đêm (missions.js cầm luật + bảng loot)
      if (!this.nearTarget && this.trashBins) {
        for (const b of this.trashBins) {
          if (Phaser.Math.Distance.Between(px, py, b.x, b.y) < 60) {
            this.nearTarget = { type: 'trash', id: b.id };
            promptText = XDH.run.trashLooted && XDH.run.trashLooted.includes(b.id)
              ? '🗑️ Lục rồi — mai có rác mới' : '🗑️ Lục thùng rác (' + KEY + ')';
            tx = b.x; ty = b.y - 44;
            break;
          }
        }
      }
      if (!this.nearTarget && this.hasTut && Phaser.Math.Distance.Between(px, py, POS.hut[0], POS.hut[1]) < 80) {
        this.nearTarget = 'tutorial';
        promptText = '👵 Học nghề với Bà Năm (' + KEY + ')';
        tx = POS.hut[0]; ty = POS.hut[1] - 60;
      }
      if (this.nearTarget) {
        this.prompt.setText(promptText).setPosition(tx, ty).setVisible(true);
        if (Phaser.Input.Keyboard.JustDown(k.E) || Phaser.Input.Keyboard.JustDown(k.SPACE)) this.activateNearby();
      } else {
        this.prompt.setVisible(false);
      }
    }
  }

  window.addEventListener('load', () => {
    // v0.9: giữ tay nắm cho máy kiểm tự động (Playwright đọc vị trí sói) — không ảnh hưởng game
    window.XDH_GAME = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game-root',
      width: W, height: H,
      backgroundColor: '#0d0a14',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade' },
      scene: [Xom]
    });
  });
})();
