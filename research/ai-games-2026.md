# AI trong ngành game — nghiên cứu 2026-08-21 (cho Xóm Đóm Hòng)

> Câu hỏi của Lucas: ngành game xài AI kiểu gì? có game nào dùng AI kiểu "tự hành" (agentic) chưa?
> có game AI nào THÀNH CÔNG chưa? người ta thiết kế mấy game giống mình ra sao?
> Mọi con số dưới đây đều có nguồn ở cuối bài. Chỗ nào không tìm ra số thì ghi rõ "không có số".

---

## 1. Bức tranh lớn — AI trong game 2026

| Sự thật đo được | Con số |
|---|---|
| Game khai báo "có dùng AI" trên Steam | 10,9% (2024) → 19,9% (2025) → **30,8% (2026)** |
| Phần TĂNG TRƯỞNG số game mới đến từ game AI | **60–90%** (nghiên cứu 53.000 game) |
| Nhưng doanh thu | Q1/2026: 28% số game mới, chỉ **17% doanh số**. Q2/2026: 33% số game, chỉ **10% doanh thu** |
| Chỗ AI bị ghét nhất | **72%** game AI thất bại là dùng AI cho **hình ảnh** |
| Chỗ AI được tha | giọng nói (24% ở game thành công vs 8% ở game thất bại), bản địa hoá (18% vs 6%) |

**Đọc ra ba điều:**
1. Nhãn "AI" đang là **cờ đỏ** với người chơi cốt lõi — không phải điểm bán hàng.
2. AI ở chỗ người chơi **NHÌN THẤY** (art) thì bị phạt; AI ở chỗ người chơi **NGHE/CẢM** thì được tha.
3. Xóm Đóm Hòng nằm đúng vùng an toàn: AI là **cơ chế chơi**, không phải để thay hoạ sĩ (art là pixel 8-bit tự làm).

## 2. Vì sao NPC-AI vẫn chưa bùng nổ (3 rào, từ người trong nghề)

| Rào | Nội dung | Xóm Đóm Hòng dính không? |
|---|---|---|
| **Tiền** | Người chơi càng nói nhiều, studio càng trả nhiều. Cây thoại viết tay vẫn rẻ hơn + kiểm soát được | 🟡 DÍNH — nhưng đã có chuỗi 4 não + kịch bản dự phòng, đang xài não rẻ |
| **Chưa chắc VUI** | Một đội gắn AI vào Minecraft: người thử mê lúc đầu, rồi hỏi "còn làm được gì nữa?" và bỏ | 🔴 DÍNH NẶNG — rủi ro số 1. Nói chuyện tự do mà không có MỤC TIÊU thì hết mới lạ là hết chơi |
| **Vẫn thấy giả** | AI biết quá nhiều thứ ngoài vai, mặc định "sẵn sàng giúp đỡ", không biết ngắt lời, không thật sự bất ngờ | 🟡 DÍNH — chống bằng thẻ nhân vật + sổ giọng, nhưng đo thật vẫn thấy trôi (mục 5) |

Dự đoán 2026 đáng chú ý: **"Agentic AI sẽ bị ngành game phớt lờ"** — vì agentic chủ yếu bán được lợi ích "thay người làm việc", mà studio thì không muốn cắt thêm người. Đồng thời **AI chạy tại máy (on-device) sẽ tăng mạnh** vì AI đám mây "đắt cắt cổ khi tự nuôi máy chủ".

## 3. Agentic AI trong game — ai đã làm thật

| Dự án | Làm gì | Kết quả |
|---|---|---|
| **Project Sid (Altera)** | 1.000 agent GPT-4 thả vào Minecraft, kiến trúc PIANO | Tự lập chợ, bầu hiến pháp qua Google Docs, **truyền đạo** (Pastafarian) bằng hối lộ. Gọi vốn 11 triệu $ (a16z, Eric Schmidt) |
| **Generative Agents (Stanford, "Smallville")** | 25 agent có trí nhớ + phản tỉnh + lập kế hoạch | Bài báo nền của cả lĩnh vực; agent tự tổ chức tiệc Valentine |
| **Voyager / SIMA (DeepMind)** | Agent tự học chơi, tự viết kỹ năng | Nghiên cứu, chưa thành sản phẩm bán |
| **"Bounded Autonomy" (arxiv 2604.04703, 2026)** | Cách **giới hạn** nhân vật LLM trong game nhiều người chơi | ĐÚNG bài toán của mình — cho AI tự do nói, nhưng khoá quyền quyết định |

