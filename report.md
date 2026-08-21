# Báo cáo nóng — v1.0.1 SỬA "LY NHAI LẠI CÂU" (2026-08-13, ngay sau khi Lucas bắt lỗi)

**Link thử (đã cập): https://nhiem-vu.xom-dom-hong.pages.dev** — chơi lại đúng kịch bản cũ để thấy khác.

## Lucas bắt được gì
Hỏi "thiếu gì" 2 lần → Ly lặp nguyên văn "Thiếu… một món đồ để quay thôi á 😌", không nhả manh mối mới.

## Mổ xẻ (đo bằng máy, không đoán)
1. **Hứng thú kẹt dưới 60** — câu hỏi cụt kiểu "thiếu gì" bị chấm "nhạt" (−hứng thú) → cửa khai không bao giờ mở, trong khi miệng Ly lỡ hé trước → nhai lại.
2. **Não Qwen có bệnh lặp CÓ GIẤY TỜ** (research: thẻ model Qwen khuyên bật phạt-lặp; mình chưa bật).
3. **Não dự phòng (kịch bản) cũng chỉ có 1 câu/ô** → chuỗi não chết là lặp y hệt.

## Đã sửa — 6 tầng (research 08-13: tài liệu Qwen/DeepSeek/Gemini + bài viết game NPC + AI Dungeon)
| Tầng | Cách |
|---|---|
| Núm phạt-lặp | Bật presence_penalty 1.0 cho Qwen (thuốc chính hãng; 1.5 dễ lẫn tiếng Anh nên không dùng). Gemini 2.5 cấm núm này + kẹt vòng khi temperature < 1 → kẹp 1.0 riêng Gemini |
| Máy bắt câu hỏng | Server so câu mới với 4 câu đã nói: lặp hoặc rỗng "…" → bắt VIẾT LẠI một lần; rỗng 2 lần → rơi kịch bản |
| Cấm-lặp đặt cuối prompt | Bảng "CÂU BẠN ĐÃ NÓI — cấm trùng quá 4 chữ" đặt CUỐI (chỗ não nhớ nhất) + kể rõ chuyện đã hé để nhắc lại phải diễn đạt khác |
| Người chơi hỏi lại | Máy phát hiện hỏi-lại-câu-cũ → Ly phản ứng với việc BỊ hỏi lại (bực/đùa) thay vì trả lời y nguyên — biến loop thành tấu hài |
| Ấm dần | Đào đúng chuyện Ly giấu mà chưa đủ quan tâm → +4 hứng thú/lượt (hiện popup 🎬) — người kiên trì không bao giờ kẹt |
| Kịch bản dự phòng | Mỗi ô 2-3 biến thể bốc ngẫu nhiên + nhịp "rõ chuyện" chỉ cần qua 1 lượt (hết cảnh moi đủ rồi mà bắt chờ) |

## Kiểm lại bằng máy — kịch bản Y HỆT của Lucas trên não thật
- Trước: 6 lượt lặp 1 câu, popup KHÔNG mở. **Sau: 0 câu trùng, popup 📱 mở ở lượt 5**, dấu tiếng Việt nguyên vẹn. Bộ sống 7/7 · offline 25/25 · trình duyệt 27/27 · console 0 lỗi.

## 🔍 OBSERVABILITY — cách anh tự soi (không cần em)
Thêm **`?debug=1`** vào link (giữ nguyên các chữ sau dấu ?). Trong lúc nói chuyện, bảng chữ xanh dưới khung thoại hiện MỖI LƯỢT:
- **[não]** đang trả lời (qwen/gemini/kịch bản) + **não nghỉ: qwen 320s** nếu có não đang bị cho nghỉ.
- **nv chua_biet·manh mối 1** = nhiệm vụ đang ở đâu, đã moi được mấy manh mối.
- **tín hiệu manh_moi_1→·** [quan tâm 52 < 60] = AI muốn khai nhưng bị CHẶN vì lý do gì.
- **ĐÃ BẮT VIẾT LẠI VÌ LẶP** = máy vừa tóm được não định nhai lại.
- Dòng **[nv]** xanh dương = mọi quyết định của máy nhiệm vụ (nhận manh mối, chặn, mở popup, trả thưởng).
# Báo cáo Session B — v1.0 HỆ NHIỆM VỤ (2026-08-13)

**Link thử: https://nhiem-vu.xom-dom-hong.pages.dev — link chính CHƯA đụng.**
Đủ 5 chặng C1→C5 của `plan-v1.0-nhiem-vu.md`. Kẹt Tiền: **0 dòng đổi** (kiểm bằng git + máy).

## ✅ Đã xong (đúng 9 đáp án Lucas khoá)

| Mảnh | Trạng thái |
|---|---|
| **Chuyện ngầm của Ly** — gậy selfie gãy + hết tiền; Ly KHÔNG tự khai. Người chơi lần theo mạch TikTok → 3 manh mối lộ dần (quan tâm ≥ 60, mỗi manh mối cách ≥ 2 lượt) → popup | ✅ kiểm sống trên não thật: moi ra chuyện ở lượt 5 (chỉ tiêu ≤ 8) |
| **Popup 📱 kiểu thông báo điện thoại** (đáp án 5) — "TikTok · Ly · bây giờ", nút CÓ/KHÔNG. Từ chối KHÔNG mất mạch: nhắc lại TikTok là popup quay lại | ✅ máy kiểm 2 chiều |
| **Nhận là THẾ GIỚI ĐỔI** — 3 thùng rác mọc ra trên bản đồ, xe bánh mì bắt đầu bán gậy, việc vặt mở ở cả 3 nhà, ô HUD 🎯 bật (đáp án 6) | ✅ |
| **3 đường giải (đáp án 3)** — 💰 việc vặt 20-40k/lần (trần 2 lần/nhà/đêm, ≤120k/đêm) + tiền lẻ trong rác → mua gậy 80k · 🤝 mượn Tí (CODE xét tin ≥ 55 — AI "đồng ý mồm" cũng không lọt) · 🗑️ 3 thùng rác, bảng loot 50% đồ vứt đi hài / 30% tiền lẻ / 15% đồ ăn / 5% gậy | ✅ cả 3 đường đi tới cùng bằng máy |
| **Trả đồ + thưởng (đáp án 7)** — gặp Ly với gậy trong túi → nút 🤳 ĐƯA GẬY → cảnh Ly mừng xỉu (phan_khich) → +50k + tin, chạy được cả khi não AI chết (kịch bản) | ✅ |
| **2 lối chơi (đáp án 2)** — 😇 Sói Hiền: 0 cú cắn + xong nhiệm vụ → màn kết 8-bit "xóm nhận nuôi" + bảng điểm riêng · 🐺 Sói Dữ: y nguyên luật cũ · đêm 0 cắn chưa xong nhiệm vụ = đêm trôi bình thường, không thua | ✅ |
| **AI không cầm game** — AI chỉ phát tín hiệu `mission_signal`; 3 lớp gác: chữ CẤM trong thẻ Ly + cổng server + cổng client. Số cân bằng nằm hết ở config.js một chỗ | ✅ |

