# v0.8 — THI NGHIEM: cham buoc huong dan bang TU KHOA vs bang AI.
# Bo cau thu = nhung cau NGUOI THAT hay go (1 chu, sai chinh ta, noi vong vo, noi bay, sai vai).
# Do 2 con so: cho qua dung (accept) va chan dung (reject).
# Chay: py game/tools/gate-experiment.py [BASE_URL]
import sys, json, asyncio
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://huong-dan.xom-dom-hong.pages.dev"

# (buoc, cau go vao, dung ra phai CHO QUA khong)
CASES = [
    # --- buoc 1: phai xung la shipper / giao hang ---
    (1, "shipper", True),
    (1, "shipper ạ", True),
    (1, "dạ con là shipper giao hàng ạ", True),
    (1, "con giao hàng cho bà nè", True),
    (1, "e la shiper", True),                        # sai chinh ta, viet tat
    (1, "con đi giao trà sữa cho bà", True),
    (1, "delivery", True),
    (1, "dạ con chào bà, con là người giao hàng", True),
    (1, "chào", False),
    (1, "chào cc", False),
    (1, "im đi", False),
    (1, "công an", False),                           # sai vai
    (1, "cháu là hàng xóm mới dọn tới", False),      # sai vai
    (1, "bà khoẻ không", False),
    (1, "con không phải shipper đâu", False),        # co tu khoa nhung PHU DINH
    (1, "cho con vào nhà với", False),
    # --- buoc 2: phai noi day la qua sinh nhat cua ba ---
    (2, "quà sinh nhật của bà nè", True),
    (2, "dạ ông Ba gửi quà sinh nhật cho bà ạ", True),
    (2, "birthday gift cho bà", True),
    (2, "hộp quà người yêu cũ của bà gửi", True),
    (2, "con không biết", False),
    (2, "chào bà", False),
    (2, "cho con vô nhà", False),
    # --- buoc 3: phai tra loi mot chi tiet cu the ---
    (3, "ổng ghi là ông Ba", True),
    (3, "trong thiệp ghi Chúc Năm sinh nhật vui vẻ", True),
    (3, "dạ", False),
    (3, "con không biết", False),
]

GOALS = {
    1: "Chào bà, rồi xưng mình là SHIPPER giao hàng.",
    2: "Kể một chuyện KHỚP với bộ đồ: nói đây là QUÀ SINH NHẬT của bà — người yêu cũ gửi.",
    3: "Trả lời một chi tiết CỤ THỂ (tên trong thiệp, chữ ông ấy viết).",
}

JS_AI = """
async ([step, text, goal]) => {
  const r = await fetch('/api/converse', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({tutorAsk:true, step, goal, playerText:text, lang:'vi', mode:'ma_soi'})
  });
  return await r.json();
}
"""

async def main():
    rows = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context()).new_page()
        await pg.goto(BASE, wait_until="networkidle")
        for step, text, want in CASES:
            kw = await pg.evaluate("([t,s]) => XDH.Tut._gate(t, s)", [text, step])
            try:
                j = await pg.evaluate(JS_AI, [step, text, GOALS[step]])
                ai = j.get("dat")
                line = (j.get("line") or "").replace("\n", " ")
            except Exception as e:
                ai, line = None, "LOI: " + str(e)[:60]
            rows.append((step, text, want, kw, ai, line))
            mark = lambda v: "?" if v is None else ("cho qua" if v else "chan   ")
            ok_kw = "OK" if kw == want else "SAI"
            ok_ai = "OK" if ai == want else ("?" if ai is None else "SAI")
            print(f"  b{step} {text[:44]:<46} dung={'cho qua' if want else 'chan   '} | tu khoa {mark(kw)} {ok_kw:<3} | AI {mark(ai)} {ok_ai}")
        await b.close()

    def score(idx):
        good = sum(1 for r in rows if r[idx] == r[2])
        acc = sum(1 for r in rows if r[2] and r[idx] == True)
        rej = sum(1 for r in rows if not r[2] and r[idx] == False)
        return good, acc, rej
    tot_acc = sum(1 for r in rows if r[2]); tot_rej = len(rows) - tot_acc
    gk, ak, rk = score(3); ga, aa, ra = score(4)
    print("\n=== KET QUA ===")
    print(f"  TU KHOA : {gk}/{len(rows)} dung  (cho qua dung {ak}/{tot_acc} · chan dung {rk}/{tot_rej})")
    print(f"  AI      : {ga}/{len(rows)} dung  (cho qua dung {aa}/{tot_acc} · chan dung {ra}/{tot_rej})")
    print("\n=== CHO KHAC NHAU ===")
    for step, text, want, kw, ai, line in rows:
        if kw != ai:
            print(f"  b{step} \"{text}\" — dung={'cho qua' if want else 'chan'} · tu khoa={'cho qua' if kw else 'chan'} · AI={'cho qua' if ai else 'chan'}")
            print(f"       ba noi: {line[:110]}")
    json.dump([{"step": s, "text": t, "want": w, "keyword": k, "ai": a, "line": l} for s, t, w, k, a, l in rows],
              open("game/tools/gate-experiment-out.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

asyncio.run(main())