**Kết luận:** agentic thật (agent tự đặt mục tiêu, tự hành động nhiều bước) **chưa có game thương mại nào** làm cốt lõi. Cái đang bán được là **"AI đóng vai + code cầm luật"**. Xóm Đóm Hòng đã ở đúng mô hình đó.

## 4. Game AI nào THÀNH CÔNG (có số)

| Game | Kiểu AI | Kết quả |
|---|---|---|
| **No, I'm not a Human** (Trioskaz, 09/2025) | **KHÔNG có AI** — kịch bản viết tay 100%, chỉ mượn *chủ đề* "ai là người, ai không phải" | **1 triệu bản** (3/2026); 100k tuần đầu, 500k sau 1 tháng; Steam "Overwhelmingly Positive" |
| **Suck Up!** (Proxima) | LLM đám mây, thuyết phục bằng giọng | Bùng nổ nhờ streamer, nhưng Steam **61% Mixed** — bản 1.0 hạ cấp AI và bị người chơi nổi loạn |
| **Whispers from the Star** (Anuttacon — CEO cũ HoYoverse) | LLM thời gian thực + mocap, che độ trễ bằng cớ "nhiễu sóng liên lạc" | 80% tích cực tổng, nhưng **44% trong 30 ngày gần nhất**; chê: "mất trí nhớ giữa chừng", "không muốn nói to với AI" |
| **Dead Meat** (Meaning Machine) | SLM chạy **tại máy** (NVIDIA ACE + Mistral-NeMo-Minitron 8B) | Talk GDC 2025; thuê **Lee Williams (Papers Please, Obra Dinn)** dẫn 4 người viết lore |
| **inZOI** (Krafton) | Smart Zoi trên NVIDIA ACE | Chạy trên máy người chơi |

### 🔴 Bài học đắt nhất trong bảng này
Game bán chạy nhất (1 triệu bản) là game **KHÔNG dùng AI** nhưng chơi đúng cái *cảm giác* mà AI hứa hẹn: nghi ngờ người đứng trước cửa. Nó thắng bằng **luật rõ + hậu quả + không khí**, không phải bằng model.
→ Với Xóm Đóm Hòng: **AI là gia vị, luật chơi mới là món chính.** Bỏ AI ra mà game vẫn chơi được (kịch bản dự phòng) thì mới đủ chắc.

## 5. Người ta thiết kế "game gõ cửa" ra sao — 4 khuôn mẫu

| Khuôn | Game | Cách làm | Mình lấy được gì |
|---|---|---|---|
| **Luật mới mỗi đêm** | No, I'm not a Human | Mỗi đêm dạy người chơi MỘT dấu hiệu mới để phân biệt (mắt, răng, móng, nách) | Mình chưa có "luật mới mỗi đêm" — món giữ chân rẻ nhất |
| **Sức ép ngược** | No, I'm not a Human | **Bắt buộc** phải chứa ít nhất 1 khách trước đêm 4, không thì chết | Ép người chơi phải liều, không được thủ hoà |
| **Ba loại khách** | No, I'm not a Human | Chắc chắn người · chắc chắn quái · **ngẫu nhiên** → mỗi lần chơi khác nhau | Mình có 3 nhà cố định → chơi lại là biết trước |
| **Gắn bó TRƯỚC khi giết** | Vampyr | Cho quen NPC, học "manh mối" về họ → càng biết nhiều, máu càng ngon; NPC bệnh thì máu yếu → muốn ăn ngon phải đi **CHỮA** cho họ trước | Đây là lời giải cho "vì sao sói phải đi từng nhà" |
| **Chơi làm quái = tự sinh đồng cảm** | Carrion | "Muốn ai đó thương một con quái, cho họ ĐÓNG con quái đó" | Không cần biện minh nhiều; chỉ cần cho sói một cái THIẾU |

## 6. Thanh thiện cảm — người ta làm sao

- **Persona (Social Link):** chọn đúng câu → **tối đa 3 điểm** thiện cảm/lần. Điểm do **CODE** cộng theo lựa chọn, không phải AI chấm.
- **Hệ affinity indie hiện đại:** tách 3 chỉ số — *Fondness* (quý) · *Familiarity* (quen) · *Mood* (tâm trạng hôm nay) → gộp thành bậc: Người lạ → Quen → Bạn → Thân.
- **Suck Up!:** HIỆN thanh Suck Up ra màn hình. Mình cố ý GIẤU (cửa mở 4 nấc). Giấu thì sang hơn nhưng **người mới không biết mình đang thắng hay thua**.
- **Rút ra:** thanh do **code** cộng theo **từ khoá**, AI chỉ lo lời thoại. Đúng thứ Lucas đang xin.

