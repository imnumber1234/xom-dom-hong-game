# Plan v0.4 — Hàng xóm để ý nhau (gossip) + Nhớ QUA ĐÊM

> Session A 2026-08-09. Nguồn: `pending.md` mục "Spec dài ChatGPT 08-09" (Lucas đã chốt
> phương án A — browser giữ nguyên, spec = kho ý tưởng). Phạm vi v0.4 = đúng 2 món đầu
> danh sách ưu tiên: **(1) gossip** + **(2) nhớ qua đêm**. Món 3-5 (nhiệm vụ thật, đồ vật
> bằng chứng, kết truyện) KHÔNG nằm ở đây — vẫn parked trong pending.md.

---

## 0. Ý tưởng lõi — MỘT sổ, hai chiều

Cả 2 tính năng dùng chung một nền: **"Sổ tai tiếng xóm"** (`XDH.run.ledger`) — CODE ghi,
AI chỉ đọc và diễn (đúng triết lý §1b: code cầm điểm, AI chỉ phán xử).

- Mỗi cuộc gõ cửa kết thúc → code ghi 1 dòng: đêm mấy · nhà nào · người chơi XƯNG là gì ·
  chuyện gì xảy ra (bị bắt nói dối / bị đuổi / công an rượt / được mời vào / được giúp).
- **Gossip = sổ chảy NGANG** (đêm nay, nhà khác đọc được chuyện xấu).
- **Nhớ qua đêm = sổ chảy DỌC** (đêm sau, nhà cũ nhớ chuyện của chính họ).
- AI nhận block bối cảnh "[Chuyện xóm nghe kể]" / "[Đêm trước]" — được nhắc cho vui,
  **CẤM dùng để tự chấm điểm** (code cộng nghi ngờ khởi điểm, giống cơ chế
  `startSuspicion` mode Kẹt Tiền đã chạy live).

Nguồn "người chơi xưng là gì": thêm 1 trường `player_claim` vào tool schema NPC_TOOL
(AI đang trả structured output mỗi lượt sẵn rồi — thêm 1 trường gần như miễn phí).
Độ tin cậy của trường này = spike ở Phase 1.

---

## 1. ✅ ANSWERED — Lucas chốt "ok" 2026-08-09: lấy TOÀN BỘ đề xuất A

**Đáp án chốt: Q1=A (chỉ chuyện xấu bị bắt quả tang mới lan) · Q2=A (nhắc miệng + nghi
khởi điểm +10/chuyện, trần +25, số ở config) · Q3=A (nhà cũ nhớ + tin đồn xấu giữ qua đêm)
· Q4=A (được thanh minh) · Q5=A (cả ma sói + Kẹt Tiền chung sổ) · Q6=A (không lưu qua
lần đóng browser).** Terminal B không hỏi lại — bảng dưới giữ làm hồ sơ.

| # | Câu hỏi | Đề xuất (recommended) | Lựa chọn khác |
|---|---|---|---|
| Q1 | Chuyện gì được lan? | **A. Chỉ chuyện XẤU bị bắt quả tang** (nói dối lộ, bị đuổi, công an rượt) — vào nhà êm đẹp thì không ai đồn. Vui hơn + công bằng. 90% | B. Mọi cuộc gõ cửa đều lan. C. Lan xác suất 50%. |
| Q2 | Gossip mạnh cỡ nào? | **A. NPC nhắc miệng + nghi khởi điểm +10 mỗi chuyện xấu, trần +25** (số chỉnh được 1 chỗ trong config). 85% | B. Chỉ nhắc miệng, không cộng số. C. Nặng tay hơn (+15, trần +40). |
| Q3 | Nhớ qua đêm gồm gì? | **A. Cả hai:** nhà cũ nhớ đúng chuyện của họ ("Ủa hôm trước nói học VNUK mà?") + chuyện xấu vẫn đồn qua đêm. 85% | B. Chỉ nhà cũ nhớ, gossip reset mỗi đêm. |
| Q4 | Bị nhớ tội cũ thì sao? | **A. Được thanh minh** — NPC hỏi vặn, trả lời khéo vẫn gỡ được (hài + đúng chất game). 90% | B. Trừ thẳng điểm, không cho thanh minh. |
| Q5 | Áp cho mode nào? | **A. Cả ma sói + Kẹt Tiền chung một sổ** (engine chung, Kẹt Tiền giữ thêm startSuspicion sẵn có). 85% | B. Ma sói trước, Kẹt Tiền v0.5. |
| Q6 | Đóng browser có nhớ không? | **A. Không** — một run = một lần ngồi chơi, 0 công build, đủ cho friend test. 95% | B. Lưu localStorage (thêm ~nửa buổi + lo state cũ lệch version). |

