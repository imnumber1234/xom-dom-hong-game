# v0.7 — GIỌNG THẬT (chống "nói chung chung")

> Nguồn gốc: Tuấn Anh gửi video Mì AI "Finetune LLM cùng Unsloth" (youtu.be/b8XJrNACyUA), ý: có cách bắt
> nhân vật nói đúng phong cách mình muốn, không bị chung chung.
> Phiên A (lập kế hoạch) 2026-08-10. KHÔNG thi công trong phiên này.

---

## 1. Video dạy gì (đã tra, không đoán)

Video của kênh **Mì AI**, tiêu đề *"Finetune Large Language Model để trả lời ngon hơn, nuột hơn cùng Unsloth"*.
Kỹ thuật = **fine-tune** (huấn luyện lại) một mô hình mã nguồn mở bằng **Unsloth** — thư viện làm việc
huấn luyện nhanh ~2x và tốn ít bộ nhớ ~60%, chạy được trên GPU 3GB (QLoRA), xuất ra file adapter ~100MB
hoặc GGUF để chạy bằng Ollama.

**Nói bằng tiếng người:** thay vì *dặn* mô hình "hãy nói giọng bà tám", bạn *dạy* nó bằng vài trăm ví dụ
câu nói thật, cho tới khi nó nói kiểu đó theo phản xạ.

Nguồn: unsloth.ai/docs/get-started/fine-tuning-llms-guide · github.com/unslothai/unsloth

## 2. Vì sao KHÔNG fine-tune ngay (sự thật phũ)

| Rào | Chi tiết |
|---|---|
| **Não game đang là API thuê** | Xóm Đóm Hòng gọi Haiku → DeepSeek qua Cloudflare AI Gateway. Không thể "nhét" model tự huấn luyện vào đó. |
| **Muốn dùng phải đổi nhà cung cấp** | Fireworks/Together mới cho chạy model tự huấn luyện. Huấn luyện rẻ (~$0.50/1M chữ, model <16B) nhưng **chạy thật thì tốn theo giờ máy** (H100 ~$6.49/giờ) hoặc theo token của bên thứ ba → mất luôn bộ nhớ đệm miễn phí của Cloudflare. |
| **Vẫn phải có dữ liệu trước** | Fine-tune ăn bằng **kho câu nói mẫu**. Chưa có kho đó thì không fine-tune được gì cả. |

→ **Kho câu mẫu là thứ phải làm TRƯỚC — và tự nó đã sửa được vấn đề, miễn phí.**

## 3. Thí nghiệm thật đã chạy (DeepSeek, 2026-08-10, ~30 lượt gọi)

**Thí nghiệm 1 — thẻ nhân vật dày (Cô Sáu, Tí), lượt đầu:** thêm câu mẫu **không cải thiện** (tics 4.25 → 3.25).
Kết luận: với thẻ đã dày sẵn, lượt đầu vốn đã ổn. Giả thuyết ban đầu của tôi SAI ở đây.

**Thí nghiệm 2 — thẻ mỏng 1 dòng, hội thoại 6 lượt:**

| Nhân vật | A: thẻ 1 dòng (như hiện tại) | B: thẻ 1 dòng + 6 câu mẫu |
|---|---|---|
| Bà Tư (giọng Bắc) | 0-1 từ đặc trưng · **trôi sang giọng Nam "tui"** · bịa cả tình tiết "cháu bà Sáu" | 2-3 từ đặc trưng · giữ "giời ơi / bà" |
| Chú Bảy | 0-1 | **4** |
| Hằng | 1 | **4** · giữ "em/anh" |
| | | |
| Giám khảo mù đoán đúng ai nói | 8/9 (89%) | 8/9 (89%) |

**Hai kết luận thẳng:**
1. **Không phải "không phân biệt được nhân vật"** — giám khảo đoán đúng 89% ở cả hai bên. Vấn đề khác.
2. **Là "không nghe ra một CON NGƯỜI cụ thể"** — câu mẫu cho **gấp 2-4 lần** dấu hiệu giọng riêng, và
   quan trọng hơn: **chặn trôi giọng** (Bà Tư từ Bắc trôi sang Nam; Hằng từ "em" nhảy sang "chị" ở lượt 6).
   Đó chính xác là cái Tuấn Anh gọi "bị chung chung".

