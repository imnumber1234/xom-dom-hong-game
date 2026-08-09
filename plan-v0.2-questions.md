# Xóm Đóm Hòng v0.2 — ONE question batch for Lucas (Session A, 2026-08-06)

> Answer these once → Session B builds v0.2 end-to-end with ZERO questions mid-build.
> Defaults marked (recommended). Silence on any item = default applies.

## Already FIXED + VERIFIED today (no decision needed)
- **Typing bug**: Phaser was swallowing W/A/S/D/E/Space page-wide → letters vanished from the chat box. Fixed (capture off) + auto-focus the box on desktop. LIVE.
- **Mic on Brave/Firefox/webviews**: Web Speech only exists in Chrome/Edge → "Mic lỗi (network)". Built /api/stt fallback: browser records → Cloudflare Workers AI Whisper-large-v3-turbo transcribes. Tested with real Vietnamese audio (mp3 + webm): 100% exact, full diacritics. Cost $0.00051/audio-minute. LIVE.
- **"Is the AI real?"**: YES — DeepSeek answers live (verified today, in-character, deltas working). Haiku is blocked from CF Asia colos (403) — see Q11.

## A. Game structure
1. **Mode order**: Werewolf mode first (v0.2), Beggar mode after reusing the same engine (v0.3)? *(recommended: yes — engine is shared: same NPCs, same meters; Beggar swaps "invite me in" for "donate money")*
2. **Day system**: Day 1 = enter 1 house, Day 2 = 2 houses, Day 3 = 3 houses = win the run? How many days total? *(recommended: 3 days, ~10-min run)*
3. **Timers**: keep 3:00 per conversation + add a per-day night timer? *(recommended: keep convo timer only — two clocks stress players)*
4. **Kill sequence**: door opens → KILL button → screen fades → cartoon silhouette animation (ORIGINAL art — Among-Us-style vibe but our own drawing, IP-safe) → steal 1 clothing item → back outside. No blood/gore, comedy tone? (yes/no)
5. **Reward**: killed house drops its owner's outfit piece into your wardrobe? (yes/no)

## B. Tutorial (scripted house 0)
6. Confirm the exact beat-script: walk arrows → knock → NPC "Ai đó?" → tutorial tells you to SAY "Tôi là shipper, có đơn hàng cho chị" → NPC "Chị đâu có đặt gì đâu?" → tutorial teaches the gaslight "Quà sinh nhật bất ngờ từ người yêu chị đó" → NPC opens → kill button → next house. OK as written? Skippable for repeat players? *(recommended: yes + skippable)*
7. Tutorial NPC = a 4th throwaway character (so the 3 real NPCs stay fresh)? *(recommended: yes)*

## C. Avatar menu
8. Start screen avatar customization: face / hair / skin = cosmetic only, costume slots (shirt/hat/item) = affect AI story-checking like now? *(recommended: yes — cosmetics don't change AI logic)*
9. Art for avatar + kill animation: keep code-drawn pixel art v0.2, upgrade later via nano-banana? *(recommended: yes — art never blocks the fun test)*

## D. Languages
10. EN + VN toggle on start screen. Same NPCs, bilingual (persona cards have EN twins, NPC replies in chosen language; mic auto-switches vi↔en)? *(recommended: yes — one neighborhood, two languages)*

## E. AI brains
11. **Unlock Haiku via Cloudflare AI Gateway** — needs Lucas ~10 min in CF dashboard. Suck Up! research lesson #1: model quality IS the product. Do it before friend test? (yes/no/later)
12. **Scripted 3-choice mode**: each NPC question shows 3 answer buttons (one lowers suspicion, one neutral, one raises). Is this an EASY MODE next to free talk, or replaces free talk? *(recommended: easy-mode toggle — free talk is the magic; 3-choice guarantees zero-cost, zero-latency play for weak mics. Full scenario scripts get written AFTER personalities are locked below.)*

## F. Personalities — fill ONE line per NPC (the form Lucas asked for)
Format: Name · age · job · background 1 line · likes · dislikes · tone/catchphrases · Suspicion 1-5 (5 = interrogates everything) · Critical thinking 1-5 (5 = catches every contradiction) · Weakness (the lever that opens the door)

Current 3 (edit anything):
- **Cô Sáu** · 32 · mẹ bỉm sữa · chồng công tác, bé Bin 8 tháng khó ngủ · likes: chuyện chợ búa, khen con · dislikes: ồn ào, mâu thuẫn chi tiết · giọng bà tám "nè/nha/trời đất ơi" · Suspicion 4 · Critical 5 · Weakness: khen bé Bin + chi tiết đời thường nhất quán
- **Tí** · 20 · sinh viên CNTT mê bóng đá · ở trọ, sợ chủ trọ + đa cấp · likes: bàn trận đấu có nghề, đồ ăn · dislikes: sai kiến thức bóng đá, dạy đời · giọng teen "vãi/xịn" · Suspicion 2 · Critical 3 · Weakness: nói chuyện bóng đá đúng + rủ xem chung
- **Ly** · 19 · TikToker 500k follow · quay video lúc nửa đêm · likes: drama, người tự tin, ý tưởng content · dislikes: nhạt, kể lể · giọng Gen Z "xỉu/slay/ét ô ét" · Suspicion 2 · Critical 1 · Weakness: đề nghị ý tưởng video độc

13. Keep these 3 + add how many new? *(recommended: +1 tutorial NPC +1 hard NPC = 5 total; candidates: bác bảo vệ về hưu (Suspicion 5), bà bán bánh mì đêm, chú Grab, cô giáo, ông nhậu)*
14. For each NEW NPC, give one line in the format above (or say "Claude drafts, tôi duyệt").

## G. Pass number (lean startup — set BEFORE building)
15. v0.2 passes if: Lucas finishes tutorial + day 1 without help AND ≥7/10 friends who start the tutorial finish it and say "chơi nữa". OK?
