# Vietnamese Voice-Game MVP — voice pipeline research (2026-08-05)
(Research agent report. All claims cited inline.)

## 1. Vietnamese STT — options, real numbers, ranking

### (a) Local PhoWhisper via faster-whisper (already installed, v1.2.1)
- PhoWhisper (VinAI) is Whisper fine-tuned on 844h of multi-accent Vietnamese; PhoWhisper-large sets SOTA WER on Vietnamese Common Voice, VIVOS, VLSP 2020 benchmarks, and beats Whisper-large-v3 on Vietnamese WER/CER (https://github.com/VinAIResearch/PhoWhisper/blob/main/README.md, https://arxiv.org/pdf/2406.02555, https://arxiv.org/pdf/2602.12911).
- Latency, from faster-whisper's official benchmarks (https://github.com/SYSTRAN/faster-whisper):
  - CPU (i7-12700K, small model, int8): 13 min audio in 1m42s → RTF ~0.13 → **5-10s utterance ≈ 0.7-1.3s**.
  - Large on CPU impractical (~2.5× slower than real-time → 10s utterance ≈ 25s, https://runaihome.com/blog/whisper-large-v3-self-hosted-transcription-server-2026/).
  - Consumer GPU: large-v2 int8 → RTF ~0.075 → 10s utterance ≈ 0.8s.
- Practical: keep the model LOADED in a warm server process (cold model load dominates). CPU-only → PhoWhisper-small/base.

### (b) OpenAI Whisper API / gpt-4o-transcribe
- Whisper API $0.006/min; gpt-4o-transcribe $0.006/min-equiv; gpt-4o-mini-transcribe $0.003/min (https://costgoat.com/pricing/openai-transcription, https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/).
- Vietnamese is a noted weak spot vs specialists (https://openai.com/index/introducing-our-next-generation-audio-models/, https://arxiv.org/pdf/2604.15804). PhoWhisper-large beats generic Whisper-large-v3 on VN benchmarks → API is convenience, not quality upgrade.

### (c) Google Cloud STT — vi-VN supported incl. Chirp; $0.016/min V2, 60 free min/mo (https://cloud.google.com/speech-to-text/pricing). ~2.7× Whisper API price.

### (d) Browser Web Speech API (Chrome)
- Free; Chrome supports vi-VN, even in on-device recognition list (https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md, https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api, https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).
- Limits: no SLA, inconsistent accuracy, HTTPS required, Chrome-only in practice, audio goes to Google (https://www.assemblyai.com/blog/speech-recognition-javascript-web-speech-api). Streaming interim results ≈ near-zero perceived latency — attractive for a browser MVP.

### (e) Vietnamese specialists
| Provider | Price | Free tier | Source |
|---|---|---|---|
| FPT.AI STT | ~700 VND ≈ $0.028/min | 60 min/year | https://docs.fpt.ai/docs/vi/speech/documentation/stt-pricing/ |
| Viettel AI STT | contact-sales | 60 min | https://viettelgroup.ai/en/service/tts |
| Zalo AI | package-only, no public pricing | none | https://github.com/iconclub/zalo-tts/blob/master/README.md |

### Ranking for this MVP
1. **PhoWhisper local** (owned, $0, best VN accuracy, ~1s warm)
2. **Web Speech API in Chrome** (free, streaming, zero infra — fast path / fallback)
3. gpt-4o-mini-transcribe ($0.003/min cloud fallback)
4. Google Cloud STT  5. FPT/Viettel/Zalo (enterprise-shaped, worst fit)

## 2. LLM for the NPC

| Model | $/1M in / out | Source |
|---|---|---|
| Claude Haiku 4.5 | $1 / $5 | https://platform.claude.com/docs/en/about-claude/pricing |
| Claude Sonnet 4.6 | $3 / $15 | https://openrouter.ai/anthropic/claude-sonnet-4.6 |
| GPT-4o-mini | $0.15 / $0.60 | https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini |

- **Structured output:** Claude native Structured Outputs (JSON-schema grammar-constrained, GA for 4.5+ models) → the dialogue+emotion+deltas JSON is guaranteed parseable (https://platform.claude.com/docs/en/build-with-claude/structured-outputs). OpenAI equivalent exists. Reliability no longer a differentiator.
- **Vietnamese fluency:** no public head-to-head; frontier models comparable, VN improving fast (https://intlpull.com/blog/llm-translation-quality-benchmark-2026). Slang-heavy comedic VN is where Sonnet may outperform Haiku — A/B during friend test, don't pre-commit.
- **Cost per 3-min conversation** (10 turns, 15k in / 2k out): Haiku ~$0.025 (→ ~$0.01 with prompt caching at $0.10/M cached reads); Sonnet ~$0.075; GPT-4o-mini ~$0.0035.

## 3. Vietnamese TTS (optional)

| Option | Quality | Price | Notes |
|---|---|---|---|
| **edge-tts (pick)** | Neural, vi-VN HoaiMy (F) + NamMinh (M) | Free, no key | https://github.com/rany2/edge-tts — streams; ToS-grey, fine for friend test. VERIFIED WORKING on this PC 2026-08-05 |
| Google Cloud TTS | WaveNet/Neural2 vi-VN | $4/M chars (4M free/mo) | https://cloud.google.com/text-to-speech — upgrade path |
| FPT.AI TTS | good VN accents | free 100k chars/mo (throttled) | https://docs.fpt.ai/docs/vi/speech/documentation/tts-pricing/ |
| ElevenLabs | best emotion, VN in v3 | free ~10 min/mo | v3 explicitly NOT real-time (https://z.tools/blog/eleven-v3-vs-multilingual-v2-when-each-wins) |

## 4. End-to-end latency budget

- Voice-AI thresholds: <800ms natural, >1500ms broken for phone agents (https://hamming.ai/resources/voice-ai-latency-whats-fast-whats-slow-how-to-fix-it, https://telnyx.com/resources/voice-ai-agents-compared-latency). For a GAME NPC, 1.5-2.5s acceptable if masked with a thinking animation.
- What hits under 2-3s: push-to-talk (kills turn-detection problem), warm PhoWhisper (~1s), streaming LLM tokens + TTS-on-first-sentence (saves 300-600ms), edge-tts chunk streaming.
- Note: strict JSON schema blocks naive streaming — put `dialogue` FIRST in the schema and parse incrementally, or stream dialogue as text + trailing JSON metadata.
- Realistic MVP total: **~2-2.5s** player-stops-talking → NPC reply starts.

## 5. In-character + non-toxic guardrails

- Persona card system prompt + recent history; a well-crafted system prompt on a small model beats a generic prompt on a big one (https://dev.to/maximilian32541spec/how-we-built-dynamic-npc-dialogue-with-llms-lessons-from-early-access-4bfe).
- Schema as guardrail: emotion enum + bounded delta ints → game logic can never be prompt-injected into illegal state; keep `dialogue` free-form or comedy dies (https://arxiv.org/html/2510.25820v1).
- Refusals IN CHARACTER: "if player is offensive/nonsense, NPC gets confused/annoyed, deflects with a joke — never break character, never mention being an AI"; fallback canned line for malformed output (https://arxiv.org/html/2504.13928v1).
- Optional free toxicity net: OpenAI omni-moderation-latest, free, multilingual (https://openai.com/index/upgrading-the-moderation-api-with-our-new-multimodal-moderation-model/) — only needed if strangers play.

## Recommended pipeline + cost

| Component | Pick | Cost |
|---|---|---|
| Mic | Browser push-to-talk (HTTPS) | $0 |
| STT | Local PhoWhisper warm server (Web Speech API fallback) | $0 |
| Brain | Claude Haiku 4.5 + structured outputs + prompt caching (Sonnet A/B) | ~$0.01-0.025 / 3-min convo |
| TTS | edge-tts vi-VN, streamed | $0 |
| Safety | In-character deflection + bounded schema | $0 |
| Hosting | Existing PC + Cloudflare Tunnel (or Worker-only path) | $0 |

**Total: <$0.10 per 10-minute session. Only real engineering risk: STT latency on CPU → PhoWhisper-small + warm server, or Web Speech API path.**
