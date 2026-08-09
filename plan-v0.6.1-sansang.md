# Plan v0.6.1 — SẴN SÀNG CHO BẠN BÈ (3 việc nhỏ, chặn đúng 3 kiểu chết oan)

> Session A 2026-08-09, sau khi v0.6 lên link chính.
> **Đây KHÔNG phải gói tính năng.** Đây là 3 lỗi đã biết chắc sẽ giết friend test vì lý do
> KHÔNG liên quan tới chất lượng game. Sửa xong thì gửi link.
> Ước lượng: nửa buổi. Không đụng luật chơi, không đụng máy chấm.

---

## 0. Vì sao dừng xây tính năng ở đây

Bốn ngày qua đã ship v0.1 → v0.2 → v0.3 → v0.4 → v0.6. **Chưa một người ngoài nào chơi thử.**
Thước đo duy nhất của dự án (10 bạn chơi hết 1 vòng · ≥7/10 nói "chơi nữa") **vẫn chưa đo được lần nào**.

Mọi cải tiến từ đây là ĐOÁN: đoán của Claude, đoán của ChatGPT, lời khuyên anh Khiêm (cho game khác),
trực giác của Lucas. Đều hợp lý, đều chưa ai kiểm chứng bằng người thật.

**Ba việc dưới đây thì KHÔNG phải đoán** — cả ba đều đã ghi trong `pending.md` là lỗi có thật.

---

## 1. Ba việc

> **TRẠNG THÁI THI CÔNG (Terminal B, 2026-08-09):** G1 ✅ · G2 ✅ · G3 ✅.
> **8/9 pass number ĐẠT bằng máy; số 6 (bài kiểm 30 giây) phải là NGƯỜI, chờ Lucas.**
> **ĐÃ LÊN LINK CHÍNH https://xom-dom-hong.pages.dev** (Lucas gật "live" 2026-08-09, kiểm sống 39/39).
> Bằng chứng đầy đủ ở `report.md`.


### ✅ G1 — Mic chết trong trình duyệt của Zalo/Facebook (nguy hiểm nhất)

**Vì sao gấp:** Lucas sẽ gửi link qua **Zalo**. Bạn bè bấm link trong Zalo → mở bằng trình duyệt
nhúng của Zalo → **mic không chạy** (đã ghi trong `pending.md` từ v0.1, cách xử lý hiện tại chỉ là
"dặn miệng bạn bè mở bằng Chrome"). Dặn miệng thì 10 người quên 8.

Kết quả nếu không sửa: bạn bè mở ra, bấm mic, không có gì xảy ra, tắt đi. **Mình sẽ đo được một
con số thất bại chẳng nói lên điều gì về game cả.**

- Dò trình duyệt nhúng (Zalo · Facebook · Instagram · TikTok) ngay khi vào màn hình đầu.
- Trúng thì hiện dải băng to, không bỏ qua được: **"Mở bằng Chrome để nói được — bấm ⋮ rồi
  'Mở trong trình duyệt'"** kèm nút **📋 Chép link**. Song ngữ, tiếng Việt đủ dấu.
- Vẫn cho chơi bằng **gõ chữ** (đường này luôn chạy) — đừng chặn cửa, chỉ cảnh báo.
- Kiểm cả khi mic bị từ chối quyền: hiện đúng câu "bấm vào ổ khoá trên thanh địa chỉ để bật mic",
  không phải im lặng như hiện nay.

### ✅ G2 — Rối tiếng Việt / tiếng Anh (Lucas tự vấp)

`pending.md` ghi: *"Ngôn ngữ không rõ ràng VN hay EN, AI trộn, và không thấy nút đổi ngôn ngữ."*
Hai nút 🇻🇳/🇬🇧 **có tồn tại** (`index.html` dòng 208-209) nhưng chính chủ dự án không thấy.

**Người tạo ra game mà vấp ở phút đầu thì bạn bè chắc chắn vấp.**

- Đưa lựa chọn ngôn ngữ thành **bước đầu tiên, to, không bỏ qua được** trước khi vào game
  (hai nút cỡ lớn giữa màn hình). Chọn xong nhớ máy, lần sau không hỏi lại.
- Thêm nút đổi ngôn ngữ nhỏ **luôn hiện trong lúc nói chuyện**, không chỉ ở màn đầu.
- Siết lời dặn AI: chọn VI thì **KHÔNG chêm tiếng Anh** trừ tiếng lóng Gen Z của Ly (giữ đúng
  nhân vật); chọn EN thì không chêm tiếng Việt trừ vài từ cảm thán.
