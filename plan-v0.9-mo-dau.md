# Kế hoạch v0.9 — MÀN MỞ ĐẦU có hồn (Session A 2026-08-12)

> Lucas: "màn đầu quá đơn giản, người chơi không biết vì sao mình phải làm chuyện này —
> nghiên cứu cách game khác mở màn, thêm hoạt cảnh / câu chuyện."
> Trạng thái: 🟡 BLOCKED — chờ Lucas trả lời 7 câu ở mục 4. Tin cậy kế hoạch: 90%.

## 0. Đã làm NGAY trong phiên này (không cần chờ)

Link thử: **https://cham-dat.xom-dom-hong.pages.dev** (link chính CHƯA đụng)
- ✅ **BẢN THÍ NGHIỆM mức B đã CHẠY THẬT trên link thử** (làm theo đề xuất mặc định, Lucas chơi
  thử rồi trả lời 7 câu vẫn kịp chỉnh): màn hình sống (bỏ tấm che đen, tựa game pixel to nổi
  trên xóm đêm đang chạy) + 2 thẻ chế độ có hình và dòng "chơi để làm gì" + truyện mở 4 khung
  VI/EN theo từng chế độ (bấm-để-qua, Bỏ qua luôn có, chỉ hiện lần đầu — `?story=1` xem lại)
  + ẩn ô mật khẩu (`?pass=1` hiện lại). Kiểm máy 6/6: mật khẩu ẩn · truyện hiện lần đầu ·
  hết truyện vào xóm · lần 2 không hiện · `?story=1` ép xem · Bỏ qua chạy. 0 lỗi console mới.
  → Terminal B chỉ còn: B3 (sói attract mode tự đi lại) + chỉnh theo đáp án 7 câu + nhạc (Q3).
- ✅ Nhà hết lơ lửng: hạ đường chân trời 300→240, neo ĐÁY nhà xuống mặt cỏ (origin 0.5,1),
  dời theo: nhãn nhà, thẻ ✅ XONG, đèn neon Ly, quả bóng Tí, dây phơi Cô Sáu, mắt sau rèm.
- ✅ Tủ đồ MỞ HẾT từ đầu: `XDH.WARDROBE_LOCK.ALL_OPEN = true` (config.js) — đảo quyết định
  khoá của v0.6 F3.1. Loot khi hết đồ tự đền 25k (code sẵn có, không sửa gì thêm).
  Muốn khoá lại: đổi 1 chữ `true` → `false`.
- ✅ Đồ mặc THẤY được trên bản đồ: sói giờ vẽ cả nón (bảo hiểm / nón lá) + đồ cầm tay
  (trà sữa, rau, thẻ SV, đơn hàng, tin nhắn) — trước đây chỉ đổi màu 6 pixel áo.
- Kiểm: Playwright chụp 4 ảnh, 0 lỗi console mới (7 lỗi 404 miệng-nhép Cô Sáu là nợ cũ,
  PixelLab trial cạn — xem câu hỏi Q4).

## 1. Nghiên cứu — game khác mở màn thế nào

Nguồn: Washington Post (best title screens) · Golden Krone Hotel devlog · GDKeys onboarding ·
All That's Epic + Inviox (vì sao người chơi bỏ trong 10 phút đầu) · Steam/TV Tropes (Suck Up!).

| Nguyên tắc | Nghĩa là gì cho Xóm Đóm Hòng |
|---|---|
| **Time to First Fun** — càng nhanh tới cú vui đầu càng giữ được người | Mở đầu ≤ 20-30 giây, LUÔN bỏ qua được, chỉ hiện lần đầu |
| **Cắt cảnh dài không tua = lý do bỏ game #1** | Không làm phim; làm 4 khung truyện bấm-để-qua |
| **Attract mode** — màn tựa game phải SỐNG, thấy thế giới phía sau | Xóm đêm + đom đóm ĐÃ đẹp sẵn — bỏ tấm che đen đi, cho tựa game nổi trên xóm đang sống |
| **Suck Up! mở màn bằng truyện ngắn**: ma cà rồng đói + luật "phải được mời" | Mình thiếu đúng miếng này — người chơi chưa từng được kể VÌ SAO phải gõ cửa |
| **Dạy trong lúc chơi, không dạy ở màn đầu** | Đã có Bà Năm + NPC dẫn dắt — màn đầu KHÔNG cần thêm hướng dẫn, chỉ cần LÝ DO |

## 2. Ba mức làm — Lucas chọn 1 (Q1)

| Mức | Gồm những gì | Công | Ăn thua | Dài hạn |
|---|---|---|---|---|
| A — Màn hình sống | Bỏ tấm che đen; tựa game pixel TO nổi trên xóm đêm thật (đom đóm bay, trăng lên, sói tự đi qua lại kiểu attract mode); 2 thẻ chế độ CÓ HÌNH thay nút chữ; ẩn ô mật khẩu | ~nửa ngày | 80% | ✔ nền cho mọi mức sau |
| **B — A + truyện mở 4 khung (ĐỀ XUẤT)** | Lần đầu bấm BẮT ĐẦU → 4 khung truyện 8-bit (~15-20s, bấm để qua, Bỏ qua luôn có): ① trăng tròn — bạn hoá sói ② nhưng bụng đói mà tủ lạnh trống ③ luật xóm: sói KHÔNG vào được nhà nếu không được MỜI ④ vậy thì… mặc đồ giả dạng, gõ cửa, NÓI cho hay. Ghép từ tài sản sẵn có (sky, nhà, sói, chân dung) + chữ + hiệu ứng | ~1 ngày | 90% | ✔ trả lời đúng "vì sao tôi làm việc này" |
| C — B + phim thật | Sói biến hình từng khung hình, logo animation, nhạc chiptune riêng | 2-3 ngày + credits PixelLab | 95% nhưng lãi thêm ít | ✖ để SAU friend test |