Tất cả long-term ✓ (cùng một sổ, sau này mode nào thêm cũng dùng lại). Tự động hoá: code
tự ghi sổ, không cần ai vận hành.

## 2. Câu hỏi mới nảy ra sau này → ghi vào `pending.md`, KHÔNG hỏi lẻ tẻ.

---

## 3. Tasks (bite-sized — 1 agent 1 task, không mơ hồ)

### Phase 1 — Nền sổ (chưa đổi gameplay)

**T1. Trường `player_claim` trong bộ não server — SPIKE**
- [x] ✅ XONG 2026-08-09 — spike ĐẠT: Haiku 10/10, DeepSeek 8/9 (1 flake mạng → scripted), scripted vá trả rỗng. Không cần fallback tóm tắt cuối cuộc. Files: `converse.js`, `_personas.js` (server only). Ghi chú cho T2: lượt lẻ Haiku có thể trả rỗng (~1-2/6 với câu xưng ngắn) → sổ giữ claim khác-rỗng gần nhất.
- ~~BLOCKED~~ (spike đã chạy thật, số liệu trong report.md)
  - Owner: Backend (Terminal B)
  - Reason: chưa biết Haiku + DeepSeek fallback điền trường mới đều tay không — phải thử thật, không đoán.
  - Spike question: thêm `player_claim` (≤10 từ, "người chơi hiện xưng là gì") vào NPC_TOOL + schema note DeepSeek — chạy 10 lượt hội thoại thật, trường được điền đúng ≥9/10? Nếu <9/10 → fallback: 1 call tóm tắt cuối cuộc (ghi kết quả vào report).
- Verifier: Testing (đếm 10 lượt, bằng chứng log thật)
- Phase 1 · Deps: none
- Allowed context — Files: `game/functions/api/converse.js`, `game/functions/api/_personas.js` · Tools: wrangler dev + curl · Skills: backend
- DoD: trường xuất hiện trong response JSON; tỉ lệ điền ≥9/10 ghi trong report.md; chưa file client nào đổi.

**T2. Sổ tai tiếng client — `XDH.run.ledger`**
- [x] ✅ XONG 2026-08-09 — Playwright smoke não kịch bản: invited/police/left/helped đều ghi entry đúng, 0 lỗi console; đường hết-giờ đi chung phễu `finish()` (kiểm code). Claim thật từ Haiku vào sổ OK ("beauty blogger quay vlog xóm lúc nửa đêm"). File: `convo.js` (duy nhất). Run mới = sổ mới (Q6).
- Owner: Backend (JS client thuần) · Verifier: Testing
- Phase 1 · Deps: T1 (cần biết claim lấy từ đâu)
- Allowed context — Files: `game/public/js/convo.js`, `game/public/js/config.js` · Tools: browser console · Skills: backend
- DoD: kết thúc mọi cuộc gõ cửa (rút lui / bị đuổi / thắng / công an / hết giờ) đều ghi 1 entry {night, houseId, npcId, claim, events[]}; công an rượt ghi event `police`; xem được bằng `XDH.run.ledger` trong console; CHƯA nhà nào đọc sổ (gameplay y nguyên — smoke test 1 ván không lệch bản live).

### Phase 2 — Gossip chảy ngang (đêm nay)

