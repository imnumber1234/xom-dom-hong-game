# v2.0 — ĐỘNG CƠ CỦA SÓI + THANH THIỆN CẢM + HỘP KÍNH (Session A, 2026-08-21)

> Trạng thái: 🟡 **CHỜ LUCAS** — đây là bản nháp kế hoạch. Chưa đủ tin cậy 90% vì còn 9 câu hỏi ở mục 6.
> Nền: `research/ai-games-2026.md` (nghiên cứu ngành 21/08) + đo THẬT trên link chính (mục 1).

---

## 1. ĐO THẬT trước khi bàn — chạy trên link chính 2026-08-21

Gọi thẳng `xom-dom-hong.pages.dev/api/converse` (5 lượt lẻ + 1 cuộc 4 lượt liền mạch, nhân vật Ly, `?debug=1`).

### 1a. Điều TỐT — hệ thống CÓ chạy
Cuộc 4 lượt liền mạch, nói đúng chuyện Ly mê (clip · TikTok · trend · fan):

| Lượt | Chấm | Tin | Nghi | Hứng thú | Kiên nhẫn |
|---|---|---|---|---|---|
| 1 | `thuong` (nhạt) | 30 | 20 | 46 | 96 |
| 2 | `danh_trung` (trúng tim) | 46 | 16 | 54 | 98 |
| 3 | `danh_trung` | **62** ✅ | 12 | 62 | 100 |
| 4 | `kha_nghi` | 62 | 20 | 62 | 98 |

Ngưỡng mở cửa của Ly là **55**. Lượt 3 đã vượt.

### 1b. Bốn lỗi ĐO ĐƯỢC, không phải đoán

| # | Lỗi | Bằng chứng | Gốc rễ |
|---|---|---|---|
| **A** | **Đủ điểm mà cửa VẪN KHÔNG MỞ** | Tin 62 ≥ ngưỡng 55, nghi 12 (thấp), nhưng `invite_intent=false` cả 4 lượt → cửa đóng | `convo.js:549` — cửa mở cần **CẢ HAI**: điểm đủ **VÀ** AI tự nguyện mời. Có đường tự lành cho chiều ngược lại (AI muốn mời mà điểm thiếu → code nhích +4), **không có** đường tự lành cho chiều này |
| **B** | **Lượt 1 luôn bị chấm "nhạt"** | 6/6 lần thử, kể cả câu trúng tim → hứng thú **−4** ngay câu chào | Ấn tượng đầu tiên luôn bị phạt. Người mới chơi lãnh trọn |
| **C** | **AI bịa lời người chơi rồi bắt bẻ** | Lượt 4: Ly nói *"nãy anh nói… quay trend ăn lém"* — người chơi **chưa từng** nói câu đó → Ly kết tội mâu thuẫn → nghi +8 | Não đang chạy là **Qwen**, không phải Gemini |
| **D** | **Não tốt nhất đang CHẾT ở bản thật** | `debug.bench = {gemini: 597}` → Gemini vừa lỗi, bị cho nghỉ 10 phút. Cả 9/9 lượt đều chạy bằng **Qwen** | Trong bài so găng của chính mình: Gemini **4.3 điểm giọng**, Qwen **3.5**. Game đang chạy bằng não hạng hai mà **không ai biết** |

> **Lỗi D chính là lý do sâu nhất của câu "AI không nghe lời em".** Không có hộp kính thì không ai phát hiện được.
> Cảnh báo trung thực: bộ đo của em gọi API trực tiếp, không qua trình duyệt. Lần chạy đầu em gửi sai định dạng lịch sử
> (`{role,content}` thay vì `{role,text}`) nên tưởng hệ thống chết hoàn toàn — **sai, đã sửa và chạy lại**. Bảng 1a là bản đúng.

### 1c. Điều bất ngờ nhất — **thanh thiện cảm đã có sẵn 70%**
`config.js` dòng ~348 đã có bảng `XDH.REGRET`: mỗi nhân vật một danh sách **chủ đề + từ khoá**.

