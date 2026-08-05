# Suck Up! (Proxima) — design + IP research (2026-08-05)
(Research agent report. All claims cited inline.)

## 1. Core gameplay loop
- Premise: vampire in a suburban neighborhood — "talk to real AI characters, fool them into trusting you, and find a way into their homes to feed without getting caught" (https://store.steampowered.com/app/2726370/Suck_Up/, https://www.playsuckup.com/).
- Loop: pick disguise → approach house → speak (mic or text) → improvise to get INVITED in (vampire rule) → feed → next neighbor (https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/SuckUp, https://keithschacht.com/2024/Nov/26/vampire-game-based-around-ai-voice-suck-up/).
- Disguises (delivery driver, tourist, utility worker, knight…) give the lie a visual foundation; a neighbor who saw through a disguise refuses it — changing costume earns another try (https://shapes.inc/fandom/suck-up/gameplay-mechanics).
- Success = visible "Suck Up Meter" (trust); suspicion → locked door / police / weapon (https://shapes.inc/fandom/suck-up/gameplay-mechanics). Server "analyzes message tone and topic" (https://themagicrain.com/2024/04/suck-up-is-a-vampire-game-that-uses-a-i-to-interact-with-its-players/).
- Session shape: EA had 10,000 AI tokens ≈ 40-50 hrs, 1 token per NPC interaction → minutes-long encounters strung into runs (same source).
- 1.0 modes: Classic, Love Bites (cupid), Mic Drop (AI rap battles) (https://www.playsuckup.com/).

## 2. What players LOVE (top 3)
1. **"Yes-and" improv comedy** — costumes + openers + quirky personas create improv; dev watched 1,000+ streams, "each one feels distinct" (https://speedrun.substack.com/p/the-rise-of-the-ai-companion).
2. **Voice-first freedom, no dialogue trees** (same source, https://keithschacht.com/2024/Nov/26/vampire-game-based-around-ai-voice-suck-up/).
3. **Streamability = the growth engine** — launched Dec 2023 with zero marketing → hundreds of YouTube videos, Twitch, millions of TikTok views; CaseOh 3-part series (https://knowyourmeme.com/memes/subcultures/suck-up, https://caseoh.fandom.com/wiki/Suck_Up!_(Series)).

## 3. What players COMPLAIN about (Steam: Mixed, 61% of ~198)
| Complaint | Detail |
|---|---|
| **AI downgraded at 1.0** | Token-metered EA AI "spoke like real people"; post-1.0 "catastrophic dialogues" — players asked for tokens BACK (https://steamcommunity.com/app/2726370/reviews/?browsefilter=toprated) |
| AI breaking/freezing | freezes mid-convo; agrees to let you in but door never opens (same) |
| Audio bugs | music disappears, volume settings ignored (same) |
| Value at price | "too many issues for the price" (same) |
| Token anxiety (EA) | fear of exhausting tokens (https://themagicrain.com/2024/04/suck-up-is-a-vampire-game-that-uses-a-i-to-interact-with-its-players/) |

**Lesson #1: model quality IS the product — cheaping out on the AI tanked the game. Latency is barely mentioned.**

## 4. Business/tech facts
- $15.99 EA via own website; Steam 1.0 Oct 1 2025, 226,000₫ in VN; dev+publisher Proxima (https://store.steampowered.com/app/2726370/Suck_Up/).
- Windows PC, GTX 650 min (AI is remote). Engine not publicly confirmed.
- Server-side AI: Steam AI disclosure = connects to ChatGPT/OpenAI; "PCs not powerful enough" per devs (Steam page, Magic Rain).
- EA: 10k tokens/purchase, planned top-ups; 1.0 removed tokens (+ quality complaints). No subscription found.
- 1.0 UGC: create characters (appearance+personality), share; community neighborhoods; Steam Workshop (https://store.steampowered.com/news/app/2726370/view/496077392009232917).
- Proxima: founded 2021, Ran Mo (ex-EA PM), ~$1.6M raised (https://www.cbinsights.com/company/proxima-2, https://foundersquest.podbean.com/e/ep-10-ran-mo-proxima/).

## 5. Clone/IP line
- **Mechanics are NOT protectable** — "persuade AI NPCs with your voice to be let in" is an idea (https://fkks.com/news/how-courts-view-copyright-protection-for-video-games, https://publicknowledge.org/tetris-copyright-decision-shows-how-complicated-copyright-for-games-can-be/).
- **Protectable — never copy:** art style expression, character designs, names, dialogue, music, trade dress. Tetris v. Xio (D.N.J. 2012) — clone lost on visual style + trade dress (https://en.wikipedia.org/wiki/Tetris_Holding,_LLC_v._Xio_Interactive,_Inc.).
- Safe line: new setting (VN neighborhood, VN folklore creature), new art, new name, new characters, new UI = fine. "Corporate Suck Up" already exists on Steam reusing the concept openly (https://store.steampowered.com/app/3461430/Corporate_Suck_Up/).
- Genre is crowded, nobody owns it: Vaudeville (Inworld), Dead Meat (local SLM + ElevenLabs + Whisper — GDC 2025: https://www.nvidia.com/en-us/on-demand/session/gdc25-gdc1010/), AI People (GoodAI), 1001 Nights (Qwen + hand-written frameworks: https://ada-eden.itch.io/1001-nights-official/devlog/724545/1001-nights-llm-configuration), AI Roguelite.

## 6. Engineering detail published: thin
- No deep Proxima writeup/GDC talk exists. Server-side LLM + token cost-control + "no real guardrails" minimal-guardrail improv philosophy are the known facts (Steam disclosure, Magic Rain, a16z speedrun).
- Best proxies for our build: Dead Meat GDC 2025 session + 1001 Nights LLM-config devlog.

## Warnings
- SEO fakes exist (suckup-game.com, openaimaster "goth/prep/jock/nerd mobile version") — NOT the real game; don't let them leak into the plan.

## 3 exploitable lessons
1. Model quality IS the product (players revolted at downgrade).
2. Growth engine = streamers, not stores → score screen must be screenshot/clip-worthy.
3. Per-interaction AI cost forced their token meter → decide our cost model up front (cheap model + strong prompts vs metered premium).
