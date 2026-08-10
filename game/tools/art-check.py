# v0.8 — kiem tra HINH 8-BIT that: mo game, di toi nha Ly, go cua, chup man hoi thoai.
# Chay: py game/tools/art-check.py [BASE_URL]
import sys, asyncio
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://nhin-8bit.xom-dom-hong.pages.dev"

ART = [
    "/assets/art/face/gen_z_normal.png",
    "/assets/art/face/gen_z_suspect.png",
    "/assets/art/face/me_bim_sua_normal.png",
    "/assets/art/mouth/gen_z_wide_open.png",
    "/assets/art/mouth/sinh_vien_closed.png",
    "/assets/art/bg/door_gen_z.png",
]

async def main():
    errors, failed, steps = [], [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        pg = await ctx.new_page()
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        pg.on("requestfailed", lambda r: failed.append(r.url))

        # 1) moi tam anh phai tai duoc that
        for path in ART:
            r = await ctx.request.get(BASE + path)
            steps.append(("OK  " if r.status == 200 else "FAIL") + f" tai duoc {path} ({r.status})")

        # 2) vao game
        await pg.goto(BASE + "?tut=0", wait_until="networkidle")
        for sel, label in [("#pick-vi", "chon tieng Viet"), ("#btn-start", "bat dau")]:
            try:
                await pg.click(sel, timeout=8000); await pg.wait_for_timeout(1200)
                steps.append(f"OK   {label}")
            except Exception as e:
                steps.append(f"FAIL {label}: {str(e)[:70]}")
        await pg.wait_for_timeout(2000)
        await pg.screenshot(path="game/shots/v08-map.png")

        # 3) v0.8: nguoi choi dung giua xom (WW/2=720), nha Ti ngay phia tren (x=700) -> chi can di len
        for _ in range(30):
            await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(45)
        await pg.wait_for_timeout(700)
        shown = False
        for attempt in range(4):                 # go cua may lan cho chac (khoang cach <90px)
            await pg.keyboard.press("Space")
            await pg.wait_for_timeout(2200)
            shown = await pg.evaluate("!!document.querySelector('#convo.show')")
            if shown: break
            for _ in range(4):
                await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(50)
        steps.append(("OK   " if shown else "FAIL ") + "man hoi thoai mo ra")

        if shown:
            bg = await pg.evaluate("getComputedStyle(document.getElementById('convo')).backgroundImage")
            steps.append(("OK   " if "door_" in bg else "FAIL ") + "nen = anh cua nha")
            size = await pg.evaluate("(c=>c.width+'x'+c.height)(document.getElementById('npc-portrait'))")
            steps.append(("OK   " if size == "96x96" else "FAIL ") + f"chan dung dung anh that ({size})")
            await pg.wait_for_timeout(4000)          # de NPC noi vai giay -> bat mieng nhep
            await pg.screenshot(path="game/shots/v08-convo.png")

        await b.close()

    print(f"=== KIEM HINH 8-BIT — {BASE} ===")
    for s in steps: print("  " + s)
    print(f"  loi console: {len(errors)}")
    for e in errors[:5]: print("    - " + e[:110])
    print(f"  request hong: {len(failed)}")
    for f in failed[:5]: print("    - " + f[:110])
    bad = sum(1 for s in steps if s.startswith("FAIL"))
    print(f"KET QUA: {'DAT' if bad == 0 and not errors else 'CHUA DAT'} ({bad} muc hong, {len(errors)} loi)")

asyncio.run(main())