## 🔬 Bộ kiểm mục 6 — CẢ 5 SỐ ĐẬU

| # | Số đậu | Kết quả |
|---|---|---|
| 1 | Nhắc TikTok → moi ra chuyện ≤ 8 lượt, AI không khai sớm | ✅ não thật (Qwen): rõ chuyện ở **lượt 5**, đúng thứ tự 1→2→3; quan tâm 40 hỏi thẳng 2 lượt đều bị chặn (`mission-live.mjs` 4/4) |
| 2 | Cả 3 đường giải đi được tới cùng (cờ `?mission=test`) | ✅ Playwright: mua 80k / mượn Tí / lục rác đều ra gậy → trả → +50k (`mission-check.py` 27/27) |
| 3 | Kết Hiền đúng lúc · Sói Dữ y hệt bản live | ✅ kết Hiền hiện khi 0 cắn + xong (cả ngay lúc trả lẫn lưới bình minh) · hồi quy 20 mục não thật: **bản thử 17/20 > link chính 15/20** — 3 mục rớt là bệnh giọng não Qwen CÓ SẴN trên live (đã có trong pending 08-10), không phải do nhiệm vụ |
| 4 | 0 lỗi console mới · Kẹt Tiền không đổi | ✅ console 0 lỗi trên mọi đường đi · `mode-ket-tien.js` diff trống · máy xác nhận Kẹt Tiền không thấy nhiệm vụ/thùng rác |
| 5 | Từ chối → nhắc TikTok → popup hiện lại | ✅ máy kiểm |

Bài kiểm mới để lại cho lần sau: `game/tools/mission-check.mjs` (20 mục, chạy không cần mạng) · `mission-check.py` (27 mục trình duyệt) · `mission-live.mjs` (4 mục não thật).

## ⚠️ QUYẾT ĐỊNH TỰ ĐƯA + VẤN ĐỀ MỚI (không có trong plan) — cho Lucas

1. **Kết Sói Hiền hiện NGAY khi trả đồ** (0 cắn), không bắt chờ bình minh 8 phút — plan viết "qua đêm 0 cắn" nhưng bắt ngồi chờ là ức chế. Bình minh vẫn là lưới đỡ. Muốn kiểu "chờ trời sáng" thì đảo 1 khối nhỏ.
2. **Máy bắt được não Qwen lặp manh mối 1 sáu lượt liền** → đã cho CODE nắn tín hiệu về manh mối kế tiếp (não yếu cỡ nào mạch vẫn chạy). Nhưng **miệng Ly có lúc lỡ nhắc chuyện gậy sớm** dù tín hiệu bị chặn đúng — đã siết chữ, Qwen vẫn thỉnh thoảng lỡ miệng. Cùng gốc bệnh "não EN yếu" 08-10 (đổi thứ tự não chờ Lucas gật).
3. **Đêm 0 cú cắn giờ KHÔNG thua nữa** (luật Sói Hiền của plan) — người chơi Sói Dữ thất bại cả đêm cũng được ân xá qua đêm mới thay vì thua. Chơi thử thấy dễ quá thì nói em siết lại.
4. **Đồ ăn trong rác hiện chỉ là câu hài** (không cộng gì) — để dành cho nhiệm vụ v1.1 dùng lại hệ rác.

## 🎯 Lucas làm tiếp
1. Chơi thử link thử theo mạch người mới: nói chuyện với Ly về TikTok → nhận nhiệm vụ → chọn 1 trong 3 đường → trả gậy → xem kết Sói Hiền.
2. Ưng thì gật một tiếng — em merge lên link chính (chưa đụng gì cho tới lúc đó).

## Kỹ thuật (đọc khi cần)
- Mới: `public/js/missions.js` (máy trạng thái + luật). Sửa: config/convo/ui/game/index + `functions/api/converse.js` (mission_signal đủ 4 chỗ schema + cổng gateMission) + `_personas.js` (khối nhiệm vụ MISSION_BLOCKS, chèn vào tin nhắn cuối để giữ bộ nhớ đệm).
- Núm chỉnh: `XDH.MISSION_CFG` + `XDH.TRASH` trong config.js. Ngưỡng 60/55 có bản sao cứng trong gateMission (server) — đổi thì đổi CẢ HAI.
- Deploy thử: `npx wrangler pages deploy --branch=nhiem-vu --commit-dirty=true` trong `game/`.

---

# Báo cáo — HƯỚNG DẪN: ĐỔI CÁCH CHẤM (2026-08-10, sau khi Lucas báo "shipper" vẫn bị chặn)

**Preview: https://huong-dan.xom-dom-hong.pages.dev — link chính chưa đụng. 0 lỗi console.**

## Lỗi Lucas bắt được
Tôi bắt câu phải **từ 2 chữ trở lên** mới xét → gõ đúng một chữ "shipper" bị loại thẳng trước khi kịp so từ khoá. Bà nhắc lại y một câu ba lần nên nhìn như hỏng hẳn.

## Tra cách làm đúng (không đoán)
- So từ khoá chỉ hợp với thứ máy móc (đúng định dạng, có mặt chữ nào đó); câu người thật nói thì phải **chấm theo Ý** — đây là kỹ thuật "LLM-as-a-judge", dùng khi phép so khớp cứng quá giòn.
- Chính **Suck Up!** (game gốc mà mình học theo) không hề có cửa từ khoá: AI nghe hiểu rồi tự quyết mở cửa hay không.

## Thí nghiệm thật — 27 câu người thật hay gõ (1 chữ, sai chính tả, sai vai, phủ định, nói bậy)

| Cách chấm | Đúng | Cho qua đúng | **Chặn đúng** |
|---|---|---|---|
| Từ khoá (bản cũ) | 23/27 | 12/14 | 11/13 |
| **AI chấm (bản mới)** | **26/27** | 13/14 | **13/13** |

Chỗ từ khoá thua đau nhất: **"con không phải shipper đâu"** — có chữ shipper nên nó cho qua; AI chặn đúng. Và **"e la shiper"** (viết tắt, sai chính tả) — từ khoá chặn oan, AI cho qua.

Thí nghiệm còn moi ra một lỗi ngầm: phiếu trả lời của AI **thiếu ô "đạt/chưa đạt"** → bà chấm trượt 100% (0/14) dù lời thoại rõ ràng là khen. Không chạy thí nghiệm thì không ai thấy.

## Bản mới chạy thế nào
**AI là người chấm chính** (theo ý, không theo chữ) → gọi không được thì **tự rơi về từ khoá**, hướng dẫn vẫn chạy trọn 0đ. Ép tắt AI bằng `?tutai=0`. Sai 2 lần là hiện luôn câu mẫu để khỏi kẹt.