Dữ liệu thô: scratchpad/voice-probe-out.json + voice-probe2-out.json

## 4. Phát hiện phụ (ngoài kế hoạch — báo để Lucas quyết)

Cả Cô Sáu lẫn Tí đều **cho người lạ vào nhà ngay lượt 1** trong mọi lần thử. Game thuyết phục mà thắng
ngay câu đầu thì mất hết cái hay. Không nằm trong phạm vi v0.7 — ghi vào pending.md.

## 5. Việc phải làm (v0.7)

| # | Việc | Ai làm | Xong là khi |
|---|---|---|---|
| T1 | Thêm `voice[]` (6 câu mẫu) + `tic` (1 thói quen nói lặp mọi câu) vào 3 thẻ nhân vật trong `_personas.js`, đủ VN + EN | Backend | 3 nhân vật × 2 ngôn ngữ có đủ 6 câu + 1 tic |
| T2 | `converse.js` chèn **2 câu mẫu xoay vòng mỗi lượt** (chọn theo hash lượt, không random — để chơi lại giống nhau) + dòng tic đặt **sát cuối** system prompt | Backend | Prompt in ra thấy đúng 2 câu, đổi theo lượt |
| T3 | Đưa **nhắc giọng vào lượt 4+** (chống trôi): nhắc lại tic + xưng hô khi hội thoại dài | Backend | Lượt 6 vẫn giữ xưng hô gốc |
| T4 | Máy chấm "giọng": script đếm dấu hiệu giọng ở lượt 1 vs lượt 6 + giám khảo mù đoán ai nói | Testing | Chạy được, in bảng |
| T5 | Bài kiểm 20 mục trên preview: 3 nhân vật × 2 chế độ × VN/EN, không lỗi console, giọng giữ tới lượt 6 | Testing | 20/20 |

**Không đụng:** máy chấm điểm, luật thắng thua, tutorial, giao diện.

## 6. Pass-number (chốt TRƯỚC khi test — lean startup)

- Dấu hiệu giọng ở lượt 6: **≥ 3** mỗi nhân vật (hiện tại đo được 0-1 ở thẻ mỏng, 1-2 ở thẻ dày).
- Trôi xưng hô ở 6 lượt: **0/3 nhân vật** (hiện tại 1/3 trôi).
- Giám khảo mù: **≥ 8/9**.
- Chi phí thêm mỗi lượt: **0đ** (câu mẫu nằm trong phần system đã được cache).

## 7. Tầng 3 — fine-tune thật (ĐỂ SAU, chỉ khi tầng 1 hết đất)

Kho câu mẫu ở T1 chính là dữ liệu huấn luyện. Khi nào có ~300 câu/nhân vật (thu từ log chơi thật đã
được duyệt tay), lúc đó mới bàn Unsloth + Fireworks. **Quyết định tiêu tiền → chờ Lucas, không tự làm.**

---

## 8. LUCAS ĐÃ CHỐT 2026-08-10 (6/6 — khoá, không hỏi lại)

| # | Chốt |
|---|---|
| Q1 | **Lucas tự viết câu mẫu** → file `voice-sheet-lucas.md` đã mồi sẵn bằng câu ĐÃ CHẠY LIVE của chính game, Lucas chỉ sửa. Ô nào để nguyên thì dùng nguyên. |
| Q2 | **Werewolf HOÃN.** Làm Xóm Đóm Hòng trước. Kế hoạch Werewolf giữ nguyên ở `Werewolf AI Arena/docs/VOICE-SHEET-PLAN-2026-08-10.md`, chạy sau khi Xóm nghe được. |
| Q3 | **ĐẨY LÊN LINK CHÍNH.** Vẫn qua preview `giong-that.xom-dom-hong.pages.dev` trước để chạy bài kiểm; đạt 20/20 + pass-number §6 thì tự promote lên link chính (Lucas đã gật trước). Không đạt → dừng ở preview, báo lại. |
| Q4 | Sinh câu mẫu tự động cho ô "tự viết nhân vật": **CÓ** — nhưng đó là việc bên Werewolf (W3), làm ở đợt sau. |
| Q5 | **Chưa báo giá fine-tune.** Chạy tầng 1 trước. |
| Q6 | **"NPC cho vào ngay lượt 1" tách riêng** — đã ghi pending.md, KHÔNG đụng trong v0.7. |

