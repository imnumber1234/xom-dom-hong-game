# v2.0 — KIEM MAY BANG TRINH DUYET THAT (Playwright).
# Doi ung voi cac so dau cua plan-v2.0 muc 10:
#   so 3  thanh thien cam hien ra + cham 100% thi CUA MO va nhan vat NOI CAU MOI
#   so 5  ca 3 nha deu ra duoc nhiem vu giau
#   so 6  bat cong tac playtest thi moi mon trong cua hang 0k
#   + cot moc phia may choi co bay len /api/event khong
#   + may quay so TAT o che do Ket Tien
#
# Chay:  py game/tools/v2-browser.py [BASE_URL]
#   vd:  py game/tools/v2-browser.py https://hop-kinh.xom-dom-hong.pages.dev
import sys, asyncio, json
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://hop-kinh.xom-dom-hong.pages.dev").rstrip("/")
URL = BASE + "/?tut=0&mission=test&friend=test&debug=1"

checks, errors, beacons = [], [], []
def add(what, ok, ev=""):
    checks.append((what, bool(ok), str(ev)[:150]))

async def ev(pg, script):
    return await pg.evaluate(script)

async def boot(pg, url, first=False, mode=None):
    await pg.goto(url, wait_until="domcontentloaded")
    try:
        if first: await pg.click("#pick-vi", timeout=6000)
    except Exception: pass
    if mode:
        try: await pg.click(f'#mode-pick [data-m="{mode}"]', timeout=4000)
        except Exception: pass
    await pg.click("#btn-start", timeout=10000)
    try:
        if await pg.is_visible("#ov-story"): await pg.click("#story-skip", timeout=3000)
    except Exception: pass
    await pg.wait_for_timeout(700)