**T3. Nhà khác đọc sổ: block prompt + cộng nghi khởi điểm**
- [x] ✅ XONG 2026-08-09 — (a) request mang gossip lọc đúng Q1 (chỉ contradiction/lo_lieu/kicked/police, nhà khác); (b) nghi khởi điểm +10/chuyện trần +25 tại `XDH.GOSSIP` trong config.js (kiểm sống: 20→30 sau 1 chuyện xấu); (c) block "[Chuyện xóm nghe kể]" chứng minh có trong prompt qua log server (đúng tên NPC + tội + lời xưng); (d) chưa có chuyện xấu → request không có trường gossip. Verdict Haiku 3/3 KHÔNG trừ điểm vì gossip. Files: convo.js, config.js, converse.js.
- Owner: Backend · Verifier: Testing
- Phase 2 · Deps: T2 + Q1 + Q2
- Allowed context — Files: `game/public/js/convo.js`, `game/functions/api/converse.js`, `game/public/js/config.js` · Tools: wrangler dev · Skills: backend
- DoD: gõ nhà B sau khi bị nhà A bắt quả tang → (a) request mang gossip entries lọc theo đáp án Q1; (b) `startState.suspicion` cộng theo đáp án Q2, có trần, số nằm ở config 1 chỗ; (c) prompt có block "[Chuyện xóm nghe kể — chỉ chỉnh giọng, CẤM lấy làm lý do chấm điểm]" (copy đúng khuôn dòng 193 converse.js đã dùng cho Kẹt Tiền); (d) chưa có chuyện xấu → request KHÔNG có block (không tốn token oan).

**T4. NPC mở miệng đồn đúng chỗ**
- [x] ✅ XONG 2026-08-09 — prompt-only thất bại (Haiku 0/10 tự nhắc) → chuyển sang phương án B trong Allowed context: câu chào "nghe đồn" SCRIPTED trong `_personas.js` (CODE cầm việc nhắc). Kết quả: nhắc 10/10 đúng người đúng tội (VN+EN), AI lượt sau 0/5 nhắc lại, 0/15 bịa tội; block prompt thêm luật chống gán-nhầm-tội-cho-người-trước-cửa. Bug E2E "lặp tội 6 lần" đã vá (dedupe events). Files: converse.js, _personas.js.
- Owner: Backend (prompt) · Verifier: Testing
- Phase 2 · Deps: T3
- Allowed context — Files: `game/functions/api/converse.js` (chỉ SYSTEM_TEMPLATE + block gossip), `game/functions/api/_personas.js` (nếu thêm câu chào "nghe đồn") · Skills: backend
- DoD: có chuyện xấu ở nhà A → nhà B nhắc TỐI ĐA 1 lần, đúng nội dung sổ, không bịa thêm tội; chạy 10 ván kịch bản "nói dối lộ ở nhà A rồi sang nhà B": nhắc đúng ≥8/10, bịa tội không có trong sổ ≤1/10 (khớp luật "cấm bịa chứng cứ" đã có).

### Phase 3 — Nhớ chảy dọc (qua đêm)

**T5. Qua đêm KHÔNG xoá sạch — nén thành trí nhớ**
- [x] ✅ XONG 2026-08-09 — `compressNightMemory()` trong convo.js, gọi từ `newNight` (ui.js) + `startDay` (mode-ket-tien.js, chỉ dayNo>1). Kiểm sống: qua đêm 2 → saved xoá sạch, ledger giữ nguyên, nhà đã ghé có 1-3 dòng tóm tắt code-built ("Đêm 1: họ từng bị mình bắt nói dối lộ liễu, và mình đã gọi công an…"), nhà chưa ghé = null, ngày sạch không đổi gì, 0 lỗi console.
- Owner: Backend · Verifier: Testing
- Phase 3 · Deps: T2 + Q3 + Q6
- Allowed context — Files: `game/public/js/ui.js` (newNight dòng 26-30), `game/public/js/mode-ket-tien.js` (startDay dòng 25), `game/public/js/convo.js` · Skills: backend
- DoD: qua đêm mới: `h.saved` vẫn xoá (hội thoại tươi) NHƯNG ledger giữ + mỗi nhà đã ghé sinh 2-3 dòng tóm tắt code-built từ claim + events (không gọi AI); Kẹt Tiền `startDay` đồng bộ cùng cách; đêm 1 chưa ghé nhà nào → không có gì thay đổi.

