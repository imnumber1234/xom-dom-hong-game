# Báo cáo Session B — v0.6.1 SẴN SÀNG CHO BẠN BÈ (2026-08-09)

**✅ ĐÃ LÊN LINK CHÍNH 2026-08-09: https://xom-dom-hong.pages.dev** (Lucas gật "live").
Kiểm sống sau khi đẩy: **39/39 đạt** (25 mục bộ v0.6.1 + 14 mục NPC-tự-dẫn-dắt), 0 lỗi console.
Bản preview vẫn còn ở https://san-sang.xom-dom-hong.pages.dev.

**Trạng thái: 🟡 8/9 pass number ĐẠT bằng máy. Số 6 phải là NGƯỜI — chờ Lucas.**

Đây là **việc SỬA, không phải xây**: không đụng máy chấm, không đụng luật thắng/thua,
không đụng bảng điểm, không thêm tính năng nào ngoài 3 mục trong plan.

---

## 1. Ba việc — làm được gì

### G1 — Mic chết trong Zalo/Facebook (nguy hiểm nhất)
Trước: bạn bè bấm link trong Zalo → mic im lặng → tắt đi. Cách xử lý duy nhất là "dặn miệng".

Giờ: game **tự dò** trình duyệt nhúng (Zalo · Facebook · Instagram · TikTok · WeChat · LINE) và
hiện dải băng đỏ to ở đầu trang: *"⚠️ Bạn đang mở trong Zalo — mic sẽ không nói được. Bấm ⋮ rồi
chọn Mở trong trình duyệt"* + nút **📋 Chép link** (có đường lùi khi webview chặn clipboard).
**Chỉ cảnh báo, không chặn cửa** — gõ chữ vẫn chơi bình thường, đã kiểm.

Thêm: từ chối quyền mic thì câu hướng dẫn *"bấm ổ khoá 🔒 cạnh thanh địa chỉ → bật Micro"*
**ở lại trong khung nói chuyện**, không tan biến như toast cũ.

### G2 — Rối tiếng Việt / tiếng Anh
- **Chọn ngôn ngữ thành bước ĐẦU TIÊN**: hai nút cỡ lớn giữa màn hình, chặn nút Bắt đầu.
  Chọn xong nhớ máy, lần sau không hỏi lại.
- **Nút đổi ngôn ngữ luôn hiện trong lúc nói chuyện** (🇻🇳 VN / 🇬🇧 EN), cả hai chế độ, bấm là lật.
- **Siết lời dặn AI**: chọn VI thì cấm chêm tiếng Anh. Ngoại lệ duy nhất là Ly (Gen Z) được giữ
  tối đa 2 tiếng lóng quen tai mỗi lượt — đó là tính cách của cô, không phải lỗi.
  Tí và Cô Sáu: tuyệt đối không một từ.

### G3 — Ba mươi giây đầu
Đã đối chiếu code trước: gợi ý "(E)" khi lại gần · chỗ xuất hiện có nhà · lời chào theo tính cách ·
không tutorial ép buộc — **đều đang đúng, không làm lại**.

Việc thật sự chỉ còn một: **đoạn văn dày ~40 chữ ở màn đầu → ba dòng ngắn.**

| | Trước | Sau |
|---|---|---|
| Kẹt Tiền | 40 chữ, kể bối cảnh + giải thích luật + báo hết giờ lúc nào | *Bạn đang hết tiền.* · Đi gõ cửa xin tiền. · Nói chuyện để thuyết phục họ. · Kiếm đủ tiền mua đồ ăn. |
| Ma Sói | 44 chữ, có cả "đêm 1 vào 1 nhà, đêm 2 vào 2…" | *Bạn là ma sói, và ma sói không tự vào nhà được.* · Hoá trang rồi đi gõ cửa. · Nói chuyện để họ MỜI bạn vào. · Vào đủ số nhà trước khi trời sáng. |

Đếm thật: **21 chữ**, xuống từ ~40. Nút đổi thành **BẮT ĐẦU ▶**. Dòng mic rút còn một câu.
**Không thêm** tutorial · popup hướng dẫn · mũi tên chỉ nút.

---

## 2. Bằng chứng — 8/9 pass number, đo bằng máy

Chạy hai lượt (máy nhà + preview thật): **25/25 mục đạt ở cả hai**. Ảnh ở `game/shots/v061-*.png`.