## 7. Hộp kính (observability) — ngành làm thế nào

| Lớp | Ngành làm gì | Bản 0đ cho mình |
|---|---|---|
| **Ghi vết mỗi lượt** | Mỗi lượt gọi AI = 1 bản ghi JSON: câu vào, câu ra, model, token, độ trễ, mã phiên. "Không thương lượng" | Cloudflare **AI Gateway ĐÃ ghi sẵn** prompt + trả lời + token + tiền + thời gian (mình đã đi qua gateway rồi) |
| **Chuẩn đặt tên** | OpenTelemetry **GenAI semantic conventions** (`gen_ai.*`) — chuẩn chung, còn ở trạng thái thử nghiệm | Chưa cần. Ghi thẳng vào D1 với tên cột của mình là đủ |
| **Nền xem** | Langfuse (mã nguồn mở, tự nuôi được) · LangSmith · Braintrust · Arize · Helicone | Langfuse tự nuôi = 0đ nhưng phải nuôi máy chủ. **D1 + 1 trang HTML** rẻ hơn |
| **Chấm điểm tự động** | **LLM-as-a-judge**: một AI khác chấm câu trả lời theo rubric; dùng để **kiểm tra hồi quy** mỗi lần sửa prompt | Mình đã có sẵn "phiếu" verdict — chỉ cần bộ 20 hội thoại mẫu chạy lại sau mỗi lần sửa |
| **Bánh đà dữ liệu** | Lỗi thật ngoài đời → hàng đợi để người xem → thành bài kiểm hồi quy | Đây là cái mình cần nhất khi playtest với bạn bè |
| **Đo game (không phải AI)** | 10 sự kiện đầu tiên nên ghi: mở phiên · phễu hướng dẫn · phễu màn · 1 cặp kinh tế. Bảng quan trọng nhất = **phễu người mới (FTUE)** + biểu đồ độ dài phiên | Mình chưa ghi MỘT sự kiện nào |

## Nguồn
- https://fragwyz.substack.com/p/three-years-of-ai-on-steam
- https://www.gamesradar.com/games/steam-study-of-over-53-000-games-finds-60-90-percent-of-the-growth-in-monthly-releases-on-valves-store-is-from-games-using-ai-and-almost-none-of-them-make-money/
- https://app.cinevva.com/news/2026-07-20-steam-ai-disclosure-study
- https://www.frisson-labs.com/ai-npcs-2026
- https://www.aiandgames.com/p/10-predictions-for-ai-in-games-for
- https://www.technologyreview.com/2024/11/27/1107377/a-minecraft-town-of-ai-characters-made-friends-invented-jobs-and-spread-religion/
- https://arxiv.org/pdf/2411.00114 · https://arxiv.org/pdf/2604.04703
- https://nichegamer.com/no-im-not-a-human-sells-over-1-million-copies/ · https://www.vgchartz.com/article/467356/no-im-not-a-human-sales-top-1-million-units/
- https://store.steampowered.com/app/3180070/No_Im_not_a_Human/
- https://store.steampowered.com/app/3730100/Whispers_from_the_Star/ · https://www.metacritic.com/game/whispers-from-the-star/
- https://aws.amazon.com/blogs/storage/how-anuttacon-scaled-ai-enhanced-gaming-workloads-for-whispers-from-the-star/
- https://www.nvidia.com/en-us/on-demand/session/gdc25-gdc1010/
- https://game-wisdom.com/analysis/vampyr · https://www.vice.com/en/article/how-carrion-built-empathy-for-its-fleshy-monster/
- https://www.rpgsite.net/feature/13722-persona-3-portable-social-link-guide-full-s-link-walkthroughs-dialogue-options
- https://developers.cloudflare.com/ai-gateway/observability/logging/ · https://langfuse.com/integrations/native/opentelemetry
- https://gamineai.com/blog/the-first-10-telemetry-events-every-indie-game-should-ship-and-why
- https://tienphong.vn/giai-ma-bi-mat-cua-ma-ca-rong-post1841784.tpo (ma cà rồng VN — hút hơi, không hút máu) · https://imknownasthu.wixsite.com/lifhorror/post/ma-lai-rut-ruot-la-gi