**T6. Câu chào đêm sau có callback + được thanh minh**
- [x] ✅ XONG 2026-08-09 — QUYẾT ĐỊNH (Terminal B, theo chi phí): greet giữ SCRIPTED + bộ `memory_greets` riêng (VN+EN, {PAST} server điền) — lý do: 0 đồng, DoD đòi 10/10 mà AI-greet không cam kết nổi (bài học T4), khớp khuôn returns/gossip_greets. Kết quả: callback đêm-mới 10/10 nhắc đúng lời xưng cũ; ưu tiên chào đúng (cùng-đêm > nhớ-đêm-trước > nghe-đồn); tội cũ → nghi +10 (20→30), thắng cũ → tin +10 (30→40), số ở `XDH.MEMORY` config.js (config.js không nằm trong Allowed-context T6 nhưng DoD bắt "số ở config" — DoD thắng); thanh minh: 3/5 chấm tốt ngay + 2/5 hỏi vặn đúng luật rồi gỡ; block [Đêm trước] cấm lấy chuyện cũ trừ điểm. Files: convo.js, converse.js, _personas.js, config.js (1 hằng).
- Owner: Backend (prompt + client) · Verifier: Testing
- Phase 3 · Deps: T5 + Q4
- Allowed context — Files: `game/public/js/convo.js`, `game/functions/api/converse.js`, `game/functions/api/_personas.js` · Skills: backend
- DoD: đêm N+1 gõ nhà đã ghé đêm N → lượt chào đầu nhắc đúng chuyện cũ kiểu "Ủa? Hôm trước nói học VNUK mà?" 10/10 lần (block [Đêm trước] đi kèm greet — chú ý: greet hiện là scripted miễn phí, task này phải quyết giữ scripted + câu returns riêng HAY cho greet đi qua AI khi có trí nhớ — chọn theo chi phí, ghi lại lý do); theo Q4: người chơi trả lời khéo thì gỡ được (code không trừ thẳng khi verdict tốt); trạng thái khởi điểm chỉnh theo sổ (thắng đêm trước → tin +X, tội cũ → nghi +X, số ở config).

**T7. Sửa lời — không còn "hàng xóm không nhớ gì đâu"**
- [x] ✅ XONG 2026-08-09 — màn "Đêm trọn vẹn" (ui.js) đổi thành cảnh báo "xóm NHỚ đó nha" + thêm bản EN song ngữ (trước đó màn này chỉ có VN); grep toàn bộ ui.js + mode-ket-tien.js: 0 chuỗi người-chơi-thấy còn nói "quên hết/không nhớ" (KT vốn không có); VI đủ dấu (hook check-vietnamese-dau pass). Files: ui.js.
- Owner: Frontend · Verifier: Testing
- Phase 3 · Deps: T5
- Allowed context — Files: `game/public/js/ui.js` (dòng 215-218 + màn điểm), `game/public/js/mode-ket-tien.js` (thông báo ngày mới) · Skills: frontend
- DoD: mọi chuỗi VI/EN nhắc "quên hết/không nhớ" đổi thành cảnh báo "xóm NHỚ đó nha"; VI đủ dấu (hook check-vietnamese-dau); song ngữ đủ cả 2 bản.

### Phase 4 — Kiểm

**T8. Ma trận QA + pass number**
- [x] ✅ XONG 2026-08-09 — chạy MAIN-THREAD (bài học tester bịa output), 6/6 ĐẠT:
  1. Gossip nhắc đúng: **10/10** (chào nghe-đồn scripted, Haiku thật).
  2. Bịa tội: **0/10** (+0/15 mẫu T4).
  3. Callback đêm sau: **10/10** (chào nhớ-mặt scripted).
  4. AI tự trừ điểm vì gossip: **0/10** sau khi siết block thành 4 luật đánh số (vòng đầu dính 1/10 + 2 ca nhắc lại → vá prompt, đo lại sạch; 1 ca kha_nghi còn lại là hỏi vặn logic xe buýt — nề nếp cũ, không dính tin đồn).
  5. Ván sạch: 4 đường kết thúc + KT helped chạy chuẩn, request không mang gossip/nightMemory, **0 lỗi console**.
  6. Kẹt Tiền 1 ngày đủ vòng: 2 nhà → 65k+10k → bảng tổng kết → ngày 2 (tiền reset, sổ GIỮ, trí nhớ nén), **0 lỗi**.
