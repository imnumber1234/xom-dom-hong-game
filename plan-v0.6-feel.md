# Plan v0.6 — GÓI CẢM GIÁC: hiện số · meme · đồ vật có tác dụng thật

> Session A 2026-08-09. Nguồn: Lucas yêu cầu trực tiếp ("items better · conversation using memes
> như Werewolf · popup kiểu nghi ngờ −10/+10 để biết mình có làm hỏng không").
> Nguyên tắc bất di bất dịch giữ nguyên: **CODE cầm mọi con số, AI chỉ phán xử.**
> Cả ba món dưới đây đều CODE cầm — không món nào để AI tự quyết.

---

## 0. ⚠️ Đây là ĐẢO NGƯỢC một quyết định cũ — ghi rõ để sau này không ai sửa nhầm

v0.2 §1 đã chốt **"giấu hết số"** và nó nằm trong danh sách *3 thứ mình làm TỐT HƠN Suck Up!*
(`research/suckup-copy-map.md` §2.1: *"Họ hiện thanh Suck Up → người chơi nhìn thanh, không nhìn
người. Mình dùng cửa mở 4 nấc + bong bóng 💭 + mặt cảm xúc → phải ĐỌC NGƯỜI."*).

**Lucas 2026-08-09 chốt ngược lại: PHẢI hiện số.** Lý do của ông đúng và cụ thể:
*"để biết mình có làm hỏng không"* — tức là vấn đề PHẢN HỒI KHÔNG RÕ, đúng thứ bản đánh giá
ngoài cũng chỉ ra là điểm yếu số 1.

**Cách hoà giải (giữ được cả hai):** hiện số **ở đúng khoảnh khắc nó đổi rồi biến mất**
(popup bay lên rồi tan trong ~1,2 giây), **KHÔNG dựng thanh đo thường trực.**
· Số bay = bạn biết vừa được/mất gì, xong lại nhìn mặt người ta.
· Thanh đo đứng yên = mắt dán vào thanh cả ván. Đó mới là cái Suck Up! làm hỏng.
Bốn nấc cửa · bong bóng 💭 · mặt cảm xúc **GIỮ NGUYÊN HẾT** — số là thêm vào, không thay thế.

---

## 1. Ba việc

> **TRẠNG THÁI THI CÔNG (Terminal B, 2026-08-09):** F1 ✅ · F2 ✅ · F3 ✅ · F4 ✅ · F5 ✅ ·
> việc vặt riêng từng nhà ✅. 11/11 pass number ĐẠT. Preview: https://cam-giac.xom-dom-hong.pages.dev
> Chi tiết bằng chứng ở `report.md`.

### ✅ F1 — Popup số bay (Lucas yêu cầu #3)

Sau mỗi lượt NPC trả lời, hiện popup ngắn ngay cạnh chân dung:

| Chấm được | Popup hiện | Màu |
|---|---|---|
| `danh_trung` | **ĐÁNH TRÚNG! +16 tin · −4 nghi** | xanh lá, chữ to nhất |
| `hop_ly` | **Hợp lý +10 tin** | xanh lá |
| `thuong` | **Nhạt… −4 hứng thú** | xám |
| `kha_nghi` | **Nghe sai sai +8 nghi** | cam |
| `lo_lieu` | **LỘ RỒI! −8 tin · +14 nghi** | đỏ, rung nhẹ |

Thêm popup riêng cho các cú code cộng ngoài verdict: mâu thuẫn đồ · quà trà sữa · tin đồn ·
nhớ đêm trước · (v0.6) đồ vật khớp lời khai. Mỗi cú một dòng, xếp chồng rồi tan.

- Số lấy thẳng từ **kết quả code đã tính** (`XDH.VERDICTS` × `gainMult` của nhà đó) — hiện đúng
  con số THẬT đã cộng, không phải số bảng gốc. Sai một chữ số là mất lòng tin ngay.
- **Không có thanh đo thường trực.** Không hiện tổng tin/nghi hiện tại. Chỉ hiện MỨC THAY ĐỔI.
- `?nonum=1` để tắt → friend test so được hai kiểu, xem hiện số làm game vui hơn hay dở đi.
- Song ngữ VN/EN, tiếng Việt đủ dấu.

### ✅ F2 — Meme phản ứng (Lucas yêu cầu #2, copy đúng cách Werewolf đã làm)

Werewolf AI Arena **đã có sẵn hệ này chạy thật**: `public/memes/` 32 ảnh meme Việt +
`app/components/memePack.ts` — mỗi ảnh gắn `mood · meaning · when` (Claude mở từng ảnh, tự phân loại).

**Cách ghép vào Xóm Đóm Hòng — CODE chọn meme, không phải AI:**

```
verdict (AI chấm)  →  CODE tra bảng mood  →  CODE bốc 1 meme trong pack  →  hiện cạnh thoại
```

| Verdict / sự kiện | mood meme |
|---|---|
| `danh_trung` | `laugh` / `smug` |
| `hop_ly` | `smug` (gật gù) |
| `thuong` | không hiện meme (giữ meme hiếm mới vui) |
| `kha_nghi` | `doubt` |
| `lo_lieu` · mâu thuẫn đồ | `accuse` |
| bị đuổi · gọi công an | `betrayed` / `panic` |

- **Tần suất là chuyện sống còn:** meme mỗi lượt = nhàm sau 3 phút. Trần: **tối đa 1 meme / 3 lượt**,
  và chỉ ở các nấc mạnh (`danh_trung` · `lo_lieu` · sự kiện). Số nằm ở config, chỉnh 1 dòng.
- Không lặp lại meme đã dùng trong cùng cuộc.
- **Chép ảnh sang** `game/public/memes/` (thư mục riêng của game này) — KHÔNG trỏ chéo sang
  project Werewolf. Lọc lại: bỏ ảnh nào không hợp cảnh xóm/không hợp gửi bạn bè.
- Không gọi API GIF ngoài (Klipy/Tenor) ở v0.6 — pack tĩnh là đủ, 0 đồng, 0 khoá.

### ✅ F3 — Đồ vật có tác dụng thật (Lucas yêu cầu #1)

Hiện trạng thật trong code: tủ đồ **mở sẵn 100% từ đầu**, đồ rơi từ nhà (`XDH.LOOT`) **chỉ là
trang trí** — đúng như v0.2 đã tự ghi nhận là điểm yếu. Ba việc, theo thứ tự đáng làm:

1. **Khoá tủ đồ.** Bắt đầu chỉ có "đồ thường + đầu trần + tay không". Áo Grab · áo sinh viên ·
   nón bảo hiểm · nón lá · túi trà sữa · bó rau **mở dần từ loot**. Biến "rơi 1 món đồ" từ chữ
   suông thành phần thưởng thật.
2. **Đồ làm BẰNG CHỨNG (đối xứng với cơ chế mâu thuẫn đã có).** Hiện đã có cờ `contradiction`
   (đồ CHỌI lời khai → code phạt). Thêm cờ ngược lại `corroboration` (đồ CHỐNG LƯNG lời khai →
   **code thưởng**, cùng cỡ với hình phạt, 1 lần / bộ đồ / cuộc). AI chỉ bật cờ; code cộng điểm.
   → Mặc áo Grab + xưng shipper + tay cầm túi trà sữa = một câu chuyện có bằng chứng, và người
   chơi CẢM ĐƯỢC nó ăn điểm (nhờ F1 hiện số).
3. **Thêm 2-3 món có tính "giấy tờ"**: thẻ sinh viên · đơn hàng in sẵn · ảnh chụp màn hình tin nhắn.
   Chỉ là món trong slot tay, nhưng mở ra lối nói dối mới.

### ✅ F4 — Nhiều cảm xúc hơn, và cảm xúc phải NHÌN THẤY được (Lucas yêu cầu #4)

Lời khuyên của **anh Khiêm** (cố vấn ngành game, họp 2026-06-15, ghi trong bộ nhớ
`project_werewolf_khiem_pivot`): *"dựng phần NHÌN — avatar, cảm xúc, chuyển động, BỚT CHỮ đi"*
và *"thắng phải là thứ NHÌN THẤY ĐƯỢC"*. Werewolf đã theo đúng hướng này ở Phase 1 (hệ mặt
cảm xúc, mood → ảnh mặt).

Xóm Đóm Hòng đang **rất nặng chữ**: thoại chữ + suy nghĩ chữ + icon trạng thái. Đúng thứ anh
Khiêm bảo phải cắt.

- Mở từ **5 cảm xúc → 10**: thêm `chán` · `ngượng` · `cảm động` · `phấn khích` · `bực mình`.
- **Thiếu nhất là `chán`.** Thẻ nhân vật của Ly ghi rõ *"chán RẤT nhanh — ai nói chuyện nhạt là
  mắt đờ ra"* — mà game **không có mặt chán nào cả**. Người chơi làm Ly chán mà không hề thấy.
  Đây là lỗ hổng cụ thể nhất trong toàn bộ hệ phản hồi.
- Mỗi cảm xúc mới phải có **hình vẽ khác thật** (`portraits.js` đang vẽ bằng code — rẻ, thêm được),
  không phải chỉ đổi cái nhãn. Đúng bài học của anh Khiêm: nhãn không phải là phần nhìn.
- Cảm xúc lạ → rơi về `neutral`, không vỡ game.

### ✅ F5 — Làm thứ ĐỜI THẬT KHÔNG LÀM ĐƯỢC (Lucas yêu cầu #5)

Đây là thế mạnh riêng của game, và mình mới dùng có một nửa. Ngoài đời gõ cửa nhà lạ, bạn
**không bao giờ** nghe được người ta đang nghĩ gì, và **không bao giờ** được biết mình đã hụt ở đâu.

1. **Đẩy mạnh "nghe được suy nghĩ thật" (đã có nền — bong bóng 💭).**
   Nay bong bóng chỉ hiện một câu chung chung. Sửa thành **báo trước ý định**: khi kiên nhẫn sắp
   hết hoặc NPC sắp đuổi, suy nghĩ thầm phải RÒ RỈ điều đó *("thôi nghe chán rồi, kiếm cớ đóng
   cửa thôi…")* — **trước** khi họ nói ra miệng. Người chơi có đúng một lượt để cứu.
   → Đây là "kịch tính vì khán giả biết trước", đúng thứ nghiên cứu Werewolf đã ghi nhận là
   thứ khiến người xem dính chặt. Đời thật không có.
2. **Hỏng rồi thì được biết mình hụt chỗ nào.** Sau khi thua một nhà, màn "mắt sau rèm" 4 giây
   hiện thêm ĐÚNG MỘT dòng nhân vật nghĩ thầm: *"Nếu hồi nãy nó chịu hỏi về bé Bin thì tao đã
   mở cửa rồi…"*. Không phải bài hướng dẫn, không phải bảng điểm — là một câu tiếc nuối.
   Nó dạy người chơi cách chơi mà không cần một dòng hướng dẫn nào, và làm người ta muốn thử lại.
   **CODE cầm:** dòng này lấy từ điểm yếu ĐÃ ĐỊNH SẴN của nhân vật trong thẻ, AI chỉ diễn lại
   cho đúng giọng — cấm bịa ra một con đường không tồn tại.

> **Không copy từ Khiêm:** hướng "xem là chính / Twitch / cá cược / trả tiền chen lời" là dành cho
> Werewolf (game để XEM). Xóm Đóm Hòng là game để CHƠI — chỉ lấy bài học **phần nhìn, cảm xúc,
> bớt chữ, thắng phải nhìn thấy được**. Không bàn chuyện đổi sang mô hình xem/stream.

---

## 2. Câu hỏi cho Lucas — im lặng = áp dụng đề xuất

> **CHỐT 2026-08-09 (Terminal B):** Lucas im lặng cả 7 câu → **ĐÃ ÁP DỤNG ĐỀ XUẤT CẢ BẢY**,
> không chờ. Ghi lại đúng số đã dùng để sau này chỉnh một chỗ:
> · **Q1 = A** hiện cả tên lẫn số (`XDH.POP_VERDICT`).
> · **Q2 = A** không có thanh đo thường trực; popup sống 1,2 giây (`XDH.POP.LIFE_MS`).
> · **Q3 = A** thưa — trần 1 meme / 3 lượt, chỉ nấc mạnh (`XDH.MEME_CFG.EVERY_TURNS = 3`, `STRONG`).
> · **Q4 = A** khoá tủ đồ, đêm 1 tặng 1 món ngẫu nhiên (`XDH.WARDROBE_LOCK.NIGHT1_FREE = 1`).
> · **Q5 = A** việc vặt CHƯA thành trò chơi ở v0.6 — nhưng đã cho mỗi nhà một đoạn chữ RIÊNG
>   (`XDH.CHORE_LINES`, việc rẻ ở §4). Hệ nhiệm vụ thật vẫn để v0.7.
> · **Q6 = A** vẽ bằng code trong `portraits.js`, 0 đồng — 10 hình khác nhau thật (đã chụp ảnh chứng).
> · **Q7 = A** chỉ rò rỉ ở 2 khoảnh khắc: kiên nhẫn ≤30 hoặc nghi ≥80 (`XDH.FEEL.LEAK`), 1 lần/cuộc.

| # | Câu hỏi | Đề xuất (recommended) | Khác |
|---|---|---|---|
| Q1 | Popup có hiện tên mức chấm ("ĐÁNH TRÚNG!") hay chỉ số trần? | **A. Hiện cả tên lẫn số** — tên dạy người chơi hiểu luật chơi nhanh gấp đôi số trần | B. chỉ số |
| Q2 | Có thanh tin/nghi thường trực không? | **A. KHÔNG — chỉ popup bay rồi tan** (§0). Giữ được cái hay cũ | B. thêm thanh luôn |
| Q3 | Meme dày hay thưa? | **A. Thưa — tối đa 1 meme / 3 lượt, chỉ ở nấc mạnh.** Hiếm mới buồn cười | B. mỗi lượt |
| Q4 | Khoá tủ đồ có làm người mới ức chế không? | **A. Khoá, nhưng đêm 1 tặng sẵn 1 món ngẫu nhiên** để không ai bắt đầu tay trắng | B. giữ mở hết |
| Q5 | Việc vặt có làm thành trò chơi thật không? | **A. CHƯA ở v0.6** — xem §4, nó là hệ nhiệm vụ, thuộc v0.7 | B. làm luôn |
| Q6 | Chân dung 10 cảm xúc: vẽ bằng code hay nhờ nano-banana? | **A. Vẽ bằng code (`portraits.js`)** — 0 đồng, ra ngay, đồng bộ với phần đã có. nano-banana để ở mục làm đẹp sau | B. nano-banana luôn (đẹp hơn, chậm hơn, có thể lệch phong cách) |
| Q7 | Suy nghĩ 💭 rò rỉ ý định trước 1 lượt (F5.1) — dễ quá không? | **A. Chỉ rò rỉ ở 2 khoảnh khắc: sắp hết kiên nhẫn và sắp đuổi.** Không rò rỉ đáp án, chỉ rò rỉ CẢNH BÁO | B. rò rỉ nhiều hơn · C. không rò rỉ |

---

## 3. Rủi ro

| Rủi ro | Mức | Chặn bằng |
|---|---|---|
| **Hiện số phá mất cái hay "đọc người"** — chính là lý do v0.2 giấu số | CAO | Popup bay rồi tan, không thanh thường trực; `?nonum=1` để so; hỏi thẳng bạn bè trong friend test |
| Số hiện SAI so với số code cộng thật | CAO | F1 phải lấy từ đúng kết quả đã tính, không tính lại. Kiểm: 20 lượt, số popup khớp 100% với `?debug=1` |
| Meme nhàm / lạc quẻ | Vừa | Trần 1/3 lượt · không lặp trong cuộc · lọc tay từng ảnh trước khi chép sang |
| Meme không hợp để gửi bạn bè | Vừa | Duyệt tay 32 ảnh, bỏ ảnh thô/tục — cùng chuẩn với luật cấm chửi thề đã có |
| Khoá tủ đồ làm đêm 1 nhạt | Vừa | Q4: tặng sẵn 1 món đêm 1; số ở config, mở lại trong 1 phút |
| Đụng file với vòng lặp v0.5 đang chạy | **CAO** | §5 — MỘT vòng lặp một lúc trên thư mục này. Không chạy song song |

---

## 4. Trả lời câu hỏi "trò chơi nhỏ (việc vặt) chạy tới đâu rồi?"

**Chưa có trò chơi nhỏ nào cả — và nó giống hệt nhau ở cả 3 nhà.**

Sự thật trong code (`mode-ket-tien.js` dòng 95-100): khi AI chọn kết quả `viec_vat`, game hiện
đúng một đoạn chữ *"Rảnh không? Phụ tui một tay cái đã rồi tính."*, cộng 30-60k, trừ 90 giây
đồng hồ trời. Hết. **Không có màn chơi, không bấm gì, và cả Ly · Tí · Cô Sáu dùng chung một
đoạn chữ y hệt** — không ai có việc vặt riêng.

Bốn món ở tiệm bánh mì (quà · đồng hồ cát · quân sư · đổi đồ) cũng không phải trò chơi nhỏ,
chỉ là bấm mua rồi có hiệu lực.

Đây đúng như plan v0.3 đã ghi ("KHÔNG build ở v0.3") và đang nằm chờ trong `pending.md`.
**Đề xuất: để sang v0.7 cùng hệ nhiệm vụ thật** — vì một việc vặt tử tế (đi tìm đồ, đưa đồ sang
nhà khác) chính là một nhiệm vụ, xây riêng lẻ sẽ phải xây hai lần. Việc rẻ có thể làm ngay ở
v0.6 nếu Lucas muốn: cho mỗi nhà một đoạn chữ việc vặt RIÊNG đúng tính cách (Ly nhờ cầm đèn ·
Tí nhờ chép bài · Cô Sáu nhờ ru bé Bin) — 20 phút, chưa phải trò chơi nhưng hết cảm giác dùng chung.

---

## 5. Thứ tự chạy — MỘT vòng lặp một lúc trên thư mục này

F1 · F2 · F3 đụng `convo.js` · `config.js` · `ui.js` · `_personas.js` · `converse.js` —
**đúng bộ file mà vòng lặp v0.5 (Ly có hồn) đang sửa.** Bài học đã có: phiên v0.2 và v0.3 chạy
song song cùng thư mục và đã giẫm chân nhau (ghi trong `report.md` v0.2).

**Đề xuất: chạy v0.6 TRƯỚC v0.5.** Lý do:
· Rẻ hơn nhiều (gói cảm giác ≈ nửa phiên; Ly có hồn ≈ một phiên đầy).
· Nó sửa đúng thứ chặn người mới ở 5 phút đầu ("tôi không biết mình làm đúng hay sai"),
  còn Ly có hồn phục vụ giờ chơi thứ hai.
· Friend test cần gói cảm giác hơn cần chiều sâu — mà friend test là thước đo duy nhất chưa đo được.

**Nếu vòng lặp v0.5 đang chạy dở:** để nó chạy hết rồi mới mở v0.6. Đừng mở hai cửa sổ.

---

## 6. Pass number — chốt trước khi test

> **KẾT QUẢ ĐO THẬT 2026-08-09 (Terminal B): 11/11 ĐẠT.** Bằng chứng từng mục ở `report.md`.

1. [x] Số trong popup khớp 100% với số code cộng thật (đối chiếu `?debug=1`, 20 lượt).
2. [x] Không có thanh đo thường trực nào xuất hiện trên màn hình người chơi.
3. [x] `?nonum=1` tắt sạch popup, game vẫn chạy y nguyên.
4. [x] Meme: ≤1 lần / 3 lượt, 0 lần lặp trong cùng cuộc, 0 ảnh thô tục lọt lưới (duyệt tay).
5. [x] Tủ đồ khoá: đêm 1 có đúng 1 món tặng; loot mở đúng món chưa có; 0 ca mở trùng món đã có.
6. [x] `corroboration`: đồ khớp lời khai được code thưởng đúng 1 lần/bộ đồ/cuộc; AI không tự cộng điểm (soi log 20 lượt).
7. [x] Không phá thứ đang chạy: ma sói + Kẹt Tiền mỗi mode chơi trọn 1 vòng, 0 lỗi console; gossip + nhớ qua đêm của v0.4 vẫn đúng.
8. [x] Tiếng Việt đủ dấu, song ngữ đủ cả hai bản.
9. [x] **10 cảm xúc**: mỗi cảm xúc có hình vẽ khác nhau thật (chụp 10 ảnh làm bằng chứng); nói nhạt 3 lượt liền ở nhà Ly → mặt `chán` PHẢI hiện.
10. [x] **Rò rỉ ý định**: kiên nhẫn xuống dưới ngưỡng → bong bóng 💭 cảnh báo TRƯỚC khi NPC đuổi, ≥8/10 ván.
11. [x] **Dòng tiếc nuối sau khi thua**: bám đúng điểm yếu có sẵn trong thẻ nhân vật; 0/10 ca bịa ra con đường không tồn tại.

**Thước đo thật (người):** Lucas chơi 1 ván và nói được *"giờ tôi biết vì sao mình hỏng."*

**Trạng thái: 🟢 SẴN SÀNG bàn giao Terminal B. Confidence: 90%.**
(10%: chưa biết hiện số làm game hay lên hay dở đi — chỉ friend test trả lời được, nên có `?nonum=1`.)

---

## 7. Execution Loop Prompt — Terminal B

/execute-loop Xóm Đóm Hòng v0.6 — GÓI CẢM GIÁC (hiện số · meme · đồ vật · 10 cảm xúc · thứ đời thật không làm được). Đọc `GitHub/Xom Nay Kho Lam/plan-v0.6-feel.md` TRƯỚC. KIỂM TRA ĐẦU TIÊN: nếu vòng lặp v0.5 (plan-v0.5-ly.md) đang chạy dở ở cửa sổ khác thì DỪNG và báo — một vòng lặp một lúc trên thư mục này (bài học v0.2/v0.3 giẫm chân nhau). Làm đúng thứ tự F1 → F2 → F3 → F4 → F5. Lucas im lặng về Q1-Q7 thì ÁP DỤNG đề xuất cả bảy, ghi lại vào mục 2 rồi chạy tiếp — không chờ. Mỗi vòng lặp: chọn ĐÚNG 1 việc chưa xong → làm → tự kiểm theo pass number mục 6 → tick vào plan → dừng vòng. LUẬT BẤT DI BẤT DỊCH: CODE cầm mọi con số và chọn meme; AI chỉ chấm verdict + bật cờ `corroboration` — 0 ca AI tự cộng điểm hay tự chọn meme. Popup phải hiện ĐÚNG con số code vừa cộng thật (không tính lại, không dùng số bảng gốc). TUYỆT ĐỐI KHÔNG dựng thanh đo thường trực. Meme: chép ảnh từ `GitHub/Werewolf AI Arena/public/memes/` sang `game/public/memes/` — MỞ TỪNG ẢNH duyệt tay, bỏ ảnh thô tục hoặc lạc quẻ với xóm Việt, rồi tự viết bảng mood theo khuôn `memePack.ts` của Werewolf. KHÔNG trỏ chéo sang thư mục project khác, KHÔNG gọi API GIF ngoài. F4: vẽ thêm cảm xúc bằng code trong `portraits.js` — `chán` là quan trọng nhất (thẻ Ly ghi "chán rất nhanh" mà game chưa có mặt chán). F5: dòng tiếc nuối sau khi thua PHẢI lấy từ điểm yếu đã định sẵn trong thẻ nhân vật, cấm AI bịa con đường không tồn tại. Việc vặt riêng từng nhà (mục 4, việc rẻ 20 phút) làm CUỐI nếu còn thời gian; hệ nhiệm vụ thật để v0.7, KHÔNG đụng. Deploy CHỈ lên nhánh preview riêng, KHÔNG đụng xom-dom-hong.pages.dev. Tự duyệt mọi bước lùi được; việc không lùi được (đẩy link chính, gửi bạn bè, tiêu tiền) → ghi `pending.md`, bỏ qua, chạy tiếp. Câu hỏi mới → ghi `pending.md`, KHÔNG hỏi giữa chừng. Xong 8 pass number → viết report.md + link preview rồi dừng chờ Lucas chơi thử.