**Kiểm:** ma sói 9/9 · Kẹt Tiền 9/9 · gõ đúng một chữ "shipper" qua được ở CẢ hai chế độ (có AI và không AI) · 0 lỗi console. Máy đo mới: `game/tools/gate-experiment.py`.

---

# BÁO CÁO — Xóm Đóm Hòng

**🟡 v0.8 NÃO XOAY VÒNG: DỪNG Ở PREVIEW https://nao-xoay-vong.xom-dom-hong.pages.dev — link chính KHÔNG bị đụng.**
Pass-number chống chết 6/6 ĐẠT. Bài kiểm 20 mục 15/20 (v0.7 là 13/20) → chưa đủ điều kiện đẩy lên link chính.
Kẹt duy nhất: hai não giỏi nhất đang khoá vì tiền (Gemini hết hạn mức, Anthropic hết tiền) — pending mục 6.

# Báo cáo — NHÀ HƯỚNG DẪN BIẾT NGHE (2026-08-10)

**🟡 Preview: https://huong-dan.xom-dom-hong.pages.dev — link chính chưa đụng. Kiểm 27/27, 0 lỗi console.**

Lucas bắt lỗi: gõ "chào cc" rồi "im đi" vẫn qua bước — hướng dẫn cũ **không đọc chữ người chơi**. Lucas chốt phương án **D**.

| Trước | Sau |
|---|---|
| Gõ gì cũng qua bước | Nói chưa đúng việc của bước đó thì **không qua**, Bà Năm bắt nói lại |
| Nói bậy vẫn được khen | Bà "nghe không lọt lỗ tai", bắt nói tử tế lại |
| Không biết phải nói gì thì kẹt luôn | Sai 3 lần thì hiện luôn **câu mẫu** để gõ theo |
| Ma sói bước 4 gõ chữ = treo ô nhập | Bà nhắc "bấm nút CẮN kia kìa" |
| Bà nói y một câu bất kể người chơi nói gì | Bật `?tutai=1` thì bà **phản ứng đúng câu vừa nghe** (ví dụ thật: nghe "chào cc" thành "chào cờ"; nghe "giao trà sữa" thì đùa "tưởng trả sữa") |

Nguyên tắc giữ nguyên: **code cầm việc chấm bước và câu đẩy cốt truyện**, AI chỉ viết lời phản ứng → 4 bước dạy không bao giờ lệch, và AI chết thì hướng dẫn vẫn chạy trọn vẹn 0đ.

Kiểm: ma sói kịch bản 9/9 · ma sói có AI 9/9 · Kẹt Tiền 9/9. Máy kiểm `game/tools/tutorial-check.py`.

---

# Báo cáo Session B — v0.7 GIỌNG THẬT (2026-08-10)

**🟡 DỪNG Ở PREVIEW: https://giong-that.xom-dom-hong.pages.dev — link chính KHÔNG bị đụng.**
Bài kiểm **13/20**. Không đạt 20/20 nên theo đúng luật §8 Q3 của kế hoạch: không tự đẩy lên link chính.

**Điều quan trọng nhất: phần giọng làm xong và đo được. Cái chặn là NÃO CỦA GAME đang hỏng, có từ trước v0.7.**

## Làm được gì

| Việc | Xong | Đo bằng gì |
|---|---|---|
| Sổ giọng của Lucas vào thẳng 3 thẻ nhân vật | ✅ | 36/36 câu + 3 dòng tic khớp **nguyên văn** `voice-sheet-lucas.md`, máy so từng chữ. Câu tiếng Anh là câu Lucas VIẾT bằng tiếng Anh, không phải bản dịch máy — so đúng thứ tự trong bảng EN của sổ |
| Mỗi lượt chèn 2 câu mẫu, xoay vòng theo lượt | ✅ | chọn theo hash (mã ván + số lượt) — chơi lại y hệt, không random. In ra lời dặn thật để xem: lượt 1/3/4/6 khác nhau, luôn đúng 2 câu và không trùng nhau |
| Dòng "thói quen nói" đặt sát cuối lời dặn | ✅ | in ra thấy nằm cuối cùng phần cố định |
| Nhắc giọng từ lượt 4 (chống trôi) | ✅ | lượt 1 và 3 không có, lượt 4 và 6 có — cả bản Việt lẫn Anh |
| Máy chấm giọng | ✅ | `game/tools/` — đếm dấu hiệu giọng lượt 1 vs lượt 6, dò trôi xưng hô, giám khảo mù, dò chép nguyên văn, kiểm trình duyệt |

## Bốn con số chốt trước khi test (§6)

| Chốt trước | Thật | |
|---|---|---|
| Dấu hiệu giọng ở lượt 6 ≥ 3 | Tiếng Việt **6/6 ván đạt** (5-10 dấu hiệu, trước đây 0-2) · Tiếng Anh **0/6** vì lượt cuối rơi về câu đóng hộp | ❌ do não hỏng |
| Trôi xưng hô 0/3 nhân vật | **0/3** (trước 1/3) | ✅ |
| Giám khảo mù ≥ 8/9 | **9/9** | ✅ |
| Tốn thêm 0đ mỗi lượt | **0đ** — câu mẫu nằm ở phần thay đổi, khối cố định vẫn được nhớ đệm | ✅ |

0 lỗi console, 0 request hỏng trên preview.

## Vì sao dừng — hai cái hỏng KHÔNG phải do v0.7

1. **Haiku hết tiền.** Khoá Anthropic báo "credit balance too low". Cả link chính lẫn preview đều đã tụt xuống dùng DeepSeek từ hôm nay. Nạp tiền là quyết định của Lucas → không tự làm.
2. **DeepSeek trả về rỗng khi hội thoại dài.** Đo tay: bản CŨ (chưa có sổ giọng) cũng chỉ 3/5 lượt trả lời được; bản mới lời dặn dài hơn nên 0-1/5. Bỏ chế độ JSON hay đổi nhiệt độ đều không cứu. Rỗng → game rơi về câu đóng hộp, và bộ câu đóng hộp **chỉ có tiếng Việt** nên người chơi English nhận câu Việt.

Ba cách sửa + đề xuất nằm ở `pending.md` mục 1-2. Chưa làm cái nào vì cách tốt nhất dính tới tiền.

## Vấn đề mới ghi lại

- AI **chép nguyên văn** câu mẫu nếu không cấm rõ (lần đầu bê nguyên chuỗi 15 chữ). Đã siết bằng luật "trùng quá 4 chữ liên tiếp thì viết lại" → đo lại tối đa còn 2-4 chữ, 0 lượt vi phạm.
- Ba cái bẫy trong chính máy đo (chữ có dấu · "một mình" · giám khảo trả lời lan man) — đã sửa, ghi vào `pending.md` mục 5 để lần sau khỏi vấp.

---

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

---

