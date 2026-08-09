# PLAN v0.3 — Mode "Kẹt Tiền" (mode ăn xin) — ✅ ĐÃ CHỐT 2026-08-08

> **Lucas chốt 2026-08-08: phương án A** — giữ ma sói, thêm "Kẹt Tiền" làm chế độ thứ 2 dùng
> chung engine. Q-B1…Q-B4 Lucas không đổi ⇒ **mặc định áp dụng** (đổi khung sang "kẹt tiền" ·
> giữ 3 NPC · giới hạn mềm 3 ngày/phiên · có 3 câu mở gợi ý rồi tắt sau 2 nhà).
> Confidence: 91%.
> Trạng thái: 🟢 SẴN SÀNG cho Session B (xếp sau v0.2 phase 3 — xem §4).
> Nguồn: đề bài dài của Lucas 2026-08-08 + `research/suckup-copy-map.md` + engine đang LIVE (plan-v0.2 §1b, §2b, phase 0-2).
> Nguyên tắc: **KHÔNG viết engine mới.** Mode này = đổi ĐIỀU KIỆN THẮNG trên đúng bộ não hội thoại đã chạy.
> Confidence bản nháp: 88% (chưa đủ 90% vì còn 1 quyết định phạm vi + 4 câu hỏi cho Lucas ở §6).

---

## 0. Quyết định phạm vi — CHỈ LUCAS ĐƯỢC CHỐT (chặn mọi thứ phía dưới)

Lucas viết: "Beggar nên là MVP thật." Nhưng plan v0.2 đã chốt ma sói trước, và **phase 0-2 đã LIVE + test xong**
(engine tin tưởng, 3 nhà 3 độ khó, phản hồi ẩn số, chu kỳ trời, tiền/loot/shop).

| Phương án | Nghĩa là gì | Được | Mất | Ước lượng |
|---|---|---|---|---|
| **A — Mode 2 dùng chung engine (đề xuất)** | Giữ ma sói, thêm "Kẹt Tiền" làm chế độ chọn ở màn hình đầu | Không vứt 3 phase đã ship; 2 chế độ = gấp đôi loại clip cho streamer (Suck Up! cũng làm y vậy: Classic / Love Bites / Mic Drop) | Màn hình đầu thêm 1 lựa chọn | ~1 phiên build |
| B — Ăn xin thay hẳn ma sói | Bỏ ma sói, cảnh giết, loot | Chủ đề gần đời hơn, không cần dựng bối cảnh giả tưởng | Vứt phase 2 (tiền/loot/cảnh giết đang chạy); mất cú "cửa mở" — cao trào mạnh nhất | ~1.5 phiên + xoá việc đã làm |
| C — Ăn xin trước, ma sói tạm ngưng | Ma sói giữ nguyên trong code, ẩn nút | Thử nhanh chủ đề mới, không xoá gì | Người chơi thử thấy nửa vời | ~1 phiên |

**Đề xuất: A.** Lý do: hai chế độ dùng chung ~90% code (prompt, chấm điểm, cửa, đồ, STT, shop),
nên chi phí thêm chế độ là RẺ nhất trong mọi việc còn lại của dự án — mà nó lại là món Suck Up!
dùng để kéo dài tuổi thọ game.

## 0b. Rủi ro giọng điệu — đổi khung "ăn xin" thành "kẹt tiền"

Chơi vai người ăn xin đi lừa tiền hàng xóm là chuyện có thật ngoài đời, dễ bị đọc thành cười trên
cái nghèo. Suck Up! né được vì ma cà rồng là chuyện giả tưởng.
**Đề xuất giữ nguyên 100% gameplay, chỉ đổi khung:** người chơi là **sinh viên/khách lỡ đường bị
kẹt ở xóm lạ, hết tiền, hết pin điện thoại**. Vẫn gõ cửa, vẫn nói dối, vẫn xin tiền/xin ăn — nhưng
là tình huống ai cũng từng sợ, không phải nghề nghiệp. Nói dối cũng tự nhiên hơn.
→ Đây là quyết định sản phẩm/giọng điệu, Lucas chốt (Q-B1).