Vì sao B: nghiên cứu nói cắt cảnh dài giết game, nhưng "không biết mình là ai/vì sao" cũng giết game.
4 khung bấm-qua là điểm giữa: có câu chuyện, không cướp thời gian, 0đ tiền API.

## 3. Việc làm cụ thể của mức B (cho Terminal B)

| # | Việc | Ghi chú |
|---|---|---|
| B1 | Bỏ lớp che tối ở màn đầu, cho canvas xóm chạy phía sau panel | panel thu nhỏ, dời xuống |
| B2 | Tựa game chữ pixel to + trăng tròn phía sau, nhún nhẹ | vẽ CSS/canvas, không cần ảnh mới |
| B3 | Attract mode: sói tự đi qua lại + gõ 1 cửa ngẫu nhiên khi chưa bấm gì 10s | tắt khi bấm |
| B4 | 2 thẻ chế độ có hình (sói / ví rỗng) + 1 dòng mô tả mỗi thẻ | thay 2 nút chữ |
| B5 | Truyện mở 4 khung (VI + EN), localStorage `xdh_intro_seen`, nút Bỏ qua, chỉ lần đầu | mỗi khung 1 ảnh + 1-2 câu |
| B6 | Ẩn ô mật khẩu khi GAME_PASS đang tắt | pending cũ đã ghi |
| B7 | Kiểm: Playwright chụp từng khung + đo "mở web → vào được xóm" ≤ 30s khi bỏ qua truyện, ≤ 50s khi xem hết | pass number bên dưới |

**Pass number:** ① người mới mở link, KHÔNG ai giải thích, sau 30 giây nói được
"tôi là sói · phải được MỜI mới vào · đi lừa hàng xóm" (bài kiểm 30 giây trong pending #1 —
giờ có truyện mở nên phải đạt) ② bấm Bỏ qua thì vào xóm dưới 5 giây ③ 0 lỗi console mới.

## 4. BẢY câu hỏi — trả lời một lần rồi Terminal B chạy không hỏi lại

1. **Mức nào: A / B (đề xuất) / C?**
2. **Giọng truyện mở:** hài tự trào kiểu "sói lịch sự sợ phạm luật xóm" (đề xuất — đúng tông
   game) hay nghiêm túc rùng rợn nhẹ?
3. **Nhạc mở màn:** thêm 1 đoạn chiptune lặp ở màn đầu không? (web chỉ phát được tiếng SAU
   cú bấm đầu tiên — sẽ phát từ lúc chọn ngôn ngữ). Đề xuất: có, nhạc miễn phí CC0.
4. **PixelLab hết lượt trial.** Nạp không? Nạp thì được: 4 khung truyện vẽ xịn + bộ sprite sói
   mặc đồ 8 hướng + 7 ảnh miệng nhép Cô Sáu còn thiếu (đang 404 mỗi ván). Không nạp: ghép
   từ tài sản sẵn có + vẽ code — vẫn ổn, ít chi tiết hơn. (Không nạp = mặc định.)
5. **Tủ đồ mở hết đã làm theo lệnh** — nhưng nó đảo thiết kế v0.6 "loot mở đồ = cảm giác sưu
   tầm" mà Lucas từng duyệt. Giữ mở hết (mặc định) hay chỉ mở hết ở đêm 1 rồi món xịn
   (3 món giấy tờ) vẫn phải loot?
6. **Sói mặc đồ — mức hình:** (a) như hôm nay — pixel 16×16 có nón + đồ cầm tay (XONG rồi),
   (b) vẽ lại sói 32×32 chi tiết gấp đôi bằng code ~1 buổi (đề xuất nếu không nạp PixelLab),
   (c) PixelLab sinh sprite mặc đồ thật (cần Q4 = nạp).
7. **2 fix hôm nay lên link chính luôn không?** (cham-dat đã kiểm 4 ảnh + 0 lỗi mới; gật là đẩy.)

Im lặng quá 1 ngày = áp dụng toàn bộ đề xuất (B · hài · có nhạc · không nạp · giữ mở hết · b · chờ gật riêng câu 7).

## 5. Prompt Terminal B (dán vào phiên MỚI sau khi trả lời)

/goal Đọc "GitHub/Xom Nay Kho Lam/plan-v0.9-mo-dau.md" mục 3 + đáp án Lucas trong pending.md.
Build mức đã chốt (B1-B7 nếu là mức B) cho màn mở đầu Xóm Đóm Hòng: màn hình sống + truyện mở
4 khung VI/EN bấm-để-qua chỉ hiện lần đầu + thẻ chế độ có hình + ẩn ô mật khẩu. Không đụng
luật chơi, không đụng lời dặn AI. Kiểm bằng Playwright theo pass number mục 3, đẩy lên preview
branch "mo-dau", KHÔNG đụng link chính. Xong cập nhật report.md + pending.md.