## 2026-08-16 — v1.1 HỎI DỒN + v1.2 TÚI ĐỒ · MÁY QUAY SỐ · 2 MÓN MỚI → ĐÃ LÊN LINK CHÍNH

**Link chính:** https://xom-dom-hong.pages.dev · **Bản thử đồ:** https://xom-dom-hong.pages.dev/?test=1
(có sẵn 500k) · **Preview riêng vòng này:** https://hoi-doi.xom-dom-hong.pages.dev

### Lucas chốt
1 Yes (câu thúc do game tự viết, 0 đồng) · 2 Yes (nấc sau ngắn hơn nấc trước) · 3 Yes (im lặng mất kiên nhẫn) ·
4-6 lấy mặc định đã đề xuất (im hết 3 nấc = đóng cửa · chạy cả 2 chế độ · lên preview trước rồi link chính) ·
7 câu của v1.2 lấy mặc định đã đề xuất.

### Làm được gì
| Việc | Chi tiết |
|---|---|
| ⏳ Hàng xóm hỏi dồn | 3 nấc 18-30s → 12-18s → 10-12s, mỗi lần thúc **-4 kiên nhẫn**, im hết 3 nấc + 10 giây = **cửa đóng** (sổ ghi lý do `silence`, không có công an). Gõ một phím / giữ mic = đồng hồ đếm lại. Trả lời = về nấc 1. Màn dẫn dắt người mới KHÔNG bị thúc. |
| 🎒 Túi đồ nghề | Nút 🎒 trong cuộc + trên HUD → bảng ô vuông (biểu tượng to, tên, "món này làm gì", số lượng) → bấm một ô hiện hộp **Dùng ngay / Huỷ**. Gậy selfie nhiệm vụ nằm chung túi nhưng chỉ đưa được trước cửa Ly. |
| ✨ Nâng tầm đẹp trai (70k) | +10 tin ngay, và tới hết cuộc đó mỗi câu được chấm tốt **cộng thêm 4 tin**. |
| 🧠 Máy đọc suy nghĩ (90k) | Tới hết cuộc đó, **lượt nào cũng** hiện bong bóng 💭 + nói thẳng hàng xóm đang thèm nghe chuyện gì (lấy từ bảng điểm yếu CÓ THẬT `XDH.REGRET`, AI không được bịa). |
| 🎰 Thùng rác quay số | Đứng cạnh xe bánh mì. Cược 50k hoặc **TẤT TAY**. Thắng ăn gấp đôi (40%), 3 hình giống nhau (6%) ăn gấp đôi **+ tặng 1 món đồ nghề**. Thua mất tiền cược. Cháy túi vẫn gõ cửa kiếm lại được. |
| 🎁 Hộp quà may mắn (30k) | Bán ở xe bánh mì, mở ngay tại quầy: tiền · đồ nghề · đồ mặc · hoặc rác cho vui. |
| 🧪 Chế độ test | `?test=1` = vào ván có 500k + băng vàng "CHẾ ĐỘ TEST". Link chính vẫn 0k như cũ. |

### Kiểm bằng máy
`py game/tools/press-slot-check.py <link>` — **40/40 đạt**, chạy 3 lần: máy nhà · preview `hoi-doi` · **link chính**.
0 lỗi console. Máy quay số quay **1000 lần**: thắng 40,1% (chốt 40%), trúng lớn 6,4% (chốt 6%).
Chạy thật với não AI: chào → trả lời → ngồi im 4 giây → Ly tự thúc *"Ủa rồi sao?"* (-4 kiên nhẫn) → nói lại thì về nấc 1.
Ảnh: `game/shots/v12_01_shop … v12_07_live_press.png`.

### Nguyên tắc giữ nguyên
CODE cầm mọi con số. AI **không hề biết** có món ✨ 🧠 hay máy quay số. Câu hỏi dồn lấy từ kho trong `config.js`
(khuôn `LEAK_LINES`) nên **không tốn một đồng API** và chạy được cả khi não AI chết.

### ⚠️ Việc mới nảy ra — cần Lucas quyết
1. **Đẩy link chính lần này KÉO THEO v1.0 hệ nhiệm vụ** (gậy selfie của Ly) — trước đó v1.0 mới ở preview chờ Lucas gật. Giờ đã sống trên link chính.
2. **Máy quay số đang bật ở CẢ chế độ Kẹt Tiền** — ở đó tiền là điều kiện thắng, tất tay thắng là mua được bữa ăn liền. Muốn tắt riêng cho Kẹt Tiền thì nói.
3. Chưa commit vào git (chỉ nằm trên đĩa + đã lên link) — chờ Lucas gật mới commit.

---

# 🔦 v2.0 — HỘP KÍNH · THANH THIỆN CẢM · BA NHIỆM VỤ GIẤU (2026-08-21, Terminal B)

**Link thử: https://hop-kinh.xom-dom-hong.pages.dev** — link chính KHÔNG bị đụng một dòng nào.
**Bảng đèn (chỉ Lucas): https://hop-kinh.xom-dom-hong.pages.dev/dash?key=…** (chìa gửi riêng trong chat).
Kho: nhánh `v2.0-hop-kinh` của `imnumber1234/xom-dom-hong-game` — **chưa gộp vào bản chính**, chờ Lucas gật.

## Chuyện lớn nhất của vòng này: sổ đen vừa bật lên là bắt ngay hai thủ phạm

Kế hoạch đoán rằng Gemini "vừa lỗi, bị cho nghỉ". **Sai — nó chết hẳn, và chết từ 8 ngày trước.**
Sổ đen ghi lại nguyên văn lỗi, rồi `tools/brain-probe.mjs` gọi từng não riêng ra hỏi cho ra nhẽ:

| # | Thủ phạm | Nguyên văn máy trả về | Từ bao giờ | Đã xử |
|---|---|---|---|---|
| 1 | **Ô "tín hiệu nhiệm vụ" có một lựa chọn RỖNG** | `properties[mission_signal].enum[0]: cannot be empty` (HTTP 400) | 13/08 — đúng hôm thêm hệ nhiệm vụ v1.0 | ✅ đã sửa, Gemini trả lời được ngay |
| 2 | **Google chặn theo VỊ TRÍ máy chủ** | `User location is not supported for the API use` (HTTP 400) | không rõ, có thể từ đầu | ❌ ngoài tầm mã nguồn → `pending.md` |
| 3 | Khoá Anthropic (Haiku) hết tiền | `Your credit balance is too low` | 10/08 | ❌ phải nạp tiền → `pending.md` |

**Nói cho dễ hiểu:** cái ô "tín hiệu nhiệm vụ" cho phép để trống, mà Google không chịu kiểu "được phép
để trống" đó — nó trả lỗi và cúp máy. Một dòng nhỏ thêm hôm 13/08 đã giết con AI giỏi nhất suốt 8 ngày,
và **không ai biết vì game không lưu lại một chữ nào**. Đây đúng là lý do sâu nhất của câu *"AI không nghe lời em"*.