| Nhân vật | Chủ đề mê | Từ khoá đã viết sẵn |
|---|---|---|
| Cô Sáu | bé Bin · chợ búa · nói nhỏ · nghe tám | bin, bé, con, cute / chợ, rau, thịt, giá / nhỏ, khẽ, ồn / xóm, hàng xóm, kể |
| Tí (sinh viên) | bóng đá · đời sinh viên · rủ coi chung | bóng, banh, đá, MU, Arsenal / trọ, mì, deadline, nhớ nhà / coi chung, đồ ăn |
| Ly (Gen Z) | content · ý tưởng · drama · tự tin | content, clip, tiktok, view, quay / trend, viral, kịch bản / drama, hóng, bí mật / slay, vibe, flex |

**Nhưng bảng này hiện chỉ dùng cho 2 việc vô thưởng vô phạt:** (1) câu tiếc nuối sau khi THUA, (2) món 🧠 máy đọc suy nghĩ.
**Nó KHÔNG nối vào thanh điểm.** Nối vào là xong đúng thứ Lucas xin — không phải làm từ đầu.

---

## 2. Ý TƯỞNG — vì sao con sói phải đi từng nhà (10 lựa chọn)

Nguyên tắc rút từ Vampyr + Carrion: **đừng biện minh, hãy cho con sói một CÁI THIẾU** — rồi để người chơi tự thấy tội lỗi.

