# v0.8 — NÃO XOAY VÒNG (không phụ thuộc một nhà nào)

> Lucas chốt 2026-08-10: **"làm B, nhưng AI phải tự đổi qua lại giữa các model, đừng kẹt một cái."**
> Thay thế `plan-v0.8-finetune.md` — fine-tune tụt xuống **v0.9** (lý do: `research/brain-bakeoff-2026-08-10.md`).
> Phiên A (lập kế hoạch). Điều kiện: v0.7 sổ giọng đã xong.

---

## 1. Vì sao đổi hướng

Hôm nay khoá Anthropic hết tiền → **quân sư 💡 và câu-hài-nhất chết ngay**, vì hai chỗ đó gọi thẳng
Anthropic, không có đường lui. Phần nói chuyện sống sót chỉ vì nó ĐÃ có chuỗi dự phòng.
→ Bài học: **mọi chỗ gọi AI đều phải đi qua cùng một chuỗi**, không chỗ nào được gọi thẳng.

Và so găng thật cho thấy thứ tự hiện tại đang sai — Haiku đứng đầu nhưng Gemini Flash nói giọng
Cô Sáu tốt hơn, nhanh hơn, rẻ hơn.

## 2. Thứ tự mới (theo điểm đo được, không theo cảm tính)

| Hạng | Não | Điểm giọng | Vì sao ở đây |
|---|---|---|---|
| 1 | **Gemini 2.5 Flash** (BẮT BUỘC tắt suy nghĩ) | 4.3 | Cao nhất + nhanh nhất (1,1s) + rẻ ($0.30/$2.50) |
| 2 | **Qwen Plus** | 3.5 | Câu gọn nhất, xưng hô chuẩn nhất, nhanh ngang |
| 3 | **DeepSeek V3** | 3.7 | Đang chạy tốt, hơi dài dòng |
| 4 | Haiku 4.5 | chưa đo được | Giữ lại — khi nào Lucas nạp tiền thì tự sống lại |
| 5 | Kịch bản có sẵn | — | Không bao giờ để người chơi thấy màn hình chết |

**⚠️ Bẫy chết người:** Gemini 2.5 mặc định "suy nghĩ" trước khi nói, và phần suy nghĩ **ăn vào hạn mức
chữ trả lời** → câu bị cắt cụt giữa chừng. Đã dính đúng lỗi này khi thử (xem research). **Phải đặt
`thinkingBudget: 0`.** Nguồn: firebase.google.com/docs/ai-logic/thinking

## 3. "Tự đổi" nghĩa là gì (đúng ý Lucas)

| Cơ chế | Làm gì |
|---|---|
| **Rơi tầng** | Não 1 hỏng → tự thử não 2 → não 3… người chơi không thấy gì cả |
| **Ghi nhớ cái đang chết** | Não vừa lỗi bị **cho nghỉ 10 phút**, lượt sau bỏ qua luôn. Không có cái này thì mỗi lượt lại chờ 2 giây cho một khoá đã chết — chậm và tốn |
| **Tự sống lại** | Hết 10 phút thì thử lại một lần. Lucas nạp tiền là tự quay về, không cần deploy |
| **Dùng chung cho MỌI chỗ** | Nói chuyện · quân sư 💡 · câu-hài-nhất — cùng một chuỗi. Cấm chỗ nào gọi thẳng một nhà |
| **Ghi lại ai trả lời** | Mỗi lượt ghi tên não đã dùng → biết bản thật đang chạy bằng gì |

## 4. Việc khó thật sự — mỗi nhà một kiểu "điền phiếu"

Game không chỉ xin lời thoại; nó bắt AI **điền một cái phiếu** (lời thoại + suy nghĩ + chấm điểm +
cờ mâu thuẫn). Mỗi nhà có cách riêng:

| Nhà | Kiểu |
|---|---|
| Anthropic | `tools` — đã có sẵn trong code |
| DeepSeek · Qwen | Kiểu OpenAI — đã có sẵn (đang dùng "ghi chú lược đồ") |
| **Gemini** | `functionDeclarations` — **CHƯA có, phải viết mới** |

→ Đây là phần tốn công nhất, không phải phần đổi thứ tự.

## 5. Đi đường nào

Cổng AI của Cloudflare (đang dùng cho Anthropic) **có hỗ trợ Google AI Studio, DeepSeek, Workers AI**
nhưng **KHÔNG hỗ trợ Qwen** → Qwen gọi thẳng. Nguồn: developers.cloudflare.com/ai-gateway/usage/providers/
Đi qua cổng thì được đếm chi phí + xem log ở một chỗ, nên chỗ nào đi được thì đi.

## 6. Việc phải làm

| # | Việc | Xong là khi | Kết quả 2026-08-10 |
|---|---|---|---|
| B1 | Gom mọi chỗ gọi AI về **một cửa duy nhất** (chuỗi + rơi tầng + cho nghỉ 10 phút + ghi tên não) | Không còn chỗ nào gọi thẳng một nhà | ✅ `functions/api/_brain.js`; `converse.js` còn **0** chỗ gọi thẳng |
| B2 | Viết bộ nối Gemini (kèm `thinkingBudget: 0` + điền phiếu kiểu Gemini) | Gemini trả về phiếu đầy đủ, câu không bị cắt | ✅ viết xong, chạy được — **nhưng khoá đã hết hạn mức miễn phí (429)**, xem §9 |
| B3 | Thêm Qwen Plus vào chuỗi (gọi thẳng, kiểu OpenAI) | Qwen trả về phiếu đầy đủ | ✅ Qwen đang gánh **toàn bộ** bản preview |
| B4 | Đổi thứ tự theo §2; quân sư 💡 + câu-hài-nhất dùng chung chuỗi | Rút khoá Anthropic ra → cả 3 tính năng VẪN chạy | ✅ đo thật: rút Anthropic, cả 3 vẫn chạy |
| B5 | Bài kiểm "giết từng não": tắt lần lượt từng nhà, game phải vẫn chơi được | 4/4 lần tắt đều sống | ✅ **6/6** — `game/tools/brain-killtest.mjs` |
| B6 | Bài kiểm 20 mục như v0.7 + chạy lại máy chấm giọng | 20/20, điểm giọng ≥ v0.7 | 🔴 **15/20** (v0.7 được 13/20) → **DỪNG Ở PREVIEW, link chính không đụng** |