**Phạm vi v0.7 sau khi chốt = đúng T1→T5 ở §5, chỉ Xóm Đóm Hòng, chỉ chuyện GIỌNG.**

---

## 9. THI CÔNG (Session B, 2026-08-10) — T1→T4 XONG · T5 KHÔNG ĐẠT → DỪNG Ở PREVIEW

| # | Việc | Trạng thái | Bằng chứng |
|---|---|---|---|
| T1 | `voice[]` + `voice_en[]` + `tic`/`tic_en` (+ `pronoun`/`pronoun_en` cho T3) cho 3 nhân vật | ✅ | 36/36 câu + 3 tic khớp NGUYÊN VĂN `voice-sheet-lucas.md` (kiểm bằng máy, mục #18-19) |
| T2 | 2 câu mẫu xoay vòng theo hash (seed + lượt), tic sát cuối system | ✅ | `game/tools/print-prompt.mjs` in ra lời dặn THẬT: lượt 1/3/4/6 khác nhau, không random |
| T3 | Nhắc giọng từ lượt 4 (tic + xưng hô), cả VN lẫn EN | ✅ | in ra ở lượt 4 và 6, không có ở lượt 1 và 3 |
| T4 | Máy chấm giọng | ✅ | `game/tools/voice-score.mjs` (dấu hiệu lượt 1 vs 6 · trôi xưng hô · giám khảo mù · chép nguyên văn) + `check-20.mjs` + `console-check.py` |
| T5 | 20 mục trên preview | ❌ **13/20** | `game/tools/check-20-out.json` |

**Preview:** https://giong-that.xom-dom-hong.pages.dev — **link chính KHÔNG bị đụng.**

### Pass-number §6 — đối chiếu thật

| Chốt trước | Kết quả | Đạt? |
|---|---|---|
| Dấu hiệu giọng lượt 6 ≥ 3 | Tiếng Việt **6/6 ván đạt** (5-10 dấu hiệu) · Tiếng Anh **0/6** — cả 6 ván lượt cuối rơi về não kịch bản | ❌ vì lý do ở dưới |
| Trôi xưng hô 0/3 nhân vật | **0/3 trôi** (trước đây 1/3) | ✅ |
| Giám khảo mù ≥ 8/9 | **9/9** | ✅ |
| Chi phí thêm mỗi lượt 0đ | Câu mẫu nằm ở phần ĐỘNG, khối system được nhớ đệm không bị đụng → token vào mỗi lượt 697-1712 (khối system ~2.4k vẫn nằm trong đệm) | ✅ |

### Vì sao KHÔNG đẩy lên link chính

Không phải lỗi của phần giọng. **Hai cái não của game đang hỏng, có từ trước v0.7:**

1. **Haiku hết tiền** — khoá Anthropic báo "credit balance too low". Cả link chính lẫn preview đều đã rơi xuống DeepSeek.
2. **DeepSeek trả về RỖNG** khi hội thoại dài (đo tay: bản CŨ không có sổ giọng cũng chỉ 3/5 lượt trả lời được; có sổ giọng 0-1/5). Rỗng → game rơi tiếp về não kịch bản → câu đóng hộp, và ở bản tiếng Anh thì **câu kịch bản chỉ có tiếng Việt** nên người chơi EN nhận câu Việt.

→ Đúng luật §8 Q3: không đạt thì dừng ở preview, báo lại. Chi tiết + cách sửa đề xuất: `pending.md`.
