# Bài học từ "Dan the Man" (Halfbrick) cho Xóm Đóm Hòng — 2026-08-12

Nguồn vào: infographic Lucas gửi (do Gemini Notebook sinh — chữ VN lỗi nhiều, đã ĐỐI CHIẾU
nguồn thật: Wikipedia, TouchArcade review 2016, Halfbrick blog, halfbrick.fandom). Số nền:
Dan the Man ~300.000 người chơi/ngày, free + quảng cáo tự nguyện, đồ mặc mở bằng vàng/vé sự kiện.

## ĂN CẮP ĐƯỢC (hợp game nói chuyện, rẻ)

1. **"Hit-stop" cho LỜI NÓI** — Dan the Man khựng hình 3-5 khung + rung màn khi đấm trúng để
   đòn có "độ nặng". XĐH: câu `danh_trung` / `lo_lieu` là "cú đấm" của mình → khựng 0,2 giây
   + rung nhẹ khung thoại TRƯỚC khi popup số bay. Thuần CSS/JS, 0đ, ~1 giờ.
2. **Sóng nhịp trong một đêm (pacing curve)** — cấu trúc màn của họ: khám phá → đấu trường
   khoá cửa → phòng bí mật thưởng → boss. XĐH đang phẳng (3 nhà ngang nhau). Bản đồ hoá:
   nhà Dễ (khởi động) → nhà Vừa (căng) → SỰ KIỆN BÍ MẬT ngẫu nhiên giữa đêm (nhặt đồ /
   nghe lỏm tin đồn — thưởng khám phá) → Cô Sáu = boss (finalTest ĐÃ có sẵn).
3. **Daily events tạo thói quen (faucet & sink)** — thử thách đổi mỗi 24h giữ D30. XĐH:
   "chuyện xóm hôm nay" — mỗi ngày thật 1 twist nhỏ (Ly mất điện thoại, Tí vừa thua độ…)
   → lý do quay lại ngày mai. AI chỉ nhận 1 dòng context, code bốc twist theo ngày.
4. **Tha chết tại checkpoint (loss aversion)** — họ bán "hồi sinh xem quảng cáo" ngay lúc tiếc
   nhất. Bản KHÔNG-quảng-cáo cho XĐH: bị công an tóm = mất cả đêm (đau nhất game) → cho 1
   "vé tha" mỗi đêm, KIẾM bằng việc vặt trước đó. Vẫn đau, nhưng có phao tự kiếm được.

## ĐANG LÀM ĐÚNG RỒI (validated, giữ nguyên tắc)

- **Verb expansion > stat padding** — họ giữ chân D7-14 bằng CƠ CHẾ mới, không phải +số.
  XĐH các bản v0.3→v0.8 toàn thêm cơ chế (gossip, công an, loot, giọng) — đúng đường.
- **Trang phục = tiến trình ngang** — đồ của họ cho buff nhẹ; đồ của XĐH đổi hẳn CÁCH chơi
  (lời khai phải khớp đồ) — còn mạnh hơn bản gốc. Đừng bao giờ biến đồ thành +chỉ số.

## BỎ QUA (chưa tới lúc)

- Quảng cáo / mua trong game — XĐH đang friend-test, chưa monetize. Ghi lại mô hình
  "quảng cáo tự nguyện đổi đồ" nếu sau này thành sản phẩm thật.
- Survival mode + leaderboard tuần — cần backend điểm + đông người chơi thật. Parked.

## Nguồn
- https://en.wikipedia.org/wiki/Dan_the_Man
- https://toucharcade.com/2016/10/20/dan-the-man-review-a-blast-while-it-lasts/
- https://www.halfbrick.com/blog/halfbrick-kicking-old-school-global-launch-dan-man
- https://halfbrick.fandom.com/wiki/Dan_the_Man
- https://blog.gamedistribution.com/dan-the-man-finds-a-new-stage-on-the-web/
