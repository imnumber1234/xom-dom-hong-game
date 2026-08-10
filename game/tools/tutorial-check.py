# v0.8 T-check — nha huong dan Ba Nam: go bay ba thi KHONG duoc qua buoc.
# Chay: py game/tools/tutorial-check.py [BASE_URL]
import sys, asyncio
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://huong-dan.xom-dom-hong.pages.dev"

# (chu go vao, buoc mong doi SAU khi go, mo ta)
MODE = "ket_tien" if "--kt" in sys.argv else "ma_soi"

CASES_KT = [
    ("chào cc",                                           1, "noi bay -> van o buoc 1"),
    ("bà ơi",                                             1, "chua xung sinh vien -> van buoc 1"),
    ("dạ con chào bà, con là sinh viên bị kẹt lại đây",   2, "dung -> qua buoc 2"),
    ("dạ con khổ lắm",                                    2, "chua ke cu the -> van buoc 2"),
    ("dạ con hết sạch tiền, điện thoại hết pin từ trưa, cả ngày chưa ăn gì", 3, "cu the -> qua buoc 3"),
    ("dạ",                                                3, "cut lun -> van buoc 3"),
    ("dạ con học VNUK, trọ ở đường Nguyễn Lương Bằng",   4, "cu the -> qua buoc 4"),
    ("ừ",                                                 4, "chua cam on -> van buoc 4"),
    ("dạ con cảm ơn bà nhiều lắm ạ",                     -1, "cam on -> xong huong dan"),
]

CASES_MS = [
    ("chào cc",                                          1, "noi bay -> van o buoc 1"),
    ("im đi",                                            1, "noi cho co -> van o buoc 1"),
    ("bà khoẻ không",                                    1, "chao suong, chua xung nghe -> van buoc 1"),
    ("dạ con chào bà, con là shipper giao hàng ạ",        2, "dung yeu cau -> qua buoc 2"),
    ("hello bà",                                          2, "chua ke qua sinh nhat -> van buoc 2"),
    ("dạ đây là quà sinh nhật của bà, ông Ba gửi ạ",      3, "dung -> qua buoc 3"),
    ("hả",                                                3, "tra loi cut lun -> van buoc 3"),
    ("dạ ổng ghi là ông Ba, chúc bà sinh nhật vui vẻ",    4, "chi tiet cu the -> qua buoc 4"),
]

async def step_now(pg):
    txt = await pg.inner_text("#tut-hint")
    for n in "1234":
        if f"BƯỚC {n}/4" in txt or f"STEP {n}/4" in txt:
            return int(n)
    return -1

async def say(pg, text):
    await pg.fill("#text-in", text)
    await pg.press("#text-in", "Enter")
    for _ in range(70):                      # cho ba noi xong (man ket Ket Tien dai ~15s)
        await pg.wait_for_timeout(500)
        if not await pg.is_disabled("#text-in"):
            break
    await pg.wait_for_timeout(400)

async def main():
    errors = []
    passed = failed = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={"width": 1280, "height": 860})).new_page()
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))

        await pg.goto(BASE, wait_until="networkidle")
        await pg.click("#pick-vi"); await pg.wait_for_timeout(600)
        if MODE == "ket_tien":
            await pg.click('#mode-pick button[data-m="ket_tien"]'); await pg.wait_for_timeout(600)
        await pg.click("#btn-start"); await pg.wait_for_timeout(3000)

        print(f"=== NHA HUONG DAN — {BASE} — che do {MODE} ===")
        print("  buoc dau:", await step_now(pg))
        for text, want, why in (CASES_KT if MODE == "ket_tien" else CASES_MS):
            await say(pg, text)
            if want == -1:                       # man ket: cho ba trao tien xong han
                await pg.wait_for_timeout(6000)
                hint = await pg.inner_text("#tut-hint") if await pg.is_visible("#tut-hint") else ""
                dlg = await pg.inner_text("#dialogue")
                got, ok = -1, ("XONG" in hint or "DONE" in hint or not hint) and ("30k" in dlg or "30" in dlg)
                print(f"  {'DAT ' if ok else 'HONG'} go \"{text[:38]}\" -> ket thuc huong dan — {why}")
                passed += ok; failed += (not ok)
                continue
            got = await step_now(pg)
            ok = got == want
            passed += ok; failed += (not ok)
            print(f"  {'DAT ' if ok else 'HONG'} go \"{text[:38]}\" -> buoc {got} (mong doi {want}) — {why}")

        if MODE == "ma_soi":
            bite = await pg.is_visible("#btn-kill")
            print(f"  {'DAT ' if bite else 'HONG'} nut CAN hien ra o buoc 4")
            passed += bite; failed += (not bite)
        await pg.screenshot(path="game/shots/v08-huong-dan.png")
        await b.close()

    print(f"  loi console: {len(errors)}")
    for e in errors[:6]:
        print("   -", e[:160])
    total = passed + failed
    print(f">>> {passed}/{total} DAT" + ("" if not errors else f" (nhung co {len(errors)} loi console)"))

asyncio.run(main())