- **CHỜ LUCAS:** ảnh chụp màn hình ông đang chơi lúc thấy rối — để biết chính xác nút khuất ở đâu.
  Chưa có ảnh thì vẫn làm được 3 gạch đầu dòng trên (đều là cải thiện chắc chắn đúng).

### ✅ G3 — Ba mươi giây đầu (Lucas đưa spec chi tiết 2026-08-09)

**Đã đối chiếu code trước khi viết. Phần lớn spec của Lucas GAME ĐÃ LÀM ĐÚNG RỒI:**

| Spec yêu cầu | Trong code hiện tại |
|---|---|
| "E — GÕ CỬA" chỉ hiện khi lại gần, không hiện thường trực | ✅ ĐÃ ĐÚNG — `game.js` dòng 341-345: chỉ `setVisible(true)` khi trong bán kính 80px, ngoài ra ẩn. Có sẵn cả gợi ý phím (E) |
| Vào là thấy ngay nhân vật + nhiều nhà + đường đi, không phải bãi đất trống | ✅ ĐÃ ĐÚNG — 3 nhà + tủ đồ + xe bánh mì + đom đóm + cột đèn |
| Gõ xong vào thẳng màn hội thoại, NPC chào đúng tính cách ("Ủa ai đây?") | ✅ ĐÃ ĐÚNG — lời chào scripted riêng từng nhân vật, có cả bản theo bộ đồ |
| Không có tutorial ép buộc, không mũi tên chỉ từng nút | ✅ ĐÃ ĐÚNG — nhà Bà Năm là tự nguyện đi tới, bỏ qua được |
| "Đừng để nhà đầu tiên là NPC tutorial giả tạo" | ✅ ĐÃ ĐÚNG Ở KẸT TIỀN — Bà Năm bị ẩn hẳn ở mode này (bài học của bà kết thúc bằng nút CẮN) |
| Không hiện trust/suspicion dạng % | ✅ ĐÃ ĐÚNG — v0.6 chỉ hiện MỨC ĐỔI rồi tan, không có thanh đo |

**→ Việc thật sự phải làm chỉ còn ĐÚNG MỘT: viết lại chữ ở màn hình đầu.**

Hiện tại là **một đoạn văn dày ~40 chữ** (`ui.js` dòng 611-614), vừa kể bối cảnh vừa giải thích
luật vừa nói hết giờ lúc nào. Đúng thứ Lucas bảo đừng làm.

**Đổi thành ba dòng ngắn, đúng khuôn Lucas viết:**

> **KẸT TIỀN**
> *Bạn đang hết tiền.*
> · Đi gõ cửa xin tiền.
> · Nói chuyện để thuyết phục họ.
> · Kiếm đủ tiền mua đồ ăn.
> **[ BẮT ĐẦU ]**

Ma Sói cần bộ ba dòng riêng (spec của Lucas chỉ viết cho Kẹt Tiền) — đề xuất:

> **MA SÓI**
> *Bạn là ma sói, và ma sói không tự vào nhà được.*
> · Hoá trang rồi đi gõ cửa.
> · Nói chuyện để họ MỜI bạn vào.
> · Vào đủ số nhà trước khi trời sáng.

- **Bỏ khỏi màn đầu:** giải thích hết giờ lúc nào · đêm 1 vào mấy nhà · luật xóm. Thanh trạng thái
  đã hiện mục tiêu bữa ăn + đồng hồ rồi — để người chơi tự thấy.
- **Không nhắc một chữ nào** về: lòng tin · nghi ngờ · máy chấm · tính cách NPC · bí mật · chiến
  thuật quần áo. Tất cả phải tự khám phá.
- Song ngữ VN/EN, tiếng Việt đủ dấu.
- **Kiểm một việc nhỏ:** chỗ người chơi xuất hiện có phải sát nhà Bà Năm không (bà ở toạ độ
  480,505). Nếu nhà đầu tiên người mới đụng phải là nhà tutorial thì đổi chỗ xuất hiện cho lại gần
  một nhà THẬT — đúng ý Lucas "học bằng cách chơi thật, không phải bằng nhà giả".

**KHÔNG làm:** tutorial mới · popup hướng dẫn · mũi tên · màn giải thích dài · đổi luật chơi ·
đổi tính cách NPC · đụng máy chấm.

---

## 2. Pass number

> **ĐO THẬT 2026-08-09: 8/9 ĐẠT bằng máy. Số 6 chờ người thật (Lucas hoặc một người bạn).**