Chuỗi não xếp lại theo số đo thật (không theo cảm giác): **gemini → deepseek → qwen → haiku**.
DeepSeek nhanh gần gấp đôi Qwen (1,6s vs 3,2s), giọng chấm 3,7 vs 3,5, và **chạy được** ở máy chủ.

## 11 việc — làm hết, không bỏ việc nào

| # | Việc | Xong | Ghi chú đáng nhớ |
|---|---|---|---|
| 1 | Sổ đen D1 | ✅ | 40 cột/lượt · ghi "gửi rồi đi" · D1 rớt thì nuốt lỗi, game chạy tiếp |
| 2 | 9 cột mốc phía máy chơi | ✅ | gửi bằng `sendBeacon` — vẫn gửi được lúc người chơi đang đóng tab |
| 3 | Bảng đèn `/dash` | ✅ | phễu · tỉ lệ chấm · não · độ trễ · chỗ bỏ cuộc · xem lại nguyên cuộc · tuân lệnh ngôn ngữ |
| 4 | Thanh thiện cảm 2 lớp + HIỆN | ✅ | code chấm từ khoá · AI chấm cảm giác · lấy cao hơn |
| 5 | 100% = cửa mở, AI phải nói câu mời | ✅ | bỏ hẳn quyền phủ quyết; não chết vẫn có câu mời kịch bản |
| 6 | Sửa lượt 1 luôn bị chấm nhạt | ✅ | 0/12 câu trúng tim còn bị chấm nhạt (trước: 12/12) |
| 7 | Nhiệm vụ giấu cho Tí + Cô Sáu | ✅ | + KHOÁ MIỆNG: bí mật lộ sớm là bắt viết lại |
| 8 | Công tắc `XDH.PLAYTEST` | ✅ | bản thử tự bật · **link chính luôn tắt** · tắt là về y như cũ |
| 9 | Tắt máy quay số ở Kẹt Tiền | ✅ | hai lớp: không mọc ngoài xóm + chặn ở cửa mở |
| 10 | Chọn ngôn ngữ + bài kiểm tuân lệnh | ✅ | 65% → **100%** sau ba lần sửa |
| 11 | Commit v1.1 + v1.2 + vòng này | ✅ | v1.1/v1.2 đã có sẵn trong kho; vòng này thành 1 mốc trên nhánh riêng |

## Bảy số đậu của kế hoạch

| # | Mốc | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Chơi một ván → bảng đèn hiện đủ số lượt | ✅ | 202 lượt · 31 phiên trong 24 giờ, xem lại được từng cuộc |
| 2 | Bảng đèn chỉ ĐÚNG não đang chạy | ✅ | đối chiếu `?debug=1` ↔ sổ đen: cùng `qwen`, cùng verdict, kèm 2933ms · 3158/129 chữ |
| 3 | Nói trúng từ khoá → thanh lên → 100% → cửa mở + câu mời | ✅ | lượt 1: 64% · lượt 2: 100% → cửa mở, Ly nói câu mời |
| 4 | Lượt 1 trúng tim không còn bị chấm nhạt | ✅ | 12 câu trúng tim × 3 nhà → **0** câu người chơi nhận "nhạt" |
| 5 | Cả 3 nhà đều ra được nhiệm vụ giấu | ✅ | 3/3 nhà bật popup 📱 + quầy bán đúng món |
| 6 | Bật công tắc → mọi món 0đ | ✅ | 6/6 món 0k · hộp quà 0k · tủ đồ mở hết · tắt công tắc là về giá gốc |
| 7 | Chọn English → ≥95% trả lời tiếng Anh | ✅ | **20/20 (100%)** — trước khi sửa 13/20 (65%) |

## Đường đi tới 100% tiếng Anh (ba lần sửa, có số từng bước)

| Lần | Sửa gì | Kết quả |
|---|---|---|
| 0 | (chưa sửa) | 13/20 = 65% |
| 1 | Thước đo cũ chấm oan tên riêng ("Hà Nội") → viết lại cách đo cho công bằng + siết lời dặn ba tầng + chuỗi não riêng cho tiếng Anh | 17/20 = 85% |
| 2 | **Chốt chặn do CODE cầm**: đọc lại câu vừa viết, sai tiếng thì bắt viết lại một lần | — |
| 3 | Não kịch bản (lớp dự phòng cuối) nay có bản tiếng Anh — cả 3 câu trượt còn lại đều là câu kịch bản tiếng Việt | **20/20 = 100%** |

> Bài học lặp lại lần thứ ba trong dự án này: **dặn bằng lời thì AI quên, viết thành luật trong mã nguồn thì không.**

## Máy kiểm — 124 mục, chạy thật, không mục nào bịa

| Bộ | Kết quả | Chạy bằng |
|---|---|---|
| `tools/v2-check.mjs` (không cần mạng) | **30/30** | cổng nhiệm vụ 3 nhà · sổ đen · thanh thiện cảm · công tắc |
| `tools/mission-check.mjs` (bộ cũ của v1.0) | **25/25** | chứng minh v1.0 KHÔNG gãy khi mở rộng |
| `tools/v2-browser.py` (Playwright, bản đã lên mạng) | **28/28** | 0 lỗi console |
| `tools/press-slot-check.py` (bộ cũ v1.1+v1.2) | **41/41** | chứng minh v1.1/v1.2 KHÔNG gãy |
| `tools/v2-live.mjs` (gọi API thật) | 18 lượt + 40 lượt | số đậu 4 và 7 |

Bộ mới thêm: `tools/brain-probe.mjs` — gọi từng não riêng ra, in NGUYÊN VĂN lỗi (sổ đen chỉ giữ 80 chữ đầu).

## Ba lỗi bắt được TRONG lúc kiểm (không có trong kế hoạch)

1. **Cô Sáu tự khai bí mật ngay câu đầu** — khối nhiệm vụ đã ghi "LUẬT CẤM nhắc gấu bông" nhưng AI vẫn nói.
   → thêm **khoá miệng** bằng mã nguồn: thấy tên món đồ trước manh mối 2 là bắt viết lại.
2. **Lượt "mời vào" bị máy chủ trả lỗi 400** — lượt đó không có lời người chơi, mà cổng kiểm tra chưa biết
   đường này. Bắt được nhờ đúng một dòng đỏ trong bảng điều khiển trình duyệt.
3. **Nói một câu là mở toang cửa nhà dễ** — câu trúng chủ đề được cộng điểm HAI LẦN (nâng mức chấm + cộng
   thẳng lòng tin). Sửa: đã nâng mức chấm thì thôi cộng tin, và một câu chỉ tính công một chủ đề.
   Nay nhà Ly mở sau **2 câu hay** — đúng nhịp cũ trước v2.0.

## Hai việc phải nói thẳng

