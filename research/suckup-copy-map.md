# Suck Up! → Xóm Đóm Hòng — bản đồ SAO CHÉP (2026-08-08, Session A #4)

> Câu hỏi của Lucas: "Suck Up! làm kiểu gì, và làm sao copy hết gameplay của họ?"
> Trả lời ngắn: **chúng ta đã copy xong ~85% rồi.** File này liệt kê từng cơ chế của họ,
> đối chiếu với code đang LIVE của mình, và chỉ ra đúng phần còn thiếu.
> Nền: `research/suckup-design.md` (nghiên cứu 08-05) + kiểm chứng lại 08-08 (nguồn cuối file).

---

## 1. Cơ chế của Suck Up! — bảng đối chiếu

| # | Cơ chế Suck Up! | Họ làm sao | Mình đang có? | Ở đâu trong code |
|---|---|---|---|---|
| 1 | **Nói tự do bằng giọng/chữ, không cây thoại** | LLM server-side chấm logic + giọng điệu của câu người chơi | ✅ CÓ | `converse.js` + `/api/stt` (Whisper) |
| 2 | **Thanh Suck Up (tin tưởng)** | Hiện rõ trên màn hình | ✅ CÓ — **nhưng mình GIẤU** (cửa mở dần thay thanh số) | `config.js`, `convo.js` §1 v0.2 |
| 3 | **Nghi ngờ → khoá cửa / gọi cảnh sát / cầm vũ khí** | Nghi cao = fail nhiều kiểu | 🟡 MỘT NỬA — có nghi ngờ + đuổi, **chưa có cảnh sát/hậu quả leo thang** | parked v0.3 |
| 4 | **Hoá trang (shipper, du khách, thợ điện…)** | Đồ phải khớp lời nói, lệch = "đồ hoá trang rẻ tiền" = fail ngay | ✅ CÓ — slot đồ ảnh hưởng AI + phạt `contradiction` 1 lần/bộ đồ | `game.js` wardrobe, `_personas.js` |
| 5 | **NPC nhớ trong phiên, bắt lỗi mâu thuẫn** | Gửi cả lịch sử vào prompt | ✅ CÓ — prompt còn được dặn **trích lại nguyên văn lời cũ** | `converse.js` rule 8-13 |
| 6 | **NPC bình phẩm quần áo** | Khen/nghi theo bộ đồ | ✅ CÓ (khen đồ khớp — rule 11) | `converse.js` |
| 7 | **Mỗi NPC một tính cách + điểm yếu riêng** | 15+ NPC, đồ sai kiểu là bị đuổi thẳng | ✅ CÓ 3 NPC + **NPC tự hé lộ điểm yếu qua lời thoại** (thứ Suck Up! KHÔNG có) | `_personas.js` |
| 8 | **Giờ giấc ảnh hưởng mức cảnh giác** | Khuya = khó thuyết phục hơn | 🟡 MỘT NỬA — có chu kỳ trời/trăng, **AI chưa biết mấy giờ** | `game.js` sky; thiếu ở prompt |
| 9 | **Đạo cụ đỡ lời nói dối** (gói hàng vỡ, chuông cửa) | Vật phẩm chống lưng câu chuyện | ✅ CÓ — 4 powerup ở xe bánh mì (quà, +45s, gợi ý, đổi đồ) | shop v0.2 phase 2 |
| 10 | **NPC hàng xóm để ý nhau (Neighborhood Watch)** | Người mất tích nhiều → cả xóm cảnh giác | ❌ CHƯA — đây là **món lớn nhất còn thiếu** | parked |
| 11 | **Nhiều chế độ, chung một engine** (Classic / Love Bites / Mic Drop) | Đổi ĐIỀU KIỆN THẮNG, giữ nguyên bộ não | ❌ CHƯA — **chính là chỗ mode Ăn Xin nhét vào** | — |
| 12 | **Người chơi tự tạo NPC + chia sẻ (Workshop)** | Nội dung do cộng đồng, giữ chân lâu | ❌ CHƯA — v0.4 trở đi | — |
| 13 | **Đo token / tính tiền theo lượt** | 10.000 token ≈ 40-50h chơi | 🟡 mình đang miễn phí, chuỗi Haiku→DeepSeek→scripted | `converse.js` |

**Kết luận: còn thiếu đúng 4 món — hàng xóm để ý nhau (#10), chế độ thứ 2 (#11), giờ giấc vào prompt (#8), hậu quả leo thang (#3). Ba trong bốn món đó chính là mode Ăn Xin.**

---

## 2. Ba thứ mình đã LÀM TỐT HƠN Suck Up!

1. **Giấu hết số.** Họ hiện thanh Suck Up! → người chơi nhìn thanh, không nhìn người.
   Mình dùng cửa mở 4 nấc + bong bóng 💭 + mặt cảm xúc → phải **đọc người**.
2. **Code cầm điểm, AI chỉ phán xử** (verdict enum §1b). Suck Up! để LLM tự cho điểm →
   đổi model là gameplay hỏng, đúng thứ khiến bản 1.0 của họ bị chê (Steam 61% Mixed).
3. **NPC tự hé lộ điểm yếu.** Cô Sáu khoe bé Bin, Tí giảng bóng đá, Ly kể drama →
   người mới có manh mối. Suck Up! bắt đoán mò, nên người chơi mới hay bỏ cuộc.

## 3. Ba sai lầm của họ — KHÔNG copy

| Sai lầm | Bằng chứng | Mình chặn bằng |
|---|---|---|
| Hạ cấp model lúc 1.0 để tiết kiệm | Người chơi đòi trả lại token, review tụt xuống Mixed | Code cầm điểm → model rẻ vẫn chơi được; chất lượng lời thoại mới là chỗ tiêu tiền |
| Bug "NPC đồng ý cho vào nhưng cửa không mở" | Steam reviews | Cửa do CODE mở theo ngưỡng, không do AI tự tuyên bố |
| Lo hết token | Bản Early Access | Bản web miễn phí; giới hạn theo lượt/ngày nếu tốn, không bán token |

## 4. Vạch pháp lý (giữ nguyên từ 08-05)

Cơ chế **không được bảo hộ** — "thuyết phục NPC AI bằng giọng nói" là ý tưởng, ai cũng làm được
(Corporate Suck Up trên Steam làm công khai). **Cấm chạm:** phong cách hình ảnh, tên nhân vật,
lời thoại, nhạc, giao diện của họ. Mình đổi bối cảnh (xóm Việt), nhân vật, tên, art → an toàn.

---

## Nguồn kiểm chứng 2026-08-08
- https://store.steampowered.com/app/2726370/Suck_Up/
- https://shapes.inc/fandom/suck-up/gameplay-mechanics (thanh Suck Up, nghi ngờ → cảnh sát/vũ khí, giờ giấc, đạo cụ)
- https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/SuckUp (Neighborhood Watch, mặc đồ/tóc của hàng xóm)
- https://www.playsuckup.com/ (3 chế độ dùng chung engine)
- https://themagicrain.com/2024/04/suck-up-is-a-vampire-game-that-uses-a-i-to-interact-with-its-players/ (server chấm giọng điệu + token)
- https://knowyourmeme.com/memes/subcultures/suck-up (streamer là kênh tăng trưởng)
