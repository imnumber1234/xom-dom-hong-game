// Phaser 3 neighborhood: WASD/touch walk, 3 houses, wardrobe shed, decorative food cart.
(function () {
  // W = khung nhìn (đúng bằng màn hình). WW = XÓM THẬT, rộng gấp rưỡi — người chơi đi tới đâu
  // máy quay chạy theo tới đó, nên xóm có cảm giác ĐI ĐƯỢC chứ không phải một tấm ảnh đứng yên.
  const W = 960, H = 640, WW = 1440;
  const HX = [230, 700, 1180];              // 3 nhà, trải đều theo chiều rộng mới
  const POS = { shed: [170, 500], cart: [1250, 500], hut: [700, 505] };

  class Xom extends Phaser.Scene {
    constructor() { super('xom'); }

    // v0.8: nạp hình 8-bit thật. Hỏng tấm nào thì makeTextures() vẽ lại tấm đó bằng code,
    // bản đồ không bao giờ trống.
    preload() {
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
      if (this.textures.exists('sky')) {
        const sky = this.add.image(WW / 2, 150, 'sky').setDepth(-8);
        sky.setDisplaySize(WW, 300);
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
      this.houseSprites = [];
      const hx = HX;
      hx.forEach((x, i) => {
        const s = this.add.image(x, 170, this.textures.exists('h' + i) ? 'h' + i : 'house' + i);
        const npc = XDH.NPCS[XDH.run.houses[i].npcIdx];
        const diff = XDH.DIFFICULTY[npc.id];
        const label = (diff ? diff.stars + ' ' : '') + 'Nhà ' + npc.name.split(' (')[0] + (diff ? ' · ' + diff.level : '');
        this.add.text(x, 258, label, { fontSize: '14px', color: '#f2ecff', fontFamily: 'Segoe UI' }).setOrigin(0.5);
        // Done marker (Lucas 08-09): finished house = lights OUT + ✅ tag, readable from anywhere.
        // v0.8: nhà giờ là ẢNH nên không dán ô vuông lên cửa sổ nữa — làm TỐI CẢ CĂN NHÀ (update()).
        const tag = this.add.text(x, 88, '✅ XONG', {
          fontSize: '13px', color: '#5dffa4', fontFamily: 'Segoe UI', fontStyle: 'bold',
          backgroundColor: 'rgba(10,6,18,0.75)', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setVisible(false).setDepth(52);
        this.houseSprites.push({ x, y: 220, id: i, sprite: s, doneFx: [tag] });
      });
      // §6b: identical houses → per-resident dressing (Ly neon · Tí bóng đá · Cô Sáu phơi đồ)
      this.add.rectangle(hx[0] - 62, 168, 10, 34, 0xff5dd2).setAlpha(0.9);        // Ly: neon strip
      this.add.circle(hx[0] - 62, 168, 13, 0xff5dd2).setAlpha(0.18);
      this.add.circle(hx[1] + 60, 236, 7, 0xffffff);                              // Tí: quả bóng
      this.add.rectangle(hx[1] + 60, 233, 8, 2, 0x222222);
      this.add.rectangle(hx[2] - 40, 130, 60, 2, 0xcccccc);                        // Cô Sáu: dây phơi
      this.add.rectangle(hx[2] - 58, 137, 12, 12, 0xffe9a8);
      this.add.rectangle(hx[2] - 36, 138, 10, 14, 0x8fd4ff);

      // wardrobe shed (bottom-left) + bánh mì cart = the powerup shop (§2)
      const shedImg = this.add.image(POS.shed[0], POS.shed[1], this.textures.exists('shedimg') ? 'shedimg' : 'shed');
      if (this.textures.exists('shedimg')) shedImg.setDisplaySize(150, 112);
      this.add.text(POS.shed[0], POS.shed[1] + 52, '🎽 Tủ đồ', { fontSize: '14px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);
      const cartImg = this.add.image(POS.cart[0], POS.cart[1], this.textures.exists('cartimg') ? 'cartimg' : 'cart');
      if (this.textures.exists('cartimg')) cartImg.setDisplaySize(160, 120);
      this.add.text(POS.cart[0], POS.cart[1] + 56, kt ? '🍜 Quán bánh mì — ĂN Ở ĐÂY' : '🍞 Bánh mì đêm — MỞ CỬA',
        { fontSize: '12px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);

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

      // player wolf
      this.player = this.physics.add.sprite(WW / 2, H / 2 + 20, 'wolf');
      this.player.setCollideWorldBounds(true).setScale(2);
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
        const wx = h.x - 30, wy = 196;   // v0.8: sau tấm rèm cửa sổ của căn nhà 8-bit
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

      // 🚓 Cảnh sát rượt 10 giây (Lucas 08-09, đáp án B: bị tóm = thua cả đêm).
      XDH.startPoliceChase = (houseId) => {
        if (this.police) return;
        const h = this.houseSprites[houseId];
        this.police = this.physics.add.sprite(h ? h.x : W / 2, h ? h.y + 40 : 60, 'police')
          .setScale(2).setDepth(54);
        this.chaseUntil = Date.now() + 10000;
        this.chaseText = this.add.text(W / 2, 40, '🚨 CHẠY!! 10s', {
          fontSize: '22px', color: '#ff5d73', fontFamily: 'Segoe UI', fontStyle: 'bold',
          backgroundColor: 'rgba(10,6,18,0.8)', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(60).setScrollFactor(0);   // v0.8: chữ CHẠY bám màn hình, không trôi
        XDH.UI.toast('🚨 GỌI CÔNG AN RỒI — CHẠY ĐI!!', 3000);
        XDH.Blips.jingle('lose');
      };

      // enableCapture=false: Phaser must NOT preventDefault these keys globally,
      // or they can never be typed into the chat <input> (W/A/S/D/E/Space were eaten).
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,E,SPACE', false);
      this.touch = { up: 0, down: 0, left: 0, right: 0 };
      document.querySelectorAll('#touchpad button').forEach(b => {
        const dir = b.dataset.dir;
        b.addEventListener('pointerdown', e => { e.preventDefault(); this.touch[dir] = 1; });
        b.addEventListener('pointerup', () => this.touch[dir] = 0);
        b.addEventListener('pointerleave', () => this.touch[dir] = 0);
      });

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
      tex('police', 16, 16, gg => {
        gg.fillStyle(0x1d3a8f); gg.fillRect(3, 2, 10, 3);          // mũ kê pi
        gg.fillStyle(0xeab98a); gg.fillRect(5, 5, 6, 5);           // mặt
        gg.fillStyle(0x221a12); gg.fillRect(6, 7, 1, 1); gg.fillRect(9, 7, 1, 1);
        gg.fillStyle(0x2b4fd9); gg.fillRect(4, 10, 8, 5);          // áo xanh
        gg.fillStyle(0xffdf3a); gg.fillRect(7, 11, 2, 2);          // phù hiệu
      });

      tex('hut', 110, 90, gg => {
        gg.fillStyle(0x5a4a3b); gg.fillRect(12, 28, 86, 58);
        gg.fillStyle(0x8a6a4b); gg.fillTriangle(4, 30, 106, 30, 55, 4);
        gg.fillStyle(0xffdf8a); gg.fillRect(24, 44, 20, 18);      // warm window
        gg.fillStyle(0x2e2517); gg.fillRect(60, 48, 22, 38);      // door
      });

      this.drawWolfTex();
    }

    // §0 #8-9: wolf sprite = avatar (face/hair/skin cosmetic) + outfit shirt color.
    drawWolfTex() {
      if (this.textures.exists('wolf')) this.textures.remove('wolf');
      const g = this.make.graphics({ add: false });
      const skinOpt = XDH.AVATAR.skin.find(o => o.id === XDH.avatar.skin) || XDH.AVATAR.skin[0];
      g.fillStyle(skinOpt.color);
      g.fillRect(4, 5, 8, 8);                                     // head
      g.fillTriangle(4, 5, 6, 5, 4, 1); g.fillTriangle(10, 5, 12, 5, 12, 1); // ears
      if (XDH.avatar.hair === 'mo') { g.fillStyle(0xff5dd2); g.fillRect(7, 1, 2, 4); }
      else if (XDH.avatar.hair === 'muot') { g.fillStyle(0x3a3150); g.fillRect(4, 5, 8, 1); }
      else { g.fillStyle(0x3a3150); g.fillRect(4, 5, 1, 1); g.fillRect(6, 4, 1, 2); g.fillRect(9, 5, 1, 1); }
      if (XDH.avatar.face === 'ngau') { g.fillStyle(0x151520); g.fillRect(5, 8, 6, 1); }
      else { g.fillStyle(0xf9e076); g.fillRect(6, 8, 1, 1); g.fillRect(9, 8, 1, 1); }
      g.fillStyle(0x5d6275); g.fillRect(7, 11, 2, 2);             // snout
      const o = XDH.run.outfit;
      g.fillStyle(o.shirt === 'grab' ? 0x2fae5a : o.shirt === 'sinhvien' ? 0x3f6fe0 : 0xe2718f);
      g.fillRect(5, 13, 6, 3);
      g.generateTexture('wolf', 16, 16);
      g.destroy();
      if (this.player) this.player.setTexture('wolf');
    }

    // Chase resolution: escaped → free but shaken · caught → the whole night is lost (B).
    endChase(escaped) {
      if (!this.police) return;
      this.police.destroy(); this.police = null;
      this.chaseText.destroy(); this.chaseText = null;
      if (escaped) {
        XDH.UI.toast('😮‍💨 Thoát rồi! Công an bỏ cuộc… đêm nay đừng bén mảng lại nhà đó nữa.');
      } else {
        XDH.run.policeCaught = true;
        XDH.Blips.jingle('lose');
        XDH.UI.showScore(false);
      }
    }

    activateNearby() {
      if (!this.nearTarget || XDH.Convo.isActive() || XDH.Tut.isActive() || this.police) return;
      if (this.nearTarget === 'wardrobe') XDH.UI.openWardrobe();
      else if (this.nearTarget === 'shop') XDH.UI.openShop();
      else if (this.nearTarget === 'tutorial') XDH.Tut.start();
      else XDH.Convo.start(this.nearTarget.id);
    }

    // Night clock: moon arc + shade + pre-dawn glow driven by real time (Q-D ~8 min).
    updateSky() {
      const r = XDH.run;
      if (!r) return;
      const mins = XDH.isKetTien() ? XDH.RULES.DAY_MINUTES : XDH.RULES.NIGHT_MINUTES;
      const prog = Math.min(1, (Date.now() - r.nightStart) / (mins * 60000));
      this.moon.x = 80 + prog * (W - 160);
      this.moon.y = 100 - Math.sin(prog * Math.PI) * 45;
      this.nightShade.setAlpha((XDH.isKetTien() ? 0.16 : 0.22) * Math.sin(prog * Math.PI));
      this.dawnGlow.setAlpha(prog > 0.72 ? ((prog - 0.72) / 0.28) * 0.32 : 0);
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
      if (XDH.Convo.isActive() || XDH.Tut.isActive() || document.querySelector('.overlay.show')) {
        this.player.setVelocity(0, 0);
        this.prompt.setVisible(false);
        return;
      }
      const k = this.keys, t = this.touch, sp = 220;
      let vx = 0, vy = 0;
      if (k.A.isDown || k.LEFT.isDown || t.left) vx = -sp;
      else if (k.D.isDown || k.RIGHT.isDown || t.right) vx = sp;
      if (k.W.isDown || k.UP.isDown || t.up) vy = -sp;
      else if (k.S.isDown || k.DOWN.isDown || t.down) vy = sp;
      this.player.setVelocity(vx, vy);

      // 🚓 chase tick: police is a bit slower than you (195 vs 220) — stop running and you're caught
      if (this.police) {
        const msLeft = this.chaseUntil - Date.now();
        this.chaseText.setText('🚨 CHẠY!! ' + Math.max(0, Math.ceil(msLeft / 1000)) + 's');
        this.physics.moveToObject(this.police, this.player, 195);
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
              : '🚪 Gõ cửa (E)';
          tx = h.x; ty = h.y + 60;
          break;
        }
      }
      if (!this.nearTarget && Phaser.Math.Distance.Between(px, py, POS.shed[0], POS.shed[1]) < 80) {
        this.nearTarget = 'wardrobe';
        promptText = '🎽 Mở tủ đồ (E)';
        tx = POS.shed[0]; ty = POS.shed[1] - 60;
      }
      if (!this.nearTarget && Phaser.Math.Distance.Between(px, py, POS.cart[0], POS.cart[1]) < 80) {
        this.nearTarget = 'shop';
        promptText = XDH.isKetTien() ? '🍜 Quán bánh mì — ăn (E)' : '🍞 Quầy bánh mì (E)';
        tx = POS.cart[0]; ty = POS.cart[1] - 60;
      }
      if (!this.nearTarget && this.hasTut && Phaser.Math.Distance.Between(px, py, POS.hut[0], POS.hut[1]) < 80) {
        this.nearTarget = 'tutorial';
        promptText = '👵 Học nghề với Bà Năm (E)';
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
    new Phaser.Game({
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
