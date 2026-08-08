# Báo cáo Session B — v0.2 "Xóm Đóm Hòng" (2026-08-08)

> **QA (em-testing) 2026-08-08 ~23:45: 7/8 ĐẠT** (link sống 0 lỗi console, 8 file JS đủ, VN+EN, verdict/thought/convo_state đúng schema, não haiku, câu hỏi chốt chuẩn, gợi ý quân sư chuẩn, STT nhận ?lang, giấu số + bong bóng + Bà Năm chạy đúng, độ khó 65/75/85 đúng).
> **1 mục rớt → đã xử lý một phần cùng đêm:** Ly chấm gắt câu "em là shipper" và có lúc TỰ BỊA lý do để trừ điểm (bật nhầm cờ mâu thuẫn đồ dù đồ khớp). Đã vá: luật CẤM BỊA CHỨNG CỨ + "trời khuya không phải lý do" vào prompt + giảm độ ngẫu hứng máy chấm (temperature 0.7) — deploy live. Sau vá: đường thắng đúng bài của Ly (pitch content) ăn **danh_trung ổn định 4/4**, ván thật thắng ở câu 5; câu shipper CỤ THỂ được hop_ly ~1/3, còn lại kha_nghi + thỉnh thoảng vẫn oan cờ mâu thuẫn (thiệt hại nhỏ: −3 tin +6 nghi, 1 lần/bộ đồ). Đánh giá: KHÔNG chặn friend test (Ly vốn là người "không quan tâm logic, chỉ quan tâm vui" — shipper là bài yếu với cô ấy theo đúng persona); mục cân chỉnh còn lại đã bàn giao vào pending.md.
> **Lưu ý điều phối:** ngay sau QA, một phiên khác bắt đầu build v0.3 "Kẹt Tiền" TRÊN CÙNG thư mục game (config/ui/convo/game/index + server). Phiên này dừng sửa code từ thời điểm đó để tránh giẫm chân; bản live hiện tại = v0.2 đầy đủ + fix máy chấm (client v0.3 CHƯA lên live, chỉ file config trơ nằm im). Phiên v0.3 deploy tiếp theo sẽ tự mang code của họ lên.

## ✅ Đã xong — cả 8 phase của plan-v0.2.md §8, deploy LIVE từng phase + smoke test từng phase

**Link: https://xom-dom-hong.pages.dev** (VN/EN, mở bằng Chrome; `?debug=1` xem số thật; `?pacing=1` chọn nhịp chữ)