| # | Tên | Động cơ | Cái hay | Rủi ro |
|---|---|---|---|---|
| 1 | **Đêm Halloween xóm nghèo** | Xóm bày trò "cho kẹo hay bị ghẹo". Sói giả người đi xin kẹo — nhưng nó ăn thứ khác | Hợp mùa (31/10), cho phép đồ hoá trang **hợp lý hoá** mọi bộ đồ trong tủ | Halloween không phải lễ Việt → hơi lệch chất "xóm" |
| 2 | **Trăng tròn ba đêm** | Sói chỉ có 3 đêm trăng tròn; qua đêm thứ 3 thì hoá lại thành người và **quên hết** | Ép nhịp, tạo đồng hồ đếm ngược tự nhiên | Đã quen thuộc |
| 3 | **Nó đang tìm MẸ nó** | Sói là đứa trẻ trong xóm bị đánh tráo. Mỗi nhà nó vào để **ngửi**, tìm mùi mẹ. Ăn thịt là tác dụng phụ của cơn đói | Đau, có hậu, hợp truyện Việt | Nặng, khó hài |
| 4 | **Ma cà rồng kiểu VIỆT — hút HƠI, không hút máu** | Truyền thuyết VN: ma cà rồng không hút máu, nó **rút sinh khí**; nạn nhân tỉnh dậy mệt lử, không vết thương | 🔴 **Rẻ nhất + Việt nhất.** Nạn nhân **không chết** → giữ được chất hài, chơi lại được, không cần cảnh máu me | Bớt kịch tính hơn "giết" |
| 5 | **Nợ ông chủ nợ đêm** | Sói bị "ông Kẹ" ép mỗi đêm nộp đủ 3 hơi thở, không nộp thì bị ăn ngược | Có phản diện, có deadline, hợp mode Kẹt Tiền | Thêm nhân vật = thêm việc |
| 6 | **Sói phải nuôi con** | Ở nhà có một ổ sói con đói. Màn hình chính là cái ổ, mỗi đêm đói thêm | Đồng cảm tức thì (Carrion) | Dễ thành bi kịch |
| 7 | **Bị nguyền: chỉ hoá lại người khi được MỜI vào 7 nhà** | Lời nguyền yêu cầu **được mời** — đúng luật ma cà rồng, đúng luật game hiện tại | Biện minh **hoàn hảo** cho cơ chế "phải được mời vào" | Cần 7 nhà (giờ có 3) |
| 8 | **Nó không biết mình là sói** | Người chơi tưởng mình là người đi tìm nhà trọ; đến đêm 3 mới lộ ra chính mình là con quái cả xóm đang đồn | Cú lật (giống *No, I'm not a Human*) | Chỉ xài được 1 lần/người chơi |
| 9 | **Gaslight: xóm mới là quái, mình mới là người** | Mỗi nhà đều nói dối về đêm qua. Càng chơi càng không biết ai điên | Hợp ý "gaslighting" Lucas nêu | Khó viết, dễ rối |
| 10 | **Đóm Hòng = đèn hồn** | Mỗi người bị ăn thành một con đom đóm hồng bay trên bản đồ. Ăn càng nhiều, xóm càng SÁNG → càng dễ bị thấy | Nối thẳng vào **tên game**; biến việc giết thành **cơ chế rủi ro** chứ không chỉ điểm | Cần vẽ thêm hiệu ứng |

**Gợi ý ghép (nếu Lucas muốn ăn chắc):** `#4 (hút hơi kiểu Việt)` + `#7 (phải được mời)` + `#10 (đom đóm hồng = đèn báo động)`.
Ba món này khớp nhau: hút hơi → nạn nhân sống → hoá thành đom đóm → xóm sáng dần → khó dần. Và **giải thích luôn cái tên game**.

---

## 3. Ý TƯỞNG — thanh thiện cảm + hai lối chơi (Hiền / Dữ)

### 3a. Bốn cách làm thanh (chọn 1)

| Cách | Cơ chế | Ai làm vậy | Ưu | Nhược |
|---|---|---|---|---|
| **A. Từ khoá cộng thẳng** (rẻ nhất) | Câu người chơi chứa từ trong `XDH.REGRET[npc].keys` → **code** cộng +8 hứng thú, +5 tin. Đủ 100% → **ép mở cửa**, bỏ qua ý AI | Persona (code cộng điểm) | 0đ, chắc chắn, sửa 1 file | Người chơi có thể "spam từ khoá" |
| **B. Từ khoá + phải là câu THẬT** | Như A nhưng **mỗi chủ đề chỉ ăn điểm 1 lần**, và câu phải dài ≥ 6 chữ | — | Chặn spam | Vẫn máy móc |
| **C. Để AI chấm (đang làm)** | AI trả `danh_trung` | Suck Up! | Mềm mại | 🔴 Đã đo: bịa lời, bỏ sót, đổi não là đổi luật |
| **D. Hai lớp** (khuyến nghị) | **Code** chấm từ khoá (chắc chắn) **+** AI chấm thêm (mềm). Lấy điểm cao hơn của hai bên | Bounded Autonomy (arxiv 2026) | Không bao giờ "nói đúng mà không được điểm" | Phải cân số 2 lần |

### 3b. Cửa mở kiểu gì (sửa lỗi A ở mục 1b)
- **Luật mới đề xuất:** thiện cảm chạm 100% → **cửa TỰ mở**, `invite_intent` của AI **không có quyền phủ quyết** nữa. AI chỉ được quyền *đẩy nhanh* (mời sớm khi điểm còn thiếu), y như đường tự lành đã có.
- Giữ "câu hỏi chốt" của nhà khó (Cô Sáu) như hiện tại.

### 3c. Hai lối — Hiền (Pacifist) / Dữ (Killer)
| | Lối DỮ (đang có) | Lối HIỀN (mới) |
|---|---|---|
| Vào nhà bằng | lừa được → cửa mở → ăn | thiện cảm 100% → được mời thật lòng |
| Đào sâu | không cần | hỏi sâu → NPC **giao nhiệm vụ giấu** (đã có hạ tầng: `mission_signal`, `INTEREST_GATE=60`) |
| Kết thúc đêm | xóm sáng thêm 1 đom đóm, nghi ngờ toàn xóm tăng | NPC thành **đồng minh**: đêm sau cho đồ, nói dối giùm, mở đường sang nhà khác |
| Thắng cuối | ăn đủ số | đủ 3 đồng minh → **phá lời nguyền** |
| Đã có sẵn trong code | ✅ | 🟡 60% (hệ nhiệm vụ v1.0 của Ly) |

**Ghi chú kỹ thuật:** hệ nhiệm vụ v1.0 đã đúng khuôn Lucas muốn — hỏi sâu → hé manh mối 1 → 2 → rõ chuyện → nhận việc. Chỉ có **1 nhân vật (Ly)** có. Mở rộng cho Tí + Cô Sáu là việc chép khuôn, không phải phát minh.

---

## 4. HỘP KÍNH (observability) — 3 mức

| Mức | Gồm gì | Công sức | Trả lời được câu hỏi gì |
|---|---|---|---|
| **M1 — Sổ đen** (nền tảng) | Thêm D1, mỗi lượt ghi 1 dòng: phiên · nhân vật · lượt · câu người chơi · câu AI · verdict · 4 chỉ số · **não nào** · độ trễ · token · tiền · signal · gate_reason | ~nửa ngày | "Đêm qua ai chơi, nói gì, vì sao thua" |
| **M2 — Bảng đèn** | 1 trang HTML: phễu người mới (vào → gõ cửa → nói 1 câu → vào được nhà) · tỉ lệ verdict · **não nào đang chết** · độ trễ · top câu làm người chơi bỏ cuộc · xem lại nguyên cuộc hội thoại | ~nửa ngày | "Người mới rơi ở khúc nào" |
| **M3 — Máy chấm** | 20 hội thoại mẫu (kịch bản chuẩn) chạy lại sau MỖI lần sửa prompt; một AI khác chấm theo rubric (LLM-as-a-judge) → điểm trước/sau | ~1 ngày | "Sửa prompt xong tốt lên hay tệ đi" |

**Cái đã có sẵn, đừng làm lại:**
- **Cloudflare AI Gateway** đã tự ghi prompt + câu trả lời + token + tiền + độ trễ cho **mọi** lượt (trừ Qwen — Qwen gọi thẳng, không qua gateway). Vào dashboard xem được ngay, 0 công.
- `?debug=1` đã trả `bench` (não nào đang nghỉ) + `gate_reason`.
- **Đang thiếu hoàn toàn:** không có D1/KV/R2, `converse.js` có **0 dòng** `console.log` → **không lưu gì hết**. Playtest xong là mất sạch.

**Khuyến nghị:** M1 + M2 trước. M3 chỉ đáng làm sau khi có ≥ 100 cuộc thật.
Không dùng Langfuse/LangSmith vòng này — phải nuôi máy chủ riêng, mà D1 + 1 trang HTML đã đủ cho quy mô bạn-bè-playtest.

**Riêng tư:** trang bảng đèn phải nằm sau Cloudflare Access (chỉ Lucas xem), vì nó chứa nguyên văn lời người chơi.

---

## 5. "MỞ HẾT, MIỄN PHÍ HẾT" để playtest

Hiện trạng đo được: `XDH.WARDROBE_LOCK.ALL_OPEN = true` (tủ đồ đã mở, trừ 3 món phải nhặt: thẻ SV, đơn hàng, tin nhắn) · `XDH.TEST_MONEY = 500` · cửa hàng vẫn tính tiền (40–90k) · gậy selfie 80k.

Đề xuất: thêm **một công tắc duy nhất** `XDH.PLAYTEST = true` → giá mọi món về 0, mở luôn 3 món phải nhặt, tiền khởi điểm cao. Tắt công tắc là về như cũ. (Chờ Lucas gật ở câu Q9.)

---

## 6. 🔴 CÂU HỎI CHO LUCAS — trả lời xong mới viết bản CHỐT

| # | Câu hỏi | Chọn nhanh |
|---|---|---|
| **Q1** | Động cơ của sói chọn ý nào ở mục 2? | Gợi ý: **#4 + #7 + #10** (hút hơi kiểu Việt + phải được mời + đom đóm hồng). Hay chọn số khác? |
| **Q2** | Nạn nhân **CHẾT** hay **mệt lử rồi tỉnh lại**? | Ảnh hưởng cả tông game, chỗ nhặt đồ, và việc chơi lại |
| **Q3** | Halloween: làm **theo mùa** (bật 31/10) hay làm **nền truyện quanh năm**? | |
| **Q4** | Thanh thiện cảm chọn cách nào? | Gợi ý **D (hai lớp)** |
| **Q5** | Thanh đó **HIỆN SỐ** ra màn hình hay vẫn giấu sau cửa mở 4 nấc? | Suck Up! hiện, mình đang giấu. Người mới cần thấy |
| **Q6** | Chạm 100% có **ép mở cửa** không, kể cả khi AI chưa muốn mời? | Gợi ý: **CÓ** — đây là lỗi A |
| **Q7** | Lối HIỀN mở cho cả **3 nhà** ngay, hay làm 1 nhà trước rồi nhân bản? | |
| **Q8** | Hộp kính làm tới **M1+M2** (ghi + bảng đèn) hay chỉ **M1** (ghi thôi)? | Gợi ý: **M1+M2** |
| **Q9** | Công tắc "miễn phí hết" — làm **ngay** không, và đẩy lên **preview** hay **link chính**? | |

## 7. Việc còn treo từ vòng trước (chưa quyết, không hỏi lại)
- Máy quay số có tắt ở chế độ Kẹt Tiền không?
- Vòng v1.1/v1.2 có commit vào git không?
- Bản tiếng Anh yếu (Qwen trả lời tiếng Việt).


---

## 8. BỔ SUNG giữa buổi — Unsloth: có nên tự luyện não riêng cho game?

**Trả lời ngắn: CÓ, nhưng chưa phải bây giờ.** Đường đi sạch bất ngờ vì Cloudflare cho chạy bản luyện riêng ngay trên hạ tầng game đang dùng.

| Lỗi đo được sáng nay | Luyện não riêng có sửa được không? |
|---|---|
| A. Đủ điểm mà cửa không mở | **KHÔNG** — một dòng luật trong code game |
| B. Lượt 1 luôn bị chấm nhạt | **KHÔNG** — một con số trong tệp cấu hình |
| C. AI bịa lời người chơi | **MỘT PHẦN** — nhét lại nguyên văn câu cũ vào prompt rẻ hơn và chạy được ngay |
| D. Não tốt chết âm thầm | **KHÔNG** — nhưng não tự nuôi thì không bao giờ hết tiền |
| Trôi giọng (Cô Sáu lượt 6 mất chất) | **CÓ** — đúng việc của luyện thêm; đã vá prompt 2 lần vẫn còn |
| Tiền mỗi cuộc nói chuyện | **CÓ** — não nhỏ tự nuôi rẻ hơn nhiều |

**Unsloth là gì:** không phải một con AI, mà là bộ **tăng tốc luyện**. Nó viết lại phần toán chậm để việc luyện vừa với card đồ hoạ thường: **giảm ~70% bộ nhớ card**, **nhanh gấp ~2 lần**. Không luyện lại cả bộ não — chỉ luyện một **miếng dán** (LoRA, cỡ ~1% kích thước) gắn lên não gốc. Não 3 tỉ tham số luyện vừa trong 8GB; Google Colab miễn phí là đủ bắt đầu.

**Vì sao hợp stack của mình:** Cloudflare Workers AI **nhận miếng dán LoRA tự luyện** trên nền Llama / Mistral / Gemma (dưới 300MB, không nén). Đang mở beta và **miễn phí**. Tức là: luyện miễn phí trên Colab → tải miếng dán lên → gọi từ chính Worker đang chạy game. Không thêm máy chủ, không thêm hoá đơn, và ghép vào chuỗi 4 não như một não thứ 5.

**Chỗ ai cũng bỏ qua:** luyện cần **ví dụ** — vài trăm tới vài nghìn lượt Cô Sáu nói ĐÚNG chất Cô Sáu. Hiện **không lưu một cuộc nào**. Nên thứ tự bắt buộc là:

1. Dựng sổ đen (M1) — **sổ đen CHÍNH LÀ bộ dữ liệu luyện**
2. Playtest với bạn bè → vài trăm lượt thật, Lucas đánh dấu câu hay
3. Luyện miếng dán bằng Unsloth trên Colab (~500 lượt đã đánh dấu là đủ thử)
4. Tải lên Workers AI, ghép vào chuỗi não, so với Gemini trên 20 hội thoại mẫu

> **Móc nối quan trọng:** hộp kính không chỉ để soi lỗi — nó là **nhà máy sản xuất dữ liệu** để sau này tự luyện não. Làm nó trước thì bước 3 gần như không tốn gì.

**Q10 (thêm vào mục 6):** Não tự luyện — **gác lại** chờ có sổ đen, hay thí nghiệm song song luôn? (Em nghiêng về gác lại.)

Nguồn: developers.cloudflare.com/workers-ai/features/fine-tunes/loras/ · blog.cloudflare.com/fine-tuned-inference-with-loras/ · developers.redhat.com/articles/2026/04/01/unsloth-and-training-hub-lightning-fast-lora-and-qlora-fine-tuning


---

## 9. LUCAS TRẢ LỜI — 2026-08-21

| # | Câu hỏi | Lucas chốt |
|---|---|---|
| 1 | Động cơ con sói | **ĐỂ SAU** — chưa chốt truyện nền |
| 2 | Nạn nhân chết hay mệt lử | **CHẾT** |
| 3 | Halloween | **Chỉ là cái CỚ để dựng truyện** (không phải sự kiện theo mùa) |
| 4 | Thanh thiện cảm | **CÓ** — hai lớp: code chấm từ khoá + AI chấm cảm giác, lấy điểm cao hơn |
| 5 | Hiện thanh ra màn hình | **HIỆN** |
| 6 | 100% có ép mở cửa | **CÓ** — và **AI phải tự nói câu mời vào** cho khớp |
| 7 | Nhiệm vụ giấu cho cả 3 nhà | **CÓ** |
| 8 | Hộp kính (observability) | ❓ Lucas chưa hiểu — đang giải thích lại |
| 9 | Công tắc miễn phí hết | **LÀM** |
| 10 | Tự luyện não (Unsloth) | **ĐỂ SAU** |
| 11 | Tắt máy quay số ở Kẹt Tiền | **CÓ** |
| 12 | Commit v1.1 + v1.2 vào git | **CÓ** |
| 13 | Tiếng Anh yếu | **PHẢI SỬA** — làm thành **lựa chọn cho người chơi**, và **kiểm tra AI có tuân theo lựa chọn Anh/Việt không** |

### Mâu thuẫn phải nói thẳng (chưa chặn việc)
- **Chốt 2 = CHẾT** thì bỏ luôn ý #4 (hút hơi) và #10 (đom đóm hồng) ở mục 2 — và mỗi hàng xóm chỉ dùng được MỘT lần mỗi ván. Với 3 nhà thì một ván hết sau 3 lần ăn. → khi quay lại câu 1 phải giải bài này (thêm nhà? xóm tự sinh người mới? mỗi đêm một xóm khác?).
- **Chốt 6**: cách làm là CODE quyết định mở cửa trước, rồi nhét một dòng đạo diễn vào tin nhắn ("nhân vật ĐÃ quyết định mời vào") để AI viết câu mời cho khớp — đúng khuôn `finalTestAsk` đã có sẵn. AI không còn quyền phủ quyết, chỉ còn quyền diễn.
- **Chốt 13** kéo theo việc mới: một bài kiểm tự động chạy cả hai ngôn ngữ, đếm xem AI có trả lời đúng thứ tiếng người chơi chọn không.


---

## 10. CHỐT — Q8 = A (sổ đen + bảng đèn). Thứ tự làm cho Terminal B

Trạng thái kế hoạch: 🟢 **ĐỦ TIN CẬY** — 13/13 câu đã có đáp án. Câu 1 (động cơ sói) Lucas để sau, KHÔNG chặn vòng này.

**Luật vàng của vòng này: LÀM SỔ ĐEN TRƯỚC.** Mọi thay đổi sau đó mới đo được trước/sau.

| Thứ tự | Việc | Vì sao đứng ở đây |
|---|---|---|
| **1** | **Sổ đen (D1)** — mỗi lượt gọi `/api/converse` ghi 1 dòng; ghi kiểu "gửi rồi đi" (`waitUntil`) để KHÔNG làm chậm lượt chơi | Nền của mọi thứ. Chưa có = sửa xong không biết tốt lên hay tệ đi |
| **2** | **Sự kiện phía máy chơi** — mở game · chọn chế độ · gõ cửa · nói câu đầu · cửa mở · thắng · thua · bị công an · bỏ giữa chừng | Phễu người mới cần mấy mốc này |
| **3** | **Bảng đèn** — 1 trang riêng sau Cloudflare Access: phễu người mới · tỉ lệ chấm · **não nào đang chết + tỉ lệ dùng từng não** · độ trễ · chỗ người chơi bỏ · xem lại nguyên cuộc | Lucas tự soi, không cần hỏi em |
| **4** | **Thanh thiện cảm 2 lớp + HIỆN ra màn hình** — code chấm `XDH.REGRET[npc].keys`, AI chấm cảm giác, lấy điểm CAO HƠN | Đáp án 4 + 5 |
| **5** | **Chạm 100% = CỬA MỞ, AI phải nói câu mời** — bỏ quyền phủ quyết của `invite_intent`; nhét dòng đạo diễn kiểu `finalTestAsk` để lời thoại khớp | Đáp án 6 — sửa lỗi A |
| **6** | **Sửa lỗi B** — lượt 1 luôn bị chấm `thuong` (6/6 lần đo) | Ấn tượng đầu của mọi người mới |
| **7** | **Nhiệm vụ giấu cho Tí + Cô Sáu** — chép khuôn của Ly | Đáp án 7 |
| **8** | **Công tắc `XDH.PLAYTEST`** — mọi món 0đ, mở hết tủ đồ kể cả 3 món phải nhặt, tiền khởi điểm cao. Tắt là về như cũ | Đáp án 9 |
| **9** | **Tắt máy quay số ở chế độ Kẹt Tiền** | Đáp án 11 |
| **10** | **Chọn ngôn ngữ + BÀI KIỂM TUÂN LỆNH** — người chơi chọn Tiếng Việt / English rõ ràng; chạy tự động ≥ 20 lượt mỗi thứ tiếng, đếm % câu AI trả lời ĐÚNG thứ tiếng đã chọn. Dưới 95% thì siết prompt rồi đo lại | Đáp án 13 |
| **11** | **Commit v1.1 + v1.2 + vòng này vào git** (kho `xom-dom-hong-game`) — nhớ giữ `state.json` ngoài kho | Đáp án 12 |

**Deploy:** preview trước (`hop-kinh.xom-dom-hong.pages.dev`), KHÔNG đụng link chính cho tới khi Lucas gật.
**Riêng tư:** bảng đèn chứa nguyên văn lời người chơi → BẮT BUỘC nằm sau Cloudflare Access.
**Bí mật:** khoá API chỉ nằm ở Cloudflare secrets, không bao giờ vào kho.

### Số đo để biết là ĐẠT
1. Chơi thử 1 ván → bảng đèn hiện đủ số lượt của ván đó.
2. Bảng đèn chỉ đúng não nào đang chạy (đối chiếu với `?debug=1`).
3. Nói 3 câu trúng từ khoá của Ly → thanh hiện lên, chạm 100% → cửa mở VÀ Ly nói câu mời.
4. Lượt 1 nói câu trúng tim → KHÔNG còn bị chấm `thuong`.
5. Cả 3 nhà đều ra được nhiệm vụ giấu khi hỏi sâu.
6. Bật công tắc playtest → mọi món trong cửa hàng 0đ.
7. Chọn English → ≥ 95% câu trả lời bằng tiếng Anh (đo tự động, có số).
