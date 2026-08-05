# Engine/platform decision — VN "lie to your AI neighbors" voice game MVP
(Research agent report, 2026-08-05. All claims cited inline.)

**Verdict up front: Option B (browser game, Phaser 3 or plain HTML5/JS, on Cloudflare Pages + Workers). Option C (Godot web export) is effectively disqualified for a mic game. Option A (Godot desktop) is the fallback only if the game later outgrows the browser.**

---

## The disqualifying fact first (Option C)

Godot's own microphone tutorial lists supported platforms as: **"Godot supports in-game audio recording for Windows, macOS, Linux, Android and iOS."** — **Web is not on the list** (https://docs.godotengine.org/en/stable/tutorials/audio/recording_with_microphone.html). The web export page only warns that "Access to microphone requires a secure context" without documenting working mic support (https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). A voice-driven game on a platform where the engine doesn't document mic support = betting the core mechanic on the weakest part of the stack.

---

## Side-by-side

| Criterion | A. Godot 4 desktop .exe + Python/Node backend | B. Browser (Phaser 3 / HTML5) + CF Pages/Workers | C. Godot 4 web export |
|---|---|---|---|
| **Mic capture** | Good. Officially supported on Windows via AudioEffectCapture; enable `audio/driver/enable_input` (https://docs.godotengine.org/en/stable/tutorials/audio/recording_with_microphone.html). Known frame-rate drift quirks; `AudioServer.get_input_frames()` added in 4.6 to improve reliability (https://docs.godotengine.org/en/stable/classes/class_audioeffectcapture.html). You'd still hand-roll WAV encoding + upload | Best. `getUserMedia` + `MediaRecorder` supported in Chrome/Edge/Firefox/Android, and iOS Safari since 14.5 (https://caniuse.com/mediarecorder, https://webkit.org/blog/11353/mediarecorder-api/). One caveat: iOS Safari records MP4/AAC, not WebM — backend must accept both (https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription) | Bad. Mic recording not listed as supported on Web (see above). Plus web audio has active bugs: audio bus effects absent in web export (https://github.com/godotengine/godot/issues/100102) and iOS Safari/Chrome crashes after minutes of audio (https://github.com/godotengine/godot/issues/107390) |
| **Iteration speed with Claude Code** | Good. GDScript + `.tscn` are plain text, and we already have the Godot MCP bridge (run project, read errors). But test loop = launch editor/exe each time | Best. Plain `.js`/`.html` — instant reload in a browser tab; `wrangler pages deploy` gives a shareable preview URL in seconds. Phaser 3 skill pack already installed | Same authoring as A, but every test requires re-export + a properly-headered local server — slowest loop of the three |
| **Distribution to 5-15 friends in VN** | Worst. Send a zip/exe → Windows SmartScreen "unknown publisher" scare, no phones, and the Python backend must be reachable from their machines (tunnel/VPS) | Best. Send one Zalo link; works on their phones. Zero install | Medium-bad even if mic worked: default `.wasm` is ~40 MB (5 MB Brotli) (https://godotengine.org/article/progress-report-web-export-in-4-3/), which **exceeds Cloudflare Pages' 25 MiB per-file limit** (https://developers.cloudflare.com/pages/platform/limits/). Multi-threaded builds need COOP/COEP headers (https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html); itch.io's SharedArrayBuffer support is experimental and Chromium-only via `credentialless` (https://itch.io/blog/456223/godot-cross-origin-isolation-and-sharedarraybuffers) |
| **API key security** | OK. Keys live in the Python/Node server; but for remote friends that server must be hosted anyway — so you're building the Worker equivalent regardless | Best-known pattern. Keys go in Workers **secrets**: "encrypted text values… for storing sensitive information like API keys and auth tokens", never shipped to the client (https://developers.cloudflare.com/workers/configuration/secrets/). Custom headers on Pages via `_headers` file if ever needed (https://developers.cloudflare.com/pages/configuration/headers/) | Same as B (calls a Worker), no advantage |

---

## How real AI-NPC indies shipped (precedent)

| Game | Stack | Relevance |
|---|---|---|
| **Suck Up!** (Proxima) — the exact genre | Voice or text → sent to **their server**, which calls the LLM (started ChatGPT 3.5, later GPT-5); mic understood ~90% of the time; shipped **first via their own website**, Steam later (https://themagicrain.com/2024/04/suck-up-is-a-vampire-game-that-uses-a-i-to-interact-with-its-players/, https://www.hypergridbusiness.com/2025/10/indie-vampire-game-highlights-future-for-ai-driven-games/) | Validates thin-client + server-holds-keys, and web-first distribution |
| **Dead Meat** (Meaning Machine) | Voice-or-keyboard interrogation, author-written content steering the LLM ("Game Conscious AI"); Steam 2025 (https://www.gamespress.com/en-US/Get-creative-in-DEAD-MEAT-the-detective-game-where-you-can-ask-suspect, https://www.meaningmachine.games/game-conscious-ai) | Hand-written persona + guardrails beats raw LLM — copy this for NPC prompts |
| **AI2U: With You 'Til The End** (AlterStaff) | **Unity** + ChatGPT for NPC brains; itch.io beta → Steam Early Access (https://en.wikipedia.org/wiki/AI2U:_With_You_%27Til_The_End) | Another "big engine + cloud LLM" data point; none shipped on Godot web |

Pattern: every one is a thin game client + cloud LLM behind the developer's server. None relies on engine-level web mic.

## Reusable frameworks / SDKs — mostly skip for this MVP

- **NobodyWho** (Godot GDExtension, local GGUF LLMs, no API keys) — real and maintained (https://godotengine.org/asset-library/asset/2886, https://github.com/nobodywho-ooo/nobodywho). Wrong fit: local-model quality in **Vietnamese** is poor at small sizes, and it ties us to Godot desktop.
- **Convai** (Unity/Unreal-first NPC SaaS): free tier ~100 interactions, Indie $29/mo for 3,000 interactions, $0.0025/extra (https://convai.com/pricing, https://www.saasworthy.com/product/convai/pricing). 15 chatty friends burn the free tier in one evening; not built for Phaser/Godot anyway.
- **Inworld** pivoted from character-SDK toward "Inworld Runtime" infrastructure (https://inworld.ai/runtime, https://docs.inworld.ai/docs/release-notes/) — moving target, overkill.
- **No credible open-source "Suck Up clone" exists on GitHub** (searched; only generic voice-chat scaffolds like https://github.com/bigsk1/voice-chat-ai). The loop (record → STT → LLM-with-persona-prompt → JSON verdict + emotion tag → portrait swap) is ~300 lines of Worker code. Reuse ideas, not frameworks.

---

## Recommendation for the 1-2 week friend test

**Build Option B.** Success odds for "15 VN friends actually playtest within 2 weeks": **B ~90%, A ~55% (Windows-only friends, exe fear, backend hosting), C ~15% (undocumented mic + 40MB/25MiB hosting wall).** Long-term flag: if this becomes a real Steam product later, port to Godot desktop then — the NPC persona prompts, backend Worker, and art all carry over unchanged; only the client is rewritten, and the client is the cheap part.

Concrete MVP shape:
1. **Client:** Phaser 3, one tilemap scene, WASD, dialogue box, 5 portrait PNGs per NPC swapped by an `emotion` field in the JSON reply. Hold-Space push-to-talk → `MediaRecorder` blob (accept WebM *and* MP4 for iPhones) → POST to Worker.
2. **Backend:** one Cloudflare Worker: audio → STT → LLM with a per-NPC persona + JSON schema (dialogue/emotion/deltas) → return text + emotion. All keys in Worker secrets.
3. **Ship:** `wrangler pages deploy` → one link in the friends' Zalo group. Simple shared password so strangers don't drain the API budget.

Known risk: browser mic permission prompts confuse some users (must be HTTPS — Pages is), and in-app browsers (Zalo/FB webview) can block `getUserMedia` — tell friends "open in Chrome/Safari" in the link message.
