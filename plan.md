# Xóm Đóm Hòng — Plan v1.1 (Session A closed, 2026-08-05)

> Vietnamese voice-driven social-deception comedy game, inspired by Suck Up! (playsuckup.com).
> Player walks an 8-bit VN neighborhood, picks a disguise, knocks on doors, improvises lies
> by SPEAKING Vietnamese; AI residents decide to invite them in or slam the door.
> Confidence: 92% — Lucas answered the 12-question batch in the docx 2026-08-05 18:00.

## 0. LUCAS'S LOCKED ANSWERS (2026-08-05, from the docx — override everything below on conflict)
- Q1-8, Q12: **all defaults confirmed** (3 houses; retry only after changing outfit; randomized
  residents; no gossip; full wardrobe from start; natural VN + occasional EN; neighborhood
  comedy tone; BROWSER platform; ~$5 API budget OK).
- **Q9 — LORE: stays MA SÓI (werewolf).** Lucas rejected the vampire switch. Own the joke:
  a werewolf who politely needs an invitation. Do NOT re-raise vampire.
- **Q10 — NO NPC voice.** Text-only dialogue with **Undertale-style beep-beep blips while
  text types out** (WebAudio, per-NPC pitch = free characterization). edge-tts is PARKED.
- **Q11 — TITLE: "Xóm Đóm Hòng"** (Lucas's own name, replaces "Xóm Này Khó Lắm").
  Spelling to double-confirm with Lucas at preview time (one string, trivial to change).
  Folder stays GitHub/Xom Nay Kho Lam.

---

## 1. What research locked in (3 reports, 2026-08-05)

### Suck Up! lessons (full report: research/suckup-design.md)
- Loop: disguise → knock → speak → improvise → get invited in (vampire rule) → repeat.
- Success judged by a visible trust "Suck Up Meter"; suspicion → door locked / police.
- Players LOVE: improv "yes-and" comedy, no dialogue trees, streamability (growth engine
  was YouTube/Twitch/TikTok, zero marketing).
- Players HATE (Steam 61% mixed): AI quality was DOWNGRADED at 1.0 → dialogue got dumb.
  **Model quality IS the product.** Latency is barely complained about.
- Tech: server-side ChatGPT, thin client, low GPU specs. Engine not public. $15.99 / 226k₫.
- IP line (Tetris v. Xio): mechanics are NOT protectable — art, names, characters,
  look-and-feel ARE. New setting + new art + new name + new characters = safe.
  NEVER copy their vampire, neighbors, meter design, or name.

### Voice pipeline (full report: research/voice-pipeline.md)
- STT: **local PhoWhisper via faster-whisper** (installed, v1.2.1) — best Vietnamese
  accuracy (beats Whisper-large-v3 on VN benchmarks), free. Warm server: ~1s per
  utterance (small/medium on CPU). Fallback: Chrome Web Speech API (free, streaming,
  vi-VN supported) or gpt-4o-mini-transcribe ($0.003/min).
- NPC brain: **Claude Haiku 4.5 + native structured outputs** (schema-guaranteed JSON).
  ~$0.01–0.025 per 3-min conversation with prompt caching. A/B Sonnet 4.6 (~3×) if
  Haiku's Vietnamese comedy falls flat — Suck Up! lesson says don't cheap out here.
- TTS: **edge-tts** (installed, v7.2.8, VERIFIED WORKING 2026-08-05 — generated
  vi-VN-HoaiMyNeural sample in scratchpad). Voices: HoaiMy (F), NamMinh (M). Free, streams.
- Latency budget: push-to-talk → ~1s STT + ~0.5–1s LLM first tokens + ~0.3s TTS ≈
  **2–2.5s total** — acceptable game band (<1.5s possible later with streaming tricks).
- Guardrails: fixed JSON schema (dialogue free-form, emotion enum, bounded deltas),
  in-character deflection rules in system prompt ("never break character, never mention AI").
- Cost: **under $0.10 per 10-minute session.**

### Engine / platform (full report: research/engine-choice.md)
- **WINNER: browser game (Phaser 3) + Cloudflare Pages + Workers backend.** ~90% odds
  friends actually playtest: one Zalo link, works on phones, no install, instant deploys,
  API keys in Worker secrets. iPhone caveat: Safari records MP4/AAC not WebM — backend
  accepts both; webviews (Zalo in-app) may block mic → tell friends "open in Chrome/Safari".
- Godot desktop .exe: 55% (SmartScreen scare, PC-only friends, still needs hosted backend).
  Port later ONLY if it becomes a Steam product; prompts/backend/art carry over.
- Godot web export: disqualified — mic not supported on web per official docs.
- Precedent: Suck Up!, Dead Meat, AI2U all = thin client + cloud LLM behind dev's server.
- No open-source clone worth reusing; the loop is ~300 lines of Worker code. Skip
  Convai/Inworld (pricing shaped wrong, wrong engines).

---

## 2. MVP v0.1 scope (Werewolf mode ONLY — Beggar mode parked in pending.md)

### Architecture — the 4 boxes
- **Data:** per-house conversation state (trust/suspicion/interest/patience 0–100, history),
  outfit description, run score, full transcripts (for the laugh reel + debugging).
  Stored in the Worker (KV or Durable Object per session). No accounts, no DB.
- **Screens:** 1 neighborhood map (WASD, 3 houses + wardrobe + decorative food shop),
  1 wardrobe overlay (1 shirt + 1 hat + 1 held item from 6 pieces), 1 door-conversation
  view (NPC portrait ×5 emotions, dialogue text, push-to-talk button, type fallback),
  1 score screen (houses entered, fastest entry, most suspicious moment, best disguise —
  built to screenshot/share).
- **Logic (GAME CODE, never the AI):** door opens iff trust ≥75 AND suspicion <60 AND
  AI emitted invite-intent; fail at suspicion ≥100, patience 0, 3-min timer, or explicit
  shutdown. Outfit-vs-story modifiers applied by code from AI's contradiction flag.
  AI only suggests deltas + dialogue + emotion; code clamps and decides.
- **Connections:** browser mic (MediaRecorder, WebM+MP4) → Cloudflare Worker →
  STT (PhoWhisper local via tunnel for dev; Web Speech / cloud STT as fallback path) →
  Claude Haiku 4.5 structured outputs → optional edge-tts voice reply → browser.

### The 3 NPCs (per design doc, already agreed)
1. **Mẹ bỉm sữa hàng xóm** — trusting via consistent details; gossip comedy.
2. **Sinh viên mê bóng đá** — won via shared fandom knowledge; club randomized (not always MU).
3. **Gen Z mê TikTok** — won via entertainment + confidence; bored fast.
Each: persona card system prompt, 5 portrait emotions (neutral/interested/amused/suspicious/angry),
hidden state. Portraits via nano-banana pixel-art gen, consistent style.

### Assumption test (lean startup — set BEFORE building)
> We believe VN friends will find voice-persuading AI neighbors funny.
> **PASS = ≥10 friends play a full 3-house run within 2 weeks of preview link,
> AND ≥7/10 answer "would you play another round?" YES.**
> Also collect: funniest-moment quotes (streamability signal = the real long-term bet).

### Build order (Session B)
1. Phaser 3 map + WASD + wardrobe (static, no AI) — playable skeleton.
2. Conversation engine: push-to-talk → Worker → STT → Haiku structured JSON →
   dialogue UI + portrait swap. Text-input path first (de-risk), then mic.
3. Game-code rules layer (thresholds, timer, outfit modifiers, score).
4. 3 personas + Vietnamese comedy prompt tuning (the REAL work — budget ½ the time here).
5. Score screen + transcript log.
6. Deploy to Cloudflare Pages preview → link for Lucas → friends after Lucas OK.

### Non-negotiables
- All Vietnamese with full diacritics. NPC dialogue: natural VN, occasional EN slang okay.
- Original art/names/characters only — nothing traceable to Suck Up! assets.
- API keys ONLY in Worker secrets. Simple shared password on the preview link.
- Preview deploy = auto-OK; anything public/official waits for Lucas.

---

## 3. Session-B execute prompt (paste into a NEW session)

/loop Build MVP v0.1 of "Xóm Đóm Hòng" per GitHub/Xom Nay Kho Lam/plan.md — read it first, section 0 (Lucas's locked answers) overrides everything. Werewolf (ma sói) lore, browser Phaser 3 + Cloudflare Worker, PhoWhisper/WebSpeech STT, Claude Haiku 4.5 structured outputs, NO NPC voice — Undertale-style text blips via WebAudio instead, game-code owns all win/fail rules. Self-approve reversible steps; queue irreversibles (public deploy, spending beyond ~$5 API, outbound messages) to pending.md and keep going. Finish = Cloudflare Pages preview link + em-testing pass vs the plan's DoD + report.md updated with new problems/decisions for Lucas.
