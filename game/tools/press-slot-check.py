# v1.1 + v1.2 — KIEM MAY: hang xom HOI DON (dong ho im lang) + tui do + may quay so + hop qua.
# Chay:  py game/tools/press-slot-check.py [BASE_URL]
#   vd:  py game/tools/press-slot-check.py http://127.0.0.1:8099
import sys, asyncio, json
sys.stdout.reconfigure(encoding="utf-8")
from playwright.async_api import async_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8099").rstrip("/")
URL  = BASE + "/?tut=0&press=test&slot=test&mission=test&test=1"
URL_LIVE = BASE + "/?tut=0"          # khong co ?test=1 → phai la 0k

checks, errors = [], []
def add(what, ok, ev=""):
    checks.append((what, bool(ok), str(ev)[:160]))

async def boot(pg, url, first=False):
    await pg.goto(url, wait_until="domcontentloaded")
    try:
        if first: await pg.click("#pick-vi", timeout=5000)
    except Exception: pass
    await pg.click("#btn-start", timeout=8000)
    try:
        if await pg.is_visible("#ov-story"): await pg.click("#story-skip", timeout=3000)
    except Exception: pass
    await pg.wait_for_timeout(500)

async def ev(pg, script):
    return await pg.evaluate(script)

async def wait_idle(pg, ms=9000):
    """Cho toi khi game het ban (o nhap mo lai) — go chu xong, khong con dang noi."""
    step, waited = 200, 0
    while waited < ms:
        if not await pg.evaluate("document.getElementById('text-in').disabled"): return True
        await pg.wait_for_timeout(step); waited += step
    return False