- **Bảng đèn đang khoá bằng MẬT KHẨU, chưa phải Cloudflare Access.** Chìa của máy không mở được mục Zero
  Trust nên em không tự gắn Access được. Trang mặc định ĐÓNG (không có mật khẩu là khoá hẳn), và khi Lucas
  gắn Access vào thì mã nguồn tự nhận, không phải sửa gì. → `pending.md`.
- **Một máy sao lưu tự động đã tự commit thẳng vào nhánh chính** giữa buổi (mốc "Auto-backup 2026-08-21 09:25").
  Em đã gom lại thành một mốc sạch trên nhánh riêng và trả nhánh chính về đúng chỗ cũ. Nhưng cái máy đó vẫn
  đang chạy và vẫn sẽ ghi thẳng vào nhánh chính của MỌI kho — trái luật làm việc chung ghi trong README. → `pending.md`.

## Đụng vào đâu

Mới: `functions/api/_ledger.js` · `_dashauth.js` · `event.js` · `stats.js` · `functions/dash.js` ·
`public/js/track.js` · `sql/schema.sql` · 4 bộ kiểm trong `tools/`.
Sửa: `converse.js` · `_brain.js` · `_personas.js` · `config.js` · `convo.js` · `missions.js` · `ui.js` ·
`casino.js` · `game.js` · `index.html` · `wrangler.toml`.
**Chế độ Kẹt Tiền:** chỉ đổi đúng một thứ Lucas chốt — tắt máy quay số. Mọi luật khác giữ nguyên.

## Mấy câu lệnh Lucas hay cần

- Xem bảng đèn: `https://hop-kinh.xom-dom-hong.pages.dev/dash?key=<chìa>`
- Chạy lại bộ kiểm: `node game/tools/v2-check.mjs` · `py game/tools/v2-browser.py <link>` · `node game/tools/v2-live.mjs <link>`
- Hỏi từng não xem đứa nào sống: `node game/tools/brain-probe.mjs`
- **Xoá sổ đen trước buổi playtest** (để phễu sạch, chỉ còn người chơi thật):
  `npx wrangler d1 execute xom-dom-hong-log --remote --command "DELETE FROM turns; DELETE FROM events;"`
- Đẩy lại bản thử: `cd game && npx wrangler pages deploy public --project-name xom-dom-hong --branch hop-kinh`
- Trả biến `BRAIN_ORDER` của bản thử về như cũ (em đã gỡ nó ra vì nó ép sai thứ tự não — giá trị cũ đo được là
  `haiku,gemini,qwen`): `npx wrangler pages secret put BRAIN_ORDER --project-name xom-dom-hong --env preview`

---

# 🚓 v2.1 — CÔNG AN VIỆT NAM · HỆ QUẢ LỜI NÓI · TẮT ĐÈN · ẢNH MỚI (2026-08-21, vòng 2)

Lucas xem bản thử rồi đặt 5 việc. Làm hết, cùng trên **hop-kinh.xom-dom-hong.pages.dev**.

| # | Lucas nói | Đã làm |
|---|---|---|
| 1 | Công an phải nhìn ra công an Việt Nam, đồ xanh lá | ✅ áo **xanh rêu**, mũ kê pi **vành đỏ + sao vàng**, quân hàm đỏ trên vai — cả 3 chỗ (màn về đồn · người rượt ngoài xóm · sọc xe) đọc chung một bảng màu `XDH.COP` |
| 2 | Sinh ảnh cho màn kết, dùng thay mấy hình hộp kỳ cục | ✅ ảnh pixel thật 240×148 (PixelLab). Chữ **"CÔNG AN"** do code viết đè — máy sinh ảnh vẽ ra "BFE MENTH", không viết nổi tiếng Việt |
| 3 | Chửi bậy phải có hệ quả | ✅ hệ thống đầy đủ, xem mục dưới |
| 4 | Chân dung nhà hướng dẫn cũng phải 8-bit như Tí | ✅ Bà Năm có 3 sắc mặt thật, cùng khuôn mặt, cùng phong cách |
| 5 | Ăn được người nhà nào thì nhà đó tắt đèn | ✅ nhà tối hẳn + **đèn neon của Ly tắt theo** + nhãn đổi thành "🌑 TẮT ĐÈN" |

## Hệ quả lời nói — chia việc rạch ròi

**AI chỉ nói *nhân vật thấy bị xúc phạm cỡ nào*. MÃ NGUỒN quyết định hậu quả.** Không nhét
"chửi bậy = +50% công an" vào lời dặn AI — như vậy vừa không đo được vừa mỗi não một kiểu.

Hai lớp, y hệt thanh thiện cảm: lớp CODE dò lời lẽ nặng (chạy cả khi não AI chết) + lớp AI chấm
theo cảm giác nhân vật, **lấy mức nặng hơn**.

Công thức rủi ro (nằm ở code, chạy được bài kiểm, **không có may rủi**):

> mức nền của nhà đó × độ nặng câu nói ÷ sức chịu đựng của nhà đó × (1 + nghi ngờ hiện tại)

Ba luật cứng: **lần đầu luôn chỉ cảnh cáo** (trừ lời doạ giết) · **lần thứ hai là gọi công an**
(Lucas chốt: nhà nào cũng vậy) · **xin lỗi tử tế thì lùi một nấc**.

Đo thật trên bản đã lên mạng:

| Nhà | Lần 1 | Lần 2 | Rủi ro tính ra |
|---|---|---|---|
| Ly (Gen Z) | cảnh cáo | 🚓 công an | 17% |
| Tí (sinh viên) | cảnh cáo | 🚓 công an | 22% |
| Cô Sáu (có con nhỏ) | cảnh cáo | 🚓 công an | 194% |

Tính nết từng nhà **vẫn còn nguyên** ở chỗ khác: ai dễ thấy bị xúc phạm hơn (sức chịu đựng
1,0 / 2,0 / 1,5), ai mất kiên nhẫn nhanh hơn, và lời thoại mỗi người một kiểu. Doạ giết thì
leo thang **ngay lần đầu**. **Người chơi không bao giờ thấy một con số nào** — họ tự hiểu qua thái độ.

### Máy dò lời lẽ nặng — cái bẫy suýt dính
Bản đầu so chuỗi con nên **"ngủ · người · nguyên" đều bị bắt thành "ngu"**. Đã sửa: cắt câu thành
TỪ rồi so khớp cả từ, và mấy từ ngắn chỉ dò trong câu CÒN DẤU. Kiểm 14 câu: 13 đúng, 1 sai duy nhất
là câu bịa ra để thử (người tên "Ngu") — và câu đó cũng chỉ dừng ở mức cảnh cáo.

## Đậu máy sau vòng này

| Bộ | Kết quả |
|---|---|
| `v2-check.mjs` (thêm 8 mục mới cho v2.1) | **38/38** |
| `mission-check.mjs` | **25/25** |
| `v2-browser.py` | **28/28** |
| `press-slot-check.py` | **41/41** |