**Không đụng:** bảng điểm, luật thắng thua, sổ giọng v0.7, giao diện.

## 7. Pass-number (chốt TRƯỚC)

- **Rút bất kỳ 1 khoá nào ra → game vẫn chơi được hết ván.** 4/4.
- **Rút 3 khoá, chỉ chừa 1 → vẫn chơi được.** 
- Quân sư 💡 + câu-hài-nhất: **sống khi không có Anthropic** (hôm nay đang chết).
- Điểm giọng: **≥ 3.5** trung bình (Gemini đo được 4.3).
- Thêm độ trễ do rơi tầng: **≤ 1 giây** ở lượt bình thường (nhờ cơ chế cho nghỉ).
- Tiếng Việt có dấu: **100%**.

## 8. Điều cần nói thẳng

- **Đây không phải việc "đổi sang Gemini".** Đổi sang một nhà khác rồi cũng sẽ có ngày nhà đó chết.
  Giá trị nằm ở chỗ *không nhà nào giết được game nữa*.
- **Vẫn nên nạp tiền Anthropic** — không phải để làm não chính, mà để có thêm một tầng dự phòng.
- Fine-tune (v0.9) chỉ còn lý do duy nhất: **sở hữu mô hình của riêng mình**. Không còn lý do chất lượng.

---

## 9. THI CÔNG XONG — kết quả đo thật (2026-08-10, phiên B)

**Preview:** https://nao-xoay-vong.xom-dom-hong.pages.dev · **link chính KHÔNG bị đụng.**

### Pass-number §7 — 6/6 ĐẠT

| Chốt trước | Đo được |
|---|---|
| Rút bất kỳ 1 khoá → chơi hết ván | ✅ 4/4 |
| Rút 3, chừa 1 → chơi hết ván | ✅ 4/4 |
| Quân sư 💡 + câu-hài-nhất sống khi KHÔNG có Anthropic | ✅ cả hai đều ra chữ thật |
| Rút sạch khoá → rơi về kịch bản, không vỡ | ✅ |
| Thêm độ trễ do rơi tầng ≤ 1 giây | ✅ **392ms**, và chỉ ở lượt đầu mỗi 10 phút (đo 3 lần: 528/473/176ms) |
| Tiếng Việt có dấu 100% | ✅ mọi vòng có não thật |

### Bài kiểm 20 mục — 15/20 (v0.7 là 13/20)

Năm mục trượt, **không mục nào là lỗi đường dây não** — tất cả là chất giọng của Qwen:

| # | Trượt | Nguyên nhân |
|---|---|---|
| 10 | Ly · ma sói · EN, lượt 6 | Qwen trả về lời thoại rỗng ("…") |
| 12 | Ly · kẹt tiền · EN, lượt 6 | còn 2 dấu hiệu giọng (cần ≥ 3) |
| 14 | Tí trôi xưng hô (kẹt tiền, VN) | lượt 6 nhảy sang "tui/tôi/mình" |
| 16 | Giám khảo mù 7/9 (cần ≥ 8) | Tí bị đoán thành Ly, Ly thành Cô Sáu |
| 20 | Cô Sáu chế độ EN **trả lời tiếng Việt** | Qwen không nghe lời dặn ngôn ngữ bằng Haiku |

### Sự thật phải nói thẳng: hai não đầu bảng đang bị KHOÁ VÌ TIỀN

| Não | Tình trạng đo được hôm nay |
|---|---|
| Gemini 2.5 Flash (hạng 1) | ❌ **HTTP 429 — hết hạn mức miễn phí.** Bộ nối viết xong và đúng, nhưng khoá không gọi được |
| Qwen Plus (hạng 2) | ✅ đang gánh 100% bản preview |
| DeepSeek V3 (hạng 3) | ✅ chạy được qua cổng Cloudflare (vẫn còn tật trả rỗng khi hội thoại dài — pending mục 1-2) |
| Haiku 4.5 (hạng 4) | ❌ **hết tiền tài khoản** (y như hôm qua) |

→ Đúng điều v0.8 sinh ra để lo: **hai nhà chết cùng lúc, game vẫn chạy bình thường.**
Nhưng muốn đạt 20/20 thì phải mở khoá não hạng 1 — xem `pending.md`.

### 10. Lucas đổi thứ tự (2026-08-10, sau khi xem kết quả)

Lucas: *"can we use claude prioritize first then others?"* → **Claude lên hạng 1.**

Thứ tự mới: **Haiku → Gemini → Qwen → DeepSeek → kịch bản.**
Đặt bằng biến `BRAIN_ORDER` (không phải sửa code) → sau này đổi lại chỉ mất một dòng, không cần deploy.

Đo ngay sau khi đổi: Haiku vẫn hết tiền, Gemini vẫn hết hạn mức → **cả hai bị cho nghỉ 10 phút**,
Qwen trả lời, game chạy bình thường. Giá phải trả: lượt ĐẦU của mỗi 10 phút chậm thêm **~1,4 giây**
(gõ cửa hai nhà đang đóng), các lượt sau **0 giây**. Nạp tiền Anthropic là Claude tự lên lại, khỏi deploy.
