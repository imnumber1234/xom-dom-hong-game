# Kế hoạch v1.0 — HỆ NHIỆM VỤ + 2 LỐI CHƠI (Sói Hiền / Sói Dữ)

> Session A chốt 2026-08-13. Độ tin cậy kế hoạch: 92%.
> Nguồn: thiết kế "Ly thiếu gậy selfie" Lucas dán 2026-08-13 + kiểm kê toàn bộ code (Explore agent, cùng ngày).
> Đây chính là "hệ nhiệm vụ thật" đã hứa từ v0.7 (report.md:347) + món parked #3 trong pending.md (spec §22-27).

## 0. Đáp án Lucas ĐÃ KHOÁ (2026-08-13) — không hỏi lại

| # | Câu | Chốt |
|---|---|---|
| 1 | Món đồ | **B — gậy selfie** (không dùng đèn hồng) |
| 2 | Chế độ | **CHỈ ma sói**, không đụng Kẹt Tiền. **2 lối chơi: Sói Hiền (không cắn ai, làm nhiệm vụ → kết thúc riêng) vs Sói Dữ (cắn hết → thắng kiểu cũ)** |
| 3 | Đường giải | **B — cả 3 đường ngay v1**: kiếm tiền mua · mượn Tí · lục thùng rác |
| 4 | Minigame quay phim | **KHÔNG làm bây giờ** (để v1.1) |
| 5 | Popup nhiệm vụ | **Kiểu thông báo điện thoại 📱** (hợp Ly TikToker) |
| 6 | Ô theo dõi trên HUD | **Có** (giống ô 🎯 Mì Quảng của Kẹt Tiền) |
| 7 | Thưởng | **+50k + tăng tin của Ly** |
| 8 | Refresh mất tiến độ | **Chấp nhận** (game hiện không có save) |
| 9 | Ưu tiên | **Làm cái này TRƯỚC** hàng chờ sprite/nhạc |
| — | PixelLab | **Key tài khoản #4 ĐÃ LẮP** vào cấu hình MCP (9c1e75f7…). Balance API báo $0 — phiên B thử vẽ 1 hình trước khi trông cậy; hỏng thì vẽ code như cũ |

## 1. Luật thiết kế (từ bản thiết kế Lucas — giữ nguyên tinh thần)

- **Hội thoại PHÁT HIỆN vấn đề → popup XIN PHÉP → nhận thì THẾ GIỚI ĐỔI → người chơi tự chọn cách giải → NPC phản ứng kết quả.**
- AI KHÔNG cầm game: AI chỉ phát tín hiệu (nói tới đâu, gợi ý gì); CODE giữ trạng thái nhiệm vụ, tiền, đồ, thưởng — đúng triết lý §1b sẵn có.
- Ly KHÔNG tự khai. Người chơi phải lần theo mạch TikTok: nhắc TikTok → hỏi tiếp → manh mối 1 (thiếu đồ) → manh mối 2 (gậy selfie hư) → rõ chuyện (hết tiền mua) → popup.
- Từ chối KHÔNG giết mạch: Ly buồn nhẹ, nói lại chuyện cũ nếu người chơi nhắc TikTok lần sau → popup hiện lại.
- Thế giới không tự biết: Tí chỉ biết chuyện gậy khi người chơi HỎI Tí.

## 2. Kiến trúc (4 ô)

- **Dữ liệu**: `XDH.run.missions` (máy trạng thái: chưa-biết → đã-gợi → đã-mở-popup → đã-nhận → có-đồ → đã-trả → xong) + `XDH.run.items` (đồ thật, khởi đầu chỉ có `gay_selfie`) + đếm `kills` trong đêm (đã có ledger). Mất khi refresh — chấp nhận (đáp án 8).
- **Màn hình**: popup 📱 kiểu thông báo điện thoại (overlay mới `ov-mission`, theo khuôn 14 overlay sẵn có) · ô HUD 🎯 nhiệm vụ (nhân bản `hud-meal`) · thùng rác trên bản đồ (3 cái, vẽ code — khuôn "4 chỗ sửa" của game.js) · màn kết Sói Hiền mới.
- **Luật**: CODE chấm mạch TikTok bằng tín hiệu AI + ngưỡng quan tâm; CODE giữ bảng loot thùng rác; CODE xét điều kiện Tí cho mượn (tin Tí ≥ ngưỡng); CODE trả thưởng 50k + tin.
- **Nối ngoài**: thêm 1 trường tín hiệu vào bộ JSON AI trả về (`mission_signal`) — phải sửa Ở CẢ 4 chỗ ghi chú schema trong converse.js, và thêm khối nhiệm vụ vào thẻ Ly trong _personas.js (có chốt chặn: chưa đủ quan tâm thì CẤM khai).

## 3. Ba đường giải (v1)

