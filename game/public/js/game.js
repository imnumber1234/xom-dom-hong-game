// Phaser 3 neighborhood: WASD/touch walk, 3 houses, wardrobe shed, decorative food cart.
(function () {
  const W = 960, H = 640;

  class Xom extends Phaser.Scene {
    constructor() { super('xom'); }

    create() {
      this.makeTextures();

      // ground
      for (let x = 0; x < W; x += 32)
        for (let y = 0; y < H; y += 32)
          this.add.image(x + 16, y + 16, (x / 32 + y / 32) % 2 ? 'grass' : 'grass2');
      // road strip
      for (let x = 0; x < W; x += 32) this.add.image(x + 16, H / 2 + 16, 'road');

      // moon
      this.add.circle(W - 90, 70, 34, 0xfff3c4).setAlpha(0.95);
      this.add.circle(W - 102, 62, 30, 0x0d0a14).setAlpha(0.25);

      // houses (top row) — door zones
      this.houseSprites = [];
      const hx = [170, 480, 790];
      hx.forEach((x, i) => {
        const s = this.add.image(x, 170, 'house' + i);
        const label = XDH.NPCS[XDH.run.houses[i].npcIdx].name.split(' (')[0];
        this.add.text(x, 258, 'Nhà ' + label, { fontSize: '14px', color: '#f2ecff', fontFamily: 'Segoe UI' }).setOrigin(0.5);
        this.houseSprites.push({ x, y: 220, id: i, sprite: s });
      });

      // wardrobe shed (bottom-left) + food cart (bottom-right, decorative)
      this.add.image(120, 500, 'shed');
      this.add.text(120, 552, '🎽 Tủ đồ', { fontSize: '14px', color: '#ffb547', fontFamily: 'Segoe UI' }).setOrigin(0.5);
      this.add.image(820, 500, 'cart');
      this.add.text(820, 556, 'Bánh mì đêm (đóng cửa)', { fontSize: '12px', color: '#9b8fc0', fontFamily: 'Segoe UI' }).setOrigin(0.5);

      // player wolf
      this.player = this.physics.add.sprite(W / 2, H / 2 + 90, 'wolf');
      this.player.setCollideWorldBounds(true).setScale(2);
      this.physics.world.setBounds(0, 0, W, H);

      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,E,SPACE');
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
      }).setOrigin(0.5).setVisible(false).setInteractive({ useHandCursor: true });
      this.prompt.on('pointerdown', () => this.activateNearby());

      this.nearTarget = null;
    }

    makeTextures() {
      const g = this.make.graphics({ add: false });
      const tex = (key, w, h, fn) => { g.clear(); fn(g); g.generateTexture(key, w, h); };

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
      });

      tex('wolf', 16, 16, gg => {
        gg.fillStyle(0x8a8fa8); gg.fillRect(4, 5, 8, 8);          // head
        gg.fillTriangle(4, 5, 6, 5, 4, 1); gg.fillTriangle(10, 5, 12, 5, 12, 1); // ears
        gg.fillStyle(0xf9e076); gg.fillRect(6, 8, 1, 1); gg.fillRect(9, 8, 1, 1); // glowy eyes
        gg.fillStyle(0x5d6275); gg.fillRect(7, 11, 2, 2);         // snout
        gg.fillStyle(0xe2718f); gg.fillRect(5, 13, 6, 3);         // cute shirt
      });
    }

    activateNearby() {
      if (!this.nearTarget || XDH.Convo.isActive()) return;
      if (this.nearTarget === 'wardrobe') XDH.UI.openWardrobe();
      else XDH.Convo.start(this.nearTarget.id);
    }

    update() {
      if (XDH.Convo.isActive() || document.querySelector('.overlay.show')) {
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

      // proximity checks
      const px = this.player.x, py = this.player.y;
      this.nearTarget = null;
      let promptText = '', tx = 0, ty = 0;
      for (const h of this.houseSprites) {
        if (Phaser.Math.Distance.Between(px, py, h.x, h.y) < 90) {
          const st = XDH.run.houses[h.id];
          this.nearTarget = h;
          promptText = st.won ? '✅ Đã được mời vào' : '🚪 Gõ cửa (E)';
          tx = h.x; ty = h.y + 60;
          break;
        }
      }
      if (!this.nearTarget && Phaser.Math.Distance.Between(px, py, 120, 500) < 80) {
        this.nearTarget = 'wardrobe';
        promptText = '🎽 Mở tủ đồ (E)';
        tx = 120; ty = 440;
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