| Pass # | Đo | Bằng chứng |
|---|---|---|
| 1 | Trình duyệt nhúng Zalo | Giả chuỗi user-agent Zalo → dải băng hiện, bắt đúng tên "Zalo", có câu "Mở trong trình duyệt", nút chép link đổi thành "✅ Đã chép link", **gõ chữ vẫn gửi được 1 lượt**. Facebook (FBAN/FBIOS) cũng bắt được |
| 2 | Từ chối quyền mic | Ép engine mic báo `not-allowed` → câu *"🔒 Mic đang bị chặn… bật Micro → tải lại trang"* nằm lại trong khung, không im lặng |
| 3 | Cổng ngôn ngữ | Lần đầu: cổng hiện VÀ chặn nút Bắt đầu (kiểm bằng `elementFromPoint`). Chọn xong đóng. Tải lại: **không hỏi lại** |
| 4 | Nút đổi ngôn ngữ trong hội thoại | Thấy được ở **cả Kẹt Tiền lẫn Ma Sói**; bấm một cái là `XDH.lang` đổi thật và nhãn đổi theo |
| 5 | Chọn VI, AI không chêm tiếng Anh | **12 lượt API thật**, chia đều 3 nhân vật: **0 lượt lọt ở Tí và Cô Sáu**. Ly có 1 lượt dùng "trending" — đúng là tiếng lóng đã cho phép |
| 6 | **Bài kiểm 30 giây** | ⏳ **CHƯA ĐO — cần người thật.** Máy không thay được. Xem mục 4 |
| 7 | Màn đầu sạch chữ thừa | 0 chữ nhắc lòng tin · nghi ngờ · điểm · tính cách NPC · bí mật · chiến thuật. 0 mảnh của đoạn cũ ("Đêm 1 vào 1 nhà", "Mặt trời lặn là hết ngày"…). Đúng 3 gạch đầu dòng mỗi chế độ, cả VN lẫn EN |
| 8 | Chỗ xuất hiện | Nhà thật cách **120px**, nhà Bà Năm cách **165px** → người mới đụng nhà THẬT trước. **Không cần đổi gì** |
| 9 | Không phá gì | Ma sói trọn vòng (thắng → CẮN → loot) + Kẹt Tiền trọn vòng (cho 35k) · popup số bay v0.6 vẫn chạy (`ĐÁNH TRÚNG! +21 tin · −4 nghi`) · cảm xúc mới vẫn chạy (`fx-bounce`) · **0 lỗi console** |

---

## 3. Một chỗ tôi tự diễn giải — nói rõ để Lucas bác nếu không đồng ý

Plan có hai câu hơi chọi nhau: khuôn chữ Ma Sói do plan đề xuất có *"Hoá trang rồi đi gõ cửa"*,
trong khi pass number 7 cấm nhắc "quần áo". Tôi hiểu điều bị cấm là **chiến thuật quần áo**
(giải thích mặc đồ nào ăn điểm gì) chứ không phải một động từ hành động — đúng như §G3 viết
"chiến thuật quần áo". Nên giữ nguyên câu của plan. Không đồng ý thì bỏ một chữ là xong.

---

## 4. Còn treo — cần Lucas

