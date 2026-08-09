# Plan v0.5 — LY CÓ HỒN (deep NPC: tính cách · mục tiêu riêng · 3 bí mật)

> Session A 2026-08-09. Nguồn: spec dài của Lucas ("CLAUDE CODE — V0.5 GAMEPLAY UPDATE / LY THE
> TIKTOKER") + code đang LIVE (`_personas.js`, `converse.js`, `convo.js`, `config.js`) +
> `plan-v0.4-gossip.md` (đang thi công dở).
> Nguyên tắc bất di bất dịch: **KHÔNG viết engine mới. CODE cầm mọi trạng thái, AI chỉ phán xử.**
> Chỉ làm Ly. Tí và Cô Sáu giữ NGUYÊN 100% — nhưng khung phải tái dùng được cho họ ở v0.6.

---

## 0. QUYẾT ĐỊNH PHẠM VI #1 — v0.4 phải xong TRƯỚC (đây là phụ thuộc thật, không phải thủ tục)

`plan-v0.4-gossip.md` mới xong T1 (trường `player_claim` đã lên server, spike đạt 10/10).
**T2-T8 chưa làm.** Ba lý do bắt buộc phải đóng v0.4 trước khi mở v0.5:

1. **Đụng đúng một bộ file.** v0.4 T2/T3/T5/T6 sửa `convo.js` · `converse.js` · `config.js` ·
   `ui.js`. v0.5 sửa y hệt bộ đó. Hai hệ nửa vời trong cùng file = rối, khó truy lỗi.
2. **Sổ tai tiếng CHÍNH LÀ nền trí nhớ v0.5 cần.** Spec §30-32 (hậu quả + trí nhớ dài hạn của Ly)
   đòi đúng cái `XDH.run.ledger` mà v0.4 T2 đang dựng. Bỏ qua v0.4 = xây trí nhớ hai lần.
3. **Bí mật của Ly cần nhiều đêm.** Bí mật 4 nấc không thể khám phá hết trong một cuộc nói chuyện
   (xem §0b). Nó cần "nhớ qua đêm" = v0.4 T5/T6.

**→ Kết luận: MỘT vòng lặp, hai chặng. Chặng A = đóng nốt v0.4 (T2→T8). Chặng B = v0.5 Ly.**
Lucas duyệt một lần ở đầu, không phải duyệt hai lần.

## 0b. QUYẾT ĐỊNH PHẠM VI #2 — mâu thuẫn thiết kế phải giải trước khi code

**Ly đang là nhà DỄ NHẤT: ngưỡng 65, gain ×1.2 → thắng trong ~4 lượt.**
Nhưng spec muốn Ly có 3 bí mật, 4 nấc khám phá, mục tiêu riêng, hỏi vặn qua lại.
**Bốn lượt là không đủ chỗ để bất cứ thứ nào trong đó kịp hiện ra.** Cửa mở xong là hết cuộc
(ma sói → cảnh CẮN; Kẹt Tiền → màn xin). Xây chiều sâu rồi người chơi thắng trước khi thấy nó
= tiền vứt đi.

### ⚠️ CẬP NHẬT 2026-08-09 14:12 — Lucas đã đi NGƯỢC hướng này, phải sửa đề xuất

Trong lúc bản kế hoạch này đang viết, Lucas duyệt v0.4 lên link chính **và yêu cầu NỚI CỬA nhà Ly:
ngưỡng 65 → 55, gain ×1.2 → ×1.3** (Kẹt Tiền của Ly xuống 40). Đã áp dụng, đang LIVE.
Ý ông rõ ràng: **nhà đầu tiên phải dễ vào, người mới không được nản.**

→ Phương án A cũ (nâng lên 75) **BỊ HUỶ** — nó sẽ âm thầm đạp đổ quyết định mới hơn của Lucas.
→ **Đề xuất mới = D.** Giữ nguyên cửa dễ như Lucas vừa chỉnh; bí mật đổi từ "đi nhanh hơn"
thành "**thắng ĐẬM hơn**".

| Phương án | Nghĩa là gì | Được | Mất | Đề xuất |
|---|---|---|---|---|
| **D — Bí mật làm PHẦN THƯỞNG to hơn (đề xuất mới)** | Cửa giữ ngưỡng 55 y như Lucas vừa chốt. Chạm được nấc bí mật KHÔNG mở cửa nhanh hơn — nó nâng CHẤT lượng cái thắng: Kẹt Tiền cho tiền đậm hơn / dễ ra `moi_com` hơn; ma sói loot xịn hơn + Ly nhớ bạn thân thiện qua đêm | Không đụng gì tới quyết định 14:12 của Lucas. Người mới vẫn vào được nhà Ly trong 3 lượt. Người tinh ý có lý do NÓI TIẾP thay vì thắng xong đi — đúng thước đo "muốn thử lại kiểu khác" | Ở ma sói, cửa mở là hết cuộc → bí mật phải kịp xảy ra TRƯỚC cửa; nên phần thưởng bí mật ở ma sói nhẹ hơn Kẹt Tiền | ✅ 88% · dài hạn ✓ |
| ~~A — nâng ngưỡng 65→75~~ | ~~bí mật là đường tắt~~ | — | **Trái lệnh mới nhất của Lucas** | ❌ HUỶ |
| B — giữ nguyên, không thưởng gì | Không đụng cân bằng | An toàn | Bí mật gần như không ai thấy → phí cả v0.5 | 40% |
| C — Tách cửa mở khỏi kết cuộc | Cửa mở rồi vẫn nói tiếp được | Nhiều đất diễn nhất | Phải sửa cả cảnh CẮN lẫn màn xin ở CẢ 2 chế độ — đắt, dễ vỡ | 55% · rủi ro cao |

**Đề xuất D.** Câu hỏi spec muốn người chơi tự hỏi ("Cô ấy đang giấu gì?") vẫn thành cách chơi
tối ưu — chỉ khác là nó trả bằng PHẦN THƯỞNG chứ không phải bằng TỐC ĐỘ.

---

## 1. Lọc spec — cái gì ĐÃ CÓ, đừng xây lại

| Mục spec | Trạng thái thật trong code |
|---|---|
| §19 quần áo phải khớp lời nói | ✅ LIVE — `{OUTFIT}` vào prompt, cờ `contradiction`, luật 15 "hỏi thẳng về bộ đồ kỳ lạ" |
| §17 hỏi vặn nối tiếp | ✅ LIVE — luật 10 (hỏi vặn đòi chi tiết cụ thể) |
| §18 thử thách lời khai | ✅ LIVE — `final_test` (hiện chỉ bật ở nhà Cô Sáu) |
| §23 không hiện con số | ✅ LIVE — đây là quyết định gốc của game |
| §24 chấm hội thoại | ✅ LIVE — enum 5 verdict, code tính điểm |
| §33-36 AI không điều khiển game | ✅ LIVE — chính là kiến trúc §1b, tool call bắt buộc + `shapeReply` lọc |
| §30-32 hậu quả + trí nhớ | 🟡 = ĐANG LÀM ở v0.4 (chặng A) |
| §16 Ly tự khơi chuyện | 🟡 MỘT NỬA — luật 13 "hé lộ điểm yếu", chưa có mục tiêu riêng |
| §21 12 cảm xúc | 🟡 chỉ có 5 chân dung vẽ sẵn — xem L9 |
| §42 giọng nói TTS | ❌ Lucas đã BÁC ở v0.1. Bỏ qua, không bàn lại |
| §12 nhiệm vụ thật (tìm ring light…) | ❌ CHƯA CÓ hệ nhiệm vụ nào. Đây là ưu tiên #3 trong `pending.md`, là một hệ con nguyên vẹn → **HOÃN sang v0.6.** v0.5 thay bằng "lời nhờ vả trong cuộc" (L7), giải quyết xong ngay trong hội thoại |

**Cái MỚI thật của v0.5 = 6 món:** hồ sơ tính cách có số · mục tiêu riêng của Ly · 3 bí mật 4 nấc ·
chống lặp câu thần chú · thang chấm riêng cho Ly · cảm xúc nhiều sắc hơn.

---

## 2. Ba bí mật của Ly — chốt sẵn, bám đúng thẻ nhân vật đang chạy

Thẻ hiện tại: *Ly, 19 tuổi, TikTok 500k follow, tự nhận "sắp nổi", quay/edit lúc nửa đêm,
uống trà sữa thay nước lọc, chán rất nhanh, mê drama, không quan tâm logic — quan tâm VUI.*

| Mã | Loại | Nội dung | Dùng làm gì trong game |
|---|---|---|---|
| **S1 — `follow_ao`** | Điểm yếu (spec §7-A) | 500k follow có mua; tương tác thật đang tụt thảm. Ly sợ nhất chuyện này lộ | Chạm đúng = Ly xù lông rồi mềm ra. Nhạy cảm 0.9 — hỏi thô là NGHI, hỏi khéo là THÂN |
| **S2 — `den_hong`** | Rắc rối đời thường (§7-B) | Đèn ring light hỏng/bị mẹ tịch thu, mà đang kẹt deadline nhãn hàng | Móc để giúp. v0.5 giải quyết TRONG hội thoại (giữ đèn xe, cho mượn điện thoại rọi); v0.6 mới thành nhiệm vụ thật |
| **S3 — `bo_hoc`** | Sợ mất mặt (§7-C) | Đã bỏ học, nói với ba mẹ dưới quê là "gap year tập trung làm content" | Rất Việt Nam. Biết chuyện này = hiểu vì sao Ly phải nổi bằng mọi giá → mở lối thuyết phục mạnh nhất |

Bốn nấc mỗi bí mật: `unknown → hint → partial → known` (spec §10). Ví dụ S1:
· hint: "Dạo này thuật toán bóp em quá trời." · partial: "Mấy clip mới có 300 view à, xỉu."
· known: Ly thừa nhận số follow không thật.

**Không có màn hình nào báo "ĐÃ KHÁM PHÁ BÍ MẬT".** Người chơi chỉ nghe Ly nói khác đi.

---

## 3. Kiến trúc — 4 hộp

- **Dữ liệu:** `LY_DEEP` (server, cạnh `PERSONAS`) = vector tính cách + mục tiêu + 3 bí mật kèm
  chủ đề kích hoạt và ngưỡng tin từng nấc. **Trạng thái chạy** nằm ở client trong
  `XDH.run.npcDeep.gen_z` = { secrets: {S1:'hint',…}, relationship, agendaCooldown, saidLines[] }.
  Qua đêm thì gộp vào ledger v0.4 (không xoá).
- **Màn hình:** KHÔNG thêm màn nào. Chỉ mở rộng bảng `?debug=1`.
- **Luật (CODE cầm, tuyệt đối không để AI):** nấc bí mật chỉ tiến khi *(chủ đề khớp) VÀ
  (tin ≥ ngưỡng nấc đó) VÀ (chưa tiến nấc trong N lượt)*. Thưởng tin khi tiến nấc. Chống lặp câu.
  Ngưỡng cửa. Mọi con số nằm ở `config.js`.
- **Kết nối:** thêm 3 trường vào tool `npc_reply` — chỉ gửi khi `npcId === 'gen_z'`.
  Không đổi một chữ nào trong đường đi của Tí và Cô Sáu.

**Luồng bắt buộc:** lời người chơi → AI đọc hiểu → `secret_signal` (AI chỉ nói "câu này đang
chạm bí mật nào") → **code kiểm tra điều kiện** → code tiến nấc + cộng điểm → lượt sau prompt
mới cho Ly biết cô được phép hé tới đâu. AI **không bao giờ** tự tiến nấc.

---

## 4. Câu hỏi cho Lucas — MỘT LẦN. Không trả lời = áp dụng đề xuất (như v0.3)

| # | Câu hỏi | Đề xuất (recommended) | Khác |
|---|---|---|---|
| Q1 | Bí mật ăn nhập vào cân bằng kiểu gì? | **D. GIỮ cửa dễ 55 như Lucas vừa chỉnh 14:12; bí mật làm phần thưởng ĐẬM hơn, không làm cửa nhanh hơn** (§0b bản cập nhật). 88% · dài hạn ✓ | ~~A. nâng lên 75~~ đã HUỶ vì trái lệnh mới · B. không thưởng gì · C. tách cửa khỏi kết cuộc |
| Q2 | Ba bí mật ở §2 có ổn không? | **A. Lấy nguyên ba** — follow ảo · đèn hỏng · giấu chuyện bỏ học. Đều hài mà không ác, rất Việt Nam. 85% | Đổi bí mật nào thì ghi vào đây |
| Q3 | Cho người chơi DÙNG bí mật để ép Ly? (spec §13) | **A. Cho, nhưng có giá** — doạ tống tiền thì tin tụt mạnh + Ly ghi thù qua đêm; nói khéo kiểu đồng cảm thì được lợi. Giữ hài, không dạy trò xấu. 85% | B. cấm hẳn, chỉ được giúp |
| Q4 | Nhiệm vụ thật (tìm ring light trên bản đồ)? | **A. HOÃN sang v0.6** — v0.5 chỉ "nhờ vả trong cuộc". Lý do: hệ nhiệm vụ là một hệ con nguyên vẹn, nhét vào đây làm v0.5 phình gấp đôi. 90% | B. làm luôn (+~1 phiên) |
| Q5 | Ly có được áp cho CẢ 2 chế độ? | **A. Cả hai** — ma sói và Kẹt Tiền dùng chung Ly sâu; ở Kẹt Tiền bí mật S2 tự nhiên hơn (ban ngày). 85% | B. chỉ ma sói trước |
| Q6 | 12 cảm xúc như spec? | **A. AI chọn trong 10 nhãn, code gộp về 5 chân dung sẵn có + độ mạnh nhẹ** — 0 đồng tiền vẽ, vẫn tinh tế hơn hẳn. 90% | B. vẽ thêm 7 chân dung (đắt, chặn tiến độ) |

---

## 5. Tasks — Chặng A rồi Chặng B, mỗi task một agent

### ✅ CHẶNG A — XONG 2026-08-09 14:12, KHÔNG PHẢI LÀM LẠI
`plan-v0.4-gossip.md` T1→T8 đã đủ, QA 6/6 pass number, đã promote lên link chính
https://xom-dom-hong.pages.dev. Terminal B **bắt đầu thẳng từ L1**.

### CHẶNG B — v0.5 Ly

**L1. Hồ sơ sâu của Ly (chỉ dữ liệu, chưa nối dây)**
- Owner: Backend · Verifier: Testing · Phase B1 · Deps: A1
- Files: `game/functions/api/_personas.js` (thêm export `LY_DEEP`), `game/public/js/config.js` (số)
- DoD: có vector tính cách 12 chiều (0-1), mục tiêu hiện tại, 3 bí mật §2 — mỗi bí mật có
  `id · loại · nhạy cảm · chủ đề kích hoạt (từ khoá + mô tả) · ngưỡng tin từng nấc · lời Ly được
  nói ở từng nấc (VN + EN, đủ dấu)`. Game chạy y nguyên, 0 khác biệt console.

**L2. Trạng thái chạy phía client — CODE cầm**
- Owner: Backend · Verifier: Testing · Phase B1 · Deps: L1
- Files: `game/public/js/convo.js`, `game/public/js/config.js`
- DoD: `XDH.run.npcDeep.gen_z` khởi tạo khi bắt đầu cuộc với Ly; giữ qua đêm bằng ledger v0.4;
  xem được trong console; chưa ảnh hưởng gameplay.

**L3. Ba trường mới trong schema — SPIKE (đo thật, không đoán)**
- Owner: Backend · Verifier: Testing · Phase B1 · Deps: L1
- Files: `game/functions/api/converse.js` (`NPC_TOOL` + `REPLY_SCHEMA_NOTE` + `shapeReply`), `_personas.js`
- Spike: thêm `secret_signal` (id bí mật câu vừa rồi đang chạm, hoặc rỗng) · `probe_quality`
  (`tho_lo | vong_vo | kheo`) · `emotion_intensity` (`nhe | manh`). Chạy 10 lượt thật qua
  wrangler dev. **Đạt = ≥8/10 gắn đúng bí mật, ≤1/10 gắn bừa khi người chơi nói chuyện không liên quan.**
- DoD: số liệu thật ghi `report.md`; nếu <8/10 → phương án dự phòng: code tự dò từ khoá chủ đề
  (kém tinh tế hơn nhưng chắc chắn), ghi rõ đã chọn đường nào và vì sao. Ba trường CHỈ gửi khi
  `npcId === 'gen_z'` — Tí và Cô Sáu không đổi một byte nào trong request.

**L4. Cổng khám phá bí mật — code quyết, AI không**
- Owner: Backend · Verifier: Testing · Phase B2 · Deps: L2 + L3 + Q1
- Files: `game/public/js/convo.js`, `game/public/js/config.js`
- DoD: nấc chỉ tiến khi đủ CẢ BA: chủ đề khớp · tin ≥ ngưỡng nấc · đã qua ≥2 lượt kể từ lần
  tiến trước. `probe_quality = tho_lo` (hỏi thô, xoáy vào chỗ đau) → KHÔNG tiến nấc và +nghi.
  Tiến một nấc → code thưởng tin (theo Q1: ngang `danh_trung` ×2, số ở config).
  **Bằng chứng bắt buộc:** log 20 lượt cho thấy 0 ca AI tự tiến nấc.

**L5. Prompt riêng cho Ly — chỉ đính khi cần**
- Owner: Backend · Verifier: Testing · Phase B2 · Deps: L4
- Files: `game/functions/api/converse.js`, `game/functions/api/_personas.js`
- DoD: khối `[Ly — chuyện riêng]` chỉ gắn khi `npcId === 'gen_z'`, nêu mục tiêu hiện tại + nấc
  hiện tại của 3 bí mật + Ly ĐƯỢC PHÉP nói tới đâu ở nấc đó + **CẤM hé quá nấc, CẤM tự bịa bí mật mới**.
  Bí mật còn `unknown` thì chỉ gửi một dòng gợi mở, không gửi nội dung bí mật (chống lộ + tiết token).
  **Trần token: tổng input mỗi lượt ≤4.500** (nền hiện tại 600-3.500) — đo và ghi vào report.

**L6. Chống câu thần chú (spec §26) — code, không phải prompt**
- Owner: Backend · Verifier: Testing · Phase B2 · Deps: L2
- Files: `game/public/js/convo.js`, `game/public/js/config.js`
- DoD: chuẩn hoá câu người chơi (bỏ dấu câu, thường hoá); trùng ≥80% với câu từng ăn
  `danh_trung`/`hop_ly` trong cùng đêm → code hạ verdict xuống một bậc + gắn chỉ dẫn để Ly nói
  kiểu "rồi rồi, ai cũng nói câu đó". Áp cho Ly trước. Test: nói đúng một câu thắng 3 lần liên
  tiếp → lần 2 và 3 KHÔNG được ăn `danh_trung`.

**L7. Ly có việc riêng + biết nhờ vả (spec §11, §15, §16)**
- Owner: Backend · Verifier: Testing · Phase B2 · Deps: L5
- Files: `game/functions/api/converse.js`, `game/functions/api/_personas.js`, `game/public/js/convo.js`
- DoD: Ly có `current_goal` (vd "cần người cầm đèn / chọn giúp bản nào lên hình đẹp hơn").
  Cứ ≥3 lượt cô được CHỦ ĐỘNG một lần: hoặc nhờ vả, hoặc bận ("khoan để chị đăng cái này đã"),
  hoặc hỏi ngược người chơi. Code giữ đồng hồ chờ — **cấm nổ mỗi lượt** (sẽ phiền). Người chơi
  đồng ý giúp → giải quyết TRONG hội thoại + code cộng quan hệ. **Không tạo nhiệm vụ trên bản đồ** (Q4).

**L8. Thang chấm riêng của Ly (spec §25)**
- Owner: Backend · Verifier: Testing · Phase B2 · Deps: L5
- Files: `game/functions/api/_personas.js` (thẻ Ly), `game/public/js/config.js`
- DoD: thẻ Ly nêu rõ cô coi trọng gì (vui · tự tin · tinh ý · biết trend · khen đúng chỗ) và ghét
  gì (nhạt · lặp · dạy đời · xin xỏ tội nghiệp · phớt lờ chuyện cô đang mê). **Không đụng
  `SYSTEM_TEMPLATE` dùng chung** — mọi thứ riêng của Ly nằm trong thẻ của Ly. Bằng chứng: 5 lượt
  y hệt nhau chấm ở Tí và Cô Sáu cho kết quả không đổi so với bản live.

**L9. Cảm xúc nhiều sắc hơn, 0 đồng tiền vẽ (Q6)**
- Owner: Frontend · Verifier: Testing · Phase B3 · Deps: L3
- Files: `game/public/js/portraits.js`, `game/public/js/ui.js`, `game/public/js/config.js`
- DoD: AI được chọn trong 10 nhãn (thêm curious · excited · embarrassed · sympathetic · skeptical),
  code gộp về 5 chân dung sẵn có + `emotion_intensity` đổi biên độ hiệu ứng (rung mạnh/nhẹ,
  nghiêng nhiều/ít, tốc độ chữ). Nhãn lạ → rơi về `neutral`, không vỡ. Vẫn 0 con số hiện ra.

**L10. Bảng gỡ lỗi mở rộng (spec §40)**
- Owner: Frontend · Verifier: Testing · Phase B3 · Deps: L4 + L7
- Files: `game/public/js/ui.js`
- DoD: `?debug=1` khi nói chuyện với Ly hiện thêm: vector tính cách · mục tiêu + đồng hồ chờ ·
  nấc 3 bí mật · `secret_signal` + `probe_quality` từng lượt · lý do code CHO/KHÔNG cho tiến nấc ·
  quan hệ · số câu bị bắt trùng. **Không debug thì không thấy gì thay đổi trên màn hình.**

**L11. Ma trận QA + chốt pass number**
- Owner: Testing · Verifier: Testing (chạy main-thread — nhớ bài học subagent bịa output) · Phase B4 · Deps: L4-L10
- Files: đọc cả `game/`, ghi `report.md`
- DoD: đúng 10 kịch bản spec §39 + 7 pass number ở §6 dưới. Fail mục nào → dừng, KHÔNG deploy.

---

## 6. Pass number — CHỐT TRƯỚC KHI TEST (luật lean-startup)

| # | Đo cái gì | Đạt là |
|---|---|---|
| 1 | Ly chủ động (nhờ vả / bận / hỏi ngược) | ≥1 lần mỗi cuộc, ở ≥8/10 ván |
| 2 | Bí mật lên được nấc `hint` khi người chơi hỏi đúng hướng | ≥7/10 ván |
| 3 | Bí mật KHÔNG BAO GIỜ lên nấc khi chưa đủ tin | 0/20 lượt vi phạm |
| 4 | AI tự tiến nấc bí mật | 0 ca (soi log) |
| 5 | Lặp lại câu thắng | Lần 2 trở đi không còn ăn `danh_trung`, 0/10 vi phạm |
| 6 | Không phá Tí và Cô Sáu | 5 lượt mỗi nhà, phân bố verdict không lệch bản live; Kẹt Tiền chạy trọn 1 ngày 0 lỗi |
| 7 | Tiền | Input ≤4.500 token/lượt; ước tính vẫn dưới trần $5 của friend test |

**Thước đo THẬT (người, không phải máy) — sau khi Lucas chơi:** chơi Ly hai lần rồi tự nói
*"lần sau tôi sẽ thử cách khác"*. Không đạt câu đó thì v0.5 coi như chưa xong, dù 7 số trên đều xanh.

---

## 7. Rủi ro nêu thẳng

| Rủi ro | Mức | Chặn bằng |
|---|---|---|
| **Prompt phình → thoại nhạt đi** (rủi ro này đã có tên từ v0.4) | CAO | L5 chỉ đính khối khi cần + trần 4.500 token + so 5 ván trước/sau ở L11 |
| Ly thành "máy phát bí mật", 3 phút biết hết | Vừa | L4 khoá 3 điều kiện + giãn ≥2 lượt/nấc + hỏi thô là bị phạt |
| Sửa Ly làm lệch máy chấm của Tí/Cô Sáu | Vừa | Mọi thứ riêng của Ly nằm TRONG thẻ Ly; cấm đụng `SYSTEM_TEMPLATE`; pass number #6 canh |
| Haiku không gắn đúng `secret_signal` | Vừa | L3 là spike, có sẵn phương án dò từ khoá bằng code |
| Ly hết dễ → người mới nản (Q1) | Vừa | Chỉ chỉnh một số trong config, lùi lại trong 1 phút nếu playtest chê |
| Chặng A nuốt hết thời gian, chặng B lại dở dang | Vừa | Chặng A có DoD riêng (6 pass number của v0.4 T8); dở dang thì báo cáo và DỪNG, không lấn |

---

## 8. Checklist bàn giao

- [x] Mọi task có Owner · Verifier · Phase · Deps · Allowed context · DoD
- [x] Ẩn số đã phân loại: 1 SPIKE (L3) · 6 Pending Decision (Q1-Q6, có đề xuất, im lặng = áp dụng) · 6 Rủi ro nêu tên
- [x] Không giả định ngầm — `secret_signal` đo thật, không đoán
- [x] Phụ thuộc v0.4 nêu rõ và xếp thành Chặng A
- [x] Mâu thuẫn thiết kế (Ly thắng quá nhanh) đã giải ở §0b, không giấu

**Trạng thái: 🟢 SẴN SÀNG bàn giao Terminal B. Confidence: 91%.**
(9% còn lại: spike L3 và việc Chặng A dài bao lâu — cả hai đều có đường lùi viết sẵn.)

---

## 9. Execution Loop Prompt — Terminal B

/execute-loop Xóm Đóm Hòng v0.5 — LY CÓ HỒN. Đọc `GitHub/Xom Nay Kho Lam/plan-v0.5-ly.md` TRƯỚC. Chặng A (v0.4) ĐÃ XONG + đã lên link chính — KHÔNG làm lại, bắt đầu thẳng từ L1 → L11. Lucas im lặng về Q1-Q6 thì ÁP DỤNG đề xuất của cả sáu (Q1 = phương án **D**: GIỮ ngưỡng cửa 55 Lucas vừa chỉnh, bí mật làm phần thưởng đậm hơn chứ KHÔNG làm cửa mở nhanh hơn — tuyệt đối không tự nâng ngưỡng Ly lên), ghi lại vào mục 4 rồi làm tiếp — không chờ. Mỗi vòng lặp: chọn ĐÚNG 1 task chưa xong có deps đã xong → làm → tự kiểm theo DoD → tick vào plan → dừng vòng. L3 là spike: chạy 10 lượt API THẬT qua wrangler dev, ghi số liệu vào report.md rồi mới đi tiếp; <8/10 thì rẽ sang phương án dò từ khoá và ghi rõ lý do. Luật bất di bất dịch: CODE cầm mọi trạng thái, AI chỉ phán xử — 0 ca AI tự tiến nấc bí mật. Tuyệt đối KHÔNG đụng `SYSTEM_TEMPLATE` dùng chung; mọi thứ riêng của Ly nằm trong thẻ Ly. Tí và Cô Sáu phải chạy y hệt bản live (pass number #6). Deploy CHỈ lên nhánh preview riêng, KHÔNG đụng xom-dom-hong.pages.dev. Tự duyệt mọi bước lùi được; việc không lùi được (đẩy link chính, gửi bạn bè, tiêu tiền ngoài $5) → ghi `pending.md`, bỏ qua, chạy tiếp. Câu hỏi mới → ghi `pending.md`, KHÔNG hỏi giữa chừng. Xong L11 đủ 7 pass number → viết report.md (việc đã làm · vấn đề mới · quyết định tự chốt) + link preview rồi dừng chờ Lucas chơi thử.
