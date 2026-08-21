// _dashauth.js — cửa khoá của BẢNG ĐÈN.
//
// Bảng đèn chứa NGUYÊN VĂN lời người chơi → plan-v2.0 §4 ghi rõ: bắt buộc nằm sau
// Cloudflare Access. Access bật bằng tay trong trang quản trị Zero Trust (chìa khoá
// của máy không mở được mục đó) → tạm thời khoá bằng MỘT MẬT KHẨU RIÊNG cho tới khi
// Lucas gắn Access. Hai lớp sống chung được:
//
//   1. Có Access  → Cloudflare tự gắn tiêu đề `Cf-Access-Jwt-Assertion`. Thấy là cho vào,
//                   vì tới được đây nghĩa là Access đã kiểm danh tính xong.
//   2. Chưa Access→ phải có `?key=…` khớp bí mật DASH_KEY. Đúng thì gài bánh quy 12 tiếng
//                   để lần sau khỏi dán lại.
//
// KHÔNG có DASH_KEY và KHÔNG có Access → KHOÁ HẲN (mặc định đóng). Thà Lucas phải bật
// một biến còn hơn lỡ mở nguyên sổ lời người chơi ra cho cả internet.

const COOKIE = 'xdh_dash';
const MAX_AGE = 60 * 60 * 12;

function cookieOf(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

// So chuỗi kiểu "không rò rỉ thời gian" — hơi thừa ở quy mô này nhưng không tốn gì.
function same(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Trả về { ok: true, setCookie? } hoặc { ok: false, res } — res là câu trả lời chối cửa.
 */
export function dashGate(ctx) {
  const { request, env } = ctx;
  if (request.headers.get('Cf-Access-Jwt-Assertion')) return { ok: true };

  const key = env.DASH_KEY;
  if (!key) {
    return { ok: false, res: deny('Bảng đèn chưa mở khoá', [
      'Trang này chứa nguyên văn lời người chơi nên mặc định ĐÓNG.',
      'Muốn xem: đặt bí mật DASH_KEY cho dự án rồi mở lại kèm ?key=…',
      'Cách chuẩn (lâu dài): gắn Cloudflare Access cho đường dẫn /dash và /api/stats.'
    ]) };
  }

  const url = new URL(request.url);
  const given = url.searchParams.get('key') || cookieOf(request, COOKIE);
  if (given && same(given, key)) {
    return { ok: true, setCookie: `${COOKIE}=${encodeURIComponent(key)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax` };
  }
  return { ok: false, res: deny('Sai chìa', ['Thêm ?key=… vào cuối địa chỉ.']) };
}

function deny(title, lines) {
  const body = `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Xóm Đóm Hòng</title>
<style>
  :root{--bg:#0e1a2e;--ink:#e8eefc;--dim:#8fa3c8;--accent:#ffb547;}
  html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);
    font:16px/1.6 "Segoe UI",system-ui,sans-serif;display:grid;place-items:center;padding:24px}
  .box{max-width:520px;background:#152743;border:1px solid #24406b;border-radius:14px;padding:28px}
  h1{margin:0 0 12px;font-size:22px;color:var(--accent)}
  p{margin:6px 0;color:var(--dim)}
</style>
<div class="box"><h1>🔒 ${title}</h1>${lines.map(l => `<p>${l}</p>`).join('')}</div>`;
  return new Response(body, { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export function withCookie(res, gate) {
  if (gate && gate.setCookie) res.headers.append('Set-Cookie', gate.setCookie);
  return res;
}