---

## 1. Tám câu Lucas hỏi — đề xuất chốt

| # | Câu hỏi | Đề xuất | Vì sao |
|---|---|---|---|
| 1 | Thắng nghĩa là gì? | **Đủ tiền mua bữa ăn trước khi hết ngày.** Không đồng hồ đói, không tiền trọ | 1 mục tiêu duy nhất thì đọc trong 2 giây; thanh đói ẩn = phạt vô hình, người chơi ức chế |
| 2 | Cần bao nhiêu tiền? | **Ngẫu nhiên theo ngày, 15k-60k**, hiện ngay đầu ngày ("Hôm nay: Phở — 40.000₫") | Chặn học vẹt lộ trình; số nhỏ thì lời xin nghe thật (xin 20k dễ tin hơn xin 500k) |
| 3 | Được nói dối tuỳ ý? | **CÓ — đã chạy sẵn.** Engine hiện tại đã bắt mâu thuẫn + trích lại nguyên văn lời cũ | Không tốn công build |
| 4 | Chọn sẵn lý lịch? | **Không có menu lý lịch** — chỉ chọn quần áo/đồ mang theo, như Lucas sửa. **NHƯNG:** 2 nhà đầu của ngày 1 hiện 3 câu mở gợi ý mờ dưới ô nhập | Ô chữ trắng tinh là chỗ người mới bỏ cuộc nhiều nhất ở game nói tự do. Sau nhà thứ 2 thì tắt hẳn |
| 5 | Cho đồ ăn thay tiền? | **CÓ.** Kết quả một lượt = enum: `tiền` · `đồ ăn` · `cả hai` · `mời vào ăn cơm` · `nhờ làm việc vặt` · `từ chối` · `bảo quay lại sau` | Phần thưởng đổi kiểu = máy kể chuyện; "mời vô ăn cơm" phải thắng luôn dù 0₫ |
| 6 | Một ván dài bao lâu? | **Một ngày ≈ 10-15 phút, chơi vô hạn ngày nối ngày.** Nhưng ngày 4 trở đi tăng khó (xóm bắt đầu nhớ mặt) | Vô hạn mà không tăng khó thì nhạt sau ngày 2; và mỗi lượt nói chuyện đều tốn tiền API — xem Q-B3 |
| 7 | Có đếm ngày/đêm? | **CÓ — dùng lại đồng hồ trời đã build.** Mặt trời thay mặt trăng, hoàng hôn = hết giờ. Nói chuyện dài thì trời trôi nhanh hơn | Code đã có, đổi màu là xong |
| 8 | Giọng điệu? | **NPC nghiêm túc, tình huống lố.** Đúng như Lucas nói, và 3 persona hiện tại đã viết theo hướng này | Hài đến từ việc NPC xử lý nghiêm túc lời nói dối điên rồ |

## 2. Việc phải build thật (ngoài những gì đã có)

