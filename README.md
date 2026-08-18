# Xóm Đóm Hòng — kho mã nguồn của team

Game trình duyệt tiếng Việt: bạn là một con sói lịch sự, phải **nói chuyện** để được hàng xóm mở cửa
cho vào nhà. Hàng xóm là AI thật, còn điểm số do mã nguồn chấm — hai việc khác nhau và cố ý tách rời.

▶ **Chơi thử:** https://xom-dom-hong.pages.dev

> Kho này là **nơi team làm việc**. Kho `imnumber1234/xom-dom-hong` là **bản trưng bày** (bài viết
> giới thiệu kèm một tệp `judge.js`) — đừng nhầm hai kho với nhau.

---

## Có gì trong đây

| Thư mục / tệp | Chứa gì |
|---|---|
| `game/public/` | Toàn bộ phần người chơi nhìn thấy — màn hình, nhân vật, âm thanh, ảnh 8-bit |
| `game/public/js/` | Mã chạy game: `game.js` (bản đồ + di chuyển), `convo.js` (đối thoại), `ui.js` (giao diện), `mode-ket-tien.js` (chế độ Kẹt Tiền), `casino.js` (túi đồ + máy quay số) |
| `game/functions/api/` | Phần chạy trên máy chủ: `converse.js` (một lượt nói chuyện), `_brain.js` (chọn não AI), `_personas.js` (tính cách từng hàng xóm), `stt.js` (nghe giọng nói) |
| `game/tools/` | Bộ kiểm tra tự động — chạy xong in ra bao nhiêu mục đạt / tổng |
| `plan-v*.md` | Kế hoạch từng vòng làm việc, từ v0.2 đến v1.2 |
| `report.md` | Nhật ký: mỗi vòng đã làm gì, kiểm thử ra sao |
| `research/` | Nghiên cứu nền: chọn engine, so sánh các não AI, cách làm giọng nhân vật |
| `pending.md` | Việc còn treo + câu hỏi đang chờ quyết |

---

## Chạy trên máy mình

Cần **Node.js** (tải ở nodejs.org). Mở cửa sổ dòng lệnh, vào thư mục `game/`, rồi chạy:

    npx wrangler pages dev public

Mở địa chỉ mà nó in ra (thường là `localhost:8788`).

**Muốn hàng xóm AI trả lời được thì cần khoá API.** Tạo tệp `game/.dev.vars` với 5 dòng:
`GEMINI_API_KEY`, `QWEN_API_KEY`, `QWEN_BASE_URL`, `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`.
Tệp này **cố ý không nằm trong kho** — hỏi Lucas xin khoá. Không có khoá thì game vẫn chạy được
phần đi lại và giao diện, chỉ phần nói chuyện là câm.

---

## Đưa lên mạng

Bản thử (link riêng, không đụng bản chính) — chạy trong `game/`:

    npx wrangler pages deploy public --project-name xom-dom-hong --branch ten-nhanh-cua-ban

Nó trả về một link dạng `ten-nhanh-cua-ban.xom-dom-hong.pages.dev` để gửi cho người khác xem.

**Bản chính (`--branch main`) chỉ Lucas mới được đẩy.** Ai cũng đẩy thì người chơi thật sẽ dính lỗi.

---

## Luật làm việc chung

- **Nhánh riêng cho mỗi việc.** Không sửa thẳng vào `main`.
- **Đẩy bản thử trước, Lucas xem xong mới gộp vào bản chính.**
- **Chạy bộ kiểm tra trong `game/tools/` trước khi báo xong** — kèm con số đạt/tổng, đừng nói "chắc ổn".
- **Tiếng Việt phải có dấu** ở mọi chỗ người chơi đọc được. Không có ngoại lệ.
- **Không bỏ khoá API vào mã nguồn.** Khoá chỉ nằm trong `.dev.vars` hoặc trong phần bí mật của Cloudflare.
