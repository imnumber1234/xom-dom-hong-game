# v1.0 — KIEM MAY HE NHIEM VU (phan trinh duyet, Playwright + co ?mission=test).
# Di du 3 duong giai (mua / muon Ti / luc rac), popup tu choi roi hien lai, ket Soi Hien,
# binh minh 0-can, Ket Tien khong dinh, va dem loi console tren toan bo duong di.
# Chay:  py game/tools/mission-check.py [BASE_URL]
import sys, asyncio, json
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://nhiem-vu.xom-dom-hong.pages.dev").rstrip("/")
URL = BASE + "/?tut=0&mission=test"

checks, errors = [], []
def add(what, ok, ev=""):
    checks.append((what, bool(ok), str(ev)[:150]))

async def fresh(pg, first=False):
    await pg.goto(URL, wait_until="networkidle")
    if first:
        try: await pg.click("#pick-vi", timeout=6000)
        except Exception: pass
    await pg.click("#btn-start", timeout=8000)
    try:
        if await pg.is_visible("#ov-story"):
            await pg.click("#story-skip", timeout=3000)
    except Exception: pass
    await pg.wait_for_timeout(700)

async def ev(pg, script):
    return await pg.evaluate(script)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        pg = await ctx.new_page()
        pg.on("console", lambda m: errors.append(m.text[:150]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(("pageerror: " + str(e))[:150]))

        # ── Trang 1: cong gac manh moi + tu choi/hien lai + nhan + duong 💰 + ket Hien ──
        await fresh(pg, first=True)
        add("Tay nam ?mission=test co mat", await ev(pg, "!!window.XDH.MissionTest"))

        await ev(pg, "XDH.MissionTest.signal('ro_chuyen','gen_z',{interest:40},1)")
        add("P1a — quan tam 40 → ro_chuyen bi CHAN, popup KHONG hien",
            not await ev(pg, "XDH.MissionTest.popupShown()"))
        await ev(pg, "XDH.MissionTest.signal('ro_chuyen','gen_z',{interest:70},2)")
        add("P1b — quan tam 70 nhung CHUA du 2 manh moi → van chan",
            not await ev(pg, "XDH.MissionTest.popupShown()"))
        await ev(pg, "XDH.MissionTest.signal('manh_moi_1','gen_z',{interest:70},3)")
        add("P1c — manh moi 1 vao so (clues=1)", await ev(pg, "XDH.MissionTest.st().clues") == 1)
        await ev(pg, "XDH.MissionTest.signal('manh_moi_2','gen_z',{interest:70},4)")
        add("P1d — manh moi 2 den SOM (cach <2 luot) → chua nhan",
            await ev(pg, "XDH.MissionTest.st().clues") == 1)
        await ev(pg, "XDH.MissionTest.signal('manh_moi_2','gen_z',{interest:70},5)")
        add("P1e — du nhip 2 luot → manh moi 2 vao so (clues=2)",
            await ev(pg, "XDH.MissionTest.st().clues") == 2)
        await ev(pg, "XDH.MissionTest.signal('ro_chuyen','gen_z',{interest:70},7)")
        add("P1f — du 2 manh moi + quan tam 70 → popup 📱 HIEN",
            await ev(pg, "XDH.MissionTest.popupShown()"))

        await pg.click("#btn-mi-no")
        add("P5a — bam THOI → popup dong, chua nhan nhiem vu",
            not await ev(pg, "XDH.MissionTest.popupShown()") and
            await ev(pg, "XDH.MissionTest.st().stage") == "da_mo_popup")
        await ev(pg, "XDH.MissionTest.signal('ro_chuyen','gen_z',{interest:70},9)")
        add("P5b — nhac lai chuyen TikTok → popup HIEN LAI (tu choi khong giet mach)",
            await ev(pg, "XDH.MissionTest.popupShown()"))

        await pg.click("#btn-mi-yes")
        await pg.wait_for_timeout(500)
        add("Nhan nhiem vu → stage da_nhan + o HUD 🎯 hien",
            await ev(pg, "XDH.MissionTest.st().stage") == "da_nhan" and
            await pg.is_visible("#hud-mission"))
        add("The gioi doi: 3 thung rac moc ra tren ban do",
            await ev(pg, "(window.XDH_GAME.scene.scenes[0].trashBins||[]).length") == 3)

        add("Duong 💰 — xe banh mi co ban gay selfie (UI)",
            "Gậy selfie" in await ev(pg, "XDH.UI.openShop(), document.getElementById('shop-items').innerText"))
        await ev(pg, "document.getElementById('ov-shop').classList.remove('show')")
        await ev(pg, "XDH.MissionTest.setMoney(100)")
        bought = await ev(pg, "XDH.MissionTest.buy()")
        st = await ev(pg, "XDH.MissionTest.st()")
        add("Duong 💰 — mua 80k: tru tien dung + co do (co_do)",
            bought and st["stage"] == "co_do" and st["money"] == 20 and "gay_selfie" in st["items"], json.dumps(st)[:100])

        # tra do cho Ly → thuong 50k + ket SOI HIEN (0 cu can)
        await ev(pg, "XDH.Convo.start(0)")
        await pg.wait_for_selector("#btn-give-stick", state="visible", timeout=15000)
        add("Gap Ly voi gay trong tui → nut 🤳 DUA GAY hien", True)
        await pg.click("#btn-give-stick")
        for _ in range(60):
            if await ev(pg, "XDH.MissionTest.st().stage") == "xong": break
            await pg.wait_for_timeout(500)
        st = await ev(pg, "XDH.MissionTest.st()")
        add("Tra do → stage xong + thuong +50k (20 → 70k)",
            st["stage"] == "xong" and st["money"] == 70, json.dumps(st)[:100])
        try:
            await pg.wait_for_selector("#ov-hien.show", timeout=8000)
            add("0 cu can + nhiem vu xong → man ket 😇 SOI HIEN hien NGAY", True)
        except Exception:
            add("0 cu can + nhiem vu xong → man ket 😇 SOI HIEN hien NGAY", False)
        await pg.click("#btn-hien-next")
        add("Bang tong ket doi tieu de SOI HIEN",
            "SÓI HIỀN" in (await pg.inner_text("#score-title")))

        # ── Trang 2: duong 🤝 muon Ti (CODE xet tin, khong tin loi AI suong) ──
        await fresh(pg)
        await ev(pg, "XDH.MissionTest.setStage('da_nhan')")
        await ev(pg, "XDH.MissionTest.signal('dong_y_cho_muon','sinh_vien',{trust:40},5)")
        add("Duong 🤝 — Ti 'dong y mom' khi tin 40 → CODE chan, chua co do",
            await ev(pg, "XDH.MissionTest.st().stage") == "da_nhan")
        await ev(pg, "XDH.MissionTest.signal('dong_y_cho_muon','sinh_vien',{trust:70},6)")
        st = await ev(pg, "XDH.MissionTest.st()")
        add("Duong 🤝 — tin 70 → duoc muon that (co_do, nguon 'ti')",
            st["stage"] == "co_do" and st["source"] == "ti", json.dumps(st)[:100])

        # ── Trang 3: duong 🗑️ luc rac + tran viec vat ──
        await fresh(pg)
        await ev(pg, "XDH.MissionTest.setStage('da_nhan')")
        await ev(pg, "XDH.MissionTest.loot(0,'stick')")
        st = await ev(pg, "XDH.MissionTest.st()")
        add("Duong 🗑️ — thung rac nha ra gay (co_do, nguon 'rac')",
            st["stage"] == "co_do" and st["source"] == "rac", json.dumps(st)[:100])
        m0 = st["money"]
        await ev(pg, "XDH.MissionTest.loot(0,'coins')")
        add("Thung da luc → luc lai KHONG an them (1 lan/dem)",
            await ev(pg, "XDH.MissionTest.st().money") == m0)
        await ev(pg, "XDH.MissionTest.loot(1,'coins')")
        add("Thung khac — tien le 5-10k vao vi",
            m0 + 5 <= await ev(pg, "XDH.MissionTest.st().money") <= m0 + 10)
        c1 = await ev(pg, "XDH.MissionTest.chore(0)")
        c2 = await ev(pg, "XDH.MissionTest.chore(0)")
        c3 = await ev(pg, "XDH.MissionTest.chore(0)")
        st = await ev(pg, "XDH.MissionTest.st()")
        add("Viec vat — tran 2 lan/nha/dem (lan 3 bi tu choi) + tong <=120k",
            c1 and c2 and (not c3) and st["chore"]["nightTotal"] <= 120, json.dumps(st["chore"]))

        # ── Trang 4: Soi Du khong doi 1 dong + binh minh 0-can ──
        await fresh(pg)
        add("Soi Du — chua nhan nhiem vu: KHONG thung rac, KHONG o HUD 🎯",
            await ev(pg, "window.XDH_GAME.scene.scenes[0].trashBins === null") and
            not await pg.is_visible("#hud-mission"))
        await ev(pg, "XDH.run.nightStart = Date.now() - 9*60000")
        await pg.wait_for_timeout(1500)
        add("Binh minh 0 cu can + nhiem vu CHUA xong → dem troi binh thuong (khong thua, sang dem 2)",
            await ev(pg, "XDH.run.night") == 2 and not await pg.is_visible("#ov-score.show"))
        await ev(pg, "XDH.MissionTest.setStage('xong')")
        await ev(pg, "XDH.run.dawnHandled = false; XDH.run.nightStart = Date.now() - 9*60000")
        try:
            await pg.wait_for_selector("#ov-hien.show", timeout=6000)
            add("Luoi do binh minh: 0 can + xong → ket SOI HIEN", True)
        except Exception:
            add("Luoi do binh minh: 0 can + xong → ket SOI HIEN", False)

        # ── Trang 5: Ket Tien khong dinh he nhiem vu ──
        await pg.goto(URL, wait_until="networkidle")
        await pg.click("#mode-pick button[data-m='ket_tien']")
        await pg.click("#btn-start")
        try:
            if await pg.is_visible("#ov-story"):
                await pg.click("#story-skip", timeout=3000)
        except Exception: pass
        await pg.wait_for_timeout(700)
        add("Ket Tien — he nhiem vu TAT (on()=false), khong o 🎯, khong thung rac",
            not await ev(pg, "XDH.Mission.on()") and
            not await pg.is_visible("#hud-mission") and
            await ev(pg, "window.XDH_GAME.scene.scenes[0].trashBins === null"))

        await pg.screenshot(path="game/shots/v10-nhiem-vu.png")
        await b.close()

    print(f"=== KIEM HE NHIEM VU — {BASE} ===")
    for what, ok, evd in checks:
        print(("  ✅ " if ok else "  ❌ ") + what + (("  | " + evd) if (evd and not ok) else ""))
    passed = sum(1 for _, ok, _ in checks if ok)
    print(f"\n  loi console: {len(errors)}")
    for e in errors[:8]: print("   -", e)
    print(f">>> {passed}/{len(checks)} DAT · console {'SACH' if not errors else 'CO LOI'}")
    out = {"base": BASE, "passed": passed, "total": len(checks), "console_errors": errors,
           "checks": [{"what": w, "pass": o, "ev": e} for w, o, e in checks]}
    with open("game/tools/mission-check-browser-out.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    sys.exit(0 if passed == len(checks) and not errors else 1)

asyncio.run(main())
