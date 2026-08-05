# Báo cáo Session B — MVP v0.1 "Xóm Đóm Hòng" (2026-08-05)

## ✅ Đã xong — chơi được ngay

**Link xem thử: https://xom-dom-hong.pages.dev** (mở bằng Chrome, cho phép micro)

| Mảnh | Trạng thái |
|---|---|
| Xóm đêm trăng (Phaser 3): 3 nhà + tủ đồ + xe bánh mì, đi WASD / nút chạm điện thoại | ✅ chạy |
| Mic → chữ hiện trên màn hình → gửi hàng xóm (Web Speech, tiếng Việt) + gõ phím dự phòng | ✅ chạy |
| 3 hàng xóm: Cô Sáu (bỉm sữa) · Tí (mê bóng đá, CLB random mỗi đêm) · Ly (Gen Z TikTok) | ✅ chạy |
| Não AI trả lời + chấm điểm tin/nghi/kiên nhẫn, đổi mặt theo cảm xúc (5 mặt pixel) | ✅ chạy |
| Luật thắng/thua 100% trong code game (tin ≥75 & nghi <60 & AI muốn mời → mở cửa) | ✅ đúng plan |
| Blip beep kiểu Undertale khi chữ chạy (mỗi người một tông giọng) — KHÔNG giọng nói | ✅ đúng ý Lucas |
| Đổi đồ mới được gõ lại nhà đã bị nghi · 3 nhà thắng đêm · hết 3 phút = thua | ✅ chạy |
| Màn điểm cuối đêm: số nhà, vào nhanh nhất, câu bị nghi nhất, bộ đồ đỉnh nhất | ✅ chạy |

Ví dụ thật từ bản live (test bằng máy): người chơi xưng "cháu cô Bảy" khi đang mặc đồ sinh viên cầm trà sữa → Cô Sáu: *"Cô nhớ cô Bảy sống một mình với mấy con mèo, đâu có thấy đứa cháu nào ra vô bao giờ đâu nè"* — bắt bài, cộng nghi, trừ tin. Đúng chất game.

## ⚠️ VẤN ĐỀ MỚI phát sinh (không có trong plan) — Lucas cần biết

1. **Claude Haiku bị chặn từ máy chủ Cloudflare châu Á.** Người chơi ở VN đi qua trạm Hong Kong của Cloudflare — Anthropic từ chối (lỗi 403). Chìa khoá API vẫn tốt (test từ máy nhà thì chạy).
   → **Đã xử lý:** xếp hàng 3 não — Haiku (nếu qua được) → DeepSeek (chạy tốt từ châu Á, đang là não chính thực tế, tiếng Việt khá ổn) → kịch bản có sẵn (không bao giờ chết hẳn).
   → **Lựa chọn cho Lucas sau này:** dựng "AI Gateway" của Cloudflare (~10 phút trên dashboard) để mở lại đường cho Haiku — chất lượng hài Haiku là thứ mình muốn giữ theo bài học Suck Up!. Chưa gấp: DeepSeek đang diễn ổn.
2. **iPhone/Zalo in-app:** Web Speech trên Safari iPhone hoạt động một phần; webview Zalo có thể chặn mic. Game vẫn chơi được bằng gõ chữ. Khi gửi bạn bè: dặn "mở bằng Chrome/Safari".
3. **Ảnh chân dung NPC** đang là pixel art vẽ bằng code (5 cảm xúc/người, nhìn ổn nhưng đơn giản). Nâng cấp bằng nano-banana đã xếp hàng ở pending.md — đổi được mà không đụng code game.
4. **Thỉnh thoảng 1 câu rơi về kịch bản có sẵn** (khi cả 2 não AI chậm/lỗi cùng lúc) — người chơi khó nhận ra, nhưng có thật (gặp 1 lần trong test). Theo dõi thêm khi bạn bè chơi.

## 💰 Chi phí
- DeepSeek: ~1.500 token vào + ~200 ra mỗi lượt nói ≈ **dưới 30đ/lượt** — cả đợt test bạn bè vẫn xa mức $5.
- Haiku chỉ tính tiền khi gọi thành công (hiện bị 403 nên gần như $0).

## 🎯 Việc Lucas quyết (không gấp, game vẫn chạy)
1. **Chốt chính tả tên game:** "Xóm Đóm Hòng" — đúng như vầy chưa? (1 dòng chữ, đổi 10 giây)
2. **Gửi link cho bạn bè chưa?** Plan nói: Lucas chơi thử OK trước → mới gửi. Số đạt: ≥10 bạn chơi đủ 3 nhà trong 2 tuần, ≥7/10 nói "chơi nữa".
3. **Có dựng AI Gateway để lấy lại Haiku không?** (cần Lucas vào Cloudflare dashboard ~10 phút, hướng dẫn sẵn khi cần)

## Kỹ thuật (đọc khi cần)
- Code: `GitHub/Xom Nay Kho Lam/game/` — public/ (Phaser client) + functions/api/ (Cloudflare Pages Functions).
- Chìa khoá API chỉ nằm ở secret server (đã kiểm tra bundle client sạch). `.dev.vars` không vào git.
- Preview mở tự do (đúng luật "preview open access"), có ô mật khẩu nhưng đang để trống (chưa bật GAME_PASS).
- Ảnh màn hình test: `game/shots/`. Commit: `c1fd56e` nhánh `nhac-khach-v2`.