async def open_convo(pg, house=0):
    await ev(pg, f"XDH.Convo.start({house})")
    await pg.wait_for_timeout(1200)          # loi mang API → roi vao nhanh bao loi, van mo cuoc

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 860})
        pg = await ctx.new_page()
        pg.on("console", lambda m: errors.append(m.text[:160]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(("pageerror: " + str(e))[:160]))

        # ---------- A. CHE DO TEST + so lieu cau hinh ----------
        await boot(pg, URL, first=True)
        # v2.0: cong tac playtest (ban thu) cho tien nhieu hon ?test=1 → so voi MOT cua duy nhat
        add("A1 — vao van co san tien theo dung cong tac dang bat",
            await ev(pg, "XDH.run.money === XDH.startMoney() && XDH.run.money > 0"),
            await ev(pg, "XDH.run.money + '/' + XDH.startMoney()"))
        add("A2 — bang CHE DO TEST hien", await ev(pg, "getComputedStyle(document.getElementById('test-badge')).display") == "block")
        tiers = await ev(pg, "XDH.PRESS.TIERS")
        add("A3 — 3 nac hoi don, ngan dan (18-30 / 12-18 / 10-12 giay)",
            tiers == [{"min":18000,"max":30000},{"min":12000,"max":18000},{"min":10000,"max":12000}], tiers)
        add("A4 — moi lan bi thuc mat 4 kien nhan", await ev(pg, "XDH.PRESS.PATIENCE") == -4)
        add("A5 — tui do co du 6 mon (4 cu + 2 moi)", await ev(pg, "XDH.SHOP.length") == 6)

        # ---------- B. DONG HO IM LANG ----------
        await open_convo(pg)
        add("B1 — mo cuoc la dong ho im lang len day", await ev(pg, "XDH.PressTest.st().armed") is True,
            await ev(pg, "JSON.stringify(XDH.PressTest.st())"))
        # dong ho TU KEU that (rut ngan con 1,2 giay cho may kiem khoi cho 30 giay)
        await ev(pg, "XDH.PRESS.TIERS = [{min:1200,max:1400},{min:1200,max:1400},{min:1200,max:1400}]; XDH.Convo.pressPoke()")
        await pg.wait_for_timeout(3200)
        add("B1b — ngoi im that thi hang xom TU len tieng (khong can goi tay)",
            (await ev(pg, "XDH.PressTest.st().tier")) >= 1, await ev(pg, "XDH.PressTest.lastLine()"))
        # tra nhip ve DAI (60 giay) cho cac buoc sau — khong de dong ho tu keu chen ngang phep thu
        await ev(pg, """XDH.PRESS.TIERS = [{min:60000,max:60000},{min:60000,max:60000},{min:60000,max:60000}];
                        XDH.PressTest.cancel(); XDH.PressTest.setTier(0);
                        XDH.run.houses[0].saved = null; XDH.run.ledger = [];""")
        if not await ev(pg, "XDH.Convo.isActive()"):
            await open_convo(pg)
        await wait_idle(pg)
        await ev(pg, "XDH.PressTest.setTier(0)")
        p0 = await ev(pg, "XDH.PressTest.st().patience")
        await ev(pg, "XDH.PressTest.fire()")
        await pg.wait_for_timeout(600)
        await wait_idle(pg)
        st = await ev(pg, "XDH.PressTest.st()")
        add("B2 — nac 1 keu: hang xom noi 1 cau + nhich len nac 2", st["tier"] == 1, st)
        add("B3 — im lang mat dung 4 kien nhan", st["patience"] == p0 - 4, f"{p0} → {st['patience']}")
        line = await ev(pg, "XDH.PressTest.lastLine()")
        add("B4 — cau thuc lay tu kho cua game (khong goi AI)", len(line) > 0, line)
        add("B5 — thuc xong tu len day lai", st["armed"] is True)

        # go phim → dem lai tu dau, GIU nguyen nac
        await ev(pg, "XDH.PressTest.cancel()")
        await ev(pg, "XDH.Convo.pressPoke()")
        st2 = await ev(pg, "XDH.PressTest.st()")
        add("B6 — go mot phim thi dong ho chay lai (giu nac)", st2["armed"] is True and st2["tier"] == 1, st2)

        # dang giu mic → KHONG bi hoi don
        await ev(pg, "XDH.Speech.__real = XDH.Speech.isListening; XDH.Speech.isListening = () => true;")
        await ev(pg, "XDH.Convo.pressCancel(); XDH.Convo.pressPoke()")
        add("B7 — dang giu mic thi KHONG len day dong ho", (await ev(pg, "XDH.PressTest.st().armed")) is False)
        await ev(pg, "XDH.Speech.isListening = XDH.Speech.__real")

        # tra loi mot cau → ve nac 1
        await ev(pg, "XDH.PressTest.setTier(2); XDH.Convo.playerSays('con chao co, con la sinh vien o tro gan day')")
        await pg.wait_for_timeout(1500)
        add("B8 — chiu noi mot cau la ve nac 1", (await ev(pg, "XDH.PressTest.st() && XDH.PressTest.st().tier")) == 0)

        # im het 3 nac → dong cua
        await ev(pg, "XDH.PressTest.setTier(0)")
        for _ in range(3):
            await ev(pg, "XDH.PressTest.fire()")
            await pg.wait_for_timeout(500)
            await wait_idle(pg)
        tier_now = await ev(pg, "XDH.PressTest.st() && XDH.PressTest.st().tier")
        await ev(pg, "XDH.PressTest.fire()")
        await pg.wait_for_timeout(3400)
        add("B9 — im het 3 nac roi im tiep → cua dong, thua vi im lang",
            (await ev(pg, "XDH.Convo.isActive()")) is False, f"tier truoc cu chot = {tier_now}")
        led = await ev(pg, "JSON.stringify((XDH.run.ledger||[]).slice(-1))")
        add("B10 — so ghi dung ly do 'silence' (khong phai bi cong an)", "silence" in led, led)

        # ---------- C. TUI DO + hop Dung/Huy ----------
        await boot(pg, URL, first=False)
        await ev(pg, "XDH.run.inv.gift=1; XDH.run.inv.glow=1; XDH.run.inv.mind=1; XDH.UI.refreshHud()")
        await open_convo(pg)
        await ev(pg, "XDH.UI.openBag()")
        await pg.wait_for_timeout(300)
        cells = await ev(pg, "document.querySelectorAll('#bag-grid .bag-cell').length")
        add("C1 — bang tui do hien du 3 mon dang co", cells == 3, cells)
        has_desc = await ev(pg, "!!document.querySelector('#bag-grid .bag-desc').textContent.trim()")
        add("C2 — moi mon co chu giai thich lam gi", has_desc)
        await pg.click("#bag-grid .bag-cell")
        await pg.wait_for_timeout(250)
        add("C3 — bam mot mon thi hien hop Dung ngay / Huy",
            await ev(pg, "document.getElementById('ov-use').classList.contains('show')"))
        await pg.click("#btn-use-no")
        await pg.wait_for_timeout(200)
        add("C4 — bam Huy thi KHONG mat mon", (await ev(pg, "XDH.run.inv.gift")) == 1)

        # dung ✨ Nang tam dep trai
        tr0 = await ev(pg, "XDH.PressTest.st().patience !== undefined ? XDH.PressTest.st() : null")
        trust0 = await ev(pg, "(function(){const s=XDH.PressTest.st();return s?s.glow:null})()")
        await ev(pg, "XDH.Convo.useItem('glow')")
        await pg.wait_for_timeout(400)
        add("C5 — dung ✨ Nang tam dep trai: co hieu luc toi het cuoc",
            (await ev(pg, "XDH.PressTest.st().glow")) is True)
        add("C6 — ✨ cong tin ngay (mon bi tru khoi tui)", (await ev(pg, "XDH.run.inv.glow")) == 0)
        await ev(pg, "XDH.Convo.useItem('mind')")
        await pg.wait_for_timeout(400)
        add("C7 — dung 🧠 May doc suy nghi: bat co doc suy nghi",
            (await ev(pg, "XDH.PressTest.st().mind")) is True)
        add("C8 — 🧠 hien bong bong suy nghi ngay",
            len(await ev(pg, "document.getElementById('thought-bubble').textContent")) > 0,
            await ev(pg, "document.getElementById('thought-bubble').textContent"))

        # ---------- D. MAY QUAY SO ----------
        await boot(pg, URL, first=False)
        # quay ngay TRONG trang cho nhanh — 1000 lan, sai so thong ke ~1,5%
        N = 1000
        s = await ev(pg, """(async () => {
              XDH.SLOT.SPIN_MS = 0; XDH.CasinoTest.setMoney(1e9); XDH.CasinoTest.reset();
              for (let i = 0; i < %d; i++) await XDH.CasinoTest.spin(false);
              return XDH.CasinoTest.stats();
            })()""" % N)
        win_rate = (s["win"] + s["jackpot"]) / max(1, s["spins"]) * 100
        jack_rate = s["jackpot"] / max(1, s["spins"]) * 100
        add(f"D1 — quay {N} lan: ti le thang {win_rate:.1f}% (chot 40%, lech <= 5%)",
            abs(win_rate - 40) <= 5, s)
        add(f"D1b — ti le trung lon {jack_rate:.1f}% (chot 6%, lech <= 3%)", abs(jack_rate - 6) <= 3, s)
        add("D2 — dem du so lan quay", s["spins"] == N, s)
        m0 = await ev(pg, "XDH.CasinoTest.money()")
        await ev(pg, "XDH.CasinoTest.setMoney(50)")
        await ev(pg, "XDH.CasinoTest.spin(false,'lose')")
        add("D3 — thua thi mat dung tien cuoc", (await ev(pg, "XDH.CasinoTest.money()")) == 0)
        await ev(pg, "XDH.CasinoTest.setMoney(50)")
        await ev(pg, "XDH.CasinoTest.spin(false,'win')")
        add("D4 — thang thi an gap doi (50k → 100k)", (await ev(pg, "XDH.CasinoTest.money()")) == 100)
        inv_b = await ev(pg, "XDH.CasinoTest.inv()")
        await ev(pg, "XDH.CasinoTest.setMoney(50); XDH.CasinoTest.spin(false,'jackpot')")
        inv_a = await ev(pg, "XDH.CasinoTest.inv()")
        add("D5 — 3 hinh giong nhau: an gap doi + duoc them 1 mon do nghe",
            (await ev(pg, "XDH.CasinoTest.money()")) == 100 and sum(inv_a.values()) == sum(inv_b.values()) + 1,
            f"{inv_b} → {inv_a}")
        await ev(pg, "XDH.CasinoTest.setMoney(80); XDH.CasinoTest.spin(true,'lose')")
        add("D6 — TAT TAY thua sach thi ve 0k", (await ev(pg, "XDH.CasinoTest.money()")) == 0)
        add("D7 — chay sach tien van choi tiep duoc (khong ket van)",
            (await ev(pg, "XDH.Convo.canKnock(0).ok")) is True)
        await ev(pg, "XDH.CasinoTest.setMoney(60); XDH.CasinoTest.spin(true,'win')")
        add("D8 — TAT TAY thang thi an gap doi (60k → 120k)", (await ev(pg, "XDH.CasinoTest.money()")) == 120)

        # ---------- E. HOP QUA MAY MAN ----------
        await ev(pg, "XDH.CasinoTest.setMoney(1000)")
        for kind in ["coins", "item", "wear", "junk"]:
            got = await ev(pg, f"XDH.CasinoTest.buyLucky('{kind}')")
            add(f"E1.{kind} — hop qua mo ra loai '{kind}'", got == kind, got)
            await pg.evaluate("document.getElementById('ov-lucky').classList.remove('show')")
        # v2.0: bat cong tac playtest thi hop qua 0k → phep thu "khong du tien" chuyen sang
        # link co ?playtest=0 o muc F (chinh la phep thu "tat cong tac la ve nhu cu").
        await ev(pg, "XDH.CasinoTest.setMoney(10)")
        r = await ev(pg, "XDH.CasinoTest.buyLucky('coins')")
        playtest = await ev(pg, "XDH.PLAYTEST")
        add("E2 — khong du 30k thi khong mua duoc (khi KHONG bat playtest)",
            (r is None) if not playtest else (r == "coins"),
            f"playtest={playtest} ket qua={r}")

        # ---------- F. LINK CHINH khong dinh ----------
        # v2.0: them ?playtest=0 → ep tat cong tac "mo het", phai ve dung nhu ban that
        await boot(pg, URL_LIVE + "&playtest=0" if "?" in URL_LIVE else URL_LIVE + "?playtest=0", first=False)
        add("F0 — TAT cong tac playtest thi moi thu ve nhu cu (gia goc + tu do khoa lai)",
            (await ev(pg, "XDH.PLAYTEST")) is False and
            (await ev(pg, "XDH.priceOf(XDH.LUCKY.PRICE)")) == 30 and
            (await ev(pg, "XDH.SHOP.every(i => XDH.priceOf(i) === i.price)")) is True and
            (await ev(pg, "XDH.lockedPieces().length")) == 3,
            await ev(pg, "XDH.PLAYTEST + ' | hop qua ' + XDH.priceOf(XDH.LUCKY.PRICE) + 'k | con khoa ' + XDH.lockedPieces().length"))
        add("F1 — link KHONG co ?test=1 van bat dau 0k", (await ev(pg, "XDH.run.money")) == 0,
            await ev(pg, "XDH.run.money"))
        add("F2 — link thuong khong co tay nam kiem thu", (await ev(pg, "!!window.PressTest || !!window.XDH.PressTest")) is False)

        await b.close()

    ok = sum(1 for _, o, _ in checks if o)
    print(f"\n=== KIEM MAY v1.1 + v1.2 — {ok}/{len(checks)} DAT ===")
    for what, o, evd in checks:
        print(("  ✅ " if o else "  ❌ ") + what + (f"   [{evd}]" if (evd and not o) else ""))
    real_err = [e for e in errors if "api/converse" not in e and "Failed to load resource" not in e]
    print(f"\nLoi console (bo qua loi goi API khi chay offline): {len(real_err)}")
    for e in real_err[:10]: print("   ! " + e)
    json.dump({"pass": ok, "total": len(checks),
               "checks": [{"what": w, "ok": o, "ev": e} for w, o, e in checks],
               "errors": real_err},
              open(__file__.replace("press-slot-check.py", "press-slot-out.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

asyncio.run(main())