1. [x] Mở link trong trình duyệt nhúng Zalo → dải băng cảnh báo hiện, nút chép link chạy, gõ chữ vẫn chơi được.
2. [x] Từ chối quyền mic → hiện hướng dẫn bật lại, không im lặng.
3. [x] Vào game lần đầu → phải chọn ngôn ngữ trước khi qua được; chọn xong lần sau không hỏi lại.
4. [x] Nút đổi ngôn ngữ nhìn thấy được trong lúc nói chuyện, ở CẢ hai mode.
5. [x] Chọn VI → 10 lượt AI thật, 0 lượt chêm tiếng Anh ngoài tiếng lóng của Ly.
6. [ ] **CHỜ NGƯỜI THẬT — Bài kiểm 30 giây (thước đo thật của Lucas):** một người CHƯA từng thấy game, không được ai
   giải thích bằng miệng — trong 30 giây tự nói được ba ý *"tôi hết tiền · tôi cần tiền · tôi phải
   đi gõ cửa"*. Đạt thì onboarding xong. Không đạt thì ghi lại HỌ KẸT Ở ĐÂU, đừng thêm tutorial.
7. [x] Màn đầu KHÔNG còn chữ nào nhắc tới lòng tin · nghi ngờ · điểm · tính cách NPC · bí mật · quần áo.
8. [x] Chỗ xuất hiện: nhà gần nhất khi vào game là nhà THẬT, không phải nhà Bà Năm.
9. [x] Không phá gì: ma sói + Kẹt Tiền mỗi mode chơi trọn 1 vòng, 0 lỗi console; popup/meme/cảm xúc của v0.6 vẫn đúng.

**Trạng thái: 🟢 SẴN SÀNG bàn giao Terminal B. Confidence: 92%.**
(8%: chưa có ảnh chụp của Lucas cho G2 — nhưng 3 việc của G2 đều đúng dù ảnh cho thấy gì.)

---

## 3. Execution Loop Prompt — Terminal B

/execute-loop Xóm Đóm Hòng v0.6.1 — SẴN SÀNG CHO BẠN BÈ. Đọc `GitHub/Xom Nay Kho Lam/plan-v0.6.1-sansang.md` TRƯỚC. KIỂM TRA ĐẦU TIÊN: nếu vòng lặp nào khác (v0.5 Ly) đang chạy trên thư mục này thì DỪNG và báo — một vòng lặp một lúc. Làm đúng thứ tự G1 → G2 → G3. ĐÂY LÀ VIỆC SỬA, KHÔNG PHẢI XÂY: tuyệt đối không đụng máy chấm, không đụng luật thắng/thua, không đụng bảng điểm, không thêm tính năng nào ngoài 3 mục trong plan. Mỗi vòng lặp: chọn ĐÚNG 1 việc chưa xong → làm → tự kiểm theo 9 pass number mục 2 → tick vào plan → dừng vòng. G3 CHÚ Ý: đã đối chiếu code rồi — gợi ý "(E)" khi lại gần, chỗ xuất hiện có nhà, lời chào theo tính cách, không tutorial ép buộc đều ĐANG ĐÚNG, ĐỪNG LÀM LẠI. G3 chỉ còn đúng một việc: thay đoạn văn dày ở `ui.js` dòng 611-614 bằng ba dòng ngắn theo đúng khuôn trong plan (Kẹt Tiền + Ma Sói, VN/EN), bỏ hết phần giải thích luật/hết giờ, và kiểm chỗ xuất hiện không sát nhà Bà Năm. TUYỆT ĐỐI KHÔNG thêm tutorial, popup hướng dẫn, mũi tên chỉ nút. G1 kiểm bằng cách giả chuỗi user-agent của Zalo/Facebook, không cần điện thoại thật. G2: chưa có ảnh chụp của Lucas thì cứ làm 3 gạch đầu dòng (đều đúng dù ảnh ra sao), ghi vào `pending.md` là còn chờ ảnh. Tiếng Việt đủ dấu, song ngữ đủ cả hai bản. Deploy CHỈ lên nhánh preview riêng, KHÔNG đụng xom-dom-hong.pages.dev. Tự duyệt mọi bước lùi được; việc không lùi được (đẩy link chính, gửi tin cho bạn bè) → ghi `pending.md`, bỏ qua, chạy tiếp. Câu hỏi mới → ghi `pending.md`, KHÔNG hỏi giữa chừng. Xong 7 pass number → viết report.md + link preview rồi dừng chờ Lucas.