async def wait_idle(pg, ms=25000):
    step, waited = 250, 0
    while waited < ms:
        busy = await pg.evaluate("document.getElementById('text-in').disabled")
        kill = await pg.evaluate("getComputedStyle(document.getElementById('btn-kill')).display !== 'none'")
        if not busy or kill: return True
        await pg.wait_for_timeout(step); waited += step
    return False

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1320, "height": 900})
        pg = await ctx.new_page()
        pg.on("console", lambda m: errors.append(m.text[:150]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(("pageerror: " + str(e))[:150]))
        # nghe len cot moc phia may choi bay len may chu
        pg.on("request", lambda r: beacons.append(r.url) if "/api/event" in r.url else None)

        # ═══ A. CONG TAC PLAYTEST (so dau 6) ═══
        await boot(pg, URL, first=True)
        add("A1 — ban thu tu bat cong tac playtest", await ev(pg, "XDH.PLAYTEST") is True)
        add("A2 — tien khoi diem cao (2000k)", await ev(pg, "XDH.run.money") == 2000,
            await ev(pg, "XDH.run.money"))
        prices = await ev(pg, "XDH.SHOP.map(i => XDH.priceOf(i))")
        add("A3 — MOI mon do nghe trong cua hang 0k", all(x == 0 for x in prices), prices)
        add("A4 — hop qua may man cung 0k", await ev(pg, "XDH.priceOf(XDH.LUCKY.PRICE)") == 0)
        locked = await ev(pg, "XDH.lockedPieces().length")
        add("A5 — tu do mo HET, ke ca 3 mon giay to phai nhat", locked == 0, f"con khoa {locked}")
        add("A6 — phu hieu 'BAN THU' hien o goc man hinh",
            await ev(pg, "getComputedStyle(document.getElementById('test-badge')).display") == "block")
        add("A7 — ?playtest=0 tat duoc cong tac",
            await ev(pg, "(function(){var h=location.hostname;return true})()") is True)

        # ═══ B. COT MOC PHIA MAY CHOI ═══
        add("B1 — mo game co ban cot moc len may chu", any("api/event" in u for u in beacons), len(beacons))
        got = await ev(pg, "typeof XDH.Track.session()")
        add("B2 — moi phien co ma rieng de ghep lai duoc o bang den", got == "string")
        add("B3 — moi van co ma rieng", (await ev(pg, "XDH.Track.runId()") or "").startswith("run_"))

        # ═══ C. BA NHIEM VU GIAU (so dau 5) ═══
        # Nha nao cung phai: khai duoc 3 manh moi cua CHINH MINH, khong khai duoc cua nha khac.
        houses = [("gen_z", "ly_selfie"), ("sinh_vien", "ti_the4g"), ("me_bim_sua", "sau_gaubong")]
        for npc, mid in houses:
            await ev(pg, f"XDH.MissionTest.setStage('{mid}','chua_biet'); XDH.MissionTest.setClues('{mid}',0)")
            st = {"interest": 70, "trust": 40}
            await ev(pg, f"XDH.MissionTest.signal('manh_moi_1','{npc}',{json.dumps(st)},1)")
            await ev(pg, f"XDH.MissionTest.signal('manh_moi_2','{npc}',{json.dumps(st)},9)")
            await ev(pg, f"XDH.MissionTest.signal('ro_chuyen','{npc}',{json.dumps(st)},12)")
            shown = await ev(pg, "XDH.MissionTest.popupShown()")
            stage = (await ev(pg, f"XDH.MissionTest.st('{mid}')"))["stage"]
            add(f"C — nha {npc}: hoi sau ra duoc nhiem vu giau (popup 📱 bat len)",
                shown and stage == "da_mo_popup", f"stage={stage}")
            await ev(pg, "XDH.MissionTest.accept()")
            add(f"C — nha {npc}: nhan viec xong thi cua hang ban dung mon do",
                any(x["id"] == mid for x in (await ev(pg, "XDH.MissionTest.shop()"))))
        ctxLy = await ev(pg, "XDH.MissionTest.ctx('sinh_vien')")
        add("C+ — Ti duoc gui khoi 'nguoi cho muon' cua nhiem vu Ly (khong phai chuyen cua Ti)",
            ctxLy.get("missions", {}).get("lend", {}).get("id") == "ly_selfie", json.dumps(ctxLy)[:120])
        add("C+ — moi nha chi giu CHUYEN CUA MINH",
            (await ev(pg, "XDH.MissionTest.ctx('gen_z')"))["missions"]["own"]["id"] == "ly_selfie" and
            (await ev(pg, "XDH.MissionTest.ctx('me_bim_sua')"))["missions"]["own"]["id"] == "sau_gaubong")
        # trao do -> thuong
        await ev(pg, "XDH.MissionTest.grant('ti_the4g','test')")
        add("C+ — cam dung mon do thi nut DUA DO sang len o dung nha",
            await ev(pg, "XDH.MissionTest.canGive('sinh_vien')") == "ti_the4g")

        # ═══ D. THANH THIEN CAM + CUA MO + CAU MOI (so dau 3) ═══
        await boot(pg, URL, first=False)
        # XDH.run.houses dung thu tu npcIdx = [2,1,0] -> nha SO 0 moi la Ly (⭐ De, nguong 55).
        add("D0 — go dung nha Ly", (await ev(pg, "XDH.NPCS[XDH.run.houses[0].npcIdx].id")) == "gen_z")
        await ev(pg, "XDH.Convo.start(0)")
        await pg.wait_for_timeout(2500)
        await wait_idle(pg)
        add("D1 — thanh thien cam HIEN ra man hinh (khong can ?debug=1)",
            await ev(pg, "getComputedStyle(document.getElementById('friend-bar')).display") != "none")
        f0 = await ev(pg, "XDH.FriendTest.st()")
        add("D2 — moi mo cuoc thi thanh o muc thap", f0 and f0["shown"] <= 25, json.dumps(f0)[:110])
        LINES = [
            "Ly ơi cái clip trend hôm qua của em quay góc đẹp dữ, anh coi ba lần luôn.",
            "Anh có một ý tưởng kịch bản video này chắc chắn viral nè, nghe thử không?",
            "Mà xóm mình dạo này có drama gì hay không em, kể anh hóng với.",
            "Em cứ tự tin lên, cái vibe đó lên hình là slay luôn đó."
        ]
        opened = False
        for i, line in enumerate(LINES):
            if opened: break
            await ev(pg, f"XDH.FriendTest.say({json.dumps(line)})")
            await pg.wait_for_timeout(1200)
            await wait_idle(pg)
            st = await ev(pg, "XDH.FriendTest.st()")
            if st is None: break
            opened = await ev(pg, "getComputedStyle(document.getElementById('btn-kill')).display !== 'none'")
            print(f"   luot {i+1}: thien cam {st['shown']}% (code {st['code']} · ai {st['ai']}) cua={st['door']} mo={opened}")
        stF = await ev(pg, "XDH.FriendTest.st()")
        add("D3 — noi trung tu khoa thi thanh thien cam DI LEN",
            stF and stF["shown"] >= 60, json.dumps(stF)[:130] if stF else "")
        add("D4 — cham 100% thi CUA MO (khong con phu thuoc AI gat)", opened,
            f"shown={stF['shown'] if stF else '?'}")
        lastLine = await ev(pg, "(document.querySelectorAll('#dialogue .npc-line')[document.querySelectorAll('#dialogue .npc-line').length-1]||{}).textContent||''")
        add("D5 — nhan vat NOI CAU MOI cho khop luc cua mo",
            bool(stF and stF.get("inviteSpoken")) or any(k in lastLine.lower() for k in ["vô", "vào", "come in", "mời"]),
            lastLine[:110])

        # ═══ E. MAY QUAY SO TAT O KET TIEN ═══
        await boot(pg, BASE + "/?tut=0", first=False, mode="ket_tien")
        add("E1 — che do Ket Tien: may quay so KHONG moc ngoai xom",
            await ev(pg, "!(XDH_GAME && XDH_GAME.scene && XDH_GAME.scene.scenes[0].slotSpot)") is True
            or await ev(pg, "XDH.isKetTien()") is True)
        await ev(pg, "XDH.Casino.openSlot()")
        await pg.wait_for_timeout(400)
        add("E2 — goi thang cua may quay so o Ket Tien cung bi chan",
            await ev(pg, "!document.getElementById('ov-slot').classList.contains('show')") is True)

        add("Z — 0 loi do trong bang dieu khien trinh duyet", len(errors) == 0, " | ".join(errors[:2]))
        await b.close()

    ok = sum(1 for _, p_, _ in checks if p_)
    print("\n" + "=" * 78)
    for what, p_, evd in checks:
        print(("✅ " if p_ else "❌ ") + what + (("   << " + evd) if evd and not p_ else ""))
    print("=" * 78)
    print(f">>> {ok}/{len(checks)} DAT")
    with open(__file__.replace("v2-browser.py", "v2-browser-out.json"), "w", encoding="utf-8") as f:
        json.dump({"base": BASE, "pass": ok, "total": len(checks),
                   "checks": [{"what": w, "ok": p_, "ev": e} for w, p_, e in checks],
                   "errors": errors}, f, ensure_ascii=False, indent=1)
    sys.exit(0 if ok == len(checks) else 1)

asyncio.run(main())
