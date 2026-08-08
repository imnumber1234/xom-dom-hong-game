// Conversation engine. THE GAME CODE (this file) owns every win/fail rule —
// the AI only suggests dialogue + emotion + bounded deltas; we clamp and decide.
XDH.Convo = (function () {
  const R = XDH.RULES;

  let active = null;   // { npc, houseId, state, history, timerId, secondsLeft, startedAt, turns }
  let busy = false;

  function outfitKey() {
    const o = XDH.run.outfit;
    return `${o.shirt}|${o.hat}|${o.item}`;
  }

  // §1: the door IS the trust meter. 0 closed → 3 almost open (4 = win, fully open).
  // Suspicion spiking pulls it back a notch — the player SEES the door start closing.
  function doorStage(st, diff) {
    const start = XDH.RULES.START.trust;
    let stage = Math.floor(4 * (st.trust - start) / (diff.threshold - start));
    stage = Math.max(0, Math.min(3, stage));
    if (st.suspicion >= XDH.RULES.SUSPICION_BLOCKS - 15) stage = Math.max(0, stage - 1);
    return stage;
  }

  function canKnock(houseId) {
    const h = XDH.run.houses[houseId];
    if (h.won) return { ok: false, why: 'Nhà này mời bạn vào rồi mà 🌕' };
    if (h.failedOutfits.includes(outfitKey())) {
      return { ok: false, why: 'Bộ đồ này bị nhà này nghi rồi — đổi đồ ở tủ đồ rồi quay lại!' };
    }
    return { ok: true };
  }

  async function start(houseId) {
    const gate = canKnock(houseId);
    if (!gate.ok) { XDH.UI.toast(gate.why); return; }
    const npc = XDH.NPCS[XDH.run.houses[houseId].npcIdx];
    active = {
      npc, houseId,
      seed: Math.floor(Math.random() * 100000),
      state: { ...R.START },
      history: [],
      secondsLeft: R.CONVO_SECONDS,
      startedAt: Date.now(),
      turns: 0,
      contraFired: [],  // outfit keys already penalized — contradiction hits ONCE per outfit (§1b)
      finalTestPhase: null,   // §3 câu hỏi chốt: null → 'answering' (hard house only)
      finalTestPassed: false
    };
    XDH.UI.openConvo(npc, active.state);
    tickTimer();
    active.timerId = setInterval(tickTimer, 1000);
    // NPC speaks first (scripted server-side greeting — free, sets the scene)
    await exchange('', true);
  }

  function tickTimer() {
    if (!active) return;
    active.secondsLeft--;
    XDH.UI.setTimer(active.secondsLeft);
    if (active.secondsLeft <= 0) {
      finish(false, 'Hết giờ — trời gần sáng, cửa đóng sầm. 🌅');
    }
  }

  async function playerSays(text) {
    if (!active || busy) return;
    text = (text || '').trim();
    if (!text) return;
    await exchange(text, false);
  }

  async function exchange(playerText, isGreeting, finalAsk) {
    if (!active) return;
    busy = true;
    XDH.UI.setBusy(true);
    if (!isGreeting && !finalAsk) {
      XDH.UI.echoPlayer(playerText);
      active.history.push({ role: 'player', text: playerText });
    }
    if (!isGreeting) XDH.UI.showThinking(active.npc);   // §6b: kill the 3-4s dead air
    let res;
    try {
      const r = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: active.npc.id,
          seed: active.seed,
          lang: XDH.lang,
          greet: !!isGreeting,
          finalTestAsk: !!finalAsk,
          playerText,
          history: active.history.slice(-16),
          outfit: XDH.outfitDescription(XDH.run.outfit),
          state: active.state,
          pass: XDH.run.pass || ''
        })
      });
      res = await r.json();
      if (!r.ok || !res.ok) throw new Error(res.error || ('HTTP ' + r.status));
    } catch (err) {
      XDH.UI.hideThinking();
      busy = false; XDH.UI.setBusy(false);
      XDH.UI.toast('Mất sóng với hàng xóm 😵 thử lại nhé (' + err.message + ')');
      return;
    }
    XDH.UI.hideThinking();

    const ai = res.npc;
    const brain = res.brain || (res.scripted ? 'scripted' : '?');
    active.history.push({ role: 'npc', text: ai.dialogue, brain, verdict: ai.verdict || null });
    active.turns++;

    // ==== RULES LAYER — game code decides everything below ====
    // §1b: the AI only JUDGES (verdict enum); this table owns the numbers, identically
    // for all 3 brains, scaled by the house's difficulty tier (§2b).
    const st = active.state;
    const diff = XDH.DIFFICULTY[active.npc.id];
    if (!isGreeting && !finalAsk) {
      const v = XDH.VERDICTS[ai.verdict] || XDH.VERDICTS.thuong;
      let dT = v.trust, dS = v.suspicion, dI = v.interest, dP = v.patience;
      if (dT > 0) dT = Math.round(dT * diff.gainMult);
      let contraApplied = false;
      if (ai.contradiction && !active.contraFired.includes(outfitKey())) {
        active.contraFired.push(outfitKey());   // once per outfit-story pair
        dS += diff.contra.susp;
        dT += diff.contra.trust;
        contraApplied = true;
      }
      st.trust = Math.max(0, Math.min(100, st.trust + dT));
      st.suspicion = Math.max(0, Math.min(100, st.suspicion + dS));
      st.interest = Math.max(0, Math.min(100, st.interest + dI));
      st.patience = Math.max(0, Math.min(100, st.patience + dP));
      // score bookkeeping: most suspicious single moment
      if (dS > XDH.run.score.maxSuspDelta) {
        XDH.run.score.maxSuspDelta = dS;
        XDH.run.score.maxSuspQuote = playerText;
        XDH.run.score.maxSuspNpc = active.npc.name;
      }
      XDH.UI.debugTurn({
        verdict: ai.verdict, dT, dS, dI, dP,
        contradiction: contraApplied,
        brain: res.brain || (res.scripted ? 'kịch bản' : '?'),
        state: st
      });
    }
    // §3 final-test grading: the player's answer to the "câu hỏi chốt" decides pass/spike.
    if (!isGreeting && !finalAsk && active.finalTestPhase === 'answering') {
      if (ai.verdict === 'hop_ly' || ai.verdict === 'danh_trung') {
        active.finalTestPassed = true;
      } else {
        st.suspicion = Math.min(100, st.suspicion + 10);   // fumbled the make-or-break question
      }
      active.finalTestPhase = null;
    }

    XDH.UI.setMeters(st);
    XDH.UI.setDoorStage(doorStage(st, diff));

    // Type out the NPC line with blips, then judge.
    await XDH.UI.typeNpcLine(ai.dialogue, ai.emotion, active.npc);
    XDH.UI.setConvoState(ai.convo_state);
    if (ai.thought) XDH.UI.setThought(ai.thought);
    // §4: desktop auto-focus so the player can answer immediately (mobile: no keyboard pop-up)
    if (window.matchMedia('(pointer: fine)').matches) {
      setTimeout(() => { const t = document.getElementById('text-in'); if (!t.disabled) t.focus(); }, 60);
    }

    if (isGreeting) { busy = false; XDH.UI.setBusy(false); return; }

    let doorOpens = st.trust >= diff.threshold &&
                    st.suspicion < R.SUSPICION_BLOCKS &&
                    !!ai.invite_intent;
    // §3/§2b: hard house never opens on the first invite — one "câu hỏi chốt" first.
    if (doorOpens && diff.finalTest && !active.finalTestPassed) {
      doorOpens = false;
      if (active.finalTestPhase !== 'answering') {
        active.finalTestPhase = 'answering';
        await exchange('', false, true);   // NPC asks the make-or-break question
        return;
      }
    }
    const failed = st.suspicion >= R.SUSPICION_FAIL || st.patience <= 0 || !!ai.shutdown;

    if (doorOpens) {
      // §0 #4: the door is open — the KILL button takes it from here (no auto-finish).
      busy = true;
      XDH.UI.setBusy(true);
      document.getElementById('btn-kill').style.display = 'block';
      XDH.UI.setDoorStage(4);
    } else if (failed) {
      const why = st.suspicion >= R.SUSPICION_FAIL ? 'Bị nghi tới bến — cửa khoá, đèn tắt. 🔒'
        : st.patience <= 0 ? 'Hàng xóm hết kiên nhẫn, đóng sầm cửa. 😤'
        : 'Hàng xóm đuổi thẳng. Về thay đồ đi. 🚪💨';
      finish(false, why);
    } else {
      busy = false; XDH.UI.setBusy(false);
    }
  }

  function finish(won, message) {
    if (!active) return;
    clearInterval(active.timerId);
    const h = XDH.run.houses[active.houseId];
    const elapsed = Math.round((Date.now() - active.startedAt) / 1000);
    if (won) {
      h.won = true;
      XDH.UI.setDoorStage(4);   // fully open
      XDH.run.score.entered++;
      if (elapsed < XDH.run.score.fastest) {
        XDH.run.score.fastest = elapsed;
        XDH.run.score.bestOutfit = XDH.outfitLabel(XDH.run.outfit);
      }
      XDH.Blips.jingle('win');
    } else {
      if (!h.failedOutfits.includes(outfitKey())) h.failedOutfits.push(outfitKey());
      XDH.Blips.jingle('lose');
    }
    XDH.run.transcripts.push({
      npc: active.npc.name, won, elapsed,
      outfit: XDH.outfitLabel(XDH.run.outfit),
      lines: active.history.slice()
    });
    const houseId = active.houseId;
    busy = false;
    XDH.UI.setBusy(false);
    XDH.UI.endConvo(message, won, () => {
      active = null;
      XDH.UI.refreshHud();
      if (won) XDH.UI.afterHouseWon();   // §2: loot → night-quota check → next night / win
      else if (XDH.curtainPeek) XDH.curtainPeek(houseId);   // §2 fail visual: eyes behind the curtain
    });
  }

  // §0 #4 — KILL button pressed on a real house: silhouette scene, then the win flow.
  async function kill() {
    if (!active) return;
    document.getElementById('btn-kill').style.display = 'none';
    await XDH.UI.playKillScene();
    finish(true, XDH.lang === 'en'
      ? '🚪✨ "COME IN!" — you wiped your feet politely first. A werewolf with manners.'
      : '🚪✨ "MỜI VÀO!" — bạn lịch sự lau chân rồi bước vào. Một con ma sói có giáo dục.');
  }

  // §2 powerups — bought at the cart, used mid-conversation. All effects code-owned.
  async function useItem(id) {
    if (!active || busy) return;
    const inv = XDH.run.inv;
    if (!inv[id]) return;
    if (id === 'gift') {
      inv.gift--;
      const st = active.state;
      st.trust = Math.min(100, st.trust + XDH.GIFT_TRUST);
      XDH.UI.echoPlayer('(lấy ly trà sữa nóng ra tặng) 🧋');
      active.history.push({ role: 'player', text: '(Người lạ tặng bạn một ly trà sữa nóng còn nguyên tem quán.)' });
      XDH.UI.setThought('Ai mà chê trà sữa khuya bao giờ… dễ thương ghê.');
      XDH.UI.setMeters(st);
      XDH.UI.setDoorStage(doorStage(st, XDH.DIFFICULTY[active.npc.id]));
    } else if (id === 'hourglass') {
      inv.hourglass--;
      active.secondsLeft += 45;
      XDH.UI.setTimer(active.secondsLeft);
      XDH.UI.toast('⏳ Trời chậm sáng thêm 45 giây!');
    } else if (id === 'hint') {
      inv.hint--;
      XDH.UI.toast('💡 Quân sư đang nghĩ…');
      try {
        const r = await fetch('/api/converse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            npcId: active.npc.id, hintAsk: true, seed: active.seed, lang: XDH.lang,
            history: active.history.slice(-16),
            outfit: XDH.outfitDescription(XDH.run.outfit),
            state: active.state, pass: XDH.run.pass || ''
          })
        });
        const res = await r.json();
        if (!res.ok || !res.hint) throw new Error('no hint');
        XDH.UI.showHint(res.hint);
      } catch {
        inv.hint++;   // refund
        XDH.UI.toast('Quân sư ngủ gật — thử lại nhé.');
      }
    } else if (id === 'wardrobe') {
      inv.wardrobe--;
      XDH.UI.openWardrobe();   // change outfit right at the door
    }
    XDH.UI.renderConvoItems();
    XDH.UI.refreshHud();
  }

  function leave() {
    if (!active) return;
    clearInterval(active.timerId);
    XDH.run.transcripts.push({
      npc: active.npc.name, won: false, elapsed: Math.round((Date.now() - active.startedAt) / 1000),
      outfit: XDH.outfitLabel(XDH.run.outfit), lines: active.history.slice(), left: true
    });
    active = null; busy = false;
    XDH.UI.closeConvo();
  }

  return { start, playerSays, leave, canKnock, useItem, kill, isActive: () => !!active };
})();