| Việc | Mô tả | Mức |
|---|---|---|
| B1. Chọn chế độ ở màn hình đầu | 🐺 Ma Sói · 🙇 Kẹt Tiền | nhỏ |
| B2. Đổi điều kiện thắng | Cửa mở → **không giết** mà chuyển sang "màn xin": AI quyết `outcome` + số tiền | vừa |
| B3. Schema thêm `outcome` + `amount` | Code cầm bảng số tiền theo verdict (giống §1b), AI chỉ chọn loại kết quả | vừa |
| B4. Mục tiêu bữa ăn + ví tiền | HUD: món hôm nay + số tiền đang có; quán ăn = xe bánh mì có sẵn | nhỏ |
| B5. Trí nhớ xuyên nhà (món #10 của Suck Up!) | Nhà sau có thể nhắc "hình như nãy thấy cậu bên kia" → nghi ngờ khởi điểm cao hơn. **Chỉ cần 1 biến đếm số nhà đã gõ, nhét vào prompt** | vừa |
| B6. Giờ vào prompt | AI biết đang mấy giờ → khuya thì cảnh giác hơn | nhỏ |
| B7. Bảng tổng kết ngày | Tiền xin được · số nhà · ai cho nhiều nhất · **"lời nói dối buồn cười nhất"** (AI chọn 1 câu) → ảnh chụp khoe được | vừa — **đây là bộ máy lan truyền, đừng cắt** |
| B8. Ngày 4+ tăng khó | Xóm bắt đầu nhớ mặt: nghi ngờ khởi điểm +5 mỗi ngày | nhỏ |

**KHÔNG build ở v0.3:** cảnh sát · 8 nhà (giữ 3 nhà thật, thêm dần) · hàng xóm ngồi lê đôi mách thật sự
(B5 là bản giả lập rẻ) · NPC mới · nội thất nhà · nhiệm vụ vặt có gameplay riêng (chỉ là lời thoại).

## 3. Thứ tự thi công đề xuất (Session B) — ✅ THI CÔNG XONG 2026-08-09
1. ✅ B1 + B4 (khung chế độ + mục tiêu) → deploy preview `ket-tien.xom-dom-hong.pages.dev` → thử
2. ✅ B2 + B3 (điều kiện thắng + kết quả) → deploy → thử API thật (Haiku) trên cả 3 nhà
3. ✅ B5 + B6 + B8 (trí nhớ xuyên nhà, giờ, tăng khó)
4. ✅ B7 (bảng tổng kết + "lời nói dối buồn cười nhất" + nút 📸 tải ảnh PNG)
5. ✅ em-testing đối chiếu §5 + `report.md` + `pending.md` + `state.json`

**Chốt sau thi công (chi tiết ở `report.md`):** dễ ≈ 4 câu · khó ≈ 6 câu (đạt chỉ tiêu cân bằng);
ma sói không hồi quy; 3 phát sinh phải tự quyết (máy chấm keo kiệt → 3 luật chống keo kiệt ·
hạ ngưỡng "muốn giúp" 15 điểm · ngày mới mất tiền thừa) + 1 lỗi cũ v0.2 được vá luôn
(gõ thêm câu lúc màn kết đang chạy làm văng engine).

## 4. Vẫn nợ của v0.2 (chưa xong, đừng quên)
Phase 3 tutorial + menu nhân vật · phase 4 song ngữ EN/VN · phase 5 cảnh giết + rèm cửa ·
phase 6 độ ổn định · phase 7 QA. **Nếu chọn phương án A thì v0.3 xếp sau phase 3.**

## 5. Pass number (thước đo thắng/thua của mode này)
Lucas chơi hết 1 ngày không cần trợ giúp **VÀ** ≥5/10 bạn thử nói "muốn chơi tiếp ngày 2"
**VÀ** ≥3 người tự chụp màn hình bảng tổng kết gửi lại mà không ai nhắc.

## 6. Câu hỏi cho Lucas — ✅ ĐÃ CHỐT HẾT 2026-08-08
| Q | Câu hỏi | Chốt |
|---|---|---|
| Q-B0 | Phạm vi | ✅ **A — mode thứ 2 dùng chung engine** (Lucas 08-08) |
| Q-B1 | Đổi khung "ăn xin" → "sinh viên/khách lỡ đường kẹt tiền" | ✅ YES (mặc định) |
| Q-B2 | NPC | ✅ Giữ 3 NPC hiện có, thêm sau |
| Q-B3 | Giới hạn ngày/phiên (tiền API) | ✅ 3 ngày/phiên rồi nhắc nghỉ |
| Q-B4 | 3 câu mở gợi ý cho người mới | ✅ Có, tắt sau 2 nhà đầu ngày 1 |

Câu hỏi MỚI nảy ra khi thi công → ghi vào `pending.md`, KHÔNG hỏi lại Lucas giữa chừng.
