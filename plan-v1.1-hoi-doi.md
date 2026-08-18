# v1.1 — "Hàng xóm HỎI DỒN" (im lặng là bị hỏi tới)

> Trạng thái: **✅ XÂY XONG — ĐÃ LÊN LINK CHÍNH 16/08/2026** (40/40 đậu máy). Lucas chốt câu 1·2·3 = Yes, câu 4·5·6 lấy mặc định.
> Ý gốc của Lucas: *"i want the AI to pressing me or keep asking until get an answer, like it
> will wait for me maximum 30 secs and min 10 secs to ask me follow-up như: rồi sao nữa,
> giờ rốt cuộc muốn gì…"*

---

## 1. Vấn đề đang có (đã soi code, không đoán)

| Chỗ | Sự thật trong code |
|---|---|
| `convo.js` | Cuộc nói chuyện chỉ nhích khi NGƯỜI CHƠI gửi câu (`playerSays` → `exchange`). Người chơi im = game đứng hình. |
| `convo.js:257` | Chỉ có MỘT đồng hồ: đếm lùi 300 giây cả cuộc (`RULES.CONVO_SECONDS`). Không có đồng hồ "im lặng". |
| `config.js:298` | Đã có sẵn khuôn "lời thoại do CODE chọn, AI không đụng vào" = `XDH.LEAK_LINES`. Bản này COPY đúng khuôn đó → 0đ, chạy được cả khi não AI chết. |
| `speech.js` | Mic có 2 kiểu (Web Speech / thu âm 15 giây). Đang giữ nút nói = KHÔNG được coi là im lặng. |

## 2. Cách làm (đề xuất)

**Một cái đồng hồ im lặng** trong `convo.js`:

- **Lên dây** ngay sau khi hàng xóm nói xong và ô nhập mở ra.
- **Tháo dây** khi: người chơi gõ một phím · bấm gửi · đang giữ mic · hàng xóm đang nghĩ/đang gõ chữ ·
  đang chạy màn dẫn dắt người mới · cuộc đóng.
- **Kêu**: hàng xóm tự nói một câu hỏi dồn (lấy từ kho câu theo đúng giọng từng nhân vật), gõ ra
  màn hình y như câu thường (có tiếng blip), ghi vào lịch sử để lát nữa AI biết là mình đã hỏi dồn.
- **Lên dây lại**, lần sau NGẮN HƠN → cảm giác bị ép tăng dần.

**Ba nấc (đề xuất, số nằm hết ở `config.js` để chỉnh 1 chỗ):**

| Nấc | Chờ | Giọng | Giá phải trả |
|---|---|---|---|
| 1 | 18-30 giây | thúc nhẹ — *"Rồi sao nữa?"* | −4 kiên nhẫn |
| 2 | 12-18 giây | sốt ruột — *"Giờ rốt cuộc muốn gì, nói đại đi."* | −4 kiên nhẫn |
| 3 | 10-12 giây | tối hậu thư — *"Không nói thì thôi nghen, tôi đóng cửa đây."* | −4 kiên nhẫn |
| hết | 10 giây | KHÔNG nói gì nữa → **đóng cửa, thua vì im lặng** | kết thúc |

Trả lời một câu bất kỳ = **reset về nấc 1**.

## 3. Kho câu (mỗi nhân vật một giọng — khuôn `LEAK_LINES`)

- **Cô Sáu (mẹ bỉm sữa)**: giục kiểu người lớn, sợ con thức. *"Nói lẹ giùm cô, bé Bin sắp dậy rồi…"*
- **Tí (sinh viên)**: bị trận bóng kéo. *"Ơ… rồi sao nữa anh? Em còn coi trận nữa nè."*
- **Ly (Gen Z)**: chán nhanh nhất. *"Ủa rồi sao? Nãy giờ im ru à, flop quá."*

Mỗi nhân vật ≥ 3 câu / nấc, tiếng Việt CÓ DẤU + bản tiếng Anh, không lặp câu trong cùng một cuộc.

## 4. Các file phải đụng

| File | Việc |
|---|---|
| `game/public/js/config.js` | Thêm `XDH.PRESS` (số giây + tiền phạt) và `XDH.PRESS_LINES` (kho câu 3 nhân vật × 3 nấc × 2 thứ tiếng) |
| `game/public/js/convo.js` | Đồng hồ im lặng: lên dây / tháo dây / kêu / đóng cửa vì im lặng; ghi sự kiện `silence` vào sổ |
| `game/public/js/ui.js` | Gõ phím trong ô nhập + bấm mic = tháo dây; popup số kiên nhẫn bị trừ |
| ~~`game/functions/api/_personas.js`~~ | **KHÔNG cần đụng** (16/08): câu thúc đã được ghi vào lịch sử hội thoại và gửi kèm mỗi lượt, nên AI tự thấy mình vừa hỏi dồn. Đỡ được một lần sửa prompt. |

**Không đụng**: bảng chấm điểm verdict, hệ nhiệm vụ v1.0, mode Kẹt Tiền (trừ khi Lucas chốt bật cả 2 mode).

## 5. Cách kiểm (Definition of Done)

1. Mở cuộc, ngồi im → đúng nấc 1 (18-30s) hàng xóm nói câu hỏi dồn, thanh kiên nhẫn tụt và HIỆN SỐ.
2. Gõ một chữ vào ô nhập rồi ngồi im → đồng hồ đếm lại từ đầu (không kêu sớm).
3. Giữ nút mic 12 giây → KHÔNG bị hỏi dồn.
4. Im hết 4 nấc → cửa đóng, ghi lý do "im lặng", công an không tới (không phải tội nói dối).
5. Trả lời sau nấc 2 → lần im tiếp theo quay lại nấc 1.
6. `?tut=1` màn dẫn dắt người mới: KHÔNG bị hỏi dồn.

## 6. 6 câu chờ Lucas chốt

Xem phần trả lời trong chat ngày 16/08. Chốt xong → viết lại file này thành bản CHỐT + kèm prompt
chạy cho Terminal B.