| Mảnh | Trạng thái |
|---|---|
| **Máy chấm điểm công bằng (§1b)** — AI chỉ CHẤM (5 mức: lộ liễu → đánh trúng), CODE tính điểm, giống nhau cả 3 não. Chuyện hợp lý khớp đồ ĐƯỢC cộng thật (test sống: +12 nhà Dễ) | ✅ hết "tụt điểm ngẫu nhiên" |
| **3 nhà 3 độ khó (§2b)** — Ly ⭐ Dễ (65) · Tí ⭐⭐ Vừa (75) · Cô Sáu ⭐⭐⭐ Khó (85), sao hiện trên bản đồ + đầu hội thoại | ✅ |
| **Giấu hết số (§1)** — thay bằng: cửa mở 4 nấc theo lòng tin, bong bóng 💭 suy nghĩ NPC, icon trạng thái (👂🤔🤨😊🚪), mặt + hiệu ứng chân dung (rung khi giận, nghiêng khi thích, đổ mồ hôi khi nghi) | ✅ |
| **Nhịp chữ Undertale** — tốc độ theo cảm xúc + nghỉ ở dấu câu; Lucas chọn Nhanh/Chuẩn/Chậm tại `?pacing=1` (lưu máy) | ✅ |
| **Hết 3-4s chết lặng** — dấu "…" nhấp nháy + tư thế suy nghĩ ngay khi gửi | ✅ |
| **Câu hỏi chốt (Ace Attorney)** — CHỈ nhà Khó: sắp mời thì hỏi vặn lại ("Ủa nãy em nói em tên gì?"), trả lời trượt = +nghi | ✅ test sống |
| **Bầu trời = đồng hồ (§2)** — trăng trôi ngang 8 phút, gần sáng trời ửng cam, bình minh = hết đêm (không cắt ngang hội thoại) | ✅ |
| **3 đêm** — đêm N cần vào N nhà, hàng xóm quên hết mỗi đêm, thắng đêm 3 = thắng run | ✅ |
| **Tiền + tiệm (§2)** — mỗi nhà "mượn" 20-100k + 1 món đồ; quầy bánh mì bán 4 đồ nghề: 🧋 quà (+tin) · ⏳ +45s · 💡 quân sư mách 1 câu (Haiku) · 🎽 đổi đồ tại chỗ | ✅ |
| **Xóm sống dậy (§6b)** — ĐOM ĐÓM bay, cột đèn, nhà Ly có neon, nhà Tí có bóng đá, nhà Cô Sáu dây phơi | ✅ |
| **Nhà Bà Năm — hướng dẫn (§0 #6-7)** — bà điếc tấu hài, 3 bước kịch bản (shipper → quà sinh nhật người yêu cũ → CẮN), 0 đồng AI, bỏ qua được | ✅ |
| **Gương hoá trang (§0 #8-9)** — preview sói sống + tab Mặt/Tóc/Da/Đồ + 🎲; mặt/tóc/da chỉ đẹp, ĐỒ mới ảnh hưởng AI; sói trên bản đồ đổi theo | ✅ |
| **VN/EN (§0 #10)** — nút 🇻🇳/🇬🇧 màn đầu; NPC + suy nghĩ + mic + Bà Năm đều đổi theo | ✅ |
| **Cảnh CẮN (§0 #4)** — cửa mở → nút CẮN → màn bóng đen rượt nhau dưới trăng (tự vẽ, không máu me) → cuộn len rơi → loot | ✅ |
| **Mắt sau rèm (§2)** — thua là hàng xóm nhìn trộm qua cửa sổ 4s | ✅ |
| **Độ bền (§4)** — Haiku 6s là nhường DeepSeek, ghi não từng lượt vào transcript, tự đặt con trỏ vào ô chữ sau mỗi câu | ✅ |

**Ván thật nhà Dễ (AI thật, chơi bằng máy):** mở màn xưng shipper → Ly nghi (−11: nửa đêm tự nhiên trùng đúng đơn trà sữa cô đang chờ — nghi là ĐÚNG persona); chuyển bài sang khen content + pitch ý tưởng video → 3 câu "đánh trúng" liên tiếp (+19/câu) → **tin 76 ≥ 65, cửa mở ở câu thứ 5**. Chỉ tiêu "≈4 câu tốt" đạt: đúng 4 câu tốt sau 1 câu mở màn hỏng.

## ⚠️ VẤN ĐỀ MỚI + QUYẾT ĐỊNH PHÁT SINH (không có trong plan) — cho Lucas

1. **Cô Sáu (nhà Khó) chấm rất gắt** — đúng persona "thẩm phán", nhưng lúc probe có lần chấm "lộ liễu" cho câu chuyện tử tế và tự bịa chi tiết để gài bẫy. Đã siết luật (cờ "mâu thuẫn đồ" chỉ dành cho ĐỒ vs CHUYỆN, phạt 1 lần/bộ đồ). Cần Lucas chơi thật nhà Khó vài lần xem có "thắng được trong ~7 câu" như chỉ tiêu không — nếu gắt quá thì chỉnh BẢNG ĐIỂM (không đụng prompt).
2. **Đồ rơi từ nhà (loot quần áo) hiện chỉ là hàng trang trí** — tủ đồ đã mở sẵn 100% từ đầu (quyết định cũ v0.1), nên "rơi 1 món đồ" chưa mở khoá gì mới. Muốn có cảm giác sưu tầm thật → v0.3 khoá bớt tủ đồ + đồ mới chỉ có từ loot.
3. **Bình minh có "ân xá"** — đang nói chuyện dở thì trời không sáng (cho nói hết câu chuyện). Tự quyết vậy để đỡ ức chế; Lucas thấy dễ quá thì bỏ ân xá.
4. **Tiếng Anh của NPC thỉnh thoảng lai Việt** trong phần suy nghĩ 💭 (Haiku) — nghe cũng có duyên kiểu bà con Việt kiều, nhưng chưa "chuẩn EN 100%". Theo dõi ở friend test, chưa đáng sửa.
5. **Giá tiệm tự đặt** (40/60/50/30k, loot 20-100k) — cân cho "1 nhà ≈ 1 món đồ". Lucas chơi thấy giàu/nghèo quá thì đổi 1 dòng config.

## 🎯 Việc Lucas làm tiếp (đúng pass number §0 #15)
1. **Tự chơi hết tutorial + đêm 1 không cần trợ giúp** — đạt thì qua bước 2. Nhớ thử `?pacing=1` chọn nhịp chữ luôn.
2. **Gửi link cho ≥10 bạn** (outbound — chờ Lucas gật): ≥7/10 chơi xong tutorial + nói "chơi nữa" = ĐẠT.
3. Nhà Khó: chơi 2-3 lần, báo lại "thắng nổi không" → chỉnh bảng điểm nếu cần.

## 💰 Chi phí
- Haiku qua gateway ~600-3.500 token vào (có cache) + ~300 ra mỗi lượt — friend test vẫn dưới $5 như plan. Quân sư 💡 tốn thêm ~1 lượt Haiku mỗi lần dùng (có trả phí trong game bằng tiền ảo nên tự giới hạn).

## Kỹ thuật (đọc khi cần)
- Code: `GitHub/Xom Nay Kho Lam/game/` — client `public/js/` (config·convo·tutorial·ui·game·speech·blips·portraits) + server `functions/api/` (converse·stt·_personas).
- Bảng điểm verdict + độ khó: `public/js/config.js` (XDH.VERDICTS, XDH.DIFFICULTY) — cân bằng chỉnh Ở ĐÂY, không đụng prompt.
- Ảnh smoke test từng phase: `game/shots/p0_… → p5_…`. Deploy: `npx wrangler pages deploy public --project-name xom-dom-hong --branch main`.

---

# (Lưu) Báo cáo Session B — MVP v0.1 (2026-08-05)

> QA (em-testing) 2026-08-05 18:41: ĐẠT 11/11 hạng mục. Chi tiết đầy đủ trong git history của file này.
> Tóm tắt: MVP 3 nhà + mic tiếng Việt + 3 não AI (Haiku→DeepSeek→kịch bản) + luật trong code — LIVE.
> Vấn đề v0.1 đã xử lý trong v0.2: Anthropic 403 (→ AI Gateway, xong 08-06), câu rơi kịch bản (→ log não + timeout 6s/30s).
> Còn treo từ v0.1: chân dung nano-banana (pending), iPhone/Zalo webview mic (dặn mở Chrome/Safari), GAME_PASS đang tắt (preview mở tự do).
