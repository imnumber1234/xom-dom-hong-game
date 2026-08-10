# v0.8b — kiem BAN DO 8-BIT DI DUOC: nha la anh that, may quay chay theo nguoi choi.
# Chay: py game/tools/map-check.py [BASE_URL]
import sys, asyncio
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://nhin-8bit.xom-dom-hong.pages.dev"
ART = ["/assets/art/bg/house0.png", "/assets/art/bg/house1.png",
       "/assets/art/bg/house2.png", "/assets/art/bg/sky.png"]

async def main():
    errors, failed, steps = [], [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        pg = await ctx.new_page()
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        pg.on("requestfailed", lambda r: failed.append(r.url))

        for path in ART:
            r = await ctx.request.get(BASE + path)
            steps.append(("OK  " if r.status == 200 else "FAIL") + f" tai duoc {path} ({r.status})")

        await pg.goto(BASE + "?tut=0", wait_until="networkidle")
        for sel, label in [("#pick-vi", "chon tieng Viet"), ("#btn-start", "bat dau")]:
            try:
                await pg.click(sel, timeout=8000); await pg.wait_for_timeout(1200)
                steps.append(f"OK   {label}")
            except Exception as e:
                steps.append(f"FAIL {label}: {str(e)[:70]}")
        await pg.wait_for_timeout(2200)

        cam = "(()=>{const s=window.Phaser&&Phaser.Game?null:null; return null})()"
        # doc vi tri may quay qua canvas -> dung cach khac: chup 2 tam roi so sanh
        before = await pg.screenshot(path="game/shots/v08b-map-left.png")
        for _ in range(60):
            await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(30)
        await pg.wait_for_timeout(900)
        after = await pg.screenshot(path="game/shots/v08b-map-right.png")
        steps.append(("OK   " if before != after else "FAIL ") + "ban do CHAY THEO khi di sang phai")

        # di tiep toi quan banh mi o ria phai
        for _ in range(40):
            await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(28)
        await pg.wait_for_timeout(800)
        await pg.screenshot(path="game/shots/v08b-map-far.png")
        await b.close()

    print(f"=== KIEM BAN DO — {BASE} ===")
    for s in steps: print("  " + s)
    print(f"  loi console: {len(errors)}")
    for e in errors[:5]: print("    - " + e[:110])
    print(f"  request hong: {len(failed)}")
    for f in failed[:5]: print("    - " + f[:110])
    bad = sum(1 for s in steps if s.startswith("FAIL"))
    print(f"KET QUA: {'DAT' if bad == 0 and not errors else 'CHUA DAT'} ({bad} muc hong, {len(errors)} loi)")

asyncio.run(main())