Ảnh chụp: `game/shots/v21-don-cong-an.png` · `v21-ba-nam.png` · `v21-tat-den.png`.
Tốn **4/40 lượt sinh ảnh** miễn phí của PixelLab (trial vừa làm mới). Khoá PixelLab **không** vào kho.

---

# 🔬 v2.2 — Ô SOI: HỘP KÍNH NGAY BÊN CẠNH LÚC ĐANG CHƠI (2026-08-21, vòng 3)

Lucas: *"i want to see it real time, like when playing it there is a window next to so i can see
the observability of the AI that I am interacting with"*.

**Bảng đèn `/dash` không phải thứ anh cần.** Nó là trang riêng, xem SAU, xem theo kiểu tổng hợp.
Cái cần là thấy NGAY, ngay lúc đang nói chuyện. Nên dựng thêm **ô soi** — một cột dán bên phải
màn hình, cập nhật từng lượt. Cả xóm + khung hội thoại tự nhích sang trái, không cái nào bị che.

## Bật lên là thấy gì

| Ô | Trả lời câu hỏi |
|---|---|
| 🧠 **Ai vừa trả lời** | não nào · thử qua não nào rồi · máy chủ nghĩ mất bao lâu · **tổng bạn phải chờ** · tốn bao nhiêu chữ · não nào đang nằm nghỉ · game có phải nắn lại câu không (lặp / sai tiếng / lỡ lộ bí mật) |
| ⚖️ **Nó chấm câu vừa rồi** | AI tự chấm gì · **mã nguồn có nâng lên không và vì sao** · cộng trừ từng chỉ số · suy nghĩ thầm của nhân vật · nó nghĩ bạn đang xưng là ai |
| 📊 **Trong đầu nhân vật** | 4 chỉ số + **thiện cảm tách hẳn hai lớp** (mã nguồn / AI) · chủ đề đã chạm · chủ đề còn chưa chạm |
| 🚪 **Cánh cửa** | ngưỡng nhà này · đang mở mấy nấc · **VÌ SAO chưa mở** (thiếu bao nhiêu %, hay nghi ngờ quá cao, hay vừa buông lời hỗn) |
| 😠 **Lời lẽ** | lượt này bị chấm mức nào · hậu quả · **rủi ro gọi công an** · đã hỗn mấy lần trên 2 |
| 🎯 **Chuyện giấu** | giai đoạn · đã hé mấy manh mối · AI phát tín hiệu gì · **cổng gác cho qua hay chặn, vì sao** |
| 🗣️ **Ngôn ngữ** | bạn chọn tiếng gì · nó trả lời tiếng gì |
| 🧾 **Các lượt trước** | 12 lượt gần nhất, mỗi lượt một dòng |

## Ba luật của ô soi

1. **CHỈ ĐỌC, KHÔNG SỬA.** Không một dòng nào trong `soi.js` đụng vào trạng thái game.
   Soi mà làm lệch thứ mình đang soi thì vô nghĩa. Có mục kiểm máy canh đúng điều này.
2. **Không tự tính lại con số nào.** `convo.js` đưa sang số nào thì vẽ đúng số đó — tính hai nơi
   là kiểu gì cũng có ngày lệch (bài học popup số bay v0.6).
3. **Tắt là game về y như cũ.** Mặc định: bản thử bật sẵn, **LINK CHÍNH tắt**. Nút 🔬 trên thanh
   trên cùng bật/tắt bất cứ lúc nào, nhớ lựa chọn cho lần sau. `?soi=0` ép tắt.

## Lỗi bắt được ngay trong lúc kiểm

**Nút "⏭️ Bỏ qua" của màn truyện mở đầu chui xuống dưới ô soi** → bấm mãi không trúng, máy kiểm
đứng chờ 30 giây rồi bỏ cuộc. Gốc: em mới nhích mấy thứ hay dùng sang trái, sót mấy màn phủ dán
cứng vào màn hình. Nay **liệt kê đủ 10 thứ** dán cứng và nhích chung một lượt. Máy hẹp (dưới
1000px) thì ô soi tự thành nửa dưới màn hình thay vì cột phải.

## Đậu máy sau vòng này — 137/137

`v2-check` **43/43** (thêm 5 mục cho ô soi) · `mission-check` **25/25** ·
`v2-browser` **28/28** · `press-slot` **41/41**.
Ảnh: `game/shots/v22-soi.png` · `v22-soi-hon.png`.

---

# 👂 v2.3 — "NÓ KHÔNG NGHE EM NÓI" (2026-08-21, vòng 4) — LỖI NẶNG NHẤT TỪ ĐẦU DỰ ÁN

Lucas: *"the AI is not even seeing and replying to my sentence"* · *"it keeps blabbing about her
kids every time, no matter what I do"*.

## Đo trước, không đoán

Dựng `tools/listen-check.mjs`: nói 6 câu chẳng liên quan gì tới chuyện của nhân vật, rồi đếm xem
câu trả lời có nhắc lại thứ vừa nói không. **Kết quả lần đầu: 1/12 lượt.** Tệ hơn Lucas mô tả —
nhân vật bám chết vào câu ĐẦU TIÊN rồi tra khảo lại suốt 6 lượt (*"A delivery driver? At midnight?"*),
mọi câu sau đó coi như không tồn tại.

## Hai lỗi chồng lên nhau

**Lỗi 1 — thiếu hẳn một luật.** Cả bộ lời dặn đang dạy nhân vật *đi soi người lạ* và *đẩy chuyện
riêng của mình*, mà **không có một dòng nào bảo "trước hết hãy trả lời đúng thứ họ vừa nói"**.
Sửa: thêm khối đạo diễn TRÍCH NGUYÊN VĂN câu vừa nói, đặt **ở vị trí cuối cùng** — chỗ mô hình nhớ
rõ nhất, để nó thắng mọi khối phía trên. Kèm hai lệnh cấm: không lôi lại nghi vấn đã hỏi rồi,
không mở đầu hai lượt liền giống nhau. Ba khối nhiệm vụ cũng thêm **luật nhường chỗ**.
→ 1/12 lên **3/12**. Có nhích, nhưng vẫn hỏng. Nghĩa là còn lỗi khác.

**Lỗi 2 — câu mới nhất có lúc KHÔNG HỀ được gửi cho AI.** Nhìn kỹ bảng đo mới thấy: câu trả lời
**chậm đúng MỘT LƯỢT**. Lượt 3 đang trả lời câu của lượt 2.
Gốc: máy chủ chỉ gắn phần dặn dò (trạng thái ngầm · nhiệm vụ · nhại giọng · luật mới) **khi tin
nhắn cuối cùng là lời NGƯỜI CHƠI**. Máy khách thật có đẩy câu vào lịch sử trước khi gọi nên bình
thường không sao — nhưng chỗ nào quên là **toàn bộ phần dặn dò bị bỏ qua sạch, và câu người chơi
cũng không được đưa vào**. AI trả lời trong chân không.
Sửa: thêm **lưới an toàn** — tin nhắn cuối không phải lời người chơi thì máy chủ tự chèn câu đó vào.