| Đường | Cách chơi | Cần xây |
|---|---|---|
| 💰 Kiếm tiền | Việc vặt qua hội thoại với hàng xóm (+20-40k/lần, giới hạn 2 lần/nhà/đêm) + tiền lẻ trong rác → mua **gậy selfie 80k** ở xe bánh mì | Món mới trong SHOP + đường việc-vặt cho chế độ ma sói (mượn khuôn outcome của Kẹt Tiền, KHÔNG đụng file Kẹt Tiền) |
| 🤝 Mượn Tí | Hỏi Tí về gậy selfie (chỉ khi đã nhận nhiệm vụ) → Tí cho mượn nếu tin ≥ ngưỡng, chưa đủ thì Tí ra điều kiện | Khối "đồ của tôi" trong thẻ Tí + tín hiệu cho-mượn + CODE xét tin |
| 🗑️ Lục rác | 3 thùng rác, mỗi thùng lục 1 lần/đêm: 50% đồ vứt đi (câu hài) · 30% tiền lẻ 5-10k · 15% đồ ăn · **5% gậy selfie** | Vật thể mới trên bản đồ + bảng loot trong config (hệ rác dùng lại được cho nhiệm vụ sau) |

## 4. Hai lối chơi (đáp án 2)

- **🐺 Sói Dữ**: y nguyên luật cũ — dụ vào nhà, cắn đủ → thắng. KHÔNG đổi một chữ.
- **😇 Sói Hiền**: qua đêm với **0 cú cắn** + hoàn thành nhiệm vụ Ly → màn kết mới "SÓI HIỀN — xóm nhận nuôi" (vẽ code 8-bit, khuôn màn đồn công an). Đêm chưa xong nhiệm vụ mà 0 cắn = đêm trôi bình thường, không thua.
- v1 chỉ cần 1 nhiệm vụ (Ly) để lối Hiền có thật; các đêm sau thêm nhiệm vụ Tí/Cô Sáu (v1.1+).

## 5. Thi công — 5 chặng (1 vòng lặp Terminal B)

1. **C1 Nền**: `git pull` trước · máy trạng thái nhiệm vụ + túi đồ + đếm cắn · trường `mission_signal` (4 chỗ schema) · khối nhiệm vụ thẻ Ly có chốt chặn (quan tâm ≥ 60 mới được khai manh mối, mỗi manh mối cách ≥ 2 lượt).
2. **C2 Giao diện**: popup 📱 CÓ/KHÔNG · ô HUD 🎯 · toast "nhiệm vụ mới" (thêm vào POP_EVENT) · Ly đổi dáng chờ (câu than thở khi quay lại).
3. **C3 Ba đường giải** (bảng mục 3).
4. **C4 Trả đồ + thưởng + màn kết Sói Hiền**: mang gậy tới Ly → cảnh vui mừng (khuôn cảm xúc sẵn) → +50k + tin · kết Hiền khi đủ điều kiện.
5. **C5 Kiểm + đưa lên link thử**: bộ test máy (khuôn check-20/console-check) + Playwright đi đủ 3 đường bằng cờ debug `?mission=test` · đẩy **link thử riêng** (nhánh nhiem-vu) — KHÔNG live.

## 6. Số đậu (pass number)

1. Người chơi mới: nhắc TikTok → moi ra chuyện gậy trong ≤ 8 lượt nói (AI không tự khai trước khi quan tâm ≥ 60).
2. Cả 3 đường giải đều đi được tới cùng (máy kiểm bằng cờ debug).
3. Kết Sói Hiền hiện đúng khi 0 cắn + nhiệm vụ xong; lối Sói Dữ chạy y hệt bản live (kiểm hồi quy 20 ván máy).
4. 0 lỗi console mới; Kẹt Tiền không đổi 1 dòng hành vi.
5. Từ chối nhiệm vụ → nhắc lại TikTok → popup hiện lại được.

## 7. Rủi ro đã thấy trước

- **AI khai sớm** → chốt chặn 2 lớp: prompt CẤM + code chặn tín hiệu khi quan tâm < 60 (bài học "đồng ý mồm" 08-09: prompt không đủ, code phải giữ cửa).
- **Sửa schema thiếu chỗ** → converse.js có 4 chỗ ghi chú schema phải khớp (kiểm kê đã đánh dấu).
- **Đụng file dùng chung** (`SYSTEM_TEMPLATE`, `converse.js`) → git pull trước, chỉ THÊM khối, không sửa luật cũ.
- **PixelLab $0** → mọi hình v1 vẽ code trước; PixelLab chỉ là nâng cấp sau.
- **Tiền việc-vặt phá cân bằng** → trần 2 việc/nhà/đêm, tổng ≤ 120k/đêm.

## 8. Prompt Terminal B (dán vào phiên MỚI)

/loop Đọc "GitHub/Xom Nay Kho Lam/plan-v1.0-nhiem-vu.md" rồi thi công đủ 5 chặng C1→C5 (hệ nhiệm vụ Ly gậy selfie + 2 lối Sói Hiền/Sói Dữ) cho Xóm Đóm Hồng. Tự duyệt từng bước, không hỏi giữa chừng; câu hỏi mới ghi vào pending.md. git pull trước khi đụng converse.js/_personas.js. KHÔNG đụng hành vi Kẹt Tiền, KHÔNG đẩy link chính — chỉ đẩy link thử nhánh nhiem-vu rồi ghi report.md + pending.md. Chạy đủ bộ kiểm mục 6 (5 số đậu) bằng máy trước khi kết thúc.
