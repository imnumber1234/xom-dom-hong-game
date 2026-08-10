# Kế hoạch v0.8 — LÀM CHO GAME NHÌN ĐẸP

> Ngày lập: 2026-08-10 · Trạng thái: **CHỜ LUCAS CHỐT 3 CÂU** (mục 6)
> Look book + bản mẫu bấm được: `E:\Desktop\Xom Dom Hong Look Book\index.html` và `mockup.html`

---

## 1. Kết luận một dòng

**Không cần mua gì để game đẹp hơn gấp 5 lần.** Game này là game *nói chuyện* — 90% là nền + chân dung nhân vật + ô chữ, gần như không có hoạt hình. Đó đúng là phần mà công cụ vẽ miễn phí làm **tốt**. Phần nó làm dở (sprite đi bộ, khung hoạt hình) thì game này gần như không dùng.

## 2. Đã thử thật (2026-08-10)

| Thứ | Kết quả | Ghi chú |
|---|---|---|
| nano-banana MCP | ❌ HỎNG | gọi model `gemini-2.5-flash-image-preview` Google đã tắt (404) |
| GEMINI_API_KEY trực tiếp | ❌ CHẶN | key hợp lệ, thấy model mới, nhưng hạn mức ảnh miễn phí = **0** → 429 |
| Higgsfield | ❌ 0 credit | gói free |
| Godot 4.7 + cầu nối MCP | ✅ CHẠY | tạo project + scene + node bằng lệnh, không bấm chuột. Bằng chứng: `E:\Desktop\Game Art Test\godot-proof` |
| **Endpoint ảnh miễn phí, không cần key** | ✅ **CHẠY** | đã tạo toàn bộ ảnh trong look book, 0đ |

**Giới hạn thật đã đo:** công cụ miễn phí **không chịu** vẽ pixel art thật (thử 4 kiểu prompt, luôn ra tranh sơn dầu mềm). Nó cũng bỏ qua tuổi nhân vật (xin Cô Sáu 60 tuổi → ra ~30). Ảnh nền và chân dung thì rất tốt.

## 3. Bốn hướng nhìn đã dựng thử

| Hướng | Được | Không được |
|---|---|---|
| **A · HD-2D vẽ tay kiểu pixel** (Octopath, Eastward) | ✅ đẹp nhất, hợp đom đóm + đèn dầu, vẫn ra chất *game* | — |
| B · Pixel 8/16-bit thật | — | ❌ công cụ miễn phí không làm được, phải mua PixelLab |
| C · Vẽ tay ấm cúng (Night in the Woods) | ✅ mềm, dễ thương | ⚠️ trôi thành "làng anime ban đêm", không ra chất Việt |
| D · Tranh Đông Hồ | ✅ độc nhất, chưa ai làm | ⚠️ máy chỉ hiểu một nửa, chỏi với cảnh đêm |

## 4. Game tham chiếu (đã tra)

- **Suck Up!** — bản gốc của thể loại. Đồ hoạ đơn giản cố ý → chứng minh không cần đẹp mới bán được, nhưng cũng là chỗ mình thắng được.
- **Coffee Talk / Coffee Talk Tokyo (2026)** — bố cục đúng cái nên chép: một nền đẹp + chân dung to + ô chữ.
- **VA-11 HALL-A** — một màn hình đẹp hơn mười màn xấu.
- **Ace Attorney** — mỗi nhân vật 3 sắc mặt, đổi theo điểm nghi ngờ. Nâng cảm giác cực mạnh chỉ với 9 tấm ảnh.
- **Pixel Agents** (Fast Company, Inc.) · **Meet Claude** (Steam) — đường phát hành còn mở.

## 5. Việc phải làm

1. **Chốt hướng nhìn** (A / C / D) — mọi việc sau phụ thuộc câu này.
2. **Làm bộ ảnh**: 3 nền nhà + 1 nền bản đồ + 3 nhân vật × 3 sắc mặt (bình thường / nghi ngờ / tin bạn) = 13 tấm. Miễn phí, khoảng 1 tiếng thử đi thử lại.
3. **Dựng lại màn hội thoại** theo bản mẫu: nền tràn màn hình, chân dung to bên trái đổi theo sắc mặt, ô chữ viền vàng, chữ chạy từng ký tự, đom đóm bay, thanh nghi ngờ chạy thật.
4. **Dựng lại màn bản đồ**: nền vẽ, giữ nguyên nhãn nhà + sao độ khó ở trên.
5. **KHÔNG đụng luật chơi**: máy chấm, điều kiện thắng, não AI, hướng dẫn 4 bước, cả hai chế độ. Đây là sơn lại, không phải mổ.
6. **Kiểm tra**: chạy lại bộ 66 mục cũ, ảnh nén dưới ~200KB/tấm, điện thoại 4G tải dưới 3 giây.
7. **Đẩy lên PREVIEW**, không đụng link chính. Lucas xem rồi mới gật.

## 6. Ba câu CHỜ LUCAS

1. **Chọn hướng nhìn nào?** A (HD-2D vẽ tay — đề xuất) / C (ấm cúng) / D (Đông Hồ).
2. **Chân dung mặt thật hay mặt hoạt hình?** Công cụ miễn phí ra mặt vẽ bán-thật (xem Ly). Đẹp hơn nhưng chỏi với xóm pixel dễ thương. Phải chọn một thế giới.
3. **Dừng ở 0đ hay bật thêm bản dùng thử PixelLab?** Bản thử 20 credit, không cần thẻ, nhưng đăng ký là tài khoản của Lucas.

## 7. Số đạt (biết là xong)

- Bộ 66 mục cũ vẫn đạt 66/66, 0 lỗi console.
- Điện thoại 4G tải dưới 3 giây.
- **4/5 người bạn nói "nhìn đẹp hơn"** khi so cũ với mới cạnh nhau.

## 8. Tiền — nếu sau này cần

| Giai đoạn | Tiền | Mua gì |
|---|---|---|
| 1 (tuần này) | **0đ** | Không mua gì |
| 2 (nếu bạn bè khen, muốn làm thêm) | ~$12/tháng + $19.99 một lần | PixelLab (pixel art thật + hoạt hình, cắm thẳng vào Claude) + Aseprite (sửa tay) |
| 3 (nếu game ra tiền / cần một phong cách riêng) | ~$45/tháng | Scenario Pro — dạy máy vẽ theo phong cách của mình, hết cảnh nhân vật đổi mặt liên tục |
| Video giới thiệu | ~$8/tháng, chỉ tuần ra mắt | Kling |