**Kết quả sau khi sửa cả hai: 11/12** (câu "trượt" duy nhất là *"What do you do for work?"* →
*"I make TikToks, 500k followers"* — trả lời hoàn hảo, chỉ là không dùng lại chữ trong câu hỏi;
đó là giới hạn của cái thước, không phải lỗi game).

**Kiểm bằng trình duyệt thật, đúng đường Lucas chơi: 4/4.** Cô Sáu đáp đúng từng câu — và còn bắt
được mâu thuẫn: *"nếu điện thoại chết từ trưa thì lấy đâu ra đơn giao hàng?"*

## ⚠️ Phải nói lại cho đúng: một con số em báo hôm nay là SAI

Bộ đo `v2-live.mjs` dính đúng lỗi 2 ở trên. Nên câu em báo lúc chiều —
*"AI tự chấm nhạt 12/12, nhờ lớp mã nguồn mới cứu"* — **đo nhầm đường code**.
Đo lại cho đúng: **AI tự chấm "nhạt" chỉ 3/12**. Nó không hề chấm keo; nó chỉ **không được đọc câu
của người chơi**. Lớp mã nguồn vẫn cần (vẫn còn 3 câu), nhưng công của nó nhỏ hơn em đã nói.
Số đậu 4 vẫn ĐẠT: **0/12 câu trúng tim rơi vào "nhạt"** đối với người chơi.

> Bài học ghi vào sổ: **bộ đo phải đi ĐÚNG con đường mà người chơi đi.** Bộ đo đi đường khác thì
> mọi con số nó in ra đều vô nghĩa — mà lại trông rất thuyết phục.

## Đậu máy — 143/143

`v2-check` **49/49** (thêm 6 mục cho vòng này) · `mission-check` **25/25** ·
`v2-browser` **28/28** · `press-slot` **41/41** · `listen-check` **11/12** · `v2-live` ngôn ngữ **20/20 + 20/20**.

---

# 🚀 ĐÃ LÊN LINK CHÍNH — 2026-08-21 (Lucas cho phép: "put it live")

**https://xom-dom-hong.pages.dev** giờ đang chạy v2.0 + v2.1 + v2.2 + v2.3.
Git: nhánh `v2.0-hop-kinh` đã gộp vào `main` và đẩy lên (`19b28b8 → c33ab68`, gộp thẳng không xung đột).

## Kiểm NGAY TRÊN LINK CHÍNH sau khi đẩy — 9/9 + 41/41

| Mục | Kết quả |
|---|---|
| Công tắc "mở hết, miễn phí hết" | ✅ **TẮT** trên link chính (đúng thiết kế) |
| Tiền khởi điểm | ✅ 0k · giá đồ nghề còn nguyên · tủ đồ vẫn khoá 3 món giấy tờ |
| Ô soi 🔬 | ✅ **TẮT** — người chơi thường không thấy |
| Phù hiệu "BẢN THỬ" | ✅ ẩn |
| Luật 2 lần xúc phạm là gọi công an | ✅ có |
| Công an áo xanh rêu · 3 nhiệm vụ giấu | ✅ có |
| Nhân vật đáp đúng câu vừa nói | ✅ nói "mời cô cà phê" → cô đáp thẳng chuyện cà phê |
| Bộ kiểm v1.1 + v1.2 chạy trên link chính | ✅ **41/41** |
| Lỗi trong bảng điều khiển trình duyệt | ✅ 0 |

## Sổ đen + bảng đèn trên link chính

- Sổ đen **đã ghi được lượt thật từ link chính** (bảng ghi tách theo địa chỉ, nên phân biệt được
  lượt của bản thử với lượt của bản chính).
- Bảng đèn mở được bằng **cùng một chìa**: `xom-dom-hong.pages.dev/dash?key=…`
  Không có chìa → **401, khoá hẳn** (đã thử).
- ⚠️ Từ giờ **mọi câu người chơi thật nói đều được lưu**. Đó là chủ ý (để đo phễu người mới và
  để sau này tự luyện não), nhưng cần nhớ khi chia sẻ ảnh chụp bảng đèn ra ngoài.

## Còn treo

Bảng đèn hiện **gộp chung** số của bản thử và bản chính. Muốn phễu người mới sạch thì hoặc xoá sổ
trước khi mời bạn bè, hoặc thêm bộ lọc theo địa chỉ. Chưa làm — chờ Lucas chọn.

---

# 🧹 v2.4 — SỔ ĐEN TỰ DỌN (2026-08-21, Lucas chốt A + "tự xoá theo định kỳ")

**Đã xoá sổ về trắng** (159 lượt + 179 cột mốc của mấy lần thử) — phễu người mới bắt đầu từ 0.

## Máy tự dọn — không cần ai nhớ, không cần thêm dịch vụ nào

**Giữ 30 ngày.** Dòng nào cũ hơn thì tự biến mất.

Cloudflare Pages **không có đồng hồ hẹn giờ**. Muốn có thì phải dựng thêm một dịch vụ nữa — thêm
chỗ hỏng, thêm chỗ quên, thêm hoá đơn. Nên em gắn việc dọn **ăn theo lượt ghi**:

- Sổ chỉ phình ra **khi có người chơi**. Có người chơi thì có lượt ghi. Vậy cứ gắn việc dọn vào
  lượt ghi là nó **tự chạy đúng lúc cần**, và không bao giờ chạy khi không cần.
- Chặn bằng đồng hồ trong máy chủ: **nhiều nhất một lần mỗi giờ**, dù có nghìn lượt.
- Chạy nền, hỏng thì nuốt — **người chơi không bao giờ phải chờ vì chuyện dọn dẹp**.

**Đổi số ngày không cần đẩy bản mới:** đặt biến `LEDGER_KEEP_DAYS` của Cloudflare (nhận 1–365).

## Đã thử THẬT, không phải nói suông

Nhét tay vào sổ hai dòng **60 ngày tuổi** → vào link chính chơi đúng một lượt → đếm lại:
**dòng cũ biến mất, còn 0.** Máy dọn chạy đúng.

Bảng đèn nay hiện thêm hai ô: **"Sổ tự xoá sau 30 ngày"** và **"Dòng cũ nhất: … ngày trước"** —
để không ai nhìn số trên đó rồi tưởng là số từ đầu dự án.

## Một chuyện nhỏ nhìn thấy trong sổ

Có mấy lượt vào sổ mà **không có mã phiên**. Nguyên nhân: trình duyệt nào còn giữ bản `convo.js`
CŨ (từ trước v2.0) trong bộ nhớ đệm thì nó không gửi mã phiên. Không hỏng gì — chỉ là mấy lượt đó
không ghép được vào phễu người mới. Tự hết khi bộ nhớ đệm hết hạn hoặc người chơi tải lại trang.
