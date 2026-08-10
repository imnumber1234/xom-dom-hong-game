# v0.7 — 6 câu hỏi cho Lucas (batch DUY NHẤT, phiên A 2026-08-10)

Câu nào Lucas không trả lời → dùng mặc định ghi sẵn, ghi vào report.

| # | Câu hỏi | Lựa chọn | Mặc định nếu im lặng |
|---|---|---|---|
| Q1 | **Câu mẫu lấy từ đâu?** Kho 6 câu/nhân vật là trái tim của cả việc này. | **A. Tôi tự viết** (miễn phí, ~2 tiếng, giọng do mình kiểm soát — *khuyên dùng, 90%*) · B. Thu từ YouTube/TikTok người Đà Nẵng thật rồi lọc tay (thật hơn, tốn 1 buổi, có rủi ro bản quyền/giọng lệch) · C. Nhờ AI sinh rồi Lucas duyệt | **A** |
| Q2 | **Werewolf: nhánh nào?** Đang đứng ở `scripted-demos-v2`, không phải `main`. | A. Làm trên `scripted-demos-v2` · **B. Cắt nhánh mới `voice-sheets` từ `main`** (*khuyên dùng*) | **B** |
| Q3 | **Xóm Đóm Hòng: đẩy tới đâu?** | **A. Chỉ preview `giong-that.xom-dom-hong.pages.dev`, chờ Lucas nghe thử rồi mới lên link chính** (*khuyên dùng — đúng luật không-đẩy-thẳng-live*) · B. Lên thẳng link chính | **A** |
| Q4 | **Có sinh câu mẫu tự động cho ô "tự viết nhân vật" của Werewolf không?** (W3 — tốn 1 lượt gọi AI rẻ mỗi ghế, ~0đ, nhưng là thêm một chỗ có thể hỏng) | **A. Có** (*khuyên dùng — đây chính là lỗi #21/#30 "em bé nói như người lớn"*) · B. Không, chỉ làm 20 mẫu có sẵn | **A** |
| Q5 | **Fine-tune thật (đúng như video) — bật đèn xanh nghiên cứu chi phí chưa?** Phải đổi nhà cung cấp AI, tốn tiền theo giờ máy. | A. Chưa, để tầng 1 chạy 2 tuần rồi tính · B. Có, báo giá cho tôi luôn ở báo cáo cuối | **A** |
| Q6 | **NPC cho vào nhà ngay lượt 1** (phát hiện phụ, xem pending.md) — sửa trong v0.7 hay để riêng? | **A. Để riêng, v0.7 chỉ lo GIỌNG** (*khuyên dùng — trộn hai việc là hỏng cả hai*) · B. Gộp vào luôn | **A** |

---

## Đã tra rồi, KHÔNG hỏi lại

- Video dạy gì → fine-tune bằng Unsloth (xem `plan-v0.7-giong-that.md` §1).
- Câu mẫu có thật sự ăn thua không → có, đo được: gấp 2-4 lần dấu hiệu giọng, chặn trôi xưng hô (§3).
- Werewolf đã có kỹ thuật này chưa → có, nhưng chỉ cho 12 người nổi tiếng; 20 mẫu bot + ô tự viết thì chưa
  (xem `Werewolf AI Arena/docs/VOICE-SHEET-PLAN-2026-08-10.md` §1).
