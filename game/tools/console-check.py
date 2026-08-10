# v0.7 T5 — kiem tra trinh duyet: mo game that, di het man dau, dem loi console.
# Chay: py game/tools/console-check.py [BASE_URL]
import sys, asyncio
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://giong-that.xom-dom-hong.pages.dev"

async def main():
    errors, failed = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={"width": 1280, "height": 800})).new_page()
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        pg.on("requestfailed", lambda r: failed.append(r.url))

        await pg.goto(BASE + "?tut=0", wait_until="networkidle")
        steps = []
        for sel, label in [("#pick-vi", "chon tieng Viet"), ("#btn-start", "bat dau")]:
            try:
                await pg.click(sel, timeout=8000)
                await pg.wait_for_timeout(1500)
                steps.append(f"OK   {label}")
            except Exception as e:
                steps.append(f"FAIL {label}: {str(e)[:80]}")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path="game/shots/v07-giong-that.png")
        await b.close()

    print(f"=== KIEM TRINH DUYET — {BASE} ===")
    for s in steps:
        print(" ", s)
    print(f"  loi console: {len(errors)}")
    for e in errors[:8]:
        print("   -", e[:160])
    print(f"  request hong: {len(failed)}")
    for f in failed[:5]:
        print("   -", f[:160])
    print("KET QUA:", "DAT (0 loi)" if not errors and not failed else "KHONG DAT")

asyncio.run(main())
