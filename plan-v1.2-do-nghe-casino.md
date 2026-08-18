# v1.2 — Túi đồ nghề · Thùng rác quay số · 2 món mới

> Trạng thái: **✅ XÂY XONG — ĐÃ LÊN LINK CHÍNH 16/08/2026** (40/40 đậu máy). Cả 7 câu lấy mặc định đã đề xuất.
> Đi kèm: `plan-v1.1-hoi-doi.md` (hàng xóm hỏi dồn — Lucas đã chốt câu 1·2·3 = Yes).

---

## 1. Sự thật trong code hiện tại (đã soi, không đoán)

| Chỗ | Đang là gì |
|---|---|
| `ui.js:262` `openShop()` | Xe bánh mì = cửa hàng. Bấm món là MUA NGAY, không hỏi lại. Hết tiền thì nút mờ đi (ảnh Lucas gửi: 0k → mua được gì đâu). |
| `ui.js:615` `renderConvoItems()` | "Túi đồ" hiện tại chỉ là mấy nút bé xíu ghi 🧋×1 ⏳×1 — **bấm là dùng luôn**, không có bảng, không có xác nhận, không nói rõ món đó làm gì. |
| `convo.js:664` `useItem()` | 4 món: trà sữa (+tin) · đồng hồ cát (+45 giây) · gợi ý quân sư (AI mách 1 câu) · đổi đồ tại chỗ. |
| Tiền | Chỉ kiếm được sau khi THẮNG một nhà (`afterHouseWon`). Đêm đầu = 0k → không test được món nào. Đúng cái Lucas đang kẹt. |
| `game.js:10` | Bản đồ có 3 điểm: tủ đồ · xe bánh mì · nhà. Còn chỗ trống để đặt **thùng rác quay số**. |

## 2. Bốn việc Lucas muốn

### A. Mở khoá cửa hàng để test
Bật bằng đường link `?test=1`: vào ván là có sẵn **500k** + băng chữ vàng "CHẾ ĐỘ TEST" ở góc.
Không đụng vào ván thật (link chính vẫn 0k). Tắt = bỏ `?test=1`.

### B. Túi đồ nghề kiểu game thật
Nút **🎒 Túi đồ** trong lúc nói chuyện → mở bảng ô vuông: mỗi ô = biểu tượng to + tên món +
"món này làm gì" + số lượng. Bấm một ô → hộp nhỏ hiện lên: **"Dùng ngay"** / **"Huỷ"**.
Dùng xong: bảng đóng, số lượng trừ, hiện popup số (+tin / +giây) như luật cũ.

### C. Thùng rác quay số (máy đánh bạc của xóm)
Đặt cạnh xe bánh mì. Mở ra 3 ô quay kiểu 8-bit.
- **Cược 50k**: thắng → nhận lại 50k + ăn thêm 50k (tổng 100k). Thua → mất 50k.
- **Tất tay**: cược hết tiền đang có, thắng ×2, thua sạch.
- **Ô đặc biệt**: 3 hình giống nhau = trúng thêm một **món đồ nghề** ngẫu nhiên.
- Hết sạch tiền KHÔNG phải thua ván — vẫn đi gõ cửa kiếm tiền tiếp được.

### D. Hộp quà may mắn (bán ở xe bánh mì)
Mua **30k** → mở ra 1 phần thưởng ngẫu nhiên: tiền · một món đồ nghề · món đồ mặc · hoặc rác
(vỏ bánh mì — cho vui).

### E. Hai món mới
| Món | Làm gì (đề xuất) |
|---|---|
| ✨ **Nâng tầm đẹp trai** | Dùng giữa cuộc: **+10 tin** ngay, và tới hết cuộc đó, mỗi câu nói được chấm tốt được **cộng thêm** một ít tin. |
| 🧠 **Máy đọc suy nghĩ** | Dùng giữa cuộc: tới hết cuộc đó, bong bóng 💭 hiện **MỖI lượt** (bình thường chỉ thỉnh thoảng) + nói thẳng hàng xóm đang thèm nghe chuyện gì. |

## 3. Các file phải đụng

| File | Việc |
|---|---|
| `config.js` | Số tiền test · giá 2 món mới · tỉ lệ máy quay số · bảng phần thưởng hộp quà · số của 2 món mới |
| `ui.js` | Bảng túi đồ + hộp "Dùng/Huỷ" · màn máy quay số · món mới trong cửa hàng · băng chữ TEST |
| `convo.js` | `useItem` thêm 2 món mới + cờ hiệu lực "tới hết cuộc" |
| `game.js` | Thêm thùng rác lên bản đồ (đi tới bấm E / chạm để mở) |
| `mode-ket-tien.js` | Chỉ kiểm tra: máy quay số có nên tắt ở mode Kẹt Tiền không (câu hỏi 7) |

## 4. Cách kiểm (Definition of Done)

1. Mở link `?test=1` → có 500k, mua được cả 6 món, băng TEST hiện.
2. Vào nói chuyện → bấm 🎒 → thấy đủ món đang có, mỗi món có chữ giải thích.
3. Bấm một món → hiện "Dùng ngay / Huỷ" → bấm Huỷ thì KHÔNG mất món.
4. Dùng ✨ Nâng tầm đẹp trai → thanh tin nhảy +10 và hiện số; câu tốt tiếp theo cộng nhiều hơn bình thường.
5. Dùng 🧠 Máy đọc suy nghĩ → 3 lượt liên tiếp đều có bong bóng 💭.
6. Máy quay số: quay 100 lần bằng máy → tỉ lệ thắng lệch không quá 5% so với con số đã chốt.
7. Tất tay thua sạch → vẫn gõ cửa được, không kẹt ván.
8. Link chính (không có `?test=1`) vẫn bắt đầu 0k — không hỏng ván thật.

## 5. 7 câu chờ Lucas chốt
Xem chat ngày 16/08. Chốt xong → gộp v1.1 + v1.2 thành bản CHỐT + prompt chạy cho Terminal B.
