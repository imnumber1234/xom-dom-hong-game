# So găng NÃO AI — ai giữ giọng Cô Sáu giỏi nhất? (2026-08-10)

> Lucas hỏi: có cách khác để thử/làm không — Opus, Sonnet, DeepSeek, GLM, Qwen…?
> Trả lời bằng **thí nghiệm thật**, không bằng bảng thông số. Cùng một lời dặn (thẻ Cô Sáu + sổ giọng
> v0.7 + nhắc giọng từ lượt 4), cùng 6 câu người chơi, 7 nhà cung cấp.
> Dữ liệu thô: scratchpad/bakeoff-out.json + bakeoff2-out.json

---

## 🚨 PHÁT HIỆN KHẨN — tài khoản Anthropic HẾT TIỀN

Khoá `ANTHROPIC_API_KEY` (dùng CHUNG cho Xóm Đóm Hòng và Werewolf) trả về:
*"Your credit balance is too low to access the Anthropic API."*

**Hậu quả ngay lúc này:**

| Tính năng | Tình trạng |
|---|---|
| Nói chuyện với hàng xóm | ✅ Vẫn chạy — tự rơi xuống DeepSeek (Haiku → DeepSeek → kịch bản) |
| 💡 Quân sư gợi ý câu nói | ❌ **CHẾT** — chỉ gọi Anthropic, không có dự phòng |
| Bình luận "câu hài nhất" cuối ván | ❌ **CHẾT** — cùng lý do |
| Werewolf AI Arena | ⚠️ Cùng khoá — cũng ảnh hưởng |

**Việc cần làm:** nạp tiền Anthropic, HOẶC (tốt hơn) đổi não chính sang bên rẻ hơn theo bảng dưới,
HOẶC cho quân sư + câu-hài-nhất một đường dự phòng như phần nói chuyện đã có.

## Bảng điểm (6 lượt, thẻ + sổ giọng y hệt nhau)

| Não | Dấu hiệu giọng TB | Lượt 6 | Trôi xưng hô | Mất dấu | Giây/lượt | Độ dài |
|---|---|---|---|---|---|---|
| **Gemini 2.5 Flash (tắt suy nghĩ)** | **4.3** 🥇 | 5 | 0 | 0 | **1.1** | 178 chữ |
| DeepSeek V3 (dự phòng hiện tại) | 3.7 | 3 | 0 | 0 | 1.8 | 196 chữ |
| **Qwen Plus** | 3.5 | 4 | 0 | 0 | 1.1 | **119 chữ** 🥇 |
| Gemini 2.5 Flash (để mặc định) | — | — | — | — | — | **HỎNG, xem dưới** |
| Haiku 4.5 / Sonnet 5 / Opus 5 | — | — | — | — | — | **hết tiền, không thử được** |
| GLM-4.6 (Z.ai) | — | — | — | — | — | hết tiền tài khoản |

**Sửa lại điều tôi nói vòng trước:** tôi có báo Qwen "trôi xưng hô 3 lượt" — **sai**, đó là lỗi máy đếm
của tôi (nó tưởng "chú **em**" là đổi xưng hô). Soi tay lại 6 lượt: Qwen giữ "cô / chú em" chuẩn nhất trong
cả nhóm. **Không não nào trôi xưng hô** khi đã có sổ giọng + nhắc giọng — tức phần v0.7 làm đúng việc.

## Ba cái bẫy tìm ra

1. **Gemini để mặc định thì HỎNG.** Bản 2.5 "suy nghĩ" trước khi nói, phần suy nghĩ ăn hết hạn mức chữ →
   câu trả lời bị cắt cụt ("Trời đất ơi, sinh viên gì" rồi hết). Phải **tắt suy nghĩ** thì mới dùng được.
   Nếu ai cắm Gemini vào mà không biết điều này sẽ tưởng model dở.
2. **Gói miễn phí của Gemini không còn đủ cho một cái game** — Google đã siết xuống còn khoảng 250 lượt/ngày
   (có báo cáo thực tế còn thấp hơn). Chơi thật phải trả tiền: **$0.30 vào / $2.50 ra** mỗi triệu chữ.
3. **Ba nhà cùng một khoá là điểm chết đơn lẻ.** Hết tiền Anthropic là 2 dự án cùng lăn ra.

## Ý nghĩa cho v0.8 (fine-tune)

Bảng này **làm yếu lý do fine-tune**, không phải làm mạnh:

- Sổ giọng v0.7 đã kéo mọi não lên **3.5–4.3 dấu hiệu** và **chặn trôi xưng hô hoàn toàn** —
  đó vốn là mục tiêu pass-number của v0.8 (≥3).
- Não sẵn có, **không huấn luyện gì cả**, đã đạt ngưỡng đó rồi.
- Fine-tune một mô hình 4B để đuổi kịp Gemini Flash đang thắng sẵn là leo dốc ngược.

→ **Đề xuất đổi thứ tự: v0.8 KHÔNG phải fine-tune nữa mà là "đổi não + chống chết".**
Fine-tune tụt xuống v0.9, chỉ làm nếu Lucas vẫn muốn *sở hữu* mô hình riêng (lý do chính đáng: học nghề
+ không phụ thuộc nhà cung cấp), chứ không phải vì chất lượng.

## Cách thử (trả lời phần "có cách test nào khác")

| Cách | Tốn gì | Bắt được gì | Ghi chú |
|---|---|---|---|
| **Đếm dấu hiệu giọng + soi trôi xưng hô (đang dùng)** | vài xu | Giọng nhạt, trôi giọng | Tự động, chạy lại được. **Khuyên dùng làm cửa chặn.** |
| **Giám khảo mù đoán ai nói** | vài xu | Nhân vật có lẫn vào nhau không | Đã có ở v0.7 T4 |
| **So cặp A/B mù bằng máy chấm** | vài xu | "Bên nào giống nhân vật hơn" | Nên thêm — đúng thứ cần cho v0.8 F6 |
| Lucas nghe bằng tai | thời gian của Lucas | Cái máy không bắt được (duyên, hài) | Chỉ dùng ở vòng cuối, đừng dùng để dò |

**Luật:** máy lọc trước, tai Lucas chấm sau. Đừng bắt Lucas nghe 40 mẫu.

## Chưa thử được (cần Lucas mở khoá)

- **Opus 5 / Sonnet 5 / Haiku 4.5** — hết tiền Anthropic.
- **GLM-4.6** — hết tiền Z.ai.
- **Cloudflare Workers AI** — game ĐÃ có sẵn khoá `[ai]` trong `wrangler.toml` (đang dùng cho nghe giọng nói).
  Chạy model ngay cạnh game, có hạn mức miễn phí hằng ngày, độ trễ gần bằng 0 vì cùng máy chủ.
  **Đây là hướng rẻ nhất chưa ai thử.** Cần một buổi để đo.