| # | Việc | Ghi chú |
|---|---|---|
| 1 | **Bài kiểm 30 giây (pass #6)** | Đưa link cho MỘT người chưa từng thấy game, **không giải thích một câu nào**, bấm giờ 30 giây rồi hỏi họ đang phải làm gì. Đạt = họ nói được "tôi hết tiền · tôi cần tiền · tôi phải đi gõ cửa". Không đạt thì **ghi lại họ kẹt ở đâu**, đừng thêm tutorial |
| 2 | **Ảnh chụp lúc Lucas thấy rối ngôn ngữ (G2)** | Ba việc của G2 đã làm hết vì đều chắc chắn đúng. Có ảnh thì biết thêm nút nào còn khuất |
| 3 | **Đẩy lên link chính** | Việc không lùi được — chờ gật |
| 4 | **Ô "Mật khẩu xóm" vẫn nằm giữa màn đầu** | Đang tắt mật khẩu nên ô này chỉ là chỗ vướng mắt cho người mới. Ngoài phạm vi 3 mục nên tôi KHÔNG tự xoá. Muốn gọn thì ẩn đi, 1 dòng |

---

## 6. BỔ SUNG cùng ngày — "NPC tự dẫn dắt" (cách dạy người mới, Lucas gật)

Sau khi tra cách các game khác dạy người chơi, Lucas chọn phương án đề xuất. Nguyên tắc chung của
mọi nguồn: **dạy đúng lúc cần, không dồn ở màn đầu** — chính Suck Up! cũng không có tutorial.

**Đã làm (lựa chọn #2):** cuộc nói chuyện ĐẦU TIÊN của người chưa từng chơi → hàng xóm chào bằng
câu hỏi thẳng kèm lời **mời nói** ("Nói cô nghe coi, cô đứng đây nghe đó" · "Kể lẹ đi, em đang nghe nè").
Người mới hiểu ngay việc phải làm là TRẢ LỜI. Nói được câu đầu là thôi dẫn dắt.

- **0 giao diện mới:** không tutorial, không popup, không mũi tên. Chỉ đổi lời chào.
- **Tắt được:** `?tut=0` — để gửi hai nhóm bạn hai bản mà so (giống `?nonum=1`).
- **Không đụng:** máy chấm · luật thắng/thua · bảng điểm · tính cách NPC.

**Kiểm: 14/14 đạt** (máy nhà + preview thật) — có dẫn dắt ở đủ 3 nhà × 2 chế độ, bản EN không lẫn
tiếng Việt, nhà thứ hai về lời chào thường, `?tut=0` tắt sạch, 0 lỗi console.
Chạy lại toàn bộ bộ kiểm v0.6.1: **25/25 vẫn đạt** — không phá gì.

**Chưa làm (chờ Lucas gật riêng):** #3 câu mở gợi ý cho ma sói (~30 phút) · #4 nhắc khi đang kẹt ·
#5 nút "?". Đề xuất: chỉ làm nếu **bài kiểm 30 giây** rớt — nếu người ta tự hiểu thì tutorial là nợ.

### 6b. Lucas chốt THÊM: hướng dẫn 4 BƯỚC bắt buộc (phương án A) — ✅ LIVE LINK CHÍNH 2026-08-09

**https://xom-dom-hong.pages.dev** — Lucas gật "live". Kiểm sống sau khi đẩy: **66/66 đạt**
(27 mục hướng dẫn 4 bước + 25 mục v0.6.1 + 14 mục NPC dẫn dắt), 0 lỗi console.

Lucas yêu cầu "must have tutorial step by step". Chọn phương án A: **tận dụng nhà Bà Năm đã có**
(kịch bản sẵn, 0 lần gọi AI, 0 đồng) thay vì dựng mũi tên chỉ nút trên bản đồ.

**Bốn bước, mỗi bước là MỘT hành động thật, dạy đúng 4 thứ của game thật:**
| Bước | Người chơi làm gì | Dạy điều gì |
|---|---|---|
| 1/4 | Chào bà + xưng vai (shipper / sinh viên kẹt tiền) | Cách nói chuyện: gõ chữ hoặc giữ mic |
| 2/4 | Kể một chuyện KHỚP bộ đồ đang mặc | Đồ phải khớp lời khai |
| 3/4 | Bà HỎI VẶN → trả lời một chi tiết CỤ THỂ | Hàng xóm thật cũng hỏi vặn, phải chịu trả lời |
| 4/4 | Ma sói: bấm CẮN · Kẹt Tiền: nói cảm ơn rồi nhận 30k | Cách chốt, và cánh cửa = thước đo lòng tin |

- **Tự bật cho người mới** ngay khi bấm BẮT ĐẦU — không bắt tự đi tìm nhà Bà Năm nữa.
- **Bỏ qua được** bất cứ lúc nào bằng một nút; học xong thì không bao giờ ép lại.
- **Có ở CẢ HAI chế độ.** Trước đây Kẹt Tiền bị ẩn hẳn vì bài học cũ kết bằng nút CẮN —
  nay Kẹt Tiền có kịch bản riêng, kết bằng bà cho tiền.
- **`?tut=0`** tắt ép buộc → gửi hai nhóm bạn hai bản mà so.

**Kiểm: 27/27 đạt** (máy nhà + preview thật) — tự bật ở cả 2 chế độ · đếm bước 1/4→4/4 đúng ·
bước 3 đúng là câu hỏi vặn · Kẹt Tiền +30k thật và KHÔNG có nút CẮN · nút bỏ qua thoát sạch ·
học rồi không ép lại · `?tut=0` không ép · bản EN đủ · 0 lỗi console.
Chạy lại hai bộ cũ: **v0.6.1 25/25 · NPC dẫn dắt 14/14** — không phá gì. Tổng **66/66**.

**Nói thẳng một lần:** nghiên cứu cảnh báo tutorial ép buộc dễ làm người ta bỏ giữa chừng.
Nên có nút bỏ qua + `?tut=0` để đo. Nếu bạn bè bỏ ngay ở bước 1-2 thì đó là tín hiệu phải cắt.

**Nguồn tra cứu:** [Onboarding Methods — Nerdy Teachers](https://nerdyteachers.com/PICO-8/Game_Design/106) ·
[Game Developer](https://www.gamedeveloper.com/design/how-onboarding-should-be-applied-to-tutorials) ·
[Acagamic](https://acagamic.com/newsletter/2023/04/04/dont-spook-the-newbies-unveiling-5-proven-game-onboarding-techniques/) ·
[MDPI 2020](https://www.mdpi.com/2414-4088/4/3/41) · [Suck Up! trên Steam](https://store.steampowered.com/app/2726370/Suck_Up/)

---

## 5. Không đụng tới (đúng lệnh)
Máy chấm · luật thắng/thua · bảng điểm · tính cách NPC · tutorial · link chính.
Vòng lặp v0.5 "Ly có hồn" vẫn chưa khởi động (kiểm đầu phiên: chưa có `LY_DEEP`).
v0.6.1 có sửa `converse.js` (thêm luật ngôn ngữ) → **phiên v0.5 phải `git pull` trước khi đụng.**

---

# Báo cáo Session B — v0.6 GÓI CẢM GIÁC (2026-08-09)

**✅ ĐÃ LÊN LINK CHÍNH 2026-08-09: https://xom-dom-hong.pages.dev** (Lucas gật "live").
Kiểm sống sau khi đẩy: 6/6 đạt — popup khớp 100% mức đổi thật ở cả 3 lượt não Haiku thật, ảnh meme tải được, 0 lỗi console, 0 request lỗi.
Bản preview vẫn còn ở https://cam-giac.xom-dom-hong.pages.dev để so.

**Trạng thái: 🟢 SẴN SÀNG cho Lucas chơi thử. 11/11 pass number ĐẠT.**

---

## 1. Làm được gì (5 món Lucas yêu cầu, đúng thứ tự F1 → F5)

| Món | Người chơi thấy gì | Ai cầm con số |
|---|---|---|
| **F1 · Số bay** | Nói xong là một dòng bay lên cạnh mặt hàng xóm: *"ĐÁNH TRÚNG! +21 tin · −4 nghi"*, rồi tan trong 1,2 giây | CODE. Popup lấy đúng mức đã cộng THẬT (sau khi kẹp 0-100), không tính lại lần hai |
| **F2 · Meme** | Đánh trúng hoặc bị bắt bài thì một cái meme Việt bật ra cạnh câu thoại | CODE tra bảng mood rồi bốc. **AI không chọn meme, không biết meme tồn tại** |
| **F3 · Đồ vật** | Tủ đồ nay **khoá**; vào được nhà mới lượm được món mới. Đồ khớp lời khai thì được **thưởng điểm thật** | CODE. AI chỉ bật cờ `corroboration`; bảng điểm nằm ở `config.js` |
| **F4 · 10 cảm xúc** | Thêm 5 mặt vẽ mới: **chán** · ngượng · cảm động · phấn khích · bực mình | CODE có quyền **đè** lựa chọn của AI: nói nhạt 3 lượt liền ở nhà Ly là mặt chán bật, dù AI chọn mặt gì |
| **F5 · Thứ đời thật không có** | Nghe được ý định TRƯỚC 1 lượt (*"thôi chán rồi… kiếm cớ đóng cửa thôi"*), và sau khi thua được nghe **một câu tiếc nuối** | CODE. Câu tiếc nuối lấy từ bảng điểm-yếu-có-sẵn của nhân vật — AI không tham gia, không có cửa bịa |
| **+ Việc vặt riêng** | Ba nhà hết dùng chung một đoạn chữ: Cô Sáu nhờ ru bé Bin · Tí nhờ chép bài · Ly nhờ cầm đèn | CODE (`XDH.CHORE_LINES`) |

**Con số chỉnh cân bằng gom về một chỗ** trong `game/public/js/config.js`:
`XDH.POP` (tuổi thọ popup) · `XDH.MEME_CFG` (trần 1 meme/3 lượt) · `XDH.WARDROBE_LOCK` ·
`XDH.DIFFICULTY[...].corro` (mức thưởng đồ-khớp) · `XDH.FEEL` (ngưỡng chán + ngưỡng rò rỉ).

---

## 2. Bảy câu hỏi Q1-Q7: Lucas im lặng → đã áp dụng đề xuất CẢ BẢY

Ghi lại đủ trong `plan-v0.6-feel.md` mục 2. Tóm tắt: hiện cả tên lẫn số · không thanh đo thường trực ·
meme thưa (1/3 lượt) · khoá tủ nhưng tặng 1 món đêm 1 · việc vặt chưa thành trò chơi · vẽ chân dung
bằng code · rò rỉ ý định chỉ ở 2 khoảnh khắc.

---

## 3. Bằng chứng — 11/11 pass number, đo bằng máy chứ không phải cảm tính

Ba lượt kiểm, tổng **40/40 mục đạt**. Kịch bản kiểm nằm ở thư mục tạm của phiên;
ảnh chụp ở `game/shots/v06-*.png`.

### A. Não AI thật — 20 lượt qua `/api/converse` (`api_probe.mjs`)
| Đo | Kết quả |
|---|---|
| AI tự cộng điểm (trả về trường số ngoài hợp đồng, hay nhét điểm vào suy nghĩ thầm) | **0/20 ca** ✅ |
| Hai cờ `contradiction` + `corroboration` cùng bật | **0/20 ca** ✅ (chốt chặn ở cả prompt lẫn `shapeReply`) |
| Nhãn cảm xúc mới AI thật sự dùng | `phan_khich`, `chan`, `interested`, `suspicious` — nhãn mới CHẠY THẬT ✅ |
| Đồ chống lưng lời khai được nhận đúng | 3/5 ca dựng sẵn |

### B. Bộ kiểm trình duyệt tất định — chặn API để ép đúng từng verdict (26/26)
| Pass # | Đo | Bằng chứng |
|---|---|---|
| 1 | Popup khớp 100% mức đổi THẬT | Đo độc lập bằng bề rộng thanh đo: `danh_trung` popup +21 tin / thanh +21 · `lo_lieu`+mâu thuẫn popup −11 tin +20 nghi / thanh −11 +20 |
| 1 | Số là số THẬT chứ không phải số bảng gốc | Nhà Ly gainMult 1,3 → bảng ghi 16, popup hiện **+21** |
| 2 | Không có thanh đo thường trực | Bản người chơi (không `?debug=1`): `#meters` display = none ✅ |
| 3 | `?nonum=1` tắt sạch | 0 popup, tin vẫn cộng lên 51 → game chạy y nguyên ✅ |
| 4 | Meme thưa + không lặp | 2 meme / 8 lượt, 0 lặp, đường dẫn đều là `memes/…` của game này ✅ |
| 5 | Tủ đồ khoá | Đêm 1 tặng đúng 1 món · còn 8/9 món khoá · loot mở THÊM 1 món chưa có (1→2) · nút khoá hiện 🔒 và bấm không được |
| 6 | `corroboration` đúng 1 lần/bộ đồ | Lần 1 thưởng `+3 tin · −6 nghi`; lần 2 cùng bộ đồ **không thưởng lại** ✅ |
| 7 | Không phá thứ đang chạy | Ma sói trọn vòng (thua → thắng → CẮN → loot → đêm 2) + Kẹt Tiền (cửa mở → màn xin → cho 35k). **0 lỗi console** |
| 7 | v0.4 vẫn đúng | Sổ tai tiếng ghi đủ · tin đồn cộng nghi khởi điểm và **giờ có hiện số** · trí nhớ qua đêm nén đúng |
| 8 | Tiếng Việt + song ngữ | 0 chuỗi thiếu dấu · 0 mục thiếu bản EN |
| 9 | 10 cảm xúc | 10/10 hình vẽ khác nhau thật (so từng điểm ảnh) — ảnh `v06-10-emotions.png`. Nhà Ly nói nhạt 3 lượt liền → mặt chán bật dù AI chọn `amused` |
| 10 | Rò rỉ ý định | Kiên nhẫn chạm 30 → 💭 *"Ét ô ét, nhạt quá… em bơ luôn rồi đóng cửa nha."* hiện TRƯỚC khi bị đuổi |
| 11 | Dòng tiếc nuối | Câu hiện ra khớp đúng 1 dòng trong bảng điểm yếu của nhân vật — 0 ca bịa |

### C. Smoke trên preview thật, não Haiku thật (6/6)
3 lượt nói chuyện thật: popup khớp 100% mức đổi thật ở **cả 3 lượt**
(vd `[haiku] lo_lieu ⚡mâu-thuẫn → tin −8 nghi +14 [mâu-thuẫn tin −3 nghi 6]` ↔ popup `LỘ RỒI! −8 tin · +14 nghi` + `⚡ Đồ chọi lời khai −3 tin · +6 nghi`).
Ảnh meme tải được, 0 lỗi console, 0 request lỗi.

### D. Duyệt tay từng ảnh meme (yêu cầu bắt buộc)
Mở **25 ảnh**, **loại 3**, giữ **23**:
| Bỏ | Vì sao |
|---|---|
| `low-cortisol-agnes-tachyon.gif` | nhân vật anime chibi Nhật — lạc quẻ với xóm Việt |
| `cat2.jpg` ("I am so fluffy I am going to die") | caption tiếng Anh, không ăn nhập phản ứng nào của game |
| `meme-vuong-meo-chill…avif` | **mở không được để duyệt** → không dùng thứ chưa nhìn tận mắt |

Không ảnh nào thô tục. Chép sang `game/public/memes/` (1,1 MB) — **không trỏ chéo sang project Werewolf**,
**không gọi API GIF ngoài**.

---

## 4. Việc mới nảy ra — cần Lucas quyết (đã ghi `pending.md`, KHÔNG tự làm)

| # | Chuyện | Vì sao đáng bận tâm | Đề xuất |
|---|---|---|---|
| 1 | **Khoá tủ đồ làm đêm 1 khó hẳn lên** | Chiêu kinh điển "em là shipper giao trà sữa" giờ **tự phản** nếu đêm đó không lượm được túi trà sữa — hàng xóm bắt ngay "tay em cầm gì mà không thấy". Đo thật trên preview: 2 lượt liền bị chấm `lo_lieu`. Đây là hệ quả ĐÚNG THIẾT KẾ, nhưng nó đổi độ khó của 5 phút đầu | Chơi thử rồi quyết. Muốn dễ lại: đổi `XDH.WARDROBE_LOCK.NIGHT1_FREE` từ 1 lên 2-3, đúng một dòng |
| 2 | **AI nhận cờ "đồ chọi lời khai" hơi thưa** | 1/5 ca dựng sẵn (chuyện cũ từ v0.4, không phải v0.6 làm hỏng) — mấy ca kia AI chấm `kha_nghi` chứ không bật cờ | Muốn chắc thì để CODE tự dò từ khoá đồ-vs-lời-khai, không tin prompt. ~nửa buổi |
| 3 | **Kẹt Tiền không có loot nên tôi tự thêm một cửa mở đồ** | Mode này không có màn CẮN → không có loot → sẽ kẹt với đúng bộ đồ thường cả ván. Tôi cho mở 1 món mỗi khi có nhà chịu giúp | Tự quyết vì lùi được trong 1 dòng. Không thích thì xoá |
| 4 | **Popup ở nhà Khó (Cô Sáu) hiện số nhỏ hơn hẳn** | gainMult 0,8 → `danh_trung` chỉ +13 tin, trong khi nhà Ly +21. Người chơi có thể tưởng mình nói dở | Bình thường theo thiết kế bậc khó. Nếu chơi thấy nản thì nói |

---

## 5. Không đụng tới (đúng lệnh)

- **Link chính `xom-dom-hong.pages.dev`**: không đẩy, không sửa.
- **Hệ nhiệm vụ thật (v0.7)**: không đụng một dòng.
- **Vòng lặp v0.5 "Ly có hồn"**: kiểm đầu phiên — chưa khởi động (chưa có `LY_DEEP` trong `_personas.js`),
  nên mở v0.6 an toàn. `SYSTEM_TEMPLATE` có sửa (thêm luật `corroboration` + 10 nhãn cảm xúc)
  → **phiên v0.5 phải `git pull` trước khi đụng file này.**

## 6. Thước đo thật vẫn còn treo

Lucas chơi 1 ván và nói được *"giờ tôi biết vì sao mình hỏng."* — chưa đo được, chờ ông chơi.
Thử luôn cả `?nonum=1` để so hai kiểu: hiện số làm game vui hơn hay dở đi.

---

# Báo cáo Session B — v0.4 gossip + nhớ qua đêm (✅ LIVE LINK CHÍNH 2026-08-09)

**✅ ĐÃ LÊN LINK CHÍNH: https://xom-dom-hong.pages.dev** (Lucas gật "A" 2026-08-09 14:12). Kiểm sống sau promote: cả Haiku lẫn DeepSeek điền `player_claim`, config mới đã lên.
**➕ Kèm yêu cầu Lucas cùng lúc: Ly (nhà Dễ) NỚI CỬA** — ngưỡng mời vào 65→55, nói hay ăn điểm đậm hơn (×1.2→×1.3); mode Kẹt Tiền của Ly cũng dễ theo (ngưỡng 55−15=40). Chỉnh đúng 1 dòng bảng điểm `config.js`, không đụng lời dặn AI.

## Xong gì — 8/8 task plan-v0.4-gossip.md, QA 6/6 pass number

| Việc | Làm ra cái gì | Số liệu |
|---|---|---|
| **T1 Spike `player_claim`** | AI mỗi lượt tự tóm "người chơi đang xưng là ai" | Haiku 10/10 · DeepSeek 8/9 · não kịch bản trả rỗng |
| **T2 Sổ tai tiếng** | Mọi cuộc gõ cửa kết thúc → CODE ghi 1 dòng sổ (`XDH.run.ledger`): đêm · nhà · lời xưng · chuyện xảy ra | 5 đường kết thúc đều ghi đúng, 0 lỗi |
| **T3 Gossip chảy ngang** | Nhà khác NGHE chuyện xấu (chỉ chuyện bị bắt quả tang — Q1): nghi khởi điểm +10/chuyện, trần +25 (1 chỗ trong config) | Kiểm sống 20→30; sạch thì không tốn token |
| **T4 NPC mở miệng đồn** | Câu chào "nghe đồn" SCRIPTED — code đảm bảo nhắc đúng 1 lần, đúng người đúng tội (prompt-only thất bại 0/10 → đổi cách) | Nhắc 10/10 · bịa tội 0/25 · nhắc lại 0/10 |
| **T5 Nhớ qua đêm** | Qua đêm: hội thoại xoá tươi NHƯNG sổ giữ + nén thành 2-3 dòng trí nhớ mỗi nhà (code-built, không tốn AI) | Ma sói + Kẹt Tiền đồng bộ, đêm sạch không đổi gì |
| **T6 Callback đêm sau** | Nhà cũ chào kiểu "Ủa hôm trước xưng là sinh viên VNUK mà?" + được THANH MINH (Q4); thắng cũ tin +10, tội cũ nghi +10 (config) | Callback 10/10 · thanh minh 3/5 gỡ ngay, 2/5 hỏi vặn rồi gỡ |
| **T7 Sửa lời** | Màn qua đêm hết nói "hàng xóm không nhớ gì đâu" → "xóm NHỚ đó nha" + thêm bản EN | 0 chuỗi cũ còn sót |
| **T8 Ma trận QA** | 6 pass number chốt trước — chạy main-thread bằng chứng thật | **6/6 ĐẠT** (chi tiết trong plan T8) |

**Triết lý giữ nguyên §1b:** CODE cầm sổ + cầm số (cộng nghi, cộng tin); AI CHỈ đọc sổ để diễn — 4 luật cấm trong prompt (đo được: 0/10 ca AI tự trừ điểm vì tin đồn sau siết).

## ⚠️ Phát sinh — đã xử trong phiên
1. **Prompt-only không ép nổi NPC đồn** (0/10) → chuyển sang câu chào scripted (đúng phương án dự phòng plan cho phép). Đổi cách, không đổi luật chơi.
2. **Vòng QA đầu: 1/10 ca chấm thấp vì tin đồn + 2/10 nhắc lại** → siết block thành 4 luật đánh số → đo lại 0/10 cả hai.
3. **Câu chào lặp tội 6 lần** (1 cuộc 6 lần nói dối) → khử trùng lặp sự kiện.
4. Wrangler dev cục bộ không chạy được compat-date 2026-08-01 → dev dùng cờ ghi đè 2026-05-28 (KHÔNG đổi file config, chỉ ảnh hưởng máy local).

## 🎯 Lucas làm tiếp
1. **Chơi preview** https://v04-gossip.xom-dom-hong.pages.dev — kịch bản hay nhất: nói dối lộ ở nhà Ly → sang nhà khác nghe đồn → qua đêm 2 quay lại nhà cũ nghe "Ủa hôm trước…".
2. Ưng thì gật → promote lên link chính (1 lệnh deploy --branch main).
3. Đọc pending.md mục "LUCAS BÁO 08-09" — lỗi trộn VN/EN + nút đổi ngôn ngữ khó thấy (cần Lucas cho biết đang chơi màn nào / chụp màn hình).

## 💰 Chi phí phiên
~60 lượt Haiku thật (spike + QA) ≈ vài nghìn đồng; block gossip/trí nhớ chỉ đính khi có chuyện → token tăng không đáng kể, vẫn xa trần $5.

## T1 SPIKE — trường `player_claim` (AI tự tóm "người chơi đang xưng là ai") — ✅ ĐẠT

**Câu hỏi spike:** não AI có điền đều tay trường mới này không? Đáp: **CÓ — đủ chuẩn ≥9/10, không cần phương án dự phòng.**

| Não | Kết quả 10 lượt kịch bản thật | Ghi chú |
|---|---|---|
| **Haiku (não chính)** | **10/10 đúng** — cả ca đổi vai ("shipper → cháu bà Tư" tóm đủ cả hai) lẫn ca chưa xưng gì (để rỗng đúng) | Chạy lặp thêm 6 lần 1 câu xưng ngắn: 2 lần trả rỗng → lượt lẻ có thể sót, sổ nên giữ "lời xưng khác rỗng gần nhất" (làm ở T2) |
| **DeepSeek (dự phòng)** | **8/9 đúng** (1 lượt call lỗi mạng → rơi xuống não kịch bản đúng thiết kế) | 1 lượt điền mô tả quần áo thay vì để rỗng → đã siết lại lời dặn |
| **Kịch bản (không AI)** | Luôn trả rỗng — đã vá để trường có mặt trong mọi phản hồi | Hợp đồng JSON đồng nhất 3 não |

- File đổi: `functions/api/converse.js` (schema tool + lời dặn DeepSeek + lọc phản hồi), `functions/api/_personas.js` (não kịch bản). **Chưa đụng file client nào** — game chạy y nguyên.
- Chạy bằng wrangler dev thật + 10 cuộc gọi API thật (không giả lập). Log: scratchpad phiên này.

---

# Báo cáo Session B — v0.3 mode "Kẹt Tiền" (2026-08-09)

**✅ ĐÃ LÊN LINK CHÍNH: https://xom-dom-hong.pages.dev** (Lucas duyệt "Live it" 2026-08-09 03:00).
Bản thử `ket-tien.xom-dom-hong.pages.dev` vẫn giữ để đối chiếu.

**Lên live cùng chuyến còn có phần của phiên v0.2 song song** (đã kiểm sống, 0 lỗi): 🚓 cảnh sát rượt 10 giây khi bị gọi công an · dấu ✅ XONG trên nhà đã đi · hàng xóm nhớ bạn khi rút lui rồi quay lại trong cùng đêm · hội thoại 3 phút → 5 phút.

> Vào link → màn hình đầu có 2 nút: 🐺 **Ma Sói** · 🙇 **Kẹt Tiền**. Bấm Kẹt Tiền rồi bắt đầu.
> Mẹo: `?debug=1` để thấy số thật từng lượt.

## Xong gì — 8 việc B1-B8 của plan-v0.3-beggar.md §2

| Việc | Làm ra cái gì | Trạng thái |
|---|---|---|
| **B1 Chọn chế độ** | 2 nút ở màn hình đầu; đoạn giới thiệu + nút bắt đầu đổi theo chế độ; bản đồ dựng lại (mặt trời thay mặt trăng, biển "Quán bánh mì — ĂN Ở ĐÂY", giấu nhà Bà Năm vì bài học đó kết thúc bằng nút CẮN) | ✅ |
| **B4 Mục tiêu bữa ăn + ví tiền** | Đầu ngày bốc ngẫu nhiên 1 trong 8 món 15k-60k, hiện ngay trên thanh trạng thái: *"🎯 Phở tái 40k · thiếu 40k"*. Xe bánh mì thành QUÁN ĂN: đủ tiền → bấm ăn → thắng ngày | ✅ |
| **B2 Điều kiện thắng mới** | Cửa mở KHÔNG còn nghĩa là cắn. Hàng xóm tin đủ → chuyển sang **"màn xin"**: họ quyết định giúp kiểu gì | ✅ |
| **B3 Kết quả + số tiền** | AI chỉ chọn **LOẠI**: tiền · đồ ăn · cả hai · mời vào ăn cơm · nhờ việc vặt · từ chối · quay lại sau. **Code cầm bảng tiền** (Ly 20-50k · Tí 10-25k · Cô Sáu 15-40k; việc vặt 30-60k nhưng mất 90 giây trong ngày). Mời cơm = thắng ngày dù 0đ | ✅ |
| **B5 Trí nhớ xuyên nhà** | Gõ càng nhiều nhà, nghi ngờ khởi điểm càng cao (+6 mỗi nhà). Từ nhà thứ 3 hàng xóm được phép buột miệng *"ủa nãy thấy cậu bên nhà kia mà?"* — nhưng CẤM lấy đó làm cớ trừ điểm | ✅ |
| **B6 Giờ vào prompt** | Ngày chạy 10 giờ sáng → 18 giờ 30. AI biết mấy giờ + "giữa trưa nhà đang ngủ" / "trời sắp tối cảnh giác hơn" | ✅ |
| **B7 Bảng tổng kết ngày** | Bảng: món cần · xin được bao nhiêu · gõ mấy nhà · ai cho nhiều nhất · **"lời nói dối buồn cười nhất"** (AI chọn trong đúng những câu bạn đã nói, không được bịa) + bình một dòng. Có nút **📸 Tải ảnh** — tự vẽ ảnh PNG để gửi bạn bè | ✅ |
| **B8 Ngày 4+ khó hơn** | Mỗi ngày sau ngày 3 cộng thêm 5 nghi ngờ khởi điểm. Hết ngày 3 hiện lời nhắc nghỉ tay (Q-B3) | ✅ |
| Q-B4 **3 câu mở gợi ý** | Hiện mờ dưới ô nhập, chỉ ngày 1 và chỉ 2 nhà đầu, bấm là gửi luôn — rồi tắt hẳn | ✅ |

**Ma sói vẫn nguyên**: kiểm lại sau khi sửa — thanh trạng thái đêm, nhà Bà Năm, nút CẮN, loot, tiệm đồ nghề chạy y như cũ; NPC vẫn bắt được lỗi "xưng shipper mà tay không". 0 lỗi trong bảng điều khiển trình duyệt.

## Ván thử thật (AI thật, máy tự chơi)

| Nhà | Kết quả |
|---|---|
| **Ly ⭐ Dễ** (ngưỡng 50) | Khen góc quay → pitch ý tưởng video → 4 câu là được **mời vào ăn cơm** = thắng ngày ngay |
| **Cô Sáu ⭐⭐⭐ Khó** (ngưỡng 70) | Nói nhỏ vì em bé ngủ → kể hoàn cảnh cụ thể → hỏi thăm bé Bin → xưng tên/quê/địa chỉ → 6 câu thì cô cho **cả tiền lẫn bánh mì** |
| **Tí ⭐⭐ Vừa** | Bịa kiến thức bóng đá sai → bị bắt bài đúng như thiết kế, không lên điểm. Chơi đúng bài thì được |

Chỉ tiêu cân bằng của plan (dễ ≈ 4 câu, khó ≈ 7 câu) — **đạt**.

## ⚠️ Phát sinh ngoài kế hoạch — 5 việc đã tự quyết, Lucas xem lại

1. **Máy chấm điểm lúc đầu keo kiệt y hệt bệnh cũ**: chơi 5 câu tử tế mà lòng tin đứng yên 30/65 — vì hàng xóm cứ đòi bằng chứng, mà người kẹt tiền thì làm gì có giấy tờ. Đã vá bằng 3 luật chống keo kiệt trong lời dặn AI (hỏi vặn xong mà trả lời được là PHẢI cộng điểm · cấm nghi 2 lượt liền chỉ vì "chưa đủ chi tiết" · hỏi tối đa 2 lần rồi thôi). Sau khi vá: 4 câu là mở.
2. **Hạ ngưỡng "muốn giúp" 15 điểm** so với ngưỡng "mời vào nhà" của ma sói (Ly 50 · Tí 60 · Cô Sáu 70). Lý do: cho 20k dễ gật hơn nhiều so với cho người lạ vào nhà lúc nửa đêm. Chỉnh ở `config.js` → `XDH.KT.THRESHOLD_DROP`.
3. **Sang ngày mới thì mất sạch tiền thừa** (đồ nghề đã mua thì vẫn giữ). Nếu để dành, ngày sau chỉ việc ra quán ăn là thắng, khỏi gõ nhà nào — hết trò. Lucas thấy phũ quá thì đổi 1 dòng.
4. **Cấm chửi thề trong lời dặn AI DÙNG CHUNG cả 2 chế độ** — đây là chỗ duy nhất mình đụng vào prompt của ma sói. Lý do: thử nghiệm bắt được Ly và Cô Sáu buột ra "mẹ kiếp", mà game này để gửi bạn bè. Không đụng gì tới luật chơi.
5. **Sửa được 1 lỗi cũ có sẵn từ v0.2**: trong 2,6 giây màn kết đang chạy, người chơi vẫn gõ thêm được một câu → engine văng lỗi. Giờ khoá ô nhập cho tới khi đóng hẳn. Lỗi này có ở CẢ mode ma sói.

## 🔍 Kiểm định (em-testing) — 8/8 việc B1-B8 ĐẠT, bắt được 1 lỗi thật

- **Lỗi đã vá ngay:** phần tính tiền thưởng vẫn dùng ngưỡng CŨ của ma sói thay vì ngưỡng đã hạ của chế độ này → hàng xóm luôn cho ở mức sàn dù bạn thuyết phục cực giỏi. Sửa xong, đo lại: lòng tin 50 → 30k · 80 → 35-40k · 95 → 45-50k. Đúng ý "tin càng cao cho càng đậm".
- **Đính chính chỗ mình nói lúc trước:** so với bản đang chạy ở link chính thì phần lời dặn AI DÙNG CHUNG đã đổi **4 chỗ**, không phải 1. Chỉ **1 chỗ là của phiên này** (cấm chửi thề). **3 chỗ còn lại là của phiên v0.2 chạy song song cùng thư mục** trong đêm: cấm bịa chứng cứ · luật "đổi vai giữa chừng" · luật "hỏi thẳng về bộ đồ kỳ lạ". Cả 3 đều là bản vá cho ma sói, không phải của mode Kẹt Tiền — nhưng nghĩa là **ma sói cần chơi lại 1 ván** để chắc máy chấm không đổi ngoài dự kiến.
- **Tiếng Việt đủ dấu:** đạt, không có chuỗi nào thiếu dấu.
- **Thước đo §5 vẫn ⚠️ CHƯA ĐO ĐƯỢC** — cả 3 vế đều cần người thật, không bịa số.

## 🎯 Lucas làm tiếp

1. Mở https://ket-tien.xom-dom-hong.pages.dev → **chơi hết 1 ngày mode Kẹt Tiền không cần trợ giúp** (đây là vế đầu của thước đo §5).
2. Bấm **📸 Tải ảnh** ở bảng tổng kết xem ảnh khoe có đẹp không.
3. Gật thì mình đẩy sang link chính; chưa gật thì cứ nằm ở link thử.
4. Hai vế còn lại của thước đo (≥5/10 bạn muốn chơi tiếp ngày 2 · ≥3 người tự chụp bảng tổng kết) **chỉ đo được bằng người thật** — cần Lucas gật mới gửi link đi.

## Kỹ thuật (đọc khi cần)
- File mới: `game/public/js/mode-ket-tien.js` (toàn bộ luật riêng của chế độ 2). Còn lại chỉ là móc nối có rẽ nhánh theo `XDH.run.mode`.
- Bảng tiền + độ khó chỉnh ở `config.js`: `XDH.MEALS`, `XDH.GIVE`, `XDH.CHORE`, `XDH.KT`.
- Lời dặn AI theo chế độ: `functions/api/_personas.js` → `SCENES.ma_soi` / `SCENES.ket_tien` (ma sói giữ nguyên văn bản cũ).
- Ảnh kiểm thử: `game/shots/v3_01…v3_12`. Deploy thử: `npx wrangler pages deploy public --project-name xom-dom-hong --branch ket-tien`.
- Đã bật khoá API cho môi trường preview (trước đó preview không có khoá → sẽ rơi về não kịch bản).

---

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