- Owner: Testing · Verifier: Testing (em-testing, bằng chứng thật — nhớ bài học tester bịa output: chạy main-thread nếu subagent trả tool_uses=0)
- Phase 4 · Deps: T3-T7
- Allowed context — Files: cả `game/` (đọc), `report.md` (ghi) · Tools: browser + wrangler dev · Skills: testing
- DoD — pass number CHỐT TRƯỚC khi test (luật lean-startup):
  1. Gossip nhắc đúng ≥8/10 ván kịch bản (từ T4).
  2. AI bịa tội không có trong sổ ≤1/10.
  3. Callback đêm sau nổ 10/10 ở nhà đã ghé.
  4. 0 ca điểm bị AI tự trừ vì gossip (code cầm số — soi verdict log).
  5. Ván sạch (không chuyện xấu, không ghé lại) chơi y hệt bản live (0 khác biệt console + gameplay).
  6. Kẹt Tiền smoke 1 ngày đủ vòng không lỗi.
  - Kết quả ghi report.md; fail mục nào → dừng, không deploy.

---

## 4. Unknowns — phân loại đủ (không giấu)

| Unknown | Loại | Ghi chú |
|---|---|---|
| Haiku/DeepSeek điền `player_claim` đều không | BLOCKED spike (T1) | Có fallback tóm tắt cuối cuộc |
| Gossip lan khi nào / mạnh cỡ nào / phạm vi nhớ / thanh minh / mode / lưu máy | Pending Decision Q1-Q6 | 1 batch ở mục 1 |
| Prompt phình → thoại nhạt đi | Explicit Risk · Impact: medium · Review: T8 (so 5 ván trước/sau) | Block gossip chỉ đính khi có chuyện xấu (T3d) đỡ phần lớn |
| Token/tiền tăng | Explicit Risk · Impact: low · Review: T8 | +1 trường + 1 block ngắn; vẫn xa trần $5 |
| Đêm sau khó lên vì nhớ tội (chồng với đêm N cần N nhà) | Explicit Risk · Impact: medium · Review: playtest Lucas sau deploy preview | Số cộng nghi nằm config 1 chỗ, chỉnh 1 dòng |
| Greet scripted vs AI khi có trí nhớ (chi phí) | Nằm trong T6 DoD — Terminal B quyết theo chi phí, ghi lý do | Không phải product call: không đổi luật chơi, chỉ đổi đường ống |

---

## 5. Completion checklist (trạng thái 2026-08-09)

- [x] Mọi task có Owner + Verifier + Phase + Deps + Allowed context + DoD
- [x] Mọi unknown đã phân loại (1 BLOCKED spike · 6 Pending Decision · 4 Explicit Risk)
- [x] Không còn giả định ngầm (claim-extraction = spike, không đoán)
- [x] **Pending Decisions = 0** — Lucas chốt cả 6 đề xuất A ("ok", 2026-08-09)
- [x] Prompt Terminal B đã soạn sẵn (mục 6) — KÍCH HOẠT

**Trạng thái: 🟢 READY — hand-off Terminal B. Confidence plan: 92%** (chỉ còn spike T1 là ẩn số cố ý, có fallback sẵn — đúng loại BLOCKED được phép khi bàn giao).

---

## 6. Execution Loop Prompt — Terminal B (dán khi Lucas đã trả lời Q1-Q6)

/execute-loop Xóm Đóm Hòng v0.4 — gossip + nhớ qua đêm. Đọc `GitHub/Xom Nay Kho Lam/plan-v0.4-gossip.md`. Điền đáp án Q1-Q6 của Lucas vào mục 1 trước khi làm gì khác. Mỗi vòng lặp: chọn ĐÚNG 1 task chưa xong có deps đã xong (thứ tự T1→T8) → làm → tự kiểm theo DoD của task → tick checklist trong plan → dừng vòng. T1 là spike: chạy thử thật, ghi số liệu vào report.md rồi mới qua T2. Deploy chỉ lên PREVIEW (nhánh riêng Pages), KHÔNG đụng link chính xom-dom-hong.pages.dev — Lucas duyệt preview rồi mới promote. Không hỏi giữa chừng: câu hỏi mới → ghi `pending.md`. Xong T8 đạt đủ 6 pass number → báo cáo report.md + dừng chờ Lucas chơi thử.
