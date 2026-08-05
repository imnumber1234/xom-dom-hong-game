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
      turns: 0
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

  async function exchange(playerText, isGreeting) {
    if (!active) return;
    busy = true;
    XDH.UI.setBusy(true);
    if (!isGreeting) {
      XDH.UI.echoPlayer(playerText);
      active.history.push({ role: 'player', text: playerText });
    }
    let res;
    try {
      const r = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: active.npc.id,
          seed: active.seed,
          greet: !!isGreeting,
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
      busy = false; XDH.UI.setBusy(false);
      XDH.UI.toast('Mất sóng với hàng xóm 😵 thử lại nhé (' + err.message + ')');
      return;
    }

    const ai = res.npc;
    active.history.push({ role: 'npc', text: ai.dialogue });
    active.turns++;

    // ==== RULES LAYER — game code decides everything below ====
    const st = active.state;
    if (!isGreeting) {
      const clamp = (v) => Math.max(-R.DELTA_CLAMP, Math.min(R.DELTA_CLAMP, Math.round(v || 0)));
      let dT = clamp(ai.deltas && ai.deltas.trust);
      let dS = clamp(ai.deltas && ai.deltas.suspicion);
      let dI = clamp(ai.deltas && ai.deltas.interest);
      let dP = clamp(ai.deltas && ai.deltas.patience);
      if (ai.contradiction) {           // outfit-vs-story: code-owned modifier
        dS += R.CONTRADICTION_SUSP;
        dT += R.CONTRADICTION_TRUST;
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
    }
    XDH.UI.setMeters(st);

    // Type out the NPC line with blips, then judge.
    await XDH.UI.typeNpcLine(ai.dialogue, ai.emotion, active.npc);

    if (isGreeting) { busy = false; XDH.UI.setBusy(false); return; }

    const doorOpens = st.trust >= R.TRUST_TO_OPEN &&
                      st.suspicion < R.SUSPICION_BLOCKS &&
                      !!ai.invite_intent;
    const failed = st.suspicion >= R.SUSPICION_FAIL || st.patience <= 0 || !!ai.shutdown;

    if (doorOpens) {
      finish(true, '🚪✨ "MỜI VÀO!" — bạn lịch sự lau chân rồi bước vào. Một con ma sói có giáo dục.');
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
      if (XDH.run.score.entered >= R.HOUSES_TO_WIN) {
        XDH.UI.showScore(true);
      } else if (XDH.run.houses.every(hh => hh.won || allOutfitsBurned(hh))) {
        XDH.UI.showScore(false);
      }
    });
  }

  // A house is hopeless only if EVERY outfit combo is burned — practically never;
  // kept simple: 27 combos exist, so we don't dead-end runs.
  function allOutfitsBurned() { return false; }

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

  return { start, playerSays, leave, canKnock, isActive: () => !!active };
})();
