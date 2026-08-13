# v0.8 — FINE-TUNE THẬT (đúng như video Mì AI)

> Lucas chốt 2026-08-10: **"A rồi B"**. A = sổ giọng (v0.7, đang thi công ở terminal khác).
> B = cái này: tự huấn luyện một mô hình riêng cho Xóm Đóm Hòng.
> Phiên A (lập kế hoạch). KHÔNG thi công. Điều kiện khởi động: **v0.7 đã sống và nghe được.**

---

## 1. Đường đi đã xác minh (không đoán, đã tra tận nơi)

| Bước | Làm gì | Giá |
|---|---|---|
| **Huấn luyện** | Unsloth trên **Google Colab bản miễn phí** (card T4 16GB) — đúng y video | **0đ** |
| **Cất mô hình** | Tải file adapter (~100MB) lên **Fireworks**. Fireworks nhận adapter huấn luyện ở nơi khác (Unsloth OK). | **0đ** |
| **Chạy thật** | Serverless, tính theo lượt dùng: **$0.20/1 triệu chữ** (mô hình 4-16B) | **~190đ/ván** |

**Máy của Lucas KHÔNG dùng được để huấn luyện:** RTX 3050 Ti laptop chỉ có **4GB VRAM**. Đủ để chạy thử
mô hình bé, không đủ để huấn luyện thoải mái. → Dùng Colab miễn phí, đúng như video.

**Mô hình nền chọn:** **Qwen3 4B** — Fireworks có hỗ trợ (Qwen3 bản không-MoE), Unsloth có sẵn hướng dẫn
riêng cho Qwen3, và dòng Qwen tiếng Việt khá hơn Llama cùng cỡ.

Nguồn: docs.fireworks.ai/fine-tuning/supervised-fine-tuning · unsloth.ai/docs/models/qwen3.5/fine-tune

## 2. Rào thật sự KHÔNG phải tiền — là DỮ LIỆU

Fine-tune ăn **300–1.000 câu mỗi nhân vật**. Hiện có **6 câu/nhân vật** (sổ giọng v0.7). Thiếu ~50 lần.

**Và game hiện KHÔNG lưu một cuộc nói chuyện nào.** Đã kiểm: `wrangler.toml` chỉ có mỗi khoá `[ai]`
cho phần nghe giọng nói — không có kho lưu (KV/D1/R2). Mọi câu người chơi và NPC nói ra đều **bay mất**
sau khi đóng tab.

→ **Việc số 1 của v0.8 không phải huấn luyện. Là bắt đầu GIỮ LẠI dữ liệu.**

## 3. Ba nguồn lấy dữ liệu (dùng cả ba)

| Nguồn | Được bao nhiêu | Chất lượng | Ghi chú |
|---|---|---|---|
| **N1. Log ván chơi thật** | ~30-60 câu/ván | ⭐⭐⭐ thật nhất | Cần thêm kho lưu + Lucas duyệt tay. Chậm nhưng vàng. |
| **N2. Máy lớn sinh ra, Lucas duyệt** | 300/nhân vật trong 1 buổi | ⭐⭐ | Lấy 6 câu sổ giọng + thẻ nhân vật làm mồi, cho Haiku sinh 400 câu, Lucas gạch bỏ câu dở. Đây là cách chuẩn (chưng cất từ mô hình lớn). |
| **N3. Chính bản v0.7 đang chạy** | tự động | ⭐⭐ | v0.7 đã bắt Haiku nói đúng giọng — mỗi câu nó nói ra chính là một dòng huấn luyện sẵn. Giữ log là có luôn. |

**Luật vàng:** không câu nào vào kho huấn luyện mà Lucas chưa nhìn qua. Rác vào = rác ra.

## 4. Quyết định kiến trúc quan trọng nhất (cần Lucas gật ở v0.8)

Hiện **một lượt gọi AI làm hai việc cùng lúc**: (a) nói lời thoại trong vai, (b) **chấm điểm** người chơi
(verdict hợp lý/khả nghi/lộ liễu). Mô hình 4B tự huấn luyện **giỏi việc (a), rủi ro ở việc (b)** —
chấm điểm cần kỷ luật và định dạng chuẩn, sai là hỏng luật chơi.

| Cách | Mô tả | Rủi ro | Giá |
|---|---|---|---|
| **A. Tách đôi (khuyên dùng, 80%)** | Mô hình riêng NÓI · Haiku CHẤM | Thấp — luật chơi không đụng tới | 2 lượt gọi/lượt chơi, ~+40% |
| B. Mô hình riêng làm cả hai | Rẻ nhất, nhanh nhất | **Cao** — chấm sai thì game vỡ | 1 lượt gọi |
| C. Chỉ dùng cho chế độ luyện tập | An toàn tuyệt đối | Không ai thấy | rẻ |

## 5. Các bước (v0.8)

| # | Việc | Xong là khi |
|---|---|---|
| F1 | Thêm kho lưu hội thoại (Cloudflare KV hoặc R2) + nút xuất ra file. Có dán nhãn ván nào/nhân vật nào/lượt mấy. | Chơi 1 ván → xuất ra được file đọc được |
| F2 | Sinh 400 câu/nhân vật từ mồi sổ giọng (N2) → Lucas duyệt trong 1 file bảng, gạch bỏ câu dở | ≥300 câu sạch/nhân vật |
| F3 | Đóng gói thành bộ dữ liệu huấn luyện đúng định dạng hội thoại | File nạp được vào Unsloth |
| F4 | Notebook Colab sẵn sàng bấm-là-chạy (Unsloth + Qwen3 4B + QLoRA), xuất adapter | Chạy hết không lỗi trên Colab miễn phí |
| F5 | Tải adapter lên Fireworks, gọi thử | Gọi được, trả lời tiếng Việt có dấu |
| F6 | So găng mù: bản v0.7 (Haiku + sổ giọng) vs bản tự huấn luyện — Lucas nghe, không biết bên nào là bên nào | Có kết quả rõ ràng |
| F7 | Nếu thắng → cắm vào chuỗi não theo cách A (§4), giữ Haiku làm dự phòng | Preview chạy 20/20 |

## 6. Pass-number (chốt TRƯỚC)

- F6 so găng mù: mô hình tự huấn luyện phải **thắng hoặc hoà** ở ≥ 6/10 lượt Lucas nghe. **Thua → dừng lại,
  giữ v0.7, không tiếc tiền đã bỏ ra** (mà cũng gần như không tốn đồng nào).
- Giữ giọng tới lượt 6: **≥ 3 dấu hiệu** (bằng hoặc hơn v0.7).
- Chi phí mỗi ván: **≤ 300đ**.
- Tiếng Việt có dấu: **100%**.

## 7. Sự thật cần nói trước

- **Rất có thể v0.7 đã đủ tốt và v0.8 không hơn được bao nhiêu.** Mô hình 4B tự huấn luyện đấu với Haiku
  4.5 là cửa dưới về độ thông minh — nó chỉ hơn ở chỗ *giọng*. F6 sinh ra chính là để phát hiện điều đó
  sớm, trước khi đổ công.
- **Được gì kể cả khi thua:** một kho câu thoại sạch của 3 nhân vật (dùng lại được cho sổ giọng, cho
  Werewolf, cho bất cứ game nào sau này) + Lucas biết cách fine-tune thật, không phải nghe kể.
- **Tiền thật bỏ ra tới F5: 0đ.** Chỉ tốn tiền khi bật chạy thật ở F7.
